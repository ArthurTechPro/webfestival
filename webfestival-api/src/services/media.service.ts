import { Medio, TipoMedio } from '@/types';
import { prisma } from '@/lib/prisma';
import { immichService } from './immich.service';
import { AssetResponseDto } from '@immich/sdk';
import { z } from 'zod';

/**
 * Configuración de validación por tipo de medio
 */
export const MEDIA_VALIDATION_CONFIG = {
  fotografia: {
    formats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    maxSizeMB: 10,
    maxDimensions: { width: 4000, height: 4000 },
    extensions: ['.jpg', '.jpeg', '.png', '.webp']
  },
  video: {
    formats: ['video/mp4', 'video/webm', 'video/quicktime'],
    maxSizeMB: 100,
    maxDuration: 600, // 10 minutos en segundos
    extensions: ['.mp4', '.webm', '.mov']
  },
  audio: {
    formats: ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/mp3'],
    maxSizeMB: 50,
    maxDuration: 1800, // 30 minutos en segundos
    extensions: ['.mp3', '.wav', '.flac']
  },
  corto_cine: {
    formats: ['video/mp4', 'video/webm', 'video/quicktime'],
    maxSizeMB: 500,
    maxDuration: 1800, // 30 minutos en segundos
    extensions: ['.mp4', '.webm', '.mov']
  }
} as const;

/**
 * Esquemas de validación para subida de medios
 */
const uploadRequestSchema = z.object({
  titulo: z.string().min(1, 'El título es requerido').max(100, 'El título no puede exceder 100 caracteres'),
  tipo_medio: z.enum(['fotografia', 'video', 'audio', 'corto_cine']),
  categoria_id: z.number().int().positive('ID de categoría debe ser positivo'),
  file_size: z.number().positive('El tamaño del archivo debe ser positivo'),
  file_type: z.string().min(1, 'El tipo de archivo es requerido'),
  file_name: z.string().min(1, 'El nombre del archivo es requerido')
});

const processUploadSchema = z.object({
  asset_id: z.string().min(1, 'ID del asset de Immich es requerido'),
  titulo: z.string().min(1, 'El título es requerido'),
  tipo_medio: z.enum(['fotografia', 'video', 'audio', 'corto_cine']),
  categoria_id: z.number().int().positive(),
  file_size: z.number().positive(),
  file_type: z.string().min(1),
  original_filename: z.string().min(1)
});

export interface UploadUrlRequest {
  titulo: string;
  tipo_medio: TipoMedio;
  categoria_id: number;
  file_size: number;
  file_type: string;
  file_name: string;
}

export interface UploadUrlResponse {
  upload_token: string;
  upload_url: string;
  expires_at: Date;
  max_file_size: number;
  allowed_formats: readonly string[];
  validation_rules: MediaValidationRules;
}

export interface ProcessUploadRequest {
  asset_id: string;
  titulo: string;
  tipo_medio: TipoMedio;
  categoria_id: number;
  file_size: number;
  file_type: string;
  original_filename: string;
}

export interface MediaValidationRules {
  maxSizeMB: number;
  maxDimensions?: { width: number; height: number };
  maxDuration?: number;
  allowedFormats: readonly string[];
  allowedExtensions: readonly string[];
}

export interface ProcessedMediaMetadata {
  exif?: Record<string, any>;
  dimensions?: { width: number; height: number };
  duration?: number;
  format: string;
  fileSize: number;
  originalFilename: string;
  immich_asset_id: string;
}

export interface OptimizedVersions {
  original: string;
  preview?: string;
  thumbnail?: string;
}

export class MediaService {
  /**
   * Genera una URL segura para subir medios multimedia
   */
  async generateUploadUrl(
    userId: string, 
    concursoId: number, 
    request: UploadUrlRequest
  ): Promise<UploadUrlResponse> {
    // Validar entrada
    const validatedRequest = uploadRequestSchema.parse(request);
    
    // Verificar que el usuario esté inscrito en el concurso
    await this.validateUserEnrollment(userId, concursoId);
    
    // Verificar límites del concurso y usuario
    await this.validateUploadLimits(userId, concursoId, validatedRequest.tipo_medio);
    
    // Validar archivo según tipo de medio
    const validationRules = this.getValidationRules(validatedRequest.tipo_medio, concursoId);
    this.validateFileSpecs(validatedRequest, validationRules);
    
    // Verificar conexión con Immich
    immichService.ensureConnection();
    
    // Generar token de subida temporal (válido por 1 hora)
    const uploadToken = this.generateUploadToken(userId, concursoId, validatedRequest);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
    
    // En una implementación real, aquí generaríamos una URL pre-firmada
    // Por ahora, devolvemos la URL del endpoint de procesamiento
    const uploadUrl = `/api/media/process-upload`;
    
    return {
      upload_token: uploadToken,
      upload_url: uploadUrl,
      expires_at: expiresAt,
      max_file_size: validationRules.maxSizeMB * 1024 * 1024,
      allowed_formats: validationRules.allowedFormats,
      validation_rules: validationRules
    };
  }

