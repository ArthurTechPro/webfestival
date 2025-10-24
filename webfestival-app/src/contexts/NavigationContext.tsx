import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

// Tipos básicos para navegación
export interface MenuItem {
  id: string;
  label: string;
  route: string;
  icon?: string;
  active?: boolean;
  submenu?: SubMenuItem[];
}

export interface SubMenuItem {
  id: string;
  label: string;
  route: string;
}

export interface UserMenuOption {
  id: string;
  label: string;
  route?: string;
  action?: string;
  icon?: string;
  badge?: boolean;
}

export interface NavigationState {
  sideMenuCollapsed: boolean;
  mobileMenuOpen: boolean;
  currentRoute: string;
  userMenuOpen: boolean;
  activeMenuItem: string;
  activeSubMenuItem: string;
  sideMenuBehavior: SideMenuBehavior;
  currentScreenSize: ScreenSize;
  showLabels: boolean;
  animationsEnabled: boolean;
  isDesktop: boolean;
  isMobile: boolean;
}

export interface NavigationContextType {
  state: NavigationState;
  sideMenuItems: MenuItem[];
  userMenuOptions: UserMenuOption[];
  breadcrumbs: any[];
  toggleSideMenu: () => void;
  toggleMobileMenu: () => void;
  toggleUserMenu: () => void;
  setCurrentRoute: (route: string) => void;
  setActiveMenuItem: (id: string) => void;
  navigateTo: (route: string) => void;
  executeAction: (action: string) => void;
  closeMobileMenu: () => void;
  updateBreadcrumbs: (breadcrumbs: any[] | string) => void;
  getCurrentResponsiveConfig: () => any;
  hasPermissionForRoute: (route: string) => boolean;
  isValidRoute: (route: string) => boolean;
  getAvailableRoutes: () => any[];
}

// Tipos para navegación responsiva
export type ScreenSize = 'mobile' | 'tablet' | 'desktop';
export type SideMenuBehavior = 'overlay' | 'push' | 'static';

// Context
const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

// Provider básico
export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<NavigationState>({
    sideMenuCollapsed: false,
    mobileMenuOpen: false,
    currentRoute: '/',
    userMenuOpen: false,
    activeMenuItem: 'dashboard',
    activeSubMenuItem: '',
    sideMenuBehavior: 'static',
    currentScreenSize: 'desktop',
    showLabels: true,
    animationsEnabled: true,
    isDesktop: true,
    isMobile: false
  });

  // Datos básicos de navegación (puedes expandir según necesites)
  const sideMenuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      route: '/dashboard',
      icon: 'home',
      active: true
    },
    {
      id: 'profile',
      label: 'Mi Perfil',
      route: '/profile',
      icon: 'user'
    },
    {
      id: 'community',
      label: 'Comunidad',
      route: '/community',
      icon: 'users'
    },
    {
      id: 'subscription',
      label: 'Suscripción',
      route: '/subscription',
      icon: 'credit-card'
    }
  ];

  const userMenuOptions: UserMenuOption[] = [
    {
      id: 'profile',
      label: 'Mi Perfil',
      route: '/profile',
      icon: 'user'
    },
    {
      id: 'notifications',
      label: 'Notificaciones',
      route: '/notifications',
      icon: 'bell',
      badge: true
    },
    {
      id: 'settings',
      label: 'Configuración',
      route: '/settings',
      icon: 'settings'
    },
    {
      id: 'logout',
      label: 'Cerrar Sesión',
      action: 'logout',
      icon: 'logout'
    }
  ];

  const toggleSideMenu = () => {
    setState(prev => ({
      ...prev,
      sideMenuCollapsed: !prev.sideMenuCollapsed
    }));
  };

  const toggleMobileMenu = () => {
    setState(prev => ({
      ...prev,
      mobileMenuOpen: !prev.mobileMenuOpen
    }));
  };

  const toggleUserMenu = () => {
    setState(prev => ({
      ...prev,
      userMenuOpen: !prev.userMenuOpen
    }));
  };

  const setCurrentRoute = (route: string) => {
    setState(prev => ({
      ...prev,
      currentRoute: route
    }));
  };

  const setActiveMenuItem = (id: string) => {
    setState(prev => ({
      ...prev,
      activeMenuItem: id
    }));
  };

  const navigateTo = (route: string) => {
    setCurrentRoute(route);
    // Aquí podrías agregar lógica de navegación real
  };

  const executeAction = (action: string) => {
    if (action === 'logout') {
      // Lógica de logout
      console.log('Logout action');
    }
  };

  const closeMobileMenu = () => {
    setState(prev => ({
      ...prev,
      mobileMenuOpen: false
    }));
  };

  const updateBreadcrumbs = (breadcrumbs: any[] | string) => {
    // Implementación básica
    console.log('Update breadcrumbs:', breadcrumbs);
  };

  const getCurrentResponsiveConfig = () => {
    return {
      sideMenuBehavior: state.sideMenuBehavior,
      showLabels: state.showLabels,
      collapsible: true
    };
  };

  const hasPermissionForRoute = (_route: string) => {
    // Implementación básica - siempre true por ahora
    return true;
  };

  const isValidRoute = (_route: string) => {
    // Implementación básica - siempre true por ahora
    return true;
  };

  const getAvailableRoutes = () => {
    // Retorna rutas básicas
    return [
      { path: '/dashboard', name: 'Dashboard' },
      { path: '/profile', name: 'Mi Perfil' },
      { path: '/community', name: 'Comunidad' }
    ];
  };

  const value: NavigationContextType = {
    state,
    sideMenuItems,
    userMenuOptions,
    breadcrumbs: [],
    toggleSideMenu,
    toggleMobileMenu,
    toggleUserMenu,
    setCurrentRoute,
    setActiveMenuItem,
    navigateTo,
    executeAction,
    closeMobileMenu,
    updateBreadcrumbs,
    getCurrentResponsiveConfig,
    hasPermissionForRoute,
    isValidRoute,
    getAvailableRoutes
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

// Hook para usar el contexto
export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

export default NavigationContext;