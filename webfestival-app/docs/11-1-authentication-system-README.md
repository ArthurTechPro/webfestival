# Sistema de Autenticación React - WebFestival App

## Descripción General

Sistema completo de autenticación implementado para la aplicación React de WebFestival, incluyendo contexto de autenticación con JWT, hooks especializados, componentes de formularios y protección de rutas.

## Arquitectura del Sistema

### Componentes Principales

1. **AuthContext**: Contexto React para manejo global del estado de autenticación
2. **AuthService**: Servicio para comunicación con la API de autenticación
3. **Hooks Especializados**: Hooks personalizados para formularios y redirecciones
4. **Componentes de Formularios**: Componentes React para login, registro y recuperación
5. **Protección de Rutas**: Componentes para proteger rutas según autenticación y roles

## Estructura de Archivos

```
src/
├── contexts/
│   └── AuthContext.tsx          # Contexto principal de autenticación
├── services/
│   └── auth.service.ts          # Servicio de comunicación con API
├── hooks/
│   ├── useAuthForm.ts           # Hook para manejo de formularios
│   └── useAuthRedirect.ts       # Hook para redirecciones
├── components/auth/
│   ├── LoginForm.tsx            # Formulario de inicio de sesión
│   ├── RegisterForm.tsx         # Formulario de registro
│   ├── ForgotPasswordForm.tsx   # Formulario de recuperación
│   ├── ResetPasswordForm.tsx    # Formulario de restablecimiento
│   ├── ProtectedRoute.tsx       # Componente de protección de rutas
│   ├── PublicRoute.tsx          # Componente para rutas públicas
│   └── index.ts                 # Exportaciones
├── pages/
│   ├── LoginPage.tsx            # Página de login
│   ├── RegisterPage.tsx         # Página de registro
│   ├── ForgotPasswordPage.tsx   # Página de recuperación
│   ├── ResetPasswordPage.tsx    # Página de restablecimiento
│   ├── DashboardPage.tsx        # Dashboard (temporal)
│   └── UnauthorizedPage.tsx     # Página de acceso denegado
└── types/
    └── auth.ts                  # Tipos TypeScript para autenticación
```

## Funcionalidades Implementadas

### 1. Contexto de Autenticación (AuthContext)

**Características:**
- Estado global de autenticación
- Verificación automática de tokens al cargar la aplicación
- Manejo de tokens JWT y refresh tokens
- Funciones para login, registro y logout
- Verificación de roles de usuario

**Uso:**
```typescript
import { useAuth } from '../contexts/AuthContext';

const { user, isAuthenticated, login, logout, hasRole } = useAuth();
```

### 2. Servicio de Autenticación (AuthService)

**Métodos principales:**
- `login(credentials)`: Iniciar sesión
- `register(data)`: Registrar nuevo usuario
- `logout()`: Cerrar sesión
- `forgotPassword(email)`: Solicitar recuperación
- `resetPassword(data)`: Restablecer contraseña
- `verifyToken()`: Verificar token actual
- `hasRole(role)`: Verificar rol específico

**Almacenamiento:**
- Tokens en localStorage
- Manejo automático de expiración
- Limpieza automática en logout

### 3. Hooks Especializados

#### useAuthForm
- Validación de formularios
- Manejo de errores del servidor
- Estados de carga (isSubmitting)
- Validaciones específicas por tipo de formulario

#### useAuthRedirect
- Redirecciones automáticas según estado de autenticación
- Protección de rutas que requieren autenticación
- Redirecciones basadas en roles de usuario

### 4. Componentes de Formularios

#### LoginForm
- Validación de email y contraseña
- Mostrar/ocultar contraseña
- Manejo de errores
- Redirección automática tras login exitoso

#### RegisterForm
- Validación completa de datos
- Confirmación de contraseña
- Aceptación de términos y condiciones
- Validación en tiempo real

#### ForgotPasswordForm
- Solicitud de recuperación por email
- Confirmación visual de envío
- Manejo de errores de red

#### ResetPasswordForm
- Validación de token desde URL
- Establecimiento de nueva contraseña
- Confirmación de contraseña
- Redirección automática tras éxito

### 5. Protección de Rutas

#### ProtectedRoute
- Verificación de autenticación
- Verificación de roles específicos
- Redirección automática a login
- Spinner de carga durante verificación

