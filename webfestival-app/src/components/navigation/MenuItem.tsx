import React, { useState } from 'react';
import { Icon } from '../ui/Icons/IconSystem';
import type { MenuItem as MenuItemType, SubMenuItem } from '../../services/navigation.service';

// Definir el tipo localmente ya que NavigationContext no existe
type SideMenuBehavior = 'push' | 'overlay' | 'static';

interface MenuItemProps {
    item: MenuItemType;
    isActive: boolean;
    isCollapsed: boolean;
    isMobile: boolean;
    showLabels: boolean;
    sideMenuBehavior: SideMenuBehavior;
    animationsEnabled: boolean;
    onItemClick: (item: MenuItemType) => void;
    onSubItemClick: (subItem: SubMenuItem, parentItem: MenuItemType) => void;
    activeSubItemId?: string;
}

/**
 * Componente MenuItem responsive con soporte para submenús y badges
 * Maneja la visualización y interacción de elementos del menú lateral
 */
const MenuItem: React.FC<MenuItemProps> = ({
    item,
    isActive,
    isCollapsed,
    isMobile,
    showLabels,
    sideMenuBehavior,
    animationsEnabled,
    onItemClick,
    onSubItemClick,
    activeSubItemId
}) => {
    const [isSubmenuExpanded, setIsSubmenuExpanded] = useState(false);

    const handleItemClick = () => {
        if (item.submenu && item.submenu.length > 0) {
            // Toggle submenu
            setIsSubmenuExpanded(!isSubmenuExpanded);
        } else {
            // Ejecutar acción del elemento
            onItemClick(item);
        }
    };

    const handleSubItemClick = (subItem: SubMenuItem) => {
        onSubItemClick(subItem, item);
        // Cerrar submenu en overlay después de seleccionar
        if (sideMenuBehavior === 'overlay') {
            setIsSubmenuExpanded(false);
        }
    };

    // Determinar si el submenu debe estar expandido
    const shouldShowSubmenu = isSubmenuExpanded && (showLabels || sideMenuBehavior === 'overlay');

    // Los iconos SIEMPRE se muestran, las etiquetas solo cuando no está colapsado
    const shouldShowLabels = !isCollapsed || sideMenuBehavior === 'overlay';

    // Clases CSS para el elemento principal - simplificadas
    const mainItemClasses = `
    flex items-center text-left group relative cursor-pointer
    rounded-lg mx-2 my-1 transition-all duration-200 ease-in-out
    ${isCollapsed && sideMenuBehavior !== 'overlay' 
      ? 'px-2 py-2 justify-center w-12 h-12 min-w-12' 
      : 'px-4 py-3 justify-start w-full'
    }
    ${isActive 
      ? 'bg-blue-500 text-white shadow-md' 
      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
    }
  `;



    return (
        <div className="wf-relative">
            {/* Elemento principal del menú */}
            <button
                onClick={handleItemClick}
                className={mainItemClasses}
                title={isCollapsed && !isMobile ? item.label : undefined}
                aria-expanded={item.submenu ? isSubmenuExpanded : undefined}
                aria-haspopup={item.submenu ? 'true' : undefined}
                tabIndex={0}
            >
                {/* Icono - SIEMPRE visible */}
                <div className="wf-flex-shrink-0 wf-flex wf-items-center wf-justify-center">
                    <Icon
                        name={item.icon}
                        size="lg"
                        className="wf-text-xl"
                    />
                </div>

                {/* Contenido del elemento - solo cuando no está colapsado */}
                {shouldShowLabels && (
                    <>
                        {/* Etiqueta */}
                        <span className="wf-menu-label wf-ml-3 wf-flex-1 wf-text-sm wf-truncate">
                            {item.label}
                        </span>

                        {/* Badge de notificación */}
                        {item.badge && (
                            <div className="wf-ml-2 wf-flex-shrink-0">
                                <span className="wf-menu-badge wf-inline-flex wf-items-center wf-justify-center wf-w-2 wf-h-2 wf-rounded-full" />
                            </div>
                        )}

                        {/* Indicador de submenu */}
                        {item.submenu && item.submenu.length > 0 && (
                            <div className="wf-ml-2 wf-flex-shrink-0">
                                <Icon
                                    name={isSubmenuExpanded ? 'chevron-up' : 'chevron-down'}
                                    size="sm"
                                    className={`wf-text-gray-400 ${animationsEnabled ? 'wf-transition-transform wf-duration-200' : ''}`}
                                />
                            </div>
                        )}
                    </>
                )}

                {/* Badge para modo colapsado - posicionado sobre el icono */}
                {!shouldShowLabels && item.badge && (
                    <div className="wf-absolute wf-top-0 wf-right-0 wf-transform wf-translate-x-1 wf--translate-y-1">
                        <span className="wf-menu-badge wf-inline-flex wf-items-center wf-justify-center wf-w-3 wf-h-3 wf-rounded-full wf-bg-red-500" />
                    </div>
                )}

                {/* Tooltip para modo colapsado */}
                {isCollapsed && sideMenuBehavior !== 'overlay' && !shouldShowLabels && (
                    <div className={`
            wf-menu-tooltip wf-absolute wf-left-full wf-ml-3 wf-px-3 wf-py-2 wf-text-sm wf-whitespace-nowrap wf-z-50
            wf-bg-gray-900 wf-text-white wf-rounded-md wf-shadow-lg
            wf-opacity-0 wf-pointer-events-none group-hover:wf-opacity-100 group-hover:wf-visible
            ${animationsEnabled ? 'wf-transition-all wf-duration-200 wf-ease-in-out' : ''}
          `}>
                        {item.label}
                        {item.badge && (
                            <span className="wf-ml-2 wf-inline-flex wf-items-center wf-justify-center wf-w-2 wf-h-2 wf-bg-red-500 wf-rounded-full" />
                        )}
                        {/* Flecha del tooltip */}
                        <div className="wf-absolute wf-left-0 wf-top-1/2 wf-transform wf--translate-x-1 wf--translate-y-1/2">
                            <div className="wf-w-0 wf-h-0 wf-border-t-4 wf-border-b-4 wf-border-r-4 wf-border-transparent wf-border-r-gray-900"></div>
                        </div>
                    </div>
                )}
            </button>

            {/* Submenu */}
            {shouldShowSubmenu && item.submenu && (
                <div className={`
          wf-submenu
          ${isCollapsed && sideMenuBehavior !== 'overlay' ? 'wf-ml-2' : 'wf-ml-4'}
          ${animationsEnabled ? 'wf-nav-smooth-transitions' : ''}
        `}>
                    {item.submenu.map((subItem) => (
                        <button
                            key={subItem.id}
                            onClick={() => handleSubItemClick(subItem)}
                            tabIndex={0}
                            className={`
                wf-submenu-item wf-w-full wf-flex wf-items-center wf-text-left wf-cursor-pointer
                ${isCollapsed && sideMenuBehavior !== 'overlay' ? 'wf-pl-4 wf-pr-2 wf-py-2' : 'wf-pl-8 wf-pr-4 wf-py-2'}
                ${animationsEnabled ? 'wf-nav-smooth-transitions' : ''}
                ${activeSubItemId === subItem.id ? 'wf-active' : ''}
              `}
                        >
                            {/* Indicador visual para subitem */}
                            <div className="wf-w-2 wf-h-2 wf-bg-current wf-opacity-50 wf-rounded-full wf-mr-3 wf-flex-shrink-0" />

                            {/* Etiqueta del subitem */}
                            {shouldShowLabels && (
                                <span className="wf-text-sm wf-truncate">
                                    {subItem.label}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}


        </div>
    );
};

export default MenuItem;