import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { interactionsService } from '../services/interactions.service';
import {
    LikeContentSchema,
    UnlikeContentSchema,
    CreateCommentSchema,
    UpdateCommentSchema,
    CommentFiltersSchema,
    CreateReportSchema,
    ReportFiltersSchema,
    ModerateCommentSchema,
    ResolveReportSchema,
    BulkModerationSchema,
    InteractionStatsFiltersSchema
} from '../schemas/interactions.schemas';

/**
 * Controlador para gestionar interacciones unificadas del sistema
 * Maneja likes, comentarios, reportes y moderación de forma centralizada
 */
export class InteractionsController {

    // ============================================================================
    // ENDPOINTS PARA LIKES UNIFICADOS
    // ============================================================================

    /**
     * POST /api/interactions/like
     * Dar like a cualquier tipo de contenido
     */
    async likeContent(req: AuthenticatedRequest, res: Response) {
        try {
            const validatedData = LikeContentSchema.parse(req.body);
            const userId = req.user!.id;

            const like = await interactionsService.likeContent(validatedData, userId);

            return res.status(201).json({
                success: true,
                message: 'Like agregado exitosamente',
                data: like
            });
        } catch (error: any) {
            console.error('Error en likeContent:', error);
            
            if (error.message === 'Ya has dado like a este contenido') {
                return res.status(409).json({
                    success: false,
                    message: error.message
                });
            }

            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env['NODE_ENV'] === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * DELETE /api/interactions/like
     * Quitar like de cualquier tipo de contenido
     */
    async unlikeContent(req: AuthenticatedRequest, res: Response) {
        try {
            const validatedData = UnlikeContentSchema.parse(req.body);
            const userId = req.user!.id;

            const result = await interactionsService.unlikeContent(validatedData, userId);

            return res.json({
                success: true,
                message: result.message
            });
        } catch (error: any) {
            console.error('Error en unlikeContent:', error);
            
            if (error.message === 'No has dado like a este contenido') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env['NODE_ENV'] === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * GET /api/interactions/likes/:contenidoId/:tipoContenido
     * Obtener likes de un contenido específico
     */
    async getContentLikes(req: AuthenticatedRequest, res: Response) {
        try {
            const contenidoIdParam = req.params['contenidoId'];
            const tipoContenido = req.params['tipoContenido'];
            
            if (!contenidoIdParam || !tipoContenido) {
                return res.status(400).json({
                    success: false,
                    message: 'Parámetros requeridos faltantes'
                });
            }

            const contenidoId = parseInt(contenidoIdParam);
            const page = parseInt((req.query['page'] as string) || '1');
            const limit = parseInt((req.query['limit'] as string) || '10');

            if (isNaN(contenidoId) || contenidoId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de contenido inválido'
                });
            }

            const likes = await interactionsService.getContentLikes(contenidoId, tipoContenido, page, limit);

            return res.json({
                success: true,
                data: likes
            });
        } catch (error: any) {
            console.error('Error en getContentLikes:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env['NODE_ENV'] === 'development' ? error.message : undefined
            });
        }
    }

    // ============================================================================
    // ENDPOINTS PARA COMENTARIOS UNIVERSALES
    // ============================================================================

    /**
     * POST /api/interactions/comments
     * Crear comentario en cualquier tipo de contenido
     */
    async createComment(req: AuthenticatedRequest, res: Response) {
        try {
            const validatedData = CreateCommentSchema.parse(req.body);
            const userId = req.user!.id;

            const comentario = await interactionsService.createComment(validatedData, userId);

            return res.status(201).json({
                success: true,
                message: 'Comentario creado exitosamente. Pendiente de moderación.',
                data: comentario
            });
        } catch (error: any) {
            console.error('Error en createComment:', error);
            
            if (error.message.includes('no encontrado')) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            if (error.message.includes('no pertenece')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env['NODE_ENV'] === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * GET /api/interactions/comments
     * Obtener comentarios con filtros y paginación
     */
    async getComments(req: AuthenticatedRequest, res: Response) {
        try {
            const filters = CommentFiltersSchema.parse({
                ...req.query,
                contenido_id: req.query['contenido_id'] ? parseInt(req.query['contenido_id'] as string) : undefined,
                parent_id: req.query['parent_id'] ? parseInt(req.query['parent_id'] as string) : undefined,
                page: req.query['page'] ? parseInt(req.query['page'] as string) : 1,
                limit: req.query['limit'] ? parseInt(req.query['limit'] as string) : 10,
                aprobado: req.query['aprobado'] ? req.query['aprobado'] === 'true' : undefined,
                reportado: req.query['reportado'] ? req.query['reportado'] === 'true' : undefined
            });

            const comentarios = await interactionsService.getComments(filters);

            return res.json({
                success: true,
                data: comentarios
            });
        } catch (error: any) {
            console.error('Error en getComments:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env['NODE_ENV'] === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * PUT /api/interactions/comments/:commentId
     * Actualizar comentario (solo el autor)
     */
    async updateComment(req: AuthenticatedRequest, res: Response) {
        try {
            const commentIdParam = req.params['commentId'];
            
            if (!commentIdParam) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de comentario requerido'
                });
            }

            const commentId = parseInt(commentIdParam);
            const validatedData = UpdateCommentSchema.parse(req.body);
            const userId = req.user!.id;

            if (isNaN(commentId) || commentId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de comentario inválido'
                });
            }

            const comentario = await interactionsService.updateComment(commentId, validatedData, userId);

            return res.json({
                success: true,
                message: 'Comentario actualizado exitosamente. Pendiente de nueva moderación.',
                data: comentario
            });
        } catch (error: any) {
            console.error('Error en updateComment:', error);
            
            if (error.message === 'Comentario no encontrado') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            if (error.message === 'No tienes permisos para editar este comentario') {
                return res.status(403).json({
                    success: false,
                    message: error.message
                });
            }

            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env['NODE_ENV'] === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * DELETE /api/interactions/comments/:commentId
     * Eliminar comentario (autor o admin)
     */
    async deleteComment(req: AuthenticatedRequest, res: Response) {
        try {
            const commentIdParam = req.params['commentId'];
            
            if (!commentIdParam) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de comentario requerido'
                });
            }

            const commentId = parseInt(commentIdParam);
            const userId = req.user!.id;
            const isAdmin = req.user!.role === 'ADMIN' || req.user!.role === 'CONTENT_ADMIN';

            if (isNaN(commentId) || commentId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de comentario inválido'
                });
            }

            const result = await interactionsService.deleteComment(commentId, userId, isAdmin);

            return res.json({
                success: true,
                message: result.message
            });
        } catch (error: any) {
            console.error('Error en deleteComment:', error);
            
            if (error.message === 'Comentario no encontrado') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            if (error.message === 'No tienes permisos para eliminar este comentario') {
                return res.status(403).json({
                    success: false,
                    message: error.message
                });
            }

            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env['NODE_ENV'] === 'development' ? error.message : undefined
            });
        }
    }

    // ============================================================================
    // ENDPOINTS PARA REPORTES UNIFICADOS
    // ============================================================================

    /**
     * POST /api/interactions/reports
     * Crear reporte de contenido o comentario
     */
    async createReport(req: AuthenticatedRequest, res: Response) {
        try {
            const validatedData = CreateReportSchema.parse(req.body);
            const userId = req.user!.id;

            const reporte = await interactionsService.createReport(validatedData, userId);

            return res.status(201).json({
                success: true,
                message: 'Reporte creado exitosamente',
                data: reporte
            });
        } catch (error: any) {
            console.error('Error en createReport:', error);
            
            if (error.message.includes('no encontrado')) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            if (error.message === 'Ya has reportado este elemento') {
                return res.status(409).json({
                    success: false,
                    message: error.message
                });
            }

            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env['NODE_ENV'] === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * GET /api/interactions/reports
     * Obtener reportes con filtros (solo moderadores)
     */
    async getReports(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user!.id;
            const isModerator = await interactionsService.validateModeratorAccess(userId);

            if (!isModerator) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para acceder a los reportes'
                });
            }

            const filters = ReportFiltersSchema.parse({
                ...req.query,
                page: req.query['page'] ? parseInt(req.query['page'] as string) : 1,
                limit: req.query['limit'] ? parseInt(req.query['limit'] as string) : 10
            });

            const reportes = await interactionsService.getReports(filters);

            return res.json({
                success: true,
                data: reportes
            });
        } catch (error: any) {
            console.error('Error en getReports:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env['NODE_ENV'] === 'development' ? error.message : undefined
            });
        }
    }

    // ============================================================================
    // ENDPOINTS PARA MODERACIÓN CENTRALIZADA
    // ============================================================================

    /**
     * PUT /api/interactions/moderate/comment/:commentId
     * Moderar comentario individual (solo moderadores)
     */
    async moderateComment(req: AuthenticatedRequest, res: Response) {
        try {
            const commentIdParam = req.params['commentId'];
            
            if (!commentIdParam) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de comentario requerido'
                });
            }

            const commentId = parseInt(commentIdParam);
            const validatedData = ModerateCommentSchema.parse(req.body);
            const userId = req.user!.id;

            if (isNaN(commentId) || commentId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de comentario inválido'
                });
            }

            const isModerator = await interactionsService.validateModeratorAccess(userId);
            if (!isModerator) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para moderar comentarios'
                });
            }

            const comentario = await interactionsService.moderateComment(commentId, validatedData, userId);

            return res.json({
                success: true,
                message: `Comentario ${validatedData.aprobado ? 'aprobado' : 'rechazado'} exitosamente`,
                data: comentario
            });
        } catch (error: any) {
            console.error('Error en moderateComment:', error);
            
            if (error.message === 'Comentario no encontrado') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env['NODE_ENV'] === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * PUT /api/interactions/moderate/bulk
     * Moderación masiva de comentarios (solo moderadores)
     */
    async bulkModerateComments(req: AuthenticatedRequest, res: Response) {
        try {
            const validatedData = BulkModerationSchema.parse(req.body);
            const userId = req.user!.id;

            const isModerator = await interactionsService.validateModeratorAccess(userId);
            if (!isModerator) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para moderar comentarios'
                });
            }

            const result = await interactionsService.bulkModerateComments(validatedData, userId);

            return res.json({
                success: true,
                message: result.message,
                data: { affected: result.affected }
            });
        } catch (error: any) {
            console.error('Error en bulkModerateComments:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env['NODE_ENV'] === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * PUT /api/interactions/reports/:reportId/resolve
     * Resolver reporte (solo moderadores)
     */
    async resolveReport(req: AuthenticatedRequest, res: Response) {
        try {
            const reportIdParam = req.params['reportId'];
            
            if (!reportIdParam) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de reporte requerido'
                });
            }

            const reportId = parseInt(reportIdParam);
            const validatedData = ResolveReportSchema.parse(req.body);
            const userId = req.user!.id;

            if (isNaN(reportId) || reportId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de reporte inválido'
                });
            }

            const isModerator = await interactionsService.validateModeratorAccess(userId);
            if (!isModerator) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para resolver reportes'
                });
            }

            const reporte = await interactionsService.resolveReport(reportId, validatedData, userId);

            return res.json({
                success: true,
                message: 'Reporte resuelto exitosamente',
                data: reporte
            });
        } catch (error: any) {
            console.error('Error en resolveReport:', error);
            
            if (error.message === 'Reporte no encontrado') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env['NODE_ENV'] === 'development' ? error.message : undefined
            });
        }
    }

    // ============================================================================
    // ENDPOINTS PARA ESTADÍSTICAS
    // ============================================================================

    /**
     * GET /api/interactions/stats
     * Obtener estadísticas de interacciones (solo moderadores)
     */
    async getInteractionStats(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user!.id;
            const isModerator = await interactionsService.validateModeratorAccess(userId);

            if (!isModerator) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para acceder a las estadísticas'
                });
            }

            const filters = InteractionStatsFiltersSchema.parse({
                ...req.query,
                incluir_comentarios: req.query['incluir_comentarios'] === 'true',
                incluir_likes: req.query['incluir_likes'] === 'true',
                incluir_reportes: req.query['incluir_reportes'] === 'true'
            });

            const stats = await interactionsService.getInteractionStats(filters);

            return res.json({
                success: true,
                data: stats
            });
        } catch (error: any) {
            console.error('Error en getInteractionStats:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env['NODE_ENV'] === 'development' ? error.message : undefined
            });
        }
    }
}

export const interactionsController = new InteractionsController();