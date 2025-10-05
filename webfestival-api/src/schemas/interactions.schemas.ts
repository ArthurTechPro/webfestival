import { z } from 'zod';

/**
 * Esquemas de validación para el sistema de interacciones unificadas
 * Incluye likes, comentarios, reportes y moderación
 */

// ============================================================================
// ESQUEMAS PARA LIKES UNIFICADOS
// ============================================================================

export const LikeContentSchema = z.object({
    contenido_id: z.number().int().positive('El ID del contenido debe ser un número positivo'),
    tipo_contenido: z.string().min(1, 'El tipo de contenido es requerido')
});

export const UnlikeContentSchema = z.object({
    contenido_id: z.number().int().positive('El ID del contenido debe ser un número positivo'),
    tipo_contenido: z.string().min(1, 'El tipo de contenido es requerido')
});

// ============================================================================
// ESQUEMAS PARA COMENTARIOS UNIVERSALES
// ============================================================================

export const CreateCommentSchema = z.object({
    contenido_id: z.number().int().positive('El ID del contenido debe ser un número positivo'),
    tipo_contenido: z.string().min(1, 'El tipo de contenido es requerido'),
    contenido_texto: z.string()
        .min(1, 'El contenido del comentario es requerido')
        .max(1000, 'El comentario no puede exceder 1000 caracteres'),
    parent_id: z.number().int().positive().optional()
});

export const UpdateCommentSchema = z.object({
    contenido_texto: z.string()
        .min(1, 'El contenido del comentario es requerido')
        .max(1000, 'El comentario no puede exceder 1000 caracteres')
});

export const CommentFiltersSchema = z.object({
    contenido_id: z.number().int().positive().optional(),
    tipo_contenido: z.string().optional(),
    usuario_id: z.string().optional(),
    aprobado: z.boolean().optional(),
    reportado: z.boolean().optional(),
    parent_id: z.number().int().positive().optional().nullable(),
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(10)
});

// ============================================================================
// ESQUEMAS PARA REPORTES UNIFICADOS
// ============================================================================

export const CreateReportSchema = z.object({
    elemento_id: z.number().int().positive('El ID del elemento debe ser un número positivo'),
    tipo_elemento: z.enum(['contenido', 'comentario'], {
        errorMap: () => ({ message: 'El tipo de elemento debe ser "contenido" o "comentario"' })
    }),
    razon: z.enum([
        'spam',
        'contenido_inapropiado',
        'acoso',
        'informacion_falsa',
        'violacion_derechos_autor',
        'otro'
    ], {
        errorMap: () => ({ message: 'Razón de reporte inválida' })
    }),
    descripcion: z.string()
        .max(500, 'La descripción no puede exceder 500 caracteres')
        .optional()
});

export const ReportFiltersSchema = z.object({
    tipo_elemento: z.enum(['contenido', 'comentario']).optional(),
    estado: z.enum(['PENDIENTE', 'REVISANDO', 'APROBADO', 'RECHAZADO', 'RESUELTO']).optional(),
    razon: z.string().optional(),
    usuario_id: z.string().optional(),
    fecha_desde: z.string().datetime().optional(),
    fecha_hasta: z.string().datetime().optional(),
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(10)
});

// ============================================================================
// ESQUEMAS PARA MODERACIÓN
// ============================================================================

export const ModerateCommentSchema = z.object({
    aprobado: z.boolean(),
    razon_moderacion: z.string()
        .max(200, 'La razón de moderación no puede exceder 200 caracteres')
        .optional()
});

export const ResolveReportSchema = z.object({
    estado: z.enum(['APROBADO', 'RECHAZADO', 'RESUELTO'], {
        errorMap: () => ({ message: 'Estado de resolución inválido' })
    }),
    accion_tomada: z.string()
        .max(500, 'La descripción de la acción no puede exceder 500 caracteres')
        .optional()
});

export const BulkModerationSchema = z.object({
    comment_ids: z.array(z.number().int().positive())
        .min(1, 'Debe seleccionar al menos un comentario')
        .max(50, 'No puede moderar más de 50 comentarios a la vez'),
    accion: z.enum(['aprobar', 'rechazar', 'eliminar'], {
        errorMap: () => ({ message: 'Acción de moderación inválida' })
    }),
    razon: z.string()
        .max(200, 'La razón no puede exceder 200 caracteres')
        .optional()
});

// ============================================================================
// ESQUEMAS PARA ESTADÍSTICAS
// ============================================================================

export const InteractionStatsFiltersSchema = z.object({
    tipo_contenido: z.string().optional(),
    fecha_desde: z.string().datetime().optional(),
    fecha_hasta: z.string().datetime().optional(),
    incluir_comentarios: z.boolean().default(true),
    incluir_likes: z.boolean().default(true),
    incluir_reportes: z.boolean().default(false)
});

// ============================================================================
// TIPOS DERIVADOS
// ============================================================================

export type LikeContentData = z.infer<typeof LikeContentSchema>;
export type UnlikeContentData = z.infer<typeof UnlikeContentSchema>;
export type CreateCommentData = z.infer<typeof CreateCommentSchema>;
export type UpdateCommentData = z.infer<typeof UpdateCommentSchema>;
export type CommentFilters = z.infer<typeof CommentFiltersSchema>;
export type CreateReportData = z.infer<typeof CreateReportSchema>;
export type ReportFilters = z.infer<typeof ReportFiltersSchema>;
export type ModerateCommentData = z.infer<typeof ModerateCommentSchema>;
export type ResolveReportData = z.infer<typeof ResolveReportSchema>;
export type BulkModerationData = z.infer<typeof BulkModerationSchema>;
export type InteractionStatsFilters = z.infer<typeof InteractionStatsFiltersSchema>;