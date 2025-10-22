import { useState, useEffect } from 'react';
import { concursoService } from '../services/concurso.service';
import type { Concurso, Categoria } from '../types';

export interface ConcursoConCategorias extends Concurso {
  categorias?: Categoria[];
  inscrito?: boolean;
  fecha_inscripcion?: Date;
}

/**
 * Hook para gestionar concursos
 */
export const useConcursos = () => {
  const [concursosActivos, setConcursosActivos] = useState<Concurso[]>([]);
  const [concursosFinalizados, setConcursosFinalizados] = useState<Concurso[]>([]);
  const [misInscripciones, setMisInscripciones] = useState<Array<{ concurso: Concurso; fecha_inscripcion: Date }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carga los concursos activos
   */
  const loadConcursosActivos = async () => {
    try {
      setLoading(true);
      setError(null);
      const concursos = await concursoService.getConcursosActivos();
      setConcursosActivos(concursos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar concursos activos');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Carga los concursos finalizados
   */
  const loadConcursosFinalizados = async () => {
    try {
      setLoading(true);
      setError(null);
      const concursos = await concursoService.getConcursosFinalizados();
      setConcursosFinalizados(concursos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar concursos finalizados');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Carga las inscripciones del usuario
   */
  const loadMisInscripciones = async () => {
    try {
      setLoading(true);
      setError(null);
      const inscripciones = await concursoService.getMisInscripciones();
      setMisInscripciones(inscripciones);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar inscripciones');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Inscribe al usuario a un concurso
   */
  const inscribirseAConcurso = async (concursoId: number): Promise<boolean> => {
    try {
      setError(null);
      await concursoService.inscribirseAConcurso(concursoId);
      // Recargar inscripciones después de inscribirse
      await loadMisInscripciones();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al inscribirse al concurso');
      return false;
    }
  };

  /**
   * Cancela la inscripción a un concurso
   */
  const cancelarInscripcion = async (concursoId: number): Promise<boolean> => {
    try {
      setError(null);
      await concursoService.cancelarInscripcion(concursoId);
      // Recargar inscripciones después de cancelar
      await loadMisInscripciones();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cancelar inscripción');
      return false;
    }
  };

  /**
   * Verifica si el usuario está inscrito a un concurso
   */
  const verificarInscripcion = async (concursoId: number): Promise<{ inscrito: boolean; fecha_inscripcion?: Date }> => {
    try {
      return await concursoService.verificarInscripcion(concursoId);
    } catch (err) {
      console.error('Error al verificar inscripción:', err);
      return { inscrito: false };
    }
  };

  /**
   * Obtiene un concurso por ID con categorías
   */
  const getConcursoById = async (id: number): Promise<ConcursoConCategorias | null> => {
    try {
      setError(null);
      const concurso = await concursoService.getConcursoById(id);
      const inscripcion = await verificarInscripcion(id);
      
      return {
        ...concurso,
        inscrito: inscripcion.inscrito,
        fecha_inscripcion: inscripcion.fecha_inscripcion
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener concurso');
      return null;
    }
  };

  /**
   * Filtra concursos por tipo de medio
   */
  const filtrarConcursosPorTipoMedio = (concursos: Concurso[], tipoMedio?: string): Concurso[] => {
    if (!tipoMedio) return concursos;
    
    // Esta lógica se puede expandir cuando tengamos más información sobre cómo se relacionan
    // los concursos con los tipos de medio en el backend
    return concursos;
  };

  /**
   * Obtiene estadísticas de concursos
   */
  const getEstadisticas = () => {
    return {
      totalActivos: concursosActivos.length,
      totalFinalizados: concursosFinalizados.length,
      totalInscripciones: misInscripciones.length,
      concursosProximosAFinalizar: concursosActivos.filter(c => {
        const diasRestantes = Math.ceil((new Date(c.fecha_final).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return diasRestantes <= 7;
      }).length
    };
  };

  // Cargar datos iniciales
  useEffect(() => {
    loadConcursosActivos();
    loadMisInscripciones();
  }, []);

  return {
    // Estado
    concursosActivos,
    concursosFinalizados,
    misInscripciones,
    loading,
    error,
    
    // Acciones
    loadConcursosActivos,
    loadConcursosFinalizados,
    loadMisInscripciones,
    inscribirseAConcurso,
    cancelarInscripcion,
    verificarInscripcion,
    getConcursoById,
    filtrarConcursosPorTipoMedio,
    getEstadisticas,
    
    // Utilidades
    clearError: () => setError(null)
  };
};

export default useConcursos;