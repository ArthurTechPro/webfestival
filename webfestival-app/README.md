# WebFestival App - Frontend

Aplicación frontend del ecosistema WebFestival, una plataforma de concursos multimedia para artistas creativos.

## 🚀 Tecnologías

- **React 19+** con **TypeScript 5+**
- **Vite 5+** para build y desarrollo
- **React Router 6+** para enrutamiento
- **TanStack Query 5+** para gestión de estado del servidor
- **Zustand 4+** para estado global del cliente
- **Bootstrap 5.3+** para estilos y componentes UI
- **Axios 1.6+** para comunicación HTTP
- **Vitest 1+** y **React Testing Library** para testing

## 📁 Estructura del Proyecto

```
webfestival-app/
├── src/
│   ├── assets/          # Recursos estáticos
│   ├── components/      # Componentes reutilizables
│   ├── hooks/           # Custom hooks
│   ├── pages/           # Componentes de páginas
│   ├── services/        # Servicios para APIs
│   ├── types/           # Tipos TypeScript
│   ├── App.tsx          # Componente principal
│   └── main.tsx         # Punto de entrada
├── tests/               # Tests de la aplicación
├── docs/                # Documentación técnica
├── public/              # Archivos públicos
└── dist/                # Build de producción
```

## 🛠️ Configuración y Desarrollo

### Requisitos Previos
- Node.js 18+
- npm o yarn

### Instalación
```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
```

### Scripts Disponibles

#### Desarrollo
```bash
npm run dev              # Servidor de desarrollo (puerto 3000)
npm run build           # Build de producción
npm run preview         # Preview del build
```

#### Testing
```bash
npm run test            # Ejecutar tests
npm run test:watch      # Tests en modo watch
npm run test:ui         # Interfaz visual para tests
npm run test:coverage   # Tests con cobertura
```

#### Calidad de Código
```bash
npm run lint            # Verificar linting
npm run lint:fix        # Auto-fix de linting
npm run format          # Formatear código
npm run format:check    # Verificar formato
```

## 🔧 Configuración

### Variables de Entorno
```bash
VITE_API_URL=http://localhost:3001    # URL del API backend
VITE_APP_NAME=WebFestival App         # Nombre de la aplicación
VITE_APP_VERSION=1.0.0               # Versión de la aplicación
```

### Configuración de Desarrollo
- **Puerto de desarrollo**: 3000
- **Hot reload**: Habilitado
- **TypeScript**: Modo estricto
- **ESLint**: Configuración moderna con flat config
- **Prettier**: Formato consistente de código

## 📚 Documentación

La documentación técnica completa se encuentra en la carpeta [`docs/`](./docs/):

- **[Configuración Inicial](./docs/10-configuracion-inicial-react-README.md)** - Setup completo del proyecto
- **[Índice de Documentación](./docs/README.md)** - Guía completa de documentación

### Documentación por Funcionalidad
- Sistema de autenticación y routing
- Interfaces para participantes
- Interfaces para jurados
- Panel de administración
- Gestión de medios multimedia
- Sistema de calificación

## 🧪 Testing

El proyecto utiliza **Vitest** y **React Testing Library** para testing:

```bash
# Ejecutar todos los tests
npm run test

# Tests en modo watch para desarrollo
npm run test:watch

# Interfaz visual para tests
npm run test:ui
```

### Configuración de Tests
- Entorno: jsdom
- Setup automático con mocks para APIs del navegador
- Cobertura de código disponible
- Tests unitarios y de integración

## 🏗️ Arquitectura

### Servicios Base
- **apiService**: Cliente HTTP con interceptores y manejo de errores
- **useAuth**: Hook para gestión de autenticación
- **Tipos TypeScript**: Interfaces para todas las entidades

### Gestión de Estado
- **TanStack Query**: Cache y sincronización de datos del servidor
- **Zustand**: Estado global del cliente
- **React Context**: Estado local de componentes

### Routing
- **React Router 6+**: Enrutamiento del lado del cliente
- **Rutas protegidas**: Basadas en roles de usuario
- **Lazy loading**: Carga diferida de componentes

## 🔗 Integración con Backend

Esta aplicación se conecta con el API backend **webfestival-api**:
- URL base configurable via `VITE_API_URL`
- Autenticación JWT automática
- Manejo de errores centralizado
- Interceptores para tokens de autenticación

## 🚀 Despliegue

### Build de Producción
```bash
npm run build
```

El build genera archivos optimizados en la carpeta `dist/`:
- Code splitting automático
- Tree shaking habilitado
- Assets optimizados
- Sourcemaps para debugging

### Verificación del Build
```bash
npm run preview    # Servidor local del build de producción
```

## 🤝 Contribución

### Estándares de Código
- **TypeScript**: Tipado estricto obligatorio
- **ESLint**: Sin errores permitidos
- **Prettier**: Formato consistente
- **Tests**: Cobertura mínima requerida

### Flujo de Desarrollo
1. Crear rama feature desde main
2. Implementar funcionalidad con tests
3. Verificar linting y formato
4. Ejecutar suite completa de tests
5. Crear pull request con documentación

### Documentación
- Documentar nuevos servicios y componentes importantes
- Actualizar documentación existente cuando sea necesario
- Incluir ejemplos prácticos en la documentación
- Seguir convenciones de nomenclatura establecidas

## 📄 Licencia

Este proyecto es parte del ecosistema WebFestival y está sujeto a las políticas de licencia del proyecto principal.

---

Para más información técnica detallada, consulta la [documentación completa](./docs/) del proyecto.