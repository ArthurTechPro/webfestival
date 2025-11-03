import { useState, useEffect, useCallback } from 'react';
import { adminService, type AdminStats, type CreateConcursoDto, type UpdateConcursoDto, type UserFilters, type JuradoAsignacion } from '../services/admin.service';
import type { User, Concurso, PaginatedResponse } from '../types';

/**
 * Hook personalizado para funcionalidades administrativas
 */
export const useAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);

  // === ESTADÍSTICAS ===
  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  }, []);

  // === GESTIÓN DE CONCURSOS ===
  const [concursos, setConcursos] = useState<Concurso[]>([]);

  const loadConcursos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getAllConcursos();
      setConcursos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar concursos');
    } finally {
      setLoading(false);
    }
  }, []);

  const createConcurso = useCallback(async (concurso: CreateConcursoDto) => {
    try {
      setLoading(true);
      setError(null);
      const newConcurso = await adminService.createConcurso(concurso);
      setConcursos(prev => [...prev, newConcurso]);
      return newConcurso;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear concurso';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateConcurso = useCallback(async (id: number, concurso: UpdateConcursoDto) => {
    try {
      setLoading(true);
      setError(null);
      const updatedConcurso = await adminService.updateConcurso(id, concurso);
      setConcursos(prev => prev.map(c => c.id === id ? updatedConcurso : c));
      return updatedConcurso;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar concurso';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteConcurso = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await adminService.deleteConcurso(id);
      setConcursos(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar concurso';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const cambiarEstadoConcurso = useCallback(async (id: number, status: string) => {
    try {
      setLoading(true);
      setError(null);
      const updatedConcurso = await adminService.cambiarEstadoConcurso(id, status);
      setConcursos(prev => prev.map(c => c.id === id ? updatedConcurso : c));
      return updatedConcurso;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cambiar estado del concurso';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // === GESTIÓN DE USUARIOS ===
  const [users, setUsers] = useState<PaginatedResponse<User>>({ data: [], total: 0, page: 1, totalPages: 0 });

  const loadUsers = useCallback(async (filters: UserFilters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getUsers(filters);
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserRole = useCallback(async (userId: string, role: string) => {
    try {
      setLoading(true);
      setError(null);
      const updatedUser = await adminService.updateUserRole(userId, role);
      setUsers(prev => ({
        ...prev,
        data: prev.data.map(u => u.id === userId ? updatedUser : u)
      }));
      return updatedUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar rol del usuario';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleUserStatus = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      const updatedUser = await adminService.toggleUserStatus(userId);
      setUsers(prev => ({
        ...prev,
        data: prev.data.map(u => u.id === userId ? updatedUser : u)
      }));
      return updatedUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cambiar estado del usuario';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // === GESTIÓN DE JURADOS ===
  const [jurados, setJurados] = useState<User[]>([]);
  const [asignaciones, setAsignaciones] = useState<JuradoAsignacion[]>([]);

  const loadJurados = useCallback(async (especialidad?: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getJuradosByEspecialidad(especialidad);
      setJurados(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar jurados');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAsignaciones = useCallback(async (concursoId?: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getAsignacionesJurados(concursoId);
      setAsignaciones(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar asignaciones');
    } finally {
      setLoading(false);
    }
  }, []);

  const asignarJurado = useCallback(async (usuarioId: string, categoriaId: number) => {
    try {
      setLoading(true);
      setError(null);
      const newAsignacion = await adminService.asignarJurado(usuarioId, categoriaId);
      setAsignaciones(prev => [...prev, newAsignacion]);
      return newAsignacion;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al asignar jurado';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const removerAsignacion = useCallback(async (asignacionId: string) => {
    try {
      setLoading(true);
      setError(null);
      await adminService.removerAsignacionJurado(asignacionId);
      setAsignaciones(prev => prev.filter(a => a.id !== asignacionId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al remover asignación';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // === MÉTRICAS ===
  const [metricas, setMetricas] = useState<any>(null);

  const loadMetricas = useCallback(async (tipo: 'participacion' | 'jurados' | 'crecimiento') => {
    try {
      setLoading(true);
      setError(null);
      let data;
      switch (tipo) {
        case 'participacion':
          data = await adminService.getMetricasParticipacion();
          break;
        case 'jurados':
          data = await adminService.getMetricasJurados();
          break;
        case 'crecimiento':
          data = await adminService.getTendenciasCrecimiento();
          break;
      }
      setMetricas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar métricas');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar estadísticas al montar el hook
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    // Estado general
    loading,
    error,
    setError,

    // Estadísticas
    stats,
    loadStats,

    // Concursos
    concursos,
    loadConcursos,
    createConcurso,
    updateConcurso,
    deleteConcurso,
    cambiarEstadoConcurso,

    // Usuarios
    users,
    loadUsers,
    updateUserRole,
    toggleUserStatus,

    // Jurados
    jurados,
    asignaciones,
    loadJurados,
    loadAsignaciones,
    asignarJurado,
    removerAsignacion,

    // Métricas
    metricas,
    loadMetricas
  };
};