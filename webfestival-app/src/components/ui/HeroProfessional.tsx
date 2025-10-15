import React from 'react';
import { useTheme } from '../../hooks/useTheme';

interface HeroProfessionalProps {
  title: string;
  subtitle?: string;
  description?: string;
  primaryAction?: {
    text: string;
    href: string;
    variant?: 'primary' | 'secondary';
  };
  secondaryAction?: {
    text: string;
    href: string;
  };
  image?: string;
  layout?: 'split' | 'centered' | 'minimal';
  theme?: 'looper' | 'corporate' | 'auto';
  className?: string;
}

/**
 * Componente Hero profesional basado en landing-page.html
 * Diseñado para temas profesionales (Looper y Corporate)
 * Complementa al HeroCinematic existente
 */
const HeroProfessional: React.FC<HeroProfessionalProps> = ({
  title,
  subtitle,
  description,
  primaryAction,
  secondaryAction,
  image,
  layout = 'split',
  theme = 'auto',
  className = ''
}) => {
  const { theme: currentTheme } = useTheme();
  
  // Determinar el tema efectivo
  const effectiveTheme = theme === 'auto' ? currentTheme : theme;
  

  
  // Clases base según el layout
  const getLayoutClasses = () => {
    switch (layout) {
      case 'centered':
        return 'wf-hero-professional-centered';
      case 'minimal':
        return 'wf-hero-professional-minimal';
      default:
        return 'wf-hero-professional-split';
    }
  };
  
  // Clases de tema específico
  const getThemeClasses = () => {
    if (effectiveTheme === 'looper') {
      return 'wf-hero-looper';
    }
    if (effectiveTheme === 'corporate') {
      return 'wf-hero-corporate';
    }
    return 'wf-hero-professional-default';
  };

  return (
    <section 
      className={`wf-hero-professional ${getLayoutClasses()} ${getThemeClasses()} ${className}`}
    >
      <div className="wf-container">
        {layout === 'split' ? (
          <div className="wf-row wf-align-items-center wf-min-vh-75">
            {/* Columna de contenido */}
            <div className="wf-col-lg-6 wf-col-md-12">
              <div className="wf-hero-content">
                {subtitle && (
                  <div className="wf-hero-subtitle wf-mb-3">
                    {subtitle}
                  </div>
                )}
                
                <h1 className="wf-hero-title wf-mb-4">
                  {title}
                </h1>
                
                {description && (
                  <p className="wf-hero-description wf-mb-5">
                    {description}
                  </p>
                )}
                
                {(primaryAction || secondaryAction) && (
                  <div className="wf-hero-actions">
                    {primaryAction && (
                      <a
                        href={primaryAction.href}
                        className={`wf-btn wf-btn-${primaryAction.variant || 'primary'} wf-btn-lg wf-me-3 wf-mb-3`}
                      >
                        {primaryAction.text}
                      </a>
                    )}
                    
                    {secondaryAction && (
                      <a
                        href={secondaryAction.href}
                        className="wf-btn wf-btn-outline-secondary wf-btn-lg wf-mb-3"
                      >
                        {secondaryAction.text}
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Columna de imagen */}
            {image && (
              <div className="wf-col-lg-6 wf-col-md-12">
                <div className="wf-hero-image">
                  <img
                    src={image}
                    alt={title}
                    className="wf-img-fluid wf-rounded"
                  />
                </div>
              </div>
            )}
          </div>
        ) : layout === 'centered' ? (
          <div className="wf-row wf-justify-content-center wf-text-center wf-min-vh-75 wf-align-items-center">
            <div className="wf-col-lg-8 wf-col-md-10">
              <div className="wf-hero-content">
                {subtitle && (
                  <div className="wf-hero-subtitle wf-mb-3">
                    {subtitle}
                  </div>
                )}
                
                <h1 className="wf-hero-title wf-mb-4">
                  {title}
                </h1>
                
                {description && (
                  <p className="wf-hero-description wf-mb-5">
                    {description}
                  </p>
                )}
                
                {image && (
                  <div className="wf-hero-image wf-mb-5">
                    <img
                      src={image}
                      alt={title}
                      className="wf-img-fluid wf-rounded wf-shadow"
                    />
                  </div>
                )}
                
                {(primaryAction || secondaryAction) && (
                  <div className="wf-hero-actions">
                    {primaryAction && (
                      <a
                        href={primaryAction.href}
                        className={`wf-btn wf-btn-${primaryAction.variant || 'primary'} wf-btn-lg wf-me-3 wf-mb-3`}
                      >
                        {primaryAction.text}
                      </a>
                    )}
                    
                    {secondaryAction && (
                      <a
                        href={secondaryAction.href}
                        className="wf-btn wf-btn-outline-secondary wf-btn-lg wf-mb-3"
                      >
                        {secondaryAction.text}
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Layout minimal
          <div className="wf-row wf-justify-content-center wf-text-center wf-py-5">
            <div className="wf-col-lg-6 wf-col-md-8">
              <div className="wf-hero-content">
                <h1 className="wf-hero-title wf-mb-4">
                  {title}
                </h1>
                
                {description && (
                  <p className="wf-hero-description wf-mb-4">
                    {description}
                  </p>
                )}
                
                {primaryAction && (
                  <a
                    href={primaryAction.href}
                    className={`wf-btn wf-btn-${primaryAction.variant || 'primary'} wf-btn-lg`}
                  >
                    {primaryAction.text}
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroProfessional;