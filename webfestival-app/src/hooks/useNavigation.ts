
import { useNavigation as useNavigationContext } from '../contexts/NavigationContext';
import type { NavigationContextType } from '../contexts/NavigationContext';

/**
 * Hook personalizado para acceder al estado y funciones de navegación
 * Proporciona acceso completo al sistema de navegación
 */
export const useNavigation = (): NavigationContextType => {
  return useNavigationContext();
};

/**
 * Hook simplificado para acciones de navegación comunes
 */
export const useNavigationActions = () => {
  const { navigateTo, executeAction, setActiveMenuItem } = useNavigation();
  
  return {
    // Navegación básica
    goTo: navigateTo,
    
    // Acciones específicas
    goToProfile: () => navigateTo('/profile'),
    goToSettings: () => navigateTo('/settings'),
    goToNotifications: () => navigateTo('/notifications'),
    logout: () => executeAction('logout'),
    
    // Gestión de estado
    setActive: setActiveMenuItem
  };
};

/**
 * Hook para obtener información del estado del menú
 */
export const useNavigationState = () => {
  const { state } = useNavigation();
  
  return {
    isSideMenuCollapsed: state.sideMenuCollapsed,
    isUserMenuOpen: state.userMenuOpen,
    isMobileMenuOpen: state.mobileMenuOpen,
    isMobile: state.isMobile,
    activeMenuItem: state.activeMenuItem
  };
};

/**
 * Hook para obtener elementos del menú según el rol
 */
export const useNavigationMenu = () => {
  const { sideMenuItems, userMenuOptions } = useNavigation();
  
  return {
    sideMenuItems,
    userMenuOptions,
    
    // Funciones utilitarias
    findMenuItem: (id: string) => sideMenuItems.find(item => item.id === id),
    getMenuItemsByCategory: (hasSubmenu: boolean) => 
      sideMenuItems.filter(item => !!item.submenu === hasSubmenu)
  };
};

/**
 * Hook para controles del menú
 */
export const useNavigationControls = () => {
  const { 
    toggleSideMenu, 
    toggleUserMenu, 
    toggleMobileMenu, 
    closeMobileMenu 
  } = useNavigation();
  
  return {
    toggleSideMenu,
    toggleUserMenu,
    toggleMobileMenu,
    closeMobileMenu,
    
    // Funciones de conveniencia
    openMobileMenu: () => toggleMobileMenu(),
    closeMobileMenuIfOpen: closeMobileMenu
  };
};

export default useNavigation;