  /**
   * Procesa la subida de un medio después de que se haya subido a Immich
   */
  async processUpload(
    userId: string,
    concursoId: number,
    uploadToken: string,
    request: ProcessUploadRequest
  ): Promise<Medio> {
    // Validar entrada
    const validatedRequest = processUploadSchema.parse(request);
    
    // Verificar token de subida
    this.validateUploadToken(uploadToken, userId, concursoId, validatedRequest);
    
    // Verificar que el asset existe en Immich y obtener metadatos
    const assetInfo = await this.getAssetFromImmich(validatedRequest.asset_id);
    
    // Procesar metadatos específicos por tipo de medio
    const processedMetadata = await this.processMediaMetadata(
      assetInfo, 
      validatedRequest.tipo_medio,
      validatedRequest.original_filename
    );
    
    // Generar versiones optimizadas
    const optimizedVersions = await this.generateOptimizedVersions(
      assetInfo,
      validatedRequest.tipo_medio
    );
    
    // Guardar en base de datos
    const medio = await prisma.medio.create({
      data: {
        titulo: validatedRequest.titulo,
        tipo_medio: validatedRequest.tipo_medio,
        usuario_id: userId,
        concurso_id: concursoId,
        categoria_id: validatedRequest.categoria_id,
        medio_url: optimizedVersions.original,
        thumbnail_url: optimizedVersions.thumbnail || null,
        preview_url: optimizedVersions.preview || null,
        duracion: processedMetadata.duration || null,
        formato: processedMetadata.format,
        tamano_archivo: BigInt(processedMetadata.fileSize),
        metadatos: processedMetadata as any
      }
    });

    return this.mapPrismaToMedio(medio);
  }

  /**
   * Obtiene un medio por ID
   */
  async getMediaById(id: number): Promise<Medio | null> {
    const medio = await prisma.medio.findUnique({
      where: { id },
      include: {
        usuario: true,
        concurso: true,
        categoria: true
      }
    });

    return medio ? this.mapPrismaToMedio(medio) : null;
  }

  /**
   * Obtiene medios por usuario
   */
  async getMediaByUser(userId: string): Promise<Medio[]> {
    const medios = await prisma.medio.findMany({
      where: { usuario_id: userId },
      include: {
        usuario: true,
        concurso: true,
        categoria: true
      },
      orderBy: { fecha_subida: 'desc' }
    });

    return medios.map(this.mapPrismaToMedio);
  }

  /**
   * Obtiene medios por concurso
   */
  async getMediaByContest(contestId: number): Promise<Medio[]> {
    const medios = await prisma.medio.findMany({
      where: { concurso_id: contestId },
      include: {
        usuario: true,
        concurso: true,
        categoria: true
      },
      orderBy: { fecha_subida: 'desc' }
    });

    return medios.map(this.mapPrismaToMedio);
  }

  /**
   * Elimina un medio
   */
  async deleteMedia(id: number, userId: string): Promise<void> {
    const medio = await prisma.medio.findUnique({
      where: { id }
    });

    if (!medio) {
      throw new Error('Medio no encontrado');
    }

    if (medio.usuario_id !== userId) {
      throw new Error('No tienes permisos para eliminar este medio');
    }

    // TODO: Eliminar de Immich también
    // await this.deleteFromImmich(medio.metadatos.immich_asset_id);

    await prisma.medio.delete({
      where: { id }
    });
  }

  /**
   * Valida que el usuario esté inscrito en el concurso
   */
  private async validateUserEnrollment(userId: string, concursoId: number): Promise<void> {
    const inscripcion = await prisma.inscripcion.findUnique({
      where: {
        usuario_id_concurso_id: {
          usuario_id: userId,
          concurso_id: concursoId
        }
      }
    });

    if (!inscripcion) {
      throw new Error('Debes estar inscrito en el concurso para subir medios');
    }
  }

