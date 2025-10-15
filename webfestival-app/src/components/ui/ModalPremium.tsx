import React, { useEffect } from 'react';
// import { useComponentVariant } from '../../hooks/useComponentVariant';

interface ModalPremiumProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant?: 'glass' | 'cinematic' | 'dark' | 'professional' | 'corporate' | 'clean';
  layout?: 'default' | 'form' | 'split' | 'centered';
  className?: string;
  theme?: 'auto' | 'looper' | 'corporate';
}

const ModalPremium: React.FC<ModalPremiumProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  variant = 'glass',
  layout = 'default',
  className = '',
  theme = 'auto'
}) => {
  // const { variant: autoVariant } = useComponentVariant();
  const autoVariant = 'glass'; // Fallback temporal
  
  // Determinar la variante final basada en el tema si es 'auto'
  const finalVariant = theme === 'auto' ? 
    getAutoModalVariantForTheme(autoVariant, variant) : 
    variant;

  // Función para obtener variante automática de modal según el tema
  function getAutoModalVariantForTheme(themeVariant: string, currentVariant: string): string {
    if (currentVariant !== 'glass') return currentVariant;
    
    switch (themeVariant) {
      case 'professional':
        return 'professional';
      case 'corporate':
        return 'corporate';
      case 'cinematic':
        return 'glass';
      default:
        return 'clean';
    }
  }
  // Cerrar con Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'wf-max-w-md',
    md: 'wf-max-w-lg',
    lg: 'wf-max-w-2xl',
    xl: 'wf-max-w-4xl',
    full: 'wf-max-w-7xl'
  };

  const variantClasses = {
    glass: 'wf-glass',
    cinematic: 'wf-bg-black wf-bg-opacity-90 wf-border wf-border-yellow-600',
    dark: 'wf-glass-dark',
    professional: 'wf-modal-professional',
    corporate: 'wf-modal-corporate',
    clean: 'wf-modal-clean'
  };

  const layoutClasses = {
    default: '',
    form: 'wf-modal-form-layout',
    split: 'wf-modal-split-layout',
    centered: 'wf-modal-centered-layout'
  };

  return (
    <div className={`wf-modal-backdrop ${finalVariant === 'glass' || finalVariant === 'cinematic' ? 'wf-particles-bg' : ''}`}>
      <div 
        className={`
          wf-modal 
          ${finalVariant === 'glass' || finalVariant === 'cinematic' ? 'wf-animate-cinematic-entrance wf-spotlight' : 'wf-animate-fade-in'}
          ${sizeClasses[size]}
          ${variantClasses[finalVariant as keyof typeof variantClasses]}
          ${layoutClasses[layout]}
          ${className}
        `}
      >
        {/* Header */}
        {title && (
          <div className="wf-modal-header">
            <h2 className="wf-modal-title wf-text-cinematic">
              {title}
            </h2>
            <button
              className="wf-modal-close wf-hover-glow"
              onClick={onClose}
              aria-label="Cerrar modal"
            >
              ✕
            </button>
          </div>
        )}

        {/* Body */}
        <div className="wf-modal-body">
          {children}
        </div>

        {/* Efecto de brillo en los bordes solo para variantes cinematográficas */}
        {(finalVariant === 'glass' || finalVariant === 'cinematic') && (
          <div className="wf-absolute wf-inset-0 wf-pointer-events-none wf-rounded-2xl">
            <div className="wf-absolute wf-top-0 wf-left-0 wf-right-0 wf-h-px wf-bg-gradient-to-r wf-from-transparent wf-via-white wf-to-transparent wf-opacity-30" />
            <div className="wf-absolute wf-bottom-0 wf-left-0 wf-right-0 wf-h-px wf-bg-gradient-to-r wf-from-transparent wf-via-white wf-to-transparent wf-opacity-30" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalPremium;