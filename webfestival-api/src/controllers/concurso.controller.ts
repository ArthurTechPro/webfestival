import { Request, Response } from 'express';
import { concursoService } from '../services/concurso.service';
import { 
  createConcursoSchema, 
  updateConcursoSchema, 
  inscripcionConcursoSchema,
  concursoFiltersSchema 
} from '../schemas/concurso.schemas';
import { AuthenticatedRequest } from '../types';

export class ConcursoController {
  // Crear un nuevo concurso (solo ADMIN)
  async createConcurso(req: AuthenticatedRequest, res: Response) {
    try {
      const validatedData = createConcursoSchema.parse(req.body);
      const concurso = await concursoService.createConcurso(validatedData);
      
      res.status(201).json({
        success: true,
        message: 'Concurso creado exitosamente',
        data: concurso
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al crear el concurso',
        errors: error.errors || null
      });
    }
  }

  // Obtener todos los concursos con filtros (ADMIN)
  async getConcursos(req: Request, res: Response) {
    try {
      const filters = concursoFiltersSchema.parse({
        status: req.query['status'],
        page: req.query['page'] ? parseInt(req.query['page'] as string) : 1,
        limit: req.query['limit'] ? parseInt(req.query['limit'] as string) : 10,
        search: req.query['search']
      });

      const result = await concursoService.getConcursos(filters);
      
      res.json({
        success: true,
        data: result.concursos,
        pagination: result.pagination
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al obtener los concursos',
        errors: error.errors || null
      });
    }
  }

  // Obtener concursos activos (público)
  async getConcursosActivos(_req: Request, res: Response) {
    try {
      const concursos = await concursoService.getConcursosActivos();
      
      res.json({
        success: true,
        data: concursos
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener los concursos activos'
      });
    }
  }

  // Obtener concursos finalizados (público)
  async getConcursosFinalizados(req: Request, res: Response) {
    try {
      const page = req.query['page'] ? parseInt(req.query['page'] as string) : 1;
      const limit = req.query['limit'] ? parseInt(req.query['limit'] as string) : 10;

      const result = await concursoService.getConcursosFinalizados(page, limit);
      
      res.json({
        success: true,
        data: result.concursos,
        pagination: result.pagination
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener los concursos finalizados'
      });
    }
  }

  // Obtener un concurso por ID
  async getConcursoById(req: Request, res: Response) {
    try {
      const idParam = req.params['id'];
      if (!idParam) {
        return res.status(400).json({
          success: false,
          message: 'ID de concurso requerido'
        });
      }

      const id = parseInt(idParam);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID de concurso inválido'
        });
      }

      const concurso = await concursoService.getConcursoById(id);
      
      return res.json({
        success: true,
        data: concurso
      });
    } catch (error: any) {
      const statusCode = error.message === 'Concurso no encontrado' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al obtener el concurso'
      });
    }
  }

  // Actualizar un concurso (solo ADMIN)
  async updateConcurso(req: AuthenticatedRequest, res: Response) {
    try {
      const idParam = req.params['id'];
      if (!idParam) {
        return res.status(400).json({
          success: false,
          message: 'ID de concurso requerido'
        });
      }

      const id = parseInt(idParam);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID de concurso inválido'
        });
      }

      const validatedData = updateConcursoSchema.parse(req.body);
      const concurso = await concursoService.updateConcurso(id, validatedData);
      
      return res.json({
        success: true,
        message: 'Concurso actualizado exitosamente',
        data: concurso
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error al actualizar el concurso',
        errors: error.errors || null
      });
    }
  }

  // Eliminar un concurso (solo ADMIN)
  async deleteConcurso(req: AuthenticatedRequest, res: Response) {
    try {
      const idParam = req.params['id'];
      if (!idParam) {
        return res.status(400).json({
          success: false,
          message: 'ID de concurso requerido'
        });
      }

      const id = parseInt(idParam);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID de concurso inválido'
        });
      }

      const result = await concursoService.deleteConcurso(id);
      
      return res.json({
        success: true,
        message: result.message
      });
    } catch (error: any) {
      const statusCode = error.message === 'Concurso no encontrado' ? 404 : 400;
      return res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al eliminar el concurso'
      });
    }
  }

  // Inscribirse a un concurso
  async inscribirseAConcurso(req: AuthenticatedRequest, res: Response) {
    try {
      const validatedData = inscripcionConcursoSchema.parse(req.body);
      const usuarioId = req.user!.userId;
      
      const inscripcion = await concursoService.inscribirUsuario(usuarioId, validatedData.concurso_id);
      
      res.status(201).json({
        success: true,
        message: 'Inscripción realizada exitosamente',
        data: inscripcion
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al inscribirse al concurso',
        errors: error.errors || null
      });
    }
  }

  // Cancelar inscripción a un concurso
  async cancelarInscripcion(req: AuthenticatedRequest, res: Response) {
    try {
      const concursoIdParam = req.params['concursoId'];
      if (!concursoIdParam) {
        return res.status(400).json({
          success: false,
          message: 'ID de concurso requerido'
        });
      }

      const concursoId = parseInt(concursoIdParam);
      if (isNaN(concursoId)) {
        return res.status(400).json({
          success: false,
          message: 'ID de concurso inválido'
        });
      }

      const usuarioId = req.user!.userId;
      const result = await concursoService.cancelarInscripcion(usuarioId, concursoId);
      
      return res.json({
        success: true,
        message: result.message
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error al cancelar la inscripción'
      });
    }
  }

  // Obtener inscripciones del usuario autenticado
  async getMisInscripciones(req: AuthenticatedRequest, res: Response) {
    try {
      const usuarioId = req.user!.userId;
      const inscripciones = await concursoService.getInscripcionesUsuario(usuarioId);
      
      res.json({
        success: true,
        data: inscripciones
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener las inscripciones'
      });
    }
  }

  // Verificar si el usuario está inscrito en un concurso
  async verificarInscripcion(req: AuthenticatedRequest, res: Response) {
    try {
      const concursoIdParam = req.params['concursoId'];
      if (!concursoIdParam) {
        return res.status(400).json({
          success: false,
          message: 'ID de concurso requerido'
        });
      }

      const concursoId = parseInt(concursoIdParam);
      if (isNaN(concursoId)) {
        return res.status(400).json({
          success: false,
          message: 'ID de concurso inválido'
        });
      }

      const usuarioId = req.user!.userId;
      const estaInscrito = await concursoService.verificarInscripcion(usuarioId, concursoId);
      
      return res.json({
        success: true,
        data: {
          inscrito: estaInscrito
        }
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al verificar la inscripción'
      });
    }
  }
}

export const concursoController = new ConcursoController();