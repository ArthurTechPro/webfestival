import { Router } from 'express';
import { cmsController } from '../controllers/cms.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: CMS
 *   description: Sistema de gestión de contenido unificado con taxonomía, SEO y analytics
 */

/**
 * @swagger
 * /cms/content:
 *   get:
 *     tags: [CMS]
 *     summary: Obtener contenido con filtros
 *     description: Obtiene contenido con filtros avanzados y paginación (público)
 *     parameters:
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [pagina_estatica, blog_post, seccion_cms]
 *         description: Tipo de contenido
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *         description: Filtrar por categoría
 *       - in: query
 *         name: etiqueta
 *         schema:
 *           type: string
 *         description: Filtrar por etiqueta
 *       - in: query
 *         name: autor
 *         schema:
 *           type: string
 *         description: Filtrar por autor
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [BORRADOR, PUBLICADO, ARCHIVADO, PROGRAMADO]
 *         description: Filtrar por estado
 *       - in: query
 *         name: busqueda
 *         schema:
 *           type: string
 *         description: Búsqueda en título, contenido y resumen
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         description: Filtrar por contenido activo
 *       - in: query
 *         name: destacado
 *         schema:
 *           type: boolean
 *         description: Filtrar por contenido destacado
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Página actual
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Elementos por página
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           default: created_at
 *         description: Campo para ordenar
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Orden de clasificación
 *     responses:
 *       200:
 *         description: Lista de contenido obtenida exitosamente
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
 *                     $ref: '#/components/schemas/Contenido'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page: { type: integer }
 *                     limit: { type: integer }
 *                     total: { type: integer }
 *                     totalPages: { type: integer }
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.get('/content', cmsController.getContent.bind(cmsController));

/**
 * @swagger
 * /cms/content/{slug}:
 *   get:
 *     tags: [CMS]
 *     summary: Obtener contenido por slug
 *     description: Obtiene contenido específico por su slug único
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug único del contenido
 *         example: "mi-articulo-blog"
 *       - in: query
 *         name: include
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Incluir relaciones (autor, configuración, SEO, etc.)
 *     responses:
 *       200:
 *         description: Contenido obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Contenido'
 *                     - type: object
 *                       properties:
 *                         autor:
 *                           type: object
 *                           properties:
 *                             nombre: { type: string }
 *                             picture_url: { type: string }
 *                         configuracion:
 *                           type: object
 *                           properties:
 *                             comentarios_habilitados: { type: boolean }
 *                             compartir_habilitado: { type: boolean }
 *                         seo:
 *                           type: object
 *                           properties:
 *                             meta_title: { type: string }
 *                             meta_description: { type: string }
 *                             keywords: { type: array, items: { type: string } }
 *                         metricas:
 *                           type: object
 *                           properties:
 *                             vistas: { type: integer }
 *                             likes: { type: integer }
 *                             comentarios: { type: integer }
 *                             shares: { type: integer }
 *       404:
 *         $ref: '#/components/responses/NotFound'
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
 * @swagger
 * /cms/content:
 *   post:
 *     tags: [CMS]
 *     summary: Crear nuevo contenido (Content Admin)
 *     description: Crea nuevo contenido en el CMS (Solo Content Admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titulo
 *               - contenido
 *               - tipo
 *             properties:
 *               titulo:
 *                 type: string
 *                 description: Título del contenido
 *                 example: "Mi nuevo artículo"
 *               slug:
 *                 type: string
 *                 description: Slug único (se genera automáticamente si no se proporciona)
 *                 example: "mi-nuevo-articulo"
 *               contenido:
 *                 type: string
 *                 description: Contenido principal (HTML/Markdown)
 *                 example: "<p>Este es el contenido del artículo...</p>"
 *               resumen:
 *                 type: string
 *                 description: Resumen del contenido
 *                 example: "Un breve resumen del artículo"
 *               tipo:
 *                 type: string
 *                 enum: [blog_post, pagina_estatica, seccion_cms]
 *                 description: Tipo de contenido
 *                 example: "blog_post"
 *               estado:
 *                 type: string
 *                 enum: [BORRADOR, PUBLICADO, ARCHIVADO, PROGRAMADO]
 *                 default: BORRADOR
 *                 description: Estado del contenido
 *               fecha_publicacion:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha de publicación (para contenido programado)
 *               imagen_destacada:
 *                 type: string
 *                 format: uri
 *                 description: URL de la imagen destacada
 *               categorias:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Categorías del contenido
 *                 example: ["tecnología", "web"]
 *               etiquetas:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Etiquetas del contenido
 *                 example: ["javascript", "react", "tutorial"]
 *               configuracion:
 *                 type: object
 *                 properties:
 *                   comentarios_habilitados: { type: boolean, default: true }
 *                   compartir_habilitado: { type: boolean, default: true }
 *                   destacado: { type: boolean, default: false }
 *               seo:
 *                 type: object
 *                 properties:
 *                   meta_title: { type: string }
 *                   meta_description: { type: string }
 *                   keywords: { type: array, items: { type: string } }
 *     responses:
 *       201:
 *         description: Contenido creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Contenido'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       409:
 *         description: Slug ya existe
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