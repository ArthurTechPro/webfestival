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
- Como administrador, quiero moderar comentarios reportados y gestionar la comunidad.

### d. Rol: Administrador de Contenido (CONTENT_ADMIN)
- Como administrador de contenido, quiero gestionar el contenido de la página estática a través del mini CMS.
- Como administrador de contenido, quiero crear y publicar posts en el blog de la comunidad.
- Como administrador de contenido, quiero gestionar categorías y etiquetas del blog.
- Como administrador de contenido, quiero acceder a estadísticas del blog y newsletter.
- Como administrador de contenido, quiero moderar comentarios del blog.
- Como administrador de contenido, quiero gestionar suscriptores del newsletter.

### e. Rol: Usuario Registrado (funcionalidades adicionales del blog)
- Como usuario registrado, quiero leer posts del blog y dejar comentarios.
- Como usuario registrado, quiero dar likes a posts que me gusten.
- Como usuario registrado, quiero suscribirme al newsletter para recibir actualizaciones.
- Como usuario registrado, quiero reportar comentarios inapropiados.

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

### Tabla: jurados
Define qué jurados están asignados a evaluar qué categorías específicas.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Identificador único de la asignación |
| `usuario_id` | TEXT | Referencia al usuario con rol de jurado |
| `categoria_id` | INTEGER | Referencia a la categoría que debe evaluar |

