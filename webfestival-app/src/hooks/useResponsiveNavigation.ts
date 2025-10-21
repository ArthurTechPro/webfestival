import { useState, useEffect, useCallback } from 'react';
import type { SideMenuBehavior, ScreenSize } from '../contexts/NavigationContext';

interface ResponsiveNavigationState {
  screenSize: ScreenSize;
  sideMenuBehavior: SideMenuBehavior;
  showLabels: boolean;
  isCollapsible: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

interface ResponsiveNavigationConfig {
  mobile: {
    sideMenuBehavior: SideMenuBehavior;
    showLabels: boolean;
    collapsible: boolean;
  };
  tablet: {
    sideMenuBehavior: SideMenuBehavior;
    showLabels: boolean;
    collapsible: boolean;
  };
  desktop: {
    sideMenuBehavior: SideMenuBehavior;
    showLabels: boolean;
    collapsible: boolean;
  };
}

const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

const DEFAULT_CONFIG: ResponsiveNavigationConfig = {
  mobile: {
    sideMenuBehavior: 'overlay',
    showLabels: false,
    collapsible: true
  },
  tablet: {
    sideMenuBehavior: 'push',
    showLabels: true,
    collapsible: true
  },
  desktop: {
    sideMenuBehavior: 'static',
    showLabels: true,
    collapsible: true
  }
};

/**
 * Hook para gestionar el comportamiento responsive de la navegación
 * Maneja breakpoints, configuración por pantalla y persistencia
 */
export const useResponsiveNavigation = (config: ResponsiveNavigationConfig = DEFAULT_CONFIG) => {
  const [state, setState] = useState<ResponsiveNavigationState>(() => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const screenSize = getScreenSizeFromWidth(width);
    const screenConfig = config[screenSize];
    
    return {
      screenSize,
      sideMenuBehavior: screenConfig.sideMenuBehavior,
      showLabels: screenConfig.showLabels,
      isCollapsible: screenConfig.collapsible,
      isMobile: width < MOBILE_BREAKPOINT,
      isTablet: width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT,
      isDesktop: width >= TABLET_BREAKPOINT
    };
  });

  // Función helper para determinar el tamaño de pantalla
  const getScreenSizeFromWidth = useCallback((width: number): ScreenSize => {
    if (width < MOBILE_BREAKPOINT) return 'mobile';
    if (width < TABLET_BREAKPOINT) return 'tablet';
    return 'desktop';
  }, []);

  // Función para actualizar el estado basado en el ancho de pantalla
  const updateStateFromWidth = useCallback((width: number) => {
    const screenSize = getScreenSizeFromWidth(width);
    const screenConfig = config[screenSize];
    
    setState(prevState => ({
      ...prevState,
      screenSize,
      sideMenuBehavior: screenConfig.sideMenuBehavior,
      showLabels: screenConfig.showLabels,
      isCollapsible: screenConfig.collapsible,
      isMobile: width < MOBILE_BREAKPOINT,
      isTablet: width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT,
      isDesktop: width >= TABLET_BREAKPOINT
    }));
  }, [config, getScreenSizeFromWidth]);

  // Manejar cambios de tamaño de ventana
  useEffect(() => {
    const handleResize = () => {
      updateStateFromWidth(window.innerWidth);
    };

    // Throttle resize events para mejor rendimiento
    let timeoutId: NodeJS.Timeout;
    const throttledResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', throttledResize);
    
    // Ejecutar inmediatamente para establecer el estado inicial
    handleResize();

    return () => {
      window.removeEventListener('resize', throttledResize);
      clearTimeout(timeoutId);
    };
  }, [updateStateFromWidth]);

  // Funciones de utilidad
  const isBreakpoint = useCallback((breakpoint: ScreenSize): boolean => {
    return state.screenSize === breakpoint;
  }, [state.screenSize]);

  const shouldShowOverlay = useCallback((): boolean => {
    return state.sideMenuBehavior === 'overlay';
  }, [state.sideMenuBehavior]);

  const shouldPushContent = useCallback((): boolean => {
    return state.sideMenuBehavior === 'push';
  }, [state.sideMenuBehavior]);

  const getMenuWidth = useCallback((isCollapsed: boolean): string => {
    if (isCollapsed && state.isCollapsible) {
      return '60px';
    }
    return '250px';
  }, [state.isCollapsible]);

  const getContentMargin = useCallback((isCollapsed: boolean, menuOpen: boolean): string => {
    if (state.sideMenuBehavior === 'overlay') {
      return '0px';
    }
    
    if (state.sideMenuBehavior === 'push' && menuOpen) {
      return getMenuWidth(isCollapsed);
    }
    
    if (state.sideMenuBehavior === 'static') {
      return getMenuWidth(isCollapsed);
    }
    
    return '0px';
  }, [state.sideMenuBehavior, getMenuWidth]);

  // Detectar si el usuario prefiere movimiento reducido
  const prefersReducedMotion = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Detectar si el usuario prefiere alto contraste
  const prefersHighContrast = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-contrast: high)').matches;
  }, []);

  return {
    // Estado actual
    ...state,
    
    // Funciones de utilidad
    isBreakpoint,
    shouldShowOverlay,
    shouldPushContent,
    getMenuWidth,
    getContentMargin,
    prefersReducedMotion,
    prefersHighContrast,
    
    // Funciones de actualización
    updateStateFromWidth,
    
    // Configuración actual
    currentConfig: config[state.screenSize]
  };
};

export default useResponsiveNavigation;