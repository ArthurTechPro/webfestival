# Diseño Técnico: Sistema Seguro de Subida de Medios

## Overview

Este documento describe el diseño técnico para implementar un sistema seguro de subida de medios a Immich a través de la API Backend. La solución centraliza la gestión de credenciales de Immich en el servidor, simplificando el proceso de subida desde las aplicaciones cliente y mejorando la seguridad del sistema.

### Objetivos del Diseño

1. **Seguridad**: Mantener las credenciales de Immich exclusivamente en el servidor
2. **Simplicidad**: Proporcionar una API simple para que los clientes suban medios
3. **Confiabilidad**: Implementar manejo robusto de errores y reintentos
4. **Consistencia**: Mantener sincronizados los datos entre Immich y la base de datos local
5. **Performance**: Procesar subidas de hasta 50MB en menos de 30 segundos

## Architecture

### Flujo de Subida de Medios

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐         ┌──────────────┐
│   Cliente   │────────▶│  API Backend │────────▶│   Immich    │         │  PostgreSQL  │
│  (App/Web)  │  POST   │   Endpoint   │  Upload │   Server    │         │   Database   │
└─────────────┘         └──────────────┘         └─────────────┘         └──────────────┘
                               │                         │                        │
                               │  1. Validar auth        │                        │
                               │  2. Validar archivo     │                        │
                               │  3. Subir a Immich ────▶│                        │
                               │  4. Obtener metadata ◀──│                        │
                               │  5. Guardar en DB ─────────────────────────────▶│
                               │  6. Responder al cliente                         │
                               │◀────────────────────────────────────────────────│
```

### Componentes Principales

1. **Media Upload Controller**: Maneja las peticiones HTTP de subida
2. **Media Upload Service**: Lógica de negocio para procesar subidas
3. **Immich Service**: Comunicación con la API de Immich (ya existe)
4. **Media Repository**: Persistencia de metadatos en PostgreSQL
5. **Validation Middleware**: Validación de archivos y autenticación

## Components and Interfaces

### 1. Media Upload Controller

**Responsabilidad**: Manejar las peticiones HTTP y coordinar el flujo de subida

```typescript
// src/controllers/media-upload.controller.ts

interface UploadMediaRequest {
  file: Express.Multer.File;
  userId: string; // Del token JWT
  concursoId?: number;
  categoriaId?: number;
  titulo?: string;
}

interface UploadMediaResponse {
  id: number;
  immichAssetId: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  metadata: {
    filename: string;
    mimeType: string;
    size: number;
    uploadedAt: string;
  };
}

class MediaUploadController {
  async uploadMedia(req: Request, res: Response): Promise<void>;
  async getMediaById(req: Request, res: Response): Promise<void>;
  async getUserMedia(req: Request, res: Response): Promise<void>;
}
```

### 2. Media Upload Service

**Responsabilidad**: Orquestar la subida a Immich y el guardado en base de datos

```typescript
// src/services/media-upload.service.ts

interface UploadToImmichResult {
  assetId: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  metadata: {
    width?: number;
    height?: number;
    duration?: number;
    format: string;
  };
}

interface SaveMediaParams {
  titulo: string;
  tipoMedio: TipoMedio;
  usuarioId: string;
  concursoId?: number;
  categoriaId?: number;
  immichAssetId: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  formato: string;
  tamanoArchivo: bigint;
  duracion?: number;
  metadatos?: any;
}

class MediaUploadService {
  async uploadMedia(
    file: Express.Multer.File,
    userId: string,
    options?: UploadOptions
  ): Promise<UploadMediaResponse>;
  
  private async uploadToImmich(
    file: Express.Multer.File
  ): Promise<UploadToImmichResult>;
  
  private async saveMediaMetadata(
    params: SaveMediaParams
  ): Promise<Medio>;
  
  private async rollbackImmichUpload(assetId: string): Promise<void>;
}
```

### 3. Immich Service Extensions

**Responsabilidad**: Extender el servicio existente con funcionalidad de subida

```typescript
// src/services/immich.service.ts (extensiones)

interface UploadAssetParams {
  file: Buffer;
  filename: string;
  mimeType: string;
}

interface UploadAssetResult {
  id: string;
  originalPath: string;
  thumbhash: string;
  fileCreatedAt: string;
  fileModifiedAt: string;
  exifInfo?: any;
}

class ImmichService {
  // Métodos existentes...
  
  async uploadAsset(params: UploadAssetParams): Promise<UploadAssetResult>;
  async deleteAsset(assetId: string): Promise<void>;
  async getAssetInfo(assetId: string): Promise<any>;
  async generateAssetUrl(assetId: string): string;
}
```

### 4. Validation Middleware

**Responsabilidad**: Validar archivos antes de procesarlos

```typescript
// src/middleware/media-validation.middleware.ts

