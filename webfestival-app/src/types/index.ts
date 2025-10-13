// Tipos principales de la aplicación WebFestival

export interface User {
  id: string;
  email: string;
  nombre: string;
  role: 'PARTICIPANTE' | 'JURADO' | 'ADMIN' | 'CONTENT_ADMIN';
  picture_url?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Concurso {
  id: number;
  titulo: string;
  descripcion: string;
  reglas: string;
  fecha_inicio: Date;
  fecha_final: Date;
  status: 'Próximamente' | 'Activo' | 'Calificación' | 'Finalizado';
  imagen_url?: string;
  max_envios: number;
  tamaño_max_mb: number;
}

export interface Categoria {
  id: number;
  nombre: string;
  concurso_id: number;
}

export interface Medio {
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
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}
