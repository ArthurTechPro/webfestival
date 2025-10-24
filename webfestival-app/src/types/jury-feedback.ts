// Tipos para el sistema de feedback entre jurados especializados

export interface JuryFeedback {
  id: number;
  evaluador_id: string;
  evaluado_id: string;
  medio_id: number;
  tipo_feedback: 'constructivo' | 'tecnico' | 'creativo' | 'general';
  puntuacion_profesionalismo: number; // 1-5
  puntuacion_conocimiento: number; // 1-5
  comentarios: string;
  es_anonimo: boolean;
  fecha_feedback: Date;
  evaluador: {
    nombre: string;
    picture_url?: string;
    especializaciones: string[];
  };
  evaluado: {
    nombre: string;
    picture_url?: string;
    especializaciones: string[];
  };
  medio: {
    titulo: string;
    tipo_medio: string;
  };
}

export interface FeedbackStats {
  promedio_profesionalismo: number;
  promedio_conocimiento: number;
  total_feedbacks_recibidos: number;
  total_feedbacks_dados: number;
  feedbacks_por_tipo: Array<{
    tipo: string;
    cantidad: number;
  }>;
  feedbacks_por_especializacion: Array<{
    especializacion: string;
    cantidad: number;
    promedio_profesionalismo: number;
    promedio_conocimiento: number;
  }>;
}

export interface CreateFeedbackDto {
  evaluado_id: string;
  medio_id: number;
  tipo_feedback: 'constructivo' | 'tecnico' | 'creativo' | 'general';
  puntuacion_profesionalismo: number;
  puntuacion_conocimiento: number;
  comentarios: string;
  es_anonimo: boolean;
}

export interface FeedbackFilters {
  tipo_feedback?: string;
  especializacion?: string;
  es_anonimo?: boolean;
  fecha_desde?: Date;
  fecha_hasta?: Date;
  page?: number;
  limit?: number;
}

export interface PeerJuror {
  id: string;
  nombre: string;
  picture_url?: string;
  especializaciones: string[];
  experiencia_años: number;
  promedio_profesionalismo?: number;
  promedio_conocimiento?: number;
  total_evaluaciones: number;
  medios_evaluados_juntos: number;
}