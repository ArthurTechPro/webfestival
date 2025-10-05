import { PrismaClient } from '@prisma/client';
import { stripeService } from './stripe.service';
import { subscriptionService } from './subscription.service';

const prisma = new PrismaClient();

export class PaymentFailureHandlerService {
    // ============================================================================
    // ESTRATEGIAS DE RECUPERACIÓN DE PAGOS
    // ============================================================================

    /**
     * Maneja fallos de pago con estrategias inteligentes de recuperación
     */
    async handleIntelligentPaymentFailure(
        subscriptionId: string,
        invoiceId: string,
        failureReason: string,
        attemptCount: number = 1
    ): Promise<void> {
        try {
            console.log(`🚨 Manejando fallo de pago inteligente para suscripción ${subscriptionId}`);
            console.log(`📋 Razón del fallo: ${failureReason}, Intento: ${attemptCount}`);

            // Buscar la suscripción en nuestra base de datos
            const userSubscription = await prisma.userSubscription.findFirst({
                where: { stripe_subscription_id: subscriptionId },
                include: { plan: true }
            });

            if (!userSubscription) {
                console.error(`Suscripción no encontrada: ${subscriptionId}`);
                return;
            }

            // Determinar estrategia basada en la razón del fallo
            const strategy = this.determineRecoveryStrategy(failureReason, attemptCount);

            // Aplicar estrategia de recuperación
            await this.applyRecoveryStrategy(userSubscription, strategy, attemptCount);

            // Registrar el fallo para analytics
            await this.recordPaymentFailure(subscriptionId, invoiceId, failureReason, attemptCount, strategy);

            console.log(`✅ Estrategia de recuperación aplicada: ${strategy}`);
        } catch (error) {
            console.error('Error al manejar fallo de pago inteligente:', error);
            throw error;
        }
    }

    /**
     * Determina la estrategia de recuperación basada en la razón del fallo
     */
    private determineRecoveryStrategy(failureReason: string, attemptCount: number): RecoveryStrategy {
        // Estrategias basadas en el tipo de error
        if (failureReason.includes('insufficient_funds')) {
            return attemptCount <= 2 ? 'retry_delayed' : 'request_payment_update';
        }

        if (failureReason.includes('card_declined')) {
            return 'request_payment_update';
        }

        if (failureReason.includes('expired_card')) {
            return 'request_payment_update';
        }

        if (failureReason.includes('authentication_required')) {
            return 'request_authentication';
        }

        // Estrategia por defecto basada en número de intentos
        if (attemptCount <= 1) {
            return 'retry_immediate';
        } else if (attemptCount <= 3) {
            return 'retry_delayed';
        } else if (attemptCount <= 5) {
            return 'request_payment_update';
        } else {
            return 'suspend_subscription';
        }
    }

    /**
     * Aplica la estrategia de recuperación determinada
     */
    private async applyRecoveryStrategy(
        subscription: any,
        strategy: RecoveryStrategy,
        attemptCount: number
    ): Promise<void> {
        switch (strategy) {
            case 'retry_immediate':
                await this.scheduleImmediateRetry(subscription, attemptCount);
                break;

            case 'retry_delayed':
                await this.scheduleDelayedRetry(subscription, attemptCount);
                break;

            case 'request_payment_update':
                await this.requestPaymentMethodUpdate(subscription);
                break;

            case 'request_authentication':
                await this.requestPaymentAuthentication(subscription);
                break;

            case 'suspend_subscription':
                await this.suspendSubscription(subscription);
                break;

            case 'offer_discount':
                await this.offerRecoveryDiscount(subscription);
                break;

            default:
                console.warn(`Estrategia de recuperación no reconocida: ${strategy}`);
        }
    }

    /**
     * Programa un reintento inmediato (en 1 hora)
     */
    private async scheduleImmediateRetry(subscription: any, attemptCount: number): Promise<void> {
        console.log(`⏰ Programando reintento inmediato para suscripción ${subscription.id}`);

        // Actualizar estado a past_due
        await subscriptionService.updateUserSubscription(subscription.id, {
            status: 'past_due'
        });

        // Enviar notificación de reintento
        await this.sendRetryNotification(subscription, 'immediate', attemptCount);

        // En producción, esto se haría con un job queue
        setTimeout(async () => {
            try {
                await this.retryPayment(subscription.stripe_subscription_id, attemptCount + 1);
            } catch (error) {
                console.error(`Error en reintento inmediato para suscripción ${subscription.id}:`, error);
            }
        }, 60 * 60 * 1000); // 1 hora
    }

