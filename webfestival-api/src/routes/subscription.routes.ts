import { Router } from 'express';
import { subscriptionController } from '../controllers/subscription.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { 
  webhookBodyParser, 
  verifyStripeWebhook, 
  verifyPayPalWebhook, 
  logWebhook 
} from '../middleware/webhook.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Suscripciones
 *   description: Sistema de suscripciones, planes y límites de uso
 */

// ============================================================================
// RUTAS PÚBLICAS - PLANES DE SUSCRIPCIÓN
// ============================================================================

/**
 * @swagger
 * /subscriptions/plans:
 *   get:
 *     tags: [Suscripciones]
 *     summary: Obtener planes disponibles
 *     description: Obtiene todos los planes de suscripción disponibles (público)
 *     responses:
 *       200:
 *         description: Lista de planes disponibles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SubscriptionPlan'
 */
router.get('/plans', subscriptionController.getPlans.bind(subscriptionController));

/**
 * @swagger
 * /subscriptions/plans/{planId}:
 *   get:
 *     tags: [Suscripciones]
 *     summary: Obtener plan específico
 *     description: Obtiene un plan de suscripción específico por ID
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del plan de suscripción
 *         example: "plan_basic"
 *     responses:
 *       200:
 *         description: Detalles del plan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SubscriptionPlan'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/plans/:planId', subscriptionController.getPlanById.bind(subscriptionController));

// ============================================================================
// RUTAS PROTEGIDAS - GESTIÓN DE SUSCRIPCIONES DE USUARIO
// ============================================================================

/**
 * @swagger
 * /subscriptions/my-subscription:
 *   get:
 *     tags: [Suscripciones]
 *     summary: Obtener mi suscripción
 *     description: Obtiene la suscripción activa del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Detalles de la suscripción del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id: { type: string }
 *                     plan: { $ref: '#/components/schemas/SubscriptionPlan' }
 *                     status: { type: string, example: "active" }
 *                     current_period_start: { type: string, format: date-time }
 *                     current_period_end: { type: string, format: date-time }
 *                     usage:
 *                       type: object
 *                       properties:
 *                         concursos_creados: { type: integer }
 *                         uploads_realizados: { type: integer }
 *                         concursos_privados: { type: integer }
 *                     limits:
 *                       type: object
 *                       properties:
 *                         concursos_mes: { type: integer }
 *                         uploads_mes: { type: integer }
 *                         concursos_privados: { type: integer }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Usuario sin suscripción activa
 */
router.get('/my-subscription', 
  authenticateToken, 
  subscriptionController.getUserSubscription.bind(subscriptionController)
);

/**
 * @swagger
 * /subscriptions/upgrade:
 *   post:
 *     tags: [Suscripciones]
 *     summary: Mejorar suscripción
 *     description: Mejora la suscripción del usuario a un plan superior
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planId
 *             properties:
 *               planId:
 *                 type: string
 *                 description: ID del nuevo plan
 *                 example: "plan_premium"
 *               paymentMethodId:
 *                 type: string
 *                 description: ID del método de pago (opcional si ya tiene uno por defecto)
 *                 example: "pm_1234567890"
 *               provider:
 *                 type: string
 *                 enum: [stripe, paypal]
 *                 description: Proveedor de pago
 *                 example: "stripe"
 *     responses:
 *       200:
 *         description: Suscripción actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     subscription_id: { type: string }
 *                     status: { type: string }
 *                     new_plan: { $ref: '#/components/schemas/SubscriptionPlan' }
 *                     proration_amount: { type: number }
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       402:
 *         description: Error de pago
 */
router.post('/upgrade', 
  authenticateToken, 
  subscriptionController.upgradeSubscription.bind(subscriptionController)
);

/**
 * @swagger
 * /subscriptions/cancel:
 *   post:
 *     tags: [Suscripciones]
 *     summary: Cancelar suscripción
 *     description: Cancela la suscripción activa del usuario
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Motivo de la cancelación
 *                 example: "No uso suficiente la plataforma"
 *               feedback:
 *                 type: string
 *                 description: Comentarios adicionales
 *                 example: "Me gustaría un plan más económico"
 *               cancel_immediately:
 *                 type: boolean
 *                 description: Cancelar inmediatamente o al final del período
 *                 example: false
 *     responses:
 *       200:
 *         description: Suscripción cancelada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     status: { type: string, example: "cancelled" }
 *                     cancel_at: { type: string, format: date-time }
 *                     access_until: { type: string, format: date-time }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: No hay suscripción activa para cancelar
 */
