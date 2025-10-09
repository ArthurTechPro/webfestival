import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

// ============================================================================
// RUTAS PARA USUARIOS AUTENTICADOS
// ============================================================================

/**
 * @swagger
 * /notifications:
 *   get:
 *     tags: [Notificaciones]
 *     summary: Obtener notificaciones del usuario autenticado
 *     description: Retorna las notificaciones del usuario con paginación y filtros opcionales
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Límite de resultados por página
 *       - in: query
 *         name: leidas
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado de lectura (true=leídas, false=no leídas)
 *     responses:
 *       200:
 *         description: Notificaciones obtenidas exitosamente
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
 *                       id:
 *                         type: integer
 *                       tipo:
 *                         type: string
 *                         enum: [nuevo_concurso, resultados_publicados, recordatorio_evaluacion, newsletter]
 *                       titulo:
 *                         type: string
 *                       mensaje:
 *                         type: string
 *                       leida:
 *                         type: boolean
 *                       fecha_creacion:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginatedResponse/properties/pagination'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', 
  authenticateToken, 
  notificationController.getUserNotifications.bind(notificationController)
);

/**
 * @swagger
 * /notifications/{id}/read:
 *   put:
 *     tags: [Notificaciones]
 *     summary: Marcar notificación como leída
 *     description: Marca una notificación específica como leída
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la notificación
 *     responses:
 *       200:
 *         description: Notificación marcada como leída
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Notificación no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id/read', 
  authenticateToken, 
  notificationController.markAsRead.bind(notificationController)
);

/**
 * @swagger
 * /notifications/read-all:
 *   put:
 *     tags: [Notificaciones]
 *     summary: Marcar todas las notificaciones como leídas
 *     description: Marca todas las notificaciones del usuario como leídas
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Todas las notificaciones marcadas como leídas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Todas las notificaciones marcadas como leídas"
 *                 data:
 *                   type: object
 *                   properties:
 *                     updated:
 *                       type: integer
 *                       description: Número de notificaciones actualizadas
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/read-all', 
  authenticateToken, 
  notificationController.markAllAsRead.bind(notificationController)
);

// ============================================================================
// RUTAS ADMINISTRATIVAS (SOLO ADMIN)
// ============================================================================

/**
 * @route POST /api/v1/notifications/deadline-reminder
 * @desc Enviar recordatorio de fecha límite manualmente
 * @access Privado (solo ADMIN)
 * @body { concursoId: number, horasAntes?: number }
 */
router.post('/deadline-reminder', 
  authenticateToken, 
  requireRole(['ADMIN']), 
  notificationController.sendDeadlineReminder.bind(notificationController)
);

/**
 * @route POST /api/v1/notifications/evaluation-complete
 * @desc Enviar notificación de evaluación completada manualmente
 * @access Privado (solo ADMIN)
 * @body { medioId: number, juradoId: string }
 */
router.post('/evaluation-complete', 
  authenticateToken, 
  requireRole(['ADMIN']), 
  notificationController.sendEvaluationComplete.bind(notificationController)
);

/**
 * @route POST /api/v1/notifications/results-published
 * @desc Enviar notificación de resultados publicados manualmente
 * @access Privado (solo ADMIN)
 * @body { concursoId: number }
 */
router.post('/results-published', 
  authenticateToken, 
  requireRole(['ADMIN']), 
  notificationController.sendResultsPublished.bind(notificationController)
);

/**
 * @route POST /api/v1/notifications/new-contest
 * @desc Enviar notificación de nuevo concurso manualmente
 * @access Privado (solo ADMIN)
 * @body { concursoId: number }
 */
router.post('/new-contest', 
  authenticateToken, 
  requireRole(['ADMIN']), 
  notificationController.sendNewContestNotification.bind(notificationController)
);

// ============================================================================
// RUTAS DE GESTIÓN DE TRABAJOS PROGRAMADOS (SOLO ADMIN)
// ============================================================================

/**
 * @route POST /api/v1/notifications/start-scheduled-jobs
 * @desc Iniciar trabajos programados de notificaciones automáticas
 * @access Privado (solo ADMIN)
 */
router.post('/start-scheduled-jobs', 
  authenticateToken, 
  requireRole(['ADMIN']), 
  notificationController.startScheduledJobs.bind(notificationController)
);

/**
 * @route POST /api/v1/notifications/stop-scheduled-jobs
 * @desc Detener trabajos programados de notificaciones automáticas
 * @access Privado (solo ADMIN)
 */
router.post('/stop-scheduled-jobs', 
  authenticateToken, 
  requireRole(['ADMIN']), 
  notificationController.stopScheduledJobs.bind(notificationController)
);

/**
 * @route POST /api/v1/notifications/cleanup
 * @desc Limpiar notificaciones antiguas (más de 30 días y leídas)
 * @access Privado (solo ADMIN)
 */
router.post('/cleanup', 
  authenticateToken, 
  requireRole(['ADMIN']), 
  notificationController.cleanupOldNotifications.bind(notificationController)
);

export default router;