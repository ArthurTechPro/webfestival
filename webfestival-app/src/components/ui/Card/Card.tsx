import React from 'react';
import styles from './Card.module.scss';

// === INTERFACES ===
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'clean' | 'professional' | 'corporate' | 'glass' | 'minimal' | 'elevated' | 'outlined';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  loading?: boolean;
  disabled?: boolean;
  selected?: boolean;
  error?: boolean;
  className?: string;
}

export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardSubtitleProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardActionsProps {
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end' | 'between';
  className?: string;
}

export interface MediaCardProps extends Omit<CardProps, 'children'> {
  src: string;
  alt: string;
  children: React.ReactNode;
}

// === HOOK PARA ADAPTACIÓN AUTOMÁTICA DE TEMA ===
const useThemeVariant = () => {
  const [currentTheme, setCurrentTheme] = React.useState<string>('professional');
  
  React.useEffect(() => {
    const theme = document.documentElement.getAttribute('data-theme') || 'professional';
    setCurrentTheme(theme);
    
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
  if (variant !== 'default') {
    return variant;
  }
  
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
      return 'clean';
  }
};

// === COMPONENTE CARD PRINCIPAL ===
const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  size = 'md',
  interactive = false,
  loading = false,
  disabled = false,
  selected = false,
  error = false,
  className = '',
  onClick,
  ...props
}) => {
  const currentTheme = useThemeVariant();
  const finalVariant = getVariantForTheme(variant, currentTheme);
  
  const cardClasses = [
    styles.card,
    styles[finalVariant],
    styles[size],
    interactive && styles.interactive,
    loading && styles.loading,
    disabled && styles.disabled,
    selected && styles.selected,
    error && styles.error,
    className
  ].filter(Boolean).join(' ');
  
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || loading) return;
    onClick?.(e);
  };
  
  return (
    <div
      className={cardClasses}
      onClick={interactive ? handleClick : onClick}
      {...props}
    >
      {children}
    </div>
  );
};

// === COMPONENTES AUXILIARES ===

export const CardHeader: React.FC<CardHeaderProps> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`${styles.header} ${className}`}>
    {children}
  </div>
);

export const CardTitle: React.FC<CardTitleProps> = ({ 
  children, 
  className = '' 
}) => (
  <h3 className={`${styles.title} ${className}`}>
    {children}
  </h3>
);

export const CardSubtitle: React.FC<CardSubtitleProps> = ({ 
  children, 
  className = '' 
}) => (
  <p className={`${styles.subtitle} ${className}`}>
    {children}
  </p>
);

export const CardBody: React.FC<CardBodyProps> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`${styles.body} ${className}`}>
    {children}
  </div>
);

export const CardFooter: React.FC<CardFooterProps> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`${styles.footer} ${className}`}>
    {children}
  </div>
);

export const CardActions: React.FC<CardActionsProps> = ({ 
  children, 
  align = 'start',
  className = '' 
}) => {
  const alignClass = align !== 'start' ? styles[align] : '';
  
  return (
    <div className={`${styles.actions} ${alignClass} ${className}`}>
      {children}
    </div>
  );
};

// === COMPONENTE MEDIA CARD ===
export const MediaCard: React.FC<MediaCardProps> = ({
  src,
  alt,
  children,
  className = '',
  ...props
}) => {
  return (
    <Card className={`${styles.mediaCard} ${className}`} {...props}>
      <img src={src} alt={alt} className={styles.media} />
      <div className={styles.content}>
        {children}
      </div>
    </Card>
  );
};

// === COMPONENTES DE LAYOUT ===

export interface CardGridProps {
  children: React.ReactNode;
  className?: string;
}

export const CardGrid: React.FC<CardGridProps> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`${styles.cardGrid} ${className}`}>
    {children}
  </div>
);

export interface CardMasonryProps {
  children: React.ReactNode;
  className?: string;
}

export const CardMasonry: React.FC<CardMasonryProps> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`${styles.cardMasonry} ${className}`}>
    {children}
  </div>
);

// === EXPORTS ===
export default Card;