import { z } from 'zod';

/**
 * Esquemas de validación para endpoints de medios multimedia
 */

// Esquema para solicitar URL de subida
export const generateUploadUrlSchema = z.object({
  body: z.object({
    titulo: z.string()
      .min(1, 'El título es requerido')
      .max(100, 'El título no puede exceder 100 caracteres')
      .trim(),
    tipo_medio: z.enum(['fotografia', 'video', 'audio', 'corto_cine'], {
      errorMap: () => ({ message: 'Tipo de medio debe ser: fotografia, video, audio o corto_cine' })
    }),
    categoria_id: z.number()
      .int('ID de categoría debe ser un número entero')
      .positive('ID de categoría debe ser positivo'),
    file_size: z.number()
      .positive('El tamaño del archivo debe ser positivo')
      .max(500 * 1024 * 1024, 'El archivo no puede exceder 500MB'), // 500MB máximo
    file_type: z.string()
      .min(1, 'El tipo de archivo es requerido')
      .regex(/^[a-zA-Z]+\/[a-zA-Z0-9\-\+\.]+$/, 'Formato de tipo MIME inválido'),
    file_name: z.string()
      .min(1, 'El nombre del archivo es requerido')
      .max(255, 'El nombre del archivo no puede exceder 255 caracteres')
  }),
  params: z.object({
    concursoId: z.string()
      .regex(/^\d+$/, 'ID de concurso debe ser numérico')
      .transform(val => parseInt(val, 10))
  })
});

// Esquema para procesar subida completada
export const processUploadSchema = z.object({
  body: z.object({
    asset_id: z.string()
      .min(1, 'ID del asset de Immich es requerido')
      .uuid('ID del asset debe ser un UUID válido'),
    titulo: z.string()
      .min(1, 'El título es requerido')
      .max(100, 'El título no puede exceder 100 caracteres')
      .trim(),
    tipo_medio: z.enum(['fotografia', 'video', 'audio', 'corto_cine']),
    categoria_id: z.number()
      .int('ID de categoría debe ser un número entero')
      .positive('ID de categoría debe ser positivo'),
    file_size: z.number()
      .positive('El tamaño del archivo debe ser positivo'),
    file_type: z.string()
      .min(1, 'El tipo de archivo es requerido'),
    original_filename: z.string()
      .min(1, 'El nombre original del archivo es requerido')
  }),
  params: z.object({
    concursoId: z.string()
      .regex(/^\d+$/, 'ID de concurso debe ser numérico')
      .transform(val => parseInt(val, 10))
  }),
  headers: z.object({
    'x-upload-token': z.string()
      .min(1, 'Token de subida es requerido')
  })
});

// Esquema para obtener medio por ID
export const getMediaByIdSchema = z.object({
  params: z.object({
    id: z.string()
      .regex(/^\d+$/, 'ID debe ser numérico')
      .transform(val => parseInt(val, 10))
  })
});

// Esquema para obtener medios por usuario
export const getMediaByUserSchema = z.object({
  params: z.object({
    userId: z.string()
      .min(1, 'ID de usuario es requerido')
  }),
  query: z.object({
    page: z.string()
      .regex(/^\d+$/, 'Página debe ser numérica')
      .transform(val => parseInt(val, 10))
      .optional()
      .default('1'),
    limit: z.string()
      .regex(/^\d+$/, 'Límite debe ser numérico')
      .transform(val => parseInt(val, 10))
      .optional()
      .default('20'),
    tipo_medio: z.enum(['fotografia', 'video', 'audio', 'corto_cine'])
      .optional()
  }).optional().default({})
});

// Esquema para obtener medios por concurso
export const getMediaByContestSchema = z.object({
  params: z.object({
    concursoId: z.string()
      .regex(/^\d+$/, 'ID de concurso debe ser numérico')
      .transform(val => parseInt(val, 10))
  }),
  query: z.object({
    page: z.string()
      .regex(/^\d+$/, 'Página debe ser numérica')
      .transform(val => parseInt(val, 10))
      .optional()
      .default('1'),
    limit: z.string()
      .regex(/^\d+$/, 'Límite debe ser numérico')
      .transform(val => parseInt(val, 10))
      .optional()
      .default('20'),
    categoria_id: z.string()
      .regex(/^\d+$/, 'ID de categoría debe ser numérico')
      .transform(val => parseInt(val, 10))
      .optional(),
    tipo_medio: z.enum(['fotografia', 'video', 'audio', 'corto_cine'])
      .optional()
  }).optional().default({})
});

// Esquema para eliminar medio
export const deleteMediaSchema = z.object({
  params: z.object({
    id: z.string()
      .regex(/^\d+$/, 'ID debe ser numérico')
      .transform(val => parseInt(val, 10))
  })
});

// Esquema para actualizar medio
export const updateMediaSchema = z.object({
  params: z.object({
    id: z.string()
      .regex(/^\d+$/, 'ID debe ser numérico')
      .transform(val => parseInt(val, 10))
  }),
  body: z.object({
    titulo: z.string()
      .min(1, 'El título es requerido')
      .max(100, 'El título no puede exceder 100 caracteres')
      .trim()
      .optional()
  })
});

// Tipos derivados de los esquemas
export type GenerateUploadUrlRequest = z.infer<typeof generateUploadUrlSchema>;
export type ProcessUploadRequest = z.infer<typeof processUploadSchema>;
export type GetMediaByIdRequest = z.infer<typeof getMediaByIdSchema>;
export type GetMediaByUserRequest = z.infer<typeof getMediaByUserSchema>;
export type GetMediaByContestRequest = z.infer<typeof getMediaByContestSchema>;
export type DeleteMediaRequest = z.infer<typeof deleteMediaSchema>;
export type UpdateMediaRequest = z.infer<typeof updateMediaSchema>;