  /**
   * Valida límites de subida por concurso y usuario
   */
  private async validateUploadLimits(
    userId: string, 
    concursoId: number, 
    _tipoMedio: TipoMedio
  ): Promise<void> {
    // Verificar límite de envíos por concurso (máximo 3)
    const existingMedia = await prisma.medio.count({
      where: {
        usuario_id: userId,
        concurso_id: concursoId
      }
    });

    const concurso = await prisma.concurso.findUnique({
      where: { id: concursoId }
    });

    if (!concurso) {
      throw new Error('Concurso no encontrado');
    }

    if (existingMedia >= concurso.max_envios) {
      throw new Error(`Has alcanzado el límite máximo de ${concurso.max_envios} envíos por concurso`);
    }

    // Verificar que el concurso esté activo
    if (concurso.status !== 'ACTIVO') {
      throw new Error('El concurso no está activo para recibir envíos');
    }

    // Verificar fechas del concurso
    const now = new Date();
    if (now < concurso.fecha_inicio || now > concurso.fecha_final) {
      throw new Error('El concurso no está en período de envío');
    }
  }

  /**
   * Obtiene reglas de validación para un tipo de medio específico
   */
  private getValidationRules(tipoMedio: TipoMedio, _concursoId: number): MediaValidationRules {
    const baseRules = MEDIA_VALIDATION_CONFIG[tipoMedio];
    
    // TODO: Aquí se pueden aplicar reglas específicas del concurso
    // Por ahora usamos las reglas base
    
    const rules: MediaValidationRules = {
      maxSizeMB: baseRules.maxSizeMB,
      allowedFormats: baseRules.formats,
      allowedExtensions: baseRules.extensions
    };

    if ('maxDimensions' in baseRules) {
      rules.maxDimensions = baseRules.maxDimensions;
    }

    if ('maxDuration' in baseRules) {
      rules.maxDuration = baseRules.maxDuration;
    }

    return rules;
  }

  /**
   * Valida especificaciones del archivo
   */
  private validateFileSpecs(request: UploadUrlRequest, rules: MediaValidationRules): void {
    // Validar tamaño
    const fileSizeMB = request.file_size / (1024 * 1024);
    if (fileSizeMB > rules.maxSizeMB) {
      throw new Error(`El archivo excede el tamaño máximo de ${rules.maxSizeMB}MB`);
    }

    // Validar formato
    if (!rules.allowedFormats.includes(request.file_type)) {
      throw new Error(`Formato no permitido. Formatos válidos: ${rules.allowedFormats.join(', ')}`);
    }

    // Validar extensión
    const extension = request.file_name.toLowerCase().substring(request.file_name.lastIndexOf('.'));
    if (!rules.allowedExtensions.includes(extension)) {
      throw new Error(`Extensión no permitida. Extensiones válidas: ${rules.allowedExtensions.join(', ')}`);
    }
  }

