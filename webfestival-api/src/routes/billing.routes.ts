import { Router } from 'express';
import { billingController } from '../controllers/billing.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

// ============================================================================
// RUTAS DE FACTURAS (USUARIOS AUTENTICADOS)
// ============================================================================

/**
 * @route GET /api/billing/invoices
 * @desc Obtiene las facturas del usuario autenticado
 * @access Privado
 */
router.get('/invoices', 
  authenticateToken, 
  billingController.getUserInvoices.bind(billingController)
);

/**
 * @route GET /api/billing/invoices/:invoiceId
 * @desc Obtiene una factura específica por ID
 * @access Privado
 */
router.get('/invoices/:invoiceId', 
  authenticateToken, 
  billingController.getInvoiceById.bind(billingController)
);

/**
 * @route GET /api/billing/invoices/:invoiceId/download
 * @desc Descarga una factura en PDF
 * @access Privado
 */
router.get('/invoices/:invoiceId/download', 
  authenticateToken, 
  billingController.downloadInvoice.bind(billingController)
);

// ============================================================================
// RUTAS DE MÉTODOS DE PAGO (USUARIOS AUTENTICADOS)
// ============================================================================

/**
 * @route GET /api/billing/payment-methods
 * @desc Obtiene los métodos de pago del usuario
 * @access Privado
 */
router.get('/payment-methods', 
  authenticateToken, 
  billingController.getPaymentMethods.bind(billingController)
);

/**
 * @route DELETE /api/billing/payment-methods/:paymentMethodId
 * @desc Elimina un método de pago
 * @access Privado
 */
router.delete('/payment-methods/:paymentMethodId', 
  authenticateToken, 
  billingController.deletePaymentMethod.bind(billingController)
);

// ============================================================================
// RUTAS DE ESTADÍSTICAS (USUARIOS AUTENTICADOS)
// ============================================================================

/**
 * @route GET /api/billing/stats
 * @desc Obtiene estadísticas de facturación del usuario
 * @access Privado
 */
router.get('/stats', 
  authenticateToken, 
  billingController.getBillingStats.bind(billingController)
);

// ============================================================================
// RUTAS DE ADMINISTRACIÓN (SOLO ADMIN)
// ============================================================================

/**
 * @route GET /api/billing/admin/recovery-stats
 * @desc Obtiene estadísticas de recuperación de pagos
 * @access Admin
 */
router.get('/admin/recovery-stats', 
  authenticateToken, 
  requireRole(['ADMIN']), 
  billingController.getRecoveryStats.bind(billingController)
);

/**
 * @route POST /api/billing/admin/run-maintenance
 * @desc Ejecuta mantenimiento manual de pagos
 * @access Admin
 */
router.post('/admin/run-maintenance', 
  authenticateToken, 
  requireRole(['ADMIN']), 
  billingController.runPaymentMaintenance.bind(billingController)
);

/**
 * @route GET /api/billing/admin/advanced-recovery-stats
 * @desc Obtiene estadísticas avanzadas de recuperación de pagos
 * @access Admin
 */
router.get('/admin/advanced-recovery-stats', 
  authenticateToken, 
  requireRole(['ADMIN']), 
  billingController.getAdvancedRecoveryStats.bind(billingController)
);

/**
 * @route GET /api/billing/admin/comprehensive-metrics
 * @desc Obtiene métricas comprehensivas de suscripciones
 * @access Admin
 */
router.get('/admin/comprehensive-metrics', 
  authenticateToken, 
  requireRole(['ADMIN']), 
  billingController.getComprehensiveMetrics.bind(billingController)
);

/**
 * @route GET /api/billing/admin/churn-prediction
 * @desc Genera reporte de predicción de churn
 * @access Admin
 */
router.get('/admin/churn-prediction', 
  authenticateToken, 
  requireRole(['ADMIN']), 
  billingController.getChurnPredictionReport.bind(billingController)
);

export default router;