import { useState, useEffect, useCallback } from 'react';
import { juryFeedbackService } from '../services/jury-feedback.service';
import type {
    JuryFeedback,
    FeedbackStats,
    CreateFeedbackDto,
    FeedbackFilters,
    PeerJuror
} from '../types/jury-feedback';
import type { PaginatedResponse } from '../types';

/**
 * Hook para gestión de feedback entre jurados especializados
 */
export const useJuryFeedback = () => {
    const [peerJurors, setPeerJurors] = useState<PeerJuror[]>([]);
    const [receivedFeedbacks, setReceivedFeedbacks] = useState<PaginatedResponse<JuryFeedback>>({
        data: [],
        total: 0,
        page: 1,
        totalPages: 0
    });
    const [givenFeedbacks, setGivenFeedbacks] = useState<PaginatedResponse<JuryFeedback>>({
        data: [],
        total: 0,
        page: 1,
        totalPages: 0
    });
    const [feedbackStats, setFeedbackStats] = useState<FeedbackStats | null>(null);
    const [feedbackOpportunities, setFeedbackOpportunities] = useState<Array<{
        jurado: PeerJuror;
        medios_comunes: Array<{
            id: number;
            titulo: string;
            tipo_medio: string;
        }>;
    }>>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Carga la lista de jurados pares
     */
    const loadPeerJurors = useCallback(async () => {
        try {
            setError(null);
            const data = await juryFeedbackService.getPeerJurors();
            setPeerJurors(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar jurados pares');
        }
    }, []);

    /**
     * Carga los feedbacks recibidos
     */
    const loadReceivedFeedbacks = useCallback(async (filtros?: FeedbackFilters) => {
        try {
            setLoading(true);
            setError(null);
            const data = await juryFeedbackService.getReceivedFeedbacks(filtros);
            setReceivedFeedbacks(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar feedbacks recibidos');
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Carga los feedbacks dados
     */
    const loadGivenFeedbacks = useCallback(async (filtros?: FeedbackFilters) => {
        try {
            setLoading(true);
            setError(null);
            const data = await juryFeedbackService.getGivenFeedbacks(filtros);
            setGivenFeedbacks(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar feedbacks dados');
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Carga las estadísticas de feedback
     */
    const loadFeedbackStats = useCallback(async () => {
        try {
            setError(null);
            const data = await juryFeedbackService.getFeedbackStats();
            setFeedbackStats(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar estadísticas de feedback');
        }
    }, []);

    /**
     * Carga las oportunidades de feedback disponibles
     */
    const loadFeedbackOpportunities = useCallback(async () => {
        try {
            setError(null);
            const data = await juryFeedbackService.getAvailableFeedbackOpportunities();
            setFeedbackOpportunities(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar oportunidades de feedback');
        }
    }, []);

    /**
     * Crea un nuevo feedback
     */
    const createFeedback = useCallback(async (feedback: CreateFeedbackDto) => {
        try {
            setLoading(true);
            setError(null);

            // Validar feedback antes de enviar
            const validation = juryFeedbackService.validateFeedback(feedback);
            if (!validation.valid) {
                throw new Error(validation.errors.join(', '));
            }

            const resultado = await juryFeedbackService.createFeedback(feedback);

            // Recargar datos después de crear el feedback
            await Promise.all([
                loadGivenFeedbacks(),
                loadFeedbackStats(),
                loadFeedbackOpportunities()
            ]);

            return resultado;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al crear feedback';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [loadGivenFeedbacks, loadFeedbackStats, loadFeedbackOpportunities]);

    /**
     * Carga inicial de datos
     */
    useEffect(() => {
        loadPeerJurors();
        loadFeedbackStats();
        loadFeedbackOpportunities();
    }, [loadPeerJurors, loadFeedbackStats, loadFeedbackOpportunities]);

    return {
        // Estado
        peerJurors,
        receivedFeedbacks,
        givenFeedbacks,
        feedbackStats,
        feedbackOpportunities,
        loading,
        error,

        // Acciones
        loadPeerJurors,
        loadReceivedFeedbacks,
        loadGivenFeedbacks,
        loadFeedbackStats,
        loadFeedbackOpportunities,
        createFeedback,

        // Utilidades
        getFeedbackTypeIcon: juryFeedbackService.getFeedbackTypeIcon.bind(juryFeedbackService),
        getFeedbackTypeColor: juryFeedbackService.getFeedbackTypeColor.bind(juryFeedbackService),
        formatRating: juryFeedbackService.formatRating.bind(juryFeedbackService),
        getRatingDescription: juryFeedbackService.getRatingDescription.bind(juryFeedbackService),
        validateFeedback: juryFeedbackService.validateFeedback.bind(juryFeedbackService)
    };
};