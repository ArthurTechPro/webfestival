import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import menuConfig from '../../data/navigation-menu-options.json';
import './DashboardLayout.scss';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  active?: boolean;
  submenu?: Array<{
    label: string;
    route: string;
  }>;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sideMenuCollapsed, setSideMenuCollapsed] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Obtener configuración del menú según el rol del usuario
  const userRole = user?.role || 'PARTICIPANTE';
  const menuOptions = menuConfig.menuOptions[userRole as keyof typeof menuConfig.menuOptions];
  const commonElements = menuConfig.commonElements;

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < commonElements.mobileBreakpoint);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [commonElements.mobileBreakpoint]);

  // Mapear rutas del JSON a rutas reales de la aplicación
  const mapRoute = (route: string): string => {
    const routeMap: Record<string, string> = {
      '/app/dashboard': '/participante/dashboard',
      '/app/contests': '/participante/concursos',
      '/app/submissions': '/participante/mis-envios',
      '/app/gallery': '/galeria',
      '/app/community': '/participante/comunidad',
      '/app/profile': '/profile',
      '/app/subscription': '/participante/suscripcion',
      '/app/notifications': '/participante/notificaciones',
      '/app/settings': '/participante/configuracion'
    };
    
    return routeMap[route] || route;
  };

  // Verificar si una ruta está activa
  const isRouteActive = (route: string): boolean => {
    const mappedRoute = mapRoute(route);
    return location.pathname === mappedRoute || location.pathname.startsWith(mappedRoute);
  };

  // Manejar navegación
  const handleNavigation = (route: string) => {
    const mappedRoute = mapRoute(route);
    navigate(mappedRoute);
  };

  // Manejar logout
  const handleLogout = () => {
    logout();
  };

  // Obtener icono
  const getIcon = (iconName: string): string => {
    return commonElements.icons[iconName as keyof typeof commonElements.icons] || iconName;
  };

  // Toggle submenu
  const toggleSubmenu = (menuLabel: string) => {
    setActiveSubmenu(activeSubmenu === menuLabel ? null : menuLabel);
  };

  return (
    <div className="dashboard-layout">
      {/* Top Navigation */}
      <header className="dashboard-header">
        <div className="header-left">
          <button 
            className="menu-toggle"
            onClick={() => setSideMenuCollapsed(!sideMenuCollapsed)}
          >
            <span className="hamburger"></span>
          </button>
          <div className="logo">
            <span className="logo-icon">🎬</span>
            <span className="logo-text">{menuOptions.topMenu.logo}</span>
          </div>
        </div>

        <div className="header-center">
          <div className="search-container">
            <input 
              type="text" 
              placeholder="Buscar..." 
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>

        <div className="header-right">
          <div className="user-menu">
            <div className="user-info">
              <span className="user-name">{user?.nombre}</span>
              <span className="user-role">{userRole}</span>
            </div>
            <div className="user-avatar">
              {user?.picture_url ? (
                <img src={user.picture_url} alt={user.nombre} />
              ) : (
                <span className="avatar-placeholder">
                  {user?.nombre?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="user-dropdown">
              {menuOptions.topMenu.userOptions.map((option: any, index: number) => (
                <button
                  key={index}
                  className="dropdown-item"
                  onClick={() => {
                    if (option.action === 'logout') {
                      handleLogout();
                    } else {
                      handleNavigation(option.route);
                    }
                  }}
                >
                  <span className="item-icon">{getIcon(option.icon)}</span>
                  <span className="item-label">{option.label}</span>
                  {option.badge && <span className="badge">3</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Side Navigation */}
      <aside className={`dashboard-sidebar ${sideMenuCollapsed ? 'collapsed' : ''}`}>
        <nav className="sidebar-nav">
          {menuOptions.sideMenu.map((item: MenuItem, index: number) => (
            <div key={index} className="nav-item-container">
              <button
                className={`nav-item ${isRouteActive(item.route) ? 'active' : ''}`}
                onClick={() => {
                  if (item.submenu) {
                    toggleSubmenu(item.label);
                  } else {
                    handleNavigation(item.route);
                  }
                }}
              >
                <span className="nav-icon">{getIcon(item.icon)}</span>
                <span className="nav-label">{item.label}</span>
                {item.submenu && (
                  <span className={`nav-arrow ${activeSubmenu === item.label ? 'expanded' : ''}`}>
                    ▼
                  </span>
                )}
              </button>
              
              {item.submenu && (
                <div className={`submenu ${activeSubmenu === item.label ? 'expanded' : ''}`}>
                  {item.submenu.map((subItem, subIndex) => (
                    <button
                      key={subIndex}
                      className={`submenu-item ${isRouteActive(subItem.route) ? 'active' : ''}`}
                      onClick={() => handleNavigation(subItem.route)}
                    >
                      <span className="submenu-label">{subItem.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-card-avatar">
              {user?.picture_url ? (
                <img src={user.picture_url} alt={user.nombre} />
              ) : (
                <span className="avatar-placeholder">
                  {user?.nombre?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            {!sideMenuCollapsed && (
              <div className="user-card-info">
                <div className="user-card-name">{user?.nombre}</div>
                <div className="user-card-role">{userRole}</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`dashboard-main ${sideMenuCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="main-content">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {isMobile && !sideMenuCollapsed && (
        <div 
          className="mobile-overlay"
          onClick={() => setSideMenuCollapsed(true)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;