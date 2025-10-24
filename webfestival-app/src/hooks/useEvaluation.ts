import { useState, useEffect, useCallback } from 'react';
import { evaluationService } from '../services/evaluation.service';
import type { 
  AsignacionJurado, 
  MedioParaEvaluacion, 
  FormularioCalificacion, 
  ProgresoEvaluacion,
  EstadisticasJurado,
  FiltrosEvaluacion,
  JuradoEspecializacion,
  PaginatedResponse,
  CriteriosPorTipo,
  PerformanceMetrics,
  UpdateEspecializacionDto
} from '../types';

/**
 * Hook para gestión de evaluaciones de jurados
 */
export const useEvaluation = () => {
  const [asignaciones, setAsignaciones] = useState<AsignacionJurado[]>([]);
  const [mediosParaEvaluacion, setMediosParaEvaluacion] = useState<PaginatedResponse<MedioParaEvaluacion>>({
    data: [],
    total: 0,
    page: 1,
    totalPages: 0
  });
  const [criteriosPorTipo, setCriteriosPorTipo] = useState<CriteriosPorTipo>({
    fotografia: [],
    video: [],
    audio: [],
    corto_cine: [],
    universales: []
  });
  const [progreso, setProgreso] = useState<ProgresoEvaluacion[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasJurado | null>(null);
  const [especializacion, setEspecializacion] = useState<JuradoEspecializacion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carga las asignaciones del jurado actual
   */
  const loadAsignaciones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await evaluationService.getMisAsignaciones();
      setAsignaciones(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar asignaciones');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Carga los medios para evaluación con filtros
   */
  const loadMediosParaEvaluacion = useCallback(async (filtros?: FiltrosEvaluacion) => {
    try {
      setLoading(true);
      setError(null);
      const data = await evaluationService.getMediosParaEvaluacion(filtros);
      setMediosParaEvaluacion(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar medios para evaluación');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Carga los criterios organizados por tipo de medio
   */
  const loadCriteriosPorTipo = useCallback(async () => {
    try {
      setError(null);
      const data = await evaluationService.getTodosCriteriosPorTipo();
      setCriteriosPorTipo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar criterios');
    }
  }, []);

  /**
   * Carga el progreso de evaluaciones
   */
  const loadProgreso = useCallback(async () => {
    try {
      setError(null);
      const data = await evaluationService.getProgresoEvaluaciones();
      setProgreso(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar progreso');
    }
  }, []);

  /**
   * Carga las estadísticas del jurado
   */
  const loadEstadisticas = useCallback(async () => {
    try {
      setError(null);
      const data = await evaluationService.getEstadisticasJurado();
      setEstadisticas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar estadísticas');
    }
  }, []);

  /**
   * Carga la especialización del jurado
   */
  const loadEspecializacion = useCallback(async () => {
    try {
      setError(null);
      const data = await evaluationService.getMiEspecializacion();
      setEspecializacion(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar especialización');
    }
  }, []);

  /**
   * Envía una calificación
   */
  const enviarCalificacion = useCallback(async (calificacion: FormularioCalificacion) => {
    try {
      setLoading(true);
      setError(null);
      const resultado = await evaluationService.enviarCalificacion(calificacion);
      
      // Actualizar la lista de medios para reflejar el cambio
      await loadMediosParaEvaluacion();
      await loadProgreso();
      await loadEstadisticas();
      
      return resultado;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al enviar calificación';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [loadMediosParaEvaluacion, loadProgreso, loadEstadisticas]);

  /**
   * Actualiza una calificación existente
   */
  const actualizarCalificacion = useCallback(async (calificacionId: number, calificacion: FormularioCalificacion) => {
    try {
      setLoading(true);
      setError(null);
      const resultado = await evaluationService.actualizarCalificacion(calificacionId, calificacion);
      
      // Actualizar la lista de medios para reflejar el cambio
      await loadMediosParaEvaluacion();
      await loadProgreso();
      await loadEstadisticas();
      
      return resultado;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar calificación';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [loadMediosParaEvaluacion, loadProgreso, loadEstadisticas]);

  /**
   * Actualiza la especialización del jurado
   */
  const actualizarEspecializacion = useCallback(async (nuevaEspecializacion: UpdateEspecializacionDto) => {
    try {
      setLoading(true);
      setError(null);
      const resultado = await evaluationService.actualizarEspecializacion(nuevaEspecializacion);
      setEspecializacion(resultado);
      
      // Recargar asignaciones ya que pueden haber cambiado
      await loadAsignaciones();
      
      return resultado;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar especialización';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [loadAsignaciones]);

  /**
   * Obtiene métricas de rendimiento del jurado
   */
  const getPerformanceMetrics = useCallback(async (juradoId?: string): Promise<PerformanceMetrics> => {
    try {
      setError(null);
      return await evaluationService.getPerformanceMetrics(juradoId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar métricas de rendimiento';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Obtiene un medio específico para evaluación
   */
  const getMedioParaEvaluacion = useCallback(async (medioId: number) => {
    try {
      setError(null);
      return await evaluationService.getMedioParaEvaluacion(medioId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar medio';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Obtiene criterios para un tipo de medio específico
   */
  const getCriteriosPorTipoMedio = useCallback(async (tipoMedio: string) => {
    try {
      setError(null);
      return await evaluationService.getCriteriosPorTipoMedio(tipoMedio);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar criterios';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Carga inicial de datos
   */
  useEffect(() => {
    loadAsignaciones();
    loadCriteriosPorTipo();
    loadProgreso();
    loadEstadisticas();
    loadEspecializacion();
  }, [loadAsignaciones, loadCriteriosPorTipo, loadProgreso, loadEstadisticas, loadEspecializacion]);

  return {
    // Estado
    asignaciones,
    mediosParaEvaluacion,
    criteriosPorTipo,
    progreso,
    estadisticas,
    especializacion,
    loading,
    error,

    // Acciones
    loadAsignaciones,
    loadMediosParaEvaluacion,
    loadCriteriosPorTipo,
    loadProgreso,
    loadEstadisticas,
    loadEspecializacion,
    enviarCalificacion,
    actualizarCalificacion,
    actualizarEspecializacion,
    getMedioParaEvaluacion,
    getCriteriosPorTipoMedio,
    getPerformanceMetrics,

    // Utilidades
    getMetadatosRelevantes: evaluationService.getMetadatosRelevantes.bind(evaluationService),
    getMediaTypeIcon: evaluationService.getMediaTypeIcon.bind(evaluationService),
    getMediaTypeColor: evaluationService.getMediaTypeColor.bind(evaluationService),
    validateCalificacion: evaluationService.validateCalificacion.bind(evaluationService)
  };
};