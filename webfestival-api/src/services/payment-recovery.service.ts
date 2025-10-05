import { PrismaClient } from '@prisma/client';
import { stripeService } from './stripe.service';
import { subscriptionService } from './subscription.service';

const prisma = new PrismaClient();

export class PaymentRecoveryService {
    // ============================================================================
    // MANEJO DE FALLOS DE PAGO
    // ============================================================================

    /**
     * Maneja fallos de pago y actualiza el estado de la suscripción
     */
    async handlePaymentFailure(subscriptionId: string, _invoiceId: string, attemptCount: number = 1): Promise<void> {
        try {
            console.log(`🚨 Manejando fallo de pago para suscripción ${subscriptionId}, intento ${attemptCount}`);

            // Buscar la suscripción en nuestra base de datos
            const userSubscription = await prisma.userSubscription.findFirst({
                where: { stripe_subscription_id: subscriptionId },
                include: { plan: true }
            });

            if (!userSubscription) {
                console.error(`Suscripción no encontrada: ${subscriptionId}`);
                return;
            }

            // Actualizar estado según el número de intentos
            let newStatus: 'past_due' | 'unpaid' | 'canceled' = 'past_due';

            if (attemptCount >= 3) {
                newStatus = 'unpaid';
            } else if (attemptCount >= 5) {
                newStatus = 'canceled';
            }

            // Actualizar suscripción
            await subscriptionService.updateUserSubscription(userSubscription.id, {
                status: newStatus
            });

            // Enviar notificación al usuario
            await this.sendPaymentFailureNotification(userSubscription, attemptCount, newStatus);

            // Programar reintento si es apropiado
            if (attemptCount < 3) {
                await this.schedulePaymentRetry(subscriptionId, attemptCount + 1);
            }

            console.log(`✅ Fallo de pago manejado para suscripción ${subscriptionId}, nuevo estado: ${newStatus}`);
        } catch (error) {
            console.error('Error al manejar fallo de pago:', error);
            throw error;
        }
    }

    /**
     * Programa un reintento de pago
     */
    private async schedulePaymentRetry(subscriptionId: string, attemptCount: number): Promise<void> {
        try {
            // Calcular delay: 1 día, 3 días, 7 días
            const delays = [24 * 60 * 60 * 1000, 3 * 24 * 60 * 60 * 1000, 7 * 24 * 60 * 60 * 1000];
            const delay = delays[attemptCount - 2] || delays[delays.length - 1] || 24 * 60 * 60 * 1000;

            console.log(`⏰ Programando reintento de pago para suscripción ${subscriptionId} en ${delay / (60 * 60 * 1000)} horas`);

            // En un entorno de producción, esto se haría con un job queue como Bull o Agenda
            setTimeout(async () => {
                try {
                    await this.retryPayment(subscriptionId, attemptCount);
                } catch (error) {
                    console.error(`Error en reintento de pago para suscripción ${subscriptionId}:`, error);
                }
            }, delay);
        } catch (error) {
            console.error('Error al programar reintento de pago:', error);
        }
    }

    /**
     * Reintenta un pago fallido
     */
    private async retryPayment(subscriptionId: string, attemptCount: number): Promise<void> {
        try {
            console.log(`🔄 Reintentando pago para suscripción ${subscriptionId}, intento ${attemptCount}`);

            // Obtener la suscripción de Stripe
            const stripeSubscription = await stripeService['stripe'].subscriptions.retrieve(subscriptionId);

            if (!stripeSubscription.latest_invoice) {
                console.error(`No se encontró factura para la suscripción ${subscriptionId}`);
                return;
            }

            // Intentar cobrar la factura pendiente
            const invoice = await stripeService['stripe'].invoices.pay(stripeSubscription.latest_invoice as string);

            if (invoice.status === 'paid') {
                console.log(`✅ Pago exitoso en reintento para suscripción ${subscriptionId}`);

                // Actualizar estado de la suscripción
                const userSubscription = await prisma.userSubscription.findFirst({
                    where: { stripe_subscription_id: subscriptionId }
                });

                if (userSubscription) {
                    await subscriptionService.updateUserSubscription(userSubscription.id, {
                        status: 'active'
                    });

                    await this.sendPaymentSuccessNotification(userSubscription);
                }
            } else {
                console.log(`❌ Fallo en reintento de pago para suscripción ${subscriptionId}`);
                await this.handlePaymentFailure(subscriptionId, invoice.id || 'unknown_invoice', attemptCount);
            }
        } catch (error) {
            console.error(`Error en reintento de pago para suscripción ${subscriptionId}:`, error);
            await this.handlePaymentFailure(subscriptionId, '', attemptCount);
        }
    }