router.post('/cancel', 
  authenticateToken, 
  subscriptionController.cancelSubscription.bind(subscriptionController)
);

/**
 * @swagger
 * /subscriptions/limits:
 *   get:
 *     tags: [Suscripciones]
 *     summary: Obtener límites de uso
 *     description: Obtiene los límites de uso y consumo actual del usuario
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Límites y uso actual del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     limits:
 *                       type: object
 *                       properties:
 *                         concursos_mes: { type: integer, example: 5 }
 *                         uploads_mes: { type: integer, example: 100 }
 *                         concursos_privados: { type: integer, example: 2 }
 *                     usage:
 *                       type: object
 *                       properties:
 *                         concursos_creados: { type: integer, example: 2 }
 *                         uploads_realizados: { type: integer, example: 45 }
 *                         concursos_privados: { type: integer, example: 1 }
 *                     remaining:
 *                       type: object
 *                       properties:
 *                         concursos_mes: { type: integer, example: 3 }
 *                         uploads_mes: { type: integer, example: 55 }
 *                         concursos_privados: { type: integer, example: 1 }
 *                     reset_date:
 *                       type: string
 *                       format: date-time
 *                       description: Fecha de reinicio del período
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/limits', 
  authenticateToken, 
  subscriptionController.getUserLimits.bind(subscriptionController)
);

/**
 * @swagger
 * /subscriptions/can/{action}:
 *   get:
 *     tags: [Suscripciones]
 *     summary: Verificar permisos
 *     description: Verifica si el usuario puede realizar una acción específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: action
 *         required: true
 *         schema:
 *           type: string
 *           enum: [create_contest, upload_media, create_private_contest]
 *         description: Acción a verificar
 *         example: "create_contest"
 *     responses:
 *       200:
 *         description: Resultado de la verificación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     can_perform:
 *                       type: boolean
 *                       example: true
 *                     reason:
 *                       type: string
 *                       example: "Límite disponible"
 *                     remaining:
 *                       type: integer
 *                       example: 3
 *                     limit:
 *                       type: integer
 *                       example: 5
 *                     upgrade_required:
 *                       type: boolean
 *                       example: false
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       400:
 *         description: Acción no válida
 */
router.get('/can/:action', 
  authenticateToken, 
  subscriptionController.checkUserPermission.bind(subscriptionController)
);

// ============================================================================
// RUTAS DE PROCESAMIENTO DE PAGOS
// ============================================================================

/**
 * @swagger
 * /subscriptions/process-payment:
 *   post:
 *     tags: [Suscripciones]
 *     summary: Procesar pago
 *     description: Procesa un pago para una nueva suscripción o actualización
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: provider
 *         schema:
 *           type: string
 *           enum: [stripe, paypal]
 *           default: stripe
 *         description: Proveedor de pago
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planId
 *             properties:
 *               planId:
 *                 type: string
 *                 description: ID del plan de suscripción
 *                 example: "plan_premium"
 *               paymentMethodId:
 *                 type: string
 *                 description: ID del método de pago (Stripe)
 *                 example: "pm_1234567890"
 *               return_url:
 *                 type: string
 *                 description: URL de retorno (PayPal)
 *                 example: "https://webfestival.com/subscription/success"
 *               cancel_url:
 *                 type: string
 *                 description: URL de cancelación (PayPal)
 *                 example: "https://webfestival.com/subscription/cancel"
 *     responses:
 *       200:
 *         description: Pago procesado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     subscription_id: { type: string }
 *                     status: { type: string }
 *                     client_secret: { type: string, description: "Para Stripe" }
 *                     approval_url: { type: string, description: "Para PayPal" }
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       402:
 *         description: Error de pago
 */
router.post('/process-payment', 
  authenticateToken, 
  subscriptionController.processPayment.bind(subscriptionController)
);

/**
 * @swagger
 * /subscriptions/confirm-paypal:
 *   post:
 *     tags: [Suscripciones]
 *     summary: Confirmar suscripción PayPal
 *     description: Confirma una suscripción de PayPal después de la aprobación del usuario
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subscriptionId
 *             properties:
 *               subscriptionId:
 *                 type: string
 *                 description: ID de la suscripción de PayPal
 *                 example: "I-BW452GLLEP1G"
 *               token:
 *                 type: string
 *                 description: Token de aprobación de PayPal
 *                 example: "EC-60U79048BN7719609"
 *     responses:
 *       200:
 *         description: Suscripción confirmada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     subscription_id: { type: string }
 *                     status: { type: string, example: "active" }
 *                     plan: { $ref: '#/components/schemas/SubscriptionPlan' }
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/confirm-paypal', 
  authenticateToken, 
  subscriptionController.confirmPayPalSubscription.bind(subscriptionController)
);

// ============================================================================
// WEBHOOKS (SIN AUTENTICACIÓN)
// ============================================================================

/**
 * @swagger
 * /subscriptions/webhooks/stripe:
 *   post:
 *     tags: [Suscripciones]
 *     summary: Webhook de Stripe
 *     description: Maneja eventos de webhook de Stripe para suscripciones
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Evento de webhook de Stripe
 *     responses:
 *       200:
 *         description: Webhook procesado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 received: { type: boolean, example: true }
 *       400:
 *         description: Webhook inválido
 *       401:
 *         description: Firma de webhook inválida
 */
router.post('/webhooks/stripe', 
  webhookBodyParser,
  logWebhook('stripe'),
  verifyStripeWebhook,
  subscriptionController.handleStripeWebhook.bind(subscriptionController)
);

/**
 * @swagger
 * /subscriptions/webhooks/paypal:
 *   post:
 *     tags: [Suscripciones]
 *     summary: Webhook de PayPal
 *     description: Maneja eventos de webhook de PayPal para suscripciones
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Evento de webhook de PayPal
 *     responses:
 *       200:
 *         description: Webhook procesado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 received: { type: boolean, example: true }
 *       400:
 *         description: Webhook inválido
 *       401:
 *         description: Verificación de webhook fallida
 */
router.post('/webhooks/paypal', 
  logWebhook('paypal'),
  verifyPayPalWebhook,
  subscriptionController.handlePayPalWebhook.bind(subscriptionController)
);

// ============================================================================
// RUTAS DE ADMINISTRACIÓN
// ============================================================================

/**
 * @swagger
 * /subscriptions/plans:
 *   post:
 *     tags: [Suscripciones]
 *     summary: Crear plan de suscripción (Admin)
 *     description: Crea un nuevo plan de suscripción (Solo Admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - nombre
 *               - precio_mensual
 *             properties:
 *               id:
 *                 type: string
 *                 description: ID único del plan
 *                 example: "plan_enterprise"
 *               nombre:
 *                 type: string
 *                 description: Nombre del plan
 *                 example: "Enterprise"
 *               descripcion:
 *                 type: string
 *                 description: Descripción del plan
 *                 example: "Plan para empresas grandes"
 *               precio_mensual:
 *                 type: number
 *                 description: Precio mensual en USD
 *                 example: 99.99
 *               limite_concursos_mes:
 *                 type: integer
 *                 description: Límite de concursos por mes
 *                 example: 50
 *               limite_uploads_mes:
 *                 type: integer
 *                 description: Límite de uploads por mes
 *                 example: 1000
 *               limite_concursos_privados:
 *                 type: integer
 *                 description: Límite de concursos privados
 *                 example: 20
 *     responses:
 *       201:
 *         description: Plan creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SubscriptionPlan'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       409:
 *         description: Plan con ese ID ya existe
 */
router.post('/plans', 
  authenticateToken, 
  requireRole(['ADMIN']), 
  subscriptionController.createPlan.bind(subscriptionController)
);

/**
 * @swagger
 * /subscriptions/plans/{planId}:
 *   put:
 *     tags: [Suscripciones]
 *     summary: Actualizar plan de suscripción (Admin)
 *     description: Actualiza un plan de suscripción existente (Solo Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del plan a actualizar
 *         example: "plan_premium"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del plan
 *                 example: "Premium Plus"
 *               descripcion:
 *                 type: string
 *                 description: Descripción del plan
 *               precio_mensual:
 *                 type: number
 *                 description: Precio mensual en USD
 *                 example: 39.99
 *               limite_concursos_mes:
 *                 type: integer
 *                 description: Límite de concursos por mes
 *               limite_uploads_mes:
 *                 type: integer
 *                 description: Límite de uploads por mes
 *               limite_concursos_privados:
 *                 type: integer
 *                 description: Límite de concursos privados
 *               activo:
 *                 type: boolean
 *                 description: Si el plan está activo
 *     responses:
 *       200:
 *         description: Plan actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SubscriptionPlan'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put('/plans/:planId', 
  authenticateToken, 
  requireRole(['ADMIN']), 
  subscriptionController.updatePlan.bind(subscriptionController)
);

/**
 * @swagger
 * /subscriptions/plans/{planId}:
 *   delete:
 *     tags: [Suscripciones]
 *     summary: Eliminar plan de suscripción (Admin)
 *     description: Elimina un plan de suscripción marcándolo como inactivo (Solo Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del plan a eliminar
 *         example: "plan_old"
 *     responses:
 *       200:
 *         description: Plan eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/plans/:planId', 
  authenticateToken, 
  requireRole(['ADMIN']), 
  subscriptionController.deletePlan.bind(subscriptionController)
);

/**
 * @swagger
 * /subscriptions/user-subscriptions:
 *   post:
 *     tags: [Suscripciones]
 *     summary: Crear suscripción de usuario (Admin)
 *     description: Crea una nueva suscripción para un usuario específico (Solo Admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - planId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID del usuario
 *                 example: "user_123"
 *               planId:
 *                 type: string
 *                 description: ID del plan
 *                 example: "plan_premium"
 *               status:
 *                 type: string
 *                 enum: [active, cancelled, past_due]
 *                 description: Estado inicial de la suscripción
 *                 example: "active"
 *               trial_end:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha de fin del período de prueba
 *     responses:
 *       201:
 *         description: Suscripción creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/user-subscriptions', 
  authenticateToken, 
  requireRole(['ADMIN']), 
  subscriptionController.createUserSubscription.bind(subscriptionController)
);

/**
 * @swagger
 * /subscriptions/usage:
 *   put:
 *     tags: [Suscripciones]
 *     summary: Actualizar uso de suscripción (Admin)
 *     description: Actualiza el uso de una suscripción específica (Solo Admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - usage_type
 *               - increment
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID del usuario
 *                 example: "user_123"
 *               usage_type:
 *                 type: string
 *                 enum: [concursos_creados, uploads_realizados, concursos_privados]
 *                 description: Tipo de uso a actualizar
 *                 example: "concursos_creados"
 *               increment:
 *                 type: integer
 *                 description: Cantidad a incrementar (puede ser negativo)
 *                 example: 1
 *     responses:
 *       200:
 *         description: Uso actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.put('/usage', 
  authenticateToken, 
  requireRole(['ADMIN']), 
  subscriptionController.updateUsage.bind(subscriptionController)
);

/**
 * @swagger
 * /subscriptions/metrics:
 *   get:
 *     tags: [Suscripciones]
 *     summary: Obtener métricas de suscripciones (Admin)
 *     description: Obtiene métricas generales del sistema de suscripciones (Solo Admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas de suscripciones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_subscriptions:
 *                       type: integer
 *                       description: Total de suscripciones
 *                     active_subscriptions:
 *                       type: integer
 *                       description: Suscripciones activas
 *                     monthly_revenue:
 *                       type: number
 *                       description: Ingresos mensuales
 *                     churn_rate:
 *                       type: number
 *                       description: Tasa de churn
 *                     plans_distribution:
 *                       type: object
 *                       description: Distribución por planes
 *                     growth_metrics:
 *                       type: object
 *                       description: Métricas de crecimiento
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/metrics', 
  authenticateToken, 
  requireRole(['ADMIN']), 
  subscriptionController.getSubscriptionMetrics.bind(subscriptionController)
);

/**
 * @swagger
 * /subscriptions/initialize-plans:
 *   post:
 *     tags: [Suscripciones]
 *     summary: Inicializar planes predeterminados (Admin)
 *     description: Inicializa los planes de suscripción predeterminados del sistema (Solo Admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Planes inicializados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     created_plans:
 *                       type: integer
 *                       description: Número de planes creados
 *                     skipped_plans:
 *                       type: integer
 *                       description: Número de planes que ya existían
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/initialize-plans', 
  authenticateToken, 
  requireRole(['ADMIN']), 
  subscriptionController.initializeDefaultPlans.bind(subscriptionController)
);

export default router;