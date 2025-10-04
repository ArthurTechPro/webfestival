import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import { userService } from '../services/user.service';

// Mock de Prisma
jest.mock('@prisma/client');

const mockPrisma = {
  usuario: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  seguimiento: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  juradoEspecializacion: {
    findMany: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
    updateMany: jest.fn(),
  },
  categoria: {
    findUnique: jest.fn(),
  },
  juradoAsignacion: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
};

// Mock del constructor de PrismaClient
(PrismaClient as jest.MockedClass<typeof PrismaClient>).mockImplementation(() => mockPrisma as any);

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getUserById', () => {
    it('debería retornar un usuario cuando existe', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        nombre: 'Test User',
        role: 'PARTICIPANTE',
        picture_url: null,
        bio: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPrisma.usuario.findUnique.mockResolvedValue(mockUser);

      const result = await userService.getUserById('user-123');

      expect(result).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        nombre: 'Test User',
        role: 'PARTICIPANTE',
        picture_url: undefined,
        bio: undefined,
        createdAt: mockUser.created_at,
        updatedAt: mockUser.updated_at,
      });

      expect(mockPrisma.usuario.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' }
      });
    });

    it('debería retornar null cuando el usuario no existe', async () => {
      mockPrisma.usuario.findUnique.mockResolvedValue(null);

      const result = await userService.getUserById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('followUser', () => {
    it('debería crear un seguimiento exitosamente', async () => {
      const mockUsuarioASeguir = {
        id: 'user-456',
        email: 'seguido@example.com',
        nombre: 'Usuario Seguido',
        role: 'PARTICIPANTE',
      };

      const mockSeguimiento = {
        id: 1,
        seguidor_id: 'user-123',
        seguido_id: 'user-456',
        fecha_seguimiento: new Date(),
      };

      mockPrisma.usuario.findUnique.mockResolvedValue(mockUsuarioASeguir);
      mockPrisma.seguimiento.findUnique.mockResolvedValue(null);
      mockPrisma.seguimiento.create.mockResolvedValue(mockSeguimiento);

      const result = await userService.followUser('user-123', 'user-456');

      expect(result).toEqual({
        id: 1,
        seguidor_id: 'user-123',
        seguido_id: 'user-456',
        fecha_seguimiento: mockSeguimiento.fecha_seguimiento,
      });

      expect(mockPrisma.seguimiento.create).toHaveBeenCalledWith({
        data: {
          seguidor_id: 'user-123',
          seguido_id: 'user-456',
        }
      });
    });

    it('debería lanzar error si intenta seguirse a sí mismo', async () => {
      await expect(userService.followUser('user-123', 'user-123'))
        .rejects.toThrow('No puedes seguirte a ti mismo');
    });

    it('debería lanzar error si el usuario a seguir no existe', async () => {
      mockPrisma.usuario.findUnique.mockResolvedValue(null);

      await expect(userService.followUser('user-123', 'user-456'))
        .rejects.toThrow('Usuario no encontrado');
    });

    it('debería lanzar error si ya sigue al usuario', async () => {
      const mockUsuarioASeguir = {
        id: 'user-456',
        email: 'seguido@example.com',
        nombre: 'Usuario Seguido',
        role: 'PARTICIPANTE',
      };

      const mockSeguimientoExistente = {
        id: 1,
        seguidor_id: 'user-123',
        seguido_id: 'user-456',
        fecha_seguimiento: new Date(),
      };

      mockPrisma.usuario.findUnique.mockResolvedValue(mockUsuarioASeguir);
      mockPrisma.seguimiento.findUnique.mockResolvedValue(mockSeguimientoExistente);

      await expect(userService.followUser('user-123', 'user-456'))
        .rejects.toThrow('Ya sigues a este usuario');
    });
  });

  describe('createJuradoEspecializacion', () => {
    it('debería crear especializaciones para un jurado', async () => {
      const mockJurado = {
        id: 'jurado-123',
        email: 'jurado@example.com',
        nombre: 'Jurado Test',
        role: 'JURADO',
      };

      const mockEspecializacion = {
        id: 1,
        usuario_id: 'jurado-123',
        especializacion: 'fotografia',
        experiencia_anios: 5,
        certificaciones: ['Certificación A'],
        portfolio_url: 'https://portfolio.com',
      };

      mockPrisma.usuario.findUnique.mockResolvedValue(mockJurado);
      mockPrisma.juradoEspecializacion.deleteMany.mockResolvedValue({ count: 0 });
      mockPrisma.juradoEspecializacion.create.mockResolvedValue(mockEspecializacion);

      const especializacionData = {
        especializaciones: ['fotografia' as const],
        experiencia_años: 5,
        certificaciones: ['Certificación A'],
        portfolio_url: 'https://portfolio.com',
      };

      const result = await userService.createJuradoEspecializacion('jurado-123', especializacionData);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 1,
        usuario_id: 'jurado-123',
        especializacion: 'fotografia',
        experiencia_años: 5,
        certificaciones: ['Certificación A'],
        portfolio_url: 'https://portfolio.com',
      });

      expect(mockPrisma.juradoEspecializacion.deleteMany).toHaveBeenCalledWith({
        where: { usuario_id: 'jurado-123' }
      });
    });

    it('debería lanzar error si el usuario no es jurado', async () => {
      const mockUsuario = {
        id: 'user-123',
        email: 'user@example.com',
        nombre: 'Usuario Normal',
        role: 'PARTICIPANTE',
      };

      mockPrisma.usuario.findUnique.mockResolvedValue(mockUsuario);

      const especializacionData = {
        especializaciones: ['fotografia' as const],
      };

      await expect(userService.createJuradoEspecializacion('user-123', especializacionData))
        .rejects.toThrow('Solo los jurados pueden tener especializaciones');
    });
  });

  describe('searchUsers', () => {
    it('debería buscar usuarios con filtros', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          email: 'user1@example.com',
          nombre: 'Usuario 1',
          role: 'PARTICIPANTE',
          picture_url: null,
          bio: null,
          created_at: new Date(),
          updated_at: new Date(),
          _count: {
            seguimientos_seguidor: 5,
            seguimientos_seguido: 10,
            medios: 3,
          },
          jurado_especializaciones: [],
        },
      ];

      mockPrisma.usuario.findMany.mockResolvedValue(mockUsers);
      mockPrisma.usuario.count.mockResolvedValue(1);
      mockPrisma.seguimiento.findMany.mockResolvedValue([]);

      const filters = {
        role: 'PARTICIPANTE' as const,
        page: 1,
        limit: 20,
      };

      const result = await userService.searchUsers(filters, 'current-user');

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(result.data[0]?.role).toBe('PARTICIPANTE');
    });
  });
});