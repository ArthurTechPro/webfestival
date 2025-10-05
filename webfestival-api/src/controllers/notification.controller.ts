import { Request, Response } from 'express';
import { getNotificationService } from '../services/notification.service';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

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

const markAsReadSchema = z.object({
  notificationId: z.number().int().positive()
});

const getUserNotificationsSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20)
});

export class NotificationController {
  private notificationService = getNotificationService(prisma);

  /**
   * Obtener notificaciones del usuario autenticado
   * GET /api/v1/notifications
   */
  async getUserNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }

      const query = getUserNotificationsSchema.parse({
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20
      });

      const result = await this.notificationService.getUserNotifications(
        userId,
        query.page,
        query.limit
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error obteniendo notificaciones:', error);
      
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
   * Marcar notificación como leída
   * PUT /api/v1/notifications/:id/read
   */
  async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }

      const notificationId = parseInt(req.params.id);
      if (isNaN(notificationId)) {
        res.status(400).json({ error: 'ID de notificación inválido' });
        return;
      }

      await this.notificationService.markAsRead(notificationId, userId);

      res.json({
        success: true,
        message: 'Notificación marcada como leída'
      });
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Marcar todas las notificaciones como leídas
   * PUT /api/v1/notifications/read-all
   */
  async markAllAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }

      await this.notificationService.markAllAsRead(userId);

      res.json({
        success: true,
        message: 'Todas las notificaciones marcadas como leídas'
      });
    } catch (error) {
      console.error('Error marcando todas las notificaciones como leídas:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
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