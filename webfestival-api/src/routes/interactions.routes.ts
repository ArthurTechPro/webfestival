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
 * @swagger
 * /interactions/like:
 *   post:
 *     tags: [Interacciones]
 *     summary: Dar like a contenido
 *     description: Permite dar like a cualquier tipo de contenido (blog posts, medios, etc.)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contenidoId
 *               - tipoContenido
 *             properties:
 *               contenidoId:
 *                 type: integer
 *                 description: ID del contenido
 *                 example: 1
 *               tipoContenido:
 *                 type: string
 *                 enum: [blog_post, pagina_estatica, seccion_cms, medio, concurso]
 *                 description: Tipo de contenido
 *                 example: "blog_post"
 *     responses:
 *       201:
 *         description: Like agregado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       409:
 *         description: Ya has dado like a este contenido
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
router.post('/like', authenticateToken, interactionsController.likeContent.bind(interactionsController));

/**
 * DELETE /api/interactions/like
 * Quitar like de cualquier tipo de contenido
 */
router.delete('/like', authenticateToken, interactionsController.unlikeContent.bind(interactionsController));

/**
 * @swagger
 * /interactions/likes/{contenidoId}/{tipoContenido}:
 *   get:
 *     tags: [Interacciones]
 *     summary: Obtener likes de contenido
 *     description: Obtiene la lista de likes de un contenido específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contenidoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del contenido
 *         example: 1
 *       - in: path
 *         name: tipoContenido
 *         required: true
 *         schema:
 *           type: string
 *           enum: [blog_post, pagina_estatica, seccion_cms, medio, concurso]
 *         description: Tipo de contenido
 *         example: "blog_post"
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
 *     responses:
 *       200:
 *         description: Lista de likes obtenida exitosamente
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
 *                     total_likes: { type: integer }
 *                     user_liked: { type: boolean }
 *                     likes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           usuario_id: { type: string }
 *                           fecha_creacion: { type: string, format: date-time }
 *                           usuario:
 *                             type: object
 *                             properties:
 *                               nombre: { type: string }
 *                               picture_url: { type: string }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/likes/:contenidoId/:tipoContenido', authenticateToken, interactionsController.getContentLikes.bind(interactionsController));

// ============================================================================
// RUTAS PARA COMENTARIOS UNIVERSALES
// ============================================================================

/**
 * @swagger
 * /interactions/comments:
 *   post:
 *     tags: [Interacciones]
 *     summary: Crear comentario
 *     description: Crear comentario en cualquier tipo de contenido con soporte para comentarios anidados
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contenidoId
 *               - tipoContenido
 *               - contenido
 *             properties:
 *               contenidoId:
 *                 type: integer
 *                 description: ID del contenido
 *                 example: 1
 *               tipoContenido:
 *                 type: string
 *                 enum: [blog_post, pagina_estatica, seccion_cms, medio, concurso]
 *                 description: Tipo de contenido
 *                 example: "blog_post"
 *               contenido:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Texto del comentario
 *                 example: "¡Excelente artículo! Me ha sido muy útil."
 *               parentId:
 *                 type: integer
 *                 description: ID del comentario padre (para respuestas)
 *                 example: null
 *     responses:
 *       201:
 *         description: Comentario creado exitosamente
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
 *                     id:
 *                       type: integer
 *                     contenido:
 *                       type: string
 *                     fechaCreacion:
 *                       type: string
 *                       format: date-time
 *                     aprobado:
 *                       type: boolean
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/comments', authenticateToken, interactionsController.createComment.bind(interactionsController));

/**
 * @swagger
 * /interactions/comments:
 *   get:
 *     tags: [Interacciones]
 *     summary: Obtener comentarios
 *     description: Obtiene comentarios con filtros y paginación
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: contenidoId
 *         schema:
 *           type: integer
 *         description: ID del contenido
 *       - in: query
 *         name: tipoContenido
 *         schema:
 *           type: string
 *           enum: [blog_post, pagina_estatica, seccion_cms, medio, concurso]
 *         description: Tipo de contenido
 *       - in: query
 *         name: parentId
 *         schema:
 *           type: integer
 *         description: ID del comentario padre (para obtener respuestas)
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
 *         name: orderBy
 *         schema:
 *           type: string
 *           enum: [fecha_creacion, likes_count]
 *           default: fecha_creacion
 *         description: Ordenar por
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Orden
 *     responses:
 *       200:
 *         description: Lista de comentarios
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
 *                       id: { type: integer }
 *                       contenido: { type: string }
 *                       fecha_creacion: { type: string, format: date-time }
 *                       aprobado: { type: boolean }
 *                       likes_count: { type: integer }
 *                       replies_count: { type: integer }
 *                       usuario:
 *                         type: object
 *                         properties:
 *                           nombre: { type: string }
 *                           picture_url: { type: string }
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
router.get('/comments', authenticateToken, interactionsController.getComments.bind(interactionsController));

/**
 * @swagger
 * /interactions/comments/{commentId}:
 *   put:
 *     tags: [Interacciones]
 *     summary: Actualizar comentario
 *     description: Actualiza un comentario (solo el autor puede editarlo)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del comentario
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contenido
 *             properties:
 *               contenido:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Nuevo contenido del comentario
 *                 example: "Comentario actualizado con nueva información"
 *     responses:
 *       200:
 *         description: Comentario actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: No tienes permisos para editar este comentario
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     tags: [Interacciones]
 *     summary: Eliminar comentario
 *     description: Elimina un comentario (autor o admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del comentario
 *         example: 1
 *     responses:
 *       200:
 *         description: Comentario eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: No tienes permisos para eliminar este comentario
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put('/comments/:commentId', authenticateToken, interactionsController.updateComment.bind(interactionsController));
router.delete('/comments/:commentId', authenticateToken, interactionsController.deleteComment.bind(interactionsController));

// ============================================================================
// RUTAS PARA REPORTES UNIFICADOS
// ============================================================================

/**
 * @swagger
 * /interactions/reports:
 *   post:
 *     tags: [Interacciones]
 *     summary: Crear reporte
 *     description: Crea un reporte de contenido inapropiado o comentario
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tipoElemento
 *               - elementoId
 *               - motivo
 *             properties:
 *               tipoElemento:
 *                 type: string
 *                 enum: [comentario, medio, blog_post, concurso]
 *                 description: Tipo de elemento reportado
 *                 example: "comentario"
 *               elementoId:
 *                 type: integer
 *                 description: ID del elemento reportado
 *                 example: 1
 *               motivo:
 *                 type: string
 *                 enum: [spam, contenido_inapropiado, acoso, derechos_autor, otro]
 *                 description: Motivo del reporte
 *                 example: "contenido_inapropiado"
 *               descripcion:
 *                 type: string
 *                 maxLength: 500
 *                 description: Descripción detallada del reporte
 *                 example: "Este comentario contiene lenguaje ofensivo"
 *     responses:
 *       201:
 *         description: Reporte creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       409:
 *         description: Ya has reportado este elemento
 *   get:
 *     tags: [Interacciones]
 *     summary: Obtener reportes (Moderadores)
 *     description: Obtiene lista de reportes con filtros (Solo moderadores y admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [pendiente, revisado, resuelto, rechazado]
 *         description: Filtrar por estado
 *       - in: query
 *         name: motivo
 *         schema:
 *           type: string
 *           enum: [spam, contenido_inapropiado, acoso, derechos_autor, otro]
 *         description: Filtrar por motivo
 *       - in: query
 *         name: tipoElemento
 *         schema:
 *           type: string
 *           enum: [comentario, medio, blog_post, concurso]
 *         description: Filtrar por tipo de elemento
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
 *     responses:
 *       200:
 *         description: Lista de reportes
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
 *                       id: { type: integer }
 *                       motivo: { type: string }
 *                       descripcion: { type: string }
 *                       estado: { type: string }
 *                       fecha_creacion: { type: string, format: date-time }
 *                       reportador:
 *                         type: object
 *                         properties:
 *                           nombre: { type: string }
 *                           email: { type: string }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/reports', authenticateToken, interactionsController.createReport.bind(interactionsController));
router.get('/reports', authenticateToken, interactionsController.getReports.bind(interactionsController));

// ============================================================================
// RUTAS PARA MODERACIÓN CENTRALIZADA
// ============================================================================

/**
 * @swagger
 * /interactions/moderate/comment/{commentId}:
 *   put:
 *     tags: [Interacciones]
 *     summary: Moderar comentario (Moderadores)
 *     description: Moderar un comentario individual (Solo moderadores y admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del comentario
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accion
 *             properties:
 *               accion:
 *                 type: string
 *                 enum: [aprobar, rechazar, eliminar]
 *                 description: Acción de moderación
 *                 example: "aprobar"
 *               razon:
 *                 type: string
 *                 description: Razón de la acción (requerida para rechazar/eliminar)
 *                 example: "Contenido inapropiado"
 *               notificar_usuario:
 *                 type: boolean
 *                 description: Si notificar al usuario sobre la acción
 *                 example: true
 *     responses:
 *       200:
 *         description: Comentario moderado exitosamente
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
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put('/moderate/comment/:commentId', authenticateToken, interactionsController.moderateComment.bind(interactionsController));

/**
 * @swagger
 * /interactions/moderate/bulk:
 *   put:
 *     tags: [Interacciones]
 *     summary: Moderación masiva (Moderadores)
 *     description: Moderar múltiples comentarios de forma masiva (Solo moderadores y admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - commentIds
 *               - accion
 *             properties:
 *               commentIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: IDs de los comentarios a moderar
 *                 example: [1, 2, 3, 4, 5]
 *               accion:
 *                 type: string
 *                 enum: [aprobar, rechazar, eliminar]
 *                 description: Acción de moderación
 *                 example: "aprobar"
 *               razon:
 *                 type: string
 *                 description: Razón de la acción (requerida para rechazar/eliminar)
 *                 example: "Moderación masiva por spam"
 *               notificar_usuarios:
 *                 type: boolean
 *                 description: Si notificar a los usuarios sobre la acción
 *                 example: false
 *     responses:
 *       200:
 *         description: Moderación masiva completada
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
 *                       description: Comentarios procesados
 *                       example: 5
 *                     successful:
 *                       type: integer
 *                       description: Comentarios moderados exitosamente
 *                       example: 4
 *                     failed:
 *                       type: integer
 *                       description: Comentarios que fallaron
 *                       example: 1
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Lista de errores
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
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