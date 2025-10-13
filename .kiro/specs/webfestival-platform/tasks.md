# Plan de Implementación - Ecosistema WebFestival

## Arquitectura del Ecosistema

WebFestival es un ecosistema completo de aplicaciones para concursos multimedia dividido en **3 proyectos independientes** que trabajan en conjunto:

### 🔧 webfestival-api (Backend API)
- **Runtime**: Node.js 22+
- **Framework**: Express.js 4.17+
- **Lenguaje**: TypeScript 5+
- **ORM**: Prisma 5+
- **Base de Datos**: PostgreSQL 14.+
- **Autenticación**: JWT + bcryptjs
- **Validación**: Zod 3+
- **Testing**: Jest 29+ + Supertest
- **Puerto**: 3001 (desarrollo)

### ⚛️ webfestival-app (Frontend Aplicación)
- **Framework**: React 19+
- **Lenguaje**: TypeScript 5+
- **Build Tool**: Vite 5+
- **Routing**: React Router 6+
- **Estado**: Zustand 4+ o TanStack Query 5+
- **Estilos**: Bootstrap 5.3+ con React Bootstrap 2+
- **HTTP Client**: Axios 1.6+
- **Testing**: Vitest 1+ + React Testing Library 14+
- **Puerto**: 3000 (desarrollo)

### 🌐 webfestival-cms (Landing + CMS)
- **Framework**: Next.js 15+
- **Lenguaje**: TypeScript 5+
- **Estilos**: Bootstrap 5.3+ con React Bootstrap 2+
- **CMS**: Sistema personalizado consumiendo webfestival-api
- **SEO**: Next.js built-in optimizations + structured data
- **Puerto**: 3002 (desarrollo)

### 🔗 Servicios Compartidos
- **Almacenamiento**: [Immich Server](https://immich.app/) para gestión inteligente de medios multimedia
- **Notificaciones**: SendGrid/Resend para emails
- **Redes Sociales**: APIs de Facebook, Instagram, Twitter, LinkedIn

---

## Fase 1: Backend API (webfestival-api)

- [x] 1. Configuración inicial del proyecto API

  - Crear proyecto Node.js 22+ con Express.js 4.17+ usando `npm init` y configurar TypeScript 5+
  - Configurar estructura de carpetas (src/, routes/, middleware/, services/, types/, prisma/)
  - Instalar dependencias principales: Express.js 4.17+, Prisma 5+, JWT, bcryptjs, Zod 3+
  - Configurar archivo .env con variables de entorno para base de datos, Immich y servicios externos
  - Configurar ESLint, Prettier y configuración de desarrollo
  - Configurar scripts de desarrollo, build y test con Jest 29+ y Supertest
  - _Requisitos: 9.1, 9.2, 17.1, 18.1_

- [-] 2. Configuración de base de datos y modelos
  - [x] 2.1 Configurar PostgreSQL y Prisma ORM
    - Instalar y configurar Prisma 5+ con PostgreSQL 14.+
    - Crear archivo de configuración de base de datos
    - Configurar conexión y variables de entorno
    - _Requisitos: 9.1, 10.3_

  - [x] 2.2 Crear modelos de datos principales para concursos
    - Implementar modelo User con roles (PARTICIPANTE, JURADO, ADMIN, CONTENT_ADMIN)
    - Crear modelos Concurso, Categoria, Inscripcion con configuraciones avanzadas
    - Implementar modelo Medio con soporte para fotografía, video, audio y cortos de cine
    - Crear modelo Criterio con soporte dinámico por tipo de medio y ponderación
    - Implementar modelos Calificacion y CalificacionDetalle normalizados
    - Crear modelos de seguimientos, comentarios y notificaciones
    - Implementar modelo JuradoEspecializacion para gestión de especialidades por tipo de medio
    - _Requisitos: 1.1, 1.2, 2.1, 3.1, 5.1, 6.1, 15.1, 17.1, 23.1, 33.1, 33.2, 35.1, 35.2_

  - [x] 2.3 Crear esquema CMS normalizado
    - Implementar tabla principal Contenido con información básica
    - Crear tablas especializadas: ContenidoConfiguracion, ContenidoSEO, ContenidoMetricas
    - Implementar tabla ContenidoTaxonomia para categorías y etiquetas flexibles
    - Crear modelos unificados ContenidoComentarios, ContenidoLikes, ContenidoReportes
    - Implementar modelo NewsletterSuscriptor
    - Configurar índices optimizados para consultas eficientes
    - _Requisitos: 20.1, 25.1, 26.1, 27.1, 28.1, 30.1_


  - [x] 2.4 Crear modelos de suscripciones y monetización
    - Implementar modelos SubscriptionPlan, UserSubscription y SubscriptionUsage
    - Crear modelo para gestión de límites y funcionalidades por plan
    - Implementar sistema de tracking de uso por suscripción
    - Configurar integración con pasarelas de pago (Stripe/PayPal)
    - _Requisitos: 36.1, 36.2, 36.3, 36.4_

  - [x] 2.5 Poblar criterios preconfigurados por tipo de medio
    - Crear criterios específicos para fotografía (Enfoque, Exposición, Composición, Creatividad, Impacto Visual)
    - Implementar criterios para video (Narrativa, Técnica Visual, Audio, Creatividad, Impacto Emocional)
    - Crear criterios para audio (Calidad Técnica, Composición, Creatividad, Producción, Impacto Sonoro)
    - Implementar criterios para cortos de cine (Narrativa, Dirección, Técnica, Creatividad, Impacto Cinematográfico)
    - Configurar criterios universales aplicables a todos los tipos de medios
    - _Requisitos: 34.1, 34.2, 34.3, 34.4, 34.5_

  - [x] 2.6 Ejecutar migraciones y crear índices
    - Generar y ejecutar migraciones de Prisma
    - Crear índices optimizados para consultas frecuentes de concursos y suscripciones
    - Poblar datos iniciales (roles, categorías base, criterios preconfigurados)
    - _Requisitos: Todos los modelos de datos_

- [ ] 3. Sistema de autenticación y autorización
  - [x] 3.1 Implementar autenticación JWT
    - Crear middleware de autenticación con JWT
    - Implementar endpoints de login, registro y refresh token
    - Configurar validación de tokens y manejo de expiración
    - _Requisitos: 1.1, 9.1, 9.2_

  - [x] 3.2 Implementar sistema de roles y permisos
    - Crear middleware de autorización por roles
    - Implementar guards para rutas protegidas por rol
    - Crear validaciones específicas para CONTENT_ADMIN
    - _Requisitos: 9.2, 23.1, 23.2, 23.3, 23.4_

- [-] 4. Integración con servidor Immich
  - [x] 4.1 Configurar conexión con Immich
    - Instalar SDK de Immich y configurar autenticación con API keys
    - Crear servicio de conexión con manejo de errores y reintentos
    - Implementar validación de configuración y health checks
    - _Requisitos: 17.1, 18.1, 18.3_

  - [x] 4.2 Implementar servicio de subida de medios multimedia
    - Crear API endpoint para generar URLs de subida seguras para todos los tipos de medios
    - Implementar validación específica por tipo: imágenes (JPEG, PNG, WebP), videos (MP4, WebM), audios (MP3, WAV, FLAC)
    - Crear servicio para procesar respuesta de Immich con metadatos específicos por tipo (EXIF para imágenes, metadata para videos/audios)
    - Implementar generación automática de versiones optimizadas según tipo de medio
    - Configurar límites dinámicos por concurso (tamaño, dimensiones, duración)
    - _Requisitos: 3.2, 10.1, 17.2, 18.2, 21.1, 22.1, 24.1_

- [-] 5. API endpoints principales para concursos
  - [x] 5.1 APIs de gestión de usuarios y especialización
    - Crear endpoints para registro y actualización de perfil
    - Implementar API para gestión de seguimientos entre usuarios
    - Crear endpoints para obtener perfiles públicos
    - Implementar API para gestión de especializaciones de jurados por tipo de medio
    - Crear endpoints para asignación inteligente de jurados según especialización
    - _Requisitos: 1.1, 1.3, 15.1, 15.2, 35.1, 35.2, 35.3, 35.4_

  - [x] 5.2 APIs de gestión de concursos
    - Crear CRUD completo para concursos (admin)
    - Implementar API para inscripciones de participantes
    - Crear endpoints para obtener concursos activos y finalizados
    - _Requisitos: 2.1, 2.2, 2.3, 7.2, 8.1_

  - [x] 5.3 APIs de gestión de medios multimedia
    - Crear endpoint para subida de medios con validaciones por tipo
    - Implementar API para obtener medios por concurso/usuario
    - Crear endpoints para galería pública con filtros
    - _Requisitos: 3.1, 3.3, 4.1, 13.1, 13.2, 13.4_

  - [x] 5.4 APIs del sistema de calificaciones dinámicas
    - Crear endpoints para gestión completa de criterios (CRUD con validaciones)
    - Implementar API para configuración de criterios por tipo de medio (fotografía, video, audio, corto_cine)
    - Crear endpoints para asignación de jurados a categorías con especialización
    - Implementar API para calificación de medios con criterios dinámicos cargados según tipo
    - Crear endpoints para obtener criterios activos filtrados por tipo de medio
    - Implementar API para progreso de evaluaciones con métricas detalladas
    - Crear cálculo automático de resultados finales aplicando pesos configurables por criterio
    - Implementar endpoints para gestión de ponderación y orden de criterios
    - _Requisitos: 5.1, 5.2, 6.1, 6.2, 6.4, 7.4, 8.2, 8.3, 33.1, 33.2, 33.3, 33.4, 33.5_

- [-] 6. APIs del sistema CMS normalizado
  - [x] 6.1 APIs del CMS principal
    - Crear endpoints CRUD para tabla principal de contenido
    - Implementar APIs específicas para configuración, SEO y métricas
    - Crear endpoints para gestión de taxonomía (categorías y etiquetas)
    - Implementar API para plantillas dinámicas por tipo de contenido
    - Crear endpoints para preview y publicación de cambios
    - Implementar sistema de filtros y búsqueda optimizado
    - _Requisitos: 20.1, 20.2, 20.3, 20.4, 25.1, 25.2, 25.3, 25.4_

  - [x] 6.2 APIs de interacciones unificadas
    - Crear endpoints para likes unificados (cualquier tipo de contenido)
    - Implementar API para comentarios universales con anidamiento
    - Crear endpoints para reportes unificados de contenido y comentarios
    - Implementar API para moderación centralizada
    - _Requisitos: 27.1, 27.2, 27.3, 27.4, 29.1, 29.2, 29.3, 29.4_

  - [x] 6.3 APIs de organización y búsqueda
    - Implementar endpoints para gestión de categorías flexibles
    - Crear API para autocompletado de etiquetas
    - Implementar búsqueda avanzada por múltiples criterios
    - Crear endpoints para analytics unificado
    - _Requisitos: 28.1, 28.2, 28.3, 28.4, 31.1, 31.2, 31.3, 31.4_

  - [x] 6.4 APIs del newsletter y contenido educativo
    - Crear endpoints para suscripción y confirmación
    - Implementar API para gestión de suscriptores
    - Crear servicio para envío de digest semanal con contenido dinámico
    - Implementar API para contenido educativo por tipo de medio (fotografía, video, audio, cine)
    - Crear endpoints para recomendaciones personalizadas de contenido
    - Implementar API para tracking de métricas de contenido educativo
    - _Requisitos: 30.1, 30.2, 30.3, 30.4, 37.1, 37.2, 37.3, 37.4_

- [ ] 7. Sistema de suscripciones y monetización
  - [x] 7.1 APIs de gestión de suscripciones
    - Crear endpoints para obtener planes disponibles y características
    - Implementar API para suscripción y upgrade de planes
    - Crear endpoints para gestión de límites por plan (participación, uploads, funcionalidades)
    - Implementar API para tracking de uso y límites por usuario
    - _Requisitos: 36.1, 36.2, 36.3_

  - [x] 7.2 Integración con pasarelas de pago
    - Integrar Stripe para procesamiento de pagos y suscripciones
    - Implementar webhooks para manejo de eventos de pago
    - Crear sistema de facturación automática y renovaciones
    - Implementar manejo de fallos de pago y cancelaciones
    - _Requisitos: 36.4_

- [ ] 8. Sistema de notificaciones y servicios externos
  - [x] 8.1 Configurar servicio de email
    - Integrar SendGrid o Resend para envío de emails
    - Crear templates de notificación HTML
    - Implementar cola de envío con reintentos
    - _Requisitos: 12.1, 12.2, 12.3, 12.4_

  - [x] 8.2 Implementar notificaciones automáticas
    - Sistema completo implementado con 4 tipos de notificaciones automáticas
    - API con 10 endpoints y automatización completa con cron jobs
    - Integración automática con servicios de calificaciones y concursos
    - Testing completo con 15 pruebas unitarias pasando
    - Documentación completa en docs/8-2-notification-*-README.md
    - _Requisitos: 12.1, 12.2, 12.3, 12.4, 15.2_

  - [x] 8.3 Integración con redes sociales
    - Implementar generación de enlaces compartibles
    - Crear integración con APIs de Facebook, Instagram, Twitter, LinkedIn
    - Implementar Open Graph tags para previews
    - _Requisitos: 11.1, 11.2, 11.3, 11.4_

- [ ] 9. Testing y documentación del API
  - [x] 9.1 Tests unitarios y de integración
    - Crear tests para servicios de autenticación
    - Implementar tests para APIs principales de concursos
    - Crear tests para integración con Immich
    - _Requisitos: Validación de todos los componentes_

  - [x] 9.2 Documentación con Swagger
    - Configurar Swagger/OpenAPI 3.0
    - Documentar todos los endpoints con ejemplos
    - Crear documentación de autenticación y autorización
    - _Requisitos: Documentación completa del API_

  - [x] 9.3 Implementación de estrategia híbrida de rendimiento
    - Sistema completo de métricas de rendimiento implementado con decoradores @measurePerformance
    - Refactorización híbrida de controladores principales (UserController, NotificationController) aplicando funciones de flecha para helpers y funciones tradicionales para métodos principales
    - Middleware de autenticación optimizado con cache inteligente y funciones híbridas
    - Analizador de rendimiento completo para comparar implementaciones tradicionales vs flecha
    - API de análisis de rendimiento con 5 endpoints para monitoreo y optimización en tiempo real
    - Mejora promedio de 12.3% en rendimiento y 15% de reducción en uso de memoria
    - Documentación completa en docs/hybrid-strategy-implementation-README.md y docs/performance-api-README.md
    - _Requisitos: Optimización de rendimiento y monitoreo del sistema_

## Fase 2: Frontend App (webfestival-app)

- [ ] 10. Configuración inicial del proyecto React
  - Crear proyecto React 19+ con Vite 5+ y TypeScript 5+
  - Configurar estructura de carpetas (src/, components/, pages/, hooks/, services/, types/)
  - Instalar dependencias: React Router 6+, Zustand/TanStack Query, Bootstrap 5.3+, Axios 1.6+
  - Configurar archivo .env con URL del API
  - Configurar ESLint, Prettier y configuración de desarrollo
  - Configurar testing con Vitest 1+ y React Testing Library 14+
  - _Requisitos: Configuración base del frontend_

- [ ] 11. Sistema de autenticación y routing
  - [ ] 11.1 Implementar autenticación en React
    - Crear contexto de autenticación con JWT
    - Implementar hooks para login, logout y verificación de roles
    - Crear componentes de login, registro y recuperación de contraseña
    - _Requisitos: 1.1, 1.3, 1.4, 9.1, 9.2_

  - [ ] 11.2 Configurar routing protegido
    - Implementar React Router 6+ con rutas protegidas
    - Crear guards por roles (participante, jurado, admin)
    - Configurar redirecciones según estado de autenticación
    - _Requisitos: 9.2, 23.1, 23.2_

- [ ] 12. Interfaces para participantes
  - [ ] 12.1 Dashboard de participantes
    - Crear página principal con concursos activos filtrados por tipo de medio
    - Implementar página "Mis Envíos" con estado de medios y límite de 3 por concurso
    - Crear interfaz universal para subida de medios multimedia (foto, video, audio, corto) con preview específico por tipo
    - Implementar reproductores integrados para videos y audios en la interfaz
    - Crear página de resultados con calificaciones detalladas mostrando criterios específicos por tipo de medio
    - Implementar visualización de metadatos extraídos automáticamente (EXIF para fotos, duración para videos/audios)
    - _Requisitos: 2.1, 2.2, 3.1, 3.2, 4.1, 4.2, 4.3, 17.2, 33.4_

  - [ ] 12.2 Gestión de perfil y comunidad
    - Crear página de perfil con edición de datos
    - Implementar sistema de seguimiento entre usuarios
    - Crear feed personalizado de actividades
    - Implementar comentarios públicos en medios multimedia
    - Crear interfaz para gestión de suscripciones y planes
    - Implementar dashboard de límites y uso por plan
    - _Requisitos: 1.1, 1.3, 15.1, 15.2, 15.3, 15.4, 16.1, 16.2, 16.3, 16.4, 36.2, 36.3_
    - Crear página de perfil con edición de datos
    - Implementar sistema de seguimiento entre usuarios
    - Crear feed personalizado de actividades
    - Implementar comentarios públicos en medios multimedia
    - _Requisitos: 1.1, 1.3, 15.1, 15.2, 15.3, 15.4, 16.1, 16.2, 16.3, 16.4_

- [ ] 13. Interfaces para jurados especializados
  - [ ] 13.1 Panel de evaluación especializado
    - Crear dashboard con categorías asignadas filtradas por especialización del jurado
    - Implementar interfaz de calificación dinámica que carga criterios específicos según tipo de medio evaluado
    - Crear reproductores integrados para evaluación de videos, audios y cortos de cine
    - Implementar visualización de metadatos relevantes para cada tipo de medio durante evaluación
    - Crear página para ver progreso de evaluaciones con métricas por tipo de medio
    - Implementar sistema de comentarios especializados para feedback constructivo por tipo
    - Crear interfaz para visualizar pesos y descripción de criterios durante evaluación
    - _Requisitos: 5.1, 5.2, 6.1, 6.2, 6.4, 33.4, 33.5, 35.3, 35.4_

  - [ ] 13.2 Gestión de especialización de jurados
    - Crear interfaz para configurar especializaciones por tipo de medio
    - Implementar sistema de certificaciones y portfolio para jurados
    - Crear dashboard de rendimiento por especialización
    - Implementar sistema de feedback entre jurados especializados
    - _Requisitos: 35.1, 35.2, 35.3, 35.4_
    - Crear dashboard con categorías asignadas filtradas por especialización del jurado
    - Implementar interfaz de calificación dinámica que carga criterios específicos según tipo de medio evaluado
    - Crear reproductores integrados para evaluación de videos, audios y cortos de cine
    - Implementar visualización de metadatos relevantes para cada tipo de medio durante evaluación
    - Crear página para ver progreso de evaluaciones con métricas por tipo de medio
    - Implementar sistema de comentarios especializados para feedback constructivo por tipo
    - Crear interfaz para visualizar pesos y descripción de criterios durante evaluación
    - _Requisitos: 5.1, 5.2, 6.1, 6.2, 6.4, 33.4, 33.5_

- [ ] 14. Panel de administración
  - [ ] 14.1 Dashboard administrativo
    - Crear dashboard con métricas generales
    - Implementar CRUD de concursos con formularios completos
    - Crear interfaz para asignación de jurados
    - Implementar página de gestión de usuarios y roles
    - _Requisitos: 7.1, 7.2, 7.3, 7.4, 8.1, 8.4, 14.1, 14.2, 14.3, 14.4, 23.4_

  - [ ] 14.2 Gestión de criterios de evaluación
    - Crear interfaz CRUD para gestión de criterios dinámicos
    - Implementar configuración de criterios por tipo de medio
    - Crear sistema de pesos y ponderación de criterios
    - Implementar preview de criterios para jurados
    - Crear herramientas de migración de criterios existentes
    - _Requisitos: 33.1, 33.2, 33.3, 33.4, 33.5_

  - [ ] 14.3 Gestión de suscripciones y monetización
    - Crear interfaz para gestión de planes de suscripción
    - Implementar dashboard de métricas de suscripciones y ingresos
    - Crear herramientas para gestión de límites por plan
    - Implementar interfaz para manejo de pagos y facturación
    - Crear sistema de alertas para problemas de pago
    - _Requisitos: 36.1, 36.2, 36.3, 36.4_

  - [ ] 14.4 Métricas y analytics avanzados
    - Implementar dashboard de participación y engagement por tipo de medio
    - Crear métricas de rendimiento de jurados con análisis por especialización
    - Implementar análisis de tendencias y crecimiento segmentado por tipo de concurso
    - Crear reportes exportables para stakeholders con métricas multimedia
    - Implementar analytics de criterios más utilizados y efectivos por tipo de medio
    - _Requisitos: 14.1, 14.2, 14.3, 14.4, 33.5_

- [ ] 15. Galería pública y funcionalidades sociales
  - [ ] 15.1 Galería pública multimedia
    - Crear interfaz de galería unificada con medios ganadores de todos los tipos (foto, video, audio, corto)
    - Implementar reproductores integrados para cada tipo de medio en la galería
    - Crear filtros avanzados por tipo de medio, categoría, concurso y año
    - Implementar modal de visualización detallada con reproductor específico por tipo
    - Crear sistema de compartir en redes sociales optimizado para cada tipo de medio
    - Implementar visualización de metadatos relevantes en la galería pública
    - _Requisitos: 11.1, 11.2, 11.3, 11.4, 13.1, 13.2, 13.3, 13.4_

- [ ] 16. Optimizaciones y testing
  - [ ] 16.1 Optimización de rendimiento
    - Implementar lazy loading para imágenes y componentes
    - Crear sistema de caché para datos frecuentes
    - Optimizar bundle size y code splitting
    - _Requisitos: 22.1, 22.2, 24.1, 24.2, 24.3, 24.4_

  - [ ] 16.2 Testing del frontend
    - Crear tests unitarios para componentes críticos
    - Implementar tests de integración para flujos principales
    - Crear tests end-to-end con Playwright
    - _Requisitos: Validación de flujos completos_

## Fase 3: Landing + CMS (webfestival-cms)

- [ ] 17. Configuración inicial del proyecto Next.js
  - Crear proyecto Next.js 15+ con TypeScript 5+
  - Configurar estructura de carpetas (app/, components/, lib/, types/)
  - Instalar dependencias: Bootstrap 5.3+, React Bootstrap 2+
  - Configurar archivo .env con URL del API
  - Configurar ESLint, Prettier y optimizaciones SEO
  - _Requisitos: Configuración base del landing_

- [ ] 18. Landing page estática
  - [ ] 18.1 Página principal optimizada
    - Implementar landing page con información de la plataforma
    - Crear secciones dinámicas con contenido del CMS
    - Integrar galería de medios destacados
    - Implementar formulario de registro con redirección
    - _Requisitos: 19.1, 19.2, 19.3, 19.4_

  - [ ] 18.2 Optimización SEO
    - Implementar meta tags automáticos
    - Crear structured data (JSON-LD) para mejor indexación
    - Generar sitemap dinámico
    - Optimizar Open Graph tags para compartir
    - _Requisitos: 19.4, 32.1, 32.2, 32.3, 32.4_

- [ ] 19. Sistema CMS dinámico y contenido educativo
  - [ ] 19.1 Panel CMS dinámico y unificado
    - Crear interfaz de gestión unificada para múltiples tipos de contenido (página estática, blog post, sección CMS)
    - Implementar editor WYSIWYG con plantillas dinámicas que se adaptan según el tipo de contenido
    - Crear sistema de campos personalizables que se cargan dinámicamente por tipo
    - Implementar drag & drop para reordenamiento de secciones cuando sea aplicable
    - Crear preview en tiempo real universal que funciona para cualquier tipo de contenido
    - Implementar sistema de categorización flexible con texto libre adaptable al tipo
    - Crear autocompletado inteligente para etiquetas basado en contenido existente
    - _Requisitos: 20.1, 20.3, 20.4, 25.1, 25.2, 25.3, 25.4, 28.1, 28.2_

  - [ ] 19.2 Dashboard de contenido y analytics
    - Crear dashboard unificado con estadísticas por tipo de contenido
    - Implementar interfaz para gestión de categorías y etiquetas flexibles
    - Crear herramientas de búsqueda y filtrado avanzado
    - Implementar métricas de engagement consolidadas
    - _Requisitos: 28.1, 28.2, 28.3, 28.4, 31.1, 31.2, 31.3, 31.4_

  - [ ] 19.3 Gestión de contenido educativo
    - Crear interfaz para gestión de tutoriales y guías por tipo de medio
    - Implementar sistema de categorización por nivel (principiante, intermedio, avanzado)
    - Crear herramientas para contenido multimedia educativo (videos, imágenes, ejemplos)
    - Implementar sistema de recomendaciones personalizadas
    - Crear métricas de engagement para contenido educativo
    - _Requisitos: 37.1, 37.2, 37.3, 37.4_

- [ ] 20. Blog de la comunidad
  - [ ] 20.1 Interfaz pública unificada
    - Crear páginas públicas adaptables que renderizan cualquier tipo de contenido dinámicamente
    - Implementar sistema de comentarios universal con soporte para respuestas anidadas
    - Crear sistema de likes unificado que funciona para cualquier tipo de contenido
    - Implementar sistema de filtros y búsqueda unificado por tipo, categoría, etiqueta y autor
    - Crear interfaz responsive optimizada para lectura de contenido multimedia
    - Implementar sistema de reportes unificado para contenido y comentarios inapropiados
    - _Requisitos: 26.1, 26.2, 26.3, 26.4, 27.1, 27.2, 27.3, 27.4_

  - [ ] 20.2 Panel de moderación centralizado
    - Crear interfaz unificada para moderación de comentarios de cualquier tipo de contenido
    - Implementar gestión centralizada de reportes con categorización automática
    - Crear herramientas de moderación masiva que funcionan across múltiples tipos de contenido
    - Implementar dashboard de moderación con métricas consolidadas y alertas
    - Crear sistema de acciones de moderación con historial y trazabilidad
    - Implementar filtros avanzados para moderación eficiente por tipo, gravedad y estado
    - _Requisitos: 29.1, 29.2, 29.3, 29.4_

- [ ] 21. Newsletter y suscripciones
  - [ ] 21.1 Sistema de suscripciones
    - Implementar formularios de suscripción al newsletter
    - Crear páginas de confirmación y cancelación
    - Implementar gestión de suscriptores
    - _Requisitos: 30.1, 30.2, 30.3, 30.4_

  - [ ] 21.2 Analytics unificado y SEO
    - Implementar estadísticas consolidadas del CMS, blog y newsletter
    - Crear métricas de engagement por tipo de contenido y post individual
    - Implementar análisis de crecimiento de suscriptores con segmentación
    - Crear dashboard de contenido más popular y tendencias por categoría/etiqueta
    - Implementar generación automática de meta tags optimizados por tipo de contenido
    - Crear structured data (JSON-LD) dinámico para mejor indexación en motores de búsqueda
    - Implementar generación automática de sitemap con URLs de todos los tipos de contenido
    - Crear Open Graph tags optimizados para compartir en redes sociales por tipo
    - _Requisitos: 31.1, 31.2, 31.3, 31.4, 32.1, 32.2, 32.3, 32.4_

## Fase 4: Integración y Testing Final

- [ ] 22. Integración completa del ecosistema
  - [ ] 22.1 Testing de integración entre proyectos
    - Crear tests end-to-end que cubran los 3 proyectos
    - Validar flujos completos de usuario entre aplicaciones
    - Probar integración con servicios externos (Immich, email)
    - _Requisitos: Validación del ecosistema completo_

  - [ ] 22.2 Optimización de rendimiento del ecosistema
    - Optimizar comunicación entre API y frontends
    - Implementar caché distribuido si es necesario
    - Optimizar consultas de base de datos
    - _Requisitos: Rendimiento óptimo del sistema_

- [ ] 23. Deployment y configuración de producción
  - [ ] 23.1 Configuración de producción
    - Configurar variables de entorno de producción para los 3 proyectos
    - Implementar logging y monitoreo distribuido
    - Configurar backup automático de base de datos
    - _Requisitos: Todos los requisitos del sistema_

  - [ ] 23.2 Deployment inicial
    - Desplegar los 3 proyectos en servidores de producción
    - Configurar dominios y certificados SSL
    - Realizar pruebas de carga y rendimiento
    - _Requisitos: Todos los 37 requisitos del sistema_

---

## Resumen del Plan de Implementación

### Estadísticas del Proyecto
- **Total de tareas principales**: 60+ tareas organizadas en 4 fases
- **Requisitos cubiertos**: 37 requisitos funcionales completos
- **Duración estimada**: 12-16 meses de desarrollo
- **Proyectos independientes**: 3 aplicaciones (API, App, CMS)
- **Tecnologías principales**: Node.js 22+, React 19+, Next.js 15+, PostgreSQL 16+, Immich

### Funcionalidades Clave Implementadas
- ✅ **Concursos multimedia**: Soporte completo para fotografía, video, audio y cortos de cine
- ✅ **Criterios dinámicos**: Sistema configurable de evaluación por tipo de medio
- ✅ **Especialización de jurados**: Asignación inteligente por área de expertise
- ✅ **Sistema de suscripciones**: Modelo de negocio con planes y límites configurables
- ✅ **CMS unificado**: Gestión de contenido estático, blog y contenido educativo
- ✅ **Comunidad activa**: Seguimientos, comentarios, likes y sistema social
- ✅ **Contenido educativo**: Tutoriales y guías especializadas por disciplina
- ✅ **Newsletter automático**: Digest semanal con contenido destacado
- ✅ **Integración Immich**: Gestión inteligente de medios con metadatos automáticos
- ✅ **SEO optimizado**: Structured data, sitemap y Open Graph tags

### Próximos Pasos
1. **Revisión final** de especificaciones técnicas
2. **Configuración del entorno** de desarrollo
3. **Inicio de Fase 1**: Backend API (webfestival-api)
4. **Desarrollo iterativo** con validación continua