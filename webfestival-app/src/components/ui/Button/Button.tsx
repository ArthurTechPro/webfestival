import React from 'react';
import styles from './Button.module.scss';

// === INTERFACES ===
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'professional' | 'corporate' | 'glass' | 'minimal' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  iconOnly?: boolean;
  fullWidth?: boolean;
  className?: string;
}

// === HOOK PARA ADAPTACIÓN AUTOMÁTICA DE TEMA ===
const useThemeVariant = () => {
  const [currentTheme, setCurrentTheme] = React.useState<string>('professional');
  
  React.useEffect(() => {
    // Detectar tema actual del documento
    const theme = document.documentElement.getAttribute('data-theme') || 'professional';
    setCurrentTheme(theme);
    
    // Observer para cambios de tema
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          const newTheme = document.documentElement.getAttribute('data-theme') || 'professional';
          setCurrentTheme(newTheme);
        }
      });
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
    
    return () => observer.disconnect();
  }, []);
  
  return currentTheme;
};

// === FUNCIÓN PARA MAPEAR VARIANTE SEGÚN TEMA ===
const getVariantForTheme = (variant: string, theme: string): string => {
  // Si se especifica una variante específica, usarla
  if (variant !== 'primary') {
    return variant;
  }
  
  // Auto-adaptación para variante 'primary'
  switch (theme) {
    case 'cinematic':
    case 'neuro':
    case 'retro':
    case 'ocean':
    case 'sunset':
    case 'forest':
      return 'glass';
    case 'professional':
      return 'professional';
    case 'corporate':
      return 'corporate';
    case 'minimal':
      return 'minimal';
    default:
      return 'primary';
  }
};

// === COMPONENTE BUTTON ===
const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  iconOnly = false,
  fullWidth = false,
  className = '',
  disabled = false,
  type = 'button',
  ...props
}) => {
  const currentTheme = useThemeVariant();
  const finalVariant = getVariantForTheme(variant, currentTheme);
  
  // Construir clases CSS
  const buttonClasses = [
    styles.button,
    styles[finalVariant],
    styles[size],
    loading && styles.loading,
    icon && styles.withIcon,
    iconOnly && styles.iconOnly,
    fullWidth && 'w-100',
    className
  ].filter(Boolean).join(' ');
  
  // Renderizar contenido del botón
  const renderContent = () => {
    if (iconOnly && icon) {
      return <span className={styles.icon}>{icon}</span>;
    }
    
    if (icon && iconPosition === 'left') {
      return (
        <>
          <span className={styles.icon}>{icon}</span>
          {children}
        </>
      );
    }
    
    if (icon && iconPosition === 'right') {
      return (
        <>
          {children}
          <span className={styles.icon}>{icon}</span>
        </>
      );
    }
    
    return children;
  };
  
  return (
    <button
      className={buttonClasses}
      disabled={disabled || loading}
      type={type}
      {...props}
    >
      {renderContent()}
    </button>
  );
};

// === COMPONENTE BUTTON GROUP ===
export interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`${styles.buttonGroup} ${className}`}>
      {children}
    </div>
  );
};

// === EXPORTS ===
export default Button;