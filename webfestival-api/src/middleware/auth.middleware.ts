// Re-export from auth.ts for compatibility
export { 
  authenticateToken,
  authenticateAndVerifyUser,
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