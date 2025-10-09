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
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Gestión de perfiles, seguimientos y especialización de jurados
 */

/**
 * @swagger
 * /users/{id}/profile:
 *   get:
 *     tags: [Usuarios]
 *     summary: Obtener perfil público de usuario
 *     description: Obtiene el perfil público de un usuario (información adicional si está autenticado)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID del usuario
 *         example: "user_123"
 *     responses:
 *       200:
 *         description: Perfil del usuario obtenido exitosamente
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
 *                     id: { type: string }
 *                     nombre: { type: string }
 *                     bio: { type: string, nullable: true }
 *                     picture_url: { type: string, nullable: true }
 *                     role: { type: string }
 *                     created_at: { type: string, format: date-time }
 *                     stats:
 *                       type: object
 *                       properties:
 *                         concursos_participados: { type: integer }
 *                         medios_subidos: { type: integer }
 *                         seguidores: { type: integer }
 *                         siguiendo: { type: integer }
 *                     is_following: { type: boolean, description: "Solo si está autenticado" }
 *                     especializacion: 
 *                       type: object
 *                       nullable: true
 *                       description: "Solo para jurados"
 *                       properties:
 *                         especializaciones: { type: array, items: { type: string } }
 *                         experiencia_años: { type: integer }
 *                         certificaciones: { type: array, items: { type: string } }
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id/profile', 
  userController.getUserProfile.bind(userController)
);

/**
 * @swagger
 * /users/profile:
 *   put:
 *     tags: [Usuarios]
 *     summary: Actualizar perfil del usuario
 *     description: Actualiza el perfil del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del usuario
 *                 example: "Juan Pérez"
 *               bio:
 *                 type: string
 *                 maxLength: 500
 *                 description: Biografía del usuario
 *                 example: "Fotógrafo profesional especializado en paisajes"
 *               picture_url:
 *                 type: string
 *                 format: uri
 *                 description: URL de la foto de perfil
 *                 example: "https://example.com/profile.jpg"
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.put('/profile',
  authenticateToken,
  validateRequest(updateProfileSchema),
  userController.updateProfile.bind(userController)
);

/**
 * @swagger
 * /users/follow:
 *   post:
 *     tags: [Usuarios]
 *     summary: Seguir a un usuario
 *     description: Permite seguir a otro usuario
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - seguido_id
 *             properties:
 *               seguido_id:
 *                 type: string
 *                 description: UUID del usuario a seguir
 *                 example: "user_456"
 *     responses:
 *       201:
 *         description: Usuario seguido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Usuario a seguir no encontrado
 *       409:
 *         description: Ya sigues a este usuario
 */
router.post('/follow',
  authenticateToken,
  validateRequest(followUserSchema),
  userController.followUser.bind(userController)
);

/**
 * @swagger
 * /users/follow/{id}:
 *   delete:
 *     tags: [Usuarios]
 *     summary: Dejar de seguir a un usuario
 *     description: Deja de seguir a un usuario específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID del usuario a dejar de seguir
 *         example: "user_456"
 *     responses:
 *       200:
 *         description: Dejaste de seguir al usuario exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: No sigues a este usuario o usuario no encontrado
 */
router.delete('/follow/:id',
  authenticateToken,
  userController.unfollowUser.bind(userController)
);

/**
 * @swagger
 * /users/following:
 *   get:
 *     tags: [Usuarios]
 *     summary: Obtener usuarios seguidos
 *     description: Obtiene la lista de usuarios seguidos por el usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Lista de usuarios seguidos
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
 *                       id: { type: string }
 *                       nombre: { type: string }
 *                       picture_url: { type: string, nullable: true }
 *                       role: { type: string }
 *                       fecha_seguimiento: { type: string, format: date-time }
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
router.get('/following',
  authenticateToken,
  userController.getFollowing.bind(userController)
);

/**
 * @swagger
 * /users/followers:
 *   get:
 *     tags: [Usuarios]
 *     summary: Obtener seguidores
 *     description: Obtiene la lista de seguidores del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Lista de seguidores
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
 *                       id: { type: string }
 *                       nombre: { type: string }
 *                       picture_url: { type: string, nullable: true }
 *                       role: { type: string }
 *                       fecha_seguimiento: { type: string, format: date-time }
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
router.get('/followers',
  authenticateToken,
  userController.getFollowers.bind(userController)
);

/**
 * @swagger
 * /users/search:
 *   get:
 *     tags: [Usuarios]
 *     summary: Buscar usuarios
 *     description: Busca usuarios con filtros (información adicional si está autenticado)
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Término de búsqueda (nombre o email)
 *         example: "juan"
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [PARTICIPANTE, JURADO, ADMIN, CONTENT_ADMIN]
 *         description: Filtrar por rol
 *       - in: query
 *         name: especializacion
 *         schema:
 *           type: string
 *         description: Filtrar por especialización (solo jurados)
 *         example: "fotografia"
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
 *         description: Resultados de búsqueda
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
 *                       id: { type: string }
 *                       nombre: { type: string }
 *                       bio: { type: string, nullable: true }
 *                       picture_url: { type: string, nullable: true }
 *                       role: { type: string }
 *                       is_following: { type: boolean, description: "Solo si está autenticado" }
 *                       especializacion:
 *                         type: object
 *                         nullable: true
 *                         description: "Solo para jurados"
 *                         properties:
 *                           especializaciones: { type: array, items: { type: string } }
 *                           experiencia_años: { type: integer }
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page: { type: integer }
 *                     limit: { type: integer }
 *                     total: { type: integer }
 *                     totalPages: { type: integer }
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.get('/search',
  userController.searchUsers.bind(userController)
);

/**
 * @swagger
 * /users/jurado/especializacion:
 *   post:
 *     tags: [Usuarios]
 *     summary: Crear especialización de jurado
 *     description: Crea el perfil de especialización para un jurado
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - especializaciones
 *             properties:
 *               especializaciones:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [fotografia, video, audio, corto_cine]
 *                 description: Áreas de especialización
 *                 example: ["fotografia", "video"]
 *               experiencia_años:
 *                 type: integer
 *                 minimum: 0
 *                 description: Años de experiencia
 *                 example: 5
 *               certificaciones:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Certificaciones profesionales
 *                 example: ["Certificado Adobe", "Diploma en Fotografía"]
 *               portfolio_url:
 *                 type: string
 *                 format: uri
 *                 description: URL del portafolio
 *                 example: "https://portfolio.example.com"
 *     responses:
 *       201:
 *         description: Especialización creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Solo los jurados pueden crear especializaciones
 *       409:
 *         description: El jurado ya tiene una especialización
 *   put:
 *     tags: [Usuarios]
 *     summary: Actualizar especialización de jurado
 *     description: Actualiza el perfil de especialización de un jurado
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               especializaciones:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [fotografia, video, audio, corto_cine]
 *                 description: Áreas de especialización
 *               experiencia_años:
 *                 type: integer
 *                 minimum: 0
 *                 description: Años de experiencia
 *               certificaciones:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Certificaciones profesionales
 *               portfolio_url:
 *                 type: string
 *                 format: uri
 *                 description: URL del portafolio
 *     responses:
 *       200:
 *         description: Especialización actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Solo los jurados pueden actualizar especializaciones
 *       404:
 *         description: Especialización no encontrada
 */