    /**
     * Programa un reintento con delay (24h, 72h, 7d)
     */
    private async scheduleDelayedRetry(subscription: any, attemptCount: number): Promise<void> {
        const delays = [24, 72, 168]; // horas: 1 día, 3 días, 7 días
        const delayHours = delays[Math.min(attemptCount - 1, delays.length - 1)];

        console.log(`⏰ Programando reintento con delay de ${delayHours}h para suscripción ${subscription.id}`);

        // Actualizar estado
        await subscriptionService.updateUserSubscription(subscription.id, {
            status: 'past_due'
        });

        // Enviar notificación
        await this.sendRetryNotification(subscription, 'delayed', attemptCount, delayHours);

        // Programar reintento
        setTimeout(async () => {
            try {
                await this.retryPayment(subscription.stripe_subscription_id, attemptCount + 1);
            } catch (error) {
                console.error(`Error en reintento con delay para suscripción ${subscription.id}:`, error);
            }
        }, (delayHours || 24) * 60 * 60 * 1000);
    }

    /**
     * Solicita actualización del método de pago
     */
    private async requestPaymentMethodUpdate(subscription: any): Promise<void> {
        console.log(`💳 Solicitando actualización de método de pago para suscripción ${subscription.id}`);

        // Actualizar estado
        await subscriptionService.updateUserSubscription(subscription.id, {
            status: 'past_due'
        });

        // Crear notificación urgente
        await prisma.notificacion.create({
            data: {
                usuario_id: subscription.user_id,
                tipo: 'payment_method_update_required',
                titulo: 'Actualización de método de pago requerida',
                mensaje: `Tu método de pago necesita ser actualizado para continuar con tu suscripción ${subscription.plan?.name}. Por favor, actualiza tu información de pago lo antes posible para evitar la suspensión del servicio.`,
                leida: false
            }
        });

        // Enviar email urgente (aquí se integraría con el servicio de email)
        console.log(`📧 Email de actualización de método de pago enviado para suscripción ${subscription.id}`);
    }

    /**
     * Solicita autenticación adicional del pago
     */
    private async requestPaymentAuthentication(subscription: any): Promise<void> {
        console.log(`🔐 Solicitando autenticación de pago para suscripción ${subscription.id}`);

        await prisma.notificacion.create({
            data: {
                usuario_id: subscription.user_id,
                tipo: 'payment_authentication_required',
                titulo: 'Autenticación de pago requerida',
                mensaje: `Tu banco requiere autenticación adicional para procesar el pago de tu suscripción ${subscription.plan?.name}. Por favor, completa la autenticación en tu método de pago.`,
                leida: false
            }
        });
    }

    /**
     * Suspende la suscripción después de múltiples fallos
     */
    private async suspendSubscription(subscription: any): Promise<void> {
        console.log(`⏸️ Suspendiendo suscripción ${subscription.id} por múltiples fallos de pago`);

        // Actualizar estado a unpaid
        await subscriptionService.updateUserSubscription(subscription.id, {
            status: 'unpaid'
        });

        // Crear notificación de suspensión
        await prisma.notificacion.create({
            data: {
                usuario_id: subscription.user_id,
                tipo: 'subscription_suspended',
                titulo: 'Suscripción suspendida',
                mensaje: `Tu suscripción ${subscription.plan?.name} ha sido suspendida debido a problemas de pago. Puedes reactivarla actualizando tu método de pago y contactando con soporte.`,
                leida: false
            }
        });

        // Programar cancelación definitiva en 30 días
        setTimeout(async () => {
            try {
                await this.cancelSubscriptionDefinitively(subscription.id);
            } catch (error) {
                console.error(`Error al cancelar definitivamente suscripción ${subscription.id}:`, error);
            }
        }, 30 * 24 * 60 * 60 * 1000); // 30 días
    }

