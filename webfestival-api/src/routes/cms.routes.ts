import { Router } from 'express';
import { cmsController } from '../controllers/cms.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * Rutas del sistema CMS unificado
 * Todas las rutas están protegidas por autenticación
 * Las rutas de escritura requieren permisos de CONTENT_ADMIN
 */

// ============================================================================
// RUTAS PÚBLICAS (solo lectura)
// ============================================================================

/**
 * @route GET /api/cms/content
 * @desc Obtiene contenido con filtros y paginación
 * @access Public
 * @query {string} [tipo] - Tipo de contenido (pagina_estatica, blog_post, seccion_cms)
 * @query {string} [categoria] - Filtrar por categoría
 * @query {string} [etiqueta] - Filtrar por etiqueta
 * @query {string} [autor] - Filtrar por autor
 * @query {string} [estado] - Filtrar por estado (BORRADOR, PUBLICADO, ARCHIVADO, PROGRAMADO)
 * @query {string} [busqueda] - Búsqueda en título, contenido y resumen
 * @query {boolean} [activo] - Filtrar por contenido activo
 * @query {boolean} [destacado] - Filtrar por contenido destacado
 * @query {number} [page=1] - Página actual
 * @query {number} [limit=10] - Elementos por página
 * @query {string} [sort_by=created_at] - Campo para ordenar
 * @query {string} [sort_order=desc] - Orden (asc, desc)
 */
router.get('/content', cmsController.getContent.bind(cmsController));

/**
 * @route GET /api/cms/content/:slug
 * @desc Obtiene contenido por slug
 * @access Public
 * @param {string} slug - Slug único del contenido
 * @query {boolean} [include=true] - Incluir relaciones (autor, configuración, SEO, etc.)
 */
router.get('/content/:slug', cmsController.getContentBySlug.bind(cmsController));

/**
 * @route GET /api/cms/categories
 * @desc Obtiene categorías únicas
 * @access Public
 * @query {string} [tipo] - Filtrar por tipo de contenido
 */
router.get('/categories', cmsController.getCategories.bind(cmsController));

/**
 * @route GET /api/cms/tags
 * @desc Obtiene etiquetas con autocompletado
 * @access Public
 * @query {string} query - Texto de búsqueda para autocompletado
 * @query {number} [limit=10] - Límite de resultados
 */
router.get('/tags', cmsController.getTags.bind(cmsController));

/**
 * @route GET /api/cms/content-types
 * @desc Obtiene tipos de contenido disponibles
 * @access Public
 */
router.get('/content-types', cmsController.getContentTypes.bind(cmsController));

/**
 * @route GET /api/cms/content-template/:tipo
 * @desc Obtiene plantilla de contenido por tipo
 * @access Public
 * @param {string} tipo - Tipo de contenido (pagina_estatica, blog_post, seccion_cms)
 */
router.get('/content-template/:tipo', cmsController.getContentTemplate.bind(cmsController));

// ============================================================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ============================================================================

/**
 * @route GET /api/cms/content/:id/metrics
 * @desc Obtiene métricas de contenido específico
 * @access Private
 * @param {number} id - ID del contenido
 */
router.get('/content/:id/metrics', authenticateToken, cmsController.getContentMetrics.bind(cmsController));

/**
 * @route GET /api/cms/content/:id/preview
 * @desc Genera preview de contenido
 * @access Private (CONTENT_ADMIN)
 * @param {number} id - ID del contenido
 */
router.get('/content/:id/preview', authenticateToken, cmsController.previewContent.bind(cmsController));

// ============================================================================
// RUTAS DE ESCRITURA (requieren CONTENT_ADMIN)
// ============================================================================

/**
 * @route POST /api/cms/content
 * @desc Crea nuevo contenido
 * @access Private (CONTENT_ADMIN)
 * @body {CreateContenido} - Datos del contenido a crear
 */
router.post('/content', authenticateToken, cmsController.createContent.bind(cmsController));

/**
 * @route PUT /api/cms/content/:id
 * @desc Actualiza contenido existente
 * @access Private (CONTENT_ADMIN)
 * @param {number} id - ID del contenido
 * @body {UpdateContenido} - Datos del contenido a actualizar
 */
router.put('/content/:id', authenticateToken, cmsController.updateContent.bind(cmsController));

/**
 * @route DELETE /api/cms/content/:id
 * @desc Elimina contenido
 * @access Private (CONTENT_ADMIN)
 * @param {number} id - ID del contenido
 */
router.delete('/content/:id', authenticateToken, cmsController.deleteContent.bind(cmsController));

/**
 * @route POST /api/cms/content/:id/publish
 * @desc Publica contenido (cambia estado a PUBLICADO)
 * @access Private (CONTENT_ADMIN)
 * @param {number} id - ID del contenido
 */
router.post('/content/:id/publish', authenticateToken, cmsController.publishContent.bind(cmsController));

/**
 * @route PUT /api/cms/content/:id/config
 * @desc Actualiza configuración de contenido
 * @access Private (CONTENT_ADMIN)
 * @param {number} id - ID del contenido
 * @body {ContenidoConfiguracion} - Configuración del contenido
 */
