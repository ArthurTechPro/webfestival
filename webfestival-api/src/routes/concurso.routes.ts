import { Router } from 'express';
import { concursoController } from '../controllers/concurso.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

// Rutas públicas (sin autenticación)
router.get('/activos', concursoController.getConcursosActivos);
router.get('/finalizados', concursoController.getConcursosFinalizados);
router.get('/:id', concursoController.getConcursoById);

// Rutas para usuarios autenticados
router.use(authenticateToken); // Todas las rutas siguientes requieren autenticación

// Rutas para participantes (usuarios autenticados)
router.post('/inscripcion', concursoController.inscribirseAConcurso);
router.delete('/inscripcion/:concursoId', concursoController.cancelarInscripcion);
router.get('/mis-inscripciones', concursoController.getMisInscripciones);
router.get('/:concursoId/verificar-inscripcion', concursoController.verificarInscripcion);

// Rutas para administradores
router.get('/', requireRole(['ADMIN']), concursoController.getConcursos);
router.post('/', requireRole(['ADMIN']), concursoController.createConcurso);
router.put('/:id', requireRole(['ADMIN']), concursoController.updateConcurso);
router.delete('/:id', requireRole(['ADMIN']), concursoController.deleteConcurso);

export default router;