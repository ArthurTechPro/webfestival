# Esquema CMS Normalizado - WebFestival

## Visión General

El sistema CMS normalizado de WebFestival está diseñado para gestionar múltiples tipos de contenido de forma unificada y escalable. La arquitectura normalizada permite manejar contenido estático, posts de blog, contenido educativo y futuras extensiones sin cambios en el esquema base.

## Características Principales

- **Sistema Unificado**: Una sola estructura para múltiples tipos de contenido
- **Escalabilidad**: Fácil adición de nuevos tipos de contenido sin cambios de esquema
- **Interacciones Universales**: Sistema unificado de comentarios, likes y reportes
- **SEO Optimizado**: Metadatos y structured data automáticos
- **Taxonomía Flexible**: Categorías y etiquetas adaptables por tipo de contenido
- **Newsletter Integrado**: Sistema de suscripciones con digest automático
- **Índices Optimizados**: Consultas eficientes para todas las operaciones

## Arquitectura del Esquema

### Tabla Principal: `contenido`

La tabla principal almacena la información básica de cualquier tipo de contenido:

```sql
CREATE TABLE "contenido" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "tipo" TEXT NOT NULL,                    -- 'pagina_estatica', 'blog_post', 'seccion_cms'
  "slug" TEXT NOT NULL UNIQUE,             -- URL amigable única
  "titulo" TEXT NOT NULL,                  -- Título del contenido
  "contenido" TEXT,                        -- Contenido principal (opcional)
  "resumen" TEXT,                          -- Resumen/extracto
  "imagen_destacada" TEXT,                 -- URL de imagen principal
  "autor_id" TEXT NOT NULL,                -- ID del autor (CONTENT_ADMIN)
  "estado" TEXT NOT NULL DEFAULT 'BORRADOR', -- Estado de publicación
  "fecha_publicacion" TIMESTAMP(3),       -- Fecha de publicación programada
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_by" TEXT                        -- Último usuario que modificó
);
```

### Tablas Especializadas

#### 1. `contenido_configuracion`
Configuración específica por contenido:
- `activo`: Si el contenido está activo
- `orden`: Orden de visualización
- `permite_comentarios`: Habilita/deshabilita comentarios
- `destacado`: Marca contenido como destacado
- `configuracion_adicional`: JSON para configuraciones específicas por tipo

#### 2. `contenido_seo`
Optimización para motores de búsqueda:
- `seo_titulo`: Título optimizado para SEO
- `seo_descripcion`: Meta descripción
- `seo_keywords`: Palabras clave
- `meta_tags`: Meta tags adicionales (JSON)
- `structured_data`: Datos estructurados JSON-LD

#### 3. `contenido_metricas`
Métricas y estadísticas:
- `vistas`: Número de visualizaciones
- `likes`: Número de likes recibidos
- `comentarios_count`: Contador de comentarios
- `shares`: Número de veces compartido
- `ultima_vista`: Fecha de última visualización
- `primera_publicacion`: Fecha de primera publicación

#### 4. `contenido_taxonomia`
Sistema flexible de categorización:
- `categoria`: Categoría de texto libre
- `etiqueta`: Etiqueta de texto libre
- `tipo_taxonomia`: 'categoria' o 'etiqueta'

### Sistema de Interacciones Unificadas

#### 1. `contenido_comentarios`
Comentarios universales con soporte para:
- Comentarios anidados (parent_id)
- Moderación (aprobado/reportado)
- Múltiples tipos de contenido

#### 2. `contenido_likes`
Sistema de likes unificado:
- Soporte para cualquier tipo de contenido
- Prevención de likes duplicados
- Tracking temporal

#### 3. `contenido_reportes`
Sistema de reportes unificado:
- Reportes de contenido y comentarios
- Estados de moderación
- Tracking de resolución

### Newsletter

#### `newsletter_suscriptores`
Gestión de suscripciones:
- Confirmación por email (doble opt-in)
- Estados de suscripción
- Integración con usuarios registrados

## Índices Optimizados

### Índices Principales
- `idx_contenido_tipo`: Consultas por tipo de contenido
- `idx_contenido_estado`: Filtrado por estado de publicación
- `idx_contenido_tipo_estado_fecha`: Consultas complejas optimizadas

### Índices de Búsqueda
- `idx_contenido_titulo_gin`: Búsqueda de texto completo en títulos
- `idx_contenido_contenido_gin`: Búsqueda de texto completo en contenido

### Índices de Rendimiento
- `idx_contenido_metricas_vistas`: Ordenamiento por popularidad
- `idx_contenido_comentarios_contenido_aprobado_fecha`: Comentarios aprobados
- `idx_newsletter_activo_confirmado`: Suscriptores activos

### Índices Parciales
- `idx_contenido_publicado`: Solo contenido publicado
- `idx_contenido_destacado_activo`: Solo contenido destacado y activo
- `idx_comentarios_validos`: Solo comentarios aprobados y no reportados

## Tipos de Contenido Soportados

### 1. Página Estática (`pagina_estatica`)
- Contenido institucional
- Páginas de información
- Landing pages

### 2. Blog Post (`blog_post`)
- Artículos del blog
- Noticias de la comunidad
- Contenido editorial

### 3. Sección CMS (`seccion_cms`)
- Secciones configurables
- Contenido modular
- Elementos reutilizables

### 4. Contenido Educativo (futuro)
- Tutoriales por tipo de medio
- Guías especializadas
- Recursos de aprendizaje

## Flujo de Trabajo

### Creación de Contenido
1. Usuario CONTENT_ADMIN crea contenido base
2. Sistema genera slug único automáticamente
3. Se crean registros relacionados (configuración, SEO, métricas)
4. Contenido queda en estado BORRADOR

### Publicación
1. Usuario configura SEO y metadatos
2. Establece fecha de publicación
3. Sistema cambia estado a PUBLICADO
4. Se activan interacciones (comentarios, likes)

### Moderación
1. Sistema recibe reportes de contenido/comentarios
2. Moderadores revisan en panel unificado
3. Se toman acciones (aprobar, rechazar, eliminar)
4. Se notifica a usuarios involucrados

## Ventajas del Diseño

### Escalabilidad
- Nuevos tipos de contenido sin cambios de esquema
- Interacciones universales reutilizables
- Índices optimizados para crecimiento

### Flexibilidad
- Taxonomía adaptable por tipo
- Configuración específica por contenido
- Campos adicionales vía JSON

### Rendimiento
- Índices especializados por caso de uso
- Consultas optimizadas
- Separación de responsabilidades

### Mantenibilidad
- Estructura normalizada clara
- Relaciones bien definidas
- Documentación completa

## Consideraciones Técnicas

### Búsqueda de Texto Completo
- Índices GIN para búsqueda en español
- Soporte para múltiples idiomas
- Búsqueda ponderada por relevancia

### Caché y Rendimiento
- Índices parciales para consultas frecuentes
- Métricas precalculadas
- Optimización de consultas complejas

### Seguridad
- Validación de roles por operación
- Sanitización de contenido
- Prevención de spam y abuse

## Scripts de Mantenimiento

### `setup-cms-indices.js`
Configura todos los índices optimizados del sistema CMS.

### `apply-missing-indices.js`
Aplica índices específicos que puedan faltar.

### Uso:
```bash
# Configurar índices completos
node scripts/setup-cms-indices.js

# Aplicar índices faltantes
node scripts/apply-missing-indices.js
```

## Estado de Implementación

✅ **Completado:**
- Esquema de base de datos normalizado
- Tablas especializadas (configuración, SEO, métricas, taxonomía)
- Sistema de interacciones unificadas (comentarios, likes, reportes)
- Modelo de newsletter con suscriptores
- Índices optimizados para consultas eficientes
- Scripts de configuración y mantenimiento
- Documentación completa

El esquema CMS normalizado está completamente implementado y optimizado para soportar el crecimiento y escalabilidad de la plataforma WebFestival.