router.post('/jurado/especializacion',
  authenticateToken,
  validateRequest(juradoEspecializacionSchema),
  userController.createJuradoEspecializacion.bind(userController)
);

router.put('/jurado/especializacion',
  authenticateToken,
  validateRequest(updateEspecializacionSchema),
  userController.updateJuradoEspecializacion.bind(userController)
);

/**
 * @swagger
 * /users/jurados/{tipoMedio}:
 *   get:
 *     tags: [Usuarios]
 *     summary: Obtener jurados especializados (Admin)
 *     description: Obtiene jurados especializados por tipo de medio (Solo Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tipoMedio
 *         required: true
 *         schema:
 *           type: string
 *           enum: [fotografia, video, audio, corto_cine]
 *         description: Tipo de medio
 *         example: "fotografia"
 *     responses:
 *       200:
 *         description: Lista de jurados especializados
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
 *                       id: { type: string }
 *                       nombre: { type: string }
 *                       email: { type: string }
 *                       picture_url: { type: string, nullable: true }
 *                       especializacion:
 *                         type: object
 *                         properties:
 *                           especializaciones: { type: array, items: { type: string } }
 *                           experiencia_años: { type: integer }
 *                           certificaciones: { type: array, items: { type: string } }
 *                           portfolio_url: { type: string, nullable: true }
 *                       asignaciones_actuales: { type: integer }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       400:
 *         description: Tipo de medio no válido
 */
router.get('/jurados/:tipoMedio',
  authenticateToken,
  userController.getJuradosEspecializados.bind(userController)
);

/**
 * @swagger
 * /users/jurado/asignar:
 *   post:
 *     tags: [Usuarios]
 *     summary: Asignar jurado a categoría (Admin)
 *     description: Asigna un jurado a una categoría específica (Solo Admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jurado_id
 *               - categoria_id
 *             properties:
 *               jurado_id:
 *                 type: string
 *                 description: ID del jurado
 *                 example: "user_123"
 *               categoria_id:
 *                 type: integer
 *                 description: ID de la categoría
 *                 example: 1
 *     responses:
 *       201:
 *         description: Jurado asignado exitosamente
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
 *         description: Jurado o categoría no encontrados
 *       409:
 *         description: El jurado ya está asignado a esta categoría
 */
router.post('/jurado/asignar',
  authenticateToken,
  validateRequest(asignarJuradoSchema),
  userController.asignarJuradoACategoria.bind(userController)
);

/**
 * @swagger
 * /users/jurado/asignar/{juradoId}/{categoriaId}:
 *   delete:
 *     tags: [Usuarios]
 *     summary: Remover asignación de jurado (Admin)
 *     description: Remueve la asignación de un jurado a una categoría (Solo Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: juradoId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del jurado
 *         example: "user_123"
 *       - in: path
 *         name: categoriaId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la categoría
 *         example: 1
 *     responses:
 *       200:
 *         description: Asignación removida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/jurado/asignar/:juradoId/:categoriaId',
  authenticateToken,
  userController.removerAsignacionJurado.bind(userController)
);

/**
 * @swagger
 * /users/jurado/asignaciones:
 *   get:
 *     tags: [Usuarios]
 *     summary: Obtener asignaciones de jurado
 *     description: Obtiene asignaciones de jurado (jurados ven las suyas, admins ven cualquiera)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: juradoId
 *         schema:
 *           type: string
 *         description: ID del jurado (solo para administradores)
 *         example: "user_123"
 *     responses:
 *       200:
 *         description: Lista de asignaciones
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
 *                       categoria_id: { type: integer }
 *                       categoria:
 *                         type: object
 *                         properties:
 *                           nombre: { type: string }
 *                           tipo_medio: { type: string }
 *                           concurso:
 *                             type: object
 *                             properties:
 *                               id: { type: integer }
 *                               titulo: { type: string }
 *                               status: { type: string }
 *                       fecha_asignacion: { type: string, format: date-time }
 *                       medios_asignados: { type: integer }
 *                       medios_evaluados: { type: integer }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Sin permisos para ver estas asignaciones
 */
router.get('/jurado/asignaciones',
  authenticateToken,
  userController.getAsignacionesJurado.bind(userController)
);

export default router;