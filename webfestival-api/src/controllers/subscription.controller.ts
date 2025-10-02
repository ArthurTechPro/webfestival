import { Request, Response } from 'express';
import { subscriptionService } from '../services/subscription.service';
import { stripeService } from '../services/stripe.service';
import { paypalService } from '../services/paypal.service';
import {
    createSubscriptionPlanSchema,
    updateSubscriptionPlanSchema,
    createUserSubscriptionSchema,
    processPaymentSchema,
    updateSubscriptionUsageSchema,
    planQuerySchema,
    stripeWebhookSchema,
    paypalWebhookSchema
} from '../schemas/subscription.schemas';
import { CreateUserSubscriptionDto } from '../types/subscription.types';
import { ZodError } from 'zod';

export class SubscriptionController {
    // ============================================================================
    // GESTIÓN DE PLANES DE SUSCRIPCIÓN
    // ============================================================================

    /**
     * Obtiene todos los planes de suscripción disponibles
     */
    async getPlans(req: Request, res: Response): Promise<void> {
        try {
            const query = planQuerySchema.parse(req.query);
            const plans = await subscriptionService.getAvailablePlans(query.active);

            // Filtrar por intervalo si se especifica
            const filteredPlans = query.interval
                ? plans.filter(plan => plan.interval === query.interval)
                : plans;

            res.json({
                success: true,
                data: filteredPlans,
                message: 'Planes de suscripción obtenidos exitosamente'
            });
        } catch (error) {
            console.error('Error al obtener planes:', error);

            if (error instanceof ZodError) {
                res.status(400).json({
                    success: false,
                    error: 'Parámetros de consulta inválidos',
                    details: error.errors
                });
                return;
            }

            res.status(500).json({
                success: false,
                error: 'Error interno del servidor al obtener los planes'
            });
        }
    }

