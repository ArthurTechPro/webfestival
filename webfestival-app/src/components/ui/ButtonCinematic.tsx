import React from 'react';
// import { useComponentVariant } from '../../hooks/useComponentVariant';

interface ButtonCinematicProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'photo' | 'video' | 'audio' | 'cinema' | 'professional' | 'corporate' | 'minimal';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  theme?: 'auto' | 'looper' | 'corporate';
}

const ButtonCinematic: React.FC<ButtonCinematicProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  className = '',
  onClick,
  type = 'button',
  theme = 'auto'
}) => {
  // const { variant: autoVariant } = useComponentVariant();
  const autoVariant = 'cinematic'; // Fallback temporal
  
  // Determinar la variante final basada en el tema si es 'auto'
  const finalVariant = theme === 'auto' ? 
    (variant === 'primary' ? getAutoVariantForTheme(autoVariant) : variant) : 
    variant;

  const baseClasses = 'wf-btn wf-hover-cinematic';
  
  const variantClasses = {
    primary: 'wf-btn-primary',
    secondary: 'wf-btn-secondary',
    outline: 'wf-btn-outline',
    ghost: 'wf-btn-ghost',
    photo: 'wf-btn-photo',
    video: 'wf-btn-video',
    audio: 'wf-btn-audio',
    cinema: 'wf-btn-cinema',
    professional: 'wf-btn-professional',
    corporate: 'wf-btn-corporate',
    minimal: 'wf-btn-minimal'
  };

  // Función para obtener variante automática según el tema
  function getAutoVariantForTheme(themeVariant: string): keyof typeof variantClasses {
    switch (themeVariant) {
      case 'professional':
        return 'professional';
      case 'corporate':
        return 'corporate';
      case 'cinematic':
        return 'primary'; // Mantener estilo cinematográfico
      default:
        return 'primary';
    }
  }

  const sizeClasses = {
    sm: 'wf-btn-sm',
    md: '',
    lg: 'wf-btn-lg',
    xl: 'wf-btn-xl'
  };

  const buttonClasses = `
    ${baseClasses}
    ${variantClasses[finalVariant]}
    ${sizeClasses[size]}
    ${disabled || loading ? 'wf-opacity-50 wf-cursor-not-allowed' : ''}
    ${className}
  `.trim();

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <div className="wf-spinner wf-mr-2" />
          Cargando...
        </>
      );
    }

    return (
      <>
        {icon && iconPosition === 'left' && (
          <span className="wf-mr-2">{icon}</span>
        )}
        {children}
        {icon && iconPosition === 'right' && (
          <span className="wf-ml-2">{icon}</span>
        )}
      </>
    );
  };

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {renderContent()}
    </button>
  );
};

export default ButtonCinematic;