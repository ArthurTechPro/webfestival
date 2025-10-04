import { describe, it, expect } from '@jest/globals';
import { 
  createConcursoSchema, 
  updateConcursoSchema, 
  inscripcionConcursoSchema,
  concursoFiltersSchema 
} from '../src/schemas/concurso.schemas';

describe('Concurso Schemas', () => {
  describe('createConcursoSchema', () => {
    it('debería validar un concurso válido', () => {
      const validConcurso = {
        titulo: 'Concurso de Fotografía',
        descripcion: 'Un concurso de fotografía increíble',
        reglas: 'Reglas del concurso',
        fecha_inicio: new Date(Date.now() + 86400000).toISOString(), // Mañana
        fecha_final: new Date(Date.now() + 7 * 86400000).toISOString(), // En una semana
        max_envios: 3,
        tamano_max_mb: 10
      };

      const result = createConcursoSchema.safeParse(validConcurso);
      expect(result.success).toBe(true);
    });

    it('debería fallar si falta el título', () => {
      const invalidConcurso = {
        descripcion: 'Un concurso sin título',
        fecha_inicio: new Date(Date.now() + 86400000).toISOString(),
        fecha_final: new Date(Date.now() + 7 * 86400000).toISOString(),
        max_envios: 3,
        tamano_max_mb: 10
      };

      const result = createConcursoSchema.safeParse(invalidConcurso);
      expect(result.success).toBe(false);
    });

    it('debería fallar si la fecha final es anterior a la fecha de inicio', () => {
      const invalidConcurso = {
        titulo: 'Concurso Inválido',
        descripcion: 'Concurso con fechas inválidas',
        fecha_inicio: new Date(Date.now() + 7 * 86400000).toISOString(), // En una semana
        fecha_final: new Date(Date.now() + 86400000).toISOString(), // Mañana
        max_envios: 3,
        tamano_max_mb: 10
      };

      const result = createConcursoSchema.safeParse(invalidConcurso);
      expect(result.success).toBe(false);
    });

    it('debería usar valores por defecto para max_envios y tamano_max_mb', () => {
      const concursoSinDefaults = {
        titulo: 'Concurso Sin Defaults',
        descripcion: 'Concurso que usa valores por defecto',
        fecha_inicio: new Date(Date.now() + 86400000).toISOString(),
        fecha_final: new Date(Date.now() + 7 * 86400000).toISOString()
      };

      const result = createConcursoSchema.safeParse(concursoSinDefaults);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.max_envios).toBe(3);
        expect(result.data.tamano_max_mb).toBe(10);
      }
    });
  });

  describe('updateConcursoSchema', () => {
    it('debería validar una actualización válida', () => {
      const validUpdate = {
        titulo: 'Título Actualizado',
        status: 'ACTIVO' as const
      };

      const result = updateConcursoSchema.safeParse(validUpdate);
      expect(result.success).toBe(true);
    });

    it('debería permitir actualizaciones parciales', () => {
      const partialUpdate = {
        titulo: 'Solo título'
      };

      const result = updateConcursoSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
    });

    it('debería fallar con un status inválido', () => {
      const invalidUpdate = {
        status: 'ESTADO_INVALIDO'
      };

      const result = updateConcursoSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
    });
  });

  describe('inscripcionConcursoSchema', () => {
    it('debería validar una inscripción válida', () => {
      const validInscripcion = {
        concurso_id: 1
      };

      const result = inscripcionConcursoSchema.safeParse(validInscripcion);
      expect(result.success).toBe(true);
    });

    it('debería fallar con un ID inválido', () => {
      const invalidInscripcion = {
        concurso_id: -1
      };

      const result = inscripcionConcursoSchema.safeParse(invalidInscripcion);
      expect(result.success).toBe(false);
    });
  });

  describe('concursoFiltersSchema', () => {
    it('debería validar filtros válidos', () => {
      const validFilters = {
        status: 'ACTIVO' as const,
        page: 1,
        limit: 10,
        search: 'fotografía'
      };

      const result = concursoFiltersSchema.safeParse(validFilters);
      expect(result.success).toBe(true);
    });

    it('debería usar valores por defecto', () => {
      const emptyFilters = {};

      const result = concursoFiltersSchema.safeParse(emptyFilters);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(10);
      }
    });

    it('debería fallar con un status inválido', () => {
      const invalidFilters = {
        status: 'ESTADO_INVALIDO'
      };

      const result = concursoFiltersSchema.safeParse(invalidFilters);
      expect(result.success).toBe(false);
    });
  });
});