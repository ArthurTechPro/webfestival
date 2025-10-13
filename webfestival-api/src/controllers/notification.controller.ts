import { Request, Response, NextFunction } from 'express';
import { getNotificationService } from '../services/notification.service';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

import { ApiResponse, ApiError } from '../types';

// Esquemas de validación
const sendDeadlineReminderSchema = z.object({
  concursoId: z.number().int().positive(),
  horasAntes: z.number().int().positive().default(48)
});

const sendEvaluationCompleteSchema = z.object({
  medioId: z.number().int().positive(),
  juradoId: z.string().min(1)
});

const sendResultsPublishedSchema = z.object({
  concursoId: z.number().int().positive()
});

const sendNewContestSchema = z.object({
  concursoId: z.number().int().positive()
});

// Schema removido - no se usa en el código actual

// Schema removido - se usa sanitizeQueryParams en su lugar

export class NotificationController {
  private notificationService = getNotificationService(prisma);

  // ✅ FUNCIONES DE FLECHA para helpers y utilidades internas
  private validateUserId = (userId: string | undefined): string => {
    if (!userId) {
      const error = new Error('Usuario no autenticado') as ApiError;
      error.status = 401;
      throw error;
    }
    return userId;
  };

  private validateNotificationId = (id: string): number => {
    const numId = parseInt(id);
    if (!id || isNaN(numId) || numId <= 0) {
      const error = new Error('ID de notificación inválido') as ApiError;
      error.status = 400;
      throw error;
    }
    return numId;
  };

  private sanitizeQueryParams = (query: any) => ({
    page: query.page ? Math.max(1, parseInt(query.page)) : 1,
    limit: query.limit ? Math.min(100, Math.max(1, parseInt(query.limit))) : 20,
    unreadOnly: query.unreadOnly === 'true'
  });

  private formatNotificationResponse = (notification: any) => ({
    id: notification.id,
    tipo: notification.tipo,
    titulo: notification.titulo,
    mensaje: notification.mensaje,
    leida: notification.leida,
    created_at: notification.created_at,
    metadata: notification.metadata || {},
    ...(notification.concurso && {
      concurso: {
        id: notification.concurso.id,
        titulo: notification.concurso.titulo
      }
    }),
    ...(notification.medio && {
      medio: {
        id: notification.medio.id,
        titulo: notification.medio.titulo
      }
    })
  });

  private formatNotificationList = (notifications: any[]) => {
    return notifications.map(notification => this.formatNotificationResponse(notification));
  };

  private logNotificationAction = (action: string, userId: string, notificationId?: number, metadata?: any) => {
    console.log(`[NOTIFICATION_ACTION] ${action} - User: ${userId}${notificationId ? ` -> Notification: ${notificationId}` : ''} - ${new Date().toISOString()}`, metadata || '');
  };

  private createSuccessResponse = (data: any, message: string): ApiResponse => ({
    success: true,
    data,
    message
  });



  /**
   * ✅ FUNCIÓN TRADICIONAL para obtener notificaciones del usuario
   * Razón: Método principal que puede ser heredado y necesita binding correcto
   * GET /api/v1/notifications
   */
  async getUserNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Usar helper de flecha para validación
      const userId = this.validateUserId(req.user?.id);

      // Usar helper de flecha para sanitización
      const params = this.sanitizeQueryParams(req.query);

      this.logNotificationAction('GET_NOTIFICATIONS', userId, undefined, params);

      const result = await this.notificationService.getUserNotifications(
        userId,
        params.page,
        params.limit
      );

      // Formatear respuesta usando helper
      const formattedNotifications = this.formatNotificationList(result.notificaciones || []);

      const response = this.createSuccessResponse(
        {
          notifications: formattedNotifications,
          total: result.total,
          page: result.page,
          totalPages: result.totalPages
        },
        'Notificaciones obtenidas exitosamente'
      );

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * ✅ FUNCIÓN TRADICIONAL para marcar notificación como leída
   * Razón: Método principal con lógica de negocio
   * PUT /api/v1/notifications/:id/read
   */
  async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Usar helpers de flecha para validación
      const userId = this.validateUserId(req.user?.id);
      const notificationId = this.validateNotificationId(req.params['id'] || '');

      this.logNotificationAction('MARK_AS_READ', userId, notificationId);

      await this.notificationService.markAsRead(notificationId, userId);

      const response = this.createSuccessResponse(
        { notificationId, read: true },
        'Notificación marcada como leída'
      );

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * ✅ FUNCIÓN TRADICIONAL para marcar todas las notificaciones como leídas
   * Razón: Método principal con operación masiva
   * PUT /api/v1/notifications/read-all
   */
  async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Usar helper de flecha para validación
      const userId = this.validateUserId(req.user?.id);

      this.logNotificationAction('MARK_ALL_AS_READ', userId);

      await this.notificationService.markAllAsRead(userId);

      const response = this.createSuccessResponse(
        { success: true },
        'Todas las notificaciones marcadas como leídas'
      );

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // ENDPOINTS ADMINISTRATIVOS PARA ENVÍO MANUAL DE NOTIFICACIONES
  // ============================================================================

