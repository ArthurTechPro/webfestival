import { Router } from 'express';
import { mediaController } from '@/controllers/media.controller';
import { authenticateToken } from '@/middleware/auth.middleware';
import { requireImmichConnection } from '@/middleware/immich.middleware';

const router = Router();

/**
 * Rutas para gestión de medios multimedia
 */

/**
 * @swagger
 * /media/validation-config:
 *   get:
 *     tags: [Medios]
 *     summary: Obtener configuración de validación de medios
 *     description: Retorna los límites y formatos permitidos para subida de archivos multimedia
 *     responses:
 *       200:
 *         description: Configuración obtenida exitosamente
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
 *                     maxFileSize:
 *                       type: integer
 *                       description: Tamaño máximo en bytes
 *                       example: 10485760
 *                     allowedFormats:
 *                       type: object
 *                       properties:
 *                         fotografia:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["image/jpeg", "image/png", "image/webp"]
 *                         video:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["video/mp4", "video/webm"]
 *                         audio:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["audio/mp3", "audio/wav", "audio/flac"]
 *                         corto_cine:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["video/mp4", "video/mov"]
 */
router.get(
  '/validation-config',
  mediaController.getValidationConfig.bind(mediaController)
);

/**
 * @swagger
 * /media/contests/{concursoId}/upload-url:
 *   post:
 *     tags: [Medios]
 *     summary: Generar URL de subida para un concurso
 *     description: Genera una URL segura para subir un archivo multimedia a un concurso específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: concursoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del concurso
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titulo
 *               - tipo_medio
 *               - categoria_id
 *               - formato
 *               - tamaño_archivo
 *             properties:
 *               titulo:
 *                 type: string
 *                 description: Título del medio
 *                 example: "Atardecer en la ciudad"
 *               tipo_medio:
 *                 type: string
 *                 enum: [fotografia, video, audio, corto_cine]
 *                 description: Tipo de medio multimedia
 *                 example: "fotografia"
 *               categoria_id:
 *                 type: integer
 *                 description: ID de la categoría
 *                 example: 1
 *               formato:
 *                 type: string
 *                 description: Formato del archivo
 *                 example: "image/jpeg"
 *               tamaño_archivo:
 *                 type: integer
 *                 description: Tamaño del archivo en bytes
 *                 example: 2048576
 *     responses:
 *       200:
 *         description: URL de subida generada exitosamente
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
 *                   example: "URL de subida generada exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     uploadUrl:
 *                       type: string
 *                       format: uri
 *                       description: URL segura para subir el archivo
 *                     uploadId:
 *                       type: string
 *                       description: ID único de la subida
 *                     expiresIn:
 *                       type: integer
 *                       description: Tiempo de expiración en segundos
 *                       example: 3600
 *       400:
 *         description: Datos inválidos o límites excedidos
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
 *       403:
 *         description: No inscrito al concurso o límite de envíos alcanzado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/contests/:concursoId/upload-url',
  authenticateToken,
  requireImmichConnection,
  mediaController.generateUploadUrl.bind(mediaController)
);

/**
 * @swagger
 * /media/contests/{concursoId}/process-upload:
 *   post:
 *     tags: [Medios]
 *     summary: Procesar subida completada
 *     description: Confirma que la subida se completó exitosamente y procesa el archivo
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: concursoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del concurso
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - uploadId
 *               - immichAssetId
 *             properties:
 *               uploadId:
 *                 type: string
 *                 description: ID de la subida generado previamente
 *               immichAssetId:
 *                 type: string
 *                 description: ID del asset en Immich
 *     responses:
 *       201:
 *         description: Medio procesado y guardado exitosamente
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
 *                   example: "Medio procesado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Medio'
 *       400:
 *         description: Datos inválidos o subida no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/contests/:concursoId/process-upload',
  authenticateToken,
  requireImmichConnection,
  mediaController.processUpload.bind(mediaController)
);

// Obtener medio por ID
router.get(
  '/:id',
  mediaController.getMediaById.bind(mediaController)
);

// Obtener medios por usuario
router.get(
  '/user/:userId',
  mediaController.getMediaByUser.bind(mediaController)
);

// Obtener medios por concurso
router.get(
  '/contests/:concursoId',
  mediaController.getMediaByContest.bind(mediaController)
);

// Actualizar medio
router.put(
  '/:id',
  authenticateToken,
  mediaController.updateMedia.bind(mediaController)
);

// Eliminar medio
router.delete(
  '/:id',
  authenticateToken,
  mediaController.deleteMedia.bind(mediaController)
);

/**
 * @swagger
 * /media/gallery/winners:
 *   get:
 *     tags: [Medios]
 *     summary: Obtener galería de medios ganadores
 *     description: Retorna los medios ganadores de concursos finalizados para la galería pública
 *     parameters:
 *       - in: query
 *         name: tipo_medio
 *         schema:
 *           type: string
 *           enum: [fotografia, video, audio, corto_cine]
 *         description: Filtrar por tipo de medio
 *       - in: query
 *         name: concurso_id
 *         schema:
 *           type: integer
 *         description: Filtrar por concurso específico
 *       - in: query
 *         name: año
 *         schema:
 *           type: integer
 *         description: Filtrar por año
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
 *         description: Galería de ganadores obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/Medio'
 *                           - type: object
 *                             properties:
 *                               usuario:
 *                                 type: object
 *                                 properties:
 *                                   nombre:
 *                                     type: string
 *                                   picture_url:
 *                                     type: string
 *                               concurso:
 *                                 type: object
 *                                 properties:
 *                                   titulo:
 *                                     type: string
 *                               posicion:
 *                                 type: integer
 *                                 description: Posición obtenida en el concurso
 *                               puntaje_final:
 *                                 type: number
 *                                 description: Puntaje final obtenido
 */
router.get(
  '/gallery/winners',
  mediaController.getWinnerGallery.bind(mediaController)
);

/**
 * @swagger
 * /media/gallery/featured:
 *   get:
 *     tags: [Medios]
 *     summary: Obtener galería de medios destacados
 *     description: Retorna una selección curada de medios destacados para la página principal
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *         description: Número de medios a retornar
 *       - in: query
 *         name: tipo_medio
 *         schema:
 *           type: string
 *           enum: [fotografia, video, audio, corto_cine]
 *         description: Filtrar por tipo de medio
 *     responses:
 *       200:
 *         description: Medios destacados obtenidos exitosamente
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
 *                   example: "Medios destacados obtenidos exitosamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Medio'
 *                       - type: object
 *                         properties:
 *                           usuario:
 *                             type: object
 *                             properties:
 *                               nombre:
 *                                 type: string
 *                           concurso:
 *                             type: object
 *                             properties:
 *                               titulo:
 *                                 type: string
 */
router.get(
  '/gallery/featured',
  mediaController.getFeaturedGallery.bind(mediaController)
);

// Obtener categorías por concurso organizadas por tipo de medio
router.get(
  '/contests/:concursoId/categories',
  mediaController.getCategoriesByMediaType.bind(mediaController)
);

export default router;