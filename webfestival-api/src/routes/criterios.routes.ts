import { Router } from 'express';
import { criteriosController } from '../controllers/criterios.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

/**
 * @swagger
 * /criterios:
 *   get:
 *     tags: [Criterios]
 *     summary: Obtener todos los criterios de evaluación
 *     description: Retorna todos los criterios de evaluación activos del sistema
 *     parameters:
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         description: Filtrar por criterios activos/inactivos
 *       - in: query
 *         name: tipo_medio
 *         schema:
 *           type: string
 *           enum: [fotografia, video, audio, corto_cine]
 *         description: Filtrar por tipo de medio
 *     responses:
 *       200:
 *         description: Criterios obtenidos exitosamente
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
 *                   example: "Criterios obtenidos exitosamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Criterio'
 */
router.get('/', criteriosController.getCriterios.bind(criteriosController));

/**
 * @swagger
 * /criterios/universales:
 *   get:
 *     tags: [Criterios]
 *     summary: Obtener criterios universales
 *     description: Retorna los criterios que aplican a todos los tipos de medios
 *     responses:
 *       200:
 *         description: Criterios universales obtenidos exitosamente
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
 *                     $ref: '#/components/schemas/Criterio'
 */
router.get('/universales', criteriosController.getCriteriosUniversales.bind(criteriosController));

/**
 * @swagger
 * /criterios/tipo/{tipoMedio}:
 *   get:
 *     tags: [Criterios]
 *     summary: Obtener criterios por tipo de medio
 *     description: Retorna los criterios específicos para un tipo de medio más los universales
 *     parameters:
 *       - in: path
 *         name: tipoMedio
 *         required: true
 *         schema:
 *           type: string
 *           enum: [fotografia, video, audio, corto_cine]
 *         description: Tipo de medio
 *         example: fotografia
 *     responses:
 *       200:
 *         description: Criterios por tipo obtenidos exitosamente
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
 *                   example: "Criterios para fotografía obtenidos exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     especificos:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Criterio'
 *                       description: Criterios específicos del tipo de medio
 *                     universales:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Criterio'
 *                       description: Criterios universales aplicables
 *                     total:
 *                       type: integer
 *                       description: Total de criterios aplicables
 *       400:
 *         description: Tipo de medio inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/tipo/:tipoMedio', criteriosController.getCriteriosPorTipo.bind(criteriosController));

/**
 * @swagger
 * /criterios/validar/{tipoMedio}:
 *   get:
 *     tags: [Criterios]
 *     summary: Validar criterios para un tipo de medio
 *     description: Verifica que existan criterios suficientes para evaluar un tipo de medio
 *     parameters:
 *       - in: path
 *         name: tipoMedio
 *         required: true
 *         schema:
 *           type: string
 *           enum: [fotografia, video, audio, corto_cine]
 *         description: Tipo de medio a validar
 *     responses:
 *       200:
 *         description: Validación completada
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
 *                     valido:
 *                       type: boolean
 *                       description: Indica si hay criterios suficientes
 *                     criterios_count:
 *                       type: integer
 *                       description: Número de criterios disponibles
 *                     minimo_requerido:
 *                       type: integer
 *                       description: Mínimo de criterios requeridos
 *                       example: 3
 */
router.get('/validar/:tipoMedio', criteriosController.validarCriterios.bind(criteriosController));

/**
 * @swagger
 * /criterios/estadisticas:
 *   get:
 *     tags: [Criterios]
 *     summary: Obtener estadísticas de criterios
 *     description: Retorna estadísticas sobre el uso y distribución de criterios
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
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
 *                     total_criterios:
 *                       type: integer
 *                     criterios_activos:
 *                       type: integer
 *                     por_tipo_medio:
 *                       type: object
 *                       properties:
 *                         fotografia:
 *                           type: integer
 *                         video:
 *                           type: integer
 *                         audio:
 *                           type: integer
 *                         corto_cine:
 *                           type: integer
 *                         universales:
 *                           type: integer
 */
router.get('/estadisticas', criteriosController.getEstadisticas.bind(criteriosController));

/**
 * @swagger
 * /criterios/{id}:
 *   get:
 *     tags: [Criterios]
 *     summary: Obtener criterio por ID
 *     description: Retorna los detalles de un criterio específico
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del criterio
 *     responses:
 *       200:
 *         description: Criterio obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Criterio'
 *       404:
 *         description: Criterio no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', criteriosController.getCriterioById.bind(criteriosController));

// Rutas protegidas (solo administradores)
router.use(authenticateToken);
router.use(requireRole(['ADMIN']));

/**
 * @swagger
 * /criterios:
 *   post:
 *     tags: [Criterios]
 *     summary: Crear nuevo criterio (Admin)
 *     description: Permite a un administrador crear un nuevo criterio de evaluación
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del criterio
 *                 example: "Composición"
 *               descripcion:
 *                 type: string
 *                 description: Descripción detallada del criterio
 *                 example: "Evaluación de la composición y encuadre de la imagen"
 *               tipo_medio:
 *                 type: string
 *                 enum: [fotografia, video, audio, corto_cine]
 *                 description: Tipo de medio (null para criterios universales)
 *                 example: "fotografia"
 *               peso:
 *                 type: number
 *                 format: float
 *                 default: 1.0
 *                 description: Peso del criterio en la calificación final
 *                 example: 1.5
 *               orden:
 *                 type: integer
 *                 default: 0
 *                 description: Orden de presentación
 *                 example: 1
 *     responses:
 *       201:
 *         description: Criterio creado exitosamente
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
 *                   example: "Criterio creado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Criterio'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Acceso denegado - Se requiere rol ADMIN
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', criteriosController.createCriterio.bind(criteriosController));

/**
 * @swagger
 * /criterios/{id}:
 *   put:
 *     tags: [Criterios]
 *     summary: Actualizar criterio (Admin)
 *     description: Permite a un administrador actualizar un criterio existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del criterio a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               tipo_medio:
 *                 type: string
 *                 enum: [fotografia, video, audio, corto_cine]
 *               peso:
 *                 type: number
 *                 format: float
 *               activo:
 *                 type: boolean
 *               orden:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Criterio actualizado exitosamente
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
 *                   example: "Criterio actualizado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Criterio'
 *       404:
 *         description: Criterio no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     tags: [Criterios]
 *     summary: Eliminar criterio (Admin)
 *     description: Permite a un administrador eliminar un criterio
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del criterio a eliminar
 *     responses:
 *       200:
 *         description: Criterio eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Criterio no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', criteriosController.updateCriterio.bind(criteriosController));
router.delete('/:id', criteriosController.deleteCriterio.bind(criteriosController));

/**
 * @swagger
 * /criterios/reordenar:
 *   post:
 *     tags: [Criterios]
 *     summary: Reordenar criterios (Admin)
 *     description: Permite cambiar el orden de presentación de múltiples criterios
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - criterios
 *             properties:
 *               criterios:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - id
 *                     - orden
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: ID del criterio
 *                     orden:
 *                       type: integer
 *                       description: Nuevo orden
 *                 example:
 *                   - id: 1
 *                     orden: 1
 *                   - id: 2
 *                     orden: 2
 *     responses:
 *       200:
 *         description: Criterios reordenados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/reordenar', criteriosController.reordenarCriterios.bind(criteriosController));

export default router;