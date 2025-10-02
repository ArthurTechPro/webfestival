import { Router } from 'express';
import { criteriosController } from '../controllers/criterios.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

// Rutas públicas (solo lectura)
router.get('/', criteriosController.getCriterios.bind(criteriosController));
router.get('/universales', criteriosController.getCriteriosUniversales.bind(criteriosController));
router.get('/tipo/:tipoMedio', criteriosController.getCriteriosPorTipo.bind(criteriosController));
router.get('/validar/:tipoMedio', criteriosController.validarCriterios.bind(criteriosController));
router.get('/estadisticas', criteriosController.getEstadisticas.bind(criteriosController));
router.get('/:id', criteriosController.getCriterioById.bind(criteriosController));

// Rutas protegidas (solo administradores)
router.use(authenticateToken);
router.use(requireRole(['ADMIN']));

router.post('/', criteriosController.createCriterio.bind(criteriosController));
router.put('/:id', criteriosController.updateCriterio.bind(criteriosController));
router.delete('/:id', criteriosController.deleteCriterio.bind(criteriosController));
router.post('/reordenar', criteriosController.reordenarCriterios.bind(criteriosController));

export default router;