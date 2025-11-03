import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { JWTPayload } from '../types';
import { authService } from '../services/auth.service';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Tipos de roles disponibles en el sistema
 */
export const UserRole = {
  PARTICIPANTE: 'PARTICIPANTE',
  JURADO: 'JURADO',
  ADMIN: 'ADMIN',
  CONTENT_ADMIN: 'CONTENT_ADMIN'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

/**
 * Configuración de permisos por rol
 */
export const ROLE_PERMISSIONS: Record<UserRole, readonly string[]> = {
  PARTICIPANTE: [
    'contest:view',
    'contest:participate',
    'media:upload',
    'media:view_own',
    'profile:edit_own',
    'comment:create',
    'follow:manage'
  ] as const,
  JURADO: [
    'contest:view',
    'contest:evaluate',
    'media:view_assigned',
    'evaluation:create',
    'evaluation:edit_own',
    'profile:edit_own',
    'specialization:manage_own'
  ] as const,
  CONTENT_ADMIN: [
    'content:create',
    'content:edit',
    'content:publish',
    'content:delete',
    'cms:manage',
    'blog:manage',
    'newsletter:manage',
    'media:upload_cms',
    'seo:manage',
    'taxonomy:manage'
  ] as const,
  ADMIN: [
    'contest:create',
    'contest:edit',
    'contest:delete',
    'contest:manage_all',
    'user:manage',
    'role:assign',
    'jury:assign',
    'criteria:manage',
    'analytics:view',
    'system:configure',
    'subscription:manage',
    // Los ADMIN tienen todos los permisos de otros roles
    'contest:view',
    'contest:participate',
    'contest:evaluate',
    'media:upload',
    'media:view_own',
    'media:view_assigned',
    'profile:edit_own',
    'comment:create',
    'follow:manage',
    'evaluation:create',
    'evaluation:edit_own',
    'specialization:manage_own',
    'content:create',
    'content:edit',
    'content:publish',
    'content:delete',
    'cms:manage',
    'blog:manage',
    'newsletter:manage',
    'media:upload_cms',
    'seo:manage',
    'taxonomy:manage'
  ] as const
};

/**
 * Middleware de autenticación que verifica el token JWT
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Token de acceso requerido',
      code: 'TOKEN_REQUIRED'
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env['JWT_SECRET']!) as JWTPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'Token expirado',
        code: 'TOKEN_EXPIRED'
      });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(403).json({
        success: false,
        error: 'Token inválido',
        code: 'TOKEN_INVALID'
      });
    } else {
      res.status(403).json({
        success: false,
        error: 'Error de autenticación',
        code: 'AUTH_ERROR'
      });
    }
  }
};

/**
 * Middleware que requiere autenticación y verifica que el usuario existe en la base de datos
 */
export const authenticateAndVerifyUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Token de acceso requerido',
      code: 'TOKEN_REQUIRED'
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env['JWT_SECRET']!) as JWTPayload;
    
    // Verificar que el usuario aún existe en la base de datos
    const user = await authService.getUserById(decoded.userId);
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no encontrado',
        code: 'USER_NOT_FOUND'
      });
      return;
    }

    // Actualizar el payload con información fresca del usuario
    req.user = {
      ...decoded,
      role: user.role
    };
    
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'Token expirado',
        code: 'TOKEN_EXPIRED'
      });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(403).json({
        success: false,
        error: 'Token inválido',
        code: 'TOKEN_INVALID'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }
};

/**
 * Middleware que requiere uno o más roles específicos
 */
export const requireRole = (roles: UserRole | UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Autenticación requerida',
        code: 'AUTH_REQUIRED'
      });
      return;
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(req.user.role as UserRole)) {
      res.status(403).json({
        success: false,
        error: 'Permisos insuficientes',
        code: 'INSUFFICIENT_PERMISSIONS',
        details: {
          required: allowedRoles,
          current: req.user.role
        }
      });
      return;
    }

    next();
  };
};

/**
 * Middleware que verifica permisos específicos
 */
export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Autenticación requerida',
        code: 'AUTH_REQUIRED'
      });
      return;
    }

    const userRole = req.user.role as UserRole;
    const userPermissions = ROLE_PERMISSIONS[userRole] || [];

    if (!userPermissions.includes(permission)) {
      res.status(403).json({
        success: false,
        error: 'Permiso denegado',
        code: 'PERMISSION_DENIED',
        details: {
          required: permission,
          role: userRole
        }
      });
      return;
    }

    next();
  };
};

/**
 * Middleware que verifica múltiples permisos (requiere todos)
 */
export const requireAllPermissions = (permissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Autenticación requerida',
        code: 'AUTH_REQUIRED'
      });
      return;
    }

    const userRole = req.user.role as UserRole;
    const userPermissions = ROLE_PERMISSIONS[userRole] || [];

    const missingPermissions = permissions.filter(permission => !userPermissions.includes(permission));

    if (missingPermissions.length > 0) {
      res.status(403).json({
        success: false,
        error: 'Permisos insuficientes',
        code: 'INSUFFICIENT_PERMISSIONS',
        details: {
          missing: missingPermissions,
          role: userRole
        }
      });
      return;
    }

    next();
  };
};

/**
 * Middleware que verifica al menos uno de los permisos dados
 */
export const requireAnyPermission = (permissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Autenticación requerida',
        code: 'AUTH_REQUIRED'
      });
      return;
    }

    const userRole = req.user.role as UserRole;
    const userPermissions = ROLE_PERMISSIONS[userRole] || [];

    const hasAnyPermission = permissions.some(permission => userPermissions.includes(permission));

    if (!hasAnyPermission) {
      res.status(403).json({
        success: false,
        error: 'Permisos insuficientes',
        code: 'INSUFFICIENT_PERMISSIONS',
        details: {
          required_any: permissions,
          role: userRole
        }
      });
      return;
    }

    next();
  };
};

/**
 * Middleware que verifica que el usuario puede acceder a sus propios recursos
 */
export const requireOwnershipOrRole = (roles: UserRole | UserRole[], userIdParam: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Autenticación requerida',
        code: 'AUTH_REQUIRED'
      });
      return;
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    const targetUserId = req.params[userIdParam] || req.body[userIdParam];

    // Si es el propietario del recurso, permitir acceso
    if (req.user.userId === targetUserId) {
      next();
      return;
    }

    // Si no es el propietario, verificar roles
    if (!allowedRoles.includes(req.user.role as UserRole)) {
      res.status(403).json({
        success: false,
        error: 'Solo puedes acceder a tus propios recursos o necesitas permisos administrativos',
        code: 'OWNERSHIP_OR_ROLE_REQUIRED',
        details: {
          required_roles: allowedRoles,
          current_role: req.user.role
        }
      });
      return;
    }

    next();
  };
};

// Guards específicos por rol
export const requireAdmin = requireRole(['ADMIN']);
export const requireContentAdmin = requireRole(['ADMIN', 'CONTENT_ADMIN']);
export const requireJurado = requireRole(['ADMIN', 'JURADO']);
export const requireParticipante = requireRole(['PARTICIPANTE', 'JURADO', 'ADMIN']);

// Guards específicos para CONTENT_ADMIN
export const requireContentManagement = requireAnyPermission(['content:create', 'content:edit', 'cms:manage']);
export const requireBlogManagement = requireAnyPermission(['blog:manage', 'content:edit']);
export const requireSEOManagement = requirePermission('seo:manage');
export const requireNewsletterManagement = requirePermission('newsletter:manage');

// Guards para funcionalidades específicas
export const requireContestManagement = requireAnyPermission(['contest:create', 'contest:edit', 'contest:manage_all']);
export const requireEvaluationAccess = requireAnyPermission(['contest:evaluate', 'evaluation:create']);
export const requireUserManagement = requirePermission('user:manage');
export const requireAnalyticsAccess = requirePermission('analytics:view');

/**
 * Función helper para verificar si un usuario tiene un permiso específico
 */
export const hasPermission = (userRole: UserRole, permission: string): boolean => {
  const userPermissions = ROLE_PERMISSIONS[userRole] || [];
  return userPermissions.includes(permission);
};

/**
 * Función helper para obtener todos los permisos de un rol
 */
export const getRolePermissions = (role: UserRole): readonly string[] => {
  return ROLE_PERMISSIONS[role] || [];
};

export default {
  authenticateToken,
  authenticateAndVerifyUser,
  requireRole,
  requirePermission,
  requireAllPermissions,
  requireAnyPermission,
  requireOwnershipOrRole,
  requireAdmin,
  requireContentAdmin,
  requireJurado,
  requireParticipante,
  requireContentManagement,
  requireBlogManagement,
  requireSEOManagement,
  requireNewsletterManagement,
  requireContestManagement,
  requireEvaluationAccess,
  requireUserManagement,
  requireAnalyticsAccess,
  hasPermission,
  getRolePermissions,
  ROLE_PERMISSIONS
};