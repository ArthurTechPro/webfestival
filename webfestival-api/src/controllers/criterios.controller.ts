import { Request, Response } from 'express';
import { TipoMedio } from '@prisma/client';
import { criteriosService } from '../services/criterios.service';
import { z } from 'zod';

// Esquemas de validación con Zod
const CreateCriterioSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre no puede exceder 100 caracteres'),
  descripcion: z.string().optional(),
  tipo_medio: z.nativeEnum(TipoMedio).optional(),
  peso: z.number().min(0.1).max(10).optional(),
  orden: z.number().int().min(0).optional()
});

const UpdateCriterioSchema = z.object({
  nombre: z.string().min(1).max(100).optional(),
  descripcion: z.string().optional(),
  tipo_medio: z.nativeEnum(TipoMedio).optional(),
  peso: z.number().min(0.1).max(10).optional(),
  orden: z.number().int().min(0).optional(),
  activo: z.boolean().optional()
});

const CriterioFiltersSchema = z.object({
  tipo_medio: z.nativeEnum(TipoMedio).optional(),
  activo: z.boolean().optional(),
  incluir_universales: z.boolean().optional()
});

export class CriteriosController {
  /**
   * GET /api/criterios
   * Obtiene todos los criterios con filtros opcionales
   */
  async getCriterios(req: Request, res: Response): Promise<void> {
    try {
      const validatedFilters = CriterioFiltersSchema.parse(req.query);

      // Convertir filtros para el servicio
      const filters: any = {};
      if (validatedFilters.tipo_medio !== undefined) filters.tipo_medio = validatedFilters.tipo_medio;
      if (validatedFilters.activo !== undefined) filters.activo = validatedFilters.activo;
      if (validatedFilters.incluir_universales !== undefined) filters.incluir_universales = validatedFilters.incluir_universales;

      const criterios = await criteriosService.getCriterios(filters);

      res.json({
        success: true,
        data: criterios,
        total: criterios.length
      });
    } catch (error) {
      console.error('Error al obtener criterios:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * GET /api/criterios/tipo/:tipoMedio
   * Obtiene criterios específicos para un tipo de medio (incluye universales)
   */
  async getCriteriosPorTipo(req: Request, res: Response): Promise<void> {
    try {
      const tipoMedio = req.params['tipoMedio'];

      if (!tipoMedio) {
        res.status(400).json({
          success: false,
          message: 'Tipo de medio requerido'
        });
        return;
      }

      // Validar que el tipo de medio sea válido
      if (!Object.values(TipoMedio).includes(tipoMedio as TipoMedio)) {
        res.status(400).json({
          success: false,
          message: 'Tipo de medio inválido',
          tipos_validos: Object.values(TipoMedio)
        });
        return;
      }

      const criterios = await criteriosService.getCriteriosPorTipoMedio(tipoMedio as TipoMedio);

      res.json({
        success: true,
        data: criterios,
        tipo_medio: tipoMedio,
        total: criterios.length
      });
    } catch (error) {
      console.error('Error al obtener criterios por tipo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * GET /api/criterios/universales
   * Obtiene solo criterios universales
   */
  async getCriteriosUniversales(_req: Request, res: Response): Promise<void> {
    try {
      const criterios = await criteriosService.getCriteriosUniversales();

      res.json({
        success: true,
        data: criterios,
        total: criterios.length
      });
    } catch (error) {
      console.error('Error al obtener criterios universales:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * GET /api/criterios/:id
   * Obtiene un criterio específico por ID
   */
  async getCriterioById(req: Request, res: Response): Promise<void> {
    try {
      const idParam = req.params['id'];

      if (!idParam) {
        res.status(400).json({
          success: false,
          message: 'ID de criterio requerido'
        });
        return;
      }

      const id = parseInt(idParam);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID de criterio inválido'
        });
        return;
      }

      const criterio = await criteriosService.getCriterioById(id);

      if (!criterio) {
        res.status(404).json({
          success: false,
          message: 'Criterio no encontrado'
        });
        return;
      }

      res.json({
        success: true,
        data: criterio
      });
    } catch (error) {
      console.error('Error al obtener criterio por ID:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * POST /api/criterios
   * Crea un nuevo criterio
   */
  async createCriterio(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = CreateCriterioSchema.parse(req.body);

      // Convertir datos para el servicio
      const data: any = {
        nombre: validatedData.nombre,
        peso: validatedData.peso || 1.0,
        orden: validatedData.orden || 0
      };

      if (validatedData.descripcion !== undefined) {
        data.descripcion = validatedData.descripcion;
      }

      if (validatedData.tipo_medio !== undefined) {
        data.tipo_medio = validatedData.tipo_medio;
      }

      const criterio = await criteriosService.createCriterio(data);

      res.status(201).json({
        success: true,
        data: criterio,
        message: 'Criterio creado exitosamente'
      });
    } catch (error) {
      console.error('Error al crear criterio:', error);

      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: error.errors
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * PUT /api/criterios/:id
   * Actualiza un criterio existente
   */
  async updateCriterio(req: Request, res: Response): Promise<void> {
    try {
      const idParam = req.params['id'];

      if (!idParam) {
        res.status(400).json({
          success: false,
          message: 'ID de criterio requerido'
        });
        return;
      }

      const id = parseInt(idParam);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID de criterio inválido'
        });
        return;
      }

      const validatedData = UpdateCriterioSchema.parse(req.body);

      // Convertir datos para el servicio, solo incluir campos definidos
      const data: any = {};
      if (validatedData.nombre !== undefined) data.nombre = validatedData.nombre;
      if (validatedData.descripcion !== undefined) data.descripcion = validatedData.descripcion;
      if (validatedData.tipo_medio !== undefined) data.tipo_medio = validatedData.tipo_medio;
      if (validatedData.peso !== undefined) data.peso = validatedData.peso;
      if (validatedData.orden !== undefined) data.orden = validatedData.orden;
      if (validatedData.activo !== undefined) data.activo = validatedData.activo;

      const criterio = await criteriosService.updateCriterio(id, data);

      res.json({
        success: true,
        data: criterio,
        message: 'Criterio actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error al actualizar criterio:', error);

      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: error.errors
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * DELETE /api/criterios/:id
   * Elimina un criterio (soft delete)
   */
  async deleteCriterio(req: Request, res: Response): Promise<void> {
    try {
      const idParam = req.params['id'];

      if (!idParam) {
        res.status(400).json({
          success: false,
          message: 'ID de criterio requerido'
        });
        return;
      }

      const id = parseInt(idParam);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID de criterio inválido'
        });
        return;
      }

      const criterio = await criteriosService.deleteCriterio(id);

      res.json({
        success: true,
        data: criterio,
        message: 'Criterio desactivado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar criterio:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * POST /api/criterios/reordenar
   * Reordena criterios de un tipo específico
   */
  async reordenarCriterios(req: Request, res: Response): Promise<void> {
    try {
      const { tipo_medio, criterios_ordenados } = req.body;

      if (!Array.isArray(criterios_ordenados)) {
        res.status(400).json({
          success: false,
          message: 'criterios_ordenados debe ser un array de IDs'
        });
        return;
      }

      const tipoMedioValue = tipo_medio === 'universal' ? null : tipo_medio as TipoMedio;

      await criteriosService.reordenarCriterios(tipoMedioValue, criterios_ordenados);

      res.json({
        success: true,
        message: 'Criterios reordenados exitosamente'
      });
    } catch (error) {
      console.error('Error al reordenar criterios:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * GET /api/criterios/estadisticas
   * Obtiene estadísticas de uso de criterios
   */
  async getEstadisticas(_req: Request, res: Response): Promise<void> {
    try {
      const estadisticas = await criteriosService.getEstadisticasCriterios();

      res.json({
        success: true,
        data: estadisticas
      });
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * GET /api/criterios/validar/:tipoMedio
   * Valida que existan criterios suficientes para un tipo de medio
   */
  async validarCriterios(req: Request, res: Response): Promise<void> {
    try {
      const tipoMedio = req.params['tipoMedio'];

      if (!tipoMedio) {
        res.status(400).json({
          success: false,
          message: 'Tipo de medio requerido'
        });
        return;
      }

      if (!Object.values(TipoMedio).includes(tipoMedio as TipoMedio)) {
        res.status(400).json({
          success: false,
          message: 'Tipo de medio inválido',
          tipos_validos: Object.values(TipoMedio)
        });
        return;
      }

      const esValido = await criteriosService.validarCriteriosCompletos(tipoMedio as TipoMedio);
      const pesoTotal = await criteriosService.getPesoTotalCriterios(tipoMedio as TipoMedio);

      res.json({
        success: true,
        data: {
          tipo_medio: tipoMedio,
          criterios_suficientes: esValido,
          peso_total: pesoTotal
        }
      });
    } catch (error) {
      console.error('Error al validar criterios:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
}

export const criteriosController = new CriteriosController();