interface FileValidationConfig {
  maxSizeBytes: number;
  allowedMimeTypes: string[];
  allowedExtensions: string[];
}

const mediaValidationConfig: Record<TipoMedio, FileValidationConfig> = {
  fotografia: {
    maxSizeBytes: 50 * 1024 * 1024, // 50MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/heic', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.heic', '.webp']
  },
  video: {
    maxSizeBytes: 500 * 1024 * 1024, // 500MB
    allowedMimeTypes: ['video/mp4', 'video/quicktime', 'video/x-msvideo'],
    allowedExtensions: ['.mp4', '.mov', '.avi']
  },
  // ... otros tipos
};

function validateMediaFile(
  config: FileValidationConfig
): RequestHandler;
```

## Data Models

### Extensiones al Modelo Medio

El modelo `Medio` existente en Prisma ya contiene los campos necesarios:

```prisma
model Medio {
  id              Int       @id @default(autoincrement())
  titulo          String
  tipo_medio      TipoMedio
  usuario_id      String
  concurso_id     Int
  categoria_id    Int
  medio_url       String      // URL generada por Immich
  thumbnail_url   String?     // URL del thumbnail de Immich
  preview_url     String?     // URL del preview de Immich
  duracion        Int?        // Para videos/audios
  formato         String      // MIME type
  tamano_archivo  BigInt      // Tamaño en bytes
  metadatos       Json?       // Metadata adicional de Immich
  fecha_subida    DateTime    @default(now())
  immich_album_id String?     // ID del álbum en Immich
  immich_asset_id String?     // ID del asset en Immich
  
  // Relaciones existentes...
}
```

### Estructura de Metadatos JSON

```typescript
interface MediaMetadata {
  // Información del archivo original
  originalFilename: string;
  uploadedBy: string;
  uploadedAt: string;
  
  // Información de Immich
  immichAssetId: string;
  immichAlbumId?: string;
  
  // Metadata de imagen
  width?: number;
  height?: number;
  orientation?: number;
  
  // Metadata de video/audio
  duration?: number;
  codec?: string;
  bitrate?: number;
  
  // EXIF data (para fotos)
  exif?: {
    make?: string;
    model?: string;
    dateTimeOriginal?: string;
    gps?: {
      latitude?: number;
      longitude?: number;
    };
  };
}
```

## Error Handling

### Estrategia de Manejo de Errores

```typescript
// src/utils/media-upload-errors.ts

class MediaUploadError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
    this.name = 'MediaUploadError';
  }
}

// Errores específicos
class FileValidationError extends MediaUploadError {
  constructor(message: string, details?: any) {
    super(message, 'FILE_VALIDATION_ERROR', 400, details);
  }
}

class ImmichUploadError extends MediaUploadError {
  constructor(message: string, details?: any) {
    super(message, 'IMMICH_UPLOAD_ERROR', 502, details);
  }
}

class DatabaseSaveError extends MediaUploadError {
  constructor(message: string, details?: any) {
    super(message, 'DATABASE_SAVE_ERROR', 500, details);
  }
}

class ImmichUnavailableError extends MediaUploadError {
  constructor(message: string = 'Servicio de medios no disponible') {
    super(message, 'IMMICH_UNAVAILABLE', 503);
  }
}
```

### Códigos de Error HTTP

| Código | Descripción | Cuándo se usa |
|--------|-------------|---------------|
| 400 | Bad Request | Archivo inválido, tipo no soportado, tamaño excedido |
| 401 | Unauthorized | Token de autenticación inválido o ausente |
| 413 | Payload Too Large | Archivo excede el límite configurado |
| 500 | Internal Server Error | Error inesperado en el servidor |
| 502 | Bad Gateway | Error al comunicarse con Immich |
| 503 | Service Unavailable | Immich no disponible después de reintentos |

### Estrategia de Rollback

```typescript
async uploadMedia(file: Express.Multer.File, userId: string): Promise<UploadMediaResponse> {
  let immichAssetId: string | null = null;
  
  try {
    // 1. Subir a Immich
    const immichResult = await this.uploadToImmich(file);
    immichAssetId = immichResult.assetId;
    
    // 2. Guardar en base de datos
    const medio = await this.saveMediaMetadata({
      ...immichResult,
      usuarioId: userId,
      // ... otros campos
    });
    
    return this.formatResponse(medio);
    
  } catch (error) {
    // Si ya subimos a Immich pero falló el guardado en DB, hacer rollback
    if (immichAssetId) {
      try {
        await this.rollbackImmichUpload(immichAssetId);
        console.log(`✅ Rollback exitoso: asset ${immichAssetId} eliminado de Immich`);
      } catch (rollbackError) {
        console.error(`❌ Error en rollback: ${rollbackError}`);
        // Registrar para limpieza manual posterior
      }
    }
    
    throw error;
  }
}
```

## Testing Strategy

### 1. Unit Tests

**Objetivo**: Probar componentes individuales de forma aislada

```typescript
// tests/unit/media-upload.service.test.ts

