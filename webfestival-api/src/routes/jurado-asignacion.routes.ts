import { Router } from 'express';
import { juradoAsignacionController } from '../controllers/jurado-asignacion.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas para administradores (gestión completa de asignaciones)
router.post('/', 
  requireRole(['ADMIN']), 
  juradoAsignacionController.createAsignacion.bind(juradoAsignacionController)
);

router.get('/', 
  requireRole(['ADMIN']), 
  juradoAsignacionController.getAsignaciones.bind(juradoAsignacionController)
);

router.delete('/:usuarioId/:categoriaId', 
  requireRole(['ADMIN']), 
  juradoAsignacionController.deleteAsignacion.bind(juradoAsignacionController)
);

// Rutas para consulta de asignaciones (admin y jurados)
router.get('/jurado/:usuarioId', 
  requireRole(['ADMIN', 'JURADO']), 
  juradoAsignacionController.getAsignacionesJurado.bind(juradoAsignacionController)
);

router.get('/categoria/:categoriaId', 
  requireRole(['ADMIN', 'JURADO']), 
  juradoAsignacionController.getJuradosCategoria.bind(juradoAsignacionController)
);

router.get('/concurso/:concursoId', 
  requireRole(['ADMIN', 'JURADO']), 
  juradoAsignacionController.getJuradosConcurso.bind(juradoAsignacionController)
);

// Rutas para asignación inteligente (solo administradores)
router.get('/sugerencias/:concursoId', 
  requireRole(['ADMIN']), 
  juradoAsignacionController.getSugerenciasInteligentes.bind(juradoAsignacionController)
);

router.post('/asignar-automaticamente/:concursoId', 
  requireRole(['ADMIN']), 
  juradoAsignacionController.asignarAutomaticamente.bind(juradoAsignacionController)
);

router.get('/cobertura/:concursoId', 
  requireRole(['ADMIN']), 
  juradoAsignacionController.validarCobertura.bind(juradoAsignacionController)
);

router.get('/estadisticas', 
  requireRole(['ADMIN']), 
  juradoAsignacionController.getEstadisticas.bind(juradoAsignacionController)
);

export default router;