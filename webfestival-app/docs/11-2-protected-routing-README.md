# Sistema de Routing Protegido - WebFestival App

## Descripción General

Sistema completo de routing protegido implementado en React Router 6+ que proporciona navegación basada en roles, guards de autenticación y redirecciones automáticas según el tipo de usuario.

## Arquitectura del Sistema

### Componentes Principales

#### 1. ProtectedRoute
Componente que protege rutas requiriendo autenticación y opcionalmente roles específicos.

**Ubicación:** `src/components/auth/ProtectedRoute.tsx`

**Características:**
- Verificación de autenticación con spinner de carga
- Validación de roles específicos
- Redirección automática a login o página de no autorizado
- Preservación de la ruta de origen para redirección posterior

#### 2. RoleBasedRedirect
Componente que redirige automáticamente según el rol del usuario autenticado.

**Ubicación:** `src/components/auth/RoleBasedRedirect.tsx`

**Funcionalidad:**
- Redirección automática a dashboard específico por rol
- Manejo de estados de carga
- Redirección a página de error para roles no reconocidos

#### 3. PublicRoute
Componente para rutas públicas que redirigen si el usuario ya está autenticado.

**Ubicación:** `src/components/auth/PublicRoute.tsx`

**Uso:** Páginas de login, registro, etc.

### Hooks Personalizados

#### useRoleBasedNavigation
Hook que proporciona funciones de navegación basada en roles.

**Ubicación:** `src/hooks/useRoleBasedNavigation.ts`

**Funciones:**
- `getDashboardRoute(role)`: Obtiene la ruta del dashboard según el rol
- `navigateToDashboard(role)`: Navega al dashboard apropiado
- `canAccessRoute(requiredRoles)`: Verifica acceso a rutas
- `getAvailableRoutes()`: Obtiene rutas disponibles para el usuario

### Páginas por Rol

#### Participantes (PARTICIPANTE)
- **Dashboard:** `/participante/dashboard`
- **Concursos:** `/participante/concursos`
- **Envíos:** `/participante/envios`
- **Comunidad:** `/participante/comunidad`

#### Jurados (JURADO)
- **Dashboard:** `/jurado/dashboard`
- **Asignaciones:** `/jurado/asignaciones`
- **Evaluaciones:** `/jurado/evaluaciones`
- **Especialización:** `/jurado/especializacion`

#### Administradores (ADMIN)
- **Dashboard:** `/admin/dashboard`
- **Concursos:** `/admin/concursos`
- **Usuarios:** `/admin/usuarios`
- **Jurados:** `/admin/jurados`
- **Criterios:** `/admin/criterios`
- **Métricas:** `/admin/metricas`
- **Suscripciones:** `/admin/suscripciones`

#### Administradores de Contenido (CONTENT_ADMIN)
- **Dashboard:** `/content-admin/dashboard`
- **CMS:** `/content-admin/cms`
- **Blog:** `/content-admin/blog`
- **Educativo:** `/content-admin/educativo`
- **Moderación:** `/content-admin/moderacion`
- **Analytics:** `/content-admin/analytics`

## Configuración de Rutas

### Estructura en App.tsx

```typescript
// Rutas públicas
<Route path="/" element={<HomePage />} />
<Route path="/login" element={<LoginPage />} />
<Route path="/register" element={<RegisterPage />} />
<Route path="/galeria" element={<GaleriaPublica />} />

// Redirección automática según rol
<Route path="/dashboard" element={<RoleBasedRedirect />} />

// Rutas protegidas por rol
<Route 
  path="/participante/dashboard" 
  element={
    <ProtectedRoute requiredRoles={['PARTICIPANTE']}>
      <ParticipanteDashboard />
    </ProtectedRoute>
  } 
/>
```

### Navegación Adaptativa

El componente `Navbar` se adapta automáticamente según el rol del usuario:

**Ubicación:** `src/components/layout/Navbar.tsx`