describe('MediaUploadService', () => {
  describe('uploadMedia', () => {
    it('should upload file to Immich and save metadata');
    it('should rollback Immich upload if database save fails');
    it('should throw FileValidationError for invalid file type');
    it('should throw FileValidationError for oversized file');
  });
  
  describe('uploadToImmich', () => {
    it('should successfully upload file to Immich');
    it('should retry on network errors');
    it('should throw after max retries exceeded');
  });
});
```

### 2. Integration Tests

**Objetivo**: Probar la integración entre componentes

```typescript
// tests/integration/media-upload.integration.test.ts

describe('Media Upload Integration', () => {
  it('should complete full upload flow successfully');
  it('should handle Immich service unavailability');
  it('should maintain data consistency on errors');
  it('should respect file size limits');
  it('should validate authentication');
});
```

### 3. E2E Tests

**Objetivo**: Probar el flujo completo desde el cliente

```typescript
// tests/e2e/media-upload.e2e.test.ts

describe('Media Upload E2E', () => {
  it('should upload image via API endpoint');
  it('should upload video via API endpoint');
  it('should reject unauthenticated requests');
  it('should return proper error for invalid files');
});
```

### Test Data

```typescript
// tests/fixtures/media-files.ts

export const testFiles = {
  validImage: {
    buffer: Buffer.from('...'),
    filename: 'test-image.jpg',
    mimeType: 'image/jpeg',
    size: 1024 * 1024 // 1MB
  },
  oversizedImage: {
    buffer: Buffer.alloc(60 * 1024 * 1024), // 60MB
    filename: 'large-image.jpg',
    mimeType: 'image/jpeg',
    size: 60 * 1024 * 1024
  },
  invalidFile: {
    buffer: Buffer.from('...'),
    filename: 'document.pdf',
    mimeType: 'application/pdf',
    size: 1024
  }
};
```

## API Endpoints

### POST /api/v1/media/upload

**Descripción**: Sube un archivo multimedia a Immich y guarda los metadatos

**Autenticación**: Requerida (JWT)

**Request**:
```
Content-Type: multipart/form-data

