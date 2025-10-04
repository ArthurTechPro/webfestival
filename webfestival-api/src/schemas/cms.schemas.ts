import { z } from 'zod';

// Esquemas para el sistema CMS unificado

// Enum para tipos de contenido
export const TipoContenidoSchema = z.enum(['pagina_estatica', 'blog_post', 'seccion_cms']);

// Enum para estados de contenido
export const EstadoContenidoSchema = z.enum(['BORRADOR', 'PUBLICADO', 'ARCHIVADO', 'PROGRAMADO']);

// Enum para tipos de taxonomía
export const TipoTaxonomiaSchema = z.enum(['categoria', 'etiqueta']);

// Schema base para contenido
export const ContenidoBaseSchema = z.object({
  tipo: TipoContenidoSchema,
  titulo: z.string().min(1, 'El título es requerido').max(255, 'El título no puede exceder 255 caracteres'),
  contenido: z.string().optional(),
  resumen: z.string().max(500, 'El resumen no puede exceder 500 caracteres').optional(),
  imagen_destacada: z.string().url('Debe ser una URL válida').optional(),
  estado: EstadoContenidoSchema.default('BORRADOR'),
  fecha_publicacion: z.string().datetime().optional().or(z.date().optional()),
});

// Schema para crear contenido
export const CreateContenidoSchema = ContenidoBaseSchema.extend({
  slug: z.string()
    .min(1, 'El slug es requerido')
    .max(255, 'El slug no puede exceder 255 caracteres')
    .regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones')
    .optional(), // Se genera automáticamente si no se proporciona
});

// Schema para actualizar contenido
export const UpdateContenidoSchema = ContenidoBaseSchema.partial().extend({
  slug: z.string()
    .min(1, 'El slug es requerido')
    .max(255, 'El slug no puede exceder 255 caracteres')
    .regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones')
    .optional(),
});

// Schema para configuración de contenido
export const ContenidoConfiguracionSchema = z.object({
  activo: z.boolean().default(true),
  orden: z.number().int().min(0).default(0),
  permite_comentarios: z.boolean().default(true),
  destacado: z.boolean().default(false),
  configuracion_adicional: z.record(z.any()).optional(),
});

// Schema para SEO de contenido
export const ContenidoSEOSchema = z.object({
  seo_titulo: z.string().max(60, 'El título SEO no puede exceder 60 caracteres').optional(),
  seo_descripcion: z.string().max(160, 'La descripción SEO no puede exceder 160 caracteres').optional(),
  seo_keywords: z.array(z.string()).max(10, 'Máximo 10 palabras clave').default([]),
  meta_tags: z.record(z.any()).optional(),
  structured_data: z.record(z.any()).optional(),
});

// Schema para métricas de contenido
export const ContenidoMetricasSchema = z.object({
  vistas: z.number().int().min(0).default(0),
  likes: z.number().int().min(0).default(0),
  comentarios_count: z.number().int().min(0).default(0),
  shares: z.number().int().min(0).default(0),
  ultima_vista: z.string().datetime().optional().or(z.date().optional()),
  primera_publicacion: z.string().datetime().optional().or(z.date().optional()),
});

// Schema para taxonomía de contenido
export const ContenidoTaxonomiaSchema = z.object({
  categoria: z.string().max(100, 'La categoría no puede exceder 100 caracteres').optional(),
  etiqueta: z.string().max(50, 'La etiqueta no puede exceder 50 caracteres').optional(),
  tipo_taxonomia: TipoTaxonomiaSchema,
}).refine(
  (data) => (data.categoria && data.tipo_taxonomia === 'categoria') || 
           (data.etiqueta && data.tipo_taxonomia === 'etiqueta'),
  {
    message: 'Debe proporcionar categoría o etiqueta según el tipo de taxonomía',
  }
);

// Schema para filtros de contenido
export const ContentFiltersSchema = z.object({
  tipo: TipoContenidoSchema.optional(),
  categoria: z.string().optional(),
  etiqueta: z.string().optional(),
  autor: z.string().optional(),
  estado: EstadoContenidoSchema.optional(),
  busqueda: z.string().optional(),
  activo: z.boolean().optional(),
  destacado: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  sort_by: z.enum(['created_at', 'updated_at', 'fecha_publicacion', 'titulo', 'vistas']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

// Schema para comentarios de contenido
export const ContenidoComentarioSchema = z.object({
  contenido_texto: z.string().min(1, 'El comentario no puede estar vacío').max(1000, 'El comentario no puede exceder 1000 caracteres'),
  parent_id: z.number().int().positive().optional(),
});

// Schema para likes de contenido
export const ContenidoLikeSchema = z.object({
  tipo_contenido: z.string().min(1, 'El tipo de contenido es requerido'),
});

// Schema para reportes de contenido
export const ContenidoReporteSchema = z.object({
  tipo_elemento: z.string().min(1, 'El tipo de elemento es requerido'),
  razon: z.string().min(1, 'La razón del reporte es requerida').max(100, 'La razón no puede exceder 100 caracteres'),
  descripcion: z.string().max(500, 'La descripción no puede exceder 500 caracteres').optional(),
});

// Schema para plantillas de contenido
export const ContentTemplateSchema = z.object({
  tipo: TipoContenidoSchema,
  campos: z.array(z.object({
    nombre: z.string(),
    tipo: z.enum(['text', 'textarea', 'wysiwyg', 'image', 'select', 'multiselect', 'date', 'boolean']),
    requerido: z.boolean(),
    opciones: z.array(z.string()).optional(),
    validacion: z.record(z.any()).optional(),
  })),
  configuracion: z.record(z.any()),
});

// Schema para búsqueda de etiquetas
export const TagSearchSchema = z.object({
  query: z.string().min(1, 'La consulta de búsqueda es requerida').max(50, 'La consulta no puede exceder 50 caracteres'),
  limit: z.number().int().min(1).max(20).default(10),
});

// Schema para estadísticas de contenido
export const ContentStatsSchema = z.object({
  tipo: TipoContenidoSchema.optional(),
  fecha_inicio: z.string().datetime().optional().or(z.date().optional()),
  fecha_fin: z.string().datetime().optional().or(z.date().optional()),
});

// Tipos TypeScript derivados de los esquemas
export type TipoContenido = z.infer<typeof TipoContenidoSchema>;
export type EstadoContenido = z.infer<typeof EstadoContenidoSchema>;
export type TipoTaxonomia = z.infer<typeof TipoTaxonomiaSchema>;
export type ContenidoBase = z.infer<typeof ContenidoBaseSchema>;
export type CreateContenido = z.infer<typeof CreateContenidoSchema>;
export type UpdateContenido = z.infer<typeof UpdateContenidoSchema>;
export type ContenidoConfiguracion = z.infer<typeof ContenidoConfiguracionSchema>;
export type ContenidoSEO = z.infer<typeof ContenidoSEOSchema>;
export type ContenidoMetricas = z.infer<typeof ContenidoMetricasSchema>;
export type ContenidoTaxonomia = z.infer<typeof ContenidoTaxonomiaSchema>;
export type ContentFilters = z.infer<typeof ContentFiltersSchema>;
export type ContenidoComentario = z.infer<typeof ContenidoComentarioSchema>;
export type ContenidoLike = z.infer<typeof ContenidoLikeSchema>;
export type ContenidoReporte = z.infer<typeof ContenidoReporteSchema>;
export type ContentTemplate = z.infer<typeof ContentTemplateSchema>;
export type TagSearch = z.infer<typeof TagSearchSchema>;
export type ContentStats = z.infer<typeof ContentStatsSchema>;