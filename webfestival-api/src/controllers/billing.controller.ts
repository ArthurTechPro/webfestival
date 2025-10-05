import { Request, Response } from 'express';
import { stripeService } from '../services/stripe.service';
import { subscriptionService } from '../services/subscription.service';
import { paymentRecoveryService } from '../services/payment-recovery.service';

export class BillingController {
    // ============================================================================
    // GESTIÓN DE FACTURAS
    // ============================================================================

    /**
     * Obtiene las facturas del usuario autenticado
     */
    async getUserInvoices(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: 'Usuario no autenticado'
                });
                return;
            }

            const subscription = await subscriptionService.getUserSubscription(userId);
            if (!subscription || !subscription.stripe_subscription_id) {
                res.status(404).json({
                    success: false,
                    error: 'No se encontró suscripción activa'
                });
                return;
            }

            // Obtener facturas de Stripe
            const invoices = await stripeService['stripe'].invoices.list({
                subscription: subscription.stripe_subscription_id,
                limit: 12 // Últimas 12 facturas
            });

            const formattedInvoices = invoices.data.map(invoice => ({
                id: invoice.id,
                amount: invoice.amount_paid / 100,
                currency: invoice.currency.toUpperCase(),
                status: invoice.status,
                created: new Date(invoice.created * 1000),
                due_date: invoice.due_date ? new Date(invoice.due_date * 1000) : null,
                pdf_url: invoice.invoice_pdf,
                hosted_url: invoice.hosted_invoice_url,
                period_start: invoice.period_start ? new Date(invoice.period_start * 1000) : null,
                period_end: invoice.period_end ? new Date(invoice.period_end * 1000) : null
            }));

            res.json({
                success: true,
                data: formattedInvoices,
                message: 'Facturas obtenidas exitosamente'
            });
        } catch (error) {
            console.error('Error al obtener facturas del usuario:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor al obtener las facturas'
            });
        }
    }

    /**
     * Obtiene una factura específica por ID
     */
    async getInvoiceById(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            const { invoiceId } = req.params;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: 'Usuario no autenticado'
                });
                return;
            }

            if (!invoiceId) {
                res.status(400).json({
                    success: false,
                    error: 'ID de factura es requerido'
                });
                return;
            }

            // Verificar que la factura pertenece al usuario
            const subscription = await subscriptionService.getUserSubscription(userId);
            if (!subscription || !subscription.stripe_subscription_id) {
                res.status(404).json({
                    success: false,
                    error: 'No se encontró suscripción activa'
                });
                return;
            }

            const invoice = await stripeService['stripe'].invoices.retrieve(invoiceId);

            // Verificar que la factura pertenece a la suscripción del usuario
            const invoiceSubscriptionId = typeof (invoice as any).subscription === 'string'
                ? (invoice as any).subscription
                : (invoice as any).subscription?.id;

            if (invoiceSubscriptionId !== subscription.stripe_subscription_id) {
                res.status(403).json({
                    success: false,
                    error: 'No tienes permisos para acceder a esta factura'
                });
                return;
            }

            const formattedInvoice = {
                id: invoice.id,
                amount: (invoice as any).amount_paid / 100,
                currency: invoice.currency.toUpperCase(),
                status: invoice.status,
                created: new Date(invoice.created * 1000),
                due_date: (invoice as any).due_date ? new Date((invoice as any).due_date * 1000) : null,
                pdf_url: (invoice as any).invoice_pdf,
                hosted_url: (invoice as any).hosted_invoice_url,
                period_start: (invoice as any).period_start ? new Date((invoice as any).period_start * 1000) : null,
                period_end: (invoice as any).period_end ? new Date((invoice as any).period_end * 1000) : null,
                lines: (invoice as any).lines.data.map((line: any) => ({
                    description: line.description,
                    amount: line.amount / 100,
                    quantity: line.quantity,
                    period_start: line.period?.start ? new Date(line.period.start * 1000) : null,
                    period_end: line.period?.end ? new Date(line.period.end * 1000) : null
                }))
            };

            res.json({
                success: true,
                data: formattedInvoice,
                message: 'Factura obtenida exitosamente'
            });
        } catch (error) {
            console.error('Error al obtener factura por ID:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor al obtener la factura'
            });
        }
    }

    /**
     * Descarga una factura en PDF
     */
    async downloadInvoice(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            const { invoiceId } = req.params;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: 'Usuario no autenticado'
                });
                return;
            }

            if (!invoiceId) {
                res.status(400).json({
                    success: false,
                    error: 'ID de factura es requerido'
                });
                return;
            }

            // Verificar que la factura pertenece al usuario
            const subscription = await subscriptionService.getUserSubscription(userId);
            if (!subscription || !subscription.stripe_subscription_id) {
                res.status(404).json({
                    success: false,
                    error: 'No se encontró suscripción activa'
                });
                return;
            }

            const invoice = await stripeService['stripe'].invoices.retrieve(invoiceId);

            // Verificar que la factura pertenece a la suscripción del usuario
            const invoiceSubscriptionId = typeof (invoice as any).subscription === 'string'
                ? (invoice as any).subscription
                : (invoice as any).subscription?.id;

            if (invoiceSubscriptionId !== subscription.stripe_subscription_id) {
                res.status(403).json({
                    success: false,
                    error: 'No tienes permisos para acceder a esta factura'
                });
                return;
            }

            if (!(invoice as any).invoice_pdf) {
                res.status(404).json({
                    success: false,
                    error: 'PDF de factura no disponible'
                });
                return;
            }

            // Redirigir al PDF de Stripe
            res.redirect((invoice as any).invoice_pdf);
        } catch (error) {
            console.error('Error al descargar factura:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor al descargar la factura'
            });
        }
    }

    // ============================================================================
    // GESTIÓN DE MÉTODOS DE PAGO
    // ============================================================================

    /**
     * Obtiene los métodos de pago del usuario
     */
    async getPaymentMethods(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            const userEmail = (req as any).user?.email;

            if (!userId || !userEmail) {
                res.status(401).json({
                    success: false,
                    error: 'Usuario no autenticado'
                });
                return;
            }

            // Obtener o crear cliente de Stripe
            const customer = await stripeService.getOrCreateCustomer(userId, userEmail);

            // Obtener métodos de pago del cliente
            const paymentMethods = await stripeService['stripe'].paymentMethods.list({
                customer: customer.id,
                type: 'card'
            });

            const formattedPaymentMethods = paymentMethods.data.map(pm => ({
                id: pm.id,
                type: pm.type,
                card: pm.card ? {
                    brand: pm.card.brand,
                    last4: pm.card.last4,
                    exp_month: pm.card.exp_month,
                    exp_year: pm.card.exp_year
                } : null,
                created: new Date(pm.created * 1000)
            }));

            res.json({
                success: true,
                data: formattedPaymentMethods,
                message: 'Métodos de pago obtenidos exitosamente'
            });
        } catch (error) {
            console.error('Error al obtener métodos de pago:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor al obtener los métodos de pago'
            });
        }
    }

    /**
     * Elimina un método de pago
     */
    async deletePaymentMethod(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            const { paymentMethodId } = req.params;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: 'Usuario no autenticado'
                });
                return;
            }

            if (!paymentMethodId) {
                res.status(400).json({
                    success: false,
                    error: 'ID del método de pago es requerido'
                });
                return;
            }

            // Verificar que el método de pago pertenece al usuario
            const paymentMethod = await stripeService['stripe'].paymentMethods.retrieve(paymentMethodId);
            const userEmail = (req as any).user?.email;
            const customer = await stripeService.getOrCreateCustomer(userId, userEmail);

            if (paymentMethod.customer !== customer.id) {
                res.status(403).json({
                    success: false,
                    error: 'No tienes permisos para eliminar este método de pago'
                });
                return;
            }

            // Desadjuntar el método de pago
            await stripeService['stripe'].paymentMethods.detach(paymentMethodId);

            res.json({
                success: true,
                message: 'Método de pago eliminado exitosamente'
            });
        } catch (error) {
            console.error('Error al eliminar método de pago:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor al eliminar el método de pago'
            });
        }
    }

    // ============================================================================
    // ESTADÍSTICAS DE FACTURACIÓN
    // ============================================================================

    /**
     * Obtiene estadísticas de facturación del usuario
     */
    async getBillingStats(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: 'Usuario no autenticado'
                });
                return;
            }

            const subscription = await subscriptionService.getUserSubscription(userId);
            if (!subscription || !subscription.stripe_subscription_id) {
                res.status(404).json({
                    success: false,
                    error: 'No se encontró suscripción activa'
                });
                return;
            }

            // Obtener facturas del último año
            const oneYearAgo = Math.floor((Date.now() - 365 * 24 * 60 * 60 * 1000) / 1000);
            const invoices = await stripeService['stripe'].invoices.list({
                subscription: subscription.stripe_subscription_id,
                created: { gte: oneYearAgo },
                limit: 100
            });

            // Calcular estadísticas
            const totalPaid = invoices.data
                .filter(invoice => invoice.status === 'paid')
                .reduce((sum, invoice) => sum + invoice.amount_paid, 0) / 100;

            const totalInvoices = invoices.data.length;
            const paidInvoices = invoices.data.filter(invoice => invoice.status === 'paid').length;
            const failedInvoices = invoices.data.filter(invoice => invoice.status === 'open' || invoice.status === 'uncollectible').length;

            // Próxima factura
            let upcomingInvoice = null;
            try {
                upcomingInvoice = await (stripeService['stripe'].invoices as any).retrieveUpcoming({
                    subscription: subscription.stripe_subscription_id
                });
            } catch (error) {
                // No hay próxima factura o error al obtenerla
                console.log('No se pudo obtener la próxima factura:', error);
            }

            const stats = {
                totalPaid,
                totalInvoices,
                paidInvoices,
                failedInvoices,
                currentPlan: subscription.plan?.name,
                nextBillingDate: subscription.current_period_end,
                nextInvoiceAmount: upcomingInvoice ? upcomingInvoice.amount_due / 100 : 0,
                paymentHistory: invoices.data.slice(0, 5).map(invoice => ({
                    id: invoice.id,
                    amount: invoice.amount_paid / 100,
                    status: invoice.status,
                    date: new Date(invoice.created * 1000)
                }))
            };

            res.json({
                success: true,
                data: stats,
                message: 'Estadísticas de facturación obtenidas exitosamente'
            });
        } catch (error) {
            console.error('Error al obtener estadísticas de facturación:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor al obtener las estadísticas'
            });
        }
    }

    // ============================================================================
    // RECUPERACIÓN DE PAGOS (SOLO ADMIN)
    // ============================================================================

    /**
     * Obtiene estadísticas de recuperación de pagos (solo administradores)
     */
    async getRecoveryStats(_req: Request, res: Response): Promise<void> {
        try {
            const stats = await paymentRecoveryService.getRecoveryStats();

            res.json({
                success: true,
                data: stats,
                message: 'Estadísticas de recuperación obtenidas exitosamente'
            });
        } catch (error) {
            console.error('Error al obtener estadísticas de recuperación:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor al obtener las estadísticas'
            });
        }
    }

    /**
     * Ejecuta mantenimiento manual de pagos (solo administradores)
     */
    async runPaymentMaintenance(_req: Request, res: Response): Promise<void> {
        try {
            await paymentRecoveryService.runMaintenanceTasks();

            res.json({
                success: true,
                message: 'Mantenimiento de pagos ejecutado exitosamente'
            });
        } catch (error) {
            console.error('Error al ejecutar mantenimiento de pagos:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor al ejecutar el mantenimiento'
            });
        }
    }

    /**
     * Obtiene métricas avanzadas de recuperación de pagos (solo administradores)
     */
    async getAdvancedRecoveryStats(_req: Request, res: Response): Promise<void> {
        try {
            const { paymentFailureHandlerService } = await import('../services/payment-failure-handler.service');
            const stats = await paymentFailureHandlerService.getAdvancedRecoveryStats();

            res.json({
                success: true,
                data: stats,
                message: 'Estadísticas avanzadas de recuperación obtenidas exitosamente'
            });
        } catch (error) {
            console.error('Error al obtener estadísticas avanzadas de recuperación:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor al obtener las estadísticas avanzadas'
            });
        }
    }

    /**
     * Obtiene métricas comprehensivas de suscripciones (solo administradores)
     */
    async getComprehensiveMetrics(_req: Request, res: Response): Promise<void> {
        try {
            const { subscriptionAnalyticsService } = await import('../services/subscription-analytics.service');
            const metrics = await subscriptionAnalyticsService.getComprehensiveMetrics();

            res.json({
                success: true,
                data: metrics,
                message: 'Métricas comprehensivas obtenidas exitosamente'
            });
        } catch (error) {
            console.error('Error al obtener métricas comprehensivas:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor al obtener las métricas comprehensivas'
            });
        }
    }

    /**
     * Genera reporte de predicción de churn (solo administradores)
     */
    async getChurnPredictionReport(_req: Request, res: Response): Promise<void> {
        try {
            const { subscriptionAnalyticsService } = await import('../services/subscription-analytics.service');
            const report = await subscriptionAnalyticsService.generateChurnPredictionReport();

            res.json({
                success: true,
                data: report,
                message: 'Reporte de predicción de churn generado exitosamente'
            });
        } catch (error) {
            console.error('Error al generar reporte de predicción de churn:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor al generar el reporte'
            });
        }
    }
}

export const billingController = new BillingController();