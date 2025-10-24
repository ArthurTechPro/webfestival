import { apiService } from './api';
import type { Concurso, Categoria } from '../types';

/**
 * Servicio para gestión de concursos
 */
export class ConcursoService {
    /**
     * Obtiene todos los concursos activos
     */
    async getConcursosActivos(): Promise<Concurso[]> {
        const response = await apiService.get<Concurso[]>('/api/concursos/activos');
        return response.data || [];
    }

    /**
     * Obtiene todos los concursos finalizados
     */
    async getConcursosFinalizados(): Promise<Concurso[]> {
        const response = await apiService.get<Concurso[]>('/api/concursos/finalizados');
        return response.data || [];
    }

    /**
     * Obtiene un concurso por ID con sus categorías
     */
    async getConcursoById(id: number): Promise<Concurso & { categorias: Categoria[] }> {
        const response = await apiService.get<Concurso & { categorias: Categoria[] }>(`/api/concursos/${id}`);
        if (!response.data) {
            throw new Error('Concurso no encontrado');
        }
        return response.data;
    }

    /**
     * Inscribe al usuario actual a un concurso
     */
    async inscribirseAConcurso(concursoId: number): Promise<void> {
        await apiService.post('/api/concursos/inscripcion', { concursoId });
    }

    /**
     * Cancela la inscripción del usuario a un concurso
     */
    async cancelarInscripcion(concursoId: number): Promise<void> {
        await apiService.delete(`/api/concursos/inscripcion/${concursoId}`);
    }

    /**
     * Obtiene las inscripciones del usuario actual
     */
    async getMisInscripciones(): Promise<Array<{ concurso: Concurso; fecha_inscripcion: Date }>> {
        const response = await apiService.get<Array<{ concurso: Concurso; fecha_inscripcion: Date }>>('/api/concursos/mis-inscripciones');
        return response.data || [];
    }

    /**
     * Verifica si el usuario está inscrito a un concurso
     */
    async verificarInscripcion(concursoId: number): Promise<{ inscrito: boolean; fecha_inscripcion?: Date }> {
        const response = await apiService.get<{ inscrito: boolean; fecha_inscripcion?: Date }>(`/api/concursos/${concursoId}/verificar-inscripcion`);
        return response.data || { inscrito: false };
    }

    /**
     * Obtiene categorías de un concurso organizadas por tipo de medio
     */
    async getCategoriasPorTipoMedio(concursoId: number): Promise<Record<string, Categoria[]>> {
        const response = await apiService.get<Record<string, Categoria[]>>(`/api/media/contests/${concursoId}/categories`);
        return response.data || {};
    }
}

export const concursoService = new ConcursoService();