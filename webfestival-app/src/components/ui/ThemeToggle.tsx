import React from 'react';
import { useTheme } from '../../hooks/useTheme';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  position?: 'fixed' | 'relative';
  showLabel?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  size = 'md',
  position = 'relative',
  showLabel = false
}) => {
  const { toggleTheme, isDark } = useTheme();

  const sizeClasses = {
    sm: 'wf-btn-sm',
    md: '',
    lg: 'wf-btn-lg'
  };

  const buttonClasses = `
    wf-btn wf-btn-ghost 
    ${sizeClasses[size]} 
    ${position === 'fixed' ? 'wf-theme-toggle' : ''} 
    ${className}
  `.trim();

  return (
    <button
      type="button"
      className={buttonClasses}
      onClick={toggleTheme}
      aria-label={`Cambiar a tema ${isDark ? 'claro' : 'oscuro'}`}
      title={`Cambiar a tema ${isDark ? 'claro' : 'oscuro'}`}
    >
      <span className="wf-mr-2">
        {isDark ? '☀️' : '🌙'}
      </span>
      {showLabel && (
        <span className="wf-hide-mobile">
          {isDark ? 'Claro' : 'Oscuro'}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;