**Características:**
- Menú dinámico basado en rutas disponibles
- Información del usuario y rol
- Botón de logout
- Enlaces públicos (galería)

## Flujo de Autenticación y Redirección

### 1. Usuario No Autenticado
```
Acceso a ruta protegida → ProtectedRoute → Redirect a /login
```

### 2. Login Exitoso
```
Login → AuthContext actualizado → navigateToDashboard() → Redirect según rol
```

### 3. Acceso Directo a Dashboard
```
/dashboard → RoleBasedRedirect → Redirect a dashboard específico del rol
```

### 4. Verificación de Roles
```
Acceso a ruta → ProtectedRoute → Verificar rol → Permitir o redirect a /unauthorized
```

## Seguridad y Validaciones

### Protección de Rutas
- Todas las rutas sensibles están protegidas con `ProtectedRoute`
- Verificación de token JWT en cada acceso
- Validación de roles específicos por ruta

### Manejo de Estados
- Spinners de carga durante verificación de autenticación
- Preservación de rutas de origen para redirección posterior
- Manejo de errores y estados no válidos

### Roles y Permisos
```typescript
type UserRole = 'PARTICIPANTE' | 'JURADO' | 'ADMIN' | 'CONTENT_ADMIN';
```

## Ejemplos de Uso

### Proteger una Ruta con Rol Específico
```typescript
<Route 
  path="/admin/usuarios" 
  element={
    <ProtectedRoute requiredRoles={['ADMIN']}>
      <UserManagementPage />
    </ProtectedRoute>
  } 
/>
```

### Proteger una Ruta para Cualquier Usuario Autenticado
```typescript
<Route 
  path="/profile" 
  element={
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  } 
/>
```

### Usar Navegación Basada en Roles
```typescript
const { navigateToDashboard, canAccessRoute } = useRoleBasedNavigation();

// Navegar al dashboard apropiado
const handleLoginSuccess = () => {
  navigateToDashboard();
};

// Verificar acceso
const canAccessAdmin = canAccessRoute(['ADMIN']);
```

## Testing

### Tests Implementados
- **routing.test.ts:** Verificación de lógica de mapeo de roles a rutas
- **App.test.tsx:** Renderizado correcto de la aplicación
- **AuthContext.test.tsx:** Funcionalidad del contexto de autenticación

### Cobertura
- Mapeo correcto de roles a rutas
- Lógica de redirección
- Validación de roles
- Renderizado de componentes

## Próximas Implementaciones

Las rutas marcadas como "Próximamente" serán implementadas en futuras tareas:

### Fase 2 - Interfaces para Participantes
- Gestión de concursos y envíos
- Sistema de comunidad y seguimientos
- Perfil y configuración

### Fase 3 - Interfaces para Jurados
- Panel de evaluación especializado
- Gestión de especializaciones
- Sistema de calificaciones dinámicas

### Fase 4 - Panel de Administración
- CRUD completo de concursos
- Gestión de usuarios y roles
- Métricas y analytics

### Fase 5 - Gestión de Contenido
- CMS dinámico unificado
- Blog de la comunidad
- Sistema de moderación

## Configuración de Desarrollo

### Variables de Entorno
```env
VITE_API_URL=http://localhost:3001
```

### Scripts Disponibles
```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run test         # Ejecutar tests
npm run preview      # Preview del build
```

## Dependencias Clave

- **React Router 6+:** Routing principal
- **React Bootstrap:** Componentes UI
- **react-router-bootstrap:** Integración de navegación
- **TanStack Query:** Gestión de estado del servidor
- **Zustand:** Gestión de estado local (futuro)

## Notas Técnicas

### Compatibilidad
- React 19+
- TypeScript 5+
- Vite 5+
- Bootstrap 5.3+

### Rendimiento
- Lazy loading de componentes (futuro)
- Code splitting por rutas (futuro)
- Optimización de bundle size

### Accesibilidad
- Navegación por teclado
- ARIA labels apropiados
- Contraste de colores adecuado
- Responsive design mobile-first