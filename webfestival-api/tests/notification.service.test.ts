/// <reference types="jest" />

// IMPORTANTE: NO IMPORTAR FUNCIONES DE 'node:test' - USAR JEST GLOBALS
// Jest proporciona describe, it, expect, beforeEach, afterEach globalmente
// El autofix de Kiro IDE puede agregar importaciones incorrectas - eliminarlas siempre

import { PrismaClient } from '@prisma/client';
import { NotificationService } from '../src/services/notification.service';

// Mock del servicio de email
const mockEmailService = {
  sendDeadlineReminder: jest.fn().mockResolvedValue(true),
  sendEvaluationComplete: jest.fn().mockResolvedValue(true),
  sendResultsPublished: jest.fn().mockResolvedValue(true),
  sendNewContestNotification: jest.fn().mockResolvedValue(true),
  testConnection: jest.fn().mockResolvedValue(true)
};

jest.mock('../src/services/email.service', () => ({
  getEmailService: jest.fn(() => mockEmailService)
}));

// Mock de Prisma
const mockPrisma = {
  notificacion: {
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    deleteMany: jest.fn()
  },
  usuario: {
    findMany: jest.fn()
  },
  concurso: {
    findMany: jest.fn(),
    findUnique: jest.fn()
  },
  medio: {
    findMany: jest.fn(),
    findUnique: jest.fn()
  },
  calificacion: {
    findMany: jest.fn()
  }
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma)
}));

describe('NotificationService', () => {
  let notificationService: NotificationService;

  beforeEach(() => {
    jest.clearAllMocks();
    notificationService = new NotificationService();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('createNotification', () => {
    it('debería crear una notificación exitosamente', async () => {
      const mockNotification = {
        id: 1,
        usuario_id: 'user-123',
        tipo: 'DEADLINE_REMINDER',
        titulo: 'Recordatorio de fecha límite',
        mensaje: 'El concurso termina pronto',
        leida: false,
        fecha_creacion: new Date()
      };

      mockPrisma.notificacion.create.mockResolvedValue(mockNotification);

      const result = await notificationService.createNotification(
        'user-123',
        'DEADLINE_REMINDER',
        'Recordatorio de fecha límite',
        'El concurso termina pronto'
      );

      expect(result).toEqual(mockNotification);
      expect(mockPrisma.notificacion.create).toHaveBeenCalledWith({
        data: {
          usuario_id: 'user-123',
          tipo: 'DEADLINE_REMINDER',
          titulo: 'Recordatorio de fecha límite',
          mensaje: 'El concurso termina pronto'
        }
      });
    });
  });

  describe('getUserNotifications', () => {
    it('debería obtener notificaciones del usuario con paginación', async () => {
      const mockNotifications = [
        {
          id: 1,
          usuario_id: 'user-123',
          tipo: 'DEADLINE_REMINDER',
          titulo: 'Recordatorio',
          mensaje: 'Mensaje de prueba',
          leida: false,
          fecha_creacion: new Date()
        }
      ];

      mockPrisma.notificacion.findMany.mockResolvedValue(mockNotifications);
      mockPrisma.notificacion.count.mockResolvedValue(1);

      const result = await notificationService.getUserNotifications('user-123', { page: 1, limit: 20 });

      expect(result.data).toEqual(mockNotifications);
      expect(result.pagination.total).toBe(1);
      expect(mockPrisma.notificacion.findMany).toHaveBeenCalledWith({
        where: { usuario_id: 'user-123' },
        orderBy: { fecha_creacion: 'desc' },
        skip: 0,
        take: 20
      });
    });
  });

  describe('markAsRead', () => {
    it('debería marcar una notificación como leída', async () => {
      const mockUpdatedNotification = {
        id: 1,
        usuario_id: 'user-123',
        tipo: 'DEADLINE_REMINDER',
        titulo: 'Recordatorio',
        mensaje: 'Mensaje de prueba',
        leida: true,
        fecha_creacion: new Date()
      };

      mockPrisma.notificacion.update.mockResolvedValue(mockUpdatedNotification);

      const result = await notificationService.markAsRead(1, 'user-123');

      expect(result).toEqual(mockUpdatedNotification);
      expect(mockPrisma.notificacion.update).toHaveBeenCalledWith({
        where: {
          id: 1,
          usuario_id: 'user-123'
        },
        data: { leida: true }
      });
    });
  });

  describe('sendDeadlineReminders', () => {
    it('debería enviar recordatorios de fecha límite', async () => {
      const mockConcursos = [
        {
          id: 1,
          titulo: 'Concurso de Fotografía',
          fecha_final: new Date(Date.now() + 48 * 60 * 60 * 1000), // En 48 horas
          inscripciones: [
            { usuario: { id: 'user-1', email: 'user1@test.com', nombre: 'Usuario 1' } },
            { usuario: { id: 'user-2', email: 'user2@test.com', nombre: 'Usuario 2' } }
          ]
        }
      ];

      mockPrisma.concurso.findMany.mockResolvedValue(mockConcursos);
      mockPrisma.notificacion.create.mockResolvedValue({});

      await notificationService.sendDeadlineReminders();

      expect(mockEmailService.sendDeadlineReminder).toHaveBeenCalledTimes(2);
      expect(mockPrisma.notificacion.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('sendEvaluationCompleteNotifications', () => {
    it('debería enviar notificaciones de evaluación completada', async () => {
      const mockMedios = [
        {
          id: 1,
          titulo: 'Foto de prueba',
          usuario: { id: 'user-1', email: 'user1@test.com', nombre: 'Usuario 1' },
          concurso: { id: 1, titulo: 'Concurso de Fotografía' },
          calificaciones: [
            { jurado_id: 'jurado-1', fecha_calificacion: new Date() }
          ]
        }
      ];

      mockPrisma.medio.findMany.mockResolvedValue(mockMedios);
      mockPrisma.notificacion.create.mockResolvedValue({});

      await notificationService.sendEvaluationCompleteNotifications();

      expect(mockEmailService.sendEvaluationComplete).toHaveBeenCalledTimes(1);
      expect(mockPrisma.notificacion.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('sendResultsPublishedNotifications', () => {
    it('debería enviar notificaciones de resultados publicados', async () => {
      const mockConcursos = [
        {
          id: 1,
          titulo: 'Concurso de Fotografía',
          status: 'FINALIZADO',
          inscripciones: [
            { usuario: { id: 'user-1', email: 'user1@test.com', nombre: 'Usuario 1' } }
          ]
        }
      ];

      mockPrisma.concurso.findMany.mockResolvedValue(mockConcursos);
      mockPrisma.notificacion.create.mockResolvedValue({});

      await notificationService.sendResultsPublishedNotifications();

      expect(mockEmailService.sendResultsPublished).toHaveBeenCalledTimes(1);
      expect(mockPrisma.notificacion.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('sendNewContestNotification', () => {
    it('debería enviar notificaciones de nuevo concurso', async () => {
      const mockConcurso = {
        id: 1,
        titulo: 'Nuevo Concurso',
        descripcion: 'Descripción del concurso',
        fecha_inicio: new Date(),
        fecha_final: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };

      const mockUsuarios = [
        { id: 'user-1', email: 'user1@test.com', nombre: 'Usuario 1' },
        { id: 'user-2', email: 'user2@test.com', nombre: 'Usuario 2' }
      ];

      mockPrisma.usuario.findMany.mockResolvedValue(mockUsuarios);
      mockPrisma.notificacion.create.mockResolvedValue({});

      await notificationService.sendNewContestNotification(mockConcurso);

      expect(mockEmailService.sendNewContestNotification).toHaveBeenCalledTimes(2);
      expect(mockPrisma.notificacion.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('getNotificationStats', () => {
    it('debería obtener estadísticas de notificaciones', async () => {
      mockPrisma.notificacion.count
        .mockResolvedValueOnce(50) // total
        .mockResolvedValueOnce(20) // no leídas
        .mockResolvedValueOnce(10) // deadline reminders
        .mockResolvedValueOnce(15) // evaluation complete
        .mockResolvedValueOnce(8)  // results published
        .mockResolvedValueOnce(17); // new contest

      const result = await notificationService.getNotificationStats('user-123');

      expect(result).toEqual({
        total: 50,
        unread: 20,
        byType: {
          DEADLINE_REMINDER: 10,
          EVALUATION_COMPLETE: 15,
          RESULTS_PUBLISHED: 8,
          NEW_CONTEST: 17
        }
      });
    });
  });

  describe('cleanupOldNotifications', () => {
    it('debería limpiar notificaciones antiguas', async () => {
      mockPrisma.notificacion.deleteMany.mockResolvedValue({ count: 25 });

      const result = await notificationService.cleanupOldNotifications(30); // 30 días

      expect(result).toBe(25);
      expect(mockPrisma.notificacion.deleteMany).toHaveBeenCalledWith({
        where: {
          fecha_creacion: {
            lt: expect.any(Date)
          }
        }
      });
    });
  });
});