import React, { useEffect, useRef } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import MenuItem from '../navigation/MenuItem';
import type { MenuItem as MenuItemType, SubMenuItem } from '../../services/navigation.service';

/**
 * Componente de navegación lateral responsive
 * Soporta comportamientos overlay, push y static según el tamaño de pantalla
 */
const SideNavigation: React.FC = () => {
  const { 
    state, 
    sideMenuItems, 
    setActiveMenuItem, 
    navigateTo,
    closeMobileMenu,
    updateBreadcrumbs,
    getCurrentResponsiveConfig
  } = useNavigation();

  const sideNavRef = useRef<HTMLElement>(null);

  // Cerrar menú móvil al hacer clic fuera (solo en modo overlay)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        state.sideMenuBehavior === 'overlay' && 
        state.mobileMenuOpen &&
        sideNavRef.current && 
        !sideNavRef.current.contains(event.target as Node)
      ) {
        closeMobileMenu();
      }
    };

    if (state.sideMenuBehavior === 'overlay') {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [state.sideMenuBehavior, state.mobileMenuOpen, closeMobileMenu]);

  const handleMenuItemClick = (item: MenuItemType) => {
    // Si tiene submenú, no navegar directamente
    if (item.submenu && item.submenu.length > 0) {
      return;
    }

    // Navegar a la ruta
    setActiveMenuItem(item.id);
    if (item.route) {
      navigateTo(item.route);
      updateBreadcrumbs(item.route);
    }
    
    // Cerrar menú móvil si está abierto y es overlay
    if (state.sideMenuBehavior === 'overlay' && state.mobileMenuOpen) {
      closeMobileMenu();
    }
  };

  const handleSubMenuItemClick = (subItem: SubMenuItem, parentItem: MenuItemType) => {
    setActiveMenuItem(parentItem.id);
    navigateTo(subItem.route);
    updateBreadcrumbs(subItem.route);
    
    // Cerrar menú móvil si está abierto y es overlay
    if (state.sideMenuBehavior === 'overlay' && state.mobileMenuOpen) {
      closeMobileMenu();
    }
  };

  // Obtener configuración responsive actual
  const responsiveConfig = getCurrentResponsiveConfig();

  // Determinar ancho del menú
  const getMenuWidth = () => {
    if (state.sideMenuBehavior === 'overlay' && state.mobileMenuOpen) {
      return 'wf-w-64'; // Ancho fijo para overlay
    }
    
    if (state.sideMenuCollapsed && responsiveConfig.collapsible) {
      return 'wf-w-20'; // Ancho colapsado - un poco más ancho para los iconos
    }
    
    return 'wf-w-64'; // Ancho normal
  };

  // Determinar posición y transformación
  const getMenuTransform = () => {
    switch (state.sideMenuBehavior) {
      case 'overlay':
        return state.mobileMenuOpen ? 'wf-translate-x-0' : 'wf--translate-x-full';
      case 'push':
        return 'wf-translate-x-0';
      case 'static':
      default:
        return 'wf-translate-x-0';
    }
  };

  // Determinar z-index según comportamiento
  const getZIndex = () => {
    switch (state.sideMenuBehavior) {
      case 'overlay':
        return 'wf-z-40';
      case 'push':
        return 'wf-z-30';
      case 'static':
      default:
        return 'wf-z-20';
    }
  };

  // Clases para el contenedor principal
  const sideMenuClasses = `
    wf-fixed wf-left-0 wf-top-16 wf-h-[calc(100vh-4rem)] wf-bg-white wf-border-r wf-border-gray-200 wf-shadow-lg
    ${state.animationsEnabled ? 'wf-transition-all wf-duration-300 wf-ease-in-out' : ''}
    ${getMenuWidth()}
    ${getMenuTransform()}
    ${getZIndex()}
    ${state.animationsEnabled ? 'wf-transition-transform' : ''}
    ${state.sideMenuCollapsed && responsiveConfig.collapsible ? 'wf-side-menu-collapsed' : 'wf-side-menu-expanded'}
  `;

  // Overlay para modo overlay
  const shouldShowOverlay = state.sideMenuBehavior === 'overlay' && state.mobileMenuOpen;
  const overlayClasses = `
    wf-fixed wf-inset-0 wf-bg-black wf-bg-opacity-50 wf-z-30 wf-transition-opacity wf-duration-300
    ${shouldShowOverlay ? 'wf-opacity-100' : 'wf-opacity-0 wf-pointer-events-none'}
  `;

  return (
    <>
      {/* Overlay para modo overlay */}
      {state.sideMenuBehavior === 'overlay' && (
        <div 
          className={overlayClasses}
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}
      
      {/* Menú lateral */}
      <nav 
        ref={sideNavRef}
        className={sideMenuClasses}
        aria-label="Navegación principal"
        role="navigation"
      >
        <div className="wf-flex wf-flex-col wf-h-full wf-overflow-y-auto wf-scrollbar-thin wf-scrollbar-thumb-gray-300 wf-scrollbar-track-gray-100">
          
          {/* Lista de elementos del menú */}
          <div className="wf-flex-1 wf-py-4">
            {sideMenuItems.map((item: any) => (
              <MenuItem
                key={item.id}
                item={item}
                isActive={state.activeMenuItem === item.id}
                isCollapsed={state.sideMenuCollapsed}
                isMobile={state.currentScreenSize === 'mobile'}
                showLabels={state.showLabels}
                sideMenuBehavior={state.sideMenuBehavior}
                animationsEnabled={state.animationsEnabled}
                onItemClick={handleMenuItemClick}
                onSubItemClick={handleSubMenuItemClick}
                activeSubItemId={state.activeSubMenuItem}
              />
            ))}
          </div>

          {/* Información del usuario en la parte inferior */}
          {(state.showLabels && (!state.sideMenuCollapsed || !responsiveConfig.collapsible)) && (
            <div className="wf-border-t wf-border-gray-200 wf-p-4">
              <div className="wf-text-xs wf-text-gray-500 wf-text-center">
                WebFestival Platform
              </div>
              <div className="wf-text-xs wf-text-gray-400 wf-text-center wf-mt-1">
                {state.currentScreenSize} • {state.sideMenuBehavior}
              </div>
            </div>
          )}

          {/* Indicador visual para modo colapsado */}
          {state.sideMenuCollapsed && responsiveConfig.collapsible && state.showLabels && (
            <div className="wf-border-t wf-border-gray-200 wf-p-2">
              <div className="wf-w-8 wf-h-1 wf-bg-gray-300 wf-rounded wf-mx-auto"></div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default SideNavigation;