    /**
     * Obtiene un plan de suscripción por ID
     */
    async getPlanById(req: Request, res: Response): Promise<void> {
        try {
            const { planId } = req.params;

            if (!planId) {
                res.status(400).json({
                    success: false,
                    error: 'ID del plan es requerido'
                });
                return;
            }

            const plan = await subscriptionService.getPlanById(planId);

            if (!plan) {
                res.status(404).json({
                    success: false,
                    error: 'Plan de suscripción no encontrado'
                });
                return;
            }

            res.json({
                success: true,
                data: plan,
                message: 'Plan de suscripción obtenido exitosamente'
            });
        } catch (error) {
            console.error('Error al obtener plan por ID:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor al obtener el plan'
            });
        }
    }

    /**
     * Crea un nuevo plan de suscripción (solo administradores)
     */
    async createPlan(req: Request, res: Response): Promise<void> {
        try {
            const validatedData = createSubscriptionPlanSchema.parse(req.body);

            // Convertir a DTO con la estructura correcta
            const planData = {
                id: validatedData.id,
                name: validatedData.name,
                price: validatedData.price,
                currency: validatedData.currency,
                interval: validatedData.interval,
                features: validatedData.features.map(feature => ({
                    key: feature.key!,
                    name: feature.name!,
                    description: feature.description!,
                    enabled: feature.enabled!
                })),
                limits: {
                    maxConcursosPerMonth: validatedData.limits.maxConcursosPerMonth!,
                    maxUploadsPerMonth: validatedData.limits.maxUploadsPerMonth!,
                    maxPrivateContests: validatedData.limits.maxPrivateContests!,
                    maxTeamMembers: validatedData.limits.maxTeamMembers!,
                    analyticsAccess: validatedData.limits.analyticsAccess!,
                    prioritySupport: validatedData.limits.prioritySupport!,
                    apiAccess: validatedData.limits.apiAccess!
                }
            };

            const plan = await subscriptionService.createPlan(planData);

            res.status(201).json({
                success: true,
                data: plan,
                message: 'Plan de suscripción creado exitosamente'
            });
        } catch (error) {
            console.error('Error al crear plan:', error);

            if (error instanceof ZodError) {
                res.status(400).json({
                    success: false,
                    error: 'Datos del plan inválidos',
                    details: error.errors
                });
                return;
            }

            res.status(500).json({
                success: false,
                error: 'Error interno del servidor al crear el plan'
            });
        }
    }

    /**
     * Actualiza un plan de suscripción existente (solo administradores)
     */
    async updatePlan(req: Request, res: Response): Promise<void> {
        try {
            const { planId } = req.params;

            if (!planId) {
                res.status(400).json({
                    success: false,
                    error: 'ID del plan es requerido'
                });
                return;
            }

            const validatedData = updateSubscriptionPlanSchema.parse(req.body);

            // Filtrar propiedades undefined y convertir a DTO
            const updateData = Object.fromEntries(
                Object.entries(validatedData).filter(([_, value]) => value !== undefined)
            );

            const plan = await subscriptionService.updatePlan(planId, updateData);

            res.json({
                success: true,
                data: plan,
                message: 'Plan de suscripción actualizado exitosamente'
            });
        } catch (error) {
            console.error('Error al actualizar plan:', error);

            if (error instanceof ZodError) {
                res.status(400).json({
                    success: false,
                    error: 'Datos de actualización inválidos',
                    details: error.errors
                });
                return;
            }

            res.status(500).json({
                success: false,
                error: 'Error interno del servidor al actualizar el plan'
            });
        }
    }

    /**
     * Elimina un plan de suscripción (lo marca como inactivo)
     */
    async deletePlan(req: Request, res: Response): Promise<void> {
        try {
            const { planId } = req.params;

            if (!planId) {
                res.status(400).json({
                    success: false,
                    error: 'ID del plan es requerido'
                });
                return;
            }

            await subscriptionService.deletePlan(planId);

            res.json({
                success: true,
                message: 'Plan de suscripción eliminado exitosamente'
            });
        } catch (error) {
            console.error('Error al eliminar plan:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor al eliminar el plan'
            });
        }
    }

    // ============================================================================
    // GESTIÓN DE SUSCRIPCIONES DE USUARIO
    // ============================================================================

    /**
     * Obtiene la suscripción activa del usuario autenticado
     */
    async getUserSubscription(req: Request, res: Response): Promise<void> {
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

            if (!subscription) {
                res.status(404).json({
                    success: false,
                    error: 'No se encontró suscripción activa para el usuario'
                });
                return;
            }

            res.json({
                success: true,
                data: subscription,
                message: 'Suscripción del usuario obtenida exitosamente'
            });
        } catch (error) {
            console.error('Error al obtener suscripción del usuario:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor al obtener la suscripción'
            });
        }
    }

    /**
     * Crea una nueva suscripción para un usuario
     */
    async createUserSubscription(req: Request, res: Response): Promise<void> {
        try {
            const subscriptionData = createUserSubscriptionSchema.parse(req.body);

            // Filtrar propiedades undefined para evitar errores de tipo
            const cleanSubscriptionData: CreateUserSubscriptionDto = {
                user_id: subscriptionData.user_id,
                plan_id: subscriptionData.plan_id,
                status: subscriptionData.status,
                current_period_start: subscriptionData.current_period_start,
                current_period_end: subscriptionData.current_period_end,
                ...(subscriptionData.stripe_subscription_id && {
                    stripe_subscription_id: subscriptionData.stripe_subscription_id
                })
            };

            const subscription = await subscriptionService.createUserSubscription(cleanSubscriptionData);

            res.status(201).json({
                success: true,
                data: subscription,
                message: 'Suscripción de usuario creada exitosamente'
            });
        } catch (error) {
            console.error('Error al crear suscripción de usuario:', error);

            if (error instanceof ZodError) {
                res.status(400).json({
                    success: false,
                    error: 'Datos de suscripción inválidos',
                    details: error.errors
                });
                return;
            }

            res.status(500).json({
                success: false,
                error: 'Error interno del servidor al crear la suscripción'
            });
        }
    }

    /**
     * Mejora la suscripción del usuario a un plan superior
     */
    async upgradeSubscription(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            const { planId } = req.body;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: 'Usuario no autenticado'
                });
                return;
            }

            if (!planId || typeof planId !== 'string') {
                res.status(400).json({
                    success: false,
                    error: 'ID del plan es requerido y debe ser una cadena válida'
                });
                return;
            }

            const subscription = await subscriptionService.upgradeSubscription(userId, planId);

            res.json({
                success: true,
                data: subscription,
                message: 'Suscripción mejorada exitosamente'
            });
        } catch (error) {
            console.error('Error al mejorar suscripción:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor al mejorar la suscripción'
            });
        }
    }

    /**
     * Cancela la suscripción activa del usuario
     */
    async cancelSubscription(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: 'Usuario no autenticado'
                });
                return;
            }

            await subscriptionService.cancelActiveSubscription(userId);

            res.json({
                success: true,
                message: 'Suscripción cancelada exitosamente'
            });
        } catch (error) {
            console.error('Error al cancelar suscripción:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor al cancelar la suscripción'
            });
        }
    }

    // ============================================================================
    // GESTIÓN DE USO Y LÍMITES
    // ============================================================================

    /**
     * Obtiene los límites de uso del usuario autenticado
     */
    async getUserLimits(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: 'Usuario no autenticado'
                });
                return;
            }

            const limits = await subscriptionService.checkUsageLimits(userId);

            res.json({
                success: true,
                data: limits,
                message: 'Límites de uso obtenidos exitosamente'
            });
        } catch (error) {
            console.error('Error al obtener límites de usuario:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor al obtener los límites'
            });
        }
    }

    /**
     * Actualiza el uso de una suscripción
     */
    async updateUsage(req: Request, res: Response): Promise<void> {
        try {
            const usageData = updateSubscriptionUsageSchema.parse(req.body);

            // Filtrar propiedades undefined para evitar errores de tipo
            const cleanUsageData = Object.fromEntries(
                Object.entries(usageData).filter(([_, value]) => value !== undefined)
            );

            const usage = await subscriptionService.updateUsage(usageData.subscription_id, cleanUsageData);

            res.json({
                success: true,
                data: usage,
                message: 'Uso de suscripción actualizado exitosamente'
            });
        } catch (error) {
            console.error('Error al actualizar uso:', error);

            if (error instanceof ZodError) {
                res.status(400).json({
                    success: false,
                    error: 'Datos de uso inválidos',
                    details: error.errors
                });
                return;
            }

            res.status(500).json({
                success: false,
                error: 'Error interno del servidor al actualizar el uso'
            });
        }
    }

    /**
     * Verifica si el usuario puede realizar una acción específica
     */
    async checkUserPermission(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            const { action } = req.params;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: 'Usuario no autenticado'
                });
                return;
            }

            if (!action || typeof action !== 'string') {
                res.status(400).json({
                    success: false,
                    error: 'Acción es requerida'
                });
                return;
            }

            const validActions = ['participate', 'upload', 'create_private', 'add_member'];
            if (!validActions.includes(action)) {
                res.status(400).json({
                    success: false,
                    error: 'Acción inválida'
                });
                return;
            }

            const canPerform = await subscriptionService.canUserPerformAction(userId, action as 'participate' | 'upload' | 'create_private' | 'add_member');

            res.json({
                success: true,
                data: { canPerform, action },
                message: 'Permisos verificados exitosamente'
            });
        } catch (error) {
            console.error('Error al verificar permisos:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor al verificar permisos'
            });
        }
    }

    // ============================================================================
    // PROCESAMIENTO DE PAGOS
    // ============================================================================

    /**
     * Procesa un pago para una suscripción
     */
    async processPayment(req: Request, res: Response): Promise<void> {
        try {
            const paymentData = processPaymentSchema.parse(req.body);
            const { provider = 'stripe' } = req.query;

            // Validar que el método de pago tenga la estructura correcta
            const rawPaymentMethod = paymentData.payment_method;
            if (!rawPaymentMethod.type) {
                res.status(400).json({
                    success: false,
                    error: 'Tipo de método de pago es requerido'
                });
                return;
            }

            // Convertir a la estructura correcta de PaymentMethod
            const paymentMethod = {
                type: rawPaymentMethod.type,
                ...(rawPaymentMethod.type === 'card' && rawPaymentMethod.card && {
                    card: {
                        number: rawPaymentMethod.card.number!,
                        exp_month: rawPaymentMethod.card.exp_month!,
                        exp_year: rawPaymentMethod.card.exp_year!,
                        cvc: rawPaymentMethod.card.cvc!
                    }
                }),
                ...(rawPaymentMethod.type === 'paypal' && rawPaymentMethod.paypal && {
                    paypal: {
                        email: rawPaymentMethod.paypal.email!
                    }
                })
            } as any;

            let result;
            if (provider === 'stripe') {
                result = await stripeService.processPayment(
                    paymentData.user_id,
                    paymentData.plan_id,
                    paymentMethod,
                    (req as any).user?.email || '',
                    (req as any).user?.nombre
                );
            } else if (provider === 'paypal') {
                result = await paypalService.processPayment(
                    paymentData.user_id,
                    paymentData.plan_id,
                    paymentMethod,
                    (req as any).user?.email || '',
                    (req as any).user?.nombre
                );
            } else {
                res.status(400).json({
                    success: false,
                    error: 'Proveedor de pago no soportado'
                });
                return;
            }

            if (result.success) {
                res.json({
                    success: true,
                    data: result,
                    message: 'Pago procesado exitosamente'
                });
            } else {
                res.status(400).json({
                    success: false,
                    error: result.error || 'Error al procesar el pago',
                    data: result
                });
            }
        } catch (error) {
            console.error('Error al procesar pago:', error);

            if (error instanceof ZodError) {
                res.status(400).json({
                    success: false,
                    error: 'Datos de pago inválidos',
                    details: error.errors
                });
                return;
            }

            res.status(500).json({
                success: false,
                error: 'Error interno del servidor al procesar el pago'
            });
        }
    }

    /**
     * Confirma una suscripción de PayPal después de la aprobación
     */
    async confirmPayPalSubscription(req: Request, res: Response): Promise<void> {
        try {
            const { subscriptionId, userId, planId } = req.body;

            if (!subscriptionId || !userId || !planId) {
                res.status(400).json({
                    success: false,
                    error: 'subscriptionId, userId y planId son requeridos'
                });
                return;
            }

            const result = await paypalService.confirmSubscription(subscriptionId, userId, planId);

            if (result.success) {
                res.json({
                    success: true,
                    data: result,
                    message: 'Suscripción de PayPal confirmada exitosamente'
                });
            } else {
                res.status(400).json({
                    success: false,
                    error: result.error || 'Error al confirmar la suscripción'
                });
            }
        } catch (error) {
            console.error('Error al confirmar suscripción de PayPal:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor al confirmar la suscripción'
            });
        }
    }

    // ============================================================================
    // WEBHOOKS
    // ============================================================================

    /**
     * Maneja webhooks de Stripe
     */
    async handleStripeWebhook(req: Request, res: Response): Promise<void> {
        try {
            const signature = req.headers['stripe-signature'] as string;
            const payload = req.body;

            if (!signature) {
                res.status(400).json({
                    success: false,
                    error: 'Firma de webhook faltante'
                });
                return;
            }

            // Verificar la firma del webhook
            const event = stripeService.verifyWebhookSignature(payload, signature);

            // Validar el evento y asegurar que tenga la estructura correcta
            const processableEvent = {
                id: event.id || '',
                type: event.type || '',
                created: event.created || Math.floor(Date.now() / 1000),
                data: {
                    object: event.data?.object || {}
                }
            };

            // Validar con el esquema
            stripeWebhookSchema.parse(processableEvent);

            // Procesar el evento
            await stripeService.handleWebhook(processableEvent);

            res.json({
                success: true,
                message: 'Webhook de Stripe procesado exitosamente'
            });
        } catch (error) {
            console.error('Error al procesar webhook de Stripe:', error);
            res.status(400).json({
                success: false,
                error: 'Error al procesar webhook de Stripe'
            });
        }
    }

    /**
     * Maneja webhooks de PayPal
     */
    async handlePayPalWebhook(req: Request, res: Response): Promise<void> {
        try {
            const headers = req.headers as Record<string, string>;
            const payload = JSON.stringify(req.body);

            // Verificar la firma del webhook
            const isValid = paypalService.verifyWebhookSignature(payload, headers);
            if (!isValid) {
                res.status(400).json({
                    success: false,
                    error: 'Firma de webhook inválida'
                });
                return;
            }

            // Validar el evento y asegurar que tenga la estructura correcta
            const processableEvent = {
                id: req.body.id || '',
                event_type: req.body.event_type || '',
                create_time: req.body.create_time || new Date().toISOString(),
                resource: req.body.resource || {}
            };

            // Validar con el esquema
            paypalWebhookSchema.parse(processableEvent);

            // Procesar el evento
            await paypalService.handleWebhook(processableEvent);

            res.json({
                success: true,
                message: 'Webhook de PayPal procesado exitosamente'
            });
        } catch (error) {
            console.error('Error al procesar webhook de PayPal:', error);
            res.status(400).json({
                success: false,
                error: 'Error al procesar webhook de PayPal'
            });
        }
    }

    // ============================================================================
    // MÉTRICAS Y ANALYTICS
    // ============================================================================

    /**
     * Obtiene métricas generales de suscripciones (solo administradores)
     */
    async getSubscriptionMetrics(_req: Request, res: Response): Promise<void> {
        try {
            const metrics = await subscriptionService.getSubscriptionMetrics();

            res.json({
                success: true,
                data: metrics,
                message: 'Métricas de suscripciones obtenidas exitosamente'
            });
        } catch (error) {
            console.error('Error al obtener métricas:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor al obtener las métricas'
            });
        }
    }

    // ============================================================================
    // UTILIDADES
    // ============================================================================

    /**
     * Inicializa los planes predeterminados
     */
    async initializeDefaultPlans(_req: Request, res: Response): Promise<void> {
        try {
            await subscriptionService.initializeDefaultPlans();

            res.json({
                success: true,
                message: 'Planes predeterminados inicializados exitosamente'
            });
        } catch (error) {
            console.error('Error al inicializar planes predeterminados:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor al inicializar los planes'
            });
        }
    }
}

export const subscriptionController = new SubscriptionController();