```sql
CREATE TABLE "jurados" (
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

### Tabla: contenido (Tabla principal normalizada)
Tabla principal que contiene la información básica de todo el contenido.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Identificador único del contenido |
| `tipo` | TEXT | Tipo de contenido: 'pagina_estatica', 'blog_post', 'seccion_cms' |
| `slug` | TEXT UNIQUE | URL amigable única (generada automáticamente o personalizada) |
| `titulo` | TEXT | Título principal del contenido |
| `contenido` | TEXT | Contenido principal en formato markdown/HTML |
| `resumen` | TEXT | Resumen corto para listados (opcional) |
| `imagen_destacada` | TEXT | URL de imagen principal almacenada en Immich (opcional) |
| `autor_id` | TEXT | Referencia al usuario que creó el contenido |
| `estado` | TEXT | Estado: 'borrador', 'publicado', 'archivado', 'programado' |
| `fecha_publicacion` | TIMESTAMP | Fecha de publicación (actual o programada) |
| `created_at` | TIMESTAMP | Fecha de creación |
| `updated_at` | TIMESTAMP | Fecha de última actualización |
| `updated_by` | TEXT | Usuario que realizó la última actualización |

```sql
CREATE TABLE "contenido" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "tipo" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "titulo" TEXT NOT NULL,
  "contenido" TEXT,
  "resumen" TEXT,
  "imagen_destacada" TEXT,
  "autor_id" TEXT NOT NULL,
  "estado" TEXT NOT NULL DEFAULT 'borrador',
  "fecha_publicacion" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_by" TEXT,
  FOREIGN KEY ("autor_id") REFERENCES "usuarios"("id") ON DELETE CASCADE,
  FOREIGN KEY ("updated_by") REFERENCES "usuarios"("id")
);
```

### Tabla: contenido_configuracion
Configuración específica por tipo de contenido y configuraciones adicionales.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `contenido_id` | INTEGER PRIMARY KEY | Referencia al contenido |
| `activo` | BOOLEAN | Indica si el contenido está activo y visible |
| `orden` | INTEGER | Orden de visualización (para secciones de página) |
| `permite_comentarios` | BOOLEAN | Indica si permite comentarios |
| `destacado` | BOOLEAN | Indica si el contenido está destacado |
| `configuracion_adicional` | JSONB | Configuraciones específicas por tipo de contenido |

```sql
CREATE TABLE "contenido_configuracion" (
  "contenido_id" INTEGER NOT NULL PRIMARY KEY,
  "activo" BOOLEAN DEFAULT TRUE,
  "orden" INTEGER DEFAULT 0,
  "permite_comentarios" BOOLEAN DEFAULT FALSE,
  "destacado" BOOLEAN DEFAULT FALSE,
  "configuracion_adicional" JSONB,
  FOREIGN KEY ("contenido_id") REFERENCES "contenido"("id") ON DELETE CASCADE
);
```

### Tabla: contenido_seo
Información SEO separada para mantener la tabla principal limpia.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `contenido_id` | INTEGER PRIMARY KEY | Referencia al contenido |
| `seo_titulo` | TEXT | Título optimizado para SEO |
| `seo_descripcion` | TEXT | Descripción optimizada para SEO |
| `seo_keywords` | TEXT[] | Palabras clave para SEO |
| `meta_tags` | JSONB | Meta tags adicionales |
| `structured_data` | JSONB | Datos estructurados para motores de búsqueda |

```sql
CREATE TABLE "contenido_seo" (
  "contenido_id" INTEGER NOT NULL PRIMARY KEY,
  "seo_titulo" TEXT,
  "seo_descripcion" TEXT,
  "seo_keywords" TEXT[],
  "meta_tags" JSONB,
  "structured_data" JSONB,
  FOREIGN KEY ("contenido_id") REFERENCES "contenido"("id") ON DELETE CASCADE
);
```

### Tabla: contenido_metricas
Métricas y estadísticas separadas para mejor rendimiento.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `contenido_id` | INTEGER PRIMARY KEY | Referencia al contenido |
| `vistas` | INTEGER | Contador de visualizaciones |
| `likes` | INTEGER | Contador de likes |
| `comentarios_count` | INTEGER | Contador de comentarios (calculado) |
| `shares` | INTEGER | Contador de compartidos |
| `ultima_vista` | TIMESTAMP | Fecha de última visualización |
| `primera_publicacion` | TIMESTAMP | Fecha de primera publicación |

```sql
CREATE TABLE "contenido_metricas" (
  "contenido_id" INTEGER NOT NULL PRIMARY KEY,
  "vistas" INTEGER DEFAULT 0,
  "likes" INTEGER DEFAULT 0,
  "comentarios_count" INTEGER DEFAULT 0,
  "shares" INTEGER DEFAULT 0,
  "ultima_vista" TIMESTAMP(3),
  "primera_publicacion" TIMESTAMP(3),
  FOREIGN KEY ("contenido_id") REFERENCES "contenido"("id") ON DELETE CASCADE
);
```

### Tabla: contenido_taxonomia
Categorización y etiquetado separado para mejor organización.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `contenido_id` | INTEGER | Referencia al contenido |
| `categoria` | TEXT | Categoría del contenido |
| `etiqueta` | TEXT | Etiqueta individual |
| `tipo_taxonomia` | TEXT | Tipo: 'categoria' o 'etiqueta' |

```sql
CREATE TABLE "contenido_taxonomia" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "contenido_id" INTEGER NOT NULL,
  "categoria" TEXT,
  "etiqueta" TEXT,
  "tipo_taxonomia" TEXT NOT NULL,
  FOREIGN KEY ("contenido_id") REFERENCES "contenido"("id") ON DELETE CASCADE
);
```



### Tabla: contenido_comentarios
Sistema unificado de comentarios para cualquier tipo de contenido (blog posts, fotografías).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Identificador único del comentario |
| `contenido_id` | INTEGER | Referencia al contenido comentado (contenido_dinamico o fotos) |
| `tipo_contenido` | TEXT | Tipo de contenido: 'blog_post', 'foto', 'pagina_estatica' |
| `usuario_id` | TEXT | Referencia al usuario que escribió el comentario |
| `contenido` | TEXT | Texto del comentario (máximo 1000 caracteres) |
| `aprobado` | BOOLEAN | Indica si el comentario ha sido aprobado por moderadores |
| `reportado` | BOOLEAN | Indica si el comentario ha sido reportado |
| `parent_id` | INTEGER | Referencia al comentario padre para respuestas anidadas |
| `fecha_comentario` | TIMESTAMP | Fecha y hora del comentario |

```sql
CREATE TABLE "contenido_comentarios" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "contenido_id" INTEGER NOT NULL,
  "tipo_contenido" TEXT NOT NULL,
  "usuario_id" TEXT NOT NULL,
  "contenido" TEXT NOT NULL,
  "aprobado" BOOLEAN DEFAULT FALSE,
  "reportado" BOOLEAN DEFAULT FALSE,
  "parent_id" INTEGER,
  "fecha_comentario" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE,
  FOREIGN KEY ("parent_id") REFERENCES "contenido_comentarios"("id") ON DELETE CASCADE
);
```

### Tabla: contenido_likes
Sistema unificado de likes para cualquier tipo de contenido.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Identificador único del like |
| `contenido_id` | INTEGER | Referencia al contenido que recibió el like |
| `tipo_contenido` | TEXT | Tipo de contenido: 'blog_post', 'foto' |
| `usuario_id` | TEXT | Referencia al usuario que dio el like |
| `fecha_like` | TIMESTAMP | Fecha y hora del like |

```sql
CREATE TABLE "contenido_likes" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "contenido_id" INTEGER NOT NULL,
  "tipo_contenido" TEXT NOT NULL,
  "usuario_id" TEXT NOT NULL,
  "fecha_like" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE,
  UNIQUE("contenido_id", "tipo_contenido", "usuario_id")
);
```

### Tabla: newsletter_suscriptores
Gestiona las suscripciones al newsletter semanal del blog.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Identificador único del suscriptor |
| `email` | TEXT UNIQUE | Dirección de email del suscriptor |
| `activo` | BOOLEAN | Indica si la suscripción está activa |
| `fecha_suscripcion` | TIMESTAMP | Fecha de suscripción inicial |
| `fecha_confirmacion` | TIMESTAMP | Fecha de confirmación del email |
| `token_confirmacion` | TEXT | Token único para confirmar la suscripción |

```sql
CREATE TABLE "newsletter_suscriptores" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "activo" BOOLEAN DEFAULT TRUE,
  "fecha_suscripcion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "fecha_confirmacion" TIMESTAMP(3),
  "token_confirmacion" TEXT
);
```

### Tabla: contenido_reportes
Sistema unificado de reportes para cualquier tipo de contenido o comentario.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Identificador único del reporte |
| `elemento_id` | INTEGER | Referencia al elemento reportado (comentario, contenido, foto) |
| `tipo_elemento` | TEXT | Tipo de elemento: 'comentario', 'blog_post', 'foto' |
| `usuario_id` | TEXT | Referencia al usuario que hizo el reporte |
| `razon` | TEXT | Razón del reporte (spam, contenido inapropiado, etc.) |
| `descripcion` | TEXT | Descripción adicional del reporte |
| `fecha_reporte` | TIMESTAMP | Fecha y hora del reporte |
| `resuelto` | BOOLEAN | Indica si el reporte ha sido revisado y resuelto |
| `resuelto_por` | TEXT | Usuario que resolvió el reporte |
| `fecha_resolucion` | TIMESTAMP | Fecha de resolución del reporte |
| `accion_tomada` | TEXT | Acción tomada: 'aprobado', 'eliminado', 'editado', 'sin_accion' |

```sql
CREATE TABLE "contenido_reportes" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "elemento_id" INTEGER NOT NULL,
  "tipo_elemento" TEXT NOT NULL,
  "usuario_id" TEXT NOT NULL,
  "razon" TEXT NOT NULL,
  "descripcion" TEXT,
  "fecha_reporte" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resuelto" BOOLEAN DEFAULT FALSE,
  "resuelto_por" TEXT,
  "fecha_resolucion" TIMESTAMP(3),
  "accion_tomada" TEXT,
  FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE,
  FOREIGN KEY ("resuelto_por") REFERENCES "usuarios"("id")
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

