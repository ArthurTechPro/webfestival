import { apiService } from './api';
import type { User, Concurso, Categoria, PaginatedResponse } from '../types';

/**
 * Tipos específicos para administración
 */
export interface AdminStats {
  totalUsuarios: number;
  concursosActivos: number;
  mediosSubidos: number;
  ingresosMensuales: string;
  usuariosPorRol: Record<string, number>;
  crecimientoMensual: Array<{ mes: string; usuarios: number }>;
}

export interface CreateConcursoDto {
  titulo: string;
  descripcion: string;
  reglas: string;
  fecha_inicio: Date;
  fecha_final: Date;
  imagen_url?: string;
  max_envios: number;
  tamaño_max_mb: number;
  categorias: Array<{ nombre: string; tipo_medio: string }>;
}

export interface UpdateConcursoDto extends Partial<CreateConcursoDto> {
  status?: 'Próximamente' | 'Activo' | 'Calificación' | 'Finalizado';
}

export interface JuradoAsignacion {
  id: string;
  usuario_id: string;
  categoria_id: number;
  especialidad: 'fotografia' | 'video' | 'audio' | 'corto_cine';
  usuario: User;
  categoria: Categoria;
}

export interface UserFilters {
  role?: string;
  search?: string;
  page: number;
  limit: number;
}

/**
 * Servicio para funcionalidades administrativas
 */
export class AdminService {
  /**
   * Obtiene estadísticas generales del sistema
   */
  async getStats(): Promise<AdminStats> {
    const response = await apiService.get<AdminStats>('/api/admin/stats');
    return response.data || {
      totalUsuarios: 0,
      concursosActivos: 0,
      mediosSubidos: 0,
      ingresosMensuales: '$0',
      usuariosPorRol: {},
      crecimientoMensual: []
    };
  }

  // === GESTIÓN DE CONCURSOS ===

  /**
   * Obtiene todos los concursos para administración
   */
  async getAllConcursos(): Promise<Concurso[]> {
    const response = await apiService.get<Concurso[]>('/api/admin/concursos');
    return response.data || [];
  }

  /**
   * Crea un nuevo concurso
   */
  async createConcurso(concurso: CreateConcursoDto): Promise<Concurso> {
    const response = await apiService.post<Concurso>('/api/admin/concursos', concurso);
    if (!response.data) {
      throw new Error('Error al crear el concurso');
    }
    return response.data;
  }

  /**
   * Actualiza un concurso existente
   */
  async updateConcurso(id: number, concurso: UpdateConcursoDto): Promise<Concurso> {
    const response = await apiService.put<Concurso>(`/api/admin/concursos/${id}`, concurso);
    if (!response.data) {
      throw new Error('Error al actualizar el concurso');
    }
    return response.data;
  }

  /**
   * Elimina un concurso
   */
  async deleteConcurso(id: number): Promise<void> {
    await apiService.delete(`/api/admin/concursos/${id}`);
  }

  /**
   * Cambia el estado de un concurso
   */
  async cambiarEstadoConcurso(id: number, status: string): Promise<Concurso> {
    const response = await apiService.patch<Concurso>(`/api/admin/concursos/${id}/status`, { status });
    if (!response.data) {
      throw new Error('Error al cambiar el estado del concurso');
    }
    return response.data;
  }

  // === GESTIÓN DE USUARIOS ===

  /**
   * Obtiene usuarios con filtros y paginación
   */
  async getUsers(filters: UserFilters): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams({
      page: filters.page.toString(),
      limit: filters.limit.toString(),
      ...(filters.role && { role: filters.role }),
      ...(filters.search && { search: filters.search })
    });

    const response = await apiService.get<PaginatedResponse<User>>(`/api/admin/users?${params}`);
    return response.data || { data: [], total: 0, page: 1, totalPages: 0 };
  }

  /**
   * Actualiza el rol de un usuario
   */
  async updateUserRole(userId: string, role: string): Promise<User> {
    const response = await apiService.patch<User>(`/api/admin/users/${userId}/role`, { role });
    if (!response.data) {
      throw new Error('Error al actualizar el rol del usuario');
    }
    return response.data;
  }

  /**
   * Desactiva/activa un usuario
   */
  async toggleUserStatus(userId: string): Promise<User> {
    const response = await apiService.patch<User>(`/api/admin/users/${userId}/toggle-status`);
    if (!response.data) {
      throw new Error('Error al cambiar el estado del usuario');
    }
    return response.data;
  }

  // === GESTIÓN DE JURADOS ===

  /**
   * Obtiene jurados disponibles por especialidad
   */
  async getJuradosByEspecialidad(especialidad?: string): Promise<User[]> {
    const params = especialidad ? `?especialidad=${especialidad}` : '';
    const response = await apiService.get<User[]>(`/api/admin/jurados${params}`);
    return response.data || [];
  }

  /**
   * Obtiene asignaciones de jurados
   */
  async getAsignacionesJurados(concursoId?: number): Promise<JuradoAsignacion[]> {
    const params = concursoId ? `?concursoId=${concursoId}` : '';
    const response = await apiService.get<JuradoAsignacion[]>(`/api/admin/jurados/asignaciones${params}`);
    return response.data || [];
  }

  /**
   * Asigna un jurado a una categoría
   */
  async asignarJurado(usuarioId: string, categoriaId: number): Promise<JuradoAsignacion> {
    const response = await apiService.post<JuradoAsignacion>('/api/admin/jurados/asignar', {
      usuario_id: usuarioId,
      categoria_id: categoriaId
    });
    if (!response.data) {
      throw new Error('Error al asignar el jurado');
    }
    return response.data;
  }

  /**
   * Remueve la asignación de un jurado
   */
  async removerAsignacionJurado(asignacionId: string): Promise<void> {
    await apiService.delete(`/api/admin/jurados/asignaciones/${asignacionId}`);
  }

  // === MÉTRICAS Y ANALYTICS ===

  /**
   * Obtiene métricas detalladas de participación
   */
  async getMetricasParticipacion(): Promise<any> {
    const response = await apiService.get('/api/admin/metrics/participacion');
    return response.data || {};
  }

  /**
   * Obtiene métricas de rendimiento de jurados
   */
  async getMetricasJurados(): Promise<any> {
    const response = await apiService.get('/api/admin/metrics/jurados');
    return response.data || {};
  }

  /**
   * Obtiene tendencias de crecimiento
   */
  async getTendenciasCrecimiento(periodo: 'monthly' | 'yearly' = 'monthly'): Promise<any> {
    const response = await apiService.get(`/api/admin/metrics/crecimiento?periodo=${periodo}`);
    return response.data || {};
  }
}

export const adminService = new AdminService();