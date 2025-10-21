import type { User } from '../types/auth';
import navigationMenuOptions from '../../../.kiro/specs/webfestival-platform/navigation-menu-options.json';

// Importar tipos desde NavigationContext para evitar dependencias circulares
export type SideMenuBehavior = 'overlay' | 'push' | 'static';

// Tipos para el servicio de navegación
export interface MenuItem {
  id: string;
  icon: string;
  label: string;
  route?: string;
  action?: string;
  submenu?: SubMenuItem[];
  badge?: boolean;
  active?: boolean;
  roles?: string[];
}

export interface SubMenuItem {
  id: string;
  label: string;
  route: string;
  roles?: string[];
}

export interface UserMenuOption {
  icon: string;
  label: string;
  route?: string;
  action?: string;
  badge?: boolean;
}

export interface NavigationConfig {
  topMenu: {
    logo: string;
    userOptions: UserMenuOption[];
  };
  sideMenu: MenuItem[];
}

export interface BreadcrumbItem {
  label: string;
  route?: string;
  active?: boolean;
}

/**
 * Servicio de navegación que gestiona menús por roles
 * Carga configuración desde navigation-menu-options.json
 */
class NavigationService {
  private menuOptions: any;
  private currentPath: string = '';
  private breadcrumbs: BreadcrumbItem[] = [];

  constructor() {
    this.menuOptions = navigationMenuOptions.menuOptions;
  }

  /**
   * Obtiene la configuración de navegación para un rol específico
   */
  getNavigationForRole(role: string): NavigationConfig {
    const roleConfig = this.menuOptions[role];
    
    if (!roleConfig) {
      console.warn(`No se encontró configuración de navegación para el rol: ${role}`);
      return this.getDefaultNavigation();
    }

    return {
      topMenu: {
        logo: roleConfig.topMenu.logo || 'WebFestival',
        userOptions: roleConfig.topMenu.userOptions || []
      },
      sideMenu: this.processMenuItems(roleConfig.sideMenu || [], role)
    };
  }

  /**
   * Procesa los elementos del menú agregando IDs únicos y configuración adicional
   */
  private processMenuItems(menuItems: any[], role: string): MenuItem[] {
    return menuItems.map((item, index) => {
      const menuItem: MenuItem = {
        id: this.generateMenuItemId(item.label, index),
        icon: item.icon,
        label: item.label,
        route: item.route,
        action: item.action,
        badge: item.badge || false,
        active: item.active || false,
        roles: [role]
      };

      // Procesar submenú si existe
      if (item.submenu && Array.isArray(item.submenu)) {
        menuItem.submenu = item.submenu.map((subItem: any, subIndex: number) => ({
          id: this.generateMenuItemId(`${item.label}-${subItem.label}`, subIndex),
          label: subItem.label,
          route: subItem.route,
          roles: [role]
        }));
      }

      return menuItem;
    });
  }

  /**
   * Genera un ID único para un elemento del menú
   */
  private generateMenuItemId(label: string, index: number): string {
    return `menu-${label.toLowerCase().replace(/\s+/g, '-')}-${index}`;
  }

  /**
   * Filtra elementos del menú según los permisos del usuario
   */
  filterMenuByPermissions(menuItems: MenuItem[], user: User | null): MenuItem[] {
    if (!user) {
      return [];
    }

    return menuItems.filter(item => {
      // Verificar si el usuario tiene permisos para este elemento
      if (item.roles && !item.roles.includes(user.role)) {
        return false;
      }

      // Filtrar submenú si existe
      if (item.submenu) {
        item.submenu = item.submenu.filter(subItem => 
          !subItem.roles || subItem.roles.includes(user.role)
        );
      }

      return true;
    });
  }

  /**
   * Obtiene opciones del menú de usuario filtradas por rol
   */
  getUserMenuOptions(role: string): UserMenuOption[] {
    const roleConfig = this.menuOptions[role];
    return roleConfig?.topMenu?.userOptions || this.getDefaultUserOptions();
  }

  /**
   * Verifica si un usuario tiene permisos para acceder a una ruta
   */
  hasPermissionForRoute(route: string, user: User | null): boolean {
    if (!user) {
      return false;
    }

    const navigation = this.getNavigationForRole(user.role);
    
    // Buscar en elementos principales
    const hasMainPermission = navigation.sideMenu.some(item => 
      item.route === route
    );

    // Buscar en submenús
    const hasSubmenuPermission = navigation.sideMenu.some(item => 
      item.submenu?.some(subItem => subItem.route === route)
    );

    return hasMainPermission || hasSubmenuPermission;
  }

  /**
   * Encuentra un elemento del menú por su ruta
   */
  findMenuItemByRoute(route: string, role: string): MenuItem | SubMenuItem | null {
    const navigation = this.getNavigationForRole(role);
    
    // Buscar en elementos principales
    for (const item of navigation.sideMenu) {
      if (item.route === route) {
        return item;
      }
      
      // Buscar en submenú
      if (item.submenu) {
        for (const subItem of item.submenu) {
          if (subItem.route === route) {
            return subItem;
          }
        }
      }
    }
    
    return null;
  }

  /**
   * Genera breadcrumbs para la ruta actual
   */
  generateBreadcrumbs(currentRoute: string, role: string): BreadcrumbItem[] {
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Inicio', route: '/app/dashboard' }
    ];

    const navigation = this.getNavigationForRole(role);
    
    // Buscar el elemento del menú correspondiente a la ruta actual
    for (const item of navigation.sideMenu) {
      if (item.route === currentRoute) {
        breadcrumbs.push({
          label: item.label,
          route: item.route,
          active: true
        });
        break;
      }
      
      // Buscar en submenú
      if (item.submenu) {
        for (const subItem of item.submenu) {
          if (subItem.route === currentRoute) {
            breadcrumbs.push({
              label: item.label,
              route: item.route
            });
            breadcrumbs.push({
              label: subItem.label,
              route: subItem.route,
              active: true
            });
            break;
          }
        }
      }
    }

    this.breadcrumbs = breadcrumbs;
    return breadcrumbs;
  }

  /**
   * Obtiene los breadcrumbs actuales
   */
  getCurrentBreadcrumbs(): BreadcrumbItem[] {
    return this.breadcrumbs;
  }

  /**
   * Actualiza la ruta actual y regenera breadcrumbs
   */
  setCurrentPath(path: string, role: string): void {
    this.currentPath = path;
    this.generateBreadcrumbs(path, role);
  }

  /**
   * Obtiene la ruta actual
   */
  getCurrentPath(): string {
    return this.currentPath;
  }

  /**
   * Obtiene la configuración responsive
   */
  getResponsiveSettings() {
    return navigationMenuOptions.responsiveSettings || {
      mobile: {
        sideMenuBehavior: 'overlay',
        showLabels: false,
        collapsible: true
      },
      tablet: {
        sideMenuBehavior: 'push',
        showLabels: true,
        collapsible: true
      },
      desktop: {
        sideMenuBehavior: 'static',
        showLabels: true,
        collapsible: true
      }
    };
  }

  /**
   * Obtiene elementos comunes de configuración
   */
  getCommonElements() {
    return navigationMenuOptions.commonElements;
  }

  /**
   * Configuración por defecto para roles no reconocidos
   */
  private getDefaultNavigation(): NavigationConfig {
    return {
      topMenu: {
        logo: 'WebFestival',
        userOptions: this.getDefaultUserOptions()
      },
      sideMenu: [
        {
          id: 'dashboard',
          icon: 'home',
          label: 'Dashboard',
          route: '/app/dashboard',
          active: true
        }
      ]
    };
  }

  /**
   * Opciones por defecto del menú de usuario
   */
  private getDefaultUserOptions(): UserMenuOption[] {
    return [
      {
        icon: 'user',
        label: 'Mi Perfil',
        route: '/app/profile'
      },
      {
        icon: 'settings',
        label: 'Configuración',
        route: '/app/settings'
      },
      {
        icon: 'logout',
        label: 'Cerrar Sesión',
        action: 'logout'
      }
    ];
  }

  /**
   * Valida si un elemento del menú debe mostrarse según el contexto
   */
  shouldShowMenuItem(item: MenuItem, user: User | null, _currentPath?: string): boolean {
    // Verificar permisos de rol
    if (!user || (item.roles && !item.roles.includes(user.role))) {
      return false;
    }

    // Aquí se pueden agregar más validaciones contextuales
    // Por ejemplo, ocultar ciertos elementos según el estado de la suscripción
    // o según la ruta actual (_currentPath)
    
    return true;
  }

  /**
   * Marca el elemento activo basado en la ruta actual
   */
  setActiveMenuByRoute(menuItems: MenuItem[], currentRoute: string): MenuItem[] {
    return menuItems.map(item => {
      const isActive = item.route === currentRoute;
      let hasActiveSubmenu = false;

      // Verificar si algún submenú está activo
      if (item.submenu) {
        item.submenu = item.submenu.map(subItem => {
          const isSubActive = subItem.route === currentRoute;
          if (isSubActive) {
            hasActiveSubmenu = true;
          }
          return { ...subItem };
        });
      }

      return {
        ...item,
        active: isActive || hasActiveSubmenu
      };
    });
  }

  /**
   * Obtiene el elemento del menú activo actual
   */
  getActiveMenuItem(menuItems: MenuItem[], currentRoute: string): MenuItem | SubMenuItem | null {
    for (const item of menuItems) {
      if (item.route === currentRoute) {
        return item;
      }
      
      if (item.submenu) {
        for (const subItem of item.submenu) {
          if (subItem.route === currentRoute) {
            return subItem;
          }
        }
      }
    }
    
    return null;
  }

  /**
   * Obtiene todas las rutas disponibles para un rol
   */
  getAvailableRoutes(role: string): string[] {
    const navigation = this.getNavigationForRole(role);
    const routes: string[] = [];

    navigation.sideMenu.forEach(item => {
      if (item.route) {
        routes.push(item.route);
      }
      
      if (item.submenu) {
        item.submenu.forEach(subItem => {
          routes.push(subItem.route);
        });
      }
    });

    return routes;
  }

  /**
   * Valida si una ruta es válida para el rol del usuario
   */
  isValidRouteForRole(route: string, role: string): boolean {
    const availableRoutes = this.getAvailableRoutes(role);
    return availableRoutes.includes(route);
  }



  /**
   * Obtiene estadísticas del menú para debugging
   */
  getMenuStats(role: string): {
    totalItems: number;
    itemsWithSubmenu: number;
    totalSubItems: number;
  } {
    const navigation = this.getNavigationForRole(role);
    const itemsWithSubmenu = navigation.sideMenu.filter(item => item.submenu).length;
    const totalSubItems = navigation.sideMenu.reduce(
      (total, item) => total + (item.submenu?.length || 0), 
      0
    );

    return {
      totalItems: navigation.sideMenu.length,
      itemsWithSubmenu,
      totalSubItems
    };
  }
}

// Exportar instancia singleton
export const navigationService = new NavigationService();
export default navigationService;