    // ============================================================================
    // RENOVACIONES AUTOMÁTICAS
    // ============================================================================

    /**
     * Procesa renovaciones automáticas próximas a vencer
     */
    async processUpcomingRenewals(): Promise<void> {
        try {
            console.log('🔄 Procesando renovaciones automáticas...');

            // Buscar suscripciones que vencen en los próximos 3 días
            const threeDaysFromNow = new Date();
            threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

            const upcomingRenewals = await prisma.userSubscription.findMany({
                where: {
                    status: 'active',
                    current_period_end: {
                        lte: threeDaysFromNow,
                        gte: new Date()
                    }
                },
                include: { plan: true }
            });

            console.log(`📊 Encontradas ${upcomingRenewals.length} suscripciones próximas a renovar`);

            for (const subscription of upcomingRenewals) {
                await this.processRenewal(subscription);
            }

            console.log('✅ Renovaciones automáticas procesadas');
        } catch (error) {
            console.error('Error al procesar renovaciones automáticas:', error);
            throw error;
        }
    }

    /**
     * Procesa la renovación de una suscripción específica
     */
    private async processRenewal(subscription: any): Promise<void> {
        try {
            if (!subscription.stripe_subscription_id) {
                console.log(`⚠️ Suscripción ${subscription.id} no tiene ID de Stripe, omitiendo renovación`);
                return;
            }

            console.log(`🔄 Procesando renovación para suscripción ${subscription.id}`);

            // Obtener información actualizada de Stripe
            const stripeSubscription = await stripeService['stripe'].subscriptions.retrieve(subscription.stripe_subscription_id);

            // Verificar si la suscripción está configurada para cancelarse al final del período
            if (stripeSubscription.cancel_at_period_end) {
                console.log(`⏹️ Suscripción ${subscription.id} está marcada para cancelación, no se renovará`);

                await subscriptionService.updateUserSubscription(subscription.id, {
                    status: 'canceled'
                });

                await this.sendCancellationNotification(subscription);
                return;
            }

            // Verificar que el método de pago esté activo
            const paymentMethod = stripeSubscription.default_payment_method;
            if (!paymentMethod) {
                console.log(`⚠️ Suscripción ${subscription.id} no tiene método de pago, enviando notificación`);
                await this.sendPaymentMethodRequiredNotification(subscription);
                return;
            }

            // Actualizar fechas de período en nuestra base de datos
            await subscriptionService.updateUserSubscription(subscription.id, {
                current_period_start: new Date((stripeSubscription as any).current_period_start * 1000),
                current_period_end: new Date((stripeSubscription as any).current_period_end * 1000)
            });

            // Enviar notificación de renovación exitosa
            await this.sendRenewalSuccessNotification(subscription);

            console.log(`✅ Renovación procesada exitosamente para suscripción ${subscription.id}`);
        } catch (error) {
            console.error(`Error al procesar renovación para suscripción ${subscription.id}:`, error);
            await this.sendRenewalFailureNotification(subscription, error);
        }
    }

    // ============================================================================
    // CANCELACIONES
    // ============================================================================