Fields:
- file: File (required) - Archivo multimedia
- titulo: string (optional) - Título del medio
- concursoId: number (optional) - ID del concurso
- categoriaId: number (optional) - ID de la categoría
```

**Response 201 Created**:
```json
{
  "id": 123,
  "immichAssetId": "550e8400-e29b-41d4-a716-446655440000",
  "mediaUrl": "https://immich.example.com/api/assets/550e8400.../original",
  "thumbnailUrl": "https://immich.example.com/api/assets/550e8400.../thumbnail",
  "metadata": {
    "filename": "photo.jpg",
    "mimeType": "image/jpeg",
    "size": 2048576,
    "uploadedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses**:
- 400: Archivo inválido
- 401: No autenticado
- 413: Archivo muy grande
- 503: Servicio no disponible

### GET /api/v1/media/:id

**Descripción**: Obtiene información de un medio por ID

**Autenticación**: Requerida (JWT)

**Response 200 OK**:
```json
{
  "id": 123,
  "titulo": "Mi foto",
  "tipoMedio": "fotografia",
  "mediaUrl": "https://immich.example.com/api/assets/...",
  "thumbnailUrl": "https://immich.example.com/api/assets/.../thumbnail",
  "formato": "image/jpeg",
  "tamanoArchivo": 2048576,
  "fechaSubida": "2024-01-15T10:30:00Z",
  "usuario": {
    "id": "user123",
    "nombre": "Juan Pérez"
  }
}
```

### GET /api/v1/media/user/:userId

**Descripción**: Lista todos los medios de un usuario

**Autenticación**: Requerida (JWT)

**Query Parameters**:
- page: number (default: 1)
- limit: number (default: 20)
- tipoMedio: TipoMedio (optional)

**Response 200 OK**:
```json
{
  "data": [
    {
      "id": 123,
      "titulo": "Mi foto",
      "mediaUrl": "...",
      "thumbnailUrl": "...",
      "fechaSubida": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

## Configuration

### Variables de Entorno

```bash
# Immich Configuration (ya existentes)
IMMICH_SERVER_URL=https://immich.example.com
IMMICH_API_KEY=your-api-key-here
IMMICH_TIMEOUT=30000
IMMICH_RETRY_ATTEMPTS=3
IMMICH_RETRY_DELAY=1000

# Media Upload Configuration (nuevas)
MEDIA_MAX_FILE_SIZE_MB=50
MEDIA_ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/heic,image/webp
MEDIA_ALLOWED_VIDEO_TYPES=video/mp4,video/quicktime,video/x-msvideo
MEDIA_UPLOAD_TIMEOUT_SECONDS=30
```

### Multer Configuration

```typescript
// src/config/multer.ts

import multer from 'multer';

const storage = multer.memoryStorage();

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env['MEDIA_MAX_FILE_SIZE_MB'] || '50') * 1024 * 1024,
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      ...process.env['MEDIA_ALLOWED_IMAGE_TYPES']?.split(',') || [],
      ...process.env['MEDIA_ALLOWED_VIDEO_TYPES']?.split(',') || []
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo de archivo no soportado: ${file.mimetype}`));
    }
  }
});
```

## Performance Considerations

### 1. Streaming de Archivos

Para archivos grandes, usar streaming en lugar de cargar todo en memoria:

```typescript
async uploadToImmich(file: Express.Multer.File): Promise<UploadAssetResult> {
  const formData = new FormData();
  formData.append('assetData', file.buffer, {
    filename: file.originalname,
    contentType: file.mimetype
  });
  
  // Usar streaming para archivos grandes
  const response = await fetch(`${immichConfig.serverUrl}/api/assets`, {
    method: 'POST',
    headers: {
      'x-api-key': immichConfig.apiKey,
    },
    body: formData
  });
  
  return await response.json();
}
```

### 2. Timeouts

Configurar timeouts apropiados para evitar bloqueos:

```typescript
const UPLOAD_TIMEOUT = parseInt(process.env['MEDIA_UPLOAD_TIMEOUT_SECONDS'] || '30') * 1000;

async uploadWithTimeout<T>(operation: Promise<T>): Promise<T> {
  return Promise.race([
    operation,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Upload timeout')), UPLOAD_TIMEOUT)
    )
  ]);
}
```

### 3. Compresión de Respuestas

El middleware `compression` ya está configurado en el servidor para reducir el tamaño de las respuestas JSON.

## Security Considerations

### 1. Validación de Archivos

- Validar MIME type y extensión
- Verificar magic numbers del archivo
- Escanear archivos en busca de malware (opcional)

### 2. Rate Limiting

Aplicar rate limiting específico para uploads:

```typescript
import rateLimit from 'express-rate-limit';

export const uploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // 10 uploads por ventana
  message: 'Demasiadas subidas, intenta de nuevo más tarde'
});
```

### 3. Autenticación y Autorización

- Verificar JWT en todas las peticiones
- Validar que el usuario tenga permisos para subir medios
- Verificar límites de suscripción del usuario

### 4. Sanitización de Nombres de Archivo

```typescript
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .substring(0, 255);
}
```

## Monitoring and Logging

### Eventos a Registrar

```typescript
// Logs estructurados para monitoreo

logger.info('media_upload_started', {
  userId,
  filename: file.originalname,
  size: file.size,
  mimeType: file.mimetype
});

logger.info('media_upload_completed', {
  userId,
  mediaId: medio.id,
  immichAssetId: medio.immich_asset_id,
  duration: Date.now() - startTime
});

logger.error('media_upload_failed', {
  userId,
  filename: file.originalname,
  error: error.message,
  stage: 'immich_upload' // o 'database_save'
});
```

### Métricas

- Tiempo promedio de subida
- Tasa de éxito/fallo
- Tamaño promedio de archivos
- Distribución de tipos de medios
- Errores de Immich vs errores de base de datos

## Migration Strategy

### Fase 1: Implementación Base
1. Crear servicio de subida de medios
2. Implementar endpoint de upload
3. Agregar validaciones y manejo de errores

### Fase 2: Integración
1. Conectar con Immich service existente
2. Implementar guardado en base de datos
3. Agregar rollback en caso de errores

### Fase 3: Testing y Optimización
1. Escribir tests unitarios e integración
2. Optimizar performance
3. Agregar logging y monitoreo

### Fase 4: Deployment
1. Configurar variables de entorno
2. Desplegar en staging
3. Pruebas de carga
4. Desplegar en producción

## Future Enhancements

1. **Procesamiento asíncrono**: Usar colas (Bull/BullMQ) para procesar subidas grandes
2. **Compresión automática**: Comprimir imágenes antes de subir a Immich
3. **Generación de thumbnails**: Generar thumbnails personalizados
4. **Subida por chunks**: Permitir subida de archivos muy grandes por partes
5. **Caché de URLs**: Cachear URLs de Immich para reducir latencia
6. **Webhooks**: Notificar a clientes cuando la subida se complete
