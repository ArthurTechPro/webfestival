import React from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import TopNavigation from './TopNavigation';
import SideNavigation from './SideNavigation';
import '../../styles/navigation-animations.css';

interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout principal que maneja el posicionamiento responsive del contenido
 * Soporta los tres comportamientos de menú: overlay, push y static
 */
const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { state } = useNavigation();

  // Determinar el margen izquierdo del contenido principal
  const getContentMarginLeft = (): string => {
    switch (state.sideMenuBehavior) {
      case 'overlay':
        // En modo overlay, el contenido no se mueve
        return '0px';
      
      case 'push':
        // En modo push, el contenido se empuja cuando el menú está abierto
        if (state.mobileMenuOpen || (!state.sideMenuCollapsed && state.isDesktop)) {
          return state.sideMenuCollapsed ? '60px' : '250px';
        }
        return '0px';
      
      case 'static':
      default:
        // En modo static, el contenido siempre tiene margen
        return state.sideMenuCollapsed ? '60px' : '250px';
    }
  };

  // Clases CSS para el contenedor principal
  const mainContentClasses = `
    wf-min-h-screen wf-bg-gray-50 wf-transition-all wf-duration-300 wf-ease-in-out
    ${state.animationsEnabled ? 'wf-main-content' : ''}
    ${state.sideMenuBehavior === 'push' && (state.mobileMenuOpen || (!state.sideMenuCollapsed && state.isDesktop)) ? 'wf-pushed' : ''}
    ${state.sideMenuBehavior === 'push' && state.sideMenuCollapsed && state.isDesktop ? 'wf-pushed-collapsed' : ''}
  `;

  // Estilos inline para el margen dinámico
  const contentStyles: React.CSSProperties = {
    marginLeft: getContentMarginLeft(),
    paddingTop: '64px', // Altura del TopNavigation
    minHeight: 'calc(100vh - 64px)'
  };

  return (
    <div className="wf-relative wf-min-h-screen wf-bg-gray-50">
      {/* Navegación superior fija */}
      <TopNavigation />
      
      {/* Navegación lateral */}
      <SideNavigation />
      
      {/* Contenido principal */}
      <main 
        className={mainContentClasses}
        style={contentStyles}
        role="main"
        aria-label="Contenido principal"
      >
        {/* Contenedor interno con padding */}
        <div className="wf-container wf-mx-auto wf-px-4 wf-py-6 wf-max-w-7xl">
          {children}
        </div>
      </main>
      
      {/* Indicador de estado de navegación (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="wf-fixed wf-bottom-4 wf-right-4 wf-bg-black wf-text-white wf-text-xs wf-px-2 wf-py-1 wf-rounded wf-opacity-75 wf-z-50">
          <div>Screen: {state.currentScreenSize}</div>
          <div>Behavior: {state.sideMenuBehavior}</div>
          <div>Collapsed: {state.sideMenuCollapsed ? 'Yes' : 'No'}</div>
          <div>Mobile Menu: {state.mobileMenuOpen ? 'Open' : 'Closed'}</div>
        </div>
      )}
    </div>
  );
};

export default MainLayout;