    /**
     * Procesa cancelaciones programadas
     */
    async processScheduledCancellations(): Promise<void> {
        try {
            console.log('🛑 Procesando cancelaciones programadas...');

            // Buscar suscripciones marcadas para cancelación que ya vencieron
            const now = new Date();
            const scheduledCancellations = await prisma.userSubscription.findMany({
                where: {
                    status: 'active',
                    cancel_at_period_end: true,
                    current_period_end: {
                        lte: now
                    }
                },
                include: { plan: true }
            });

            console.log(`📊 Encontradas ${scheduledCancellations.length} cancelaciones programadas`);

            for (const subscription of scheduledCancellations) {
                await this.processCancellation(subscription);
            }

            console.log('✅ Cancelaciones programadas procesadas');
        } catch (error) {
            console.error('Error al procesar cancelaciones programadas:', error);
            throw error;
        }
    }

    /**
     * Procesa la cancelación de una suscripción específica
     */
    private async processCancellation(subscription: any): Promise<void> {
        try {
            console.log(`🛑 Procesando cancelación para suscripción ${subscription.id}`);

            // Actualizar estado en nuestra base de datos
            await subscriptionService.updateUserSubscription(subscription.id, {
                status: 'canceled'
            });

            // Enviar notificación de cancelación
            await this.sendCancellationNotification(subscription);

            console.log(`✅ Cancelación procesada exitosamente para suscripción ${subscription.id}`);
        } catch (error) {
            console.error(`Error al procesar cancelación para suscripción ${subscription.id}:`, error);
        }
    }

    // ============================================================================
    // NOTIFICACIONES
    // ============================================================================

    /**
     * Envía notificación de fallo de pago
     */
    private async sendPaymentFailureNotification(subscription: any, attemptCount: number, _status: string): Promise<void> {
        try {
            console.log(`📧 Enviando notificación de fallo de pago para suscripción ${subscription.id}`);

            // Crear notificación en la base de datos
            await prisma.notificacion.create({
                data: {
                    usuario_id: subscription.user_id,
                    tipo: 'payment_failure',
                    titulo: 'Problema con tu pago',
                    mensaje: `Hemos tenido problemas para procesar el pago de tu suscripción ${subscription.plan?.name}. Intento ${attemptCount} de 3. Por favor, verifica tu método de pago.`,
                    leida: false
                }
            });

            // Aquí se integraría con el servicio de email para enviar notificación por correo
            console.log(`✅ Notificación de fallo de pago enviada para suscripción ${subscription.id}`);
        } catch (error) {
            console.error('Error al enviar notificación de fallo de pago:', error);
        }
    }

    /**
     * Envía notificación de pago exitoso después de reintento
     */
    private async sendPaymentSuccessNotification(subscription: any): Promise<void> {
        try {
            console.log(`📧 Enviando notificación de pago exitoso para suscripción ${subscription.id}`);

            await prisma.notificacion.create({
                data: {
                    usuario_id: subscription.user_id,
                    tipo: 'payment_success',
                    titulo: 'Pago procesado exitosamente',
                    mensaje: 'Tu pago ha sido procesado exitosamente y tu suscripción está activa nuevamente.',
                    leida: false
                }
            });

            console.log(`✅ Notificación de pago exitoso enviada para suscripción ${subscription.id}`);
        } catch (error) {
            console.error('Error al enviar notificación de pago exitoso:', error);
        }
    }

    /**
     * Envía notificación de renovación exitosa
     */
    private async sendRenewalSuccessNotification(subscription: any): Promise<void> {
        try {
            console.log(`📧 Enviando notificación de renovación exitosa para suscripción ${subscription.id}`);

            await prisma.notificacion.create({
                data: {
                    usuario_id: subscription.user_id,
                    tipo: 'renewal_success',
                    titulo: 'Suscripción renovada',
                    mensaje: `Tu suscripción ${subscription.plan?.name} ha sido renovada exitosamente.`,
                    leida: false
                }
            });

            console.log(`✅ Notificación de renovación exitosa enviada para suscripción ${subscription.id}`);
        } catch (error) {
            console.error('Error al enviar notificación de renovación exitosa:', error);
        }
    }

