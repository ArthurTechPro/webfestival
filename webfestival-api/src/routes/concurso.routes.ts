import { Router } from 'express';
import { concursoController } from '../controllers/concurso.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

/**
 * @swagger
 * /concursos/activos:
 *   get:
 *     tags: [Concursos]
 *     summary: Obtener concursos activos
 *     description: Retorna todos los concursos con estado "Activo" disponibles para inscripción
 *     responses:
 *       200:
 *         description: Lista de concursos activos obtenida exitosamente
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
 *                   example: "Concursos activos obtenidos exitosamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Concurso'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/activos', concursoController.getConcursosActivos);

/**
 * @swagger
 * /concursos/finalizados:
 *   get:
 *     tags: [Concursos]
 *     summary: Obtener concursos finalizados
 *     description: Retorna todos los concursos con estado "Finalizado" con resultados disponibles
 *     responses:
 *       200:
 *         description: Lista de concursos finalizados obtenida exitosamente
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
 *                   example: "Concursos finalizados obtenidos exitosamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Concurso'
 */
router.get('/finalizados', concursoController.getConcursosFinalizados);

/**
 * @swagger
 * /concursos/{id}:
 *   get:
 *     tags: [Concursos]
 *     summary: Obtener concurso por ID
 *     description: Retorna los detalles completos de un concurso específico incluyendo categorías
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único del concurso
 *         example: 1
 *     responses:
 *       200:
 *         description: Concurso obtenido exitosamente
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
 *                   example: "Concurso obtenido exitosamente"
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Concurso'
 *                     - type: object
 *                       properties:
 *                         categorias:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Categoria'
 *       404:
 *         description: Concurso no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Concurso no encontrado"
 *               error: "NOT_FOUND"
 */
router.get('/:id', concursoController.getConcursoById);

// Rutas para usuarios autenticados
router.use(authenticateToken); // Todas las rutas siguientes requieren autenticación

/**
 * @swagger
 * /concursos/inscripcion:
 *   post:
 *     tags: [Concursos]
 *     summary: Inscribirse a un concurso
 *     description: Permite a un participante inscribirse a un concurso activo
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - concursoId
 *             properties:
 *               concursoId:
 *                 type: integer
 *                 description: ID del concurso al que se desea inscribir
 *                 example: 1
 *     responses:
 *       201:
 *         description: Inscripción exitosa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Inscripción exitosa al concurso"
 *       400:
 *         description: Error en la inscripción (concurso no activo, ya inscrito, etc.)
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
 *       404:
 *         description: Concurso no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/inscripcion', concursoController.inscribirseAConcurso);

/**
 * @swagger
 * /concursos/inscripcion/{concursoId}:
 *   delete:
 *     tags: [Concursos]
 *     summary: Cancelar inscripción a un concurso
 *     description: Permite a un participante cancelar su inscripción a un concurso
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: concursoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del concurso
 *         example: 1
 *     responses:
 *       200:
 *         description: Inscripción cancelada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Inscripción no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/inscripcion/:concursoId', concursoController.cancelarInscripcion);

/**
 * @swagger
 * /concursos/mis-inscripciones:
 *   get:
 *     tags: [Concursos]
 *     summary: Obtener mis inscripciones
 *     description: Retorna todos los concursos en los que el usuario está inscrito
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inscripciones obtenidas exitosamente
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
 *                   example: "Inscripciones obtenidas exitosamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       concurso:
 *                         $ref: '#/components/schemas/Concurso'
 *                       fecha_inscripcion:
 *                         type: string
 *                         format: date-time
 *                         description: Fecha de inscripción
 */
router.get('/mis-inscripciones', concursoController.getMisInscripciones);

/**
 * @swagger
 * /concursos/{concursoId}/verificar-inscripcion:
 *   get:
 *     tags: [Concursos]
 *     summary: Verificar inscripción a un concurso
 *     description: Verifica si el usuario está inscrito a un concurso específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: concursoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del concurso
 *         example: 1
 *     responses:
 *       200:
 *         description: Estado de inscripción verificado
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
 *                   example: "Estado de inscripción verificado"
 *                 data:
 *                   type: object
 *                   properties:
 *                     inscrito:
 *                       type: boolean
 *                       description: Indica si está inscrito
 *                       example: true
 *                     fecha_inscripcion:
 *                       type: string
 *                       format: date-time
 *                       description: Fecha de inscripción (si está inscrito)
 */
router.get('/:concursoId/verificar-inscripcion', concursoController.verificarInscripcion);

/**
 * @swagger
 * /concursos:
 *   get:
 *     tags: [Concursos]
 *     summary: Obtener todos los concursos (Admin)
 *     description: Retorna todos los concursos del sistema con paginación (solo administradores)
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
 *           default: 10
 *         description: Elementos por página
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Próximamente, Activo, Calificación, Finalizado]
 *         description: Filtrar por estado
 *     responses:
 *       200:
 *         description: Concursos obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Concurso'
 *       403:
 *         description: Acceso denegado - Se requiere rol ADMIN
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   post:
 *     tags: [Concursos]
 *     summary: Crear nuevo concurso (Admin)
 *     description: Permite a un administrador crear un nuevo concurso
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titulo
 *               - descripcion
 *               - fecha_inicio
 *               - fecha_final
 *             properties:
 *               titulo:
 *                 type: string
 *                 description: Título del concurso
 *                 example: "Concurso de Fotografía Urbana 2024"
 *               descripcion:
 *                 type: string
 *                 description: Descripción detallada
 *                 example: "Concurso dedicado a la fotografía urbana y arquitectónica"
 *               reglas:
 *                 type: string
 *                 description: Reglas y términos del concurso
 *               fecha_inicio:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha de inicio
 *                 example: "2024-03-01T00:00:00Z"
 *               fecha_final:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha de finalización
 *                 example: "2024-03-31T23:59:59Z"
 *               imagen_url:
 *                 type: string
 *                 format: uri
 *                 description: URL de imagen del concurso
 *               max_envios:
 *                 type: integer
 *                 default: 3
 *                 description: Máximo envíos por participante
 *               tamaño_max_mb:
 *                 type: integer
 *                 default: 10
 *                 description: Tamaño máximo de archivo en MB
 *     responses:
 *       201:
 *         description: Concurso creado exitosamente
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
 *                   example: "Concurso creado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Concurso'
 *       403:
 *         description: Acceso denegado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', requireRole(['ADMIN']), concursoController.getConcursos);
router.post('/', requireRole(['ADMIN']), concursoController.createConcurso);

/**
 * @swagger
 * /concursos/{id}:
 *   put:
 *     tags: [Concursos]
 *     summary: Actualizar concurso (Admin)
 *     description: Permite a un administrador actualizar un concurso existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del concurso a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               reglas:
 *                 type: string
 *               fecha_inicio:
 *                 type: string
 *                 format: date-time
 *               fecha_final:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [Próximamente, Activo, Calificación, Finalizado]
 *               imagen_url:
 *                 type: string
 *                 format: uri
 *               max_envios:
 *                 type: integer
 *               tamaño_max_mb:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Concurso actualizado exitosamente
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
 *                   example: "Concurso actualizado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Concurso'
 *       404:
 *         description: Concurso no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Acceso denegado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     tags: [Concursos]
 *     summary: Eliminar concurso (Admin)
 *     description: Permite a un administrador eliminar un concurso
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del concurso a eliminar
 *     responses:
 *       200:
 *         description: Concurso eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Concurso no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Acceso denegado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', requireRole(['ADMIN']), concursoController.updateConcurso);
router.delete('/:id', requireRole(['ADMIN']), concursoController.deleteConcurso);

export default router;