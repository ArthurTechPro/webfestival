import { Request, Response } from 'express';
import { juradoAsignacionService } from '../services/jurado-asignacion.service';
import { z } from 'zod';

// Esquemas de validación
const CreateAsignacionSchema = z.object({
  usuario_id: z.string().min(1, 'ID de usuario es requerido'),
  categoria_id: z.number().int().positive('ID de categoría debe ser positivo')
});

// Esquema removido - usando validación manual para mayor flexibilidad

export class JuradoAsignacionController {
  /**
   * POST /api/v1/jurado-asignaciones
   * Crear una nueva asignación de jurado a categoría
   */
  async createAsignacion(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = CreateAsignacionSchema.parse(req.body);
      
      const asignacion = await juradoAsignacionService.createAsignacion(validatedData);
      
      res.status(201).json({
        success: true,
        data: asignacion,
        message: 'Asignación creada exitosamente'
      });
    } catch (error) {
      console.error('Error al crear asignación:', error);
      
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
   * GET /api/v1/jurado-asignaciones
   * Obtener asignaciones con filtros
   */
  async getAsignaciones(req: Request, res: Response): Promise<void> {
    try {
      const filters: any = {};
      
      if (req.query['usuario_id']) {
        filters.usuario_id = req.query['usuario_id'] as string;
      }
      if (req.query['categoria_id']) {
        filters.categoria_id = parseInt(req.query['categoria_id'] as string);
      }
      if (req.query['concurso_id']) {
        filters.concurso_id = parseInt(req.query['concurso_id'] as string);
      }

      const asignaciones = await juradoAsignacionService.getAsignaciones(filters);
      
      res.json({
        success: true,
        data: asignaciones,
        total: asignaciones.length
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
   * GET /api/v1/jurado-asignaciones/jurado/:usuarioId
   * Obtener asignaciones de un jurado específico
   */
  async getAsignacionesJurado(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.params['usuarioId'];
      
      if (!usuarioId) {
        res.status(400).json({
          success: false,
          message: 'ID de usuario es requerido'
        });
        return;
      }

      const asignaciones = await juradoAsignacionService.getAsignacionesJurado(usuarioId);
      
      res.json({
        success: true,
        data: asignaciones,
        total: asignaciones.length
      });
    } catch (error) {
      console.error('Error al obtener asignaciones del jurado:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/v1/jurado-asignaciones/categoria/:categoriaId
   * Obtener jurados asignados a una categoría
   */
  async getJuradosCategoria(req: Request, res: Response): Promise<void> {
    try {
      const categoriaId = parseInt(req.params['categoriaId'] || '0');
      
      if (isNaN(categoriaId) || categoriaId <= 0) {
        res.status(400).json({
          success: false,
          message: 'ID de categoría inválido'
        });
        return;
      }

      const jurados = await juradoAsignacionService.getJuradosCategoria(categoriaId);
      
      res.json({
        success: true,
        data: jurados,
        total: jurados.length
      });
    } catch (error) {
      console.error('Error al obtener jurados de la categoría:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/v1/jurado-asignaciones/concurso/:concursoId
   * Obtener jurados asignados a un concurso
   */
  async getJuradosConcurso(req: Request, res: Response): Promise<void> {
    try {
      const concursoId = parseInt(req.params['concursoId'] || '0');
      
      if (isNaN(concursoId) || concursoId <= 0) {
        res.status(400).json({
          success: false,
          message: 'ID de concurso inválido'
        });
        return;
      }

      const jurados = await juradoAsignacionService.getJuradosConcurso(concursoId);
      
      res.json({
        success: true,
        data: jurados,
        total: jurados.length
      });
    } catch (error) {
      console.error('Error al obtener jurados del concurso:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * DELETE /api/v1/jurado-asignaciones/:usuarioId/:categoriaId
   * Eliminar una asignación específica
   */
  async deleteAsignacion(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.params['usuarioId'];
      const categoriaId = parseInt(req.params['categoriaId'] || '0');
      
      if (!usuarioId) {
        res.status(400).json({
          success: false,
          message: 'ID de usuario es requerido'
        });
        return;
      }

      if (isNaN(categoriaId) || categoriaId <= 0) {
        res.status(400).json({
          success: false,
          message: 'ID de categoría inválido'
        });
        return;
      }

      const result = await juradoAsignacionService.deleteAsignacion(usuarioId, categoriaId);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Error al eliminar asignación:', error);
      
      const statusCode = this.getErrorStatusCode(error instanceof Error ? error.message : 'Error desconocido');
      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/v1/jurado-asignaciones/sugerencias/:concursoId
   * Obtener sugerencias inteligentes de asignación para un concurso
   */
  async getSugerenciasInteligentes(req: Request, res: Response): Promise<void> {
    try {
      const concursoId = parseInt(req.params['concursoId'] || '0');
      
      if (isNaN(concursoId) || concursoId <= 0) {
        res.status(400).json({
          success: false,
          message: 'ID de concurso inválido'
        });
        return;
      }

      const sugerencias = await juradoAsignacionService.sugerirAsignacionesInteligentes(concursoId);
      
      res.json({
        success: true,
        data: sugerencias,
        total: sugerencias.length
      });
    } catch (error) {
      console.error('Error al obtener sugerencias:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * POST /api/v1/jurado-asignaciones/asignar-automaticamente/:concursoId
   * Asignar jurados automáticamente basado en especialización
   */
  async asignarAutomaticamente(req: Request, res: Response): Promise<void> {
    try {
      const concursoId = parseInt(req.params['concursoId'] || '0');
      
      if (isNaN(concursoId) || concursoId <= 0) {
        res.status(400).json({
          success: false,
          message: 'ID de concurso inválido'
        });
        return;
      }

      const resultado = await juradoAsignacionService.asignarJuradosAutomaticamente(concursoId);
      
      res.json({
        success: true,
        data: resultado,
        message: `Se crearon ${resultado.asignaciones_creadas} asignaciones automáticamente`
      });
    } catch (error) {
      console.error('Error al asignar automáticamente:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/v1/jurado-asignaciones/cobertura/:concursoId
   * Validar cobertura de jurados para un concurso
   */
  async validarCobertura(req: Request, res: Response): Promise<void> {
    try {
      const concursoId = parseInt(req.params['concursoId'] || '0');
      
      if (isNaN(concursoId) || concursoId <= 0) {
        res.status(400).json({
          success: false,
          message: 'ID de concurso inválido'
        });
        return;
      }

      const cobertura = await juradoAsignacionService.validarCoberturaJurados(concursoId);
      
      res.json({
        success: true,
        data: cobertura
      });
    } catch (error) {
      console.error('Error al validar cobertura:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/v1/jurado-asignaciones/estadisticas
   * Obtener estadísticas de asignaciones
   */
  async getEstadisticas(_req: Request, res: Response): Promise<void> {
    try {
      const estadisticas = await juradoAsignacionService.getEstadisticasAsignaciones();
      
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
    if (errorMessage.includes('debe tener rol') || 
        errorMessage.includes('no tienes permisos')) return 403;
    if (errorMessage.includes('ya está asignado') ||
        errorMessage.includes('ya ha calificado') ||
        errorMessage.includes('finalizados') ||
        errorMessage.includes('inválido')) return 400;
    
    return 500;
  }
}

export const juradoAsignacionController = new JuradoAsignacionController();