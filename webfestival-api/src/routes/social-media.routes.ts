import { Router } from 'express';
import { socialMediaController } from '../controllers/social-media.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiting para endpoints públicos
const publicRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: {
    success: false,
    message: 'Demasiadas solicitudes, intenta de nuevo más tarde'
  }
});

// Rate limiting para endpoints autenticados
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 50, // máximo 50 requests por usuario autenticado
  message: {
    success: false,
    message: 'Demasiadas solicitudes, intenta de nuevo más tarde'
  }
});

/**
 * @swagger
 * /social-media/share-links:
 *   post:
 *     tags: [Redes Sociales]
 *     summary: Generar enlaces para compartir medio ganador
 *     description: Genera enlaces personalizados para compartir un medio ganador en Facebook, Instagram, Twitter y LinkedIn
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - medioId
 *             properties:
 *               medioId:
 *                 type: integer
 *                 description: ID del medio ganador a compartir
 *                 example: 1
 *     responses:
 *       200:
 *         description: Enlaces generados exitosamente
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
 *                     medio:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         titulo:
 *                           type: string
 *                         autor:
 *                           type: string
 *                         concurso:
 *                           type: string
 *                         posicion:
 *                           type: integer
 *                         tipoMedio:
 *                           type: string
 *                     shareUrls:
 *                       type: object
 *                       properties:
 *                         facebook:
 *                           type: string
 *                         instagram:
 *                           type: string
 *                         twitter:
 *                           type: string
 *                         linkedin:
 *                           type: string
 *                     shareContent:
 *                       type: object
 *                       properties:
 *                         title:
 *                           type: string
 *                         description:
 *                           type: string
 *                         hashtags:
 *                           type: array
 *                           items:
 *                             type: string
 *       400:
 *         description: Solo se pueden compartir medios ganadores (primeros 3 lugares)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Solo puedes compartir tus propios medios
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Medio no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/share-links',
  authRateLimit,
  authenticateToken,
  socialMediaController.generateShareLinks
);

/**
 * @swagger
 * /social-media/public/media/{medioId}/{slug}:
 *   get:
 *     tags: [Redes Sociales]
 *     summary: Acceso público a medio compartido
 *     description: Endpoint público para acceder a medios ganadores compartidos con metadatos Open Graph
 *     parameters:
 *       - in: path
 *         name: medioId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del medio
 *       - in: path
 *         name: slug
 *         required: false
 *         schema:
 *           type: string
 *         description: Slug descriptivo del medio (opcional)
 *     responses:
 *       200:
 *         description: Información del medio público
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
 *                     medio:
 *                       $ref: '#/components/schemas/Medio'
 *                     autor:
 *                       type: object
 *                       properties:
 *                         nombre:
 *                           type: string
 *                         pictureUrl:
 *                           type: string
 *                     concurso:
 *                       type: object
 *                       properties:
 *                         titulo:
 *                           type: string
 *                         descripcion:
 *                           type: string
 *                     resultado:
 *                       type: object
 *                       properties:
 *                         posicion:
 *                           type: integer
 *                         puntajePromedio:
 *                           type: string
 *                     openGraph:
 *                       type: object
 *                       description: Metadatos Open Graph para redes sociales
 *                     shareUrls:
 *                       type: object
 *                       description: URLs para compartir en redes sociales
 *       404:
 *         description: Medio no encontrado o no disponible públicamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/public/media/:medioId/:slug?',
  publicRateLimit,
  socialMediaController.getPublicMedia
);

/**
 * @swagger
 * /social-media/configuration:
 *   get:
 *     tags: [Redes Sociales]
 *     summary: Obtener configuración de redes sociales
 *     description: Obtiene el estado de configuración de las APIs de redes sociales (solo para administradores)
 *     security:
 *       - bearerAuth: []
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
 *                     isConfigured:
 *                       type: boolean
 *                       description: Si todas las APIs están configuradas
 *                     missingKeys:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Claves de API faltantes
 *                     availableServices:
 *                       type: object
 *                       properties:
 *                         facebook:
 *                           type: boolean
 *                         instagram:
 *                           type: boolean
 *                         twitter:
 *                           type: boolean
 *                         linkedin:
 *                           type: boolean
 *       403:
 *         description: Acceso denegado - Solo administradores
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
router.get(
  '/configuration',
  authRateLimit,
  authenticateToken,
  requireRole(['ADMIN']),
  socialMediaController.getConfiguration
);

export default router;