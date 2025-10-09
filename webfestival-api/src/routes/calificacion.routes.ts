import { Router } from 'express';
import { calificacionController } from '../controllers/calificacion.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Calificaciones
 *   description: Sistema de evaluación y calificación de medios por jurados
 */

// Todas las rutas requieren autenticación
router.use(authenticateToken);

/**
 * @swagger
 * /calificaciones/mis-asignaciones:
 *   get:
 *     tags: [Calificaciones]
 *     summary: Obtener mis asignaciones (Jurado)
 *     description: Obtiene los medios asignados al jurado para evaluación
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: concursoId
 *         schema:
 *           type: integer
 *         description: Filtrar por concurso específico
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [pendiente, evaluado, parcial]
 *         description: Estado de evaluación
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
 *         description: Lista de medios asignados para evaluación
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
 *                       medio_id: { type: integer }
 *                       titulo: { type: string }
 *                       tipo_medio: { type: string }
 *                       categoria: { type: string }
 *                       concurso: { type: string }
 *                       participante: { type: string }
 *                       fecha_subida: { type: string, format: date-time }
 *                       estado_evaluacion: { type: string }
 *                       calificacion_existente:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id: { type: integer }
 *                           puntuacion_total: { type: number }
 *                           fecha_calificacion: { type: string, format: date-time }
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page: { type: integer }
 *                     limit: { type: integer }
 *                     total: { type: integer }
 *                     totalPages: { type: integer }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/mis-asignaciones', 
  requireRole(['JURADO']), 
  calificacionController.getMisAsignaciones.bind(calificacionController)
);

/**
 * @swagger
 * /calificaciones:
 *   post:
 *     tags: [Calificaciones]
 *     summary: Crear calificación (Jurado)
 *     description: Crea una nueva calificación para un medio asignado
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - medio_id
 *               - calificaciones_criterios
 *             properties:
 *               medio_id:
 *                 type: integer
 *                 description: ID del medio a calificar
 *                 example: 1
 *               calificaciones_criterios:
 *                 type: array
 *                 description: Calificaciones por criterio
 *                 items:
 *                   type: object
 *                   required:
 *                     - criterio_id
 *                     - puntuacion
 *                   properties:
 *                     criterio_id:
 *                       type: integer
 *                       description: ID del criterio
 *                       example: 1
 *                     puntuacion:
 *                       type: number
 *                       minimum: 0
 *                       maximum: 10
 *                       description: Puntuación del criterio (0-10)
 *                       example: 8.5
 *                     comentario:
 *                       type: string
 *                       maxLength: 500
 *                       description: Comentario específico del criterio
 *                       example: "Excelente composición y uso de la luz"
 *               comentario_general:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Comentario general sobre el medio
 *                 example: "Una fotografía excepcional que demuestra gran técnica"
 *     responses:
 *       201:
 *         description: Calificación creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Calificacion'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Medio no encontrado o no asignado al jurado
 *       409:
 *         description: El medio ya ha sido calificado por este jurado
 */
router.post('/', 
  requireRole(['JURADO']), 
  calificacionController.createCalificacion.bind(calificacionController)
);

