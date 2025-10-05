import { PrismaClient } from '@prisma/client';
import {
    LikeContentData,
    UnlikeContentData,
    CreateCommentData,
    UpdateCommentData,
    CommentFilters,
    CreateReportData,
    ReportFilters,
    ModerateCommentData,
    ResolveReportData,
    BulkModerationData,
    InteractionStatsFilters
} from '../schemas/interactions.schemas';

const prisma = new PrismaClient();

/**
 * Servicio para gestionar interacciones unificadas del sistema CMS
 * Maneja likes, comentarios, reportes y moderación de forma centralizada
 */
export class InteractionsService {

    // ============================================================================
    // GESTIÓN DE LIKES UNIFICADOS
    // ============================================================================

    /**
     * Dar like a cualquier tipo de contenido
     */
    async likeContent(data: LikeContentData, userId: string) {
        try {
            // Verificar si ya existe el like
            const existingLike = await prisma.contenidoLike.findUnique({
                where: {
                    contenido_id_tipo_contenido_usuario_id: {
                        contenido_id: data.contenido_id,
                        tipo_contenido: data.tipo_contenido,
                        usuario_id: userId
                    }
                }
            });

            if (existingLike) {
                throw new Error('Ya has dado like a este contenido');
            }

            // Crear el like
            const like = await prisma.contenidoLike.create({
                data: {
                    contenido_id: data.contenido_id,
                    tipo_contenido: data.tipo_contenido,
                    usuario_id: userId
                },
                include: {
                    usuario: {
                        select: {
                            id: true,
                            nombre: true,
                            picture_url: true
                        }
                    }
                }
            });

            // Actualizar contador de likes en métricas si es contenido CMS
            if (data.tipo_contenido === 'contenido') {
                await this.updateContentLikesCount(data.contenido_id, 1);
            }

            return like;
        } catch (error) {
            console.error('Error al dar like:', error);
            throw error;
        }
    }

    /**
     * Quitar like de cualquier tipo de contenido
     */
    async unlikeContent(data: UnlikeContentData, userId: string) {
        try {
            // Verificar si existe el like
            const existingLike = await prisma.contenidoLike.findUnique({
                where: {
                    contenido_id_tipo_contenido_usuario_id: {
                        contenido_id: data.contenido_id,
                        tipo_contenido: data.tipo_contenido,
                        usuario_id: userId
                    }
                }
            });

            if (!existingLike) {
                throw new Error('No has dado like a este contenido');
            }

            // Eliminar el like
            await prisma.contenidoLike.delete({
                where: {
                    id: existingLike.id
                }
            });

            // Actualizar contador de likes en métricas si es contenido CMS
            if (data.tipo_contenido === 'contenido') {
                await this.updateContentLikesCount(data.contenido_id, -1);
            }

            return { success: true, message: 'Like eliminado exitosamente' };
        } catch (error) {
            console.error('Error al quitar like:', error);
            throw error;
        }
    }

    /**
     * Obtener likes de un contenido específico
     */
    async getContentLikes(contenidoId: number, tipoContenido: string, page: number = 1, limit: number = 10) {
        try {
            const offset = (page - 1) * limit;

            const [likes, total] = await Promise.all([
                prisma.contenidoLike.findMany({
                    where: {
                        contenido_id: contenidoId,
                        tipo_contenido: tipoContenido
                    },
                    include: {
                        usuario: {
                            select: {
                                id: true,
                                nombre: true,
                                picture_url: true
                            }
                        }
                    },
                    orderBy: {
                        fecha_like: 'desc'
                    },
                    skip: offset,
                    take: limit
                }),
                prisma.contenidoLike.count({
                    where: {
                        contenido_id: contenidoId,
                        tipo_contenido: tipoContenido
                    }
                })
            ]);

            return {
                likes,
                total,
                page,
                totalPages: Math.ceil(total / limit)
            };
        } catch (error) {
            console.error('Error al obtener likes:', error);
            throw error;
        }
    }

    // ============================================================================
    // GESTIÓN DE COMENTARIOS UNIVERSALES
    // ============================================================================