#### PublicRoute
- Rutas para usuarios no autenticados
- Redirección automática si ya está autenticado
- Ideal para páginas de login/registro

## Configuración y Uso

### 1. Configurar el AuthProvider

```typescript
// App.tsx
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Rutas de la aplicación */}
      </Router>
    </AuthProvider>
  );
}
```

### 2. Proteger Rutas

```typescript
// Ruta que requiere autenticación
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  } 
/>

// Ruta que requiere rol específico
<Route 
  path="/admin" 
  element={
    <ProtectedRoute requiredRoles={['ADMIN']}>
      <AdminPage />
    </ProtectedRoute>
  } 
/>

// Ruta pública (redirige si ya está autenticado)
<Route 
  path="/login" 
  element={
    <PublicRoute>
      <LoginPage />
    </PublicRoute>
  } 
/>
```

### 3. Usar el Hook de Autenticación

```typescript
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    login, 
    logout, 
    hasRole 
  } = useAuth();

  if (isLoading) return <Spinner />;

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Bienvenido, {user?.nombre}</p>
          {hasRole('ADMIN') && <AdminPanel />}
          <button onClick={logout}>Cerrar Sesión</button>
        </div>
      ) : (
        <LoginForm />
      )}
    </div>
  );
};
```

## Tipos TypeScript

### Interfaces Principales

```typescript
interface User {
  id: string;
  email: string;
  nombre: string;
  role: 'PARTICIPANTE' | 'JURADO' | 'ADMIN' | 'CONTENT_ADMIN';
  picture_url?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  updateUser: (userData: Partial<User>) => void;
}
```

## Seguridad

### Medidas Implementadas

1. **Validación de Entrada**: Validación completa en formularios
2. **Tokens JWT**: Almacenamiento seguro en localStorage
3. **Verificación Automática**: Verificación de tokens al cargar la app
4. **Limpieza Automática**: Limpieza de datos en logout o tokens inválidos
5. **Protección de Rutas**: Verificación de autenticación y roles
6. **Manejo de Errores**: Manejo seguro de errores de red y servidor

### Consideraciones de Seguridad

- Los tokens se almacenan en localStorage (considerar httpOnly cookies para producción)
- Verificación automática de tokens en cada carga de la aplicación
- Limpieza automática de datos sensibles en caso de errores
- Redirecciones automáticas para prevenir acceso no autorizado

## Testing

### Tests Implementados

1. **AuthService Tests**: Tests unitarios para el servicio de autenticación
2. **AuthContext Tests**: Tests de integración para el contexto
3. **Component Tests**: Tests básicos para componentes principales

### Ejecutar Tests

```bash
npm test                    # Ejecutar todos los tests
npm run test:watch         # Ejecutar tests en modo watch
npm run test:coverage      # Ejecutar tests con cobertura
```

## Integración con API

### Endpoints Esperados

```
POST /auth/login           # Iniciar sesión
POST /auth/register        # Registrar usuario
POST /auth/logout          # Cerrar sesión
GET  /auth/me              # Obtener usuario actual
POST /auth/refresh         # Refrescar token
POST /auth/forgot-password # Solicitar recuperación
POST /auth/reset-password  # Restablecer contraseña
```

### Formato de Respuestas

```typescript
// Respuesta de login/register
{
  success: true,
  data: {
    user: User,
    token: string,
    refreshToken?: string
  }
}

// Respuesta de error
{
  success: false,
  message: string,
  error?: string
}
```

## Variables de Entorno

```env
VITE_API_URL=http://localhost:3001  # URL base de la API
```

## Próximos Pasos

1. **Implementar refresh automático de tokens**
2. **Agregar autenticación con redes sociales**
3. **Implementar verificación de email**
4. **Agregar autenticación de dos factores**
5. **Migrar a httpOnly cookies para mayor seguridad**

## Dependencias

- React 19+
- React Router 6+
- React Bootstrap 2+
- Axios 1.6+
- TypeScript 5+

## Conclusión

El sistema de autenticación está completamente implementado y funcional, proporcionando una base sólida para la gestión de usuarios en WebFestival. Incluye todas las funcionalidades esenciales de autenticación con una arquitectura escalable y mantenible.