/**
 * @swagger
 * /calificaciones/{id}:
 *   put:
 *     tags: [Calificaciones]
 *     summary: Actualizar calificación (Jurado)
 *     description: Actualiza una calificación existente (solo el jurado que la creó)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la calificación
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               calificaciones_criterios:
 *                 type: array
 *                 description: Calificaciones por criterio
 *                 items:
 *                   type: object
 *                   required:
 *                     - criterio_id
 *                     - puntuacion
 *                   properties:
 *                     criterio_id: { type: integer }
 *                     puntuacion: { type: number, minimum: 0, maximum: 10 }
 *                     comentario: { type: string, maxLength: 500 }
 *               comentario_general:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Comentario general actualizado
 *     responses:
 *       200:
 *         description: Calificación actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Calificacion'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Solo el jurado que creó la calificación puede actualizarla
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     tags: [Calificaciones]
 *     summary: Eliminar calificación (Jurado)
 *     description: Elimina una calificación (solo el jurado que la creó)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la calificación
 *         example: 1
 *     responses:
 *       200:
 *         description: Calificación eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Solo el jurado que creó la calificación puede eliminarla
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put('/:id', 
  requireRole(['JURADO']), 
  calificacionController.updateCalificacion.bind(calificacionController)
);

router.delete('/:id', 
  requireRole(['JURADO']), 
  calificacionController.deleteCalificacion.bind(calificacionController)
);

/**
 * @swagger
 * /calificaciones/criterios/{tipoMedio}:
 *   get:
 *     tags: [Calificaciones]
 *     summary: Obtener criterios por tipo de medio
 *     description: Obtiene los criterios de evaluación para un tipo de medio específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tipoMedio
 *         required: true
 *         schema:
 *           type: string
 *           enum: [fotografia, video, audio, corto_cine, universal]
 *         description: Tipo de medio
 *         example: "fotografia"
 *     responses:
 *       200:
 *         description: Lista de criterios para el tipo de medio
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
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       400:
 *         description: Tipo de medio no válido
 */
router.get('/criterios/:tipoMedio', 
  calificacionController.getCriteriosParaTipo.bind(calificacionController)
);

/**
 * @swagger
 * /calificaciones:
 *   get:
 *     tags: [Calificaciones]
 *     summary: Obtener calificaciones (Admin/Jurado)
 *     description: Obtiene calificaciones con filtros (Admin ve todas, Jurado ve las suyas)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: concursoId
 *         schema:
 *           type: integer
 *         description: Filtrar por concurso
 *       - in: query
 *         name: categoriaId
 *         schema:
 *           type: integer
 *         description: Filtrar por categoría
 *       - in: query
 *         name: medioId
 *         schema:
 *           type: integer
 *         description: Filtrar por medio específico
 *       - in: query
 *         name: juradoId
 *         schema:
 *           type: string
 *         description: Filtrar por jurado (solo Admin)
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
 *         description: Lista de calificaciones
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
 *                     $ref: '#/components/schemas/Calificacion'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page: { type: integer }
 *                     limit: { type: integer }
 *                     total: { type: integer }
 *                     totalPages: { type: integer }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/', 
  requireRole(['ADMIN', 'JURADO']), 
  calificacionController.getCalificaciones.bind(calificacionController)
);

/**
 * @swagger
 * /calificaciones/{id}:
 *   get:
 *     tags: [Calificaciones]
 *     summary: Obtener calificación específica (Admin/Jurado)
 *     description: Obtiene una calificación específica por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la calificación
 *         example: 1
 *     responses:
 *       200:
 *         description: Detalles de la calificación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Calificacion'
 *                     - type: object
 *                       properties:
 *                         calificaciones_criterios:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               criterio_id: { type: integer }
 *                               criterio_nombre: { type: string }
 *                               puntuacion: { type: number }
 *                               comentario: { type: string, nullable: true }
 *                               peso: { type: number }
 *                         medio:
 *                           type: object
 *                           properties:
 *                             id: { type: integer }
 *                             titulo: { type: string }
 *                             tipo_medio: { type: string }
 *                             participante: { type: string }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Sin permisos para ver esta calificación
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', 
  requireRole(['ADMIN', 'JURADO']), 
  calificacionController.getCalificacionById.bind(calificacionController)
);

/**
 * @swagger
 * /calificaciones/progreso/{concursoId}:
 *   get:
 *     tags: [Calificaciones]
 *     summary: Obtener progreso de evaluación (Admin)
 *     description: Obtiene el progreso de evaluación de un concurso específico
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
 *         description: Progreso de evaluación del concurso
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
 *                     concurso:
 *                       type: object
 *                       properties:
 *                         id: { type: integer }
 *                         titulo: { type: string }
 *                         status: { type: string }
 *                     progreso_general:
 *                       type: object
 *                       properties:
 *                         total_medios: { type: integer }
 *                         medios_evaluados: { type: integer }
 *                         porcentaje_completado: { type: number }
 *                         jurados_asignados: { type: integer }
 *                         calificaciones_totales: { type: integer }
 *                     progreso_por_categoria:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           categoria_id: { type: integer }
 *                           categoria_nombre: { type: string }
 *                           total_medios: { type: integer }
 *                           medios_evaluados: { type: integer }
 *                           porcentaje_completado: { type: number }
 *                           jurados_asignados: { type: integer }
 *                     progreso_por_jurado:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           jurado_id: { type: string }
 *                           jurado_nombre: { type: string }
 *                           medios_asignados: { type: integer }
 *                           medios_evaluados: { type: integer }
 *                           porcentaje_completado: { type: number }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/progreso/:concursoId', 
  requireRole(['ADMIN']), 
  calificacionController.getProgresoEvaluacion.bind(calificacionController)
);

/**
 * @swagger
 * /calificaciones/resultados/{concursoId}:
 *   get:
 *     tags: [Calificaciones]
 *     summary: Obtener resultados finales (Admin)
 *     description: Obtiene los resultados finales y rankings de un concurso
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
 *       - in: query
 *         name: categoriaId
 *         schema:
 *           type: integer
 *         description: Filtrar por categoría específica
 *       - in: query
 *         name: top
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número de ganadores por categoría
 *     responses:
 *       200:
 *         description: Resultados finales del concurso
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
 *                     concurso:
 *                       type: object
 *                       properties:
 *                         id: { type: integer }
 *                         titulo: { type: string }
 *                         status: { type: string }
 *                     resultados_por_categoria:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           categoria_id: { type: integer }
 *                           categoria_nombre: { type: string }
 *                           ganadores:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 posicion: { type: integer }
 *                                 medio_id: { type: integer }
 *                                 titulo: { type: string }
 *                                 participante: { type: string }
 *                                 puntuacion_promedio: { type: number }
 *                                 total_calificaciones: { type: integer }
 *                                 desviacion_estandar: { type: number }
 *                     estadisticas_generales:
 *                       type: object
 *                       properties:
 *                         total_participantes: { type: integer }
 *                         total_medios: { type: integer }
 *                         promedio_general: { type: number }
 *                         medios_descalificados: { type: integer }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/resultados/:concursoId', 
  requireRole(['ADMIN']), 
  calificacionController.getResultadosFinales.bind(calificacionController)
);

/**
 * @swagger
 * /calificaciones/estadisticas:
 *   get:
 *     tags: [Calificaciones]
 *     summary: Obtener estadísticas generales (Admin)
 *     description: Obtiene estadísticas generales del sistema de calificaciones
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas del sistema de calificaciones
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
 *                     total_calificaciones: { type: integer }
 *                     calificaciones_mes_actual: { type: integer }
 *                     promedio_puntuacion_general: { type: number }
 *                     jurados_activos: { type: integer }
 *                     concursos_en_evaluacion: { type: integer }
 *                     distribucion_puntuaciones:
 *                       type: object
 *                       properties:
 *                         "0-2": { type: integer }
 *                         "2-4": { type: integer }
 *                         "4-6": { type: integer }
 *                         "6-8": { type: integer }
 *                         "8-10": { type: integer }
 *                     tiempo_promedio_evaluacion:
 *                       type: object
 *                       properties:
 *                         dias: { type: number }
 *                         horas: { type: number }
 *                     criterios_mas_utilizados:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           criterio_nombre: { type: string }
 *                           total_usos: { type: integer }
 *                           promedio_puntuacion: { type: number }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/estadisticas', 
  requireRole(['ADMIN']), 
  calificacionController.getEstadisticas.bind(calificacionController)
);

export default router;