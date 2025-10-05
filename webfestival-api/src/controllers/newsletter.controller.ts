import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { newsletterService } from '../services/newsletter.service';
import {
  NewsletterSubscriptionSchema,
  NewsletterConfirmationSchema,
  NewsletterUnsubscribeSchema,
  NewsletterSubscribersFiltersSchema,
  UpdateNewsletterSubscriberSchema,
  CreateContenidoEducativoSchema,
  UpdateContenidoEducativoSchema,
  ContenidoEducativoFiltersSchema,
  RecommendationsFiltersSchema,
  TrackContentViewSchema,
  ContenidoEducativoMetricsSchema,
  NewsletterDigestSchema
} from '../schemas/newsletter.schemas';
import { z } from 'zod';

/**
 * Controlador para newsletter y contenido educativo
 * Maneja suscripciones, contenido educativo y recomendaciones personalizadas
 */
export class NewsletterController {

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

    // Verificar permisos de CONTENT_ADMIN o ADMIN
    // En una implementación real, consultaríamos la base de datos
    // Por ahora, asumimos que el middleware de auth ya validó los permisos
    return userId;
  }

  /**
   * Valida que el ID sea un número válido
   */
  private validateId(id: string | undefined, res: Response): number | null {
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'ID es requerido'
      });
      return null;
    }

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

  // ============================================================================
  // ENDPOINTS DE NEWSLETTER
  // ============================================================================

  /**
   * Suscribe un email al newsletter
   * POST /api/newsletter/subscribe
   */
  async subscribeToNewsletter(req: AuthenticatedRequest, res: Response) {
    try {
      const data = NewsletterSubscriptionSchema.parse({
        ...req.body,
        usuario_id: req.user?.id // Asociar con usuario autenticado si existe
      });

      const subscription = await newsletterService.subscribeToNewsletter(data);

      return res.status(201).json({
        success: true,
        data: subscription,
        message: 'Suscripción creada exitosamente. Revisa tu email para confirmar la suscripción.'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Datos de suscripción inválidos',
          errors: error.errors
        });
      }

      if (error instanceof Error && error.message === 'Este email ya está suscrito al newsletter') {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }

      console.error('Error al suscribir al newsletter:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Confirma una suscripción al newsletter
   * POST /api/newsletter/confirm
   */
  async confirmSubscription(req: AuthenticatedRequest, res: Response) {
    try {
      const data = NewsletterConfirmationSchema.parse(req.body);
      const subscription = await newsletterService.confirmSubscription(data);

      return res.json({
        success: true,
        data: subscription,
        message: 'Suscripción confirmada exitosamente'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Token de confirmación inválido',
          errors: error.errors
        });
      }

      if (error instanceof Error && (
        error.message === 'Token de confirmación inválido' ||
        error.message === 'Esta suscripción ya está confirmada'
      )) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      console.error('Error al confirmar suscripción:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Cancela una suscripción al newsletter
   * POST /api/newsletter/unsubscribe
   */
  async unsubscribeFromNewsletter(req: AuthenticatedRequest, res: Response) {
    try {
      const data = NewsletterUnsubscribeSchema.parse(req.body);
      const subscription = await newsletterService.unsubscribeFromNewsletter(data);

      return res.json({
        success: true,
        data: subscription,
        message: 'Suscripción cancelada exitosamente'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Datos de cancelación inválidos',
          errors: error.errors
        });
      }

      if (error instanceof Error && error.message === 'Suscripción no encontrada') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      console.error('Error al cancelar suscripción:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtiene lista de suscriptores (solo CONTENT_ADMIN)
   * GET /api/newsletter/subscribers
   */
  async getSubscribers(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = await this.validateContentAdminAccess(req.user?.id, res);
      if (!userId) return;

      const filters = NewsletterSubscribersFiltersSchema.parse({
        ...req.query,
        page: req.query['page'] ? parseInt(req.query['page'] as string) : 1,
        limit: req.query['limit'] ? parseInt(req.query['limit'] as string) : 10,
        activo: req.query['activo'] === 'true' ? true : req.query['activo'] === 'false' ? false : undefined,
        confirmado: req.query['confirmado'] === 'true' ? true : req.query['confirmado'] === 'false' ? false : undefined
      });

      const result = await newsletterService.getSubscribers(filters);

      return res.json({
        success: true,
        data: result,
        message: 'Suscriptores obtenidos exitosamente'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Filtros inválidos',
          errors: error.errors
        });
      }

      console.error('Error al obtener suscriptores:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Actualiza un suscriptor (solo CONTENT_ADMIN)
   * PUT /api/newsletter/subscribers/:id
   */
  async updateSubscriber(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = await this.validateContentAdminAccess(req.user?.id, res);
      if (!userId) return;

      const id = this.validateId(req.params['id'], res);
      if (id === null) return;

      const data = UpdateNewsletterSubscriberSchema.parse(req.body);
      const subscription = await newsletterService.updateSubscriber(id, data);

      return res.json({
        success: true,
        data: subscription,
        message: 'Suscriptor actualizado exitosamente'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Datos de actualización inválidos',
          errors: error.errors
        });
      }

      if (error instanceof Error && error.message === 'Suscriptor no encontrado') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      console.error('Error al actualizar suscriptor:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtiene estadísticas del newsletter (solo CONTENT_ADMIN)
   * GET /api/newsletter/stats
   */
  async getNewsletterStats(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = await this.validateContentAdminAccess(req.user?.id, res);
      if (!userId) return;

      const stats = await newsletterService.getNewsletterStats();

      return res.json({
        success: true,
        data: stats,
        message: 'Estadísticas obtenidas exitosamente'
      });
    } catch (error) {
      console.error('Error al obtener estadísticas del newsletter:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // ============================================================================
  // ENDPOINTS DE CONTENIDO EDUCATIVO
  // ============================================================================

  /**
   * Crea nuevo contenido educativo (solo CONTENT_ADMIN)
   * POST /api/educational-content
   */
  async createEducationalContent(req: AuthenticatedRequest, res: Response) {
    try {
      const autorId = await this.validateContentAdminAccess(req.user?.id, res);
      if (!autorId) return;

      const data = CreateContenidoEducativoSchema.parse(req.body);
      const contenido = await newsletterService.createEducationalContent(data, autorId);

      return res.status(201).json({
        success: true,
        data: contenido,
        message: 'Contenido educativo creado exitosamente'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Datos de contenido inválidos',
          errors: error.errors
        });
      }

      console.error('Error al crear contenido educativo:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Actualiza contenido educativo existente (solo CONTENT_ADMIN)
   * PUT /api/educational-content/:id
   */
  async updateEducationalContent(req: AuthenticatedRequest, res: Response) {
    try {
      const updatedBy = await this.validateContentAdminAccess(req.user?.id, res);
      if (!updatedBy) return;

      const id = this.validateId(req.params['id'], res);
      if (id === null) return;

      const data = UpdateContenidoEducativoSchema.parse(req.body);
      const contenido = await newsletterService.updateEducationalContent(id, data, updatedBy);

      return res.json({
        success: true,
        data: contenido,
        message: 'Contenido educativo actualizado exitosamente'
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
        error.message === 'Contenido educativo no encontrado' ||
        error.message === 'Este contenido no es de tipo educativo'
      )) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      console.error('Error al actualizar contenido educativo:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtiene contenido educativo con filtros
   * GET /api/educational-content
   */
  async getEducationalContent(req: AuthenticatedRequest, res: Response) {
    try {
      const filters = ContenidoEducativoFiltersSchema.parse({
        ...req.query,
        page: req.query['page'] ? parseInt(req.query['page'] as string) : 1,
        limit: req.query['limit'] ? parseInt(req.query['limit'] as string) : 10,
        tags: req.query['tags'] ? (Array.isArray(req.query['tags']) ? req.query['tags'] : [req.query['tags']]) : undefined,
        destacado: req.query['destacado'] === 'true' ? true : req.query['destacado'] === 'false' ? false : undefined
      });

      const result = await newsletterService.getEducationalContent(filters);

      return res.json({
        success: true,
        data: result,
        message: 'Contenido educativo obtenido exitosamente'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Filtros inválidos',
          errors: error.errors
        });
      }

      console.error('Error al obtener contenido educativo:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtiene contenido educativo por ID
   * GET /api/educational-content/:id
   */
  async getEducationalContentById(req: AuthenticatedRequest, res: Response) {
    try {
      const id = this.validateId(req.params['id'], res);
      if (id === null) return;

      const contenido = await newsletterService.getEducationalContentById(id);

      return res.json({
        success: true,
        data: contenido,
        message: 'Contenido educativo obtenido exitosamente'
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Contenido educativo no encontrado') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      console.error('Error al obtener contenido educativo por ID:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Elimina contenido educativo (solo CONTENT_ADMIN)
   * DELETE /api/educational-content/:id
   */
  async deleteEducationalContent(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = await this.validateContentAdminAccess(req.user?.id, res);
      if (!userId) return;

      const id = this.validateId(req.params['id'], res);
      if (id === null) return;

      const result = await newsletterService.deleteEducationalContent(id, userId);

      return res.json({
        success: true,
        data: result,
        message: 'Contenido educativo eliminado exitosamente'
      });
    } catch (error) {
      if (error instanceof Error && (
        error.message === 'Contenido educativo no encontrado' ||
        error.message === 'Este contenido no es de tipo educativo'
      )) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      console.error('Error al eliminar contenido educativo:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtiene recomendaciones personalizadas de contenido educativo
   * GET /api/educational-content/recommendations
   */
  async getPersonalizedRecommendations(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const filters = RecommendationsFiltersSchema.parse({
        ...req.query,
        usuario_id: req.user.id,
        limit: req.query['limit'] ? parseInt(req.query['limit'] as string) : 10,
        excluir_leidos: req.query['excluir_leidos'] !== 'false'
      });

      const recomendaciones = await newsletterService.getPersonalizedRecommendations(filters);

      return res.json({
        success: true,
        data: recomendaciones,
        message: 'Recomendaciones obtenidas exitosamente'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Parámetros de recomendación inválidos',
          errors: error.errors
        });
      }

      console.error('Error al obtener recomendaciones:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Registra una vista de contenido educativo
   * POST /api/educational-content/track-view
   */
  async trackContentView(req: AuthenticatedRequest, res: Response) {
    try {
      const data = TrackContentViewSchema.parse({
        ...req.body,
        usuario_id: req.user?.id
      });

      const result = await newsletterService.trackContentView(data);

      return res.json({
        success: true,
        data: result,
        message: 'Vista registrada exitosamente'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Datos de tracking inválidos',
          errors: error.errors
        });
      }

      if (error instanceof Error && error.message === 'Contenido educativo no encontrado') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      console.error('Error al registrar vista:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtiene métricas de contenido educativo (solo CONTENT_ADMIN)
   * GET /api/educational-content/metrics
   */
  async getEducationalContentMetrics(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = await this.validateContentAdminAccess(req.user?.id, res);
      if (!userId) return;

      const filters = ContenidoEducativoMetricsSchema.parse(req.query);
      const metrics = await newsletterService.getEducationalContentMetrics(filters);

      return res.json({
        success: true,
        data: metrics,
        message: 'Métricas obtenidas exitosamente'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Filtros de métricas inválidos',
          errors: error.errors
        });
      }

      console.error('Error al obtener métricas:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // ============================================================================
  // ENDPOINTS DE DIGEST DEL NEWSLETTER
  // ============================================================================

  /**
   * Genera digest semanal del newsletter (solo CONTENT_ADMIN)
   * POST /api/newsletter/generate-digest
   */
  async generateWeeklyDigest(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = await this.validateContentAdminAccess(req.user?.id, res);
      if (!userId) return;

      const data = NewsletterDigestSchema.parse(req.body);
      const digest = await newsletterService.generateWeeklyDigest(data);

      return res.json({
        success: true,
        data: digest,
        message: 'Digest generado exitosamente'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Parámetros de digest inválidos',
          errors: error.errors
        });
      }

      console.error('Error al generar digest:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Envía digest a suscriptores (solo CONTENT_ADMIN)
   * POST /api/newsletter/send-digest
   */
  async sendDigestToSubscribers(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = await this.validateContentAdminAccess(req.user?.id, res);
      if (!userId) return;

      const digest = req.body;
      const result = await newsletterService.sendDigestToSubscribers(digest);

      return res.json({
        success: true,
        data: result,
        message: 'Digest enviado exitosamente'
      });
    } catch (error) {
      console.error('Error al enviar digest:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtiene contenido popular para digest (solo CONTENT_ADMIN)
   * GET /api/newsletter/popular-content
   */
  async getPopularContentForDigest(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = await this.validateContentAdminAccess(req.user?.id, res);
      if (!userId) return;

      const limit = req.query['limit'] ? parseInt(req.query['limit'] as string) : 5;
      const content = await newsletterService.getPopularContentForDigest(limit);

      return res.json({
        success: true,
        data: content,
        message: 'Contenido popular obtenido exitosamente'
      });
    } catch (error) {
      console.error('Error al obtener contenido popular:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}

export const newsletterController = new NewsletterController();