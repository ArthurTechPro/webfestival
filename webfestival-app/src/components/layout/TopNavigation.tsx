import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { Icon } from '../ui/Icons/IconSystem';
import Breadcrumb from '../navigation/Breadcrumb';

/**
 * Componente de navegación superior
 * Incluye logo, opciones de usuario y notificaciones
 */
const TopNavigation: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { 
    state, 
    userMenuOptions, 
    breadcrumbs,
    toggleUserMenu, 
    toggleMobileMenu, 
    toggleSideMenu,
    navigateTo, 
    executeAction 
  } = useNavigation();
  
  const [notificationCount] = useState(3); // Simulado por ahora
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú de usuario al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        if (state.userMenuOpen) {
          toggleUserMenu();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [state.userMenuOpen, toggleUserMenu]);

  const handleUserMenuAction = (option: any) => {
    if (option.route) {
      navigateTo(option.route);
    } else if (option.action) {
      executeAction(option.action);
    }
    toggleUserMenu();
  };

  const getUserInitials = (nombre: string): string => {
    return nombre
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="wf-fixed wf-top-0 wf-left-0 wf-right-0 wf-z-50 wf-bg-white wf-border-b wf-border-gray-200 wf-shadow-sm">
      {/* Barra principal de navegación */}
      <div className="wf-flex wf-items-center wf-justify-between wf-px-4 wf-py-3 wf-h-16">
        
        {/* Sección izquierda: Logo y botón de menú */}
        <div className="wf-flex wf-items-center wf-space-x-4">
          {/* Botón hamburguesa responsive */}
          {isAuthenticated && (
            <button
              onClick={state.sideMenuBehavior === 'overlay' ? toggleMobileMenu : toggleSideMenu}
              className="wf-p-2 wf-rounded-lg wf-hover:bg-gray-100 wf-transition-colors wf-focus:outline-none wf-focus:ring-2 wf-focus:ring-blue-500"
              aria-label={state.sideMenuBehavior === 'overlay' ? 'Abrir menú' : 'Colapsar menú'}
              aria-expanded={state.sideMenuBehavior === 'overlay' ? state.mobileMenuOpen : !state.sideMenuCollapsed}
            >
              <Icon 
                name={
                  state.sideMenuBehavior === 'overlay' 
                    ? (state.mobileMenuOpen ? 'x' : 'menu')
                    : (state.sideMenuCollapsed ? 'menu' : 'x')
                } 
                size="md" 
              />
            </button>
          )}
          
          {/* Logo */}
          <div 
            className="wf-flex wf-items-center wf-space-x-2 wf-cursor-pointer"
            onClick={() => navigateTo('/')}
          >
            <div className="wf-text-2xl">🎬</div>
            <span className="wf-text-xl wf-font-bold wf-text-gray-900">
              WebFestival
            </span>
          </div>
        </div>

        {/* Sección derecha: Opciones de usuario */}
        <div className="wf-flex wf-items-center wf-space-x-4">
          {isAuthenticated ? (
            <>
              {/* Notificaciones */}
              <button
                onClick={() => navigateTo('/notifications')}
                className="wf-relative wf-p-2 wf-rounded-lg wf-hover:bg-gray-100 wf-transition-colors"
                aria-label="Notificaciones"
              >
                <Icon name="bell" size="md" />
                {notificationCount > 0 && (
                  <span className="wf-absolute wf--top-1 wf--right-1 wf-bg-red-500 wf-text-white wf-text-xs wf-rounded-full wf-w-5 wf-h-5 wf-flex wf-items-center wf-justify-center">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>

              {/* Menú de usuario */}
              <div className="wf-relative" ref={userMenuRef}>
                <button
                  onClick={toggleUserMenu}
                  className="wf-flex wf-items-center wf-space-x-2 wf-p-2 wf-rounded-lg wf-hover:bg-gray-100 wf-transition-colors"
                  aria-label="Menú de usuario"
                >
                  {/* Avatar del usuario */}
                  <div className="wf-w-8 wf-h-8 wf-bg-blue-500 wf-rounded-full wf-flex wf-items-center wf-justify-center wf-text-white wf-text-sm wf-font-medium">
                    {user?.picture_url ? (
                      <img 
                        src={user.picture_url} 
                        alt={user.nombre}
                        className="wf-w-full wf-h-full wf-rounded-full wf-object-cover"
                      />
                    ) : (
                      getUserInitials(user?.nombre || 'U')
                    )}
                  </div>
                  
                  {/* Información del usuario (oculta en móvil) */}
                  <div className="wf-hidden wf-md:block wf-text-left">
                    <div className="wf-text-sm wf-font-medium wf-text-gray-900">
                      {user?.nombre}
                    </div>
                    <div className="wf-text-xs wf-text-gray-500 wf-capitalize">
                      {user?.role?.toLowerCase()}
                    </div>
                  </div>
                  
                  <Icon name="chevron-down" size="sm" />
                </button>

                {/* Dropdown del menú de usuario */}
                {state.userMenuOpen && (
                  <div className="wf-absolute wf-right-0 wf-mt-2 wf-w-56 wf-bg-white wf-rounded-lg wf-shadow-lg wf-border wf-border-gray-200 wf-py-2 wf-z-50">
                    {/* Información del usuario en móvil */}
                    <div className="wf-md:hidden wf-px-4 wf-py-2 wf-border-b wf-border-gray-100">
                      <div className="wf-text-sm wf-font-medium wf-text-gray-900">
                        {user?.nombre}
                      </div>
                      <div className="wf-text-xs wf-text-gray-500 wf-capitalize">
                        {user?.role?.toLowerCase()}
                      </div>
                    </div>
                    
                    {/* Opciones del menú */}
                    {userMenuOptions.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleUserMenuAction(option)}
                        className="wf-w-full wf-flex wf-items-center wf-space-x-3 wf-px-4 wf-py-2 wf-text-sm wf-text-gray-700 wf-hover:bg-gray-100 wf-transition-colors"
                      >
                        <Icon name={option.icon} size="sm" />
                        <span>{option.label}</span>
                        {option.badge && notificationCount > 0 && (
                          <span className="wf-ml-auto wf-bg-red-500 wf-text-white wf-text-xs wf-rounded-full wf-w-5 wf-h-5 wf-flex wf-items-center wf-justify-center">
                            {notificationCount > 9 ? '9+' : notificationCount}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Botones para usuarios no autenticados */
            <div className="wf-flex wf-items-center wf-space-x-2">
              <button
                onClick={() => navigateTo('/login')}
                className="wf-px-4 wf-py-2 wf-text-sm wf-font-medium wf-text-gray-700 wf-hover:text-gray-900 wf-transition-colors"
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => navigateTo('/register')}
                className="wf-px-4 wf-py-2 wf-text-sm wf-font-medium wf-bg-blue-600 wf-text-white wf-rounded-lg wf-hover:bg-blue-700 wf-transition-colors"
              >
                Registrarse
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Barra de breadcrumbs (solo para usuarios autenticados) */}
      {isAuthenticated && breadcrumbs.length > 1 && (
        <div className="wf-bg-gray-50 wf-border-b wf-border-gray-200 wf-px-4 wf-py-2">
          <Breadcrumb 
            items={breadcrumbs}
            onNavigate={navigateTo}
            className="wf-text-xs"
          />
        </div>
      )}
    </nav>
  );
};

export default TopNavigation;