    /**
     * Crear comentario en cualquier tipo de contenido
     */
    async createComment(data: CreateCommentData, userId: string) {
        try {
            // Verificar si el comentario padre existe (si se especifica)
            if (data.parent_id) {
                const parentComment = await prisma.contenidoComentario.findUnique({
                    where: { id: data.parent_id }
                });

                if (!parentComment) {
                    throw new Error('Comentario padre no encontrado');
                }

                // Verificar que el comentario padre sea del mismo contenido
                if (parentComment.contenido_id !== data.contenido_id ||
                    parentComment.tipo_contenido !== data.tipo_contenido) {
                    throw new Error('El comentario padre no pertenece al mismo contenido');
                }
            }

            const comentario = await prisma.contenidoComentario.create({
                data: {
                    contenido_id: data.contenido_id,
                    tipo_contenido: data.tipo_contenido,
                    usuario_id: userId,
                    contenido_texto: data.contenido_texto,
                    parent_id: data.parent_id || null,
                    aprobado: false // Los comentarios requieren moderación por defecto
                },
                include: {
                    usuario: {
                        select: {
                            id: true,
                            nombre: true,
                            picture_url: true
                        }
                    },
                    parent: {
                        include: {
                            usuario: {
                                select: {
                                    id: true,
                                    nombre: true
                                }
                            }
                        }
                    }
                }
            });

            // Actualizar contador de comentarios en métricas si es contenido CMS
            if (data.tipo_contenido === 'contenido') {
                await this.updateContentCommentsCount(data.contenido_id, 1);
            }

            return comentario;
        } catch (error) {
            console.error('Error al crear comentario:', error);
            throw error;
        }
    }

    /**
     * Obtener comentarios con filtros y paginación
     */
    async getComments(filters: CommentFilters) {
        try {
            const offset = (filters.page - 1) * filters.limit;

            // Construir condiciones de filtro
            const whereConditions: any = {};

            if (filters.contenido_id) {
                whereConditions.contenido_id = filters.contenido_id;
            }

            if (filters.tipo_contenido) {
                whereConditions.tipo_contenido = filters.tipo_contenido;
            }

            if (filters.usuario_id) {
                whereConditions.usuario_id = filters.usuario_id;
            }

            if (filters.aprobado !== undefined) {
                whereConditions.aprobado = filters.aprobado;
            }

            if (filters.reportado !== undefined) {
                whereConditions.reportado = filters.reportado;
            }

            if (filters.parent_id !== undefined) {
                whereConditions.parent_id = filters.parent_id;
            }

            const [comentarios, total] = await Promise.all([
                prisma.contenidoComentario.findMany({
                    where: whereConditions,
                    include: {
                        usuario: {
                            select: {
                                id: true,
                                nombre: true,
                                picture_url: true
                            }
                        },
                        parent: {
                            include: {
                                usuario: {
                                    select: {
                                        id: true,
                                        nombre: true
                                    }
                                }
                            }
                        },
                        replies: {
                            where: { aprobado: true },
                            include: {
                                usuario: {
                                    select: {
                                        id: true,
                                        nombre: true,
                                        picture_url: true
                                    }
                                }
                            },
                            orderBy: {
                                fecha_comentario: 'asc'
                            }
                        }
                    },
                    orderBy: {
                        fecha_comentario: 'desc'
                    },
                    skip: offset,
                    take: filters.limit
                }),
                prisma.contenidoComentario.count({
                    where: whereConditions
                })
            ]);

            return {
                comentarios,
                total,
                page: filters.page,
                totalPages: Math.ceil(total / filters.limit)
            };
        } catch (error) {
            console.error('Error al obtener comentarios:', error);
            throw error;
        }
    }

    /**
     * Actualizar comentario (solo el autor puede editarlo)
     */
    async updateComment(commentId: number, data: UpdateCommentData, userId: string) {
        try {
            // Verificar que el comentario existe y pertenece al usuario
            const existingComment = await prisma.contenidoComentario.findUnique({
                where: { id: commentId }
            });

            if (!existingComment) {
                throw new Error('Comentario no encontrado');
            }

            if (existingComment.usuario_id !== userId) {
                throw new Error('No tienes permisos para editar este comentario');
            }

            const comentario = await prisma.contenidoComentario.update({
                where: { id: commentId },
                data: {
                    contenido_texto: data.contenido_texto,
                    aprobado: false // Requiere nueva moderación después de editar
                },
                include: {
                    usuario: {
                        select: {
                            id: true,
                            nombre: true,
                            picture_url: true
                        }
                    }
                }
            });

            return comentario;
        } catch (error) {
            console.error('Error al actualizar comentario:', error);
            throw error;
        }
    }

