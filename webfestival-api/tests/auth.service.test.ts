/// <reference types="jest" />

// IMPORTANTE: NO IMPORTAR FUNCIONES DE 'node:test' - USAR JEST GLOBALS
// Jest proporciona describe, it, expect, beforeEach, afterEach globalmente

import { AuthService } from '../src/services/auth.service';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock de Prisma
const mockPrisma = {
  usuario: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  }
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma)
}));

// Mock de bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn()
}));

// Mock de jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn()
}));

describe('AuthService', () => {
  let authService: AuthService;
  const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
  const mockJwt = jwt as jest.Mocked<typeof jwt>;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService();
  });

  describe('register', () => {
    it('debería registrar un nuevo usuario exitosamente', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        nombre: 'Test User'
      };

      const hashedPassword = 'hashed_password_123';
      const mockUser = {
        id: 'user-123',
        email: userData.email,
        nombre: userData.nombre,
        password: hashedPassword,
        role: 'PARTICIPANTE',
        picture_url: null,
        bio: null,
        created_at: new Date(),
        updated_at: new Date()
      };

      mockPrisma.usuario.findUnique.mockResolvedValue(null); // Usuario no existe
      mockBcrypt.hash.mockResolvedValue(hashedPassword as never);
      mockPrisma.usuario.create.mockResolvedValue(mockUser);

      const result = await authService.register(userData);

      expect(mockPrisma.usuario.findUnique).toHaveBeenCalledWith({
        where: { email: userData.email }
      });
      expect(mockBcrypt.hash).toHaveBeenCalledWith(userData.password, 12);
      expect(mockPrisma.usuario.create).toHaveBeenCalledWith({
        data: {
          email: userData.email,
          password: hashedPassword,
          nombre: userData.nombre,
          role: 'PARTICIPANTE'
        }
      });
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        nombre: mockUser.nombre,
        role: mockUser.role,
        picture_url: undefined,
        bio: undefined,
        createdAt: mockUser.created_at,
        updatedAt: mockUser.updated_at
      });
    });

    it('debería fallar si el usuario ya existe', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        nombre: 'Existing User'
      };

      const existingUser = {
        id: 'existing-user',
        email: userData.email,
        nombre: userData.nombre,
        password: 'hashed_password',
        role: 'PARTICIPANTE'
      };

      mockPrisma.usuario.findUnique.mockResolvedValue(existingUser);

      await expect(authService.register(userData))
        .rejects.toThrow('El usuario ya existe');

      expect(mockPrisma.usuario.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('debería autenticar usuario exitosamente', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockUser = {
        id: 'user-123',
        email: loginData.email,
        password: 'hashed_password',
        nombre: 'Test User',
        role: 'PARTICIPANTE',
        picture_url: null,
        bio: null,
        created_at: new Date(),
        updated_at: new Date()
      };

      const mockTokens = {
        accessToken: 'access_token_123',
        refreshToken: 'refresh_token_123'
      };

      mockPrisma.usuario.findUnique.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(true as never);
      mockJwt.sign
        .mockReturnValueOnce(mockTokens.accessToken as never)
        .mockReturnValueOnce(mockTokens.refreshToken as never);

      const result = await authService.login(loginData);

      expect(mockPrisma.usuario.findUnique).toHaveBeenCalledWith({
        where: { email: loginData.email }
      });
      expect(mockBcrypt.compare).toHaveBeenCalledWith(loginData.password, mockUser.password);
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          nombre: mockUser.nombre,
          role: mockUser.role,
          picture_url: undefined,
          bio: undefined,
          createdAt: mockUser.created_at,
          updatedAt: mockUser.updated_at
        },
        tokens: mockTokens
      });
    });

    it('debería fallar con credenciales inválidas', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrong_password'
      };

      mockPrisma.usuario.findUnique.mockResolvedValue(null);

      await expect(authService.login(loginData))
        .rejects.toThrow('Credenciales inválidas');
    });

    it('debería fallar con contraseña incorrecta', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrong_password'
      };

      const mockUser = {
        id: 'user-123',
        email: loginData.email,
        password: 'hashed_password',
        nombre: 'Test User',
        role: 'PARTICIPANTE'
      };

      mockPrisma.usuario.findUnique.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(false as never);

      await expect(authService.login(loginData))
        .rejects.toThrow('Credenciales inválidas');
    });
  });

  describe('validateToken', () => {
    it('debería validar token exitosamente', async () => {
      const token = 'valid_token_123';
      const decodedPayload = {
        id: 'user-123',
        userId: 'user-123',
        email: 'test@example.com',
        role: 'PARTICIPANTE'
      };

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        nombre: 'Test User',
        role: 'PARTICIPANTE',
        picture_url: null,
        bio: null,
        created_at: new Date(),
        updated_at: new Date()
      };

      mockJwt.verify.mockReturnValue(decodedPayload as never);
      mockPrisma.usuario.findUnique.mockResolvedValue(mockUser);

      const result = await authService.validateToken(token);

      expect(mockJwt.verify).toHaveBeenCalledWith(token, process.env['JWT_SECRET']);
      expect(mockPrisma.usuario.findUnique).toHaveBeenCalledWith({
        where: { id: decodedPayload.id }
      });
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        nombre: mockUser.nombre,
        role: mockUser.role,
        picture_url: undefined,
        bio: undefined,
        createdAt: mockUser.created_at,
        updatedAt: mockUser.updated_at
      });
    });

    it('debería fallar con token inválido', async () => {
      const token = 'invalid_token';

      mockJwt.verify.mockImplementation(() => {
        throw new Error('Token inválido');
      });

      await expect(authService.validateToken(token))
        .rejects.toThrow('Token inválido');
    });

    it('debería fallar si el usuario no existe', async () => {
      const token = 'valid_token_123';
      const decodedPayload = {
        id: 'nonexistent-user',
        userId: 'nonexistent-user',
        email: 'test@example.com',
        role: 'PARTICIPANTE'
      };

      mockJwt.verify.mockReturnValue(decodedPayload as never);
      mockPrisma.usuario.findUnique.mockResolvedValue(null);

      await expect(authService.validateToken(token))
        .rejects.toThrow('Usuario no encontrado');
    });
  });

  describe('refreshToken', () => {
    it('debería renovar token exitosamente', async () => {
      const refreshToken = 'valid_refresh_token';
      const decodedPayload = {
        id: 'user-123',
        userId: 'user-123',
        email: 'test@example.com',
        role: 'PARTICIPANTE'
      };

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        nombre: 'Test User',
        role: 'PARTICIPANTE',
        picture_url: null,
        bio: null,
        created_at: new Date(),
        updated_at: new Date()
      };

      const newTokens = {
        accessToken: 'new_access_token',
        refreshToken: 'new_refresh_token'
      };

      mockJwt.verify.mockReturnValue(decodedPayload as never);
      mockPrisma.usuario.findUnique.mockResolvedValue(mockUser);
      mockJwt.sign
        .mockReturnValueOnce(newTokens.accessToken as never)
        .mockReturnValueOnce(newTokens.refreshToken as never);

      const result = await authService.refreshToken(refreshToken);

      expect(mockJwt.verify).toHaveBeenCalledWith(refreshToken, process.env['JWT_REFRESH_SECRET']);
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          nombre: mockUser.nombre,
          role: mockUser.role,
          picture_url: undefined,
          bio: undefined,
          createdAt: mockUser.created_at,
          updatedAt: mockUser.updated_at
        },
        tokens: newTokens
      });
    });

    it('debería fallar con refresh token inválido', async () => {
      const refreshToken = 'invalid_refresh_token';

      mockJwt.verify.mockImplementation(() => {
        throw new Error('Token inválido');
      });

      await expect(authService.refreshToken(refreshToken))
        .rejects.toThrow('Refresh token inválido');
    });
  });

  describe('generateTokens', () => {
    it('debería generar tokens correctamente', () => {
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'PARTICIPANTE'
      };

      const expectedTokens = {
        accessToken: 'access_token_123',
        refreshToken: 'refresh_token_123'
      };

      mockJwt.sign
        .mockReturnValueOnce(expectedTokens.accessToken as never)
        .mockReturnValueOnce(expectedTokens.refreshToken as never);

      const result = authService.generateTokens(user);

      expect(mockJwt.sign).toHaveBeenCalledTimes(2);
      expect(mockJwt.sign).toHaveBeenNthCalledWith(1, 
        {
          id: user.id,
          userId: user.id,
          email: user.email,
          role: user.role
        },
        process.env['JWT_SECRET'],
        { expiresIn: process.env['JWT_EXPIRES_IN'] }
      );
      expect(mockJwt.sign).toHaveBeenNthCalledWith(2,
        {
          id: user.id,
          userId: user.id,
          email: user.email,
          role: user.role
        },
        process.env['JWT_REFRESH_SECRET'],
        { expiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] }
      );
      expect(result).toEqual(expectedTokens);
    });
  });

  describe('updateProfile', () => {
    it('debería actualizar perfil exitosamente', async () => {
      const userId = 'user-123';
      const updateData = {
        nombre: 'Nuevo Nombre',
        bio: 'Nueva biografía',
        picture_url: 'https://example.com/photo.jpg'
      };

      const updatedUser = {
        id: userId,
        email: 'test@example.com',
        nombre: updateData.nombre,
        role: 'PARTICIPANTE',
        picture_url: updateData.picture_url,
        bio: updateData.bio,
        created_at: new Date(),
        updated_at: new Date()
      };

      mockPrisma.usuario.update.mockResolvedValue(updatedUser);

      const result = await authService.updateProfile(userId, updateData);

      expect(mockPrisma.usuario.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateData
      });
      expect(result).toEqual({
        id: updatedUser.id,
        email: updatedUser.email,
        nombre: updatedUser.nombre,
        role: updatedUser.role,
        picture_url: updatedUser.picture_url,
        bio: updatedUser.bio,
        createdAt: updatedUser.created_at,
        updatedAt: updatedUser.updated_at
      });
    });
  });
});