import React from 'react';

interface HeroCinematicProps {
  title: string;
  subtitle?: string;
  description?: string;
  backgroundImage?: string;
  children?: React.ReactNode;
  className?: string;
}

const HeroCinematic: React.FC<HeroCinematicProps> = ({
  title,
  subtitle,
  description,
  backgroundImage,
  children,
  className = ''
}) => {
  const heroStyle = backgroundImage ? {
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4)), url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed'
  } : {};

  return (
    <section 
      className={`wf-hero-section wf-particles-bg wf-spotlight ${className}`}
      style={heroStyle}
    >
      <div className="wf-container">
        <div className="wf-animate-cinematic-entrance">
          <h1 className="wf-text-hero wf-text-shimmer wf-mb-6">
            {title}
          </h1>
          
          {subtitle && (
            <h2 className="wf-text-2xl wf-text-cinematic wf-mb-4">
              {subtitle}
            </h2>
          )}
          
          {description && (
            <p className="wf-text-lg wf-text-secondary wf-mb-8 wf-mx-auto" 
               style={{ maxWidth: '600px' }}>
              {description}
            </p>
          )}
          
          {children && (
            <div className="wf-flex wf-justify-center wf-gap-4 wf-flex-wrap">
              {children}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroCinematic;