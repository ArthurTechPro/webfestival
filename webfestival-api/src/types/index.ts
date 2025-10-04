// User types
export interface User {
  id: string;
  email: string;
  nombre: string;
  role: 'PARTICIPANTE' | 'JURADO' | 'ADMIN' | 'CONTENT_ADMIN';
  picture_url?: string | undefined;
  bio?: string | undefined;
  createdAt: Date;
  updatedAt: Date;
}

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  nombre: string;
  bio?: string | undefined;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
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

export interface Categoria {
  id: number;
  nombre: string;
  concurso_id: number;
}

// Media types
export type TipoMedio = 'fotografia' | 'video' | 'audio' | 'corto_cine';

export interface Medio {
  id: number;
  titulo: string;
  tipo_medio: TipoMedio;
  usuario_id: string;
  concurso_id: number;
  categoria_id: number;
  medio_url: string;
  thumbnail_url?: string;
  preview_url?: string;
  duracion?: number;
  formato: string;
  tamaño_archivo: number;
  metadatos: Record<string, any>;
  fecha_subida: Date;
}

// Evaluation types
export interface Criterio {
  id: number;
  nombre: string;
  descripcion?: string;
  tipo_medio?: 'fotografia' | 'video' | 'audio' | 'corto_cine';
  peso: number;
  activo: boolean;
  orden: number;
}

export interface Calificacion {
  id: number;
  medio_id: number;
  jurado_id: string;
  comentarios?: string;
  fecha_calificacion: Date;
}

export interface CalificacionDetalle {
  id: number;
  calificacion_id: number;
  criterio_id: number;
  puntuacion: number;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error types
export interface ApiError extends Error {
  status?: number;
  code?: string;
}

// Environment types
export interface EnvConfig {
  PORT: number;
  NODE_ENV: string;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES_IN: string;
  IMMICH_SERVER_URL: string;
  IMMICH_API_KEY: string;
  FRONTEND_URL: string;
  CMS_URL: string;
}