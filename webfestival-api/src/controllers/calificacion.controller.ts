import { Request, Response } from 'express';
import { calificacionService } from '../services/calificacion.service';
import { criteriosService } from '../services/criterios.service';
import { AuthenticatedRequest } from '../types';
import { z } from 'zod';

// Esquemas de validación
const CreateCalificacionSchema = z.object({
  medio_id: z.number().int().positive('ID de medio debe ser positivo'),
  comentarios: z.string().max(1000, 'Los comentarios no pueden exceder 1000 caracteres').optional(),
  criterios: z.array(z.object({
    criterio_id: z.number().int().positive('ID de criterio debe ser positivo'),
    puntuacion: z.number().int().min(1, 'La puntuación mínima es 1').max(10, 'La puntuación máxima es 10')
  })).min(1, 'Debe incluir al menos un criterio')
});

const UpdateCalificacionSchema = z.object({
  comentarios: z.string().max(1000, 'Los comentarios no pueden exceder 1000 caracteres').optional(),
  criterios: z.array(z.object({
    criterio_id: z.number().int().positive(),
    puntuacion: z.number().int().min(1).max(10)
  })).optional()
});

// Esquema removido - usando validación manual para mayor flexibilidad

export class CalificacionController {
  /**
   * POST /api/v1/calificaciones
   * Crear una nueva calificación
   */
  async createCalificacion(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const juradoId = req.user!.userId;
      const validatedData = CreateCalificacionSchema.parse(req.body);
      
      const calificacion = await calificacionService.createCalificacion(juradoId, {
        medio_id: validatedData.medio_id,
        comentarios: validatedData.comentarios || undefined,
        criterios: validatedData.criterios
      });
      
      res.status(201).json({
        success: true,
        data: calificacion,
        message: 'Calificación creada exitosamente'
      });
    } catch (error) {
      console.error('Error al crear calificación:', error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: error.errors
        });
        return;
      }

      const statusCode = this.getErrorStatusCode(error instanceof Error ? error.message : 'Error desconocido');
      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  /**
   * PUT /api/v1/calificaciones/:id
   * Actualizar una calificación existente
   */
  async updateCalificacion(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const calificacionId = parseInt(req.params['id'] || '0');
      const juradoId = req.user!.userId;
      
      if (isNaN(calificacionId) || calificacionId <= 0) {
        res.status(400).json({
          success: false,
          message: 'ID de calificación inválido'
        });
        return;
      }

      const validatedData = UpdateCalificacionSchema.parse(req.body);
      
      const calificacion = await calificacionService.updateCalificacion(calificacionId, juradoId, {
        comentarios: validatedData.comentarios || undefined,
        criterios: validatedData.criterios
      });
      
      res.json({
        success: true,
        data: calificacion,
        message: 'Calificación actualizada exitosamente'
      });
    } catch (error) {
      console.error('Error al actualizar calificación:', error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: error.errors
        });
        return;
      }

      const statusCode = this.getErrorStatusCode(error instanceof Error ? error.message : 'Error desconocido');
      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/v1/calificaciones/:id
   * Obtener calificación por ID
   */
  async getCalificacionById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      
      if (isNaN(id) || id <= 0) {
        res.status(400).json({
          success: false,
          message: 'ID de calificación inválido'
        });
        return;
      }

      const calificacion = await calificacionService.getCalificacionById(id);
      
      if (!calificacion) {
        res.status(404).json({
          success: false,
          message: 'Calificación no encontrada'
        });
        return;
      }

      res.json({
        success: true,
        data: calificacion
      });
    } catch (error) {
      console.error('Error al obtener calificación:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/v1/calificaciones
   * Obtener calificaciones con filtros
   */
  async getCalificaciones(req: Request, res: Response): Promise<void> {
    try {
      const filters: any = {};
      
      if (req.query['medio_id']) {
        filters.medio_id = parseInt(req.query['medio_id'] as string);
      }
      if (req.query['concurso_id']) {
        filters.concurso_id = parseInt(req.query['concurso_id'] as string);
      }
      if (req.query['categoria_id']) {
        filters.categoria_id = parseInt(req.query['categoria_id'] as string);
      }
      if (req.query['tipo_medio']) {
        filters.tipo_medio = req.query['tipo_medio'] as any;
      }

      const calificaciones = await calificacionService.getCalificaciones(filters);
      
      res.json({
        success: true,
        data: calificaciones,
        total: calificaciones.length
      });
    } catch (error) {
      console.error('Error al obtener calificaciones:', error);


      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * DELETE /api/v1/calificaciones/:id
   * Eliminar una calificación
   */
  async deleteCalificacion(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const calificacionId = parseInt(req.params['id'] || '0');
      const juradoId = req.user!.userId;
      
      if (isNaN(calificacionId) || calificacionId <= 0) {
        res.status(400).json({
          success: false,
          message: 'ID de calificación inválido'
        });
        return;
      }

      const result = await calificacionService.deleteCalificacion(calificacionId, juradoId);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Error al eliminar calificación:', error);
      
      const statusCode = this.getErrorStatusCode(error instanceof Error ? error.message : 'Error desconocido');
      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/v1/calificaciones/mis-asignaciones
   * Obtener medios asignados al jurado para evaluación
   */
  async getMisAsignaciones(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const juradoId = req.user!.userId;
      const medios = await calificacionService.getMediosAsignados(juradoId);
      
      res.json({
        success: true,
        data: medios,
        total: medios.length
      });
    } catch (error) {
      console.error('Error al obtener asignaciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/v1/calificaciones/criterios/:tipoMedio
   * Obtener criterios aplicables para un tipo de medio
   */
  async getCriteriosParaTipo(req: Request, res: Response): Promise<void> {
    try {
      const tipoMedio = req.params['tipoMedio'] || '';
      
      if (!['fotografia', 'video', 'audio', 'corto_cine'].includes(tipoMedio)) {
        res.status(400).json({
          success: false,
          message: 'Tipo de medio inválido',
          tipos_validos: ['fotografia', 'video', 'audio', 'corto_cine']
        });
        return;
      }

      const criterios = await criteriosService.getCriteriosPorTipoMedio(tipoMedio as any);
      
      res.json({
        success: true,
        data: criterios,
        tipo_medio: tipoMedio,
        total: criterios.length
      });
    } catch (error) {
      console.error('Error al obtener criterios:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/v1/calificaciones/progreso/:concursoId
   * Obtener progreso de evaluaciones de un concurso
   */
  async getProgresoEvaluacion(req: Request, res: Response): Promise<void> {
    try {
      const concursoId = parseInt(req.params['concursoId'] || '0');
      
      if (isNaN(concursoId) || concursoId <= 0) {
        res.status(400).json({
          success: false,
          message: 'ID de concurso inválido'
        });
        return;
      }

      const progreso = await calificacionService.getProgresoEvaluacion(concursoId);
      
      res.json({
        success: true,
        data: progreso
      });
    } catch (error) {
      console.error('Error al obtener progreso:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/v1/calificaciones/resultados/:concursoId
   * Calcular y obtener resultados finales de un concurso
   */
  async getResultadosFinales(req: Request, res: Response): Promise<void> {
    try {
      const concursoId = parseInt(req.params['concursoId'] || '0');
      
      if (isNaN(concursoId) || concursoId <= 0) {
        res.status(400).json({
          success: false,
          message: 'ID de concurso inválido'
        });
        return;
      }

      const resultados = await calificacionService.calcularResultadosFinales(concursoId);
      
      res.json({
        success: true,
        data: resultados,
        total: resultados.length
      });
    } catch (error) {
      console.error('Error al calcular resultados:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/v1/calificaciones/estadisticas
   * Obtener estadísticas generales de calificaciones
   */
  async getEstadisticas(_req: Request, res: Response): Promise<void> {
    try {
      const estadisticas = await calificacionService.getEstadisticasCalificaciones();
      
      res.json({
        success: true,
        data: estadisticas
      });
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Determina el código de estado HTTP basado en el mensaje de error
   */
  private getErrorStatusCode(errorMessage: string): number {
    if (errorMessage.includes('no encontrado') || 
        errorMessage.includes('no encontrada')) return 404;
    if (errorMessage.includes('no tienes permisos') || 
        errorMessage.includes('no autorizado')) return 403;
    if (errorMessage.includes('ya has calificado') ||
        errorMessage.includes('ya existe') ||
        errorMessage.includes('finalizado') ||
        errorMessage.includes('inválido') ||
        errorMessage.includes('faltan') ||
        errorMessage.includes('debe estar entre') ||
        errorMessage.includes('no aplicables')) return 400;
    
    return 500;
  }
}

export const calificacionController = new CalificacionController();