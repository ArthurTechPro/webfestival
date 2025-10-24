import { apiService } from './api';
import type { 
  JuryFeedback, 
  FeedbackStats, 
  CreateFeedbackDto, 
  FeedbackFilters,
  PeerJuror,
  PaginatedResponse
} from '../types';

/**
 * Servicio para gestión de feedback entre jurados especializados
 */
export class JuryFeedbackService {
  /**
   * Obtiene la lista de jurados pares (que han evaluado medios similares)
   */
  async getPeerJurors(): Promise<PeerJuror[]> {
    const response = await apiService.get<PeerJuror[]>('/api/jury-feedback/peers');
    return response.data || [];
  }

  /**
   * Obtiene los feedbacks recibidos por el jurado actual
   */
  async getReceivedFeedbacks(filtros?: FeedbackFilters): Promise<PaginatedResponse<JuryFeedback>> {
    const params = new URLSearchParams();
    if (filtros) {
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined) {
          if (value instanceof Date) {
            params.append(key, value.toISOString());
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const url = `/api/jury-feedback/received${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiService.get<PaginatedResponse<JuryFeedback>>(url);
    return response.data || { data: [], total: 0, page: 1, totalPages: 0 };
  }

  /**
   * Obtiene los feedbacks dados por el jurado actual
   */
  async getGivenFeedbacks(filtros?: FeedbackFilters): Promise<PaginatedResponse<JuryFeedback>> {
    const params = new URLSearchParams();
    if (filtros) {
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined) {
          if (value instanceof Date) {
            params.append(key, value.toISOString());
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const url = `/api/jury-feedback/given${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiService.get<PaginatedResponse<JuryFeedback>>(url);
    return response.data || { data: [], total: 0, page: 1, totalPages: 0 };
  }

  /**
   * Crea un nuevo feedback para otro jurado
   */
  async createFeedback(feedback: CreateFeedbackDto): Promise<JuryFeedback> {
    const response = await apiService.post<JuryFeedback>('/api/jury-feedback', feedback);
    if (!response.data) {
      throw new Error('Error al crear el feedback');
    }
    return response.data;
  }

  /**
   * Obtiene las estadísticas de feedback del jurado actual
   */
  async getFeedbackStats(): Promise<FeedbackStats> {
    const response = await apiService.get<FeedbackStats>('/api/jury-feedback/stats');
    return response.data || {
      promedio_profesionalismo: 0,
      promedio_conocimiento: 0,
      total_feedbacks_recibidos: 0,
      total_feedbacks_dados: 0,
      feedbacks_por_tipo: [],
      feedbacks_por_especializacion: []
    };
  }

  /**
   * Obtiene feedbacks disponibles para dar (jurados que han evaluado medios similares)
   */
  async getAvailableFeedbackOpportunities(): Promise<Array<{
    jurado: PeerJuror;
    medios_comunes: Array<{
      id: number;
      titulo: string;
      tipo_medio: string;
    }>;
  }>> {
    const response = await apiService.get('/api/jury-feedback/opportunities');
    return response.data || [];
  }

  /**
   * Valida un feedback antes de enviarlo
   */
  validateFeedback(feedback: CreateFeedbackDto): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar puntuaciones
    if (feedback.puntuacion_profesionalismo < 1 || feedback.puntuacion_profesionalismo > 5) {
      errors.push('La puntuación de profesionalismo debe estar entre 1 y 5');
    }

    if (feedback.puntuacion_conocimiento < 1 || feedback.puntuacion_conocimiento > 5) {
      errors.push('La puntuación de conocimiento debe estar entre 1 y 5');
    }

    // Validar comentarios
    if (!feedback.comentarios || feedback.comentarios.trim().length < 10) {
      errors.push('Los comentarios deben tener al menos 10 caracteres');
    }

    if (feedback.comentarios && feedback.comentarios.length > 1000) {
      errors.push('Los comentarios no pueden exceder 1000 caracteres');
    }

    // Validar tipo de feedback
    const tiposValidos = ['constructivo', 'tecnico', 'creativo', 'general'];
    if (!tiposValidos.includes(feedback.tipo_feedback)) {
      errors.push('Tipo de feedback no válido');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Obtiene el icono apropiado para un tipo de feedback
   */
  getFeedbackTypeIcon(tipo: string): string {
    const icons = {
      constructivo: '💡',
      tecnico: '🔧',
      creativo: '🎨',
      general: '💬'
    };
    return icons[tipo as keyof typeof icons] || '💬';
  }

  /**
   * Obtiene el color apropiado para un tipo de feedback
   */
  getFeedbackTypeColor(tipo: string): string {
    const colors = {
      constructivo: '#28a745',
      tecnico: '#17a2b8',
      creativo: '#ffc107',
      general: '#6c757d'
    };
    return colors[tipo as keyof typeof colors] || '#6c757d';
  }

  /**
   * Formatea la puntuación para mostrar con estrellas
   */
  formatRating(puntuacion: number): string {
    const estrellas = '⭐'.repeat(Math.floor(puntuacion));
    const mediaEstrella = puntuacion % 1 >= 0.5 ? '⭐' : '';
    return estrellas + mediaEstrella;
  }

  /**
   * Obtiene el texto descriptivo para una puntuación
   */
  getRatingDescription(puntuacion: number): string {
    if (puntuacion >= 4.5) return 'Excelente';
    if (puntuacion >= 3.5) return 'Muy bueno';
    if (puntuacion >= 2.5) return 'Bueno';
    if (puntuacion >= 1.5) return 'Regular';
    return 'Necesita mejorar';
  }
}

export const juryFeedbackService = new JuryFeedbackService();