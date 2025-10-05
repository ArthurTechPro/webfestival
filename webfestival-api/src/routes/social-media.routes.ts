import { Router } from 'express';
import { socialMediaController } from '../controllers/social-media.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateRole } from '../middleware/role.middleware';
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
 * @route POST /api/v1/social-media/share-links
 * @desc Genera enlaces para compartir un medio ganador en redes sociales
 * @access Private (Solo el propietario del medio)
 * @requirements 11.1, 11.2, 11.3
 */
router.post(
  '/share-links',
  authRateLimit,
  authenticateToken,
  socialMediaController.generateShareLinks
);

/**
 * @route GET /api/v1/social-media/public/media/:medioId/:slug?
 * @desc Endpoint público para acceder a medios compartidos
 * @access Public
 * @requirements 11.4
 */
router.get(
  '/public/media/:medioId/:slug?',
  publicRateLimit,
  socialMediaController.getPublicMedia
);

/**
 * @route GET /api/v1/social-media/configuration
 * @desc Obtiene el estado de configuración de APIs de redes sociales
 * @access Private (Admin only)
 */
router.get(
  '/configuration',
  authRateLimit,
  authenticateToken,
  validateRole(['ADMIN']),
  socialMediaController.getConfiguration
);

export default router;