  /**
   * Enviar recordatorio de fecha límite (solo ADMIN)
   * POST /api/v1/notifications/deadline-reminder
   */
  async sendDeadlineReminder(req: Request, res: Response): Promise<void> {
    try {
      const userRole = req.user?.role;
      if (userRole !== 'ADMIN') {
        res.status(403).json({ error: 'Acceso denegado. Solo administradores pueden enviar recordatorios.' });
        return;
      }

      const data = sendDeadlineReminderSchema.parse(req.body);
      await this.notificationService.sendDeadlineReminder(data);

      res.json({
        success: true,
        message: 'Recordatorios de fecha límite enviados exitosamente'
      });
    } catch (error) {
      console.error('Error enviando recordatorios de fecha límite:', error);

      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Datos de entrada inválidos',
          details: error.errors
        });
        return;
      }

      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Enviar notificación de evaluación completada (solo ADMIN)
   * POST /api/v1/notifications/evaluation-complete
   */
  async sendEvaluationComplete(req: Request, res: Response): Promise<void> {
    try {
      const userRole = req.user?.role;
      if (userRole !== 'ADMIN') {
        res.status(403).json({ error: 'Acceso denegado. Solo administradores pueden enviar notificaciones.' });
        return;
      }

      const data = sendEvaluationCompleteSchema.parse(req.body);
      await this.notificationService.sendEvaluationComplete(data);

      res.json({
        success: true,
        message: 'Notificación de evaluación completada enviada exitosamente'
      });
    } catch (error) {
      console.error('Error enviando notificación de evaluación completada:', error);

      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Datos de entrada inválidos',
          details: error.errors
        });
        return;
      }

      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Enviar notificación de resultados publicados (solo ADMIN)
   * POST /api/v1/notifications/results-published
   */
  async sendResultsPublished(req: Request, res: Response): Promise<void> {
    try {
      const userRole = req.user?.role;
      if (userRole !== 'ADMIN') {
        res.status(403).json({ error: 'Acceso denegado. Solo administradores pueden enviar notificaciones.' });
        return;
      }

      const data = sendResultsPublishedSchema.parse(req.body);
      await this.notificationService.sendResultsPublished(data);

      res.json({
        success: true,
        message: 'Notificaciones de resultados publicados enviadas exitosamente'
      });
    } catch (error) {
      console.error('Error enviando notificaciones de resultados:', error);

      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Datos de entrada inválidos',
          details: error.errors
        });
        return;
      }

      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Enviar notificación de nuevo concurso (solo ADMIN)
   * POST /api/v1/notifications/new-contest
   */
  async sendNewContestNotification(req: Request, res: Response): Promise<void> {
    try {
      const userRole = req.user?.role;
      if (userRole !== 'ADMIN') {
        res.status(403).json({ error: 'Acceso denegado. Solo administradores pueden enviar notificaciones.' });
        return;
      }

      const data = sendNewContestSchema.parse(req.body);
      await this.notificationService.sendNewContestNotification(data);

      res.json({
        success: true,
        message: 'Notificaciones de nuevo concurso enviadas exitosamente'
      });
    } catch (error) {
      console.error('Error enviando notificaciones de nuevo concurso:', error);

      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Datos de entrada inválidos',
          details: error.errors
        });
        return;
      }

      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Inicializar trabajos programados (solo ADMIN)
   * POST /api/v1/notifications/start-scheduled-jobs
   */
  async startScheduledJobs(req: Request, res: Response): Promise<void> {
    try {
      const userRole = req.user?.role;
      if (userRole !== 'ADMIN') {
        res.status(403).json({ error: 'Acceso denegado. Solo administradores pueden gestionar trabajos programados.' });
        return;
      }

      // Configurar y iniciar trabajos programados
      this.notificationService.setupDeadlineReminders();
      this.notificationService.setupEvaluationNotifications();
      this.notificationService.startScheduledJobs();

      res.json({
        success: true,
        message: 'Trabajos programados de notificaciones iniciados exitosamente'
      });
    } catch (error) {
      console.error('Error iniciando trabajos programados:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Detener trabajos programados (solo ADMIN)
   * POST /api/v1/notifications/stop-scheduled-jobs
   */
  async stopScheduledJobs(req: Request, res: Response): Promise<void> {
    try {
      const userRole = req.user?.role;
      if (userRole !== 'ADMIN') {
        res.status(403).json({ error: 'Acceso denegado. Solo administradores pueden gestionar trabajos programados.' });
        return;
      }

      this.notificationService.stopScheduledJobs();

      res.json({
        success: true,
        message: 'Trabajos programados de notificaciones detenidos exitosamente'
      });
    } catch (error) {
      console.error('Error deteniendo trabajos programados:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Limpiar notificaciones antiguas (solo ADMIN)
   * POST /api/v1/notifications/cleanup
   */
  async cleanupOldNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userRole = req.user?.role;
      if (userRole !== 'ADMIN') {
        res.status(403).json({ error: 'Acceso denegado. Solo administradores pueden limpiar notificaciones.' });
        return;
      }

      await this.notificationService.cleanupOldNotifications();

      res.json({
        success: true,
        message: 'Notificaciones antiguas limpiadas exitosamente'
      });
    } catch (error) {
      console.error('Error limpiando notificaciones antiguas:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }
}

export const notificationController = new NotificationController();