    /**
     * Ofrece un descuento de recuperación
     */
    private async offerRecoveryDiscount(subscription: any): Promise<void> {
        console.log(`💰 Ofreciendo descuento de recuperación para suscripción ${subscription.id}`);

        // Crear cupón de descuento en Stripe
        const coupon = await stripeService['stripe'].coupons.create({
            percent_off: 25,
            duration: 'once',
            max_redemptions: 1,
            metadata: {
                type: 'payment_recovery',
                subscription_id: subscription.id,
                user_id: subscription.user_id
            }
        });

        // Notificar al usuario sobre el descuento
        await prisma.notificacion.create({
            data: {
                usuario_id: subscription.user_id,
                tipo: 'recovery_discount_offer',
                titulo: '¡Oferta especial de recuperación!',
                mensaje: `Hemos notado problemas con tu pago. Como gesto de buena voluntad, te ofrecemos un 25% de descuento en tu próximo pago. Usa el código: ${coupon.id}`,
                leida: false
            }
        });
    }

    /**
     * Reintenta un pago específico
     */
    private async retryPayment(subscriptionId: string, attemptCount: number): Promise<void> {
        try {
            console.log(`🔄 Reintentando pago para suscripción ${subscriptionId}, intento ${attemptCount}`);

            // Obtener la factura pendiente más reciente
            const subscription = await stripeService['stripe'].subscriptions.retrieve(subscriptionId);

            if (subscription.latest_invoice) {
                const invoice = await stripeService['stripe'].invoices.pay(subscription.latest_invoice as string);

                if (invoice.status === 'paid') {
                    console.log(`✅ Pago exitoso en reintento para suscripción ${subscriptionId}`);
                    await this.handleSuccessfulRetry(subscriptionId);
                } else {
                    console.log(`❌ Fallo en reintento de pago para suscripción ${subscriptionId}`);
                    await this.handleIntelligentPaymentFailure(
                        subscriptionId,
                        invoice.id || 'unknown_invoice',
                        'retry_failed',
                        attemptCount
                    );
                }
            }
        } catch (error) {
            console.error(`Error en reintento de pago para suscripción ${subscriptionId}:`, error);
        }
    }

    /**
     * Maneja un reintento exitoso
     */
    private async handleSuccessfulRetry(subscriptionId: string): Promise<void> {
        const userSubscription = await prisma.userSubscription.findFirst({
            where: { stripe_subscription_id: subscriptionId }
        });

        if (userSubscription) {
            // Reactivar suscripción
            await subscriptionService.updateUserSubscription(userSubscription.id, {
                status: 'active'
            });

            // Notificar éxito
            await prisma.notificacion.create({
                data: {
                    usuario_id: userSubscription.user_id,
                    tipo: 'payment_retry_success',
                    titulo: 'Pago procesado exitosamente',
                    mensaje: 'Tu pago ha sido procesado exitosamente y tu suscripción está activa nuevamente. ¡Gracias por tu paciencia!',
                    leida: false
                }
            });
        }
    }

    /**
     * Cancela definitivamente una suscripción
     */
    private async cancelSubscriptionDefinitively(subscriptionId: string): Promise<void> {
        console.log(`🛑 Cancelando definitivamente suscripción ${subscriptionId}`);

        await subscriptionService.updateUserSubscription(subscriptionId, {
            status: 'canceled'
        });

        const subscription = await prisma.userSubscription.findUnique({
            where: { id: subscriptionId }
        });

        if (subscription) {
            await prisma.notificacion.create({
                data: {
                    usuario_id: subscription.user_id,
                    tipo: 'subscription_canceled_definitively',
                    titulo: 'Suscripción cancelada',
                    mensaje: 'Tu suscripción ha sido cancelada definitivamente debido a problemas de pago no resueltos. Puedes crear una nueva suscripción en cualquier momento.',
                    leida: false
                }
            });
        }
    }

