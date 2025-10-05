import { PrismaClient } from '@prisma/client';
import { getEmailService } from './email.service';
import * as cron from 'node-cron';

export interface NotificationData {
  userId: string;
  tipo: string;
  titulo: string;
  mensaje: string;
}

export interface DeadlineReminderData {
  concursoId: number;
  horasAntes: number;
}

export interface EvaluationCompleteData {
  medioId: number;
  juradoId: string;
}

export interface ResultsPublishedData {
  concursoId: number;
}

export interface NewContestData {
  concursoId: number;
}

export class NotificationService {
  private prisma: PrismaClient;
  private emailService: ReturnType<typeof getEmailService>;
  private cronJobs: Map<string, any> = new Map();

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
    this.emailService = getEmailService();
  }

  /**
   * Crear una notificación en la base de datos
   */
  async createNotification(data: NotificationData): Promise<void> {
    try {
      await this.prisma.notificacion.create({
        data: {
          usuario_id: data.userId,
          tipo: data.tipo,
          titulo: data.titulo,
          mensaje: data.mensaje,
          leida: false
        }
      });

      console.log(`Notificación creada para usuario ${data.userId}: ${data.titulo}`);
    } catch (error) {
      console.error('Error creando notificación:', error);
      throw error;
    }
  }

  /**
   * Enviar recordatorio de fecha límite (48 horas antes)
   * Requisito 12.1: Notificación 48 horas antes de la fecha límite
   */
  async sendDeadlineReminder(data: DeadlineReminderData): Promise<void> {
    try {
      // Obtener concurso con participantes inscritos
      const concurso = await this.prisma.concurso.findUnique({
        where: { id: data.concursoId },
        include: {
          inscripciones: {
            include: {
              usuario: true
            }
          }
        }
      });

      if (!concurso) {
        console.error(`Concurso ${data.concursoId} no encontrado`);
        return;
      }

      // Verificar si el concurso está activo
      if (concurso.status !== 'ACTIVO') {
        console.log(`Concurso ${concurso.titulo} no está activo, saltando recordatorio`);
        return;
      }

      // Calcular tiempo restante
      const tiempoRestante = new Date(concurso.fecha_final).getTime() - new Date().getTime();
      const horasRestantes = Math.floor(tiempoRestante / (1000 * 60 * 60));

      // Solo enviar si quedan aproximadamente las horas especificadas
      if (horasRestantes > data.horasAntes + 2 || horasRestantes < data.horasAntes - 2) {
        console.log(`Tiempo restante (${horasRestantes}h) no coincide con recordatorio (${data.horasAntes}h)`);
        return;
      }

      console.log(`Enviando recordatorios de fecha límite para concurso: ${concurso.titulo}`);

      // Enviar notificaciones a todos los participantes inscritos
      for (const inscripcion of concurso.inscripciones) {
        const usuario = inscripcion.usuario;

        // Crear notificación en base de datos
        await this.createNotification({
          userId: usuario.id,
          tipo: 'deadline_reminder',
          titulo: `⏰ Recordatorio: ${concurso.titulo}`,
          mensaje: `La fecha límite para participar en "${concurso.titulo}" es en ${horasRestantes} horas. ¡No pierdas la oportunidad!`
        });

        // Enviar email
        if (usuario.email) {
          await this.emailService.sendDeadlineReminder(
            usuario.email,
            usuario.nombre || 'Participante',
            concurso.titulo
          );
        }
      }

      console.log(`Recordatorios enviados a ${concurso.inscripciones.length} participantes`);
    } catch (error) {
      console.error('Error enviando recordatorios de fecha límite:', error);
      throw error;
    }
  }

  /**
   * Notificar cuando se completa la evaluación de un medio
   * Requisito 12.2: Notificación cuando jurado completa evaluación
   */
  async sendEvaluationComplete(data: EvaluationCompleteData): Promise<void> {
    try {
      // Obtener información del medio y su autor
      const medio = await this.prisma.medio.findUnique({
        where: { id: data.medioId },
        include: {
          usuario: true,
          concurso: true,
          calificaciones: {
            where: { jurado_id: data.juradoId }
          }
        }
      });

      if (!medio) {
        console.error(`Medio ${data.medioId} no encontrado`);
        return;
      }

      if (medio.calificaciones.length === 0) {
        console.error(`No se encontró calificación del jurado ${data.juradoId} para medio ${data.medioId}`);
        return;
      }

      const usuario = medio.usuario;
      const concurso = medio.concurso;

      // Crear notificación en base de datos
      await this.createNotification({
        userId: usuario.id,
        tipo: 'evaluation_complete',
        titulo: `✅ Evaluación completada - ${concurso.titulo}`,
        mensaje: `Tu medio "${medio.titulo}" ha sido evaluado por el jurado en el concurso "${concurso.titulo}".`
      });

      // Enviar email
      if (usuario.email) {
        await this.emailService.sendEvaluationComplete(
          usuario.email,
          usuario.nombre || 'Participante',
          concurso.titulo
        );
      }

      console.log(`Notificación de evaluación completada enviada a ${usuario.nombre} por medio "${medio.titulo}"`);
    } catch (error) {
      console.error('Error enviando notificación de evaluación completada:', error);
      throw error;
    }
  }

  /**
   * Notificar cuando se publican los resultados de un concurso
   * Requisito 12.3: Notificación cuando se publican resultados
   */
  async sendResultsPublished(data: ResultsPublishedData): Promise<void> {
    try {
      // Obtener concurso con todos los participantes
      const concurso = await this.prisma.concurso.findUnique({
        where: { id: data.concursoId },
        include: {
          inscripciones: {
            include: {
              usuario: true
            }
          }
        }
      });

      if (!concurso) {
        console.error(`Concurso ${data.concursoId} no encontrado`);
        return;
      }

      // Verificar que el concurso esté finalizado
      if (concurso.status !== 'FINALIZADO') {
        console.log(`Concurso ${concurso.titulo} no está finalizado, no se pueden publicar resultados`);
        return;
      }

      console.log(`Enviando notificaciones de resultados para concurso: ${concurso.titulo}`);

      // Enviar notificaciones a todos los participantes
      for (const inscripcion of concurso.inscripciones) {
        const usuario = inscripcion.usuario;

        // Crear notificación en base de datos
        await this.createNotification({
          userId: usuario.id,
          tipo: 'results_published',
          titulo: `🏆 Resultados publicados - ${concurso.titulo}`,
          mensaje: `Los resultados del concurso "${concurso.titulo}" ya están disponibles. ¡Descubre quiénes fueron los ganadores!`
        });

        // Enviar email
        if (usuario.email) {
          await this.emailService.sendResultsPublished(
            usuario.email,
            usuario.nombre || 'Participante',
            concurso.titulo
          );
        }
      }

      console.log(`Notificaciones de resultados enviadas a ${concurso.inscripciones.length} participantes`);
    } catch (error) {
      console.error('Error enviando notificaciones de resultados:', error);
      throw error;
    }
  }

  /**
   * Notificar sobre nuevos concursos disponibles
   * Requisito 12.4: Notificación de nuevos concursos
   */
  async sendNewContestNotification(data: NewContestData): Promise<void> {
    try {
      // Obtener concurso
      const concurso = await this.prisma.concurso.findUnique({
        where: { id: data.concursoId }
      });

      if (!concurso) {
        console.error(`Concurso ${data.concursoId} no encontrado`);
        return;
      }

      // Verificar que el concurso esté activo
      if (concurso.status !== 'ACTIVO') {
        console.log(`Concurso ${concurso.titulo} no está activo, no se enviará notificación`);
        return;
      }

      // Obtener todos los usuarios registrados (excepto ADMIN y CONTENT_ADMIN)
      const usuarios = await this.prisma.usuario.findMany({
        where: {
          role: {
            in: ['PARTICIPANTE', 'JURADO']
          }
        }
      });

      console.log(`Enviando notificaciones de nuevo concurso: ${concurso.titulo} a ${usuarios.length} usuarios`);

      // Enviar notificaciones a todos los usuarios
      for (const usuario of usuarios) {
        // Crear notificación en base de datos
        await this.createNotification({
          userId: usuario.id,
          tipo: 'new_contest',
          titulo: `🎯 Nuevo concurso disponible - ${concurso.titulo}`,
          mensaje: `¡Tenemos un nuevo concurso disponible! "${concurso.titulo}" ya está abierto para participaciones. ¡No te pierdas esta oportunidad!`
        });

        // Enviar email
        if (usuario.email) {
          await this.emailService.sendNewContestNotification(
            usuario.email,
            usuario.nombre || 'Usuario',
            concurso.titulo
          );
        }
      }

      console.log(`Notificaciones de nuevo concurso enviadas a ${usuarios.length} usuarios`);
    } catch (error) {
      console.error('Error enviando notificaciones de nuevo concurso:', error);
      throw error;
    }
  }

  /**
   * Configurar recordatorios automáticos para concursos activos
   * Se ejecuta diariamente para verificar concursos próximos a vencer
   */
  setupDeadlineReminders(): void {
    // Ejecutar todos los días a las 9:00 AM
    const task = cron.schedule('0 9 * * *', async () => {
      console.log('Ejecutando verificación de recordatorios de fecha límite...');
      
      try {
        // Obtener concursos activos que vencen en las próximas 48 horas
        const fechaLimite = new Date();
        fechaLimite.setHours(fechaLimite.getHours() + 48);

        const concursosProximos = await this.prisma.concurso.findMany({
          where: {
            status: 'ACTIVO',
            fecha_final: {
              lte: fechaLimite,
              gte: new Date() // No incluir concursos ya vencidos
            }
          }
        });

        console.log(`Encontrados ${concursosProximos.length} concursos próximos a vencer`);

        // Enviar recordatorios para cada concurso
        for (const concurso of concursosProximos) {
          await this.sendDeadlineReminder({
            concursoId: concurso.id,
            horasAntes: 48
          });
        }
      } catch (error) {
        console.error('Error en verificación automática de recordatorios:', error);
      }
    });

    // Detener el trabajo por defecto para control manual
    task.stop();
    this.cronJobs.set('deadline-reminders', task);
    console.log('Recordatorios automáticos de fecha límite configurados');
  }

  /**
   * Configurar verificación automática de evaluaciones completadas
   * Se ejecuta cada hora para detectar nuevas evaluaciones
   */
  setupEvaluationNotifications(): void {
    // Ejecutar cada hora
    const task = cron.schedule('0 * * * *', async () => {
      console.log('Verificando evaluaciones completadas...');
      
      try {
        // Obtener calificaciones creadas en la última hora que no han sido notificadas
        const unaHoraAtras = new Date();
        unaHoraAtras.setHours(unaHoraAtras.getHours() - 1);

        const calificacionesRecientes = await this.prisma.calificacion.findMany({
          where: {
            fecha_calificacion: {
              gte: unaHoraAtras
            }
          },
          include: {
            medio: {
              include: {
                usuario: true,
                concurso: true
              }
            }
          }
        });

        console.log(`Encontradas ${calificacionesRecientes.length} evaluaciones recientes`);

        // Enviar notificaciones para cada evaluación
        for (const calificacion of calificacionesRecientes) {
          await this.sendEvaluationComplete({
            medioId: calificacion.medio_id,
            juradoId: calificacion.jurado_id
          });
        }
      } catch (error) {
        console.error('Error en verificación automática de evaluaciones:', error);
      }
    });

    // Detener el trabajo por defecto para control manual
    task.stop();
    this.cronJobs.set('evaluation-notifications', task);
    console.log('Notificaciones automáticas de evaluación configuradas');
  }

  /**
   * Iniciar todos los trabajos programados
   */
  startScheduledJobs(): void {
    console.log('Iniciando trabajos programados de notificaciones...');
    
    this.cronJobs.forEach((task, name) => {
      task.start();
      console.log(`Trabajo programado iniciado: ${name}`);
    });
  }

  /**
   * Detener todos los trabajos programados
   */
  stopScheduledJobs(): void {
    console.log('Deteniendo trabajos programados de notificaciones...');
    
    this.cronJobs.forEach((task, name) => {
      task.stop();
      console.log(`Trabajo programado detenido: ${name}`);
    });
  }

  /**
   * Obtener notificaciones de un usuario
   */
  async getUserNotifications(userId: string, page: number = 1, limit: number = 20): Promise<{
    notificaciones: any[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;

      const [notificaciones, total] = await Promise.all([
        this.prisma.notificacion.findMany({
          where: { usuario_id: userId },
          orderBy: { fecha_creacion: 'desc' },
          skip,
          take: limit
        }),
        this.prisma.notificacion.count({
          where: { usuario_id: userId }
        })
      ]);

      return {
        notificaciones,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Error obteniendo notificaciones del usuario:', error);
      throw error;
    }
  }

  /**
   * Marcar notificación como leída
   */
  async markAsRead(notificationId: number, userId: string): Promise<void> {
    try {
      await this.prisma.notificacion.updateMany({
        where: {
          id: notificationId,
          usuario_id: userId
        },
        data: {
          leida: true
        }
      });

      console.log(`Notificación ${notificationId} marcada como leída para usuario ${userId}`);
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
      throw error;
    }
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
      await this.prisma.notificacion.updateMany({
        where: {
          usuario_id: userId,
          leida: false
        },
        data: {
          leida: true
        }
      });

      console.log(`Todas las notificaciones marcadas como leídas para usuario ${userId}`);
    } catch (error) {
      console.error('Error marcando todas las notificaciones como leídas:', error);
      throw error;
    }
  }

  /**
   * Limpiar notificaciones antiguas (más de 30 días)
   */
  async cleanupOldNotifications(): Promise<void> {
    try {
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - 30);

      const result = await this.prisma.notificacion.deleteMany({
        where: {
          fecha_creacion: {
            lt: fechaLimite
          },
          leida: true
        }
      });

      console.log(`Eliminadas ${result.count} notificaciones antiguas`);
    } catch (error) {
      console.error('Error limpiando notificaciones antiguas:', error);
      throw error;
    }
  }
}

// Instancia singleton del servicio de notificaciones
let notificationServiceInstance: NotificationService | null = null;

export const getNotificationService = (prismaClient: PrismaClient): NotificationService => {
  if (!notificationServiceInstance) {
    notificationServiceInstance = new NotificationService(prismaClient);
  }
  return notificationServiceInstance;
};