    /**
     * Eliminar comentario (solo el autor o admin)
     */
    async deleteComment(commentId: number, userId: string, isAdmin: boolean = false) {
        try {
            const existingComment = await prisma.contenidoComentario.findUnique({
                where: { id: commentId }
            });

            if (!existingComment) {
                throw new Error('Comentario no encontrado');
            }

            if (!isAdmin && existingComment.usuario_id !== userId) {
                throw new Error('No tienes permisos para eliminar este comentario');
            }

            await prisma.contenidoComentario.delete({
                where: { id: commentId }
            });

            // Actualizar contador de comentarios en métricas si es contenido CMS
            if (existingComment.tipo_contenido === 'contenido') {
                await this.updateContentCommentsCount(existingComment.contenido_id, -1);
            }

            return { success: true, message: 'Comentario eliminado exitosamente' };
        } catch (error) {
            console.error('Error al eliminar comentario:', error);
            throw error;
        }
    }

    // ============================================================================
    // GESTIÓN DE REPORTES UNIFICADOS
    // ============================================================================

    /**
     * Crear reporte de contenido o comentario
     */
    async createReport(data: CreateReportData, userId: string) {
        try {
            // Verificar que el elemento existe
            if (data.tipo_elemento === 'contenido') {
                const contenido = await prisma.contenido.findUnique({
                    where: { id: data.elemento_id }
                });
                if (!contenido) {
                    throw new Error('Contenido no encontrado');
                }
            } else if (data.tipo_elemento === 'comentario') {
                const comentario = await prisma.contenidoComentario.findUnique({
                    where: { id: data.elemento_id }
                });
                if (!comentario) {
                    throw new Error('Comentario no encontrado');
                }
            }

            // Verificar si ya existe un reporte del mismo usuario para el mismo elemento
            const existingReport = await prisma.contenidoReporte.findFirst({
                where: {
                    elemento_id: data.elemento_id,
                    tipo_elemento: data.tipo_elemento,
                    usuario_id: userId
                }
            });

            if (existingReport) {
                throw new Error('Ya has reportado este elemento');
            }

            const reporte = await prisma.contenidoReporte.create({
                data: {
                    elemento_id: data.elemento_id,
                    tipo_elemento: data.tipo_elemento,
                    usuario_id: userId,
                    razon: data.razon,
                    descripcion: data.descripcion || null,
                    estado: 'PENDIENTE'
                },
                include: {
                    usuario: {
                        select: {
                            id: true,
                            nombre: true,
                            email: true
                        }
                    }
                }
            });

            // Marcar el comentario como reportado si es un comentario
            if (data.tipo_elemento === 'comentario') {
                await prisma.contenidoComentario.update({
                    where: { id: data.elemento_id },
                    data: { reportado: true }
                });
            }

            return reporte;
        } catch (error) {
            console.error('Error al crear reporte:', error);
            throw error;
        }
    }

    /**
     * Obtener reportes con filtros y paginación
     */
    async getReports(filters: ReportFilters) {
        try {
            const offset = (filters.page - 1) * filters.limit;

            // Construir condiciones de filtro
            const whereConditions: any = {};

            if (filters.tipo_elemento) {
                whereConditions.tipo_elemento = filters.tipo_elemento;
            }

            if (filters.estado) {
                whereConditions.estado = filters.estado;
            }

            if (filters.razon) {
                whereConditions.razon = filters.razon;
            }

            if (filters.usuario_id) {
                whereConditions.usuario_id = filters.usuario_id;
            }

            if (filters.fecha_desde || filters.fecha_hasta) {
                whereConditions.fecha_reporte = {};
                if (filters.fecha_desde) {
                    whereConditions.fecha_reporte.gte = new Date(filters.fecha_desde);
                }
                if (filters.fecha_hasta) {
                    whereConditions.fecha_reporte.lte = new Date(filters.fecha_hasta);
                }
            }

            const [reportes, total] = await Promise.all([
                prisma.contenidoReporte.findMany({
                    where: whereConditions,
                    include: {
                        usuario: {
                            select: {
                                id: true,
                                nombre: true,
                                email: true
                            }
                        },
                        contenido: {
                            select: {
                                id: true,
                                titulo: true,
                                tipo: true,
                                slug: true
                            }
                        }
                    },
                    orderBy: {
                        fecha_reporte: 'desc'
                    },
                    skip: offset,
                    take: filters.limit
                }),
                prisma.contenidoReporte.count({
                    where: whereConditions
                })
            ]);

            return {
                reportes,
                total,
                page: filters.page,
                totalPages: Math.ceil(total / filters.limit)
            };
        } catch (error) {
            console.error('Error al obtener reportes:', error);
            throw error;
        }
    }

