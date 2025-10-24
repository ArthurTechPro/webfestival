import { apiService } from './api';
import type { 
  Comment, 
  CreateCommentData, 
  ReportCommentData 
} from '../types/community';
import type { PaginatedResponse } from '../types';

class CommunityService {
  /**
   * Obtener comentarios de un medio
   */
  async getComments(medioId: number, page: number = 1, limit: number = 20): Promise<PaginatedResponse<Comment>> {
    const response = await apiService.get<PaginatedResponse<Comment>>(`/community/comments/${medioId}?page=${page}&limit=${limit}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Error al obtener comentarios');
  }

  /**
   * Crear un comentario en un medio
   */
  async createComment(data: CreateCommentData): Promise<Comment> {
    const response = await apiService.post<Comment>('/community/comments', data);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Error al crear comentario');
  }

  /**
   * Eliminar un comentario (solo el autor o admin)
   */
  async deleteComment(commentId: number): Promise<void> {
    const response = await apiService.delete<void>(`/community/comments/${commentId}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Error al eliminar comentario');
    }
  }

  /**
   * Reportar un comentario
   */
  async reportComment(data: ReportCommentData): Promise<void> {
    const response = await apiService.post<void>('/community/comments/report', data);
    
    if (!response.success) {
      throw new Error(response.message || 'Error al reportar comentario');
    }
  }

  /**
   * Obtener comentarios reportados (solo admin)
   */
  async getReportedComments(page: number = 1, limit: number = 20): Promise<PaginatedResponse<Comment>> {
    const response = await apiService.get<PaginatedResponse<Comment>>(`/community/comments/reported?page=${page}&limit=${limit}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Error al obtener comentarios reportados');
  }

  /**
   * Moderar un comentario (solo admin)
   */
  async moderateComment(commentId: number, action: 'approve' | 'reject' | 'delete'): Promise<void> {
    const response = await apiService.post<void>(`/community/comments/${commentId}/moderate`, { action });
    
    if (!response.success) {
      throw new Error(response.message || 'Error al moderar comentario');
    }
  }
}

// Instancia singleton del servicio de comunidad
export const communityService = new CommunityService();
export default communityService;