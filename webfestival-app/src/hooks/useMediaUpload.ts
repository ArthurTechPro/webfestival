import { useState, useCallback } from 'react';
import { mediaService, type UploadRequest, type ValidationConfig } from '../services/media.service';
import type { Medio } from '../types';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadState {
  isUploading: boolean;
  progress: UploadProgress;
  error: string | null;
  uploadedMedia: Medio | null;
}

/**
 * Hook para gestionar la subida de medios multimedia
 */
export const useMediaUpload = () => {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: { loaded: 0, total: 0, percentage: 0 },
    error: null,
    uploadedMedia: null
  });

  const [validationConfig, setValidationConfig] = useState<ValidationConfig | null>(null);

  /**
   * Carga la configuración de validación
   */
  const loadValidationConfig = useCallback(async () => {
    try {
      const config = await mediaService.getValidationConfig();
      setValidationConfig(config);
      return config;
    } catch (error) {
      console.error('Error al cargar configuración de validación:', error);
      return null;
    }
  }, []);

  /**
   * Valida un archivo antes de la subida
   */
  const validateFile = useCallback((file: File, tipoMedio: string): { valid: boolean; error?: string } => {
    if (!validationConfig) {
      return { valid: false, error: 'Configuración de validación no disponible' };
    }

    return mediaService.validateFile(file, tipoMedio, validationConfig);
  }, [validationConfig]);

  /**
   * Sube un archivo multimedia
   */
  const uploadMedia = useCallback(async (
    file: File,
    concursoId: number,
    uploadRequest: UploadRequest
  ): Promise<Medio | null> => {
    try {
      // Resetear estado
      setUploadState({
        isUploading: true,
        progress: { loaded: 0, total: file.size, percentage: 0 },
        error: null,
        uploadedMedia: null
      });

      // Validar archivo
      if (validationConfig) {
        const validation = validateFile(file, uploadRequest.tipo_medio);
        if (!validation.valid) {
          throw new Error(validation.error);
        }
      }

      // Generar URL de subida
      const uploadResponse = await mediaService.generateUploadUrl(concursoId, uploadRequest);

      // Simular progreso de subida (en una implementación real, esto vendría del XMLHttpRequest)
      const simulateProgress = () => {
        let loaded = 0;
        const interval = setInterval(() => {
          loaded += file.size * 0.1; // 10% cada vez
          if (loaded >= file.size) {
            loaded = file.size;
            clearInterval(interval);
          }
          
          setUploadState(prev => ({
            ...prev,
            progress: {
              loaded,
              total: file.size,
              percentage: Math.round((loaded / file.size) * 100)
            }
          }));
        }, 200);
        
        return interval;
      };

      const progressInterval = simulateProgress();

      try {
        // Subir archivo a Immich (simulado)
        // En una implementación real, aquí se haría la subida real al servidor Immich
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simular tiempo de subida
        
        clearInterval(progressInterval);

        // Procesar la subida completada
        const processedMedia = await mediaService.processUpload(concursoId, {
          uploadId: uploadResponse.uploadId,
          immichAssetId: `asset_${Date.now()}` // En la implementación real, esto vendría de Immich
        });

        setUploadState(prev => ({
          ...prev,
          isUploading: false,
          uploadedMedia: processedMedia
        }));

        return processedMedia;
      } catch (uploadError) {
        clearInterval(progressInterval);
        throw uploadError;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al subir archivo';
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        error: errorMessage
      }));
      return null;
    }
  }, [validationConfig, validateFile]);

  /**
   * Resetea el estado de subida
   */
  const resetUploadState = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: { loaded: 0, total: 0, percentage: 0 },
      error: null,
      uploadedMedia: null
    });
  }, []);

  /**
   * Obtiene el preview de un archivo
   */
  const getFilePreview = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('Error al leer archivo'));
        }
      };
      reader.onerror = () => reject(new Error('Error al leer archivo'));
      
      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('video/')) {
        reader.readAsDataURL(file);
      } else {
        // Para archivos de audio, no hay preview visual
        resolve('');
      }
    });
  }, []);

  /**
   * Obtiene información del archivo
   */
  const getFileInfo = useCallback((file: File) => {
    return {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified),
      formattedSize: mediaService.formatFileSize(file.size)
    };
  }, []);

  return {
    // Estado
    uploadState,
    validationConfig,
    
    // Acciones
    loadValidationConfig,
    validateFile,
    uploadMedia,
    resetUploadState,
    getFilePreview,
    getFileInfo,
    
    // Utilidades del servicio
    getMediaTypeIcon: mediaService.getMediaTypeIcon,
    formatFileSize: mediaService.formatFileSize,
    formatDuration: mediaService.formatDuration
  };
};

export default useMediaUpload;