    // ============================================================================
    // MODERACIÓN CENTRALIZADA
    // ============================================================================

    /**
     * Moderar comentario individual
     */
    async moderateComment(commentId: number, data: ModerateCommentData, moderatorId: string) {
        try {
            const comentario = await prisma.contenidoComentario.findUnique({
                where: { id: commentId }
            });

            if (!comentario) {
                throw new Error('Comentario no encontrado');
            }

            const updatedComment = await prisma.contenidoComentario.update({
                where: { id: commentId },
                data: {
                    aprobado: data.aprobado,
                    reportado: data.aprobado ? false : comentario.reportado // Si se aprueba, quitar marca de reportado
                },
                include: {
                    usuario: {
                        select: {
                            id: true,
                            nombre: true,
                            picture_url: true
                        }
                    }
                }
            });

            // Registrar la acción de moderación (opcional: crear tabla de logs de moderación)
            console.log(`Comentario ${commentId} ${data.aprobado ? 'aprobado' : 'rechazado'} por moderador ${moderatorId}`);

            return updatedComment;
        } catch (error) {
            console.error('Error al moderar comentario:', error);
            throw error;
        }
    }

    /**
     * Moderación masiva de comentarios
     */
    async bulkModerateComments(data: BulkModerationData, moderatorId: string) {
        try {
            let updateData: any = {};

            switch (data.accion) {
                case 'aprobar':
                    updateData = { aprobado: true, reportado: false };
                    break;
                case 'rechazar':
                    updateData = { aprobado: false };
                    break;
                case 'eliminar':
                    // Para eliminar, usaremos una transacción separada
                    break;
            }

            if (data.accion === 'eliminar') {
                // Eliminar comentarios
                const result = await prisma.contenidoComentario.deleteMany({
                    where: {
                        id: { in: data.comment_ids }
                    }
                });

                // Registrar la acción de moderación masiva
                console.log(`Moderación masiva: ${result.count} comentarios eliminados por moderador ${moderatorId}`);

                return {
                    success: true,
                    message: `${result.count} comentarios eliminados exitosamente`,
                    affected: result.count
                };
            } else {
                // Actualizar comentarios
                const result = await prisma.contenidoComentario.updateMany({
                    where: {
                        id: { in: data.comment_ids }
                    },
                    data: updateData
                });

                // Registrar la acción de moderación masiva
                console.log(`Moderación masiva: ${result.count} comentarios ${data.accion === 'aprobar' ? 'aprobados' : 'rechazados'} por moderador ${moderatorId}`);

                return {
                    success: true,
                    message: `${result.count} comentarios ${data.accion === 'aprobar' ? 'aprobados' : 'rechazados'} exitosamente`,
                    affected: result.count
                };
            }
        } catch (error) {
            console.error('Error en moderación masiva:', error);
            throw error;
        }
    }

    /**
     * Resolver reporte
     */
    async resolveReport(reportId: number, data: ResolveReportData, moderatorId: string) {
        try {
            const reporte = await prisma.contenidoReporte.findUnique({
                where: { id: reportId }
            });

            if (!reporte) {
                throw new Error('Reporte no encontrado');
            }

            const updatedReport = await prisma.contenidoReporte.update({
                where: { id: reportId },
                data: {
                    estado: data.estado,
                    fecha_resolucion: new Date(),
                    resuelto_por: moderatorId
                },
                include: {
                    usuario: {
                        select: {
                            id: true,
                            nombre: true,
                            email: true
                        }
                    }
                }
            });

            return updatedReport;
        } catch (error) {
            console.error('Error al resolver reporte:', error);
            throw error;
        }
    }

