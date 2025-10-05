/// <reference types="jest" />

// IMPORTANTE: NO IMPORTAR FUNCIONES DE 'node:test' - USAR JEST GLOBALS
// Jest proporciona describe, it, expect, beforeEach, afterEach globalmente

import { Request, Response, NextFunction } from 'express';
import { authenticateToken, requireRole } from '../src/middleware/auth.middleware';
import { AuthService } from '../src/services/auth.service';
import { JWTPayload } from '../src/types';

// Mock del AuthService
const mockAuthService = {
  validateToken: jest.fn()
};

jest.mock('../src/services/auth.service', () => ({
  AuthService: jest.fn(() => mockAuthService)
}));

describe('Auth Middleware Tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnThis();
    mockNext = jest.fn();

    mockResponse = {
      json: mockJson,
      status: mockStatus
    };

    mockRequest = {
      headers: {},
      user: undefined
    };

    jest.clearAllMocks();
  });

  describe('authenticateToken middleware', () => {
    it('debería autenticar token válido exitosamente', async () => {
      // Arrange
      const validToken = 'Bearer valid-jwt-token';
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        nombre: 'Test User',
        role: 'PARTICIPANTE',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockRequest.headers = { authorization: validToken };
      mockAuthService.validateToken.mockResolvedValue(mockUser);

      // Act
      await authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockAuthService.validateToken).toHaveBeenCalledWith('valid-jwt-token');
      expect(mockRequest.user).toEqual({
        id: mockUser.id,
        userId: mockUser.id,
        email: mockUser.email,
        role: mockUser.role
      });
      expect(mockNext).toHaveBeenCalled();
      expect(mockStatus).not.toHaveBeenCalled();
    });

    it('debería fallar sin header de autorización', async () => {
      // Arrange
      mockRequest.headers = {};

      // Act
      await authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Token de acceso requerido'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debería fallar con formato de token inválido', async () => {
      // Arrange
      mockRequest.headers = { authorization: 'InvalidFormat token' };

      // Act
      await authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Formato de token inválido'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debería fallar con token sin Bearer prefix', async () => {
      // Arrange
      mockRequest.headers = { authorization: 'just-a-token' };

      // Act
      await authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Formato de token inválido'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debería fallar con token inválido', async () => {
      // Arrange
      mockRequest.headers = { authorization: 'Bearer invalid-token' };
      mockAuthService.validateToken.mockRejectedValue(new Error('Token inválido'));

      // Act
      await authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockAuthService.validateToken).toHaveBeenCalledWith('invalid-token');
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Token inválido'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debería fallar con token expirado', async () => {
      // Arrange
      mockRequest.headers = { authorization: 'Bearer expired-token' };
      const expiredError = new Error('Token expired');
      expiredError.name = 'TokenExpiredError';
      mockAuthService.validateToken.mockRejectedValue(expiredError);

      // Act
      await authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Token expirado'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debería manejar errores internos del servicio', async () => {
      // Arrange
      mockRequest.headers = { authorization: 'Bearer valid-token' };
      mockAuthService.validateToken.mockRejectedValue(new Error('Database connection failed'));

      // Act
      await authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Error interno del servidor'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debería manejar diferentes formatos de header Authorization', async () => {
      // Test con espacios extra
      mockRequest.headers = { authorization: '  Bearer   valid-token  ' };
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        nombre: 'Test User',
        role: 'PARTICIPANTE',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockAuthService.validateToken.mockResolvedValue(mockUser);

      await authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockAuthService.validateToken).toHaveBeenCalledWith('valid-token');
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('requireRole middleware', () => {
    beforeEach(() => {
      // Simular usuario autenticado
      mockRequest.user = {
        id: 'user-123',
        userId: 'user-123',
        email: 'test@example.com',
        role: 'PARTICIPANTE'
      } as JWTPayload;
    });

    it('debería permitir acceso con rol correcto', async () => {
      // Arrange
      const roleMiddleware = requireRole(['PARTICIPANTE']);

      // Act
      await roleMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(mockStatus).not.toHaveBeenCalled();
    });

    it('debería permitir acceso con múltiples roles válidos', async () => {
      // Arrange
      const roleMiddleware = requireRole(['ADMIN', 'PARTICIPANTE', 'JURADO']);

      // Act
      await roleMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(mockStatus).not.toHaveBeenCalled();
    });

    it('debería denegar acceso con rol incorrecto', async () => {
      // Arrange
      const roleMiddleware = requireRole(['ADMIN']);

      // Act
      await roleMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Acceso denegado: rol insuficiente'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debería denegar acceso sin usuario autenticado', async () => {
      // Arrange
      mockRequest.user = undefined;
      const roleMiddleware = requireRole(['PARTICIPANTE']);

      // Act
      await roleMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Usuario no autenticado'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debería manejar roles case-sensitive correctamente', async () => {
      // Arrange
      mockRequest.user!.role = 'admin'; // lowercase
      const roleMiddleware = requireRole(['ADMIN']); // uppercase

      // Act
      await roleMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Acceso denegado: rol insuficiente'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debería permitir acceso a ADMIN para cualquier recurso', async () => {
      // Arrange
      mockRequest.user!.role = 'ADMIN';
      const roleMiddleware = requireRole(['JURADO']); // Requiere JURADO pero usuario es ADMIN

      // Act
      await roleMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(mockStatus).not.toHaveBeenCalled();
    });

    it('debería manejar array vacío de roles requeridos', async () => {
      // Arrange
      const roleMiddleware = requireRole([]);

      // Act
      await roleMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(mockStatus).not.toHaveBeenCalled();
    });
  });

  describe('Integración de middlewares', () => {
    it('debería funcionar en cadena: autenticación + autorización', async () => {
      // Arrange
      const mockUser = {
        id: 'admin-123',
        email: 'admin@example.com',
        nombre: 'Admin User',
        role: 'ADMIN',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockRequest.headers = { authorization: 'Bearer valid-admin-token' };
      mockAuthService.validateToken.mockResolvedValue(mockUser);

      const roleMiddleware = requireRole(['ADMIN']);

      // Act - Primero autenticación
      await authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Verificar que la autenticación fue exitosa
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockRequest.user).toBeDefined();

      // Reset mock para el siguiente middleware
      mockNext.mockClear();

      // Act - Luego autorización
      await roleMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockStatus).not.toHaveBeenCalled();
    });

    it('debería fallar en autorización si autenticación falla', async () => {
      // Arrange
      mockRequest.headers = { authorization: 'Bearer invalid-token' };
      mockAuthService.validateToken.mockRejectedValue(new Error('Token inválido'));

      const roleMiddleware = requireRole(['ADMIN']);

      // Act - Primero autenticación (debería fallar)
      await authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert - Autenticación falló
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockRequest.user).toBeUndefined();

      // Reset mocks
      mockNext.mockClear();
      mockStatus.mockClear();
      mockJson.mockClear();

      // Act - Intentar autorización sin usuario autenticado
      await roleMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert - Autorización también falla
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(401);
    });
  });

  describe('Casos edge y seguridad', () => {
    it('debería manejar tokens extremadamente largos', async () => {
      // Arrange
      const longToken = 'Bearer ' + 'a'.repeat(10000);
      mockRequest.headers = { authorization: longToken };
      mockAuthService.validateToken.mockRejectedValue(new Error('Token too long'));

      // Act
      await authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debería manejar caracteres especiales en tokens', async () => {
      // Arrange
      const specialToken = 'Bearer token-with-special-chars!@#$%^&*()';
      mockRequest.headers = { authorization: specialToken };
      mockAuthService.validateToken.mockRejectedValue(new Error('Invalid characters'));

      // Act
      await authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockAuthService.validateToken).toHaveBeenCalledWith('token-with-special-chars!@#$%^&*()');
      expect(mockStatus).toHaveBeenCalledWith(401);
    });

    it('debería prevenir inyección de roles', async () => {
      // Arrange
      mockRequest.user = {
        id: 'user-123',
        userId: 'user-123',
        email: 'test@example.com',
        role: 'PARTICIPANTE; DROP TABLE usuarios; --'
      } as JWTPayload;

      const roleMiddleware = requireRole(['ADMIN']);

      // Act
      await roleMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});