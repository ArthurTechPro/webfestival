import React from 'react';

// Sistema de iconos unificado para elementos de navegación
export interface IconProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Mapeo de iconos usando emojis para consistencia visual
const iconMap: Record<string, string> = {
  // Navegación principal
  home: '🏠',
  dashboard: '📊',
  
  // Participante
  trophy: '🏆',
  upload: '📤',
  image: '🖼️',
  gallery: '🎨',
  users: '👥',
  community: '🌟',
  'credit-card': '💳',
  
  // Jurado
  'clipboard-check': '📋',
  'bar-chart': '📈',
  award: '🥇',
  evaluation: '⭐',
  progress: '📊',
  
  // Admin
  'user-group': '👥',
  list: '📝',
  settings: '⚙️',
  metrics: '📊',
  
  // Content Admin
  edit: '✏️',
  'file-text': '📄',
  mail: '📧',
  shield: '🛡️',
  analytics: '📈',
  
  // Usuario
  user: '👤',
  bell: '🔔',
  logout: '🚪',
  
  // Estados
  check: '✅',
  x: '❌',
  plus: '➕',
  minus: '➖',
  
  // Navegación
  'chevron-left': '◀️',
  'chevron-right': '▶️',
  'chevron-down': '🔽',
  'chevron-up': '🔼',
  menu: '☰',
  
  // Acciones
  search: '🔍',
  filter: '🔽',
  sort: '🔄',
  refresh: '🔄',
  
  // Multimedia
  video: '🎬',
  audio: '🎵',
  photo: '📸',
  film: '🎞️'
};

/**
 * Componente de icono unificado para el sistema de navegación
 */
export const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'wf-text-sm',
    md: 'wf-text-base',
    lg: 'wf-text-lg'
  };

  const iconEmoji = iconMap[name] || '❓';

  return (
    <span 
      className={`wf-inline-block ${sizeClasses[size]} ${className}`}
      role="img"
      aria-label={name}
    >
      {iconEmoji}
    </span>
  );
};

/**
 * Hook para obtener el emoji de un icono
 */
export const useIcon = (name: string): string => {
  return iconMap[name] || '❓';
};

/**
 * Función utilitaria para obtener todos los iconos disponibles
 */
export const getAvailableIcons = (): string[] => {
  return Object.keys(iconMap);
};

export default Icon;