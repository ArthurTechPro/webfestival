import { Request, Response, NextFunction } from 'express';
import { userService } from '@/services/user.service';
import { 
  updateProfileSchema,
  followUserSchema,
  juradoEspecializacionSchema,
  updateEspecializacionSchema,
  asignarJuradoSchema,
  userFiltersSchema,
  UpdateProfileRequest,
  FollowUserRequest,
  JuradoEspecializacionRequest,
  UpdateEspecializacionRequest,
  AsignarJuradoRequest,
  UserFiltersRequest
} from '@/schemas/user.schemas';
import { ApiResponse, ApiError } from '@/types';

export class UserController {
  /**
   * Obtener perfil público de usuario
   * GET /api/v1/users/:id/profile
   */
  async getUserProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        const error = new Error('ID de usuario requerido') as ApiError;
        error.status = 400;
        throw error;
      }

      const currentUserId = req.user?.userId;
      const userProfile = await userService.getUserProfile(id, currentUserId);

      if (!userProfile) {
        const error = new Error('Usuario no encontrado') as ApiError;
        error.status = 404;
        throw error;
      }

      const response: ApiResponse = {
        success: true,
        data: { user: userProfile },
        message: 'Perfil de usuario obtenido exitosamente'
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualizar perfil del usuario actual
   * PUT /api/v1/users/profile
   */
  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        const error = new Error('Usuario no autenticado') as ApiError;
        error.status = 401;
        throw error;
      }

      const validatedData = updateProfileSchema.parse(req.body) as UpdateProfileRequest;
      const updatedUser = await userService.updateProfile(req.user.userId, validatedData);

      const response: ApiResponse = {
        success: true,
        data: { user: updatedUser },
        message: 'Perfil actualizado exitosamente'
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Seguir a un usuario
   * POST /api/v1/users/follow
   */
  async followUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        const error = new Error('Usuario no autenticado') as ApiError;
        error.status = 401;
        throw error;
      }

      const validatedData = followUserSchema.parse(req.body) as FollowUserRequest;
      const seguimiento = await userService.followUser(req.user.userId, validatedData.seguido_id);

      const response: ApiResponse = {
        success: true,
        data: { seguimiento },
        message: 'Usuario seguido exitosamente'
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Dejar de seguir a un usuario
   * DELETE /api/v1/users/follow/:id
   */
  async unfollowUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        const error = new Error('Usuario no autenticado') as ApiError;
        error.status = 401;
        throw error;
      }

      const { id: seguidoId } = req.params;
      
      if (!seguidoId) {
        const error = new Error('ID de usuario requerido') as ApiError;
        error.status = 400;
        throw error;
      }

      await userService.unfollowUser(req.user.userId, seguidoId);

      const response: ApiResponse = {
        success: true,
        message: 'Dejaste de seguir al usuario exitosamente'
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener usuarios seguidos
   * GET /api/v1/users/following
   */
  async getFollowing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        const error = new Error('Usuario no autenticado') as ApiError;
        error.status = 401;
        throw error;
      }

      const page = parseInt(req.query['page'] as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 20;

      const result = await userService.getFollowing(req.user.userId, page, limit);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Usuarios seguidos obtenidos exitosamente'
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener seguidores
   * GET /api/v1/users/followers
   */
  async getFollowers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        const error = new Error('Usuario no autenticado') as ApiError;
        error.status = 401;
        throw error;
      }

      const page = parseInt(req.query['page'] as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 20;

      const result = await userService.getFollowers(req.user.userId, page, limit);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Seguidores obtenidos exitosamente'
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Buscar usuarios
   * GET /api/v1/users/search
   */
  async searchUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = userFiltersSchema.parse(req.query) as UserFiltersRequest;
      const currentUserId = req.user?.userId;

      const result = await userService.searchUsers(filters, currentUserId);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Búsqueda de usuarios completada exitosamente'
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Crear especialización de jurado
   * POST /api/v1/users/jurado/especializacion
   */
  async createJuradoEspecializacion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        const error = new Error('Usuario no autenticado') as ApiError;
        error.status = 401;
        throw error;
      }

      const validatedData = juradoEspecializacionSchema.parse(req.body) as JuradoEspecializacionRequest;
      const especializaciones = await userService.createJuradoEspecializacion(req.user.userId, validatedData);

      const response: ApiResponse = {
        success: true,
        data: { especializaciones },
        message: 'Especializaciones de jurado creadas exitosamente'
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualizar especialización de jurado
   * PUT /api/v1/users/jurado/especializacion
   */
  async updateJuradoEspecializacion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        const error = new Error('Usuario no autenticado') as ApiError;
        error.status = 401;
        throw error;
      }

      const validatedData = updateEspecializacionSchema.parse(req.body) as UpdateEspecializacionRequest;
      const especializaciones = await userService.updateJuradoEspecializacion(req.user.userId, validatedData);

      const response: ApiResponse = {
        success: true,
        data: { especializaciones },
        message: 'Especializaciones de jurado actualizadas exitosamente'
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener jurados especializados por tipo de medio
   * GET /api/v1/users/jurados/:tipoMedio
   */
  async getJuradosEspecializados(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tipoMedio } = req.params;

      if (!tipoMedio) {
        const error = new Error('Tipo de medio requerido') as ApiError;
        error.status = 400;
        throw error;
      }

      // Validar tipo de medio
      const tiposValidos = ['fotografia', 'video', 'audio', 'corto_cine'];
      if (!tiposValidos.includes(tipoMedio)) {
        const error = new Error('Tipo de medio inválido') as ApiError;
        error.status = 400;
        throw error;
      }

      const jurados = await userService.getJuradosEspecializados(tipoMedio as any);

      const response: ApiResponse = {
        success: true,
        data: { jurados },
        message: `Jurados especializados en ${tipoMedio} obtenidos exitosamente`
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Asignar jurado a categoría (solo administradores)
   * POST /api/v1/users/jurado/asignar
   */
  async asignarJuradoACategoria(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        const error = new Error('Usuario no autenticado') as ApiError;
        error.status = 401;
        throw error;
      }

      if (req.user.role !== 'ADMIN') {
        const error = new Error('Solo los administradores pueden asignar jurados') as ApiError;
        error.status = 403;
        throw error;
      }

      const validatedData = asignarJuradoSchema.parse(req.body) as AsignarJuradoRequest;
      const asignacion = await userService.asignarJuradoACategoria(
        validatedData.jurado_id,
        validatedData.categoria_id
      );

      const response: ApiResponse = {
        success: true,
        data: { asignacion },
        message: 'Jurado asignado a categoría exitosamente'
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remover asignación de jurado (solo administradores)
   * DELETE /api/v1/users/jurado/asignar/:juradoId/:categoriaId
   */
  async removerAsignacionJurado(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        const error = new Error('Usuario no autenticado') as ApiError;
        error.status = 401;
        throw error;
      }

      if (req.user.role !== 'ADMIN') {
        const error = new Error('Solo los administradores pueden remover asignaciones') as ApiError;
        error.status = 403;
        throw error;
      }

      const { juradoId, categoriaId } = req.params;
      
      if (!juradoId || !categoriaId) {
        const error = new Error('ID de jurado y categoría requeridos') as ApiError;
        error.status = 400;
        throw error;
      }

      await userService.removerAsignacionJurado(juradoId, parseInt(categoriaId));

      const response: ApiResponse = {
        success: true,
        message: 'Asignación de jurado removida exitosamente'
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener asignaciones de un jurado
   * GET /api/v1/users/jurado/asignaciones
   */
  async getAsignacionesJurado(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        const error = new Error('Usuario no autenticado') as ApiError;
        error.status = 401;
        throw error;
      }

      // Los jurados pueden ver sus propias asignaciones, los admins pueden ver cualquiera
      const juradoId = req.query['juradoId'] as string || req.user.userId;

      if (req.user.role !== 'ADMIN' && juradoId !== req.user.userId) {
        const error = new Error('No tienes permisos para ver estas asignaciones') as ApiError;
        error.status = 403;
        throw error;
      }

      const asignaciones = await userService.getAsignacionesJurado(juradoId);

      const response: ApiResponse = {
        success: true,
        data: { asignaciones },
        message: 'Asignaciones de jurado obtenidas exitosamente'
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();