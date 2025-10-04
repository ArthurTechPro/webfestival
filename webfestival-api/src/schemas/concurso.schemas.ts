import { z } from 'zod';

// Esquema para crear un concurso
export const createConcursoSchema = z.object({
  titulo: z.string().min(1, 'El título es requerido').max(200, 'El título no puede exceder 200 caracteres'),
  descripcion: z.string().min(1, 'La descripción es requerida').max(2000, 'La descripción no puede exceder 2000 caracteres'),
  reglas: z.string().optional(),
  fecha_inicio: z.string().datetime('Fecha de inicio debe ser una fecha válida'),
  fecha_final: z.string().datetime('Fecha final debe ser una fecha válida'),
  imagen_url: z.string().url('URL de imagen inválida').optional(),
  max_envios: z.number().int().min(1).max(10).default(3),
  tamano_max_mb: z.number().int().min(1).max(100).default(10),
}).refine((data) => {
  const fechaInicio = new Date(data.fecha_inicio);
  const fechaFinal = new Date(data.fecha_final);
  return fechaFinal > fechaInicio;
}, {
  message: 'La fecha final debe ser posterior a la fecha de inicio',
  path: ['fecha_final']
});

// Esquema para actualizar un concurso
export const updateConcursoSchema = z.object({
  titulo: z.string().min(1).max(200).optional(),
  descripcion: z.string().min(1).max(2000).optional(),
  reglas: z.string().optional(),
  fecha_inicio: z.string().datetime().optional(),
  fecha_final: z.string().datetime().optional(),
  status: z.enum(['PROXIMAMENTE', 'ACTIVO', 'CALIFICACION', 'FINALIZADO']).optional(),
  imagen_url: z.string().url().optional(),
  max_envios: z.number().int().min(1).max(10).optional(),
  tamano_max_mb: z.number().int().min(1).max(100).optional(),
}).refine((data) => {
  if (data.fecha_inicio && data.fecha_final) {
    const fechaInicio = new Date(data.fecha_inicio);
    const fechaFinal = new Date(data.fecha_final);
    return fechaFinal > fechaInicio;
  }
  return true;
}, {
  message: 'La fecha final debe ser posterior a la fecha de inicio',
  path: ['fecha_final']
});

// Esquema para inscripción a concurso
export const inscripcionConcursoSchema = z.object({
  concurso_id: z.number().int().positive('ID de concurso debe ser un número positivo'),
});

// Esquema para filtros de concursos
export const concursoFiltersSchema = z.object({
  status: z.enum(['PROXIMAMENTE', 'ACTIVO', 'CALIFICACION', 'FINALIZADO']).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
});

// Tipos TypeScript derivados de los esquemas
export type CreateConcursoDto = z.infer<typeof createConcursoSchema>;
export type UpdateConcursoDto = z.infer<typeof updateConcursoSchema>;
export type InscripcionConcursoDto = z.infer<typeof inscripcionConcursoSchema>;
export type ConcursoFilters = z.infer<typeof concursoFiltersSchema>;