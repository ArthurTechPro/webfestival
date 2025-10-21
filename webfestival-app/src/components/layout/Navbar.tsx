import React, { useState } from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { useRoleBasedNavigation } from '../../hooks/useRoleBasedNavigation';
import { useScrollEffects } from '../../hooks/useScrollEffects';
import { Button } from '../ui';

/**
 * Componente de navegación cinematográfico fullscreen
 */
const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { getAvailableRoutes } = useRoleBasedNavigation();
  const { isScrolled } = useScrollEffects(50);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  // Get available routes for the current user
  const availableRoutes = getAvailableRoutes().map((route: string) => ({
    path: route,
    name: route.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Page'
  }));

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Navbar principal */}
      <nav 
        className={`
          wf-fixed wf-top-0 wf-left-0 wf-right-0 wf-z-50 wf-transition-all wf-duration-300
          ${isScrolled 
            ? 'wf-glass wf-backdrop-blur-20 wf-border-b wf-border-white wf-border-opacity-20' 
            : 'wf-bg-transparent'
          }
        `}
      >
        <div className="wf-w-full wf-px-6 wf-lg:px-8 wf-flex wf-items-center wf-justify-between wf-py-4">
          {/* Logo cinematográfico */}
          <LinkContainer to="/">
            <a className="wf-flex wf-items-center wf-space-x-3 wf-cursor-pointer wf-z-60" onClick={closeMenu}>
              <div className="wf-text-3xl wf-animate-pulse">🎬</div>
              <span className="wf-text-2xl wf-font-bold wf-text-cinematic wf-text-shimmer">
                WebFestival
              </span>
            </a>
          </LinkContainer>

          {/* Navegación desktop */}
          <div className="wf-hidden wf-lg:flex wf-items-center wf-space-x-8">
            <LinkContainer to="/galeria">
              <a className="wf-nav-link wf-hover-glow wf-transition-all">
                🖼️ Galería
              </a>
            </LinkContainer>
            
            <LinkContainer to="/showcase">
              <a className="wf-nav-link wf-hover-glow wf-transition-all">
                ✨ Demo Premium
              </a>
            </LinkContainer>
            
            {/* Navegación para usuarios autenticados */}
            {isAuthenticated && availableRoutes.length > 0 && (
              <div className="wf-dropdown">
                <button className="wf-nav-link wf-hover-glow">
                  🎭 Mi Área
                </button>
                <div className="wf-dropdown-menu wf-glass">
                  {availableRoutes.map((route, index) => (
                    <LinkContainer key={index} to={route.path}>
                      <a className="wf-dropdown-item wf-hover-cinematic">
                        {route.name}
                      </a>
                    </LinkContainer>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Acciones de usuario desktop */}
          <div className="wf-hidden wf-lg:flex wf-items-center wf-space-x-4">
            {isAuthenticated ? (
              <div className="wf-dropdown">
                <button className="wf-flex wf-items-center wf-space-x-2 wf-glass wf-px-4 wf-py-2 wf-rounded-full wf-hover-cinematic">
                  <div className="wf-w-8 wf-h-8 wf-bg-gradient-to-r wf-from-primary wf-to-secondary wf-rounded-full wf-flex wf-items-center wf-justify-center wf-text-white wf-text-sm wf-font-bold">
                    {user?.nombre?.charAt(0).toUpperCase()}
                  </div>
                  <span className="wf-text-sm wf-font-medium wf-text-shimmer">
                    {user?.nombre}
                  </span>
                  <span className="wf-text-xs wf-opacity-70">
                    ({user?.role})
                  </span>
                </button>
                
                <div className="wf-dropdown-menu wf-glass wf-right-0">
                  <LinkContainer to="/profile">
                    <a className="wf-dropdown-item wf-hover-cinematic">
                      👤 Mi Perfil
                    </a>
                  </LinkContainer>
                  <div className="wf-dropdown-divider" />
                  <button 
                    className="wf-dropdown-item wf-hover-cinematic wf-w-full wf-text-left"
                    onClick={handleLogout}
                  >
                    🚪 Cerrar Sesión
                  </button>
                </div>
              </div>
            ) : (
              <div className="wf-flex wf-items-center wf-space-x-3">
                <LinkContainer to="/login">
                  <Button variant="ghost" size="sm">
                    Iniciar Sesión
                  </Button>
                </LinkContainer>
                
                <LinkContainer to="/register">
                  <Button variant="primary" size="sm" icon="✨">
                    Registrarse
                  </Button>
                </LinkContainer>
              </div>
            )}
          </div>

          {/* Botón hamburguesa para móvil */}
          <button
            className="wf-lg:hidden wf-glass wf-p-3 wf-rounded-full wf-hover-cinematic wf-z-60"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <div className="wf-w-6 wf-h-6 wf-flex wf-flex-col wf-justify-center wf-items-center">
              <span 
                className={`
                  wf-block wf-h-0.5 wf-w-6 wf-bg-white wf-transition-all wf-duration-300
                  ${isMenuOpen ? 'wf-rotate-45 wf-translate-y-1.5' : ''}
                `}
              />
              <span 
                className={`
                  wf-block wf-h-0.5 wf-w-6 wf-bg-white wf-transition-all wf-duration-300 wf-mt-1
                  ${isMenuOpen ? 'wf-opacity-0' : ''}
                `}
              />
              <span 
                className={`
                  wf-block wf-h-0.5 wf-w-6 wf-bg-white wf-transition-all wf-duration-300 wf-mt-1
                  ${isMenuOpen ? 'wf--rotate-45 wf--translate-y-1.5' : ''}
                `}
              />
            </div>
          </button>
        </div>
      </nav>

      {/* Menú fullscreen para móvil */}
      <div 
        className={`
          wf-fixed wf-inset-0 wf-z-40 wf-lg:hidden wf-transition-all wf-duration-500
          ${isMenuOpen 
            ? 'wf-opacity-100 wf-visible' 
            : 'wf-opacity-0 wf-invisible'
          }
        `}
      >
        {/* Backdrop */}
        <div 
          className="wf-absolute wf-inset-0 wf-bg-black wf-bg-opacity-95 wf-backdrop-blur-xl"
          onClick={closeMenu}
        />
        
        {/* Contenido del menú */}
        <div 
          className={`
            wf-relative wf-h-full wf-flex wf-flex-col wf-justify-center wf-items-center
            wf-particles-bg wf-spotlight wf-transition-all wf-duration-700
            ${isMenuOpen 
              ? 'wf-translate-y-0 wf-scale-100' 
              : 'wf-translate-y-10 wf-scale-95'
            }
          `}
        >
          {/* Navegación principal */}
          <div className="wf-space-y-8 wf-text-center wf-mb-12">
            <LinkContainer to="/galeria">
              <a 
                className="wf-block wf-text-4xl wf-font-bold wf-text-white wf-hover-glow wf-transition-all wf-animate-cinematic-entrance"
                onClick={closeMenu}
                style={{ animationDelay: '0.1s' }}
              >
                🖼️ Galería
              </a>
            </LinkContainer>
            
            <LinkContainer to="/showcase">
              <a 
                className="wf-block wf-text-4xl wf-font-bold wf-text-white wf-hover-glow wf-transition-all wf-animate-cinematic-entrance"
                onClick={closeMenu}
                style={{ animationDelay: '0.2s' }}
              >
                ✨ Demo Premium
              </a>
            </LinkContainer>
            
            {/* Navegación para usuarios autenticados */}
            {isAuthenticated && availableRoutes.length > 0 && (
              <div className="wf-space-y-6 wf-animate-cinematic-entrance" style={{ animationDelay: '0.3s' }}>
                <h3 className="wf-text-2xl wf-font-semibold wf-text-cinematic wf-mb-4">
                  🎭 Mi Área
                </h3>
                {availableRoutes.map((route, index) => (
                  <LinkContainer key={index} to={route.path}>
                    <a 
                      className="wf-block wf-text-xl wf-text-white wf-hover-glow wf-transition-all"
                      onClick={closeMenu}
                    >
                      {route.name}
                    </a>
                  </LinkContainer>
                ))}
              </div>
            )}
          </div>

          {/* Acciones de usuario */}
          <div className="wf-space-y-6 wf-text-center wf-animate-cinematic-entrance" style={{ animationDelay: '0.4s' }}>
            {isAuthenticated ? (
              <>
                <div className="wf-glass wf-p-6 wf-rounded-2xl wf-mb-6">
                  <div className="wf-w-16 wf-h-16 wf-bg-gradient-to-r wf-from-primary wf-to-secondary wf-rounded-full wf-flex wf-items-center wf-justify-center wf-text-white wf-text-2xl wf-font-bold wf-mx-auto wf-mb-4">
                    {user?.nombre?.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="wf-text-xl wf-font-semibold wf-text-shimmer wf-mb-2">
                    {user?.nombre}
                  </h3>
                  <p className="wf-text-sm wf-opacity-70">
                    {user?.role}
                  </p>
                </div>
                
                <LinkContainer to="/profile">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    icon="👤"
                    onClick={closeMenu}
                  >
                    Mi Perfil
                  </Button>
                </LinkContainer>
                
                <Button 
                  variant="ghost" 
                  size="lg" 
                  icon="🚪"
                  onClick={handleLogout}
                >
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <div className="wf-space-y-4">
                <LinkContainer to="/login">
                  <Button 
                    variant="outline" 
                    size="xl" 
                    onClick={closeMenu}
                  >
                    Iniciar Sesión
                  </Button>
                </LinkContainer>
                
                <LinkContainer to="/register">
                  <Button 
                    variant="primary" 
                    size="xl" 
                    icon="✨"
                    onClick={closeMenu}
                  >
                    Registrarse
                  </Button>
                </LinkContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;