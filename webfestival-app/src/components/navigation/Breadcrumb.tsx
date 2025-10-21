import React from 'react';
import { Icon } from '../ui/Icons/IconSystem';
import type { BreadcrumbItem } from '../../services/navigation.service';

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate?: (route: string) => void;
  className?: string;
  separator?: 'chevron' | 'slash' | 'arrow';
  maxItems?: number;
}

/**
 * Componente Breadcrumb para navegación contextual
 * Muestra la ruta de navegación actual con enlaces clicables
 */
const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  onNavigate,
  className = '',
  separator = 'chevron',
  maxItems = 4
}) => {
  // Si no hay elementos, no mostrar nada
  if (!items || items.length === 0) {
    return null;
  }

  // Procesar elementos para mostrar solo los más relevantes
  const processedItems = items.length > maxItems 
    ? [
        items[0], // Siempre mostrar el primer elemento (Inicio)
        { label: '...', route: undefined }, // Indicador de elementos omitidos
        ...items.slice(-(maxItems - 2)) // Mostrar los últimos elementos
      ]
    : items;

  const handleItemClick = (item: BreadcrumbItem) => {
    if (item.route && !item.active && onNavigate) {
      onNavigate(item.route);
    }
  };

  const getSeparatorIcon = () => {
    switch (separator) {
      case 'slash':
        return '/';
      case 'arrow':
        return '→';
      case 'chevron':
      default:
        return <Icon name="chevron-right" size="sm" className="wf-text-gray-400" />;
    }
  };

  const getSeparatorElement = (index: number) => {
    if (index === processedItems.length - 1) return null;
    
    return (
      <span className="wf-mx-2 wf-flex wf-items-center wf-text-gray-400">
        {getSeparatorIcon()}
      </span>
    );
  };

  return (
    <nav 
      className={`wf-flex wf-items-center wf-space-x-1 wf-text-sm ${className}`}
      aria-label="Breadcrumb"
    >
      <ol className="wf-flex wf-items-center wf-space-x-1">
        {processedItems.map((item, index) => (
          <li key={`${item.label}-${index}`} className="wf-flex wf-items-center">
            {/* Elemento del breadcrumb */}
            {item.route && !item.active ? (
              <button
                onClick={() => handleItemClick(item)}
                className="wf-text-gray-600 wf-hover:text-blue-600 wf-transition-colors wf-duration-200 wf-font-medium wf-truncate wf-max-w-32"
                title={item.label}
              >
                {item.label}
              </button>
            ) : item.label === '...' ? (
              <span className="wf-text-gray-400 wf-font-medium">
                {item.label}
              </span>
            ) : (
              <span 
                className={`wf-font-medium wf-truncate wf-max-w-32 ${
                  item.active 
                    ? 'wf-text-blue-600' 
                    : 'wf-text-gray-500'
                }`}
                title={item.label}
              >
                {item.label}
              </span>
            )}
            
            {/* Separador */}
            {getSeparatorElement(index)}
          </li>
        ))}
      </ol>
    </nav>
  );
};

/**
 * Componente Breadcrumb compacto para espacios reducidos
 */
export const CompactBreadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  onNavigate,
  className = ''
}) => {
  if (!items || items.length === 0) {
    return null;
  }

  const currentItem = items[items.length - 1];
  const parentItem = items.length > 1 ? items[items.length - 2] : null;

  return (
    <nav className={`wf-flex wf-items-center wf-text-sm ${className}`}>
      {parentItem && (
        <>
          <button
            onClick={() => parentItem.route && onNavigate?.(parentItem.route)}
            className="wf-text-gray-600 wf-hover:text-blue-600 wf-transition-colors wf-duration-200 wf-font-medium wf-truncate wf-max-w-24"
            title={parentItem.label}
          >
            {parentItem.label}
          </button>
          <Icon name="chevron-right" size="sm" className="wf-mx-2 wf-text-gray-400" />
        </>
      )}
      <span className="wf-text-blue-600 wf-font-medium wf-truncate wf-max-w-32" title={currentItem.label}>
        {currentItem.label}
      </span>
    </nav>
  );
};

/**
 * Hook para generar breadcrumbs automáticamente basado en la ruta
 */
export const useBreadcrumbs = (currentPath: string, _role?: string) => {
  // Este hook se puede implementar para generar breadcrumbs automáticamente
  // basado en la estructura de rutas de la aplicación
  
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = currentPath.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Inicio', route: '/app/dashboard' }
    ];

    // Generar breadcrumbs basado en los segmentos de la ruta
    let currentRoute = '';
    pathSegments.forEach((segment, index) => {
      currentRoute += `/${segment}`;
      
      // Convertir segmento a etiqueta legible
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      breadcrumbs.push({
        label,
        route: currentRoute,
        active: index === pathSegments.length - 1
      });
    });

    return breadcrumbs;
  };

  return {
    breadcrumbs: generateBreadcrumbs(),
    generateBreadcrumbs
  };
};

export default Breadcrumb;