router.put('/content/:id/config', authenticateToken, cmsController.updateContentConfig.bind(cmsController));

/**
 * @route PUT /api/cms/content/:id/seo
 * @desc Actualiza SEO de contenido
 * @access Private (CONTENT_ADMIN)
 * @param {number} id - ID del contenido
 * @body {ContenidoSEO} - Datos SEO del contenido
 */
router.put('/content/:id/seo', authenticateToken, cmsController.updateContentSEO.bind(cmsController));

/**
 * @route PUT /api/cms/content/:id/metrics
 * @desc Actualiza métricas de contenido
 * @access Private
 * @param {number} id - ID del contenido
 * @body {Partial<ContenidoMetricas>} - Métricas a actualizar
 */
router.put('/content/:id/metrics', authenticateToken, cmsController.updateContentMetrics.bind(cmsController));

/**
 * @route PUT /api/cms/content/:id/taxonomy
 * @desc Actualiza taxonomía de contenido (categorías y etiquetas)
 * @access Private (CONTENT_ADMIN)
 * @param {number} id - ID del contenido
 * @body {ContenidoTaxonomia[]} - Array de taxonomías
 */
router.put('/content/:id/taxonomy', authenticateToken, cmsController.updateContentTaxonomy.bind(cmsController));

// ============================================================================
// RUTAS DE BÚSQUEDA AVANZADA Y ANALYTICS
// ============================================================================

/**
 * @route GET /api/cms/search
 * @desc Búsqueda avanzada por múltiples criterios
 * @access Public
 * @query {string} [q] - Texto de búsqueda general
 * @query {string} [tipo] - Tipo de contenido
 * @query {string[]} [categorias] - Array de categorías
 * @query {string[]} [etiquetas] - Array de etiquetas
 * @query {string} [autor] - ID del autor
 * @query {string} [estado] - Estado del contenido
 * @query {boolean} [destacado] - Solo contenido destacado
 * @query {string} [fecha_desde] - Fecha desde (ISO string)
 * @query {string} [fecha_hasta] - Fecha hasta (ISO string)
 * @query {number} [min_vistas] - Mínimo número de vistas
 * @query {number} [min_likes] - Mínimo número de likes
 * @query {string} [sort_by] - Campo para ordenar
 * @query {string} [sort_order] - Orden (asc, desc)
 * @query {number} [page=1] - Página actual
 * @query {number} [limit=10] - Elementos por página
 */
router.get('/search', cmsController.advancedSearch.bind(cmsController));

/**
 * @route GET /api/cms/analytics/overview
 * @desc Obtiene métricas generales del CMS
 * @access Private (CONTENT_ADMIN)
 * @query {string} [tipo] - Filtrar por tipo de contenido
 * @query {string} [fecha_inicio] - Fecha de inicio para el rango
 * @query {string} [fecha_fin] - Fecha de fin para el rango
 */
router.get('/analytics/overview', authenticateToken, cmsController.getAnalyticsOverview.bind(cmsController));

/**
 * @route GET /api/cms/analytics/content-performance
 * @desc Obtiene métricas de rendimiento de contenido
 * @access Private (CONTENT_ADMIN)
 * @query {string} [tipo] - Filtrar por tipo de contenido
 * @query {number} [limit=10] - Límite de resultados
 * @query {string} [metric=vistas] - Métrica para ordenar (vistas, likes, comentarios, shares)
 */
router.get('/analytics/content-performance', authenticateToken, cmsController.getContentPerformance.bind(cmsController));

/**
 * @route GET /api/cms/analytics/taxonomy-stats
 * @desc Obtiene estadísticas de taxonomía (categorías y etiquetas más populares)
 * @access Private (CONTENT_ADMIN)
 * @query {string} [tipo] - Filtrar por tipo de contenido
 * @query {number} [limit=10] - Límite de resultados
 */
router.get('/analytics/taxonomy-stats', authenticateToken, cmsController.getTaxonomyStats.bind(cmsController));

/**
 * @route GET /api/cms/analytics/growth-trends
 * @desc Obtiene tendencias de crecimiento de contenido
 * @access Private (CONTENT_ADMIN)
 * @query {string} [periodo=monthly] - Periodo de agrupación (daily, weekly, monthly, yearly)
 * @query {string} [tipo] - Filtrar por tipo de contenido
 * @query {number} [meses=12] - Número de meses hacia atrás
 */
router.get('/analytics/growth-trends', authenticateToken, cmsController.getGrowthTrends.bind(cmsController));

/**
 * @route GET /api/cms/analytics/engagement-metrics
 * @desc Obtiene métricas de engagement detalladas
 * @access Private (CONTENT_ADMIN)
 * @query {string} [tipo] - Filtrar por tipo de contenido
 * @query {string} [fecha_inicio] - Fecha de inicio
 * @query {string} [fecha_fin] - Fecha de fin
 */
router.get('/analytics/engagement-metrics', authenticateToken, cmsController.getEngagementMetrics.bind(cmsController));

export default router;