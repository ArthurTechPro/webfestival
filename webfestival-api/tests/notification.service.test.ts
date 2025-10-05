/// <reference types="jest" />

// IMPORTANTE: NO IMPORTAR FUNCIONES DE 'node:test' - USAR JEST GLOBALS
// Jest proporciona describe, it, expect, beforeEach, afterEach globalmente
// El autofix de Kiro IDE puede agregar importaciones incorrectas - eliminarlas siempre

import { PrismaClient } from '@prisma/client';
import { NotificationService } from '../src/services/notification.service';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { afterEach } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';

// Mock del servicio de email
const mockEmailService = {
  sendDeadlineReminder: jest.fn().mockResolvedValue(true),
  sendEvaluationComplete: jest.fn().mockResolvedValue(true),
  sendResultsPublished: jest.fn().mockResolvedValue(true),
  sendNewContestNotification: jest.fn().mockResolvedValue(true),
  testConnection: jest.fn().mockResolvedValue(true)
};

jest.mock('../src/services/email.service', () => ({
  getEmailService: () => mockEmailService
}));

describe('NotificationService', () => {
  let prisma: PrismaClient;
  let notificationService: NotificationService;

  beforeEach(() => {
    // Crear instancia de Prisma para tests
    prisma = new PrismaClient();
    
    // Crear instancia del servicio de notificaciones
    notificationService = new NotificationService(prisma);

    // Mock de Prisma para evitar llamadas reales a la base de datos
    jest.spyOn(prisma.notificacion, 'create').mockResolvedValue({
      id: 1,
      usuario_id: 'test-user-id',
      tipo: 'test',
      titulo: 'Test Notification',
      mensaje: 'Test message',
      leida: false,
      fecha_creacion: new Date()
    });

    jest.spyOn(prisma.notificacion, 'findMany').mockResolvedValue([]);
    jest.spyOn(prisma.notificacion, 'count').mockResolvedValue(0);
    jest.spyOn(prisma.notificacion, 'updateMany').mockResolvedValue({ count: 1 });
    jest.spyOn(prisma.notificacion, 'deleteMany').mockResolvedValue({ count: 0 });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createNotification', () => {
    it('debería crear una notificación correctamente', async () => {
      const notificationData = {
        userId: 'test-user-id',
        tipo: 'test',
        titulo: 'Test Notification',
        mensaje: 'Test message'
      };

      await notificationService.createNotification(notificationData);

      expect(prisma.notificacion.create).toHaveBeenCalledWith({
        data: {
          usuario_id: 'test-user-id',
          tipo: 'test',
          titulo: 'Test Notification',
          mensaje: 'Test message',
          leida: false
        }
      });
    });

    it('debería manejar errores al crear notificación', async () => {
      jest.spyOn(prisma.notificacion, 'create').mockRejectedValue(new Error('Database error'));

      const notificationData = {
        userId: 'test-user-id',
        tipo: 'test',
        titulo: 'Test Notification',
        mensaje: 'Test message'
      };

      await expect(notificationService.createNotification(notificationData))
        .rejects.toThrow('Database error');
    });
  });

  describe('sendDeadlineReminder', () => {
    beforeEach(() => {
      // Mock para concurso con inscripciones
      jest.spyOn(prisma.concurso, 'findUnique').mockResolvedValue({
        id: 1,
        titulo: 'Test Contest',
        descripcion: 'Test Description',
        reglas: null,
        fecha_inicio: new Date(),
        fecha_final: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 horas desde ahora
        status: 'ACTIVO',
        imagen_url: null,
        max_envios: 3,
        tamano_max_mb: 10,
        created_at: new Date(),
        inscripciones: [
          {
            id: 1,
            usuario_id: 'user1',
            concurso_id: 1,
            fecha_inscripcion: new Date(),
            usuario: {
              id: 'user1',
              nombre: 'Usuario 1',
              email: 'user1@test.com',
              password: null,
              role: 'PARTICIPANTE',
              picture_url: null,
              bio: null,
              created_at: new Date(),
              updated_at: new Date()
            }
          }
        ]
      } as any);
    });

    it('debería enviar recordatorios de fecha límite correctamente', async () => {
      await notificationService.sendDeadlineReminder({
        concursoId: 1,
        horasAntes: 48
      });

      expect(prisma.concurso.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          inscripciones: {
            include: {
              usuario: true
            }
          }
        }
      });

      expect(prisma.notificacion.create).toHaveBeenCalled();
      expect(mockEmailService.sendDeadlineReminder).toHaveBeenCalledWith(
        'user1@test.com',
        'Usuario 1',
        'Test Contest'
      );
    });

    it('debería manejar concurso no encontrado', async () => {
      jest.spyOn(prisma.concurso, 'findUnique').mockResolvedValue(null);

      await notificationService.sendDeadlineReminder({
        concursoId: 999,
        horasAntes: 48
      });

      expect(mockEmailService.sendDeadlineReminder).not.toHaveBeenCalled();
    });

    it('debería saltear concursos no activos', async () => {
      jest.spyOn(prisma.concurso, 'findUnique').mockResolvedValue({
        id: 1,
        titulo: 'Test Contest',
        status: 'FINALIZADO',
        inscripciones: []
      } as any);

      await notificationService.sendDeadlineReminder({
        concursoId: 1,
        horasAntes: 48
      });

      expect(mockEmailService.sendDeadlineReminder).not.toHaveBeenCalled();
    });
  });

  describe('sendEvaluationComplete', () => {
    beforeEach(() => {
      // Mock para medio con usuario y concurso
      jest.spyOn(prisma.medio, 'findUnique').mockResolvedValue({
        id: 1,
        titulo: 'Test Media',
        tipo_medio: 'fotografia',
        usuario_id: 'user1',
        concurso_id: 1,
        categoria_id: 1,
        medio_url: 'test-url',
        thumbnail_url: null,
        preview_url: null,
        duracion: null,
        formato: 'jpg',
        tamano_archivo: BigInt(1000000),
        metadatos: null,
        fecha_subida: new Date(),
        usuario: {
          id: 'user1',
          nombre: 'Usuario 1',
          email: 'user1@test.com',
          password: null,
          role: 'PARTICIPANTE',
          picture_url: null,
          bio: null,
          created_at: new Date(),
          updated_at: new Date()
        },
        concurso: {
          id: 1,
          titulo: 'Test Contest',
          descripcion: 'Test Description',
          reglas: null,
          fecha_inicio: new Date(),
          fecha_final: new Date(),
          status: 'ACTIVO',
          imagen_url: null,
          max_envios: 3,
          tamano_max_mb: 10,
          created_at: new Date()
        },
        calificaciones: [
          {
            id: 1,
            medio_id: 1,
            jurado_id: 'jurado1',
            comentarios: 'Test comment',
            fecha_calificacion: new Date()
          }
        ]
      } as any);
    });

    it('debería enviar notificación de evaluación completada', async () => {
      await notificationService.sendEvaluationComplete({
        medioId: 1,
        juradoId: 'jurado1'
      });

      expect(prisma.medio.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          usuario: true,
          concurso: true,
          calificaciones: {
            where: { jurado_id: 'jurado1' }
          }
        }
      });

      expect(prisma.notificacion.create).toHaveBeenCalled();
      expect(mockEmailService.sendEvaluationComplete).toHaveBeenCalledWith(
        'user1@test.com',
        'Usuario 1',
        'Test Contest'
      );
    });

    it('debería manejar medio no encontrado', async () => {
      jest.spyOn(prisma.medio, 'findUnique').mockResolvedValue(null);

      await notificationService.sendEvaluationComplete({
        medioId: 999,
        juradoId: 'jurado1'
      });

      expect(mockEmailService.sendEvaluationComplete).not.toHaveBeenCalled();
    });
  });

  describe('sendResultsPublished', () => {
    beforeEach(() => {
      // Mock para concurso finalizado con inscripciones
      jest.spyOn(prisma.concurso, 'findUnique').mockResolvedValue({
        id: 1,
        titulo: 'Test Contest',
        status: 'FINALIZADO',
        inscripciones: [
          {
            id: 1,
            usuario_id: 'user1',
            concurso_id: 1,
            fecha_inscripcion: new Date(),
            usuario: {
              id: 'user1',
              nombre: 'Usuario 1',
              email: 'user1@test.com',
              password: null,
              role: 'PARTICIPANTE',
              picture_url: null,
              bio: null,
              created_at: new Date(),
              updated_at: new Date()
            }
          }
        ]
      } as any);
    });

    it('debería enviar notificaciones de resultados publicados', async () => {
      await notificationService.sendResultsPublished({
        concursoId: 1
      });

      expect(prisma.concurso.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          inscripciones: {
            include: {
              usuario: true
            }
          }
        }
      });

      expect(prisma.notificacion.create).toHaveBeenCalled();
      expect(mockEmailService.sendResultsPublished).toHaveBeenCalledWith(
        'user1@test.com',
        'Usuario 1',
        'Test Contest'
      );
    });

    it('debería saltear concursos no finalizados', async () => {
      jest.spyOn(prisma.concurso, 'findUnique').mockResolvedValue({
        id: 1,
        titulo: 'Test Contest',
        status: 'ACTIVO',
        inscripciones: []
      } as any);

      await notificationService.sendResultsPublished({
        concursoId: 1
      });

      expect(mockEmailService.sendResultsPublished).not.toHaveBeenCalled();
    });
  });

  describe('sendNewContestNotification', () => {
    beforeEach(() => {
      // Mock para concurso activo
      jest.spyOn(prisma.concurso, 'findUnique').mockResolvedValue({
        id: 1,
        titulo: 'New Test Contest',
        status: 'ACTIVO'
      } as any);

      // Mock para usuarios registrados
      jest.spyOn(prisma.usuario, 'findMany').mockResolvedValue([
        {
          id: 'user1',
          nombre: 'Usuario 1',
          email: 'user1@test.com',
          password: null,
          role: 'PARTICIPANTE',
          picture_url: null,
          bio: null,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 'jurado1',
          nombre: 'Jurado 1',
          email: 'jurado1@test.com',
          password: null,
          role: 'JURADO',
          picture_url: null,
          bio: null,
          created_at: new Date(),
          updated_at: new Date()
        }
      ]);
    });

    it('debería enviar notificaciones de nuevo concurso', async () => {
      await notificationService.sendNewContestNotification({
        concursoId: 1
      });

      expect(prisma.concurso.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      });

      expect(prisma.usuario.findMany).toHaveBeenCalledWith({
        where: {
          role: {
            in: ['PARTICIPANTE', 'JURADO']
          }
        }
      });

      expect(prisma.notificacion.create).toHaveBeenCalledTimes(2);
      expect(mockEmailService.sendNewContestNotification).toHaveBeenCalledTimes(2);
    });

    it('debería saltear concursos no activos', async () => {
      jest.spyOn(prisma.concurso, 'findUnique').mockResolvedValue({
        id: 1,
        titulo: 'Test Contest',
        status: 'PROXIMAMENTE'
      } as any);

      await notificationService.sendNewContestNotification({
        concursoId: 1
      });

      expect(mockEmailService.sendNewContestNotification).not.toHaveBeenCalled();
    });
  });

  describe('getUserNotifications', () => {
    it('debería obtener notificaciones del usuario con paginación', async () => {
      const mockNotifications = [
        {
          id: 1,
          usuario_id: 'user1',
          tipo: 'test',
          titulo: 'Test 1',
          mensaje: 'Message 1',
          leida: false,
          fecha_creacion: new Date()
        }
      ];

      jest.spyOn(prisma.notificacion, 'findMany').mockResolvedValue(mockNotifications);
      jest.spyOn(prisma.notificacion, 'count').mockResolvedValue(1);

      const result = await notificationService.getUserNotifications('user1', 1, 20);

      expect(result).toEqual({
        notificaciones: mockNotifications,
        total: 1,
        page: 1,
        totalPages: 1
      });

      expect(prisma.notificacion.findMany).toHaveBeenCalledWith({
        where: { usuario_id: 'user1' },
        orderBy: { fecha_creacion: 'desc' },
        skip: 0,
        take: 20
      });
    });
  });

  describe('markAsRead', () => {
    it('debería marcar notificación como leída', async () => {
      await notificationService.markAsRead(1, 'user1');

      expect(prisma.notificacion.updateMany).toHaveBeenCalledWith({
        where: {
          id: 1,
          usuario_id: 'user1'
        },
        data: {
          leida: true
        }
      });
    });
  });

  describe('markAllAsRead', () => {
    it('debería marcar todas las notificaciones como leídas', async () => {
      await notificationService.markAllAsRead('user1');

      expect(prisma.notificacion.updateMany).toHaveBeenCalledWith({
        where: {
          usuario_id: 'user1',
          leida: false
        },
        data: {
          leida: true
        }
      });
    });
  });

  describe('cleanupOldNotifications', () => {
    it('debería limpiar notificaciones antiguas', async () => {
      await notificationService.cleanupOldNotifications();

      expect(prisma.notificacion.deleteMany).toHaveBeenCalledWith({
        where: {
          fecha_creacion: {
            lt: expect.any(Date)
          },
          leida: true
        }
      });
    });
  });
});