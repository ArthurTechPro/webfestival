// Exportaciones del sistema de navegación
export { default as MenuItem } from './MenuItem';
export { default as Breadcrumb, CompactBreadcrumb, useBreadcrumbs } from './Breadcrumb';
export { default as NavigationThemeDemo } from './NavigationThemeDemo';

// Re-exportar tipos del servicio de navegación
export type {
  MenuItem as MenuItemType,
  SubMenuItem,
  UserMenuOption,
  NavigationConfig,
  BreadcrumbItem
} from '../../services/navigation.service';

// Re-exportar servicio de navegación
export { navigationService } from '../../services/navigation.service';