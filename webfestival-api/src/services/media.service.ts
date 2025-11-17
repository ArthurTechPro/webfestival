import { Medio, TipoMedio, PaginatedResponse } from '@/types';
import { prisma } from '../lib/prisma';
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
  immich_api_key: string;
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
    
    // Obtener API key de Immich desde variables de entorno
    const immichApiKey = process.env['IMMICH_API_KEY'];
    
    if (!immichApiKey) {
      throw new Error('IMMICH_API_KEY no está configurado en las variables de entorno');
    }
    
    // Generar token de subida temporal (válido por 1 hora)
    const uploadToken = this.generateUploadToken(userId, concursoId, validatedRequest);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
    
    // URL del servidor Immich para subir archivos
    const immichServerUrl = process.env['IMMICH_SERVER_URL'] || 'https://medios.webfestival.art';
    const uploadUrl = `${immichServerUrl}/api/assets`;
    
    return {
      upload_token: uploadToken,
      upload_url: uploadUrl,
      immich_api_key: immichApiKey,
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
    
    // Obtener información del concurso y usuario para crear álbum
    const concurso = await prisma.concurso.findUnique({
      where: { id: concursoId },
      select: { titulo: true }
    });

    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      select: { nombre: true, email: true }
    });

    if (!concurso || !usuario) {
      throw new Error('Concurso o usuario no encontrado');
    }

    // Crear o obtener álbumes en Immich
    const albumName = immichService.generateAlbumName(
      concurso.titulo,
      usuario.nombre || usuario.email
    );
    const albumDescription = `Medios de ${usuario.nombre || usuario.email} para el concurso "${concurso.titulo}"`;
    
    // Intentar crear álbumes en Immich (opcional, no bloquea si falla)
    let albumId: string | null = null;
    try {
      // 1. Crear/obtener álbum del concurso/usuario
      console.log(`📁 Creando/obteniendo álbum: "${albumName}"`);
      albumId = await immichService.getOrCreateAlbum(albumName, albumDescription);
      console.log(`📁 Álbum ID obtenido: ${albumId}`);

      // Agregar asset al álbum del concurso
      console.log(`📤 Agregando asset ${validatedRequest.asset_id} al álbum ${albumId}`);
      await immichService.addAssetsToAlbum(albumId, [validatedRequest.asset_id]);
      console.log(`✅ Asset ${validatedRequest.asset_id} agregado al álbum ${albumId}`);

      // 2. También agregar al álbum "Sistema" (álbum general)
      try {
        console.log(`📁 Agregando también al álbum "Sistema"`);
        const sistemaAlbumId = await immichService.getOrCreateAlbum(
          'Sistema',
          'Álbum general del sistema WebFestival - Todos los medios'
        );
        await immichService.addAssetsToAlbum(sistemaAlbumId, [validatedRequest.asset_id]);
        console.log(`✅ Asset también agregado al álbum Sistema`);
      } catch (sistemaError) {
        console.warn(`⚠️ No se pudo agregar al álbum Sistema:`, sistemaError);
        // No es crítico, continuamos
      }
    } catch (albumError) {
      console.warn(`⚠️ No se pudo crear/agregar al álbum en Immich:`, albumError);
      console.log(`ℹ️ El medio se guardará sin álbum. Puedes organizarlo manualmente en Immich.`);
      // Continuamos sin álbum
    }
    
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
    
    // Guardar en base de datos con información del álbum
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
        metadatos: processedMetadata as any,
        immich_album_id: albumId,
        immich_asset_id: validatedRequest.asset_id
      }
    });

    console.log(`📁 Medio guardado en BD con álbum: ${albumName}`);

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
   * Obtiene medios por usuario con información del estado del concurso
   */
  async getMediaByUser(userId: string): Promise<any[]> {
    const medios = await prisma.medio.findMany({
      where: { usuario_id: userId },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            picture_url: true
          }
        },
        concurso: {
          select: {
            id: true,
            titulo: true,
            status: true,
            fecha_inicio: true,
            fecha_final: true,
            max_envios: true
          }
        },
        categoria: {
          select: {
            id: true,
            nombre: true
          }
        },
        calificaciones: {
          include: {
            detalles: {
              include: {
                criterio: true
              }
            }
          }
        }
      },
      orderBy: { fecha_subida: 'desc' }
    });

    // Obtener conteo de medios por concurso para mostrar límite
    const mediaCountByContest = await prisma.medio.groupBy({
      by: ['concurso_id'],
      where: { usuario_id: userId },
      _count: {
        id: true
      }
    });

    const contestCounts = mediaCountByContest.reduce((acc, item) => {
      acc[item.concurso_id] = item._count.id;
      return acc;
    }, {} as Record<number, number>);

    return medios.map(medio => {
      const medioWithDetails = this.mapPrismaToMedioWithDetails(medio);
      
      // Agregar información del estado del concurso y límites
      if (medio.concurso) {
        medioWithDetails.concurso_info = {
          ...medioWithDetails.concurso,
          status: medio.concurso.status,
          fecha_inicio: medio.concurso.fecha_inicio,
          fecha_final: medio.concurso.fecha_final,
          max_envios: medio.concurso.max_envios,
          envios_actuales: contestCounts[medio.concurso_id] || 0,
          puede_enviar_mas: (contestCounts[medio.concurso_id] || 0) < medio.concurso.max_envios
        };
      }
      
      // Calcular puntaje final si hay calificaciones
      if (medio.calificaciones && medio.calificaciones.length > 0) {
        medioWithDetails.puntaje_final = this.calculateFinalScore(medio.calificaciones);
        medioWithDetails.tiene_calificaciones = true;
      } else {
        medioWithDetails.tiene_calificaciones = false;
      }
      
      return medioWithDetails;
    });
  }

  /**
   * Obtiene medios por concurso con información detallada
   */
  async getMediaByContest(contestId: number): Promise<any[]> {
    const medios = await prisma.medio.findMany({
      where: { concurso_id: contestId },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            picture_url: true
          }
        },
        concurso: {
          select: {
            id: true,
            titulo: true,
            status: true,
            fecha_inicio: true,
            fecha_final: true
          }
        },
        categoria: {
          select: {
            id: true,
            nombre: true
          }
        },
        calificaciones: {
          include: {
            detalles: {
              include: {
                criterio: true
              }
            }
          }
        }
      },
      orderBy: { fecha_subida: 'desc' }
    });

    return medios.map(medio => {
      const medioWithDetails = this.mapPrismaToMedioWithDetails(medio);
      
      // Calcular puntaje final si hay calificaciones
      if (medio.calificaciones && medio.calificaciones.length > 0) {
        medioWithDetails.puntaje_final = this.calculateFinalScore(medio.calificaciones);
        medioWithDetails.tiene_calificaciones = true;
      } else {
        medioWithDetails.tiene_calificaciones = false;
      }
      
      return medioWithDetails;
    });
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
    // Usar el proxy de la API para servir imágenes públicamente
    const serverUrl = process.env['SERVER_URL'] || 'http://localhost:3000';
    const baseUrl = `${serverUrl}/proxy/media/${assetInfo.id}`;
    
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
        versions.thumbnail = `${baseUrl}?size=400x225`;
        versions.preview = `${baseUrl}?size=1280x720`;
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
   * Obtiene galería de medios ganadores con filtros
   */
  async getWinnerGallery(filters: any): Promise<PaginatedResponse<any>> {
    const { page, limit, tipo_medio, categoria_id, concurso_id, año } = filters;
    
    // Construir filtros para la consulta
    const whereClause: any = {};
    
    // Solo mostrar medios de concursos finalizados
    whereClause.concurso = {
      status: 'FINALIZADO'
    };
    
    if (tipo_medio) {
      whereClause.tipo_medio = tipo_medio;
    }
    
    if (categoria_id) {
      whereClause.categoria_id = categoria_id;
    }
    
    if (concurso_id) {
      whereClause.concurso_id = concurso_id;
    }
    
    if (año) {
      whereClause.concurso = {
        ...whereClause.concurso,
        fecha_inicio: {
          gte: new Date(`${año}-01-01`),
          lt: new Date(`${año + 1}-01-01`)
        }
      };
    }

    // Obtener medios con información de resultados
    const medios = await prisma.medio.findMany({
      where: whereClause,
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            picture_url: true
          }
        },
        concurso: {
          select: {
            id: true,
            titulo: true,
            fecha_inicio: true
          }
        },
        categoria: {
          select: {
            id: true,
            nombre: true
          }
        },
        // Incluir calificaciones para determinar posición
        calificaciones: {
          include: {
            detalles: {
              include: {
                criterio: true
              }
            }
          }
        }
      },
      orderBy: [
        { concurso_id: 'desc' },
        { fecha_subida: 'desc' }
      ],
      skip: (page - 1) * limit,
      take: limit
    });

    // Contar total para paginación
    const total = await prisma.medio.count({
      where: whereClause
    });

    // Procesar medios para incluir información de posición y puntaje
    const processedMedias = medios.map(medio => {
      const medioWithDetails = this.mapPrismaToMedioWithDetails(medio);
      
      // Calcular puntaje final si hay calificaciones
      if (medio.calificaciones && medio.calificaciones.length > 0) {
        medioWithDetails.puntaje_final = this.calculateFinalScore(medio.calificaciones);
      }
      
      return medioWithDetails;
    });

    return {
      data: processedMedias,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Obtiene galería de medios destacados
   */
  async getFeaturedGallery(filters: any): Promise<PaginatedResponse<any>> {
    const { page, limit, tipo_medio } = filters;
    
    const whereClause: any = {
      concurso: {
        status: 'FINALIZADO'
      }
    };
    
    if (tipo_medio) {
      whereClause.tipo_medio = tipo_medio;
    }

    // Obtener medios más recientes de concursos finalizados
    const medios = await prisma.medio.findMany({
      where: whereClause,
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            picture_url: true
          }
        },
        concurso: {
          select: {
            id: true,
            titulo: true,
            fecha_inicio: true
          }
        },
        categoria: {
          select: {
            id: true,
            nombre: true
          }
        }
      },
      orderBy: [
        { concurso: { fecha_final: 'desc' } },
        { fecha_subida: 'desc' }
      ],
      skip: (page - 1) * limit,
      take: limit
    });

    const total = await prisma.medio.count({
      where: whereClause
    });

    const processedMedias = medios.map(medio => this.mapPrismaToMedioWithDetails(medio));

    return {
      data: processedMedias,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Obtiene categorías organizadas por tipo de medio para un concurso
   */
  async getCategoriesByMediaType(concursoId: number): Promise<any> {
    // Verificar que el concurso existe
    const concurso = await prisma.concurso.findUnique({
      where: { id: concursoId }
    });

    if (!concurso) {
      throw new Error('Concurso no encontrado');
    }

    // Obtener todas las categorías del concurso
    const categorias = await prisma.categoria.findMany({
      where: { concurso_id: concursoId },
      orderBy: { nombre: 'asc' }
    });

    // Organizar categorías por tipo de medio
    // Nota: En el esquema actual no hay campo tipo_medio en categorías
    // Por ahora las organizamos por nombre o las devolvemos todas
    const categoriesByType: any = {
      fotografia: [],
      video: [],
      audio: [],
      corto_cine: [],
      general: []
    };

    // Clasificar categorías por nombre (heurística simple)
    categorias.forEach(categoria => {
      const nombre = categoria.nombre.toLowerCase();
      
      if (nombre.includes('foto') || nombre.includes('imagen') || nombre.includes('retrato')) {
        categoriesByType.fotografia.push(categoria);
      } else if (nombre.includes('video') || nombre.includes('documental') || nombre.includes('clip')) {
        categoriesByType.video.push(categoria);
      } else if (nombre.includes('audio') || nombre.includes('música') || nombre.includes('sonido')) {
        categoriesByType.audio.push(categoria);
      } else if (nombre.includes('corto') || nombre.includes('cine') || nombre.includes('film')) {
        categoriesByType.corto_cine.push(categoria);
      } else {
        categoriesByType.general.push(categoria);
      }
    });

    return {
      concurso: {
        id: concurso.id,
        titulo: concurso.titulo,
        status: concurso.status
      },
      categorias_por_tipo: categoriesByType,
      total_categorias: categorias.length
    };
  }

  /**
   * Calcula el puntaje final de un medio basado en sus calificaciones
   */
  private calculateFinalScore(calificaciones: any[]): number {
    if (!calificaciones || calificaciones.length === 0) {
      return 0;
    }

    let totalScore = 0;
    let totalWeight = 0;
    let criteriaCount = 0;

    calificaciones.forEach(calificacion => {
      if (calificacion.detalles && calificacion.detalles.length > 0) {
        calificacion.detalles.forEach((detalle: any) => {
          const peso = detalle.criterio?.peso || 1;
          totalScore += detalle.puntuacion * peso;
          totalWeight += peso;
          criteriaCount++;
        });
      }
    });

    if (totalWeight === 0 || criteriaCount === 0) {
      return 0;
    }

    // Promedio ponderado
    return Math.round((totalScore / totalWeight) * 100) / 100;
  }

  /**
   * Mapea modelo de Prisma a tipo Medio con detalles adicionales
   */
  private mapPrismaToMedioWithDetails(prismaMedia: any): any {
    const medio = this.mapPrismaToMedio(prismaMedia);
    
    return {
      ...medio,
      usuario: prismaMedia.usuario ? {
        id: prismaMedia.usuario.id,
        nombre: prismaMedia.usuario.nombre,
        picture_url: prismaMedia.usuario.picture_url
      } : undefined,
      concurso: prismaMedia.concurso ? {
        id: prismaMedia.concurso.id,
        titulo: prismaMedia.concurso.titulo,
        año: new Date(prismaMedia.concurso.fecha_inicio).getFullYear()
      } : undefined,
      categoria: prismaMedia.categoria ? {
        id: prismaMedia.categoria.id,
        nombre: prismaMedia.categoria.nombre
      } : undefined
    };
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