    /**
     * Envía notificación de fallo en renovación
     */
    private async sendRenewalFailureNotification(subscription: any, _error: any): Promise<void> {
        try {
            console.log(`📧 Enviando notificación de fallo en renovación para suscripción ${subscription.id}`);

            await prisma.notificacion.create({
                data: {
                    usuario_id: subscription.user_id,
                    tipo: 'renewal_failure',
                    titulo: 'Problema con la renovación',
                    mensaje: 'Hemos tenido problemas para renovar tu suscripción. Por favor, verifica tu método de pago o contacta con soporte.',
                    leida: false
                }
            });

            console.log(`✅ Notificación de fallo en renovación enviada para suscripción ${subscription.id}`);
        } catch (notificationError) {
            console.error('Error al enviar notificación de fallo en renovación:', notificationError);
        }
    }

    /**
     * Envía notificación de cancelación
     */
    private async sendCancellationNotification(subscription: any): Promise<void> {
        try {
            console.log(`📧 Enviando notificación de cancelación para suscripción ${subscription.id}`);

            await prisma.notificacion.create({
                data: {
                    usuario_id: subscription.user_id,
                    tipo: 'subscription_canceled',
                    titulo: 'Suscripción cancelada',
                    mensaje: `Tu suscripción ${subscription.plan?.name} ha sido cancelada. Puedes reactivarla en cualquier momento desde tu panel de usuario.`,
                    leida: false
                }
            });

            console.log(`✅ Notificación de cancelación enviada para suscripción ${subscription.id}`);
        } catch (error) {
            console.error('Error al enviar notificación de cancelación:', error);
        }
    }

    /**
     * Envía notificación de método de pago requerido
     */
    private async sendPaymentMethodRequiredNotification(subscription: any): Promise<void> {
        try {
            console.log(`📧 Enviando notificación de método de pago requerido para suscripción ${subscription.id}`);

            await prisma.notificacion.create({
                data: {
                    usuario_id: subscription.user_id,
                    tipo: 'payment_method_required',
                    titulo: 'Método de pago requerido',
                    mensaje: 'Tu suscripción necesita un método de pago válido para renovarse. Por favor, actualiza tu información de pago.',
                    leida: false
                }
            });

            console.log(`✅ Notificación de método de pago requerido enviada para suscripción ${subscription.id}`);
        } catch (error) {
            console.error('Error al enviar notificación de método de pago requerido:', error);
        }
    }

    // ============================================================================
    // UTILIDADES
    // ============================================================================

    /**
     * Obtiene estadísticas de recuperación de pagos
     */
    async getRecoveryStats(): Promise<{
        totalFailures: number;
        successfulRetries: number;
        failedRetries: number;
        canceledDueToPayment: number;
    }> {
        try {
            // En un entorno real, estas estadísticas se almacenarían en tablas específicas
            // Por ahora, devolvemos estadísticas simuladas basadas en notificaciones

            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const [totalFailures, successfulRetries, canceledDueToPayment] = await Promise.all([
                prisma.notificacion.count({
                    where: {
                        tipo: 'payment_failure',
                        fecha_creacion: { gte: thirtyDaysAgo }
                    }
                }),
                prisma.notificacion.count({
                    where: {
                        tipo: 'payment_success',
                        fecha_creacion: { gte: thirtyDaysAgo }
                    }
                }),
                prisma.userSubscription.count({
                    where: {
                        status: 'canceled',
                        updated_at: { gte: thirtyDaysAgo }
                    }
                })
            ]);

            return {
                totalFailures,
                successfulRetries,
                failedRetries: totalFailures - successfulRetries,
                canceledDueToPayment
            };
        } catch (error) {
            console.error('Error al obtener estadísticas de recuperación:', error);
            throw error;
        }
    }

    /**
     * Ejecuta tareas de mantenimiento programadas
     */
    async runMaintenanceTasks(): Promise<void> {
        try {
            console.log('🔧 Ejecutando tareas de mantenimiento de pagos...');

            await Promise.all([
                this.processUpcomingRenewals(),
                this.processScheduledCancellations()
            ]);

            console.log('✅ Tareas de mantenimiento de pagos completadas');
        } catch (error) {
            console.error('Error en tareas de mantenimiento de pagos:', error);
            throw error;
        }
    }
}

export const paymentRecoveryService = new PaymentRecoveryService();