    /**
     * Envía notificación de reintento
     */
    private async sendRetryNotification(
        subscription: any,
        type: 'immediate' | 'delayed',
        attemptCount: number,
        delayHours?: number
    ): Promise<void> {
        const message = type === 'immediate'
            ? `Reintentaremos procesar tu pago en 1 hora. Intento ${attemptCount} de 5.`
            : `Reintentaremos procesar tu pago en ${delayHours || 24} horas. Intento ${attemptCount} de 5.`;

        await prisma.notificacion.create({
            data: {
                usuario_id: subscription.user_id,
                tipo: 'payment_retry_scheduled',
                titulo: 'Reintento de pago programado',
                mensaje: `Hemos programado un reintento para tu suscripción ${subscription.plan?.name}. ${message}`,
                leida: false
            }
        });
    }

    /**
     * Registra el fallo de pago para analytics
     */
    private async recordPaymentFailure(
        subscriptionId: string,
        invoiceId: string,
        failureReason: string,
        attemptCount: number,
        strategy: RecoveryStrategy
    ): Promise<void> {
        // En un sistema real, esto se almacenaría en una tabla de analytics
        console.log(`📊 Registrando fallo de pago para analytics:`, {
            subscriptionId,
            invoiceId,
            failureReason,
            attemptCount,
            strategy,
            timestamp: new Date().toISOString()
        });
    }

    // ============================================================================
    // MÉTRICAS Y REPORTES
    // ============================================================================

    /**
     * Obtiene estadísticas avanzadas de recuperación de pagos
     */
    async getAdvancedRecoveryStats(): Promise<AdvancedRecoveryStats> {
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            // Obtener estadísticas de notificaciones como proxy para fallos
            const [
                totalFailures,
                immediateRetries,
                delayedRetries,
                paymentUpdateRequests,
                suspendedSubscriptions,
                successfulRecoveries
            ] = await Promise.all([
                prisma.notificacion.count({
                    where: {
                        tipo: { in: ['payment_failure', 'payment_retry_scheduled'] },
                        fecha_creacion: { gte: thirtyDaysAgo }
                    }
                }),
                prisma.notificacion.count({
                    where: {
                        tipo: 'payment_retry_scheduled',
                        mensaje: { contains: '1 hora' },
                        fecha_creacion: { gte: thirtyDaysAgo }
                    }
                }),
                prisma.notificacion.count({
                    where: {
                        tipo: 'payment_retry_scheduled',
                        mensaje: { contains: 'horas' },
                        fecha_creacion: { gte: thirtyDaysAgo }
                    }
                }),
                prisma.notificacion.count({
                    where: {
                        tipo: 'payment_method_update_required',
                        fecha_creacion: { gte: thirtyDaysAgo }
                    }
                }),
                prisma.notificacion.count({
                    where: {
                        tipo: 'subscription_suspended',
                        fecha_creacion: { gte: thirtyDaysAgo }
                    }
                }),
                prisma.notificacion.count({
                    where: {
                        tipo: 'payment_retry_success',
                        fecha_creacion: { gte: thirtyDaysAgo }
                    }
                })
            ]);

            const recoveryRate = totalFailures > 0 ? (successfulRecoveries / totalFailures) * 100 : 0;

            return {
                totalFailures,
                strategiesUsed: {
                    immediateRetries,
                    delayedRetries,
                    paymentUpdateRequests,
                    suspendedSubscriptions
                },
                successfulRecoveries,
                recoveryRate: Math.round(recoveryRate * 100) / 100,
                period: '30 days'
            };
        } catch (error) {
            console.error('Error al obtener estadísticas avanzadas de recuperación:', error);
            throw error;
        }
    }
}

// Tipos para las estrategias de recuperación
type RecoveryStrategy =
    | 'retry_immediate'
    | 'retry_delayed'
    | 'request_payment_update'
    | 'request_authentication'
    | 'suspend_subscription'
    | 'offer_discount';

interface AdvancedRecoveryStats {
    totalFailures: number;
    strategiesUsed: {
        immediateRetries: number;
        delayedRetries: number;
        paymentUpdateRequests: number;
        suspendedSubscriptions: number;
    };
    successfulRecoveries: number;
    recoveryRate: number;
    period: string;
}

export const paymentFailureHandlerService = new PaymentFailureHandlerService();