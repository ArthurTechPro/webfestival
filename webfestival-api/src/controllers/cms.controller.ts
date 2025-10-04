import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { cmsService } from '../services/cms.service';
import {
    CreateContenidoSchema,
    UpdateContenidoSchema,
    ContentFiltersSchema,
    ContenidoConfiguracionSchema,
    ContenidoSEOSchema,
    ContenidoMetricasSchema,
    ContenidoTaxonomiaSchema,
    TagSearchSchema
} from '../schemas/cms.schemas';
import { z } from 'zod';

/**
 * Controlador para el sistema CMS unificado
 * Maneja todas las operaciones CRUD del contenido y funcionalidades relacionadas
 */
export class CMSController {

    /**
     * Valida que el usuario esté autenticado y tenga permisos de CONTENT_ADMIN
     */
    private async validateContentAdminAccess(userId: string | undefined, res: Response): Promise<string | null> {
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
            return null;
        }

        const hasPermission = await cmsService.validateContentAdmin(userId);
        if (!hasPermission) {
            res.status(403).json({
                success: false,
                message: 'No tienes permisos para realizar esta acción'
            });
            return null;
        }

        return userId;
    }

    /**
     * Valida que el ID sea un número válido
     */
    private validateId(id: string, res: Response): number | null {
        const parsedId = parseInt(id);
        if (isNaN(parsedId)) {
            res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
            return null;
        }
        return parsedId;
    }

    /**
     * Obtiene contenido con filtros y paginación
     * GET /api/cms/content
     */
    async getContent(req: AuthenticatedRequest, res: Response) {
        try {
            const filters = ContentFiltersSchema.parse({
                ...req.query,
                page: req.query['page'] ? parseInt(req.query['page'] as string) : 1,
                limit: req.query['limit'] ? parseInt(req.query['limit'] as string) : 10,
            });

            const result = await cmsService.getContent(filters);

            return res.json({
                success: true,
                data: result,
                message: 'Contenido obtenido exitosamente'
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Datos de filtros inválidos',
                    errors: error.errors
                });
            }

            console.error('Error al obtener contenido:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * Obtiene contenido por slug
     * GET /api/cms/content/:slug
     */
    async getContentBySlug(req: AuthenticatedRequest, res: Response) {
        try {
            const { slug } = req.params;
            const includeRelations = req.query['include'] !== 'false';

            if (!slug) {
                return res.status(400).json({
                    success: false,
                    message: 'Slug es requerido'
                });
            }

            const contenido = await cmsService.getContentBySlug(slug, includeRelations);

            return res.json({
                success: true,
                data: contenido,
                message: 'Contenido obtenido exitosamente'
            });
        } catch (error) {
            if (error instanceof Error && error.message === 'Contenido no encontrado') {
                return res.status(404).json({
                    success: false,
                    message: 'Contenido no encontrado'
                });
            }

            console.error('Error al obtener contenido por slug:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * Crea nuevo contenido
     * POST /api/cms/content
     */
    async createContent(req: AuthenticatedRequest, res: Response) {
        try {
            const data = CreateContenidoSchema.parse(req.body);
            const autorId = await this.validateContentAdminAccess(req.user?.id, res);
            if (!autorId) return;

            const contenido = await cmsService.createContent(data, autorId);

            return res.status(201).json({
                success: true,
                data: contenido,
                message: 'Contenido creado exitosamente'
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Datos de contenido inválidos',
                    errors: error.errors
                });
            }

            if (error instanceof Error && error.message === 'Ya existe contenido con este slug') {
                return res.status(409).json({
                    success: false,
                    message: error.message
                });
            }

            console.error('Error al crear contenido:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * Actualiza contenido existente
     * PUT /api/cms/content/:id
     */
    async updateContent(req: AuthenticatedRequest, res: Response) {
        try {
            const id = this.validateId(req.params['id'], res);
            if (id === null) return;

            const data = UpdateContenidoSchema.parse(req.body);
            const updatedBy = await this.validateContentAdminAccess(req.user?.id, res);
            if (!updatedBy) return;

            const contenido = await cmsService.updateContent(id, data, updatedBy);

            return res.json({
                success: true,
                data: contenido,
                message: 'Contenido actualizado exitosamente'
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Datos de contenido inválidos',
                    errors: error.errors
                });
            }

            if (error instanceof Error && (
                error.message === 'Contenido no encontrado' ||
                error.message === 'Ya existe contenido con este slug'
            )) {
                const statusCode = error.message === 'Contenido no encontrado' ? 404 : 409;
                return res.status(statusCode).json({
                    success: false,
                    message: error.message
                });
            }

            console.error('Error al actualizar contenido:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * Elimina contenido
     * DELETE /api/cms/content/:id
     */
    async deleteContent(req: AuthenticatedRequest, res: Response) {
        try {
            const id = this.validateId(req.params['id'], res);
            if (id === null) return;

            const userId = await this.validateContentAdminAccess(req.user?.id, res);
            if (!userId) return;

            const result = await cmsService.deleteContent(id, userId);

            return res.json({
                success: true,
                data: result,
                message: 'Contenido eliminado exitosamente'
            });
        } catch (error) {
            if (error instanceof Error && error.message === 'Contenido no encontrado') {
                return res.status(404).json({
                    success: false,
                    message: 'Contenido no encontrado'
                });
            }

            console.error('Error al eliminar contenido:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * Publica contenido
     * POST /api/cms/content/:id/publish
     */
    async publishContent(req: AuthenticatedRequest, res: Response) {
        try {
            const id = this.validateId(req.params['id'], res);
            if (id === null) return;

            const userId = await this.validateContentAdminAccess(req.user?.id, res);
            if (!userId) return;

            const contenido = await cmsService.publishContent(id, userId);

            return res.json({
                success: true,
                data: contenido,
                message: 'Contenido publicado exitosamente'
            });
        } catch (error) {
            if (error instanceof Error && error.message === 'Contenido no encontrado') {
                return res.status(404).json({
                    success: false,
                    message: 'Contenido no encontrado'
                });
            }

            console.error('Error al publicar contenido:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * Actualiza configuración de contenido
     * PUT /api/cms/content/:id/config
     */
    async updateContentConfig(req: AuthenticatedRequest, res: Response) {
        try {
            const contentId = this.validateId(req.params['id'], res);
            if (contentId === null) return;

            const config = ContenidoConfiguracionSchema.parse(req.body);
            const userId = await this.validateContentAdminAccess(req.user?.id, res);
            if (!userId) return;

            const result = await cmsService.updateContentConfig(contentId, config);

            return res.json({
                success: true,
                data: result,
                message: 'Configuración actualizada exitosamente'
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Datos de configuración inválidos',
                    errors: error.errors
                });
            }

            console.error('Error al actualizar configuración:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * Actualiza SEO de contenido
     * PUT /api/cms/content/:id/seo
     */
    async updateContentSEO(req: AuthenticatedRequest, res: Response) {
        try {
            const contentId = this.validateId(req.params['id'], res);
            if (contentId === null) return;

            const seo = ContenidoSEOSchema.parse(req.body);
            const userId = await this.validateContentAdminAccess(req.user?.id, res);
            if (!userId) return;

            const result = await cmsService.updateContentSEO(contentId, seo);

            return res.json({
                success: true,
                data: result,
                message: 'SEO actualizado exitosamente'
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Datos de SEO inválidos',
                    errors: error.errors
                });
            }

            console.error('Error al actualizar SEO:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * Actualiza métricas de contenido
     * PUT /api/cms/content/:id/metrics
     */
    async updateContentMetrics(req: AuthenticatedRequest, res: Response) {
        try {
            const contentId = this.validateId(req.params['id'], res);
            if (contentId === null) return;

            const metricas = ContenidoMetricasSchema.partial().parse(req.body);

            // Filtrar solo los campos definidos para evitar problemas con undefined
            const filteredMetricas: any = {};
            if (metricas.vistas !== undefined) filteredMetricas.vistas = metricas.vistas;
            if (metricas.likes !== undefined) filteredMetricas.likes = metricas.likes;
            if (metricas.comentarios_count !== undefined) filteredMetricas.comentarios_count = metricas.comentarios_count;
            if (metricas.shares !== undefined) filteredMetricas.shares = metricas.shares;
            if (metricas.ultima_vista !== undefined) filteredMetricas.ultima_vista = metricas.ultima_vista;
            if (metricas.primera_publicacion !== undefined) filteredMetricas.primera_publicacion = metricas.primera_publicacion;

            const result = await cmsService.updateContentMetrics(contentId, filteredMetricas);

            return res.json({
                success: true,
                data: result,
                message: 'Métricas actualizadas exitosamente'
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Datos de métricas inválidos',
                    errors: error.errors
                });
            }

            console.error('Error al actualizar métricas:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * Actualiza taxonomía de contenido
     * PUT /api/cms/content/:id/taxonomy
     */
    async updateContentTaxonomy(req: AuthenticatedRequest, res: Response) {
        try {
            const contentId = this.validateId(req.params['id'], res);
            if (contentId === null) return;

            const taxonomia = z.array(ContenidoTaxonomiaSchema).parse(req.body);
            const userId = await this.validateContentAdminAccess(req.user?.id, res);
            if (!userId) return;

            const result = await cmsService.updateContentTaxonomy(contentId, taxonomia);

            return res.json({
                success: true,
                data: result,
                message: 'Taxonomía actualizada exitosamente'
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Datos de taxonomía inválidos',
                    errors: error.errors
                });
            }

            console.error('Error al actualizar taxonomía:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * Obtiene categorías únicas
     * GET /api/cms/categories
     */
    async getCategories(req: AuthenticatedRequest, res: Response) {
        try {
            const tipo = req.query['tipo'] as string | undefined;
            const categories = await cmsService.getCategories(tipo as any);

            return res.json({
                success: true,
                data: categories,
                message: 'Categorías obtenidas exitosamente'
            });
        } catch (error) {
            console.error('Error al obtener categorías:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * Obtiene etiquetas con autocompletado
     * GET /api/cms/tags
     */
    async getTags(req: AuthenticatedRequest, res: Response) {
        try {
            const { query, limit } = TagSearchSchema.parse({
                query: req.query['query'],
                limit: req.query['limit'] ? parseInt(req.query['limit'] as string) : 10
            });

            const tags = await cmsService.getTags(query, limit);

            return res.json({
                success: true,
                data: tags,
                message: 'Etiquetas obtenidas exitosamente'
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Parámetros de búsqueda inválidos',
                    errors: error.errors
                });
            }

            console.error('Error al obtener etiquetas:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * Obtiene métricas de contenido
     * GET /api/cms/content/:id/metrics
     */
    async getContentMetrics(req: AuthenticatedRequest, res: Response) {
        try {
            const contentId = this.validateId(req.params['id'], res);
            if (contentId === null) return;

            const metrics = await cmsService.getContentMetrics(contentId);

            if (!metrics) {
                return res.status(404).json({
                    success: false,
                    message: 'Métricas no encontradas'
                });
            }

            return res.json({
                success: true,
                data: metrics,
                message: 'Métricas obtenidas exitosamente'
            });
        } catch (error) {
            console.error('Error al obtener métricas:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * Obtiene tipos de contenido disponibles
     * GET /api/cms/content-types
     */
    async getContentTypes(_req: AuthenticatedRequest, res: Response) {
        try {
            const contentTypes = cmsService.getContentTypes();

            return res.json({
                success: true,
                data: contentTypes,
                message: 'Tipos de contenido obtenidos exitosamente'
            });
        } catch (error) {
            console.error('Error al obtener tipos de contenido:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * Obtiene plantilla de contenido por tipo
     * GET /api/cms/content-template/:tipo
     */
    async getContentTemplate(req: AuthenticatedRequest, res: Response) {
        try {
            const { tipo } = req.params;
            const template = cmsService.getContentTemplate(tipo as any);

            return res.json({
                success: true,
                data: template,
                message: 'Plantilla obtenida exitosamente'
            });
        } catch (error) {
            console.error('Error al obtener plantilla:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * Genera preview de contenido
     * GET /api/cms/content/:id/preview
     */
    async previewContent(req: AuthenticatedRequest, res: Response) {
        try {
            const id = this.validateId(req.params['id'], res);
            if (id === null) return;

            const userId = await this.validateContentAdminAccess(req.user?.id, res);
            if (!userId) return;

            const previewUrl = await cmsService.previewContent(id);

            return res.json({
                success: true,
                data: { previewUrl },
                message: 'Preview generado exitosamente'
            });
        } catch (error) {
            if (error instanceof Error && error.message === 'Contenido no encontrado') {
                return res.status(404).json({
                    success: false,
                    message: 'Contenido no encontrado'
                });
            }

            console.error('Error al generar preview:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
}

export const cmsController = new CMSController();