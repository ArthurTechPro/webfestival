import { apiService } from './api';
import type { 
  AsignacionJurado, 
  MedioParaEvaluacion, 
  Criterio, 
  FormularioCalificacion, 
  ResultadoCalificacion,
  ProgresoEvaluacion,
  EstadisticasJurado,
  FiltrosEvaluacion,
  CriteriosPorTipo,
  JuradoEspecializacion,
  PaginatedResponse,
  PerformanceMetrics,
  UpdateEspecializacionDto
} from '../types';

/**
 * Servicio para gestión de evaluaciones de jurados especializados
 */
export class EvaluationService {
  /**
   * Obtiene las asignaciones de categorías para el jurado actual
   */
  async getMisAsignaciones(): Promise<AsignacionJurado[]> {
    const response = await apiService.get<AsignacionJurado[]>('/api/evaluations/my-assignments');
    return response.data || [];
  }

  /**
   * Obtiene los medios asignados para evaluación
   */
  async getMediosParaEvaluacion(filtros?: FiltrosEvaluacion): Promise<PaginatedResponse<MedioParaEvaluacion>> {
    const params = new URLSearchParams();
    if (filtros) {
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const url = `/api/evaluations/media-for-evaluation${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiService.get<PaginatedResponse<MedioParaEvaluacion>>(url);
    return response.data || { data: [], total: 0, page: 1, totalPages: 0 };
  }

  /**
   * Obtiene un medio específico para evaluación
   */
  async getMedioParaEvaluacion(medioId: number): Promise<MedioParaEvaluacion> {
    const response = await apiService.get<MedioParaEvaluacion>(`/api/evaluations/media/${medioId}`);
    if (!response.data) {
      throw new Error('Medio no encontrado');
    }
    return response.data;
  }

  /**
   * Obtiene los criterios activos para un tipo de medio específico
   */
  async getCriteriosPorTipoMedio(tipoMedio: string): Promise<Criterio[]> {
    const response = await apiService.get<Criterio[]>(`/api/evaluations/criteria/${tipoMedio}`);
    return response.data || [];
  }

  /**
   * Obtiene todos los criterios organizados por tipo de medio
   */
  async getTodosCriteriosPorTipo(): Promise<CriteriosPorTipo> {
    const response = await apiService.get<CriteriosPorTipo>('/api/evaluations/criteria/by-type');
    return response.data || {
      fotografia: [],
      video: [],
      audio: [],
      corto_cine: [],
      universales: []
    };
  }

  /**
   * Envía una calificación para un medio
   */
  async enviarCalificacion(calificacion: FormularioCalificacion): Promise<ResultadoCalificacion> {
    const response = await apiService.post<ResultadoCalificacion>('/api/evaluations/rate', calificacion);
    if (!response.data) {
      throw new Error('Error al enviar la calificación');
    }
    return response.data;
  }

  /**
   * Actualiza una calificación existente
   */
  async actualizarCalificacion(calificacionId: number, calificacion: FormularioCalificacion): Promise<ResultadoCalificacion> {
    const response = await apiService.put<ResultadoCalificacion>(`/api/evaluations/rate/${calificacionId}`, calificacion);
    if (!response.data) {
      throw new Error('Error al actualizar la calificación');
    }
    return response.data;
  }

  /**
   * Obtiene el progreso de evaluaciones del jurado actual
   */
  async getProgresoEvaluaciones(): Promise<ProgresoEvaluacion[]> {
    const response = await apiService.get<ProgresoEvaluacion[]>('/api/evaluations/progress');
    return response.data || [];
  }

  /**
   * Obtiene las estadísticas completas del jurado actual
   */
  async getEstadisticasJurado(): Promise<EstadisticasJurado> {
    const response = await apiService.get<EstadisticasJurado>('/api/evaluations/stats');
    return response.data || {
      total_asignaciones: 0,
      total_evaluaciones_completadas: 0,
      total_evaluaciones_pendientes: 0,
      promedio_calificacion: 0,
      especializaciones: [],
      progreso_por_categoria: [],
      evaluaciones_por_mes: [],
      distribucion_por_tipo: []
    };
  }

  /**
   * Obtiene la especialización del jurado actual
   */
  async getMiEspecializacion(): Promise<JuradoEspecializacion | null> {
    const response = await apiService.get<JuradoEspecializacion>('/api/evaluations/my-specialization');
    return response.data || null;
  }

  /**
   * Actualiza la especialización del jurado actual
   */
  async actualizarEspecializacion(especializacion: UpdateEspecializacionDto): Promise<JuradoEspecializacion> {
    const response = await apiService.put<JuradoEspecializacion>('/api/evaluations/my-specialization', especializacion);
    if (!response.data) {
      throw new Error('Error al actualizar la especialización');
    }
    return response.data;
  }

  /**
   * Obtiene métricas de rendimiento del jurado
   */
  async getPerformanceMetrics(juradoId?: string): Promise<PerformanceMetrics> {
    const url = juradoId 
      ? `/api/evaluations/performance-metrics/${juradoId}`
      : '/api/evaluations/my-performance-metrics';
    
    const response = await apiService.get<PerformanceMetrics>(url);
    return response.data || {
      total_evaluaciones: 0,
      promedio_general: 0,
      consistencia: 0,
      tiempo_promedio_minutos: 0,
      rendimiento_por_criterio: [],
      rendimiento_por_especializacion: [],
      tendencias_mensuales: []
    };
  }

  /**
   * Obtiene los metadatos relevantes para mostrar según el tipo de medio
   */
  getMetadatosRelevantes(medio: MedioParaEvaluacion): Array<{ label: string; value: string }> {
    const metadatos: Array<{ label: string; value: string }> = [];

    // Metadatos básicos para todos los tipos
    metadatos.push(
      { label: 'Formato', value: medio.formato },
      { label: 'Tamaño', value: this.formatFileSize(medio.tamaño_archivo) },
      { label: 'Fecha de subida', value: new Date(medio.fecha_subida).toLocaleDateString() }
    );

    // Metadatos específicos por tipo
    switch (medio.tipo_medio) {
      case 'fotografia':
        if (medio.metadatos.exif) {
          const exif = medio.metadatos.exif as Record<string, unknown>;
          if (exif.camera) metadatos.push({ label: 'Cámara', value: String(exif.camera) });
          if (exif.lens) metadatos.push({ label: 'Lente', value: String(exif.lens) });
          if (exif.iso) metadatos.push({ label: 'ISO', value: String(exif.iso) });
          if (exif.aperture) metadatos.push({ label: 'Apertura', value: String(exif.aperture) });
          if (exif.shutter_speed) metadatos.push({ label: 'Velocidad', value: String(exif.shutter_speed) });
          if (exif.focal_length) metadatos.push({ label: 'Distancia focal', value: String(exif.focal_length) });
        }
        if (medio.metadatos.dimensions) {
          const dims = medio.metadatos.dimensions as { width: number; height: number };
          metadatos.push({ label: 'Dimensiones', value: `${dims.width} × ${dims.height}px` });
        }
        break;

      case 'video':
      case 'corto_cine':
        if (medio.duracion) {
          metadatos.push({ label: 'Duración', value: this.formatDuration(medio.duracion) });
        }
        if (medio.metadatos.resolution) {
          metadatos.push({ label: 'Resolución', value: String(medio.metadatos.resolution) });
        }
        if (medio.metadatos.fps) {
          metadatos.push({ label: 'FPS', value: String(medio.metadatos.fps) });
        }
        if (medio.metadatos.bitrate) {
          metadatos.push({ label: 'Bitrate', value: String(medio.metadatos.bitrate) });
        }
        if (medio.metadatos.codec) {
          metadatos.push({ label: 'Códec', value: String(medio.metadatos.codec) });
        }
        break;

      case 'audio':
        if (medio.duracion) {
          metadatos.push({ label: 'Duración', value: this.formatDuration(medio.duracion) });
        }
        if (medio.metadatos.sample_rate) {
          metadatos.push({ label: 'Sample Rate', value: `${medio.metadatos.sample_rate} Hz` });
        }
        if (medio.metadatos.bitrate) {
          metadatos.push({ label: 'Bitrate', value: `${medio.metadatos.bitrate} kbps` });
        }
        if (medio.metadatos.channels) {
          metadatos.push({ label: 'Canales', value: String(medio.metadatos.channels) });
        }
        if (medio.metadatos.codec) {
          metadatos.push({ label: 'Códec', value: String(medio.metadatos.codec) });
        }
        break;
    }

    return metadatos;
  }

  /**
   * Formatea el tamaño de archivo para mostrar
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Formatea la duración para mostrar (para videos y audios)
   */
  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Obtiene el icono apropiado para un tipo de medio
   */
  getMediaTypeIcon(tipo_medio: string): string {
    const icons = {
      fotografia: '📸',
      video: '🎬',
      audio: '🎵',
      corto_cine: '🎭'
    };
    return icons[tipo_medio as keyof typeof icons] || '📄';
  }

  /**
   * Obtiene el color apropiado para un tipo de medio
   */
  getMediaTypeColor(tipo_medio: string): string {
    const colors = {
      fotografia: '#346CB0',
      video: '#2ed573',
      audio: '#ffa502',
      corto_cine: '#3742fa'
    };
    return colors[tipo_medio as keyof typeof colors] || '#6c757d';
  }

  /**
   * Valida una calificación antes de enviarla
   */
  validateCalificacion(calificacion: FormularioCalificacion, criterios: Criterio[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Verificar que todos los criterios tengan puntuación
    const criteriosRequeridos = criterios.filter(c => c.activo);
    const criteriosCalificados = calificacion.criterios.map(c => c.criterio_id);

    for (const criterio of criteriosRequeridos) {
      if (!criteriosCalificados.includes(criterio.id)) {
        errors.push(`Falta calificación para el criterio: ${criterio.nombre}`);
      }
    }

    // Verificar que las puntuaciones estén en el rango válido (1-10)
    for (const criterioCalif of calificacion.criterios) {
      if (criterioCalif.puntuacion < 1 || criterioCalif.puntuacion > 10) {
        const criterio = criterios.find(c => c.id === criterioCalif.criterio_id);
        errors.push(`La puntuación para ${criterio?.nombre || 'criterio desconocido'} debe estar entre 1 y 10`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export const evaluationService = new EvaluationService();