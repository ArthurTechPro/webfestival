import { UserRole, ROLE_PERMISSIONS } from '../middleware/auth';
import { ContentType, ContentAction, CONTENT_ADMIN_PERMISSIONS } from '../middleware/contentAdmin.middleware';

/**
 * Utilidades para gestión de roles y permisos
 */
export class RoleUtils {
  /**
   * Verifica si un rol tiene un permiso específico
   */
  static hasPermission(role: UserRole, permission: string): boolean {
    const rolePermissions = ROLE_PERMISSIONS[role] || [];
    return rolePermissions.includes(permission);
  }

  /**
   * Obtiene todos los permisos de un rol
   */
  static getRolePermissions(role: UserRole): readonly string[] {
    return ROLE_PERMISSIONS[role] || [];
  }

  /**
   * Verifica si un rol es administrativo (ADMIN o CONTENT_ADMIN)
   */
  static isAdministrativeRole(role: UserRole): boolean {
    return role === 'ADMIN' || role === 'CONTENT_ADMIN';
  }

  /**
   * Verifica si un rol puede evaluar concursos
   */
  static canEvaluateContests(role: UserRole): boolean {
    return this.hasPermission(role, 'contest:evaluate');
  }

  /**
   * Verifica si un rol puede participar en concursos
   */
  static canParticipateInContests(role: UserRole): boolean {
    return this.hasPermission(role, 'contest:participate');
  }

  /**
   * Verifica si un rol puede gestionar contenido
   */
  static canManageContent(role: UserRole): boolean {
    return this.hasPermission(role, 'content:create') || 
           this.hasPermission(role, 'content:edit') ||
           this.hasPermission(role, 'cms:manage');
  }

  /**
   * Obtiene los roles que tienen un permiso específico
   */
  static getRolesWithPermission(permission: string): UserRole[] {
    return (Object.keys(ROLE_PERMISSIONS) as UserRole[]).filter(role =>
      this.hasPermission(role, permission)
    );
  }

  /**
   * Verifica si un CONTENT_ADMIN puede realizar una acción en un tipo de contenido
   */
  static canContentAdminPerformAction(role: UserRole, contentType: ContentType, action: ContentAction): boolean {
    if (role === 'ADMIN') return true;
    if (role !== 'CONTENT_ADMIN') return false;

    const requiredPermissions = CONTENT_ADMIN_PERMISSIONS[contentType]?.[action];
    if (!requiredPermissions) return false;

    return requiredPermissions.some((permission: string) => this.hasPermission(role, permission));
  }

  /**
   * Obtiene las acciones permitidas para un tipo de contenido
   */
  static getAllowedActionsForContentType(role: UserRole, contentType: ContentType): ContentAction[] {
    if (role === 'ADMIN') {
      return Object.keys(CONTENT_ADMIN_PERMISSIONS[contentType] || {}) as ContentAction[];
    }

    if (role !== 'CONTENT_ADMIN') return [];

    const contentPermissions = CONTENT_ADMIN_PERMISSIONS[contentType];
    if (!contentPermissions) return [];

    return Object.entries(contentPermissions)
      .filter(([_, permissions]) => 
        permissions.some((permission: string) => this.hasPermission(role, permission))
      )
      .map(([action]) => action as ContentAction);
  }

  /**
   * Verifica jerarquía de roles (si un rol tiene mayor o igual autoridad que otro)
   */
  static hasEqualOrHigherAuthority(userRole: UserRole, targetRole: UserRole): boolean {
    const roleHierarchy: Record<UserRole, number> = {
      'PARTICIPANTE': 1,
      'JURADO': 2,
      'CONTENT_ADMIN': 3,
      'ADMIN': 4
    };

    return roleHierarchy[userRole] >= roleHierarchy[targetRole];
  }

  /**
   * Obtiene el nivel de autoridad de un rol
   */
  static getRoleAuthorityLevel(role: UserRole): number {
    const roleHierarchy: Record<UserRole, number> = {
      'PARTICIPANTE': 1,
      'JURADO': 2,
      'CONTENT_ADMIN': 3,
      'ADMIN': 4
    };

    return roleHierarchy[role] || 0;
  }

  /**
   * Verifica si un usuario puede gestionar otro usuario basado en roles
   */
  static canManageUser(managerRole: UserRole, _targetRole: UserRole): boolean {
    // Solo ADMIN puede gestionar otros usuarios
    if (managerRole !== 'ADMIN') return false;
    
    // ADMIN puede gestionar cualquier rol
    return true;
  }

  /**
   * Verifica si un usuario puede asignar un rol específico
   */
  static canAssignRole(assignerRole: UserRole, _roleToAssign: UserRole): boolean {
    // Solo ADMIN puede asignar roles
    if (assignerRole !== 'ADMIN') return false;

    // ADMIN puede asignar cualquier rol
    return true;
  }

  /**
   * Obtiene los tipos de contenido que un rol puede gestionar
   */
  static getManageableContentTypes(role: UserRole): ContentType[] {
    if (role === 'ADMIN') {
      return Object.keys(CONTENT_ADMIN_PERMISSIONS) as ContentType[];
    }

    if (role !== 'CONTENT_ADMIN') return [];

    return (Object.keys(CONTENT_ADMIN_PERMISSIONS) as ContentType[]).filter(contentType =>
      Object.values(CONTENT_ADMIN_PERMISSIONS[contentType]).some(permissions =>
        permissions.some((permission: string) => this.hasPermission(role, permission))
      )
    );
  }

  /**
   * Genera un resumen de permisos para un rol
   */
  static generatePermissionsSummary(role: UserRole): {
    role: UserRole;
    permissions: readonly string[];
    canManageContent: boolean;
    canEvaluate: boolean;
    canParticipate: boolean;
    isAdministrative: boolean;
    authorityLevel: number;
    manageableContentTypes: ContentType[];
  } {
    return {
      role,
      permissions: this.getRolePermissions(role),
      canManageContent: this.canManageContent(role),
      canEvaluate: this.canEvaluateContests(role),
      canParticipate: this.canParticipateInContests(role),
      isAdministrative: this.isAdministrativeRole(role),
      authorityLevel: this.getRoleAuthorityLevel(role),
      manageableContentTypes: this.getManageableContentTypes(role)
    };
  }

  /**
   * Valida si una transición de rol es permitida
   */
  static isRoleTransitionAllowed(fromRole: UserRole, toRole: UserRole, assignerRole: UserRole): {
    allowed: boolean;
    reason?: string;
  } {
    // Solo ADMIN puede cambiar roles
    if (assignerRole !== 'ADMIN') {
      return {
        allowed: false,
        reason: 'Solo los administradores pueden cambiar roles de usuario'
      };
    }

    // No se puede cambiar de ADMIN a otro rol (protección)
    if (fromRole === 'ADMIN' && toRole !== 'ADMIN') {
      return {
        allowed: false,
        reason: 'No se puede degradar el rol de ADMIN por seguridad'
      };
    }

    // Todas las demás transiciones son permitidas para ADMIN
    return { allowed: true };
  }
}

/**
 * Decorador para métodos que requieren permisos específicos
 */
export function RequirePermission(permission: string) {
  return function (_target: any, _propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const req = args[0]; // Asumiendo que el primer argumento es Request
      
      if (!req.user) {
        throw new Error('Usuario no autenticado');
      }

      if (!RoleUtils.hasPermission(req.user.role as UserRole, permission)) {
        throw new Error(`Permiso requerido: ${permission}`);
      }

      return method.apply(this, args);
    };
  };
}

/**
 * Decorador para métodos que requieren roles específicos
 */
export function RequireRole(roles: UserRole | UserRole[]) {
  return function (_target: any, _propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const req = args[0]; // Asumiendo que el primer argumento es Request
      
      if (!req.user) {
        throw new Error('Usuario no autenticado');
      }

      const allowedRoles = Array.isArray(roles) ? roles : [roles];
      
      if (!allowedRoles.includes(req.user.role as UserRole)) {
        throw new Error(`Rol requerido: ${allowedRoles.join(' o ')}`);
      }

      return method.apply(this, args);
    };
  };
}

export default RoleUtils;