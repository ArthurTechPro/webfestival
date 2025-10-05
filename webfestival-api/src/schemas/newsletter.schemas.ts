import { z } from 'zod';

// ============================================================================
// ESQUEMAS PARA NEWSLETTER
// ============================================================================

/**
 * Esquema para suscripción al newsletter
 */
export const NewsletterSubscriptionSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .min(1, 'Email es requerido')
    .max(255, 'Email demasiado largo'),
  usuario_id: z.string().optional()
});

/**
 * Esquema para confirmación de suscripción
 */
export const NewsletterConfirmationSchema = z.object({
  token: z.string()
    .min(1, 'Token es requerido')
    .max(255, 'Token inválido')
});

/**
 * Esquema para cancelación de suscripción
 */
export const NewsletterUnsubscribeSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .min(1, 'Email es requerido'),
  token: z.string().optional()
});

/**
 * Esquema para filtros de suscriptores
 */
export const NewsletterSubscribersFiltersSchema = z.object({
  activo: z.boolean().optional(),
  confirmado: z.boolean().optional(),
  fecha_desde: z.string().datetime().optional(),
  fecha_hasta: z.string().datetime().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10)
});

/**
 * Esquema para actualización de suscriptor
 */
export const UpdateNewsletterSubscriberSchema = z.object({
  activo: z.boolean().optional(),
  confirmado: z.boolean().optional()
});

// ============================================================================
// ESQUEMAS PARA CONTENIDO EDUCATIVO
// ============================================================================

/**
 * Esquema para crear contenido educativo
 */
export const CreateContenidoEducativoSchema = z.object({
  tipo: z.enum(['tutorial', 'articulo', 'guia', 'inspiracion'], {
    errorMap: () => ({ message: 'Tipo debe ser: tutorial, articulo, guia o inspiracion' })
  }),
  categoria_multimedia: z.enum(['fotografia', 'video', 'audio', 'cine', 'general'], {
    errorMap: () => ({ message: 'Categoría debe ser: fotografia, video, audio, cine o general' })
  }),
  titulo: z.string()
    .min(1, 'Título es requerido')
    .max(255, 'Título demasiado largo'),
  contenido: z.string()
    .min(1, 'Contenido es requerido'),
  resumen: z.string()
    .max(500, 'Resumen demasiado largo')
    .optional(),
  nivel: z.enum(['principiante', 'intermedio', 'avanzado'], {
    errorMap: () => ({ message: 'Nivel debe ser: principiante, intermedio o avanzado' })
  }),
  tiempo_lectura: z.number()
    .int()
    .min(1, 'Tiempo de lectura debe ser mayor a 0')
    .max(300, 'Tiempo de lectura máximo 300 minutos'),
  tags: z.array(z.string().max(50, 'Tag demasiado largo')).default([]),
  imagen_destacada: z.string().url('URL de imagen inválida').optional(),
  recursos_adicionales: z.array(z.object({
    titulo: z.string().max(100, 'Título de recurso demasiado largo'),
    url: z.string().url('URL de recurso inválida'),
    tipo: z.enum(['video', 'imagen', 'enlace', 'descarga'])
  })).default([]),
  estado: z.enum(['borrador', 'publicado', 'archivado']).default('borrador')
});

/**
 * Esquema para actualizar contenido educativo
 */
export const UpdateContenidoEducativoSchema = CreateContenidoEducativoSchema.partial();

/**
 * Esquema para filtros de contenido educativo
 */
export const ContenidoEducativoFiltersSchema = z.object({
  tipo: z.enum(['tutorial', 'articulo', 'guia', 'inspiracion']).optional(),
  categoria_multimedia: z.enum(['fotografia', 'video', 'audio', 'cine', 'general']).optional(),
  nivel: z.enum(['principiante', 'intermedio', 'avanzado']).optional(),
  estado: z.enum(['borrador', 'publicado', 'archivado']).optional(),
  autor_id: z.string().optional(),
  tags: z.array(z.string()).optional(),
  busqueda: z.string().optional(),
  fecha_desde: z.string().datetime().optional(),
  fecha_hasta: z.string().datetime().optional(),
  destacado: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(10),
  orden: z.enum(['reciente', 'popular', 'titulo', 'tiempo_lectura']).default('reciente')
});

/**
 * Esquema para recomendaciones personalizadas
 */
export const RecommendationsFiltersSchema = z.object({
  usuario_id: z.string().min(1, 'Usuario ID es requerido'),
  categoria_multimedia: z.enum(['fotografia', 'video', 'audio', 'cine', 'general']).optional(),
  nivel: z.enum(['principiante', 'intermedio', 'avanzado']).optional(),
  limit: z.number().int().min(1).max(20).default(10),
  excluir_leidos: z.boolean().default(true)
});

/**
 * Esquema para tracking de métricas
 */
export const TrackContentViewSchema = z.object({
  contenido_id: z.number().int().min(1, 'ID de contenido inválido'),
  usuario_id: z.string().optional(),
  tiempo_lectura: z.number().int().min(0).optional(), // en segundos
  porcentaje_leido: z.number().min(0).max(100).optional()
});

/**
 * Esquema para métricas de contenido educativo
 */
export const ContenidoEducativoMetricsSchema = z.object({
  tipo: z.enum(['tutorial', 'articulo', 'guia', 'inspiracion']).optional(),
  categoria_multimedia: z.enum(['fotografia', 'video', 'audio', 'cine', 'general']).optional(),
  periodo: z.enum(['semana', 'mes', 'trimestre', 'año']).default('mes'),
  fecha_desde: z.string().datetime().optional(),
  fecha_hasta: z.string().datetime().optional(),
  limit: z.number().int().min(1).max(50).default(10)
});

/**
 * Esquema para digest del newsletter
 */
export const NewsletterDigestSchema = z.object({
  fecha_inicio: z.string().datetime(),
  fecha_fin: z.string().datetime(),
  incluir_concursos: z.boolean().default(true),
  incluir_contenido_educativo: z.boolean().default(true),
  incluir_ganadores: z.boolean().default(true),
  max_contenido: z.number().int().min(1).max(10).default(5),
  max_concursos: z.number().int().min(1).max(5).default(3)
});

// ============================================================================
// TIPOS DERIVADOS
// ============================================================================

export type NewsletterSubscriptionInput = z.infer<typeof NewsletterSubscriptionSchema>;
export type NewsletterConfirmationInput = z.infer<typeof NewsletterConfirmationSchema>;
export type NewsletterUnsubscribeInput = z.infer<typeof NewsletterUnsubscribeSchema>;
export type NewsletterSubscribersFilters = z.infer<typeof NewsletterSubscribersFiltersSchema>;
export type UpdateNewsletterSubscriberInput = z.infer<typeof UpdateNewsletterSubscriberSchema>;

export type CreateContenidoEducativoInput = z.infer<typeof CreateContenidoEducativoSchema>;
export type UpdateContenidoEducativoInput = z.infer<typeof UpdateContenidoEducativoSchema>;
export type ContenidoEducativoFilters = z.infer<typeof ContenidoEducativoFiltersSchema>;
export type RecommendationsFilters = z.infer<typeof RecommendationsFiltersSchema>;
export type TrackContentViewInput = z.infer<typeof TrackContentViewSchema>;
export type ContenidoEducativoMetricsFilters = z.infer<typeof ContenidoEducativoMetricsSchema>;
export type NewsletterDigestInput = z.infer<typeof NewsletterDigestSchema>;