# Proyecto WebFestival - Arquitectura

## 1. Resumen Ejecutivo del Proyecto

Desarrollar una plataforma web completa y una API robusta llamada "webfestival" para la gestión de concursos de fotografía online. La plataforma debe ser escalable y estar preparada para servir en el futuro a una aplicación móvil nativa.

La arquitectura se basará en proyectos separados: un repositorio para la aplicación web, la API, y el servicio de almacenamiento de fotografías con Immich, y otro repositorio futuro para la aplicación móvil.

## 2. Roles de Usuario y User Stories

### a. Rol: Participante (Fotógrafo)
- Como participante, quiero poder crear una cuenta y gestionar mi perfil.
- Como participante, quiero ver y inscribirme en los concursos activos.
- Como participante, quiero poder subir mis fotografías a las categorías correspondientes.
- Como participante, quiero ver el estado y los resultados de mis envíos.
- Como participante, quiero compartir mis fotografías ganadoras en redes sociales.
- Como participante, quiero seguir a otros fotógrafos y ver sus trabajos.
- Como participante, quiero comentar en las fotografías de otros participantes.

### b. Rol: Jurado
- Como jurado, quiero acceder a un panel para ver las fotografías que me han sido asignadas.
- Como jurado, quiero poder calificar y dejar comentarios en cada fotografía.

### c. Rol: Administrador
- Como administrador, quiero un panel de control para gestionar concursos, categorías, usuarios y jurados.
- Como administrador, quiero poder monitorear el progreso de las evaluaciones y anunciar a los ganadores.
- Como administrador, quiero acceder a métricas y estadísticas detalladas de la plataforma.
- Como administrador, quiero gestionar el contenido de la página estática.

## 3. Stack Tecnológico (Últimas Versiones)

- **Frontend**: React 18+ / Next.js 14+
- **Lenguaje**: TypeScript 5+
- **Estilos**: Bootstrap 5.3+ (integrado con React)
- **Backend / API**: Next.js API Routes
- **Base de Datos**: PostgreSQL 16+
- **Almacenamiento de Archivos**: Immich Server (gestión inteligente de fotografías) - [https://immich.app/](https://immich.app/)
- **Autenticación**: NextAuth.js o Clerk
- **Notificaciones**: SendGrid/Resend para emails
- **Redes Sociales**: APIs de Facebook, Instagram, Twitter, LinkedIn

## 4. Estructura de Repositorios del Proyecto

El desarrollo se organizará en repositorios separados para mantener una clara división de responsabilidades.

### Repositorio 1: webfestival-api-web (Proyecto Principal a desarrollar)
- **Tecnología**: Next.js, TypeScript, PostgreSQL, Immich ([https://immich.app/](https://immich.app/))
- **Contenido**:
  - **API (Backend)**: Toda la lógica de negocio, endpoints y comunicación con la base de datos se construirán usando Next.js API Routes. Esta API será la única fuente de verdad.
  - **Aplicación Web (Frontend)**: La interfaz de usuario para participantes, jurados y administradores, construida con React/Next.js.
  - **Página Estática**: Landing page informativa con gestión de contenido.

### Repositorio 2: webfestival-mobile (Proyecto futuro)
- **Tecnología**: React Native
- **Descripción**: Aplicación cliente que consumirá exclusivamente la API desarrollada en el repositorio principal.

## 5. Esquema de la Base de Datos (PostgreSQL)

### Tabla: usuarios
Almacena la información de todos los usuarios del sistema (participantes, jurados y administradores).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | TEXT PRIMARY KEY | Identificador único del usuario (UUID generado por el sistema de autenticación) |
| `nombre` | TEXT | Nombre completo del usuario para mostrar en el perfil |
| `email` | TEXT UNIQUE | Dirección de correo electrónico única para autenticación y notificaciones |
| `password` | TEXT | Hash de la contraseña del usuario (encriptada) |
| `role` | TEXT | Rol del usuario: 'PARTICIPANTE', 'JURADO', 'ADMIN', 'CONTENT_ADMIN' |
| `picture_url` | TEXT | URL de la foto de perfil del usuario almacenada en Immich |
| `bio` | TEXT | Biografía o descripción personal del usuario (máximo 500 caracteres) |
| `created_at` | TIMESTAMP | Fecha y hora de creación de la cuenta |
| `updated_at` | TIMESTAMP | Fecha y hora de la última actualización del perfil |

```sql
CREATE TABLE "usuarios" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "nombre" TEXT,
  "email" TEXT NOT NULL UNIQUE,
  "password" TEXT,
  "role" TEXT NOT NULL DEFAULT 'PARTICIPANTE',
  "picture_url" TEXT,
  "bio" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: concursos
Contiene la información de todos los concursos de fotografía creados en la plataforma.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Identificador único autoincremental del concurso |
| `titulo` | TEXT | Nombre del concurso visible para los usuarios |
| `descripcion` | TEXT | Descripción detallada del concurso, objetivos y temática |
| `reglas` | TEXT | Reglas específicas del concurso en formato texto o markdown |
| `fecha_inicio` | TIMESTAMP | Fecha y hora de inicio del período de inscripciones |
| `fecha_final` | TIMESTAMP | Fecha y hora límite para envío de fotografías |
| `status` | TEXT | Estado actual: 'Próximamente', 'Activo', 'Calificación', 'Finalizado' |
| `imagen_url` | TEXT | URL de la imagen promocional del concurso |
| `max_envios` | INTEGER | Número máximo de fotografías por participante (default: 3) |
| `tamaño_max_mb` | INTEGER | Tamaño máximo permitido por archivo en MB (default: 10) |
| `created_at` | TIMESTAMP | Fecha de creación del concurso |

```sql
CREATE TABLE "concursos" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "titulo" TEXT NOT NULL,
  "descripcion" TEXT NOT NULL,
  "reglas" TEXT,
  "fecha_inicio" TIMESTAMP(3) NOT NULL,
  "fecha_final" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'Próximamente',
  "imagen_url" TEXT,
  "max_envios" INTEGER DEFAULT 3,
  "tamaño_max_mb" INTEGER DEFAULT 10,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: categorias
Define las categorías específicas dentro de cada concurso (ej: Retrato, Paisaje, Macro).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Identificador único de la categoría |
| `nombre` | TEXT | Nombre de la categoría (ej: "Retrato", "Paisaje Natural") |
| `concurso_id` | INTEGER | Referencia al concurso al que pertenece la categoría |

```sql
CREATE TABLE "categorias" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "nombre" TEXT NOT NULL,
  "concurso_id" INTEGER NOT NULL,
  FOREIGN KEY ("concurso_id") REFERENCES "concursos"("id") ON DELETE CASCADE
);
```

### Tabla: inscripciones
Registra las inscripciones de participantes a concursos específicos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Identificador único de la inscripción |
| `usuario_id` | TEXT | Referencia al usuario que se inscribe |
| `concurso_id` | INTEGER | Referencia al concurso en el que se inscribe |
| `fecha_inscripcion` | TIMESTAMP | Fecha y hora de la inscripción |

```sql
CREATE TABLE "inscripciones" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "usuario_id" TEXT NOT NULL,
  "concurso_id" INTEGER NOT NULL,
  "fecha_inscripcion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE,
  FOREIGN KEY ("concurso_id") REFERENCES "concursos"("id") ON DELETE CASCADE,
  UNIQUE("usuario_id", "concurso_id")
);
```

### Tabla: fotos
Almacena la información de todas las fotografías subidas a los concursos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Identificador único de la fotografía |
| `titulo` | TEXT | Título de la fotografía asignado por el autor |
| `usuario_id` | TEXT | Referencia al fotógrafo que subió la imagen |
| `concurso_id` | INTEGER | Referencia al concurso al que pertenece |
| `categoria_id` | INTEGER | Referencia a la categoría específica |
| `foto_url` | TEXT | URL de la imagen original almacenada en Immich |
| `thumbnail_url` | TEXT | URL de la miniatura (400x225px - 16:9) generada automáticamente |
| `preview_url` | TEXT | URL de la vista previa (1280x720px - 16:9) para visualización rápida |
| `metadatos_exif` | JSONB | Metadatos EXIF extraídos automáticamente por Immich |
| `fecha_subida` | TIMESTAMP | Fecha y hora de subida de la fotografía |

```sql
CREATE TABLE "fotos" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "titulo" TEXT NOT NULL,
  "usuario_id" TEXT NOT NULL,
  "concurso_id" INTEGER NOT NULL,
  "categoria_id" INTEGER NOT NULL,
  "foto_url" TEXT NOT NULL,
  "thumbnail_url" TEXT,
  "preview_url" TEXT,
  "metadatos_exif" JSONB,
  "fecha_subida" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE,
  FOREIGN KEY ("concurso_id") REFERENCES "concursos"("id") ON DELETE CASCADE,
  FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE CASCADE
);
```

### Tabla: jurado_asignaciones
Define qué jurados están asignados a evaluar qué categorías específicas.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Identificador único de la asignación |
| `usuario_id` | TEXT | Referencia al usuario con rol de jurado |
| `categoria_id` | INTEGER | Referencia a la categoría que debe evaluar |

```sql
CREATE TABLE "jurado_asignaciones" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "usuario_id" TEXT NOT NULL,
  "categoria_id" INTEGER NOT NULL,
  FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE,
  FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE CASCADE,
  UNIQUE("usuario_id", "categoria_id")
);
```

### Tabla: calificaciones
Almacena las evaluaciones de los jurados para cada fotografía.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Identificador único de la calificación |
| `foto_id` | INTEGER | Referencia a la fotografía evaluada |
| `jurado_id` | TEXT | Referencia al jurado que realizó la evaluación |
| `score_enfoque` | INTEGER | Puntuación de enfoque (1-10): nitidez, profundidad de campo, precisión |
| `score_exposicion` | INTEGER | Puntuación de exposición (1-10): iluminación, contraste, balance de blancos |
| `score_composicion` | INTEGER | Puntuación de composición (1-10): regla de tercios, balance, encuadre |
| `score_creatividad` | INTEGER | Puntuación de creatividad (1-10): originalidad, concepto, innovación |
| `score_impacto_visual` | INTEGER | Puntuación de impacto visual (1-10): fuerza emocional, atractivo estético |
| `comentarios` | TEXT | Comentarios opcionales del jurado para feedback constructivo |
| `fecha_calificacion` | TIMESTAMP | Fecha y hora de la evaluación |

```sql
CREATE TABLE "calificaciones" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "foto_id" INTEGER NOT NULL,
  "jurado_id" TEXT NOT NULL,
  "score_enfoque" INTEGER NOT NULL CHECK ("score_enfoque" >= 1 AND "score_enfoque" <= 10),
  "score_exposicion" INTEGER NOT NULL CHECK ("score_exposicion" >= 1 AND "score_exposicion" <= 10),
  "score_composicion" INTEGER NOT NULL CHECK ("score_composicion" >= 1 AND "score_composicion" <= 10),
  "score_creatividad" INTEGER NOT NULL CHECK ("score_creatividad" >= 1 AND "score_creatividad" <= 10),
  "score_impacto_visual" INTEGER NOT NULL CHECK ("score_impacto_visual" >= 1 AND "score_impacto_visual" <= 10),
  "comentarios" TEXT,
  "fecha_calificacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("foto_id") REFERENCES "fotos"("id") ON DELETE CASCADE,
  FOREIGN KEY ("jurado_id") REFERENCES "usuarios"("id") ON DELETE CASCADE,
  UNIQUE("foto_id", "jurado_id")
);
```

### Tabla: seguimientos
Gestiona las relaciones de seguimiento entre usuarios para funcionalidades sociales.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Identificador único del seguimiento |
| `seguidor_id` | TEXT | Referencia al usuario que sigue |
| `seguido_id` | TEXT | Referencia al usuario que es seguido |
| `fecha_seguimiento` | TIMESTAMP | Fecha y hora en que se inició el seguimiento |

```sql
CREATE TABLE "seguimientos" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "seguidor_id" TEXT NOT NULL,
  "seguido_id" TEXT NOT NULL,
  "fecha_seguimiento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("seguidor_id") REFERENCES "usuarios"("id") ON DELETE CASCADE,
  FOREIGN KEY ("seguido_id") REFERENCES "usuarios"("id") ON DELETE CASCADE,
  UNIQUE("seguidor_id", "seguido_id")
);
```

### Tabla: comentarios
Almacena los comentarios públicos en fotografías después de finalizar concursos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Identificador único del comentario |
| `foto_id` | INTEGER | Referencia a la fotografía comentada |
| `usuario_id` | TEXT | Referencia al usuario que escribió el comentario |
| `contenido` | TEXT | Texto del comentario (máximo 500 caracteres) |
| `fecha_comentario` | TIMESTAMP | Fecha y hora del comentario |
| `reportado` | BOOLEAN | Indica si el comentario ha sido reportado por contenido inapropiado |

```sql
CREATE TABLE "comentarios" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "foto_id" INTEGER NOT NULL,
  "usuario_id" TEXT NOT NULL,
  "contenido" TEXT NOT NULL,
  "fecha_comentario" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reportado" BOOLEAN DEFAULT FALSE,
  FOREIGN KEY ("foto_id") REFERENCES "fotos"("id") ON DELETE CASCADE,
  FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE
);
```

### Tabla: notificaciones
Sistema de notificaciones internas para usuarios sobre eventos importantes.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Identificador único de la notificación |
| `usuario_id` | TEXT | Referencia al usuario destinatario |
| `tipo` | TEXT | Tipo de notificación: 'deadline', 'evaluation', 'result', 'follow', 'comment' |
| `titulo` | TEXT | Título breve de la notificación |
| `mensaje` | TEXT | Mensaje completo de la notificación |
| `leida` | BOOLEAN | Indica si la notificación ha sido leída |
| `fecha_creacion` | TIMESTAMP | Fecha y hora de creación de la notificación |

```sql
CREATE TABLE "notificaciones" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "usuario_id" TEXT NOT NULL,
  "tipo" TEXT NOT NULL,
  "titulo" TEXT NOT NULL,
  "mensaje" TEXT NOT NULL,
  "leida" BOOLEAN DEFAULT FALSE,
  "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE
);
```

### Tabla: contenido_estatico
Gestiona el contenido de la página estática informativa a través de un mini CMS integrado.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Identificador único del contenido |
| `seccion` | TEXT UNIQUE | Identificador de la sección: 'hero', 'about', 'features', 'testimonials', 'gallery_featured' |
| `titulo` | TEXT | Título de la sección editable desde el CMS |
| `contenido` | TEXT | Contenido en formato markdown con editor WYSIWYG |
| `imagen_url` | TEXT | URL de imagen asociada subida a través del CMS |
| `activo` | BOOLEAN | Indica si la sección está activa y visible en la página |
| `orden` | INTEGER | Orden de visualización de las secciones |
| `metadatos` | JSONB | Metadatos adicionales (SEO, configuraciones específicas) |
| `updated_by` | TEXT | Usuario que realizó la última actualización (CONTENT_ADMIN) |
| `updated_at` | TIMESTAMP | Fecha de última actualización del contenido |

```sql
CREATE TABLE "contenido_estatico" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "seccion" TEXT NOT NULL UNIQUE,
  "titulo" TEXT,
  "contenido" TEXT,
  "imagen_url" TEXT,
  "activo" BOOLEAN DEFAULT TRUE,
  "orden" INTEGER DEFAULT 0,
  "metadatos" JSONB,
  "updated_by" TEXT,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("updated_by") REFERENCES "usuarios"("id")
);
```

## 6. Definición de la API y Flujo de Subida de Archivos

La API será consumida tanto por la aplicación web como por la futura aplicación móvil.

### Flujo de Subida de Fotografías (Integración con Immich):

1. El cliente solicita una URL de subida a la API.
2. La API se conecta con Immich y genera una URL segura y temporal.
3. El cliente sube el archivo directamente al servidor Immich usando dicha URL.
4. Immich procesa automáticamente la imagen, extrae metadatos EXIF y genera versiones optimizadas.
5. El cliente notifica a la API sobre la subida exitosa.
6. La API almacena la URL de la imagen y los metadatos relevantes en la base de datos.

### Endpoints Principales:

**Autenticación:**
- POST /api/auth/login
- POST /api/auth/register
- POST /api/auth/logout

**Concursos:**
- GET /api/concursos
- GET /api/concursos/:id
- POST /api/concursos/:id/inscribirse (protegido)

**Fotografías:**
- GET /api/fotos/upload-url (protegido)
- POST /api/fotos (protegido)
- GET /api/fotos/mis-envios (protegido)

**Jurados:**
- GET /api/jurados/asignaciones (protegido, rol JURADO)
- POST /api/jurados/calificaciones (protegido, rol JURADO)

**Administración:**
- GET, POST, PUT /api/admin/concursos (protegido, rol ADMIN)
- GET, POST, PUT /api/admin/usuarios (protegido, rol ADMIN)
- GET /api/admin/metricas (protegido, rol ADMIN)

**Redes Sociales:**
- POST /api/social/compartir (protegido)
- GET /api/social/enlace-publico/:fotoId

**Comunidad:**
- POST /api/comunidad/seguir (protegido)
- GET /api/comunidad/feed (protegido)
- POST /api/comunidad/comentarios (protegido)

**Galería Pública:**
- GET /api/galeria/publica
- GET /api/galeria/foto/:id

**Mini CMS:**
- GET /api/cms/contenido (protegido, rol CONTENT_ADMIN)
- PUT /api/cms/contenido/:seccion (protegido, rol CONTENT_ADMIN)
- POST /api/cms/upload-imagen (protegido, rol CONTENT_ADMIN)
- GET /api/cms/preview/:seccion (protegido, rol CONTENT_ADMIN)

## 7. Consideraciones Adicionales

### Seguridad:
- Validar tokens (JWT) y roles en todas las rutas protegidas
- Sanitización de inputs para prevenir XSS y SQL injection
- Rate limiting para prevenir abuso de APIs
- Validación de archivos de imagen en el servidor

### Rendimiento:
- Implementar paginación y optimizar consultas a la base de datos
- Aprovechar las capacidades de caché nativas de Immich
- Lazy loading de imágenes en el frontend
- Compresión automática de imágenes

### API First:
- Diseñar la API para que sea agnóstica al cliente que la consume (web o móvil)
- Documentación completa de la API con OpenAPI/Swagger
- Versionado de API para compatibilidad futura

### Integración con Immich:
- Configuración segura con API keys
- Manejo de errores y reintentos automáticos
- Aprovechamiento de metadatos EXIF para funcionalidades avanzadas
- Gestión inteligente de almacenamiento y optimización de imágenes