  /**
   * Genera token de subida temporal
   */
  private generateUploadToken(
    userId: string, 
    concursoId: number, 
    request: UploadUrlRequest
  ): string {
    const payload = {
      userId,
      concursoId,
      ...request,
      timestamp: Date.now()
    };
    
    // En una implementación real, esto sería un JWT firmado
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  /**
   * Valida token de subida
   */
  private validateUploadToken(
    token: string,
    userId: string,
    concursoId: number,
    request: ProcessUploadRequest
  ): void {
    try {
      const payload = JSON.parse(Buffer.from(token, 'base64').toString());
      
      // Verificar que el token no haya expirado (1 hora)
      if (Date.now() - payload.timestamp > 60 * 60 * 1000) {
        throw new Error('Token de subida expirado');
      }
      
      // Verificar que coincidan los datos
      if (payload.userId !== userId || payload.concursoId !== concursoId) {
        throw new Error('Token de subida inválido');
      }
      
      if (payload.tipo_medio !== request.tipo_medio || 
          payload.categoria_id !== request.categoria_id) {
        throw new Error('Los datos del token no coinciden con la solicitud');
      }
      
    } catch (error) {
      throw new Error('Token de subida inválido');
    }
  }

  /**
   * Obtiene información del asset desde Immich
   */
  private async getAssetFromImmich(assetId: string): Promise<AssetResponseDto> {
    // TODO: Implementar llamada real a Immich SDK
    // Por ahora simulamos la respuesta
    return {
      id: assetId,
      originalFileName: 'example.jpg',
      type: 'IMAGE' as any,
      fileSize: 1024000,
      // ... otros campos según la respuesta real de Immich
    } as any;
  }

  /**
   * Procesa metadatos específicos por tipo de medio
   */
  private async processMediaMetadata(
    assetInfo: AssetResponseDto,
    tipoMedio: TipoMedio,
    originalFilename: string
  ): Promise<ProcessedMediaMetadata> {
    const metadata: ProcessedMediaMetadata = {
      format: this.extractFormat(originalFilename),
      fileSize: (assetInfo as any).fileSize || 0,
      originalFilename,
      immich_asset_id: assetInfo.id
    };

    // Procesar metadatos específicos según tipo
    switch (tipoMedio) {
      case 'fotografia':
        // Para fotos, extraer EXIF
        metadata.exif = await this.extractExifData(assetInfo);
        metadata.dimensions = await this.extractImageDimensions(assetInfo);
        break;
        
      case 'video':
      case 'corto_cine':
        // Para videos, extraer duración y dimensiones
        metadata.duration = await this.extractVideoDuration(assetInfo);
        metadata.dimensions = await this.extractVideoDimensions(assetInfo);
        break;
        
      case 'audio':
        // Para audio, extraer duración y metadatos de audio
        metadata.duration = await this.extractAudioDuration(assetInfo);
        break;
    }

    return metadata;
  }

  /**
   * Genera versiones optimizadas del medio
   */
  private async generateOptimizedVersions(
    assetInfo: AssetResponseDto,
    tipoMedio: TipoMedio
  ): Promise<OptimizedVersions> {
    // TODO: Implementar generación real de versiones optimizadas con Immich
    // Por ahora devolvemos URLs simuladas
    
    const baseUrl = `${process.env['IMMICH_SERVER_URL']}/api/asset/file/${assetInfo.id}`;
    
    const versions: OptimizedVersions = {
      original: baseUrl
    };

    // Generar versiones según tipo de medio
    switch (tipoMedio) {
      case 'fotografia':
        versions.thumbnail = `${baseUrl}?size=400x225`; // 16:9 widescreen
        versions.preview = `${baseUrl}?size=1280x720`;   // 16:9 widescreen
        break;
        
      case 'video':
      case 'corto_cine':
        versions.thumbnail = `${baseUrl}/thumbnail`;
        versions.preview = `${baseUrl}/preview`;
        break;
        
      case 'audio':
        // Para audio, solo necesitamos el original
        break;
    }

    return versions;
  }

  /**
   * Extrae formato del archivo
   */
  private extractFormat(filename: string): string {
    return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
  }

  /**
   * Extrae datos EXIF de una imagen
   */
  private async extractExifData(_assetInfo: AssetResponseDto): Promise<Record<string, any>> {
    // TODO: Implementar extracción real de EXIF con Immich
    return {};
  }

  /**
   * Extrae dimensiones de una imagen
   */
  private async extractImageDimensions(_assetInfo: AssetResponseDto): Promise<{ width: number; height: number }> {
    // TODO: Implementar extracción real de dimensiones
    return { width: 1920, height: 1080 };
  }

  /**
   * Extrae duración de un video
   */
  private async extractVideoDuration(_assetInfo: AssetResponseDto): Promise<number> {
    // TODO: Implementar extracción real de duración
    return 120; // 2 minutos por defecto
  }

  /**
   * Extrae dimensiones de un video
   */
  private async extractVideoDimensions(_assetInfo: AssetResponseDto): Promise<{ width: number; height: number }> {
    // TODO: Implementar extracción real de dimensiones de video
    return { width: 1920, height: 1080 };
  }

  /**
   * Extrae duración de un audio
   */
  private async extractAudioDuration(_assetInfo: AssetResponseDto): Promise<number> {
    // TODO: Implementar extracción real de duración de audio
    return 180; // 3 minutos por defecto
  }

  /**
   * Mapea modelo de Prisma a tipo Medio
   */
  private mapPrismaToMedio(prismaMedia: any): Medio {
    return {
      id: prismaMedia.id,
      titulo: prismaMedia.titulo,
      tipo_medio: prismaMedia.tipo_medio,
      usuario_id: prismaMedia.usuario_id,
      concurso_id: prismaMedia.concurso_id,
      categoria_id: prismaMedia.categoria_id,
      medio_url: prismaMedia.medio_url,
      thumbnail_url: prismaMedia.thumbnail_url,
      preview_url: prismaMedia.preview_url,
      duracion: prismaMedia.duracion,
      formato: prismaMedia.formato,
      tamaño_archivo: Number(prismaMedia.tamano_archivo),
      metadatos: prismaMedia.metadatos || {},
      fecha_subida: prismaMedia.fecha_subida
    };
  }
}

export const mediaService = new MediaService();