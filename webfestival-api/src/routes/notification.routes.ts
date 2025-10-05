import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

// ============================================================================
// RUTAS PARA USUARIOS AUTENTICADOS
// ============================================================================

/**
 * @route GET /api/v1/notifications
 * @desc Obtener notificaciones del usuario autenticado
 * @access Privado (cualquier usuario autenticado)
 * @query page - Número de página (opcional, default: 1)
 * @query limit - Límite de resultados por página (opcional, default: 20, max: 100)
 */
router.get('/', 
  authenticateToken, 
  notificationController.getUserNotifications.bind(notificationController)
);

/**
 * @route PUT /api/v1/notifications/:id/read
 * @desc Marcar una notificación específica como leída
 * @access Privado (cualquier usuario autenticado)
 * @param id - ID de la notificación
 */
router.put('/:id/read', 
  authenticateToken, 
  notificationController.markAsRead.bind(notificationController)
);

/**
 * @route PUT /api/v1/notifications/read-all
 * @desc Marcar todas las notificaciones del usuario como leídas
 * @access Privado (cualquier usuario autenticado)
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