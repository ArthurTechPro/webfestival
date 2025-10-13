# Configuración Inicial del Proyecto React - WebFestival App

## Descripción General

Este documento describe la configuración inicial completa del proyecto **webfestival-app**, una aplicación React 19+ construida con Vite 5+ y TypeScript 5+ que forma parte del ecosistema WebFestival para concursos multimedia.

## Arquitectura y Tecnologías

### Stack Tecnológico Principal
- **React 19+**: Framework de interfaz de usuario
- **Vite 5+**: Build tool y servidor de desarrollo
- **TypeScript 5+**: Tipado estático para JavaScript
- **React Router 6+**: Enrutamiento del lado del cliente
- **TanStack Query 5+**: Gestión de estado del servidor y cache
- **Zustand 4+**: Gestión de estado global del cliente
- **Bootstrap 5.3+**: Framework CSS para estilos
- **Axios 1.6+**: Cliente HTTP para comunicación con API

### Herramientas de Desarrollo
- **Vitest 1+**: Framework de testing
- **React Testing Library 14+**: Utilidades para testing de componentes React
- **ESLint**: Linter para calidad de código
- **Prettier**: Formateador de código
- **jsdom**: Entorno DOM para testing

## Estructura del Proyecto

```
webfestival-app/
├── src/
│   ├── assets/          # Recursos estáticos (imágenes, iconos)
│   ├── components/      # Componentes reutilizables de React
│   ├── hooks/           # Custom hooks de React
│   ├── pages/           # Componentes de páginas/rutas
│   ├── services/        # Servicios para comunicación con APIs
│   ├── types/           # Definiciones de tipos TypeScript
│   ├── App.tsx          # Componente principal de la aplicación
│   ├── main.tsx         # Punto de entrada de la aplicación
│   └── index.css        # Estilos globales
├── tests/               # Archivos de testing
│   ├── setup.ts         # Configuración global de tests
│   └── *.test.tsx       # Archivos de test
├── public/              # Archivos públicos estáticos
├── docs/                # Documentación del proyecto
└── dist/                # Build de producción (generado)
```

## Configuración de Variables de Entorno

### Archivo .env
```bash
# Configuración de la aplicación WebFestival
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=WebFestival App
VITE_APP_VERSION=1.0.0
```

### Variables Disponibles
- `VITE_API_URL`: URL base del API backend (webfestival-api)
- `VITE_APP_NAME`: Nombre de la aplicación
- `VITE_APP_VERSION`: Versión actual de la aplicación

## Configuración de Desarrollo

### Scripts NPM Disponibles
```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo en puerto 3000

# Build y producción
npm run build           # Construye la aplicación para producción
npm run preview         # Preview del build de producción

# Testing
npm run test            # Ejecuta tests una vez
npm run test:watch      # Ejecuta tests en modo watch
npm run test:ui         # Interfaz visual para tests
npm run test:coverage   # Ejecuta tests con reporte de cobertura

# Linting y formateo
npm run lint            # Ejecuta ESLint
npm run lint:fix        # Ejecuta ESLint con auto-fix
npm run format          # Formatea código con Prettier
npm run format:check    # Verifica formato con Prettier
```

### Configuración de ESLint
- Configuración moderna con flat config
- Soporte para TypeScript y React
- Plugins para React Hooks y React Refresh
- Reglas recomendadas para calidad de código

### Configuración de Prettier
- Formato consistente de código
- Configuración optimizada para TypeScript y React
- Integración con ESLint

## Servicios y Utilidades Configuradas

### Servicio de API (apiService)
- Cliente HTTP configurado con Axios
- Interceptores para autenticación automática
- Manejo centralizado de errores
- Timeout configurado (10 segundos)
- Soporte para tokens JWT

### Hook de Autenticación (useAuth)
- Gestión de estado de autenticación
- Funciones para login/logout
- Verificación de roles de usuario
- Persistencia de tokens en localStorage

### Tipos TypeScript
- Interfaces para entidades principales (User, Concurso, Medio, etc.)
- Tipos para respuestas de API
- Soporte para paginación
- Tipado estricto habilitado

## Configuración de Testing

### Setup de Vitest
- Entorno jsdom para testing de componentes
- Globals habilitados (describe, it, expect)
- Configuración de setup automático
- Mocks para APIs del navegador

### Mocks Configurados
- `matchMedia`: Para componentes responsive
- `IntersectionObserver`: Para componentes con lazy loading
- Configuración automática de @testing-library/jest-dom

## Integración con TanStack Query

### Configuración del QueryClient
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

### Características
- Cache inteligente de datos del servidor
- Reintento automático en caso de error
- Sincronización automática en segundo plano
- Optimistic updates preparado

## Integración con Bootstrap

### Configuración
- Bootstrap 5.3+ importado globalmente
- React Bootstrap 2+ para componentes React nativos
- Estilos CSS de Bootstrap incluidos
- Componentes responsive listos para usar

## Próximos Pasos

Esta configuración inicial proporciona la base sólida para implementar:

1. **Sistema de autenticación completo** (Tarea 11.1)
2. **Routing protegido por roles** (Tarea 11.2)
3. **Interfaces para participantes** (Tarea 12.x)
4. **Interfaces para jurados** (Tarea 13.x)
5. **Panel de administración** (Tarea 14.x)

## Verificación de la Configuración

### Tests Pasando
```bash
✓ tests/App.test.tsx (2)
  ✓ App Component (2)
    ✓ renderiza correctamente la página principal
    ✓ muestra la URL del API configurada
```

### Linting y Formato
- ✅ ESLint: Sin errores
- ✅ Prettier: Formato correcto
- ✅ TypeScript: Compilación exitosa
- ✅ Build: Generación exitosa

### Servidor de Desarrollo
- Puerto: 3000
- Hot reload habilitado
- Proxy a API configurado para desarrollo

## Notas Técnicas

### Compatibilidad
- Node.js 18+ requerido
- Navegadores modernos (ES2022+)
- Soporte para módulos ES

### Rendimiento
- Code splitting automático con Vite
- Tree shaking habilitado
- Optimización de assets automática
- Lazy loading preparado para componentes

### Seguridad
- Variables de entorno con prefijo VITE_
- Validación de tipos en tiempo de compilación
- Configuración estricta de TypeScript
- Sanitización automática de JSX