    // ============================================================================
    // ESTADÍSTICAS DE INTERACCIONES
    // ============================================================================

    /**
     * Obtener estadísticas de interacciones
     */
    async getInteractionStats(filters: InteractionStatsFilters) {
        try {
            const whereConditions: any = {};

            if (filters.tipo_contenido) {
                whereConditions.tipo_contenido = filters.tipo_contenido;
            }

            if (filters.fecha_desde || filters.fecha_hasta) {
                const dateFilter: any = {};
                if (filters.fecha_desde) {
                    dateFilter.gte = new Date(filters.fecha_desde);
                }
                if (filters.fecha_hasta) {
                    dateFilter.lte = new Date(filters.fecha_hasta);
                }
                whereConditions.fecha_like = dateFilter;
            }

            const stats: any = {};

            // Estadísticas de likes
            if (filters.incluir_likes) {
                stats.likes = await prisma.contenidoLike.count({
                    where: whereConditions
                });

                stats.likes_por_tipo = await prisma.contenidoLike.groupBy({
                    by: ['tipo_contenido'],
                    where: whereConditions,
                    _count: true
                });
            }

            // Estadísticas de comentarios
            if (filters.incluir_comentarios) {
                const commentWhereConditions = { ...whereConditions };
                if (commentWhereConditions.fecha_like) {
                    commentWhereConditions.fecha_comentario = commentWhereConditions.fecha_like;
                    delete commentWhereConditions.fecha_like;
                }

                stats.comentarios = await prisma.contenidoComentario.count({
                    where: commentWhereConditions
                });

                stats.comentarios_aprobados = await prisma.contenidoComentario.count({
                    where: { ...commentWhereConditions, aprobado: true }
                });

                stats.comentarios_pendientes = await prisma.contenidoComentario.count({
                    where: { ...commentWhereConditions, aprobado: false }
                });
            }

            // Estadísticas de reportes
            if (filters.incluir_reportes) {
                const reportWhereConditions = { ...whereConditions };
                if (reportWhereConditions.fecha_like) {
                    reportWhereConditions.fecha_reporte = reportWhereConditions.fecha_like;
                    delete reportWhereConditions.fecha_like;
                }

                stats.reportes = await prisma.contenidoReporte.count({
                    where: reportWhereConditions
                });

                stats.reportes_por_estado = await prisma.contenidoReporte.groupBy({
                    by: ['estado'],
                    where: reportWhereConditions,
                    _count: true
                });
            }

            return stats;
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            throw error;
        }
    }

    // ============================================================================
    // MÉTODOS AUXILIARES PRIVADOS
    // ============================================================================

    /**
     * Actualizar contador de likes en métricas de contenido
     */
    private async updateContentLikesCount(contenidoId: number, increment: number) {
        try {
            await prisma.contenidoMetricas.upsert({
                where: { contenido_id: contenidoId },
                update: {
                    likes: { increment }
                },
                create: {
                    contenido_id: contenidoId,
                    likes: Math.max(0, increment),
                    vistas: 0,
                    comentarios_count: 0,
                    shares: 0
                }
            });
        } catch (error) {
            console.error('Error al actualizar contador de likes:', error);
        }
    }

    /**
     * Actualizar contador de comentarios en métricas de contenido
     */
    private async updateContentCommentsCount(contenidoId: number, increment: number) {
        try {
            await prisma.contenidoMetricas.upsert({
                where: { contenido_id: contenidoId },
                update: {
                    comentarios_count: { increment }
                },
                create: {
                    contenido_id: contenidoId,
                    comentarios_count: Math.max(0, increment),
                    vistas: 0,
                    likes: 0,
                    shares: 0
                }
            });
        } catch (error) {
            console.error('Error al actualizar contador de comentarios:', error);
        }
    }

    /**
     * Validar permisos de moderador
     */
    async validateModeratorAccess(userId: string): Promise<boolean> {
        try {
            const user = await prisma.usuario.findUnique({
                where: { id: userId },
                select: { role: true }
            });

            return user?.role === 'ADMIN' || user?.role === 'CONTENT_ADMIN';
        } catch (error) {
            console.error('Error al validar permisos de moderador:', error);
            return false;
        }
    }
}

export const interactionsService = new InteractionsService();