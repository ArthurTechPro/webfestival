import { Request, Response, NextFunction } from 'express';
import { hasPermission, UserRole } from './auth';

/**
 * Tipos de contenido que puede gestionar un CONTENT_ADMIN
 */
export type ContentType = 'pagina_estatica' | 'blog_post' | 'seccion_cms' | 'contenido_educativo' | 'newsletter';

/**
 * Acciones disponibles para gestión de contenido
 */
export type ContentAction = 'create' | 'edit' | 'publish' | 'delete' | 'moderate' | 'seo_manage';

/**
 * Configuración de permisos específicos para CONTENT_ADMIN por tipo de contenido
 */
export const CONTENT_ADMIN_PERMISSIONS: Record<ContentType, Record<string, readonly string[]>> = {
  pagina_estatica: {
    create: ['content:create', 'cms:manage'],
    edit: ['content:edit', 'cms:manage'],
    publish: ['content:publish', 'cms:manage'],
    delete: ['content:delete', 'cms:manage'],
    seo_manage: ['seo:manage']
  },
  blog_post: {
    create: ['content:create', 'blog:manage'],
    edit: ['content:edit', 'blog:manage'],
    publish: ['content:publish', 'blog:manage'],
    delete: ['content:delete', 'blog:manage'],
    moderate: ['blog:manage'],
    seo_manage: ['seo:manage']
  },
  seccion_cms: {
    create: ['cms:manage'],
    edit: ['cms:manage'],
    publish: ['cms:manage'],
    delete: ['cms:manage'],
    seo_manage: ['seo:manage']
  },
  contenido_educativo: {
    create: ['content:create', 'blog:manage'],
    edit: ['content:edit', 'blog:manage'],
    publish: ['content:publish', 'blog:manage'],
    delete: ['content:delete', 'blog:manage'],
    seo_manage: ['seo:manage']
  },
  newsletter: {
    create: ['newsletter:manage'],
    edit: ['newsletter:manage'],
    publish: ['newsletter:manage'],
    delete: ['newsletter:manage']
  }
};

/**
 * Middleware que valida permisos específicos de CONTENT_ADMIN para un tipo de contenido y acción
 */
export const requireContentAdminPermission = (contentType: ContentType, action: ContentAction) => {
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
    
    // Los ADMIN tienen acceso completo
    if (userRole === 'ADMIN') {
      next();
      return;
    }

    // Verificar si es CONTENT_ADMIN
    if (userRole !== 'CONTENT_ADMIN') {
      res.status(403).json({
        success: false,
        error: 'Se requiere rol de administrador de contenido',
        code: 'CONTENT_ADMIN_REQUIRED',
        details: {
          required_role: 'CONTENT_ADMIN',
          current_role: userRole
        }
      });
      return;
    }

    // Verificar permisos específicos para el tipo de contenido y acción
    const requiredPermissions = CONTENT_ADMIN_PERMISSIONS[contentType]?.[action];
    
    if (!requiredPermissions) {
      res.status(400).json({
        success: false,
        error: 'Tipo de contenido o acción no válida',
        code: 'INVALID_CONTENT_TYPE_OR_ACTION',
        details: {
          content_type: contentType,
          action: action
        }
      });
      return;
    }

    // Verificar si el usuario tiene al menos uno de los permisos requeridos
    const hasRequiredPermission = requiredPermissions.some((permission: string) => 
      hasPermission(userRole, permission)
    );

    if (!hasRequiredPermission) {
      res.status(403).json({
        success: false,
        error: 'Permisos insuficientes para esta acción de contenido',
        code: 'INSUFFICIENT_CONTENT_PERMISSIONS',
        details: {
          content_type: contentType,
          action: action,
          required_permissions: requiredPermissions,
          role: userRole
        }
      });
      return;
    }

    next();
  };
};

/**
 * Middleware que valida que el usuario puede editar contenido específico
 * Verifica ownership o permisos administrativos
 */
export const requireContentOwnershipOrAdmin = (authorIdParam: string = 'authorId') => {
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
    const contentAuthorId = req.params[authorIdParam] || req.body[authorIdParam];

    // Los ADMIN pueden editar cualquier contenido
    if (userRole === 'ADMIN') {
      next();
      return;
    }

    // Los CONTENT_ADMIN pueden editar contenido de otros si tienen permisos
    if (userRole === 'CONTENT_ADMIN' && hasPermission(userRole, 'content:edit')) {
      next();
      return;
    }

    // Verificar ownership del contenido
    if (req.user['userId'] === contentAuthorId) {
      next();
      return;
    }

    res.status(403).json({
      success: false,
      error: 'Solo puedes editar tu propio contenido o necesitas permisos administrativos',
      code: 'CONTENT_OWNERSHIP_REQUIRED',
      details: {
        author_id: contentAuthorId,
        user_id: req.user['userId'],
        role: userRole
      }
    });
  };
};

