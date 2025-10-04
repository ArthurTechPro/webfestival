import { Router } from 'express';
import { userController } from '@/controllers/user.controller';
import { authenticateToken } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validation';
import { 
  updateProfileSchema,
  followUserSchema,
  juradoEspecializacionSchema,
  updateEspecializacionSchema,
  asignarJuradoSchema
} from '@/schemas/user.schemas';

const router = Router();

/**
 * @route   GET /api/v1/users/:id/profile
 * @desc    Obtener perfil público de usuario
 * @access  Public (con información adicional si está autenticado)
 * @params  id: string (UUID del usuario)
 */
router.get('/:id/profile', 
  userController.getUserProfile.bind(userController)
);

/**
 * @route   PUT /api/v1/users/profile
 * @desc    Actualizar perfil del usuario actual
 * @access  Private
 * @headers Authorization: Bearer <token>
 * @body    { nombre?: string, bio?: string, picture_url?: string }
 */
router.put('/profile',
  authenticateToken,
  validateRequest(updateProfileSchema),
  userController.updateProfile.bind(userController)
);

/**
 * @route   POST /api/v1/users/follow
 * @desc    Seguir a un usuario
 * @access  Private
 * @headers Authorization: Bearer <token>
 * @body    { seguido_id: string }
 */
router.post('/follow',
  authenticateToken,
  validateRequest(followUserSchema),
  userController.followUser.bind(userController)
);

/**
 * @route   DELETE /api/v1/users/follow/:id
 * @desc    Dejar de seguir a un usuario
 * @access  Private
 * @headers Authorization: Bearer <token>
 * @params  id: string (UUID del usuario a dejar de seguir)
 */
router.delete('/follow/:id',
  authenticateToken,
  userController.unfollowUser.bind(userController)
);

/**
 * @route   GET /api/v1/users/following
 * @desc    Obtener usuarios seguidos por el usuario actual
 * @access  Private
 * @headers Authorization: Bearer <token>
 * @query   page?: number, limit?: number
 */
router.get('/following',
  authenticateToken,
  userController.getFollowing.bind(userController)
);

/**
 * @route   GET /api/v1/users/followers
 * @desc    Obtener seguidores del usuario actual
 * @access  Private
 * @headers Authorization: Bearer <token>
 * @query   page?: number, limit?: number
 */
router.get('/followers',
  authenticateToken,
  userController.getFollowers.bind(userController)
);

/**
 * @route   GET /api/v1/users/search
 * @desc    Buscar usuarios con filtros
 * @access  Public (con información adicional si está autenticado)
 * @query   role?: string, especialización?: string, search?: string, page?: number, limit?: number
 */
router.get('/search',
  userController.searchUsers.bind(userController)
);

// Rutas específicas para jurados

/**
 * @route   POST /api/v1/users/jurado/especializacion
 * @desc    Crear especialización de jurado
 * @access  Private (solo jurados)
 * @headers Authorization: Bearer <token>
 * @body    { especializaciones: string[], experiencia_años?: number, certificaciones?: string[], portfolio_url?: string }
 */
router.post('/jurado/especializacion',
  authenticateToken,
  validateRequest(juradoEspecializacionSchema),
  userController.createJuradoEspecializacion.bind(userController)
);

/**
 * @route   PUT /api/v1/users/jurado/especializacion
 * @desc    Actualizar especialización de jurado
 * @access  Private (solo jurados)
 * @headers Authorization: Bearer <token>
 * @body    { especializaciones?: string[], experiencia_años?: number, certificaciones?: string[], portfolio_url?: string }
 */
router.put('/jurado/especializacion',
  authenticateToken,
  validateRequest(updateEspecializacionSchema),
  userController.updateJuradoEspecializacion.bind(userController)
);

/**
 * @route   GET /api/v1/users/jurados/:tipoMedio
 * @desc    Obtener jurados especializados por tipo de medio
 * @access  Private (solo administradores)
 * @headers Authorization: Bearer <token>
 * @params  tipoMedio: 'fotografia' | 'video' | 'audio' | 'corto_cine'
 */
router.get('/jurados/:tipoMedio',
  authenticateToken,
  userController.getJuradosEspecializados.bind(userController)
);

/**
 * @route   POST /api/v1/users/jurado/asignar
 * @desc    Asignar jurado a categoría
 * @access  Private (solo administradores)
 * @headers Authorization: Bearer <token>
 * @body    { jurado_id: string, categoria_id: number }
 */
router.post('/jurado/asignar',
  authenticateToken,
  validateRequest(asignarJuradoSchema),
  userController.asignarJuradoACategoria.bind(userController)
);

/**
 * @route   DELETE /api/v1/users/jurado/asignar/:juradoId/:categoriaId
 * @desc    Remover asignación de jurado
 * @access  Private (solo administradores)
 * @headers Authorization: Bearer <token>
 * @params  juradoId: string, categoriaId: number
 */
router.delete('/jurado/asignar/:juradoId/:categoriaId',
  authenticateToken,
  userController.removerAsignacionJurado.bind(userController)
);

/**
 * @route   GET /api/v1/users/jurado/asignaciones
 * @desc    Obtener asignaciones de jurado
 * @access  Private (jurados ven las suyas, admins ven cualquiera)
 * @headers Authorization: Bearer <token>
 * @query   juradoId?: string (solo para administradores)
 */
router.get('/jurado/asignaciones',
  authenticateToken,
  userController.getAsignacionesJurado.bind(userController)
);

export default router;