import { Router } from 'express';
import { juradoAsignacionController } from '../controllers/jurado-asignacion.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Asignación de Jurados
 *   description: Sistema de asignación inteligente de jurados a categorías y concursos
 */

// Todas las rutas requieren autenticación
router.use(authenticateToken);

/**
 * @swagger
 * /jurado-asignacion:
 *   post:
 *     tags: [Asignación de Jurados]
 *     summary: Crear asignación de jurado (Admin)
 *     description: Asigna un jurado a una categoría específica
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuarioId
 *               - categoriaId
 *             properties:
 *               usuarioId:
 *                 type: string
 *                 description: ID del usuario jurado
 *                 example: "user_123"
 *               categoriaId:
 *                 type: integer
 *                 description: ID de la categoría
 *                 example: 1
 *               especialidad:
 *                 type: string
 *                 description: Especialidad del jurado en esta categoría
 *                 example: "Fotografía de paisaje"
 *               nivel_experiencia:
 *                 type: string
 *                 enum: [principiante, intermedio, avanzado, experto]
 *                 description: Nivel de experiencia
 *                 example: "experto"
 *     responses:
 *       201:
 *         description: Asignación creada exitosamente
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
 *       409:
 *         description: El jurado ya está asignado a esta categoría
 *   get:
 *     tags: [Asignación de Jurados]
 *     summary: Obtener todas las asignaciones (Admin)
 *     description: Obtiene todas las asignaciones de jurados con filtros
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
 *         name: usuarioId
 *         schema:
 *           type: string
 *         description: Filtrar por jurado
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
 *                       usuario_id: { type: string }
 *                       categoria_id: { type: integer }
 *                       especialidad: { type: string }
 *                       nivel_experiencia: { type: string }
 *                       fecha_asignacion: { type: string, format: date-time }
 *                       usuario:
 *                         type: object
 *                         properties:
 *                           nombre: { type: string }
 *                           email: { type: string }
 *                       categoria:
 *                         type: object
 *                         properties:
 *                           nombre: { type: string }
 *                           tipo_medio: { type: string }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/',
  requireRole(['ADMIN']),
  juradoAsignacionController.createAsignacion.bind(juradoAsignacionController)
);

router.get('/',
  requireRole(['ADMIN']),
  juradoAsignacionController.getAsignaciones.bind(juradoAsignacionController)
);

/**
 * @swagger
 * /jurado-asignacion/{usuarioId}/{categoriaId}:
 *   delete:
 *     tags: [Asignación de Jurados]
 *     summary: Eliminar asignación (Admin)
 *     description: Elimina la asignación de un jurado a una categoría
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario jurado
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
 *         description: Asignación eliminada exitosamente
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
router.delete('/:usuarioId/:categoriaId',
  requireRole(['ADMIN']),
  juradoAsignacionController.deleteAsignacion.bind(juradoAsignacionController)
);

/**
 * @swagger
 * /jurado-asignacion/jurado/{usuarioId}:
 *   get:
 *     tags: [Asignación de Jurados]
 *     summary: Obtener asignaciones de un jurado
 *     description: Obtiene todas las asignaciones de un jurado específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario jurado
 *         example: "user_123"
 *     responses:
 *       200:
 *         description: Asignaciones del jurado
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
 *                       especialidad: { type: string }
 *                       nivel_experiencia: { type: string }
 *                       categoria:
 *                         type: object
 *                         properties:
 *                           nombre: { type: string }
 *                           tipo_medio: { type: string }
 *                           concurso:
 *                             type: object
 *                             properties:
 *                               titulo: { type: string }
 *                               status: { type: string }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/jurado/:usuarioId',
  requireRole(['ADMIN', 'JURADO']),
  juradoAsignacionController.getAsignacionesJurado.bind(juradoAsignacionController)
);

/**
 * @swagger
 * /jurado-asignacion/categoria/{categoriaId}:
 *   get:
 *     tags: [Asignación de Jurados]
 *     summary: Obtener jurados de una categoría
 *     description: Obtiene todos los jurados asignados a una categoría específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoriaId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la categoría
 *         example: 1
 *     responses:
 *       200:
 *         description: Jurados de la categoría
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
 *                       usuario_id: { type: string }
 *                       especialidad: { type: string }
 *                       nivel_experiencia: { type: string }
 *                       usuario:
 *                         type: object
 *                         properties:
 *                           nombre: { type: string }
 *                           email: { type: string }
 *                           bio: { type: string }
 *                           picture_url: { type: string }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/categoria/:categoriaId',
  requireRole(['ADMIN', 'JURADO']),
  juradoAsignacionController.getJuradosCategoria.bind(juradoAsignacionController)
);

/**
 * @swagger
 * /jurado-asignacion/concurso/{concursoId}:
 *   get:
 *     tags: [Asignación de Jurados]
 *     summary: Obtener jurados de un concurso
 *     description: Obtiene todos los jurados asignados a las categorías de un concurso
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
 *         description: Jurados del concurso agrupados por categoría
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
 *                     categorias:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           categoria_id: { type: integer }
 *                           categoria_nombre: { type: string }
 *                           jurados:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 usuario_id: { type: string }
 *                                 nombre: { type: string }
 *                                 especialidad: { type: string }
 *                                 nivel_experiencia: { type: string }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/concurso/:concursoId',
  requireRole(['ADMIN', 'JURADO']),
  juradoAsignacionController.getJuradosConcurso.bind(juradoAsignacionController)
);

/**
 * @swagger
 * /jurado-asignacion/sugerencias/{concursoId}:
 *   get:
 *     tags: [Asignación de Jurados]
 *     summary: Obtener sugerencias inteligentes (Admin)
 *     description: Obtiene sugerencias de asignación basadas en especialidades y experiencia
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
 *         name: min_jurados_por_categoria
 *         schema:
 *           type: integer
 *           default: 3
 *         description: Mínimo de jurados por categoría
 *     responses:
 *       200:
 *         description: Sugerencias de asignación
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
 *                     sugerencias:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           categoria_id: { type: integer }
 *                           categoria_nombre: { type: string }
 *                           jurados_sugeridos:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 usuario_id: { type: string }
 *                                 nombre: { type: string }
 *                                 puntuacion_compatibilidad: { type: number }
 *                                 razon: { type: string }
 *                     estadisticas:
 *                       type: object
 *                       properties:
 *                         total_categorias: { type: integer }
 *                         categorias_cubiertas: { type: integer }
 *                         jurados_disponibles: { type: integer }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/sugerencias/:concursoId',
  requireRole(['ADMIN']),
  juradoAsignacionController.getSugerenciasInteligentes.bind(juradoAsignacionController)
);

/**
 * @swagger
 * /jurado-asignacion/asignar-automaticamente/{concursoId}:
 *   post:
 *     tags: [Asignación de Jurados]
 *     summary: Asignación automática (Admin)
 *     description: Realiza asignación automática de jurados basada en algoritmo inteligente
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
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               min_jurados_por_categoria:
 *                 type: integer
 *                 default: 3
 *                 description: Mínimo de jurados por categoría
 *               max_jurados_por_categoria:
 *                 type: integer
 *                 default: 5
 *                 description: Máximo de jurados por categoría
 *               priorizar_experiencia:
 *                 type: boolean
 *                 default: true
 *                 description: Priorizar jurados con más experiencia
 *               balancear_carga:
 *                 type: boolean
 *                 default: true
 *                 description: Balancear carga entre jurados
 *     responses:
 *       200:
 *         description: Asignación automática completada
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
 *                     asignaciones_creadas: { type: integer }
 *                     categorias_cubiertas: { type: integer }
 *                     total_categorias: { type: integer }
 *                     detalles:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           categoria_id: { type: integer }
 *                           categoria_nombre: { type: string }
 *                           jurados_asignados: { type: integer }
 *                           jurados: { type: array, items: { type: string } }
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post('/asignar-automaticamente/:concursoId',
  requireRole(['ADMIN']),
  juradoAsignacionController.asignarAutomaticamente.bind(juradoAsignacionController)
);

/**
 * @swagger
 * /jurado-asignacion/cobertura/{concursoId}:
 *   get:
 *     tags: [Asignación de Jurados]
 *     summary: Validar cobertura de jurados (Admin)
 *     description: Valida si todas las categorías tienen suficientes jurados asignados
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
 *         description: Reporte de cobertura de jurados
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
 *                     cobertura_completa:
 *                       type: boolean
 *                       description: Si todas las categorías tienen cobertura mínima
 *                     total_categorias: { type: integer }
 *                     categorias_cubiertas: { type: integer }
 *                     categorias_sin_cobertura: { type: integer }
 *                     detalles_por_categoria:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           categoria_id: { type: integer }
 *                           categoria_nombre: { type: string }
 *                           jurados_asignados: { type: integer }
 *                           jurados_minimos: { type: integer }
 *                           tiene_cobertura: { type: boolean }
 *                           faltantes: { type: integer }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/cobertura/:concursoId',
  requireRole(['ADMIN']),
  juradoAsignacionController.validarCobertura.bind(juradoAsignacionController)
);

/**
 * @swagger
 * /jurado-asignacion/estadisticas:
 *   get:
 *     tags: [Asignación de Jurados]
 *     summary: Obtener estadísticas generales (Admin)
 *     description: Obtiene estadísticas generales del sistema de asignación de jurados
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas del sistema de asignación
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
 *                     total_jurados: { type: integer }
 *                     total_asignaciones: { type: integer }
 *                     jurados_activos: { type: integer }
 *                     promedio_asignaciones_por_jurado: { type: number }
 *                     distribucion_por_experiencia:
 *                       type: object
 *                       properties:
 *                         principiante: { type: integer }
 *                         intermedio: { type: integer }
 *                         avanzado: { type: integer }
 *                         experto: { type: integer }
 *                     concursos_activos_con_jurados: { type: integer }
 *                     categorias_sin_cobertura: { type: integer }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/estadisticas',
  requireRole(['ADMIN']),
  juradoAsignacionController.getEstadisticas.bind(juradoAsignacionController)
);

export default router;