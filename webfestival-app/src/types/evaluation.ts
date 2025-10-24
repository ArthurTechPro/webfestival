// Tipos específicos para el sistema de evaluación de jurados

export interface Criterio {
  id: number;
  nombre: string;
  descripcion?: string;
  tipo_medio?: 'fotografia' | 'video' | 'audio' | 'corto_cine';
  peso: number;
  activo: boolean;
  orden: number;
}

export interface JuradoEspecializacion {
  id: number;
  usuario_id: string;
  especializaciones: ('fotografia' | 'video' | 'audio' | 'corto_cine')[];
  experiencia_años: number;
  certificaciones?: string[];
  portfolio_url?: string;
}

export interface Calificacion {
  id: number;
  medio_id: number;
  jurado_id: string;
  comentarios?: string;
  fecha_calificacion: Date;
  detalles?: CalificacionDetalle[];
}

export interface CalificacionDetalle {
  id: number;
  calificacion_id: number;
  criterio_id: number;
  criterio: Criterio;
  puntuacion: number; // 1-10
}

export interface AsignacionJurado {
  id: number;
  usuario_id: string;
  categoria_id: number;
  categoria: {
    id: number;
    nombre: string;
    concurso_id: number;
    concurso: {
      titulo: string;
      status: string;
    };
  };
}

export interface MedioParaEvaluacion {
  id: number;
  titulo: string;
  tipo_medio: 'fotografia' | 'video' | 'audio' | 'corto_cine';
  usuario_id: string;
  concurso_id: number;
  categoria_id: number;
  medio_url: string;
  thumbnail_url?: string;
  preview_url?: string;
  duracion?: number;
  formato: string;
  tamaño_archivo: number;
  metadatos: Record<string, unknown>;
  fecha_subida: Date;
  usuario: {
    nombre: string;
    picture_url?: string;
  };
  categoria: {
    nombre: string;
  };
  concurso: {
    titulo: string;
  };
  calificacion_existente?: Calificacion;
  evaluado: boolean;
}

export interface ProgresoEvaluacion {
  categoria_id: number;
  categoria_nombre: string;
  tipo_medio: string;
  total_medios: number;
  medios_evaluados: number;
  porcentaje_completado: number;
  tiempo_promedio_evaluacion?: number;
}

export interface EstadisticasJurado {
  total_asignaciones: number;
  total_evaluaciones_completadas: number;
  total_evaluaciones_pendientes: number;
  promedio_calificacion: number;
  especializaciones: string[];
  progreso_por_categoria: ProgresoEvaluacion[];
  evaluaciones_por_mes: Array<{
    mes: string;
    cantidad: number;
  }>;
  distribucion_por_tipo: Array<{
    tipo_medio: string;
    cantidad: number;
    porcentaje: number;
  }>;
}

export interface FormularioCalificacion {
  medio_id: number;
  comentarios?: string;
  criterios: Array<{
    criterio_id: number;
    puntuacion: number;
  }>;
}

export interface ResultadoCalificacion {
  calificacion: Calificacion;
  puntaje_total: number;
  puntaje_ponderado: number;
}

export interface FiltrosEvaluacion {
  categoria_id?: number;
  tipo_medio?: 'fotografia' | 'video' | 'audio' | 'corto_cine';
  evaluado?: boolean;
  concurso_id?: number;
  page?: number;
  limit?: number;
}

export interface CriteriosPorTipo {
  fotografia: Criterio[];
  video: Criterio[];
  audio: Criterio[];
  corto_cine: Criterio[];
  universales: Criterio[];
}

// Tipos para métricas de rendimiento de jurados
export interface PerformanceMetrics {
  total_evaluaciones: number;
  promedio_general: number;
  consistencia: number;
  tiempo_promedio_minutos: number;
  rendimiento_por_criterio: Array<{
    criterio_id: number;
    criterio_nombre: string;
    promedio_puntuacion: number;
    total_evaluaciones: number;
    desviacion_estandar: number;
  }>;
  rendimiento_por_especializacion: SpecializationStats[];
  tendencias_mensuales: Array<{
    mes: string;
    promedio: number;
    total_evaluaciones: number;
  }>;
}

export interface SpecializationStats {
  especializacion: 'fotografia' | 'video' | 'audio' | 'corto_cine';
  total_evaluaciones: number;
  promedio_puntuacion: number;
  consistencia: number;
  tiempo_promedio_minutos: number;
  criterios_destacados: Array<{
    criterio_nombre: string;
    promedio: number;
  }>;
}

// Tipos para actualización de especialización
export interface UpdateEspecializacionDto {
  especializaciones: ('fotografia' | 'video' | 'audio' | 'corto_cine')[];
  experiencia_años: number;
  certificaciones: string[];
  portfolio_url: string;
}