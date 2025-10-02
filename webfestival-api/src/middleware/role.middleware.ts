// Re-export from auth.ts for compatibility
export { 
  requireRole, 
  requireAdmin, 
  requireContentAdmin, 
  requireJurado,
  requireParticipante,
  requirePermission,
  requireAllPermissions,
  requireAnyPermission,
  requireOwnershipOrRole,
  hasPermission,
  getRolePermissions,
  ROLE_PERMISSIONS,
  UserRole
} from './auth';