/**
 * Middleware que valida permisos para moderación de comentarios
 */
export const requireCommentModerationPermission = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Autenticación requerida',
      code: 'AUTH_REQUIRED'
    });
    return;
  }

  const userRole = req.user.role as UserRole;

  // Los ADMIN tienen acceso completo
  if (userRole === 'ADMIN') {
    next();
    return;
  }

  // Los CONTENT_ADMIN pueden moderar si tienen permisos de blog
  if (userRole === 'CONTENT_ADMIN' && hasPermission(userRole, 'blog:manage')) {
    next();
    return;
  }

  res.status(403).json({
    success: false,
    error: 'Permisos insuficientes para moderar comentarios',
    code: 'MODERATION_PERMISSION_REQUIRED',
    details: {
      role: userRole,
      required_permissions: ['blog:manage']
    }
  });
};

/**
 * Middleware que valida permisos para gestión de SEO
 */
export const requireSEOManagementPermission = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Autenticación requerida',
      code: 'AUTH_REQUIRED'
    });
    return;
  }

  const userRole = req.user.role as UserRole;

  // Los ADMIN tienen acceso completo
  if (userRole === 'ADMIN') {
    next();
    return;
  }

  // Verificar permisos específicos de SEO
  if (!hasPermission(userRole, 'seo:manage')) {
    res.status(403).json({
      success: false,
      error: 'Permisos insuficientes para gestión de SEO',
      code: 'SEO_PERMISSION_REQUIRED',
      details: {
        role: userRole,
        required_permission: 'seo:manage'
      }
    });
    return;
  }

  next();
};

/**
 * Middleware que valida permisos para gestión de newsletter
 */
export const requireNewsletterPermission = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Autenticación requerida',
      code: 'AUTH_REQUIRED'
    });
    return;
  }

  const userRole = req.user.role as UserRole;

  // Los ADMIN tienen acceso completo
  if (userRole === 'ADMIN') {
    next();
    return;
  }

  // Verificar permisos específicos de newsletter
  if (!hasPermission(userRole, 'newsletter:manage')) {
    res.status(403).json({
      success: false,
      error: 'Permisos insuficientes para gestión de newsletter',
      code: 'NEWSLETTER_PERMISSION_REQUIRED',
      details: {
        role: userRole,
        required_permission: 'newsletter:manage'
      }
    });
    return;
  }

  next();
};

/**
 * Middleware que valida permisos para subida de medios en CMS
 */
export const requireCMSMediaUploadPermission = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Autenticación requerida',
      code: 'AUTH_REQUIRED'
    });
    return;
  }

  const userRole = req.user.role as UserRole;

  // Los ADMIN tienen acceso completo
  if (userRole === 'ADMIN') {
    next();
    return;
  }

  // Verificar permisos específicos para subida de medios en CMS
  if (!hasPermission(userRole, 'media:upload_cms')) {
    res.status(403).json({
      success: false,
      error: 'Permisos insuficientes para subir medios al CMS',
      code: 'CMS_MEDIA_PERMISSION_REQUIRED',
      details: {
        role: userRole,
        required_permission: 'media:upload_cms'
      }
    });
    return;
  }

  next();
};

/**
 * Función helper para verificar si un CONTENT_ADMIN puede realizar una acción específica
 */
export const canContentAdminPerformAction = (userRole: UserRole, contentType: ContentType, action: ContentAction): boolean => {
  if (userRole === 'ADMIN') return true;
  if (userRole !== 'CONTENT_ADMIN') return false;

  const requiredPermissions = CONTENT_ADMIN_PERMISSIONS[contentType]?.[action];
  if (!requiredPermissions) return false;

  return requiredPermissions.some((permission: string) => hasPermission(userRole, permission));
};

/**
 * Función helper para obtener las acciones permitidas para un tipo de contenido
 */
export const getAllowedActionsForContentType = (userRole: UserRole, contentType: ContentType): ContentAction[] => {
  if (userRole === 'ADMIN') {
    return Object.keys(CONTENT_ADMIN_PERMISSIONS[contentType] || {}) as ContentAction[];
  }

  if (userRole !== 'CONTENT_ADMIN') return [];

  const contentPermissions = CONTENT_ADMIN_PERMISSIONS[contentType];
  if (!contentPermissions) return [];

  return Object.entries(contentPermissions)
    .filter(([_, permissions]) => 
      permissions.some((permission: string) => hasPermission(userRole, permission))
    )
    .map(([action]) => action as ContentAction);
};

export default {
  requireContentAdminPermission,
  requireContentOwnershipOrAdmin,
  requireCommentModerationPermission,
  requireSEOManagementPermission,
  requireNewsletterPermission,
  requireCMSMediaUploadPermission,
  canContentAdminPerformAction,
  getAllowedActionsForContentType,
  CONTENT_ADMIN_PERMISSIONS
};