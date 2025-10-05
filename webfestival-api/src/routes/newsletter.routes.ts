import { Router } from 'express';
import { newsletterController } from '../controllers/newsletter.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// ============================================================================
// RUTAS DE NEWSLETTER
// ============================================================================

/**
 * @route POST /api/newsletter/subscribe
 * @desc Suscribirse al newsletter
 * @access Público
 */
router.post('/subscribe', newsletterController.subscribeToNewsletter.bind(newsletterController));

/**
 * @route POST /api/newsletter/confirm
 * @desc Confirmar suscripción al newsletter
 * @access Público
 */
router.post('/confirm', newsletterController.confirmSubscription.bind(newsletterController));

/**
 * @route POST /api/newsletter/unsubscribe
 * @desc Cancelar suscripción al newsletter
 * @access Público
 */
router.post('/unsubscribe', newsletterController.unsubscribeFromNewsletter.bind(newsletterController));

/**
 * @route GET /api/newsletter/subscribers
 * @desc Obtener lista de suscriptores (solo CONTENT_ADMIN)
 * @access Privado - CONTENT_ADMIN
 */
router.get('/subscribers', authenticateToken, newsletterController.getSubscribers.bind(newsletterController));

/**
 * @route PUT /api/newsletter/subscribers/:id
 * @desc Actualizar suscriptor (solo CONTENT_ADMIN)
 * @access Privado - CONTENT_ADMIN
 */
router.put('/subscribers/:id', authenticateToken, newsletterController.updateSubscriber.bind(newsletterController));

/**
 * @route GET /api/newsletter/stats
 * @desc Obtener estadísticas del newsletter (solo CONTENT_ADMIN)
 * @access Privado - CONTENT_ADMIN
 */
router.get('/stats', authenticateToken, newsletterController.getNewsletterStats.bind(newsletterController));

/**
 * @route POST /api/newsletter/generate-digest
 * @desc Generar digest semanal (solo CONTENT_ADMIN)
 * @access Privado - CONTENT_ADMIN
 */
router.post('/generate-digest', authenticateToken, newsletterController.generateWeeklyDigest.bind(newsletterController));

/**
 * @route POST /api/newsletter/send-digest
 * @desc Enviar digest a suscriptores (solo CONTENT_ADMIN)
 * @access Privado - CONTENT_ADMIN
 */
router.post('/send-digest', authenticateToken, newsletterController.sendDigestToSubscribers.bind(newsletterController));

/**
 * @route GET /api/newsletter/popular-content
 * @desc Obtener contenido popular para digest (solo CONTENT_ADMIN)
 * @access Privado - CONTENT_ADMIN
 */
router.get('/popular-content', authenticateToken, newsletterController.getPopularContentForDigest.bind(newsletterController));

// ============================================================================
// RUTAS DE CONTENIDO EDUCATIVO
// ============================================================================

/**
 * @route POST /api/educational-content
 * @desc Crear nuevo contenido educativo (solo CONTENT_ADMIN)
 * @access Privado - CONTENT_ADMIN
 */
router.post('/educational-content', authenticateToken, newsletterController.createEducationalContent.bind(newsletterController));

/**
 * @route GET /api/educational-content
 * @desc Obtener contenido educativo con filtros
 * @access Público
 */
router.get('/educational-content', newsletterController.getEducationalContent.bind(newsletterController));

/**
 * @route GET /api/educational-content/recommendations
 * @desc Obtener recomendaciones personalizadas
 * @access Privado - Usuario autenticado
 */
router.get('/educational-content/recommendations', authenticateToken, newsletterController.getPersonalizedRecommendations.bind(newsletterController));

/**
 * @route GET /api/educational-content/metrics
 * @desc Obtener métricas de contenido educativo (solo CONTENT_ADMIN)
 * @access Privado - CONTENT_ADMIN
 */
router.get('/educational-content/metrics', authenticateToken, newsletterController.getEducationalContentMetrics.bind(newsletterController));

/**
 * @route POST /api/educational-content/track-view
 * @desc Registrar vista de contenido educativo
 * @access Público (opcional autenticado para mejores métricas)
 */
router.post('/educational-content/track-view', newsletterController.trackContentView.bind(newsletterController));

/**
 * @route GET /api/educational-content/:id
 * @desc Obtener contenido educativo por ID
 * @access Público
 */
router.get('/educational-content/:id', newsletterController.getEducationalContentById.bind(newsletterController));

/**
 * @route PUT /api/educational-content/:id
 * @desc Actualizar contenido educativo (solo CONTENT_ADMIN)
 * @access Privado - CONTENT_ADMIN
 */
router.put('/educational-content/:id', authenticateToken, newsletterController.updateEducationalContent.bind(newsletterController));

/**
 * @route DELETE /api/educational-content/:id
 * @desc Eliminar contenido educativo (solo CONTENT_ADMIN)
 * @access Privado - CONTENT_ADMIN
 */
router.delete('/educational-content/:id', authenticateToken, newsletterController.deleteEducationalContent.bind(newsletterController));

export default router;