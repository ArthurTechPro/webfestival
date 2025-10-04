import { z } from 'zod';

// Esquema para actualización de perfil de usuario
export const updateProfileSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100, 'El nombre no puede exceder 100 caracteres').optional(),
  bio: z.string().max(500, 'La biografía no puede exceder 500 caracteres').optional(),
  picture_url: z.string().url('Debe ser una URL válida').optional()
});

// Esquema para seguir/dejar de seguir usuarios
export const followUserSchema = z.object({
  seguido_id: z.string().uuid('ID de usuario inválido')
});

// Esquema para especialización de jurados
export const juradoEspecializacionSchema = z.object({
  especializaciones: z.array(
    z.enum(['fotografia', 'video', 'audio', 'corto_cine'])
  ).min(1, 'Debe seleccionar al menos una especialización'),
  experiencia_años: z.number().int().min(0, 'La experiencia no puede ser negativa').max(50, 'La experiencia no puede exceder 50 años').optional(),
  certificaciones: z.array(z.string()).optional(),
  portfolio_url: z.string().url('Debe ser una URL válida').optional()
});

// Esquema para actualizar especialización de jurado
export const updateEspecializacionSchema = z.object({
  especializaciones: z.array(
    z.enum(['fotografia', 'video', 'audio', 'corto_cine'])
  ).min(1, 'Debe seleccionar al menos una especialización').optional(),
  experiencia_años: z.number().int().min(0, 'La experiencia no puede ser negativa').max(50, 'La experiencia no puede exceder 50 años').optional(),
  certificaciones: z.array(z.string()).optional(),
  portfolio_url: z.string().url('Debe ser una URL válida').optional()
});

// Esquema para asignación de jurados
export const asignarJuradoSchema = z.object({
  jurado_id: z.string().uuid('ID de jurado inválido'),
  categoria_id: z.number().int().positive('ID de categoría inválido')
});

// Esquema para filtros de búsqueda de usuarios
export const userFiltersSchema = z.object({
  role: z.enum(['PARTICIPANTE', 'JURADO', 'ADMIN', 'CONTENT_ADMIN']).optional(),
  especialización: z.enum(['fotografia', 'video', 'audio', 'corto_cine']).optional(),
  search: z.string().min(1, 'El término de búsqueda debe tener al menos 1 carácter').optional(),
  page: z.number().int().min(1, 'La página debe ser mayor a 0').default(1),
  limit: z.number().int().min(1, 'El límite debe ser mayor a 0').max(100, 'El límite no puede exceder 100').default(20)
});

// Tipos TypeScript derivados de los esquemas
export type UpdateProfileRequest = z.infer<typeof updateProfileSchema>;
export type FollowUserRequest = z.infer<typeof followUserSchema>;
export type JuradoEspecializacionRequest = z.infer<typeof juradoEspecializacionSchema>;
export type UpdateEspecializacionRequest = z.infer<typeof updateEspecializacionSchema>;
export type AsignarJuradoRequest = z.infer<typeof asignarJuradoSchema>;
export type UserFiltersRequest = z.infer<typeof userFiltersSchema>;