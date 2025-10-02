/**
 * Índice de middlewares de autenticación y autorización
 * Exporta todos los middlewares de manera organizada
 */

// Middlewares de autenticación básica
export {
  authenticateToken,
  authenticateAndVerifyUser,
  requireRole,
  requirePermission,
  requireAllPermissions,
  requireAnyPermission,
  requireOwnershipOrRole,
  hasPermission,
  getRolePermissions,
  ROLE_PERMISSIONS,
  UserRole,
  // Guards específicos por rol
  requireAdmin,
  requireContentAdmin,
  requireJurado,
  requireParticipante,
  // Guards específicos para funcionalidades
  requireContentManagement,
  requireBlogManagement,
  requireSEOManagement,
  requireNewsletterManagement,
  requireContestManagement,
  requireEvaluationAccess,
  requireUserManagement,
  requireAnalyticsAccess
} from './auth';

// Guards específicos por rutas
export {
  ContestRouteGuards,
  UserRouteGuards,
  MediaRouteGuards,
  EvaluationRouteGuards,
  ContentRouteGuards,
  CommunityRouteGuards,
  SystemRouteGuards,
  createCompositeGuard,
  createOrGuard
} from './routeGuards.middleware';

// Middlewares específicos para CONTENT_ADMIN
export {
  requireContentAdminPermission,
  requireContentOwnershipOrAdmin,
  requireCommentModerationPermission,
  requireSEOManagementPermission,
  requireNewsletterPermission,
  requireCMSMediaUploadPermission,
  canContentAdminPerformAction,
  getAllowedActionsForContentType,
  ContentType,
  ContentAction,
  CONTENT_ADMIN_PERMISSIONS
} from './contentAdmin.middleware';

// Re-exportar utilidades de roles
export { RoleUtils, RequirePermission, RequireRole } from '../utils/roleUtils';