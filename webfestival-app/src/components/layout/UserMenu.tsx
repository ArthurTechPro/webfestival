import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { Icon } from '../ui/Icons/IconSystem';

interface UserMenuProps {
  className?: string;
}

/**
 * Componente UserMenu dropdown
 * Menú desplegable con opciones específicas por rol de usuario
 */
const UserMenu: React.FC<UserMenuProps> = ({ className = '' }) => {
  const { user, isAuthenticated } = useAuth();
  const { userMenuOptions, navigateTo, executeAction } = useNavigation();
  
  const [isOpen, setIsOpen] = useState(false);
  const [notificationCount] = useState(3); // Simulado por ahora
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleMenuAction = (option: any) => {
    if (option.route) {
      navigateTo(option.route);
    } else if (option.action) {
      executeAction(option.action);
    }
    setIsOpen(false);
  };

  const getUserInitials = (nombre: string): string => {
    return nombre
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleDisplayName = (role: string): string => {
    const roleNames = {
      PARTICIPANTE: 'Participante',
      JURADO: 'Jurado',
      ADMIN: 'Administrador',
      CONTENT_ADMIN: 'Admin. Contenido'
    };
    return roleNames[role as keyof typeof roleNames] || role;
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className={`wf-relative ${className}`} ref={menuRef}>
      {/* Botón del menú de usuario */}
      <button
        onClick={toggleMenu}
        className="wf-flex wf-items-center wf-space-x-3 wf-p-2 wf-rounded-lg wf-hover:bg-gray-100 wf-transition-colors wf-w-full"
        aria-label="Menú de usuario"
        aria-expanded={isOpen}
      >
        {/* Avatar del usuario */}
        <div className="wf-w-10 wf-h-10 wf-bg-gradient-to-r wf-from-blue-500 wf-to-purple-600 wf-rounded-full wf-flex wf-items-center wf-justify-center wf-text-white wf-text-sm wf-font-semibold wf-shadow-md">
          {user.picture_url ? (
            <img 
              src={user.picture_url} 
              alt={user.nombre}
              className="wf-w-full wf-h-full wf-rounded-full wf-object-cover"
            />
          ) : (
            getUserInitials(user.nombre)
          )}
        </div>
        
        {/* Información del usuario */}
        <div className="wf-flex-1 wf-text-left wf-min-w-0">
          <div className="wf-text-sm wf-font-medium wf-text-gray-900 wf-truncate">
            {user.nombre}
          </div>
          <div className="wf-text-xs wf-text-gray-500">
            {getRoleDisplayName(user.role)}
          </div>
        </div>
        
        {/* Indicador de dropdown */}
        <Icon 
          name={isOpen ? 'chevron-up' : 'chevron-down'} 
          size="sm" 
          className="wf-text-gray-400 wf-flex-shrink-0"
        />
      </button>

      {/* Dropdown del menú */}
      {isOpen && (
        <div className="wf-absolute wf-bottom-full wf-left-0 wf-right-0 wf-mb-2 wf-bg-white wf-rounded-lg wf-shadow-lg wf-border wf-border-gray-200 wf-py-2 wf-z-50">
          
          {/* Información detallada del usuario */}
          <div className="wf-px-4 wf-py-3 wf-border-b wf-border-gray-100">
            <div className="wf-flex wf-items-center wf-space-x-3">
              <div className="wf-w-12 wf-h-12 wf-bg-gradient-to-r wf-from-blue-500 wf-to-purple-600 wf-rounded-full wf-flex wf-items-center wf-justify-center wf-text-white wf-text-base wf-font-semibold">
                {user.picture_url ? (
                  <img 
                    src={user.picture_url} 
                    alt={user.nombre}
                    className="wf-w-full wf-h-full wf-rounded-full wf-object-cover"
                  />
                ) : (
                  getUserInitials(user.nombre)
                )}
              </div>
              <div className="wf-flex-1 wf-min-w-0">
                <div className="wf-text-sm wf-font-semibold wf-text-gray-900 wf-truncate">
                  {user.nombre}
                </div>
                <div className="wf-text-xs wf-text-gray-500 wf-truncate">
                  {user.email}
                </div>
                <div className="wf-text-xs wf-text-blue-600 wf-font-medium">
                  {getRoleDisplayName(user.role)}
                </div>
              </div>
            </div>
          </div>
          
          {/* Opciones del menú */}
          <div className="wf-py-1">
            {userMenuOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => handleMenuAction(option)}
                className="wf-w-full wf-flex wf-items-center wf-space-x-3 wf-px-4 wf-py-2 wf-text-sm wf-text-gray-700 wf-hover:bg-gray-100 wf-transition-colors"
              >
                <Icon 
                  name={option.icon} 
                  size="sm" 
                  className={option.action === 'logout' ? 'wf-text-red-500' : 'wf-text-gray-500'}
                />
                <span className={option.action === 'logout' ? 'wf-text-red-600' : ''}>
                  {option.label}
                </span>
                
                {/* Badge de notificación */}
                {option.badge && notificationCount > 0 && (
                  <span className="wf-ml-auto wf-bg-red-500 wf-text-white wf-text-xs wf-rounded-full wf-w-5 wf-h-5 wf-flex wf-items-center wf-justify-center">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;