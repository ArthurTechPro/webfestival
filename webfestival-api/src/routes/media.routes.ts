import { Router } from 'express';
import { mediaController } from '@/controllers/media.controller';
import { authenticateToken } from '@/middleware/auth.middleware';
import { requireImmichConnection } from '@/middleware/immich.middleware';

const router = Router();

/**
 * Rutas para gestión de medios multimedia
 */

// Obtener configuración de validación (público)
router.get(
  '/validation-config',
  mediaController.getValidationConfig.bind(mediaController)
);

// Generar URL de subida para un concurso específico
router.post(
  '/contests/:concursoId/upload-url',
  authenticateToken,
  requireImmichConnection,
  mediaController.generateUploadUrl.bind(mediaController)
);

// Procesar subida completada
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

export default router;