import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  authenticateToken,
  requireRole,
  requirePermission,
  hasPermission,
  getRolePermissions
} from '../src/middleware/auth';
import {
  canContentAdminPerformAction,
  getAllowedActionsForContentType
} from '../src/middleware/contentAdmin.middleware';
import { RoleUtils } from '../src/utils/roleUtils';
import jwt from 'jsonwebtoken';

// Mock JWT
jest.mock('jsonwebtoken');
const mockedJwt = jwt as jest.Mocked<typeof jwt>;

// Mock auth service
jest.mock('../src/services/auth.service', () => ({
  authService: {
    getUserById: jest.fn()
  }
}));

describe('Sistema de Roles y Permisos', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  beforeEach(() => {
    mockReq = {
      headers: {},
      params: {},
      body: {}
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    
    mockNext = jest.fn();
    
    // Reset JWT mock
    mockedJwt.verify.mockReset();
  });

  describe('Configuración de Permisos por Rol', () => {
    it('debe tener permisos correctos para PARTICIPANTE', () => {
      const permissions = getRolePermissions('PARTICIPANTE');
      
      expect(permissions).toContain('contest:view');
      expect(permissions).toContain('contest:participate');
      expect(permissions).toContain('media:upload');
      expect(permissions).toContain('media:view_own');
      expect(permissions).toContain('profile:edit_own');
      expect(permissions).toContain('comment:create');
      expect(permissions).toContain('follow:manage');
      
      // No debe tener permisos administrativos
      expect(permissions).not.toContain('contest:create');
      expect(permissions).not.toContain('user:manage');
    });

    it('debe tener permisos correctos para JURADO', () => {
      const permissions = getRolePermissions('JURADO');
      
      expect(permissions).toContain('contest:view');
      expect(permissions).toContain('contest:evaluate');
      expect(permissions).toContain('media:view_assigned');
      expect(permissions).toContain('evaluation:create');
      expect(permissions).toContain('evaluation:edit_own');
      expect(permissions).toContain('specialization:manage_own');
      
      // No debe tener permisos de participación
      expect(permissions).not.toContain('contest:participate');
      expect(permissions).not.toContain('media:upload');
    });

    it('debe tener permisos correctos para CONTENT_ADMIN', () => {
      const permissions = getRolePermissions('CONTENT_ADMIN');
      
      expect(permissions).toContain('content:create');
      expect(permissions).toContain('content:edit');
      expect(permissions).toContain('content:publish');
      expect(permissions).toContain('cms:manage');
      expect(permissions).toContain('blog:manage');
      expect(permissions).toContain('newsletter:manage');
      expect(permissions).toContain('seo:manage');
      
      // No debe tener permisos de concursos
      expect(permissions).not.toContain('contest:create');
      expect(permissions).not.toContain('user:manage');
    });

    it('debe tener todos los permisos para ADMIN', () => {
      const permissions = getRolePermissions('ADMIN');
      
      // Debe tener permisos administrativos
      expect(permissions).toContain('contest:create');
      expect(permissions).toContain('user:manage');
      expect(permissions).toContain('role:assign');
      expect(permissions).toContain('system:configure');
      
      // Debe tener permisos de otros roles también
      expect(permissions).toContain('contest:participate');
      expect(permissions).toContain('contest:evaluate');
      expect(permissions).toContain('content:create');
      expect(permissions).toContain('cms:manage');
    });
  });

  describe('Middleware de Autenticación', () => {
    it('debe rechazar requests sin token', () => {
      authenticateToken(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Token de acceso requerido',
        code: 'TOKEN_REQUIRED'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debe rechazar tokens inválidos', () => {
      mockReq.headers = { authorization: 'Bearer invalid-token' };
      mockedJwt.verify.mockImplementation(() => {
        throw new jwt.JsonWebTokenError('Invalid token');
      });
      
      authenticateToken(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Token inválido',
        code: 'TOKEN_INVALID'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debe aceptar tokens válidos', () => {
      const mockPayload = {
        userId: 'user123',
        email: 'test@example.com',
        role: 'PARTICIPANTE'
      };
      
      mockReq.headers = { authorization: 'Bearer valid-token' };
      mockedJwt.verify.mockReturnValue(mockPayload as any);
      
      authenticateToken(mockReq, mockRes, mockNext);
      
      expect(mockReq.user).toEqual(mockPayload);
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });

  describe('Middleware de Roles', () => {
    beforeEach(() => {
      mockReq.user = {
        userId: 'user123',
        email: 'test@example.com',
        role: 'PARTICIPANTE'
      };
    });

    it('debe permitir acceso con rol correcto', () => {
      const middleware = requireRole('PARTICIPANTE');
      middleware(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('debe rechazar acceso con rol incorrecto', () => {
      const middleware = requireRole('ADMIN');
      middleware(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Permisos insuficientes',
        code: 'INSUFFICIENT_PERMISSIONS',
        details: {
          required: ['ADMIN'],
          current: 'PARTICIPANTE'
        }
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debe permitir múltiples roles', () => {
      const middleware = requireRole(['PARTICIPANTE', 'JURADO']);
      middleware(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });

  describe('Middleware de Permisos', () => {
    beforeEach(() => {
      mockReq.user = {
        userId: 'user123',
        email: 'test@example.com',
        role: 'PARTICIPANTE'
      };
    });

    it('debe permitir acceso con permiso correcto', () => {
      const middleware = requirePermission('contest:view');
      middleware(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('debe rechazar acceso sin permiso', () => {
      const middleware = requirePermission('user:manage');
      middleware(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Permiso denegado',
        code: 'PERMISSION_DENIED',
        details: {
          required: 'user:manage',
          role: 'PARTICIPANTE'
        }
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Utilidades de Roles', () => {
    it('debe verificar permisos correctamente', () => {
      expect(RoleUtils.hasPermission('ADMIN', 'user:manage')).toBe(true);
      expect(RoleUtils.hasPermission('PARTICIPANTE', 'user:manage')).toBe(false);
      expect(RoleUtils.hasPermission('CONTENT_ADMIN', 'content:create')).toBe(true);
    });

    it('debe identificar roles administrativos', () => {
      expect(RoleUtils.isAdministrativeRole('ADMIN')).toBe(true);
      expect(RoleUtils.isAdministrativeRole('CONTENT_ADMIN')).toBe(true);
      expect(RoleUtils.isAdministrativeRole('PARTICIPANTE')).toBe(false);
      expect(RoleUtils.isAdministrativeRole('JURADO')).toBe(false);
    });

    it('debe verificar jerarquía de roles', () => {
      expect(RoleUtils.hasEqualOrHigherAuthority('ADMIN', 'PARTICIPANTE')).toBe(true);
      expect(RoleUtils.hasEqualOrHigherAuthority('PARTICIPANTE', 'ADMIN')).toBe(false);
      expect(RoleUtils.hasEqualOrHigherAuthority('CONTENT_ADMIN', 'JURADO')).toBe(true);
    });

    it('debe obtener tipos de contenido gestionables', () => {
      const adminTypes = RoleUtils.getManageableContentTypes('ADMIN');
      const contentAdminTypes = RoleUtils.getManageableContentTypes('CONTENT_ADMIN');
      const participanteTypes = RoleUtils.getManageableContentTypes('PARTICIPANTE');
      
      expect(adminTypes.length).toBeGreaterThan(0);
      expect(contentAdminTypes.length).toBeGreaterThan(0);
      expect(participanteTypes.length).toBe(0);
    });

    it('debe validar transiciones de roles', () => {
      const validTransition = RoleUtils.isRoleTransitionAllowed('PARTICIPANTE', 'JURADO', 'ADMIN');
      const invalidTransition = RoleUtils.isRoleTransitionAllowed('PARTICIPANTE', 'JURADO', 'PARTICIPANTE');
      const protectedTransition = RoleUtils.isRoleTransitionAllowed('ADMIN', 'PARTICIPANTE', 'ADMIN');
      
      expect(validTransition.allowed).toBe(true);
      expect(invalidTransition.allowed).toBe(false);
      expect(protectedTransition.allowed).toBe(false);
    });
  });

  describe('Funciones Helper', () => {
    it('debe verificar si CONTENT_ADMIN puede realizar acciones', () => {
      expect(canContentAdminPerformAction('CONTENT_ADMIN', 'blog_post', 'create')).toBe(true);
      expect(canContentAdminPerformAction('CONTENT_ADMIN', 'newsletter', 'create')).toBe(true);
      expect(canContentAdminPerformAction('PARTICIPANTE', 'blog_post', 'create')).toBe(false);
      expect(canContentAdminPerformAction('ADMIN', 'blog_post', 'create')).toBe(true);
    });

    it('debe obtener acciones permitidas por tipo de contenido', () => {
      const adminActions = getAllowedActionsForContentType('ADMIN', 'blog_post');
      const contentAdminActions = getAllowedActionsForContentType('CONTENT_ADMIN', 'blog_post');
      const participanteActions = getAllowedActionsForContentType('PARTICIPANTE', 'blog_post');
      
      expect(adminActions.length).toBeGreaterThan(0);
      expect(contentAdminActions.length).toBeGreaterThan(0);
      expect(participanteActions.length).toBe(0);
      
      expect(adminActions).toContain('create');
      expect(adminActions).toContain('edit');
      expect(contentAdminActions).toContain('create');
      expect(contentAdminActions).toContain('edit');
    });
  });

  describe('Casos Edge', () => {
    it('debe manejar usuarios sin autenticar', () => {
      // mockReq.user ya es undefined por defecto
      const middleware = requireRole('PARTICIPANTE');
      middleware(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debe manejar roles inexistentes', () => {
      mockReq.user = {
        userId: 'user123',
        email: 'test@example.com',
        role: 'INVALID_ROLE' as any
      };
      
      const middleware = requirePermission('contest:view');
      middleware(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debe manejar permisos inexistentes', () => {
      expect(hasPermission('ADMIN', 'nonexistent:permission')).toBe(false);
    });
  });
});