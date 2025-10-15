import React from 'react';
// import { useComponentVariant } from '../../hooks/useComponentVariant';

interface CardPremiumProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  image?: string;
  variant?: 'glass' | 'neuro' | 'cinematic' | 'clean' | 'professional' | 'corporate';
  hover?: 'lift' | 'cinematic' | 'glow' | 'subtle' | 'none';
  className?: string;
  onClick?: () => void;
  theme?: 'auto' | 'looper' | 'corporate';
}

const CardPremium: React.FC<CardPremiumProps> = ({
  title,
  subtitle,
  children,
  image,
  variant = 'glass',
  hover = 'cinematic',
  className = '',
  onClick,
  theme = 'auto'
}) => {
  // const { variant: autoVariant } = useComponentVariant();
  const autoVariant = 'glass'; // Fallback temporal
  
  // Determinar la variante final basada en el tema si es 'auto'
  const finalVariant = theme === 'auto' ? 
    getAutoCardVariantForTheme(autoVariant, variant) : 
    variant;

  const finalHover = theme === 'auto' ? 
    getAutoHoverForTheme(autoVariant, hover) : 
    hover;

  const variantClasses = {
    glass: 'wf-glass',
    neuro: 'wf-neuro',
    cinematic: 'wf-card',
    clean: 'wf-card-clean',
    professional: 'wf-card-professional',
    corporate: 'wf-card-corporate'
  };

  const hoverClasses = {
    lift: 'wf-hover-lift',
    cinematic: 'wf-hover-cinematic',
    glow: 'wf-hover-glow',
    subtle: 'wf-hover-subtle',
    none: ''
  };

  // Función para obtener variante automática de card según el tema
  function getAutoCardVariantForTheme(themeVariant: string, currentVariant: string): keyof typeof variantClasses {
    if (currentVariant !== 'glass') return currentVariant as keyof typeof variantClasses;
    
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

  // Función para obtener hover automático según el tema
  function getAutoHoverForTheme(themeVariant: string, currentHover: string): keyof typeof hoverClasses {
    if (currentHover !== 'cinematic') return currentHover as keyof typeof hoverClasses;
    
    switch (themeVariant) {
      case 'professional':
      case 'corporate':
        return 'subtle';
      case 'cinematic':
        return 'cinematic';
      default:
        return 'lift';
    }
  }

  const cardClasses = `
    ${variantClasses[finalVariant]}
    ${hoverClasses[finalHover]}
    ${finalVariant === 'cinematic' || finalVariant === 'glass' ? 'wf-animate-cinematic-entrance' : ''}
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `.trim();

  return (
    <div className={cardClasses} onClick={onClick}>
      {image && (
        <div className="wf-card-media">
          <img 
            src={image} 
            alt={title || 'Card image'} 
            className="wf-w-full wf-h-48 wf-object-cover"
          />
          <div className="wf-card-media-overlay">
            <div>
              {title && <h4 className="wf-text-lg wf-font-semibold">{title}</h4>}
              {subtitle && <p className="wf-text-sm wf-opacity-90">{subtitle}</p>}
            </div>
          </div>
        </div>
      )}
      
      <div className="wf-card-body">
        {!image && title && (
          <h3 className="wf-card-title wf-text-cinematic">
            {title}
          </h3>
        )}
        
        {!image && subtitle && (
          <p className="wf-card-subtitle">
            {subtitle}
          </p>
        )}
        
        <div className="wf-card-text">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CardPremium;