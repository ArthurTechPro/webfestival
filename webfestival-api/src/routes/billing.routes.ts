import { Router } from 'express';
import { billingController } from '../controllers/billing.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Facturación
 *   description: Sistema de facturación, métodos de pago y estadísticas
 */

// ============================================================================
// RUTAS DE FACTURAS (USUARIOS AUTENTICADOS)
// ============================================================================

/**
 * @swagger
 * /billing/invoices:
 *   get:
 *     tags: [Facturación]
 *     summary: Obtener facturas del usuario
 *     description: Obtiene el historial de facturas del usuario autenticado con paginación
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Elementos por página
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [paid, pending, failed, cancelled]
 *         description: Filtrar por estado de factura
 *     responses:
 *       200:
 *         description: Lista de facturas obtenida exitosamente
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
 *                     type: object
 *                     properties:
 *                       id: { type: string }
 *                       amount: { type: number }
 *                       currency: { type: string }
 *                       status: { type: string }
 *                       created: { type: string, format: date-time }
 *                       subscription_id: { type: string }
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page: { type: integer }
 *                     limit: { type: integer }
 *                     total: { type: integer }
 *                     totalPages: { type: integer }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/invoices', 
  authenticateToken, 
  billingController.getUserInvoices.bind(billingController)
);

/**
 * @swagger
 * /billing/invoices/{invoiceId}:
 *   get:
 *     tags: [Facturación]
 *     summary: Obtener factura específica
 *     description: Obtiene los detalles de una factura específica por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la factura
 *         example: "inv_1234567890"
 *     responses:
 *       200:
 *         description: Detalles de la factura
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
 *                     amount: { type: number }
 *                     currency: { type: string }
 *                     status: { type: string }
 *                     created: { type: string, format: date-time }
 *                     subscription_id: { type: string }
 *                     customer_email: { type: string }
 *                     description: { type: string }
 *                     pdf_url: { type: string }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/invoices/:invoiceId', 
  authenticateToken, 
  billingController.getInvoiceById.bind(billingController)
);

/**
 * @swagger
 * /billing/invoices/{invoiceId}/download:
 *   get:
 *     tags: [Facturación]
 *     summary: Descargar factura en PDF
 *     description: Descarga una factura específica en formato PDF
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la factura
 *         example: "inv_1234567890"
 *     responses:
 *       200:
 *         description: Archivo PDF de la factura
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/invoices/:invoiceId/download', 
  authenticateToken, 
  billingController.downloadInvoice.bind(billingController)
);

// ============================================================================
// RUTAS DE MÉTODOS DE PAGO (USUARIOS AUTENTICADOS)
// ============================================================================

/**
 * @swagger
 * /billing/payment-methods:
 *   get:
 *     tags: [Facturación]
 *     summary: Obtener métodos de pago
 *     description: Obtiene los métodos de pago guardados del usuario
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de métodos de pago
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
 *                     type: object
 *                     properties:
 *                       id: { type: string }
 *                       type: { type: string, example: "card" }
 *                       card:
 *                         type: object
 *                         properties:
 *                           brand: { type: string, example: "visa" }
 *                           last4: { type: string, example: "4242" }
 *                           exp_month: { type: integer, example: 12 }
 *                           exp_year: { type: integer, example: 2025 }
 *                       is_default: { type: boolean }
 *                       created: { type: string, format: date-time }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/payment-methods', 
  authenticateToken, 
  billingController.getPaymentMethods.bind(billingController)
);

/**
 * @swagger
 * /billing/payment-methods/{paymentMethodId}:
 *   delete:
 *     tags: [Facturación]
 *     summary: Eliminar método de pago
 *     description: Elimina un método de pago guardado del usuario
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentMethodId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del método de pago
 *         example: "pm_1234567890"
 *     responses:
 *       200:
 *         description: Método de pago eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/payment-methods/:paymentMethodId', 
  authenticateToken, 
  billingController.deletePaymentMethod.bind(billingController)
);

// ============================================================================
// RUTAS DE ESTADÍSTICAS (USUARIOS AUTENTICADOS)
// ============================================================================

/**
 * @swagger
 * /billing/stats:
 *   get:
 *     tags: [Facturación]
 *     summary: Obtener estadísticas de facturación
 *     description: Obtiene estadísticas de facturación del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de facturación
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
 *                     total_spent:
 *                       type: number
 *                       description: Total gastado en la plataforma
 *                       example: 299.97
 *                     current_period_amount:
 *                       type: number
 *                       description: Monto del período actual
 *                       example: 29.99
 *                     next_billing_date:
 *                       type: string
 *                       format: date-time
 *                       description: Fecha del próximo cobro
 *                     subscription_status:
 *                       type: string
 *                       example: "active"
 *                     invoices_count:
 *                       type: integer
 *                       description: Número total de facturas
 *                       example: 10
 *                     payment_methods_count:
 *                       type: integer
 *                       description: Número de métodos de pago guardados
 *                       example: 2
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/stats', 
  authenticateToken, 
  billingController.getBillingStats.bind(billingController)
);

// ============================================================================
// RUTAS DE ADMINISTRACIÓN (SOLO ADMIN)
// ============================================================================

/**
 * @swagger
 * /billing/admin/recovery-stats:
 *   get:
 *     tags: [Facturación]
 *     summary: Estadísticas de recuperación de pagos (Admin)
 *     description: Obtiene estadísticas de recuperación de pagos fallidos (Solo Admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de recuperación
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
 *                     failed_payments:
 *                       type: integer
 *                       description: Pagos fallidos
 *                     recovered_payments:
 *                       type: integer
 *                       description: Pagos recuperados
 *                     recovery_rate:
 *                       type: number
 *                       description: Tasa de recuperación (%)
 *                     total_recovered_amount:
 *                       type: number
 *                       description: Monto total recuperado
 *                     pending_recovery:
 *                       type: integer
 *                       description: Pagos pendientes de recuperación
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/admin/recovery-stats', 
  authenticateToken, 
  requireRole(['ADMIN']), 
  billingController.getRecoveryStats.bind(billingController)
);

/**
 * @swagger
 * /billing/admin/run-maintenance:
 *   post:
 *     tags: [Facturación]
 *     summary: Ejecutar mantenimiento de pagos (Admin)
 *     description: Ejecuta mantenimiento manual del sistema de pagos (Solo Admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [full, failed_payments, subscriptions, invoices]
 *                 description: Tipo de mantenimiento a ejecutar
 *                 example: "failed_payments"
 *               dry_run:
 *                 type: boolean
 *                 description: Ejecutar en modo simulación
 *                 example: false
 *     responses:
 *       200:
 *         description: Mantenimiento ejecutado exitosamente
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
 *                     processed:
 *                       type: integer
 *                       description: Elementos procesados
 *                     updated:
 *                       type: integer
 *                       description: Elementos actualizados
 *                     errors:
 *                       type: integer
 *                       description: Errores encontrados
 *                     execution_time:
 *                       type: string
 *                       description: Tiempo de ejecución
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/admin/run-maintenance', 
  authenticateToken, 
  requireRole(['ADMIN']), 
  billingController.runPaymentMaintenance.bind(billingController)
);

/**
 * @swagger
 * /billing/admin/advanced-recovery-stats:
 *   get:
 *     tags: [Facturación]
 *     summary: Estadísticas avanzadas de recuperación (Admin)
 *     description: Obtiene estadísticas detalladas de recuperación de pagos con métricas avanzadas
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas avanzadas de recuperación
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
 *                     recovery_by_method:
 *                       type: object
 *                       description: Recuperación por método de pago
 *                     recovery_by_timeframe:
 *                       type: object
 *                       description: Recuperación por período de tiempo
 *                     churn_prevention:
 *                       type: object
 *                       description: Métricas de prevención de churn
 *                     revenue_impact:
 *                       type: object
 *                       description: Impacto en ingresos
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/admin/advanced-recovery-stats', 
  authenticateToken, 
  requireRole(['ADMIN']), 
  billingController.getAdvancedRecoveryStats.bind(billingController)
);

/**
 * @swagger
 * /billing/admin/comprehensive-metrics:
 *   get:
 *     tags: [Facturación]
 *     summary: Métricas comprehensivas (Admin)
 *     description: Obtiene métricas comprehensivas de suscripciones y facturación
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas comprehensivas
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
 *                     mrr:
 *                       type: number
 *                       description: Monthly Recurring Revenue
 *                     arr:
 *                       type: number
 *                       description: Annual Recurring Revenue
 *                     churn_rate:
 *                       type: number
 *                       description: Tasa de churn mensual
 *                     ltv:
 *                       type: number
 *                       description: Lifetime Value promedio
 *                     cac:
 *                       type: number
 *                       description: Customer Acquisition Cost
 *                     active_subscriptions:
 *                       type: integer
 *                       description: Suscripciones activas
 *                     growth_metrics:
 *                       type: object
 *                       description: Métricas de crecimiento
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/admin/comprehensive-metrics', 
  authenticateToken, 
  requireRole(['ADMIN']), 
  billingController.getComprehensiveMetrics.bind(billingController)
);

/**
 * @swagger
 * /billing/admin/churn-prediction:
 *   get:
 *     tags: [Facturación]
 *     summary: Predicción de churn (Admin)
 *     description: Genera reporte de predicción de churn basado en patrones de uso
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: risk_level
 *         schema:
 *           type: string
 *           enum: [high, medium, low, all]
 *           default: all
 *         description: Nivel de riesgo de churn
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Días hacia adelante para la predicción
 *     responses:
 *       200:
 *         description: Reporte de predicción de churn
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
 *                     high_risk_users:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           user_id: { type: string }
 *                           risk_score: { type: number }
 *                           factors: { type: array, items: { type: string } }
 *                     predictions:
 *                       type: object
 *                       properties:
 *                         total_at_risk: { type: integer }
 *                         revenue_at_risk: { type: number }
 *                         confidence_score: { type: number }
 *                     recommendations:
 *                       type: array
 *                       items:
 *                         type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/admin/churn-prediction', 
  authenticateToken, 
  requireRole(['ADMIN']), 
  billingController.getChurnPredictionReport.bind(billingController)
);

export default router;