import { Request, Response } from 'express';
import { mediaService } from '@/services/media.service';
import { ApiResponse, PaginatedResponse, Medio, TipoMedio } from '@/types';

/**
 * Controlador para gestión de medios multimedia
 */
export class MediaController {
  /**
   * Genera URL segura para subir un medio multimedia
   * POST /api/media/contests/:concursoId/upload-url
   */
  async generateUploadUrl(
    req: Request,
    res: Response<ApiResponse>
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Usuario no autenticado'
        });
        return;
      }

      const concursoId = parseInt(req.params['concursoId'] || '0');
      const uploadRequest = req.body;

      const uploadUrl = await mediaService.generateUploadUrl(
        userId,
        concursoId,
        uploadRequest
      );

      res.status(200).json({
        success: true,
        data: uploadUrl,
        message: 'URL de subida generada exitosamente'
      });
    } catch (error) {
      console.error('Error al generar URL de subida:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor';
      const statusCode = this.getErrorStatusCode(errorMessage);
      
      res.status(statusCode).json({
        success: false,
        error: errorMessage
      });
    }
  }

  /**
   * Procesa la subida completada de un medio
   * POST /api/media/contests/:concursoId/process-upload
   */
  async processUpload(
    req: Request,
    res: Response<ApiResponse<Medio>>
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Usuario no autenticado'
        });
        return;
      }

      const concursoId = parseInt(req.params['concursoId'] || '0');
      const uploadToken = req.headers['x-upload-token'] as string;
      const processRequest = req.body;

      const medio = await mediaService.processUpload(
        userId,
        concursoId,
        uploadToken,
        processRequest
      );

      res.status(201).json({
        success: true,
        data: medio,
        message: 'Medio subido y procesado exitosamente'
      });
    } catch (error) {
      console.error('Error al procesar subida:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor';
      const statusCode = this.getErrorStatusCode(errorMessage);
      
      res.status(statusCode).json({
        success: false,
        error: errorMessage
      });
    }
  }

  /**
   * Obtiene un medio por ID
   * GET /api/media/:id
   */
  async getMediaById(
    req: Request,
    res: Response<ApiResponse<Medio>>
  ): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');

      const medio = await mediaService.getMediaById(id);

      if (!medio) {
        res.status(404).json({
          success: false,
          error: 'Medio no encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: medio
      });
    } catch (error) {
      console.error('Error al obtener medio:', error);
      
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtiene medios por usuario
   * GET /api/media/user/:userId
   */
  async getMediaByUser(
    req: Request,
    res: Response<ApiResponse<PaginatedResponse<Medio>>>
  ): Promise<void> {
    try {
      const userId = req.params['userId'] || '';
      const page = parseInt(req.query['page'] as string || '1');
      const limit = parseInt(req.query['limit'] as string || '20');
      const tipo_medio = req.query['tipo_medio'] as TipoMedio;

      // TODO: Implementar paginación real
      let medios = await mediaService.getMediaByUser(userId);

      // Filtrar por tipo de medio si se especifica
      if (tipo_medio) {
        medios = medios.filter(medio => medio.tipo_medio === tipo_medio);
      }

      // Simular paginación
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedMedias = medios.slice(startIndex, endIndex);

      const response: PaginatedResponse<Medio> = {
        data: paginatedMedias,
        pagination: {
          page,
          limit,
          total: medios.length,
          totalPages: Math.ceil(medios.length / limit)
        }
      };

      res.status(200).json({
        success: true,
        data: response
      });
    } catch (error) {
      console.error('Error al obtener medios por usuario:', error);
      
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtiene medios por concurso
   * GET /api/media/contests/:concursoId
   */
  async getMediaByContest(
    req: Request,
    res: Response<ApiResponse<PaginatedResponse<Medio>>>
  ): Promise<void> {
    try {
      const concursoId = parseInt(req.params['concursoId'] || '0');
      const page = parseInt(req.query['page'] as string || '1');
      const limit = parseInt(req.query['limit'] as string || '20');
      const categoria_id = req.query['categoria_id'] ? parseInt(req.query['categoria_id'] as string) : undefined;
      const tipo_medio = req.query['tipo_medio'] as TipoMedio;

      // TODO: Implementar paginación real en el servicio
      let medios = await mediaService.getMediaByContest(concursoId);

      // Filtrar por categoría si se especifica
      if (categoria_id) {
        medios = medios.filter(medio => medio.categoria_id === categoria_id);
      }

      // Filtrar por tipo de medio si se especifica
      if (tipo_medio) {
        medios = medios.filter(medio => medio.tipo_medio === tipo_medio);
      }

      // Simular paginación
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedMedias = medios.slice(startIndex, endIndex);

      const response: PaginatedResponse<Medio> = {
        data: paginatedMedias,
        pagination: {
          page,
          limit,
          total: medios.length,
          totalPages: Math.ceil(medios.length / limit)
        }
      };

      res.status(200).json({
        success: true,
        data: response
      });
    } catch (error) {
      console.error('Error al obtener medios por concurso:', error);
      
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Actualiza un medio
   * PUT /api/media/:id
   */
  async updateMedia(
    req: Request,
    res: Response<ApiResponse<Medio>>
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Usuario no autenticado'
        });
        return;
      }

      const id = parseInt(req.params['id'] || '0');
      const { titulo } = req.body;
      
      // TODO: Implementar actualización real del título
      console.log('Actualizando medio con título:', titulo);
      
      // TODO: Implementar actualización real del título

      // Verificar que el medio existe y pertenece al usuario
      const existingMedio = await mediaService.getMediaById(id);
      if (!existingMedio) {
        res.status(404).json({
          success: false,
          error: 'Medio no encontrado'
        });
        return;
      }

      if (existingMedio.usuario_id !== userId) {
        res.status(403).json({
          success: false,
          error: 'No tienes permisos para editar este medio'
        });
        return;
      }

      // TODO: Implementar actualización real en el servicio
      // Por ahora solo devolvemos el medio existente
      res.status(200).json({
        success: true,
        data: existingMedio,
        message: 'Medio actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error al actualizar medio:', error);
      
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Elimina un medio
   * DELETE /api/media/:id
   */
  async deleteMedia(
    req: Request,
    res: Response<ApiResponse>
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Usuario no autenticado'
        });
        return;
      }

      const id = parseInt(req.params['id'] || '0');

      await mediaService.deleteMedia(id, userId);

      res.status(200).json({
        success: true,
        message: 'Medio eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar medio:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor';
      const statusCode = this.getErrorStatusCode(errorMessage);
      
      res.status(statusCode).json({
        success: false,
        error: errorMessage
      });
    }
  }

  /**
   * Obtiene configuración de validación para tipos de medios
   * GET /api/media/validation-config
   */
  async getValidationConfig(
    _req: Request,
    res: Response<ApiResponse>
  ): Promise<void> {
    try {
      const config = {
        fotografia: {
          formats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
          maxSizeMB: 10,
          maxDimensions: { width: 4000, height: 4000 },
          extensions: ['.jpg', '.jpeg', '.png', '.webp']
        },
        video: {
          formats: ['video/mp4', 'video/webm', 'video/quicktime'],
          maxSizeMB: 100,
          maxDuration: 600,
          extensions: ['.mp4', '.webm', '.mov']
        },
        audio: {
          formats: ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/mp3'],
          maxSizeMB: 50,
          maxDuration: 1800,
          extensions: ['.mp3', '.wav', '.flac']
        },
        corto_cine: {
          formats: ['video/mp4', 'video/webm', 'video/quicktime'],
          maxSizeMB: 500,
          maxDuration: 1800,
          extensions: ['.mp4', '.webm', '.mov']
        }
      };

      res.status(200).json({
        success: true,
        data: config,
        message: 'Configuración de validación obtenida exitosamente'
      });
    } catch (error) {
      console.error('Error al obtener configuración de validación:', error);
      
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtiene galería de medios ganadores para visualización pública
   * GET /api/media/gallery/winners
   */
  async getWinnerGallery(
    req: Request,
    res: Response<ApiResponse<PaginatedResponse<Medio>>>
  ): Promise<void> {
    try {
      const page = parseInt(req.query['page'] as string || '1');
      const limit = parseInt(req.query['limit'] as string || '20');
      const tipo_medio = req.query['tipo_medio'] as TipoMedio;
      const categoria_id = req.query['categoria_id'] ? parseInt(req.query['categoria_id'] as string) : undefined;
      const concurso_id = req.query['concurso_id'] ? parseInt(req.query['concurso_id'] as string) : undefined;
      const año = req.query['año'] ? parseInt(req.query['año'] as string) : undefined;

      const filters = {
        page,
        limit,
        tipo_medio,
        categoria_id: categoria_id || undefined,
        concurso_id: concurso_id || undefined,
        año: año || undefined
      };

      const result = await mediaService.getWinnerGallery(filters);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Galería de ganadores obtenida exitosamente'
      });
    } catch (error) {
      console.error('Error al obtener galería de ganadores:', error);
      
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtiene galería de medios destacados para visualización pública
   * GET /api/media/gallery/featured
   */
  async getFeaturedGallery(
    req: Request,
    res: Response<ApiResponse<PaginatedResponse<Medio>>>
  ): Promise<void> {
    try {
      const page = parseInt(req.query['page'] as string || '1');
      const limit = parseInt(req.query['limit'] as string || '12');
      const tipo_medio = req.query['tipo_medio'] as TipoMedio;

      const filters = {
        page,
        limit,
        tipo_medio: tipo_medio || undefined
      };

      const result = await mediaService.getFeaturedGallery(filters);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Galería destacada obtenida exitosamente'
      });
    } catch (error) {
      console.error('Error al obtener galería destacada:', error);
      
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtiene categorías organizadas por tipo de medio para un concurso
   * GET /api/media/contests/:concursoId/categories
   */
  async getCategoriesByMediaType(
    req: Request,
    res: Response<ApiResponse>
  ): Promise<void> {
    try {
      const concursoId = parseInt(req.params['concursoId'] || '0');

      const categories = await mediaService.getCategoriesByMediaType(concursoId);

      res.status(200).json({
        success: true,
        data: categories,
        message: 'Categorías por tipo de medio obtenidas exitosamente'
      });
    } catch (error) {
      console.error('Error al obtener categorías por tipo de medio:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor';
      const statusCode = this.getErrorStatusCode(errorMessage);
      
      res.status(statusCode).json({
        success: false,
        error: errorMessage
      });
    }
  }

  /**
   * Determina el código de estado HTTP basado en el mensaje de error
   */
  private getErrorStatusCode(errorMessage: string): number {
    if (errorMessage.includes('no encontrado')) return 404;
    if (errorMessage.includes('no tienes permisos') || 
        errorMessage.includes('no autorizado')) return 403;
    if (errorMessage.includes('inscrito') || 
        errorMessage.includes('límite') ||
        errorMessage.includes('excede') ||
        errorMessage.includes('formato') ||
        errorMessage.includes('tamaño') ||
        errorMessage.includes('activo') ||
        errorMessage.includes('período') ||
        errorMessage.includes('expirado') ||
        errorMessage.includes('inválido')) return 400;
    if (errorMessage.includes('no disponible') ||
        errorMessage.includes('conexión')) return 503;
    
    return 500;
  }
}

export const mediaController = new MediaController();