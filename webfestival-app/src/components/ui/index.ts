// UI Components Exports - CSS Modules + SCSS System

// Button Components
export { Button, ButtonGroup } from './Button';
export type { ButtonProps, ButtonGroupProps } from './Button';

// Card Components
export { 
  Card,
  CardHeader,
  CardTitle,
  CardSubtitle,
  CardBody,
  CardFooter,
  CardActions,
  MediaCard,
  CardGrid,
  CardMasonry
} from './Card';
export type { 
  CardProps,
  CardHeaderProps,
  CardTitleProps,
  CardSubtitleProps,
  CardBodyProps,
  CardFooterProps,
  CardActionsProps,
  MediaCardProps,
  CardGridProps,
  CardMasonryProps
} from './Card';

// Theme Selector
export { default as ThemeSelector } from './ThemeSelector/ThemeSelector';
export type { ThemeSelectorProps } from './ThemeSelector/ThemeSelector';

// Icon System
export { Icon, useIcon, getAvailableIcons } from './Icons/IconSystem';
export type { IconProps } from './Icons/IconSystem';

// Legacy exports for backward compatibility
// TODO: Remove these after migration is complete
// Temporarily commented out until migration is complete
// export { default as ButtonCinematic } from './ButtonCinematic';
// export { default as CardPremium } from './CardPremium';
// export { default as ModalPremium } from './ModalPremium';
// export { default as HeroCinematic } from './HeroCinematic';
// export { default as VideoPlayerPremium } from './VideoPlayerPremium';
// export { default as AudioPlayerPremium } from './AudioPlayerPremium';