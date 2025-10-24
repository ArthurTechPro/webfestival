import { apiService } from './api';
import type { Medio, PaginatedResponse } from '../types';

export interface UploadRequest {
    titulo: string;
    tipo_medio: 'fotografia' | 'video' | 'audio' | 'corto_cine';
    categoria_id: number;
    formato: string;
    tamaño_archivo: number;
}

export interface UploadResponse {
    uploadUrl: string;
    uploadId: string;
    expiresIn: number;
}

export interface ProcessUploadRequest {
    uploadId: string;
    immichAssetId: string;
}

export interface ValidationConfig {
    maxFileSize: number;
    allowedFormats: {
        fotografia: string[];
        video: string[];
        audio: string[];
        corto_cine: string[];
    };
}

export interface MedioConResultados extends Medio {
    usuario: {
        nombre: string;
        picture_url?: string;
    };
    concurso: {
        titulo: string;
    };
    posicion?: number;
    puntaje_final?: number;
    calificaciones?: Array<{
        comentarios?: string;
        fecha_calificacion: Date;
        detalles: Array<{
            criterio: {
                nombre: string;
                descripcion?: string;
            };
            puntuacion: number;
        }>;
    }>;
}

/**
 * Servicio para gestión de medios multimedia
 */
export class MediaService {
    /**
     * Obtiene la configuración de validación para subida de archivos
     */
    async getValidationConfig(): Promise<ValidationConfig> {
        const response = await apiService.get<ValidationConfig>('/api/media/validation-config');
        return response.data || {
            maxFileSize: 10485760, // 10MB por defecto
            allowedFormats: {
                fotografia: ['image/jpeg', 'image/png', 'image/webp'],
                video: ['video/mp4', 'video/webm'],
                audio: ['audio/mp3', 'audio/wav', 'audio/flac'],
                corto_cine: ['video/mp4', 'video/mov']
            }
        };
    }

    /**
     * Genera una URL segura para subir un archivo
     */
    async generateUploadUrl(concursoId: number, uploadRequest: UploadRequest): Promise<UploadResponse> {
        const response = await apiService.post<UploadResponse>(`/api/media/contests/${concursoId}/upload-url`, uploadRequest);
        if (!response.data) {
            throw new Error('Error al generar URL de subida');
        }
        return response.data;
    }

    /**
     * Procesa la subida completada
     */
    async processUpload(concursoId: number, processRequest: ProcessUploadRequest): Promise<Medio> {
        const response = await apiService.post<Medio>(`/api/media/contests/${concursoId}/process-upload`, processRequest);
        if (!response.data) {
            throw new Error('Error al procesar la subida');
        }
        return response.data;
    }

    /**
     * Obtiene un medio por ID
     */
    async getMediaById(id: number): Promise<MedioConResultados> {
        const response = await apiService.get<MedioConResultados>(`/api/media/${id}`);
        if (!response.data) {
            throw new Error('Medio no encontrado');
        }
        return response.data;
    }

    /**
     * Obtiene los medios de un usuario
     */
    async getMediaByUser(userId: string): Promise<MedioConResultados[]> {
        const response = await apiService.get<MedioConResultados[]>(`/api/media/user/${userId}`);
        return response.data || [];
    }

    /**
     * Obtiene los medios de un concurso
     */
    async getMediaByContest(concursoId: number): Promise<MedioConResultados[]> {
        const response = await apiService.get<MedioConResultados[]>(`/api/media/contests/${concursoId}`);
        return response.data || [];
    }

    /**
     * Actualiza un medio
     */
    async updateMedia(id: number, updateData: Partial<Medio>): Promise<Medio> {
        const response = await apiService.put<Medio>(`/api/media/${id}`, updateData);
        if (!response.data) {
            throw new Error('Error al actualizar el medio');
        }
        return response.data;
    }

    /**
     * Elimina un medio
     */
    async deleteMedia(id: number): Promise<void> {
        await apiService.delete(`/api/media/${id}`);
    }

    /**
     * Obtiene la galería de medios ganadores
     */
    async getWinnerGallery(filters?: {
        tipo_medio?: string;
        concurso_id?: number;
        año?: number;
        page?: number;
        limit?: number;
    }): Promise<PaginatedResponse<MedioConResultados>> {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined) {
                    params.append(key, value.toString());
                }
            });
        }

        const url = `/api/media/gallery/winners${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await apiService.get<PaginatedResponse<MedioConResultados>>(url);
        return response.data || { data: [], total: 0, page: 1, totalPages: 0 };
    }

    /**
     * Obtiene la galería de medios destacados
     */
    async getFeaturedGallery(filters?: {
        limit?: number;
        tipo_medio?: string;
    }): Promise<MedioConResultados[]> {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined) {
                    params.append(key, value.toString());
                }
            });
        }

        const url = `/api/media/gallery/featured${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await apiService.get<MedioConResultados[]>(url);
        return response.data || [];
    }

    /**
     * Valida un archivo antes de la subida
     */
    validateFile(file: File, tipo_medio: string, config: ValidationConfig): { valid: boolean; error?: string } {
        // Validar tamaño
        if (file.size > config.maxFileSize) {
            return {
                valid: false,
                error: `El archivo es demasiado grande. Máximo permitido: ${(config.maxFileSize / 1024 / 1024).toFixed(1)}MB`
            };
        }

        // Validar formato
        const allowedFormats = config.allowedFormats[tipo_medio as keyof typeof config.allowedFormats];
        if (!allowedFormats || !allowedFormats.includes(file.type)) {
            return {
                valid: false,
                error: `Formato no permitido. Formatos aceptados: ${allowedFormats?.join(', ') || 'ninguno'}`
            };
        }

        return { valid: true };
    }

    /**
     * Obtiene el icono apropiado para un tipo de medio
     */
    getMediaTypeIcon(tipo_medio: string): string {
        const icons = {
            fotografia: '📸',
            video: '🎬',
            audio: '🎵',
            corto_cine: '🎭'
        };
        return icons[tipo_medio as keyof typeof icons] || '📄';
    }

    /**
     * Formatea el tamaño de archivo para mostrar
     */
    formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Formatea la duración para mostrar (para videos y audios)
     */
    formatDuration(seconds?: number): string {
        if (!seconds) return 'N/A';

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
}

export const mediaService = new MediaService();