**Sistema CMS Dinámico:**
- GET /api/contenido - Obtener contenido con filtros (tipo, categoría, estado)
- GET /api/contenido/:slug - Obtener contenido específico por slug
- POST /api/contenido (protegido, rol CONTENT_ADMIN) - Crear nuevo contenido
- PUT /api/contenido/:id (protegido, rol CONTENT_ADMIN) - Actualizar contenido
- DELETE /api/contenido/:id (protegido, rol CONTENT_ADMIN) - Eliminar contenido
- POST /api/contenido/:id/publish (protegido, rol CONTENT_ADMIN) - Publicar contenido
- GET /api/contenido/preview/:id (protegido, rol CONTENT_ADMIN) - Preview de contenido

**Gestión de Contenido:**
- GET /api/contenido/categorias - Obtener categorías disponibles por tipo
- GET /api/contenido/etiquetas - Obtener etiquetas con autocompletado
- POST /api/contenido/upload-imagen (protegido, rol CONTENT_ADMIN) - Subir imagen
- GET /api/contenido/plantillas/:tipo - Obtener plantillas por tipo de contenido

**Interacciones Unificadas:**
- POST /api/contenido/:id/like (protegido) - Dar/quitar like a contenido
- GET /api/contenido/:id/comentarios - Obtener comentarios de contenido
- POST /api/contenido/:id/comentarios (protegido) - Agregar comentario
- POST /api/comentarios/:id/report (protegido) - Reportar comentario
- PUT /api/comentarios/:id/moderate (protegido, rol ADMIN) - Moderar comentario

**Newsletter:**
- POST /api/newsletter/subscribe - Suscribirse al newsletter
- GET /api/newsletter/confirm/:token - Confirmar suscripción
- POST /api/newsletter/unsubscribe - Cancelar suscripción
- POST /api/newsletter/send-digest (protegido, rol CONTENT_ADMIN) - Enviar digest manual

**Analytics Unificado:**
- GET /api/contenido/stats (protegido, rol CONTENT_ADMIN) - Estadísticas generales
- GET /api/contenido/:id/analytics (protegido, rol CONTENT_ADMIN) - Analytics específico
- GET /api/contenido/trending - Contenido trending por tipo

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

### Sistema CMS Normalizado:
- **Esquema Normalizado**: Separación de responsabilidades en tablas especializadas
- **Mejor Rendimiento**: Consultas más eficientes y carga selectiva de datos
- **Mantenimiento Simplificado**: Cada tabla tiene una responsabilidad específica
- **Escalabilidad**: Fácil agregar nuevos campos sin afectar consultas existentes
- **Flexibilidad**: Taxonomía dinámica sin restricciones de esquema fijo
- Editor WYSIWYG con auto-guardado para prevenir pérdida de contenido
- Generación automática de slugs únicos para SEO
- Sistema de moderación de comentarios con aprobación manual
- Newsletter automático con digest semanal de contenido destacado
- Analytics integrado para métricas de engagement y rendimiento
- SEO automático con meta tags y structured data para mejor indexación

### Moderación y Comunidad:
- Sistema de reportes para contenido inapropiado
- Herramientas de moderación para administradores
- Notificaciones automáticas para nuevos comentarios y interacciones
- Límites de rate limiting específicos para comentarios y likes