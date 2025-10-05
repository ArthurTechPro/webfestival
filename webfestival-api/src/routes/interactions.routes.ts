import { Router } from 'express';
import { interactionsController } from '../controllers/interactions.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * Rutas para el sistema de interacciones unificadas
 * Todas las rutas requieren autenticación
 */

// ============================================================================
// RUTAS PARA LIKES UNIFICADOS
// ============================================================================

/**
 * POST /api/interactions/like
 * Dar like a cualquier tipo de contenido
 */
router.post('/like', authenticateToken, interactionsController.likeContent.bind(interactionsController));

/**
 * DELETE /api/interactions/like
 * Quitar like de cualquier tipo de contenido
 */
router.delete('/like', authenticateToken, interactionsController.unlikeContent.bind(interactionsController));

/**
 * GET /api/interactions/likes/:contenidoId/:tipoContenido
 * Obtener likes de un contenido específico
 */
router.get('/likes/:contenidoId/:tipoContenido', authenticateToken, interactionsController.getContentLikes.bind(interactionsController));

// ============================================================================
// RUTAS PARA COMENTARIOS UNIVERSALES
// ============================================================================

/**
 * POST /api/interactions/comments
 * Crear comentario en cualquier tipo de contenido
 */
router.post('/comments', authenticateToken, interactionsController.createComment.bind(interactionsController));

/**
 * GET /api/interactions/comments
 * Obtener comentarios con filtros y paginación
 */
router.get('/comments', authenticateToken, interactionsController.getComments.bind(interactionsController));

/**
 * PUT /api/interactions/comments/:commentId
 * Actualizar comentario (solo el autor)
 */
router.put('/comments/:commentId', authenticateToken, interactionsController.updateComment.bind(interactionsController));

/**
 * DELETE /api/interactions/comments/:commentId
 * Eliminar comentario (autor o admin)
 */
router.delete('/comments/:commentId', authenticateToken, interactionsController.deleteComment.bind(interactionsController));

// ============================================================================
// RUTAS PARA REPORTES UNIFICADOS
// ============================================================================

/**
 * POST /api/interactions/reports
 * Crear reporte de contenido o comentario
 */
router.post('/reports', authenticateToken, interactionsController.createReport.bind(interactionsController));

/**
 * GET /api/interactions/reports
 * Obtener reportes con filtros (solo moderadores)
 */
router.get('/reports', authenticateToken, interactionsController.getReports.bind(interactionsController));

// ============================================================================
// RUTAS PARA MODERACIÓN CENTRALIZADA
// ============================================================================

/**
 * PUT /api/interactions/moderate/comment/:commentId
 * Moderar comentario individual (solo moderadores)
 */
router.put('/moderate/comment/:commentId', authenticateToken, interactionsController.moderateComment.bind(interactionsController));

/**
 * PUT /api/interactions/moderate/bulk
 * Moderación masiva de comentarios (solo moderadores)
 */
router.put('/moderate/bulk', authenticateToken, interactionsController.bulkModerateComments.bind(interactionsController));

/**
 * PUT /api/interactions/reports/:reportId/resolve
 * Resolver reporte (solo moderadores)
 */
router.put('/reports/:reportId/resolve', authenticateToken, interactionsController.resolveReport.bind(interactionsController));

// ============================================================================
// RUTAS PARA ESTADÍSTICAS
// ============================================================================

/**
 * GET /api/interactions/stats
 * Obtener estadísticas de interacciones (solo moderadores)
 */
router.get('/stats', authenticateToken, interactionsController.getInteractionStats.bind(interactionsController));

export default router;