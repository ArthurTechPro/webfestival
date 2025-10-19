// Exportar todos los componentes de autenticación de WebFestival
export { default as LoginForm } from './LoginForm';
export { default as AuthFormProfessional } from './AuthFormProfessional';
// export { default as AuthFormAdaptive } from './AuthFormAdaptive';
export { default as RoleBasedRedirect } from './RoleBasedRedirect';
export { default as ProtectedRoute } from './ProtectedRoute';

// Tipos relacionados con autenticación
export type { LoginCredentials, RegisterData } from '../../types/auth';