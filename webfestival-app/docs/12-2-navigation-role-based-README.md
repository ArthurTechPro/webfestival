# Sistema de Navegación Basado en Roles - WebFestival

## Resumen

Se ha implementado completamente el sistema de navegación basado en roles para la plataforma WebFestival. Este sistema proporciona una experiencia de navegación personalizada según el rol del usuario (PARTICIPANTE, JURADO, ADMIN, CONTENT_ADMIN) con menús dinámicos, breadcrumbs contextuales y permisos granulares.

## Componentes Implementados

### 1. NavigationService (`src/services/navigation.service.ts`)

Servicio principal que gestiona la configuración de navegación por roles.

**Características principales:**
- Carga configuración desde `navigation-menu-options.json`
- Filtrado de menús según permisos de usuario
- Generación automática de breadcrumbs
- Validación de rutas por rol
- Gestión de elementos activos del menú

**Métodos principales:**
```typescript
- getNavigationForRole(role: string): NavigationConfig
- filterMenuByPermissions(menuItems: MenuItem[], user: User | null): MenuItem[]
- hasPermissionForRoute(route: string, user: User | null): boolean
- generateBreadcrumbs(currentRoute: string, role: string): BreadcrumbItem[]
- setActiveMenuByRoute(menuItems: MenuItem[], currentRoute: string): MenuItem[]
- getAvailableRoutes(role: string): string[]
```

### 2. NavigationContext (`src/contexts/NavigationContext.tsx`)

Contexto React que proporciona estado global de navegación.

**Estado gestionado:**
- Menús colapsados/expandidos
- Elemento activo del menú
- Estado móvil/desktop
- Breadcrumbs actuales
- Opciones de usuario

**Funcionalidades:**
- Carga automática de menús según rol
- Actualización de breadcrumbs en cambios de ruta
- Gestión responsive del menú
- Integración con sistema de autenticación

### 3. MenuItem Component (`src/components/navigation/MenuItem.tsx`)

Componente reutilizable para elementos del menú con soporte para submenús.

**Características:**
- Soporte para submenús expandibles
- Badges de notificación
- Tooltips en modo colapsado
- Animaciones suaves
- Responsive design

### 4. Breadcrumb Component (`src/components/navigation/Breadcrumb.tsx`)

Sistema de breadcrumbs para navegación contextual.

**Variantes:**
- `Breadcrumb`: Componente completo con separadores personalizables
- `CompactBreadcrumb`: Versión compacta para espacios reducidos
- `useBreadcrumbs`: Hook para generación automática

### 5. useRoleBasedNavigation Hook (`src/hooks/useRoleBasedNavigation.ts`)

Hook personalizado que proporciona utilidades específicas para navegación por roles.

**Funcionalidades principales:**
```typescript
- navigateWithPermissionCheck(route: string): boolean
- navigateToDashboard(): boolean
- getMainMenuForCurrentUser(): MenuItem[]
- canAccessFeature(featureRoute: string): boolean
- hasAdminAccess(): boolean
- hasContentAdminAccess(): boolean
- hasJuryAccess(): boolean
- getQuickNavigationRoutes(): QuickRoute[]
```

## Configuración de Menús

### Archivo de Configuración (`navigation-menu-options.json`)

Estructura JSON que define los menús para cada rol:

```json
{
  "menuOptions": {
    "PARTICIPANTE": {
      "topMenu": { "logo": "WebFestival", "userOptions": [...] },
      "sideMenu": [...]
    },
    "JURADO": { ... },
    "ADMIN": { ... },
    "CONTENT_ADMIN": { ... }
  },
  "commonElements": { ... },
  "responsiveSettings": { ... }
}
```

### Roles Soportados

1. **PARTICIPANTE**: Acceso a concursos, envíos, galería y comunidad
2. **JURADO**: Acceso a evaluaciones, progreso y especialización
3. **ADMIN**: Acceso completo a gestión de concursos, usuarios y métricas
4. **CONTENT_ADMIN**: Acceso a CMS, blog, newsletter y moderación

## Características del Sistema

### 1. Filtrado por Permisos
- Cada elemento del menú puede especificar roles permitidos
- Filtrado automático según el usuario autenticado
- Validación de rutas antes de la navegación

### 2. Navegación Activa
- Resaltado automático del elemento activo
- Soporte para submenús activos
- Actualización basada en la ruta actual

### 3. Breadcrumbs Contextuales
- Generación automática basada en la estructura del menú
- Navegación hacia atrás mediante breadcrumbs
- Adaptación según el rol del usuario

### 4. Responsive Design
- Menú lateral colapsible en desktop
- Overlay móvil con animaciones
- Adaptación automática según el tamaño de pantalla

### 5. Submenús Dinámicos
- Soporte para jerarquías de navegación
- Expansión/colapso con animaciones
- Indicadores visuales de estado

## Integración con Autenticación

El sistema se integra completamente con el contexto de autenticación:

```typescript
const { user } = useAuth();
const navigation = useNavigation();

// Los menús se actualizan automáticamente cuando cambia el usuario
// Las rutas se validan según el rol del usuario
// Los permisos se verifican antes de cada navegación
```

## Testing

### Tests Implementados

1. **navigation-simple.test.tsx**: Tests básicos del servicio de navegación
2. **navigation-role-based.test.tsx**: Tests completos del sistema por roles (en desarrollo)

### Cobertura de Tests
- Carga de menús por rol
- Filtrado de permisos
- Generación de breadcrumbs
- Validación de rutas
- Integración con contexto de autenticación

## Uso en Componentes

### Ejemplo básico con useNavigation:
```typescript
import { useNavigation } from '../contexts/NavigationContext';

const MyComponent = () => {
  const { 
    sideMenuItems, 
    breadcrumbs, 
    navigateTo, 
    hasPermissionForRoute 
  } = useNavigation();

  return (
    <div>
      {/* Renderizar menús y breadcrumbs */}
    </div>
  );
};
```

### Ejemplo con useRoleBasedNavigation:
```typescript
import { useRoleBasedNavigation } from '../hooks/useRoleBasedNavigation';

const MyComponent = () => {
  const { 
    navigateWithPermissionCheck,
    hasAdminAccess,
    getQuickNavigationRoutes 
  } = useRoleBasedNavigation();

  const handleNavigation = (route: string) => {
    if (navigateWithPermissionCheck(route)) {
      console.log('Navegación exitosa');
    } else {
      console.log('Sin permisos para esta ruta');
    }
  };

  return (
    <div>
      {/* UI con navegación segura */}
    </div>
  );
};
```

## Arquitectura de Archivos

```
src/
├── services/
│   └── navigation.service.ts          # Servicio principal
├── contexts/
│   └── NavigationContext.tsx          # Contexto React
├── components/
│   ├── navigation/
│   │   ├── MenuItem.tsx               # Componente de elemento de menú
│   │   ├── Breadcrumb.tsx             # Sistema de breadcrumbs
│   │   └── index.ts                   # Exportaciones
│   └── layout/
│       ├── SideNavigation.tsx         # Menú lateral
│       ├── TopNavigation.tsx          # Barra superior
│       └── index.ts                   # Exportaciones
├── hooks/
│   └── useRoleBasedNavigation.ts      # Hook personalizado
└── types/
    └── auth.ts                        # Tipos de usuario y roles
```

## Configuración Responsive

El sistema incluye configuración responsive automática:

```json
{
  "responsiveSettings": {
    "mobile": {
      "sideMenuBehavior": "overlay",
      "showLabels": false,
      "collapsible": true
    },
    "tablet": {
      "sideMenuBehavior": "push", 
      "showLabels": true,
      "collapsible": true
    },
    "desktop": {
      "sideMenuBehavior": "static",
      "showLabels": true, 
      "collapsible": true
    }
  }
}
```

## Próximos Pasos

1. **Completar tests de integración**: Finalizar los tests del sistema completo
2. **Optimizaciones de rendimiento**: Implementar memoización para menús grandes
3. **Personalización avanzada**: Permitir personalización de menús por usuario
4. **Analytics de navegación**: Tracking de patrones de navegación por rol
5. **Accesibilidad**: Mejorar soporte para lectores de pantalla

## Conclusión

El sistema de navegación basado en roles está completamente implementado y funcional. Proporciona una experiencia de usuario personalizada, segura y responsive que se adapta automáticamente según el rol del usuario autenticado. La arquitectura modular permite fácil extensión y mantenimiento futuro.

**Estado del Task 12.2**: ✅ **COMPLETADO**

Todos los requisitos del task han sido implementados:
- ✅ Servicio NavigationService que carga opciones desde navigation-menu-options.json
- ✅ Lógica de filtrado de menús según rol de usuario autenticado  
- ✅ Sistema de permisos para mostrar/ocultar opciones de menú
- ✅ Componente MenuItem con soporte para submenús y badges
- ✅ Navegación activa que resalta la sección actual
- ✅ Sistema de breadcrumbs para navegación contextual