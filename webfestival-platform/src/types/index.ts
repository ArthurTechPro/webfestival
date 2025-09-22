// User types
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

// Contest types
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
  created_at: Date;
}

// Category types
export interface Categoria {
  id: number;
  nombre: string;
  concurso_id: number;
}

// Photo types
export interface Foto {
  id: number;
  titulo: string;
  usuario_id: string;
  concurso_id: number;
  categoria_id: number;
  foto_url: string;
  thumbnail_url?: string;
  preview_url?: string;
  fecha_subida: Date;
}

// Rating types
export interface Calificacion {
  id: number;
  foto_id: number;
  jurado_id: string;
  score_enfoque: number;
  score_exposicion: number;
  score_composicion: number;
  score_creatividad: number;
  score_impacto_visual: number;
  comentarios?: string;
  fecha_calificacion: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}