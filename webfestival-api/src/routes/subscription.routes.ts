import { Router } from 'express';
import { subscriptionController } from '../controllers/subscription.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

// ============================================================================
// RUTAS PÚBLICAS - PLANES DE SUSCRIPCIÓN
// ============================================================================

/**
 * @route GET /api/subscriptions/plans
 * @desc Obtiene todos los planes de suscripción disponibles
 * @access Público
 */
router.get('/plans', subscriptionController.getPlans.bind(subscriptionController));

/**
 * @route GET /api/subscriptions/plans/:planId
 * @desc Obtiene un plan de suscripción por ID
 * @access Público
 */
router.get('/plans/:planId', subscriptionController.getPlanById.bind(subscriptionController));

// ============================================================================
// RUTAS PROTEGIDAS - GESTIÓN DE SUSCRIPCIONES DE USUARIO
// ============================================================================

/**
 * @route GET /api/subscriptions/my-subscription
 * @desc Obtiene la suscripción activa del usuario autenticado
 * @access Privado
 */
router.get('/my-subscription', 
  authenticateToken, 
  subscriptionController.getUserSubscription.bind(subscriptionController)
);

/**
 * @route POST /api/subscriptions/upgrade
 * @desc Mejora la suscripción del usuario a un plan superior
 * @access Privado
 */
router.post('/upgrade', 
  authenticateToken, 
  subscriptionController.upgradeSubscription.bind(subscriptionController)
);

/**
 * @route POST /api/subscriptions/cancel
 * @desc Cancela la suscripción activa del usuario
 * @access Privado
 */
router.post('/cancel', 
  authenticateToken, 
  subscriptionController.cancelSubscription.bind(subscriptionController)
);

/**
 * @route GET /api/subscriptions/limits
 * @desc Obtiene los límites de uso del usuario autenticado
 * @access Privado
 */
router.get('/limits', 
  authenticateToken, 
  subscriptionController.getUserLimits.bind(subscriptionController)
);

/**
 * @route GET /api/subscriptions/can/:action
 * @desc Verifica si el usuario puede realizar una acción específica
 * @access Privado
 */
router.get('/can/:action', 
  authenticateToken, 
  subscriptionController.checkUserPermission.bind(subscriptionController)
);

// ============================================================================
// RUTAS DE PROCESAMIENTO DE PAGOS
// ============================================================================

/**
 * @route POST /api/subscriptions/process-payment
 * @desc Procesa un pago para una suscripción
 * @access Privado
 * @query provider - stripe | paypal (default: stripe)
 */
router.post('/process-payment', 
  authenticateToken, 
  subscriptionController.processPayment.bind(subscriptionController)
);

/**
 * @route POST /api/subscriptions/confirm-paypal
 * @desc Confirma una suscripción de PayPal después de la aprobación
 * @access Privado
 */
router.post('/confirm-paypal', 
  authenticateToken, 
  subscriptionController.confirmPayPalSubscription.bind(subscriptionController)
);

// ============================================================================
// WEBHOOKS (SIN AUTENTICACIÓN)
// ============================================================================

/**
 * @route POST /api/subscriptions/webhooks/stripe
 * @desc Maneja webhooks de Stripe
 * @access Webhook
 */
router.post('/webhooks/stripe', subscriptionController.handleStripeWebhook.bind(subscriptionController));

/**
 * @route POST /api/subscriptions/webhooks/paypal
 * @desc Maneja webhooks de PayPal
 * @access Webhook
 */
router.post('/webhooks/paypal', subscriptionController.handlePayPalWebhook.bind(subscriptionController));

// ============================================================================
// RUTAS DE ADMINISTRACIÓN
// ============================================================================

/**
 * @route POST /api/subscriptions/plans
 * @desc Crea un nuevo plan de suscripción
 * @access Admin
 */
router.post('/plans', 
  authenticateToken, 
  requireRole(['ADMIN']), 
  subscriptionController.createPlan.bind(subscriptionController)
);

/**
 * @route PUT /api/subscriptions/plans/:planId
 * @desc Actualiza un plan de suscripción existente
 * @access Admin
 */
router.put('/plans/:planId', 
  authenticateToken, 
  requireRole(['ADMIN']), 
  subscriptionController.updatePlan.bind(subscriptionController)
);

/**
 * @route DELETE /api/subscriptions/plans/:planId
 * @desc Elimina un plan de suscripción (lo marca como inactivo)
 * @access Admin
 */
router.delete('/plans/:planId', 
  authenticateToken, 
  requireRole(['ADMIN']), 
  subscriptionController.deletePlan.bind(subscriptionController)
);

/**
 * @route POST /api/subscriptions/user-subscriptions
 * @desc Crea una nueva suscripción para un usuario (uso interno)
 * @access Admin
 */
router.post('/user-subscriptions', 
  authenticateToken, 
  requireRole(['ADMIN']), 
  subscriptionController.createUserSubscription.bind(subscriptionController)
);

/**
 * @route PUT /api/subscriptions/usage
 * @desc Actualiza el uso de una suscripción
 * @access Admin
 */
router.put('/usage', 
  authenticateToken, 
  requireRole(['ADMIN']), 
  subscriptionController.updateUsage.bind(subscriptionController)
);

/**
 * @route GET /api/subscriptions/metrics
 * @desc Obtiene métricas generales de suscripciones
 * @access Admin
 */
router.get('/metrics', 
  authenticateToken, 
  requireRole(['ADMIN']), 
  subscriptionController.getSubscriptionMetrics.bind(subscriptionController)
);

/**
 * @route POST /api/subscriptions/initialize-plans
 * @desc Inicializa los planes predeterminados
 * @access Admin
 */
router.post('/initialize-plans', 
  authenticateToken, 
  requireRole(['ADMIN']), 
  subscriptionController.initializeDefaultPlans.bind(subscriptionController)
);

export default router;