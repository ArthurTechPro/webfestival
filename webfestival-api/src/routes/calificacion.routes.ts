import { Router } from 'express';
import { calificacionController } from '../controllers/calificacion.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas para jurados (usuarios con rol JURADO)
router.get('/mis-asignaciones', 
  requireRole(['JURADO']), 
  calificacionController.getMisAsignaciones.bind(calificacionController)
);

router.post('/', 
  requireRole(['JURADO']), 
  calificacionController.createCalificacion.bind(calificacionController)
);

router.put('/:id', 
  requireRole(['JURADO']), 
  calificacionController.updateCalificacion.bind(calificacionController)
);

router.delete('/:id', 
  requireRole(['JURADO']), 
  calificacionController.deleteCalificacion.bind(calificacionController)
);

// Rutas públicas para criterios (disponibles para todos los usuarios autenticados)
router.get('/criterios/:tipoMedio', 
  calificacionController.getCriteriosParaTipo.bind(calificacionController)
);

// Rutas para administradores y jurados (consulta de calificaciones)
router.get('/', 
  requireRole(['ADMIN', 'JURADO']), 
  calificacionController.getCalificaciones.bind(calificacionController)
);

router.get('/:id', 
  requireRole(['ADMIN', 'JURADO']), 
  calificacionController.getCalificacionById.bind(calificacionController)
);

// Rutas para administradores (progreso y resultados)
router.get('/progreso/:concursoId', 
  requireRole(['ADMIN']), 
  calificacionController.getProgresoEvaluacion.bind(calificacionController)
);

router.get('/resultados/:concursoId', 
  requireRole(['ADMIN']), 
  calificacionController.getResultadosFinales.bind(calificacionController)
);

router.get('/estadisticas', 
  requireRole(['ADMIN']), 
  calificacionController.getEstadisticas.bind(calificacionController)
);

export default router;