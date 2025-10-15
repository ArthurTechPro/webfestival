import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook personalizado para navegación basada en roles
 */
export const useRoleBasedNavigation = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  /**
   * Obtiene la ruta del dashboard según el rol del usuario
   */
  const getDashboardRoute = (role?: string): string => {
    const userRole = role || user?.role;
    
    switch (userRole) {
      case 'PARTICIPANTE':
        return '/participante/dashboard';
      case 'JURADO':
        return '/jurado/dashboard';
      case 'ADMIN':
        return '/admin/dashboard';
      case 'CONTENT_ADMIN':
        return '/content-admin/dashboard';
      default:
        return '/unauthorized';
    }
  };

  /**
   * Navega al dashboard apropiado según el rol del usuario
   */
  const navigateToDashboard = (role?: string): void => {
    const route = getDashboardRoute(role);
    navigate(route, { replace: true });
  };

  /**
   * Verifica si el usuario puede acceder a una ruta específica
   */
  const canAccessRoute = (requiredRoles: string[]): boolean => {
    if (!isAuthenticated || !user) {
      return false;
    }
    
    return requiredRoles.length === 0 || requiredRoles.includes(user.role);
  };

  /**
   * Obtiene todas las rutas disponibles para el usuario actual
   */
  const getAvailableRoutes = () => {
    if (!isAuthenticated || !user) {
      return [];
    }

    const baseRoutes = [
      { path: '/profile', name: 'Mi Perfil', roles: ['PARTICIPANTE', 'JURADO', 'ADMIN', 'CONTENT_ADMIN'] },
    ];

    const roleSpecificRoutes = {
      PARTICIPANTE: [
        { path: '/participante/dashboard', name: 'Dashboard' },
        { path: '/participante/concursos', name: 'Mis Concursos' },
        { path: '/participante/envios', name: 'Mis Envíos' },
        { path: '/participante/comunidad', name: 'Comunidad' },
      ],
      JURADO: [
        { path: '/jurado/dashboard', name: 'Panel de Evaluación' },
        { path: '/jurado/asignaciones', name: 'Mis Asignaciones' },
        { path: '/jurado/evaluaciones', name: 'Evaluaciones' },
        { path: '/jurado/especializacion', name: 'Mi Especialización' },
      ],
      ADMIN: [
        { path: '/admin/dashboard', name: 'Panel de Administración' },
        { path: '/admin/concursos', name: 'Gestión de Concursos' },
        { path: '/admin/usuarios', name: 'Gestión de Usuarios' },
        { path: '/admin/jurados', name: 'Asignación de Jurados' },
        { path: '/admin/criterios', name: 'Criterios de Evaluación' },
        { path: '/admin/metricas', name: 'Métricas y Analytics' },
        { path: '/admin/suscripciones', name: 'Suscripciones' },
      ],
      CONTENT_ADMIN: [
        { path: '/content-admin/dashboard', name: 'Gestión de Contenido' },
        { path: '/content-admin/cms', name: 'CMS Dinámico' },
        { path: '/content-admin/blog', name: 'Blog de la Comunidad' },
        { path: '/content-admin/educativo', name: 'Contenido Educativo' },
        { path: '/content-admin/moderacion', name: 'Moderación' },
        { path: '/content-admin/analytics', name: 'Analytics de Contenido' },
      ],
    };

    const userRoutes = roleSpecificRoutes[user.role as keyof typeof roleSpecificRoutes] || [];
    
    return [
      ...userRoutes,
      ...baseRoutes.filter(route => route.roles.includes(user.role)),
    ];
  };

  return {
    getDashboardRoute,
    navigateToDashboard,
    canAccessRoute,
    getAvailableRoutes,
  };
};