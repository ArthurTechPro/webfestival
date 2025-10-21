import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '../contexts/NavigationContext';
import navigationService from '../services/navigation.service';
import type { MenuItem, SubMenuItem } from '../services/navigation.service';

/**
 * Hook personalizado para navegación basada en roles
 * Proporciona utilidades específicas para la navegación según el rol del usuario
 */
export const useRoleBasedNavigation = () => {
  const { user } = useAuth();
  const { 
    navigateTo, 
    hasPermissionForRoute, 
    isValidRoute, 
    getAvailableRoutes,
    updateBreadcrumbs 
  } = useNavigation();

  /**
   * Navega a una ruta verificando permisos primero
   */
  const navigateWithPermissionCheck = useCallback((route: string) => {
    if (!user) {
      console.warn('Usuario no autenticado, no se puede navegar');
      return false;
    }

    if (!hasPermissionForRoute(route)) {
      console.warn(`Usuario ${user.role} no tiene permisos para acceder a ${route}`);
      return false;
    }

    navigateTo(route);
    updateBreadcrumbs(route);
    return true;
  }, [user, hasPermissionForRoute, navigateTo, updateBreadcrumbs]);

  /**
   * Obtiene el menú principal filtrado por rol
   */
  const getMainMenuForCurrentUser = useCallback(() => {
    if (!user) return [];
    
    const navigation = navigationService.getNavigationForRole(user.role);
    return navigationService.filterMenuByPermissions(navigation.sideMenu, user);
  }, [user]);

  /**
   * Obtiene las opciones del menú de usuario
   */
  const getUserMenuForCurrentUser = useCallback(() => {
    if (!user) return [];
    
    return navigationService.getUserMenuOptions(user.role);
  }, [user]);

  /**
   * Verifica si el usuario actual puede acceder a una funcionalidad específica
   */
  const canAccessFeature = useCallback((featureRoute: string) => {
    if (!user) return false;
    
    return isValidRoute(featureRoute) && hasPermissionForRoute(featureRoute);
  }, [user, isValidRoute, hasPermissionForRoute]);

  /**
   * Obtiene la ruta por defecto para el rol del usuario
   */
  const getDefaultRouteForUser = useCallback(() => {
    if (!user) return '/';
    
    const availableRoutes = getAvailableRoutes();
    
    // Rutas por defecto según el rol
    const defaultRoutes = {
      'PARTICIPANTE': '/app/dashboard',
      'JURADO': '/app/dashboard',
      'ADMIN': '/app/dashboard',
      'CONTENT_ADMIN': '/app/dashboard'
    };

    const preferredRoute = defaultRoutes[user.role as keyof typeof defaultRoutes];
    
    // Verificar si la ruta preferida está disponible
    if (preferredRoute && availableRoutes.includes(preferredRoute)) {
      return preferredRoute;
    }
    
    // Devolver la primera ruta disponible como fallback
    return availableRoutes.length > 0 ? availableRoutes[0] : '/';
  }, [user, getAvailableRoutes]);

  /**
   * Encuentra un elemento del menú por su ID
   */
  const findMenuItemById = useCallback((itemId: string): MenuItem | SubMenuItem | null => {
    const menuItems = getMainMenuForCurrentUser();
    
    for (const item of menuItems) {
      if (item.id === itemId) {
        return item;
      }
      
      if (item.submenu) {
        for (const subItem of item.submenu) {
          if (subItem.id === itemId) {
            return subItem;
          }
        }
      }
    }
    
    return null;
  }, [getMainMenuForCurrentUser]);

  /**
   * Obtiene estadísticas de navegación para el usuario actual
   */
  const getNavigationStats = useCallback(() => {
    if (!user) {
      return {
        totalMenuItems: 0,
        availableRoutes: 0,
        hasSubmenuItems: false,
        userRole: null
      };
    }

    const menuItems = getMainMenuForCurrentUser();
    const availableRoutes = getAvailableRoutes();
    const hasSubmenuItems = menuItems.some(item => item.submenu && item.submenu.length > 0);

    return {
      totalMenuItems: menuItems.length,
      availableRoutes: availableRoutes.length,
      hasSubmenuItems,
      userRole: user.role
    };
  }, [user, getMainMenuForCurrentUser, getAvailableRoutes]);

  /**
   * Verifica si el usuario tiene acceso a funcionalidades administrativas
   */
  const hasAdminAccess = useCallback(() => {
    return user?.role === 'ADMIN';
  }, [user]);

  /**
   * Verifica si el usuario tiene acceso a funcionalidades de gestión de contenido
   */
  const hasContentAdminAccess = useCallback(() => {
    return user?.role === 'CONTENT_ADMIN' || user?.role === 'ADMIN';
  }, [user]);

  /**
   * Verifica si el usuario tiene acceso a funcionalidades de jurado
   */
  const hasJuryAccess = useCallback(() => {
    return user?.role === 'JURADO' || user?.role === 'ADMIN';
  }, [user]);

  /**
   * Obtiene las rutas de navegación rápida según el rol
   */
  const getQuickNavigationRoutes = useCallback(() => {
    if (!user) return [];

    const quickRoutes = {
      'PARTICIPANTE': [
        { label: 'Dashboard', route: '/app/dashboard', icon: 'home' },
        { label: 'Concursos', route: '/app/contests', icon: 'trophy' },
        { label: 'Mis Envíos', route: '/app/submissions', icon: 'upload' },
        { label: 'Galería', route: '/app/gallery', icon: 'image' }
      ],
      'JURADO': [
        { label: 'Dashboard', route: '/app/dashboard', icon: 'home' },
        { label: 'Evaluaciones', route: '/app/evaluations', icon: 'clipboard-check' },
        { label: 'Progreso', route: '/app/progress', icon: 'bar-chart' }
      ],
      'ADMIN': [
        { label: 'Dashboard', route: '/app/dashboard', icon: 'home' },
        { label: 'Concursos', route: '/app/admin/contests', icon: 'trophy' },
        { label: 'Usuarios', route: '/app/admin/users', icon: 'users' },
        { label: 'Métricas', route: '/app/admin/metrics', icon: 'bar-chart' }
      ],
      'CONTENT_ADMIN': [
        { label: 'Dashboard', route: '/app/dashboard', icon: 'home' },
        { label: 'CMS', route: '/app/cms', icon: 'edit' },
        { label: 'Blog', route: '/app/blog', icon: 'file-text' },
        { label: 'Newsletter', route: '/app/newsletter', icon: 'mail' }
      ]
    };

    const userQuickRoutes = quickRoutes[user.role as keyof typeof quickRoutes] || [];
    
    // Filtrar solo las rutas a las que el usuario tiene acceso
    return userQuickRoutes.filter(route => hasPermissionForRoute(route.route));
  }, [user, hasPermissionForRoute]);

  /**
   * Navega al dashboard del usuario
   */
  const navigateToDashboard = useCallback(() => {
    const defaultRoute = getDefaultRouteForUser();
    return navigateWithPermissionCheck(defaultRoute);
  }, [getDefaultRouteForUser, navigateWithPermissionCheck]);

  return {
    // Navegación
    navigateWithPermissionCheck,
    navigateToDashboard,
    getDefaultRouteForUser,
    
    // Menús
    getMainMenuForCurrentUser,
    getUserMenuForCurrentUser,
    findMenuItemById,
    
    // Permisos
    canAccessFeature,
    hasAdminAccess,
    hasContentAdminAccess,
    hasJuryAccess,
    
    // Utilidades
    getNavigationStats,
    getQuickNavigationRoutes,
    getAvailableRoutes,
    
    // Estado del usuario
    currentUserRole: user?.role || null,
    isAuthenticated: !!user
  };
};

export default useRoleBasedNavigation;