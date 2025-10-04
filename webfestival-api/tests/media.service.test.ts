import { mediaService, MEDIA_VALIDATION_CONFIG } from '@/services/media.service';
import { TipoMedio } from '@/types';

// Mock de Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    inscripcion: {
      findUnique: jest.fn()
    },
    medio: {
      count: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn()
    },
    concurso: {
      findUnique: jest.fn()
    }
  }
}));

// Mock del servicio de Immich
jest.mock('@/services/immich.service', () => ({
  immichService: {
    ensureConnection: jest.fn(),
    executeWithRetry: jest.fn()
  }
}));

describe('MediaService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('MEDIA_VALIDATION_CONFIG', () => {
    it('debe tener configuración para todos los tipos de medios', () => {
      const tiposEsperados: TipoMedio[] = ['fotografia', 'video', 'audio', 'corto_cine'];
      
      tiposEsperados.forEach(tipo => {
        expect(MEDIA_VALIDATION_CONFIG[tipo]).toBeDefined();
        expect(MEDIA_VALIDATION_CONFIG[tipo].formats).toBeInstanceOf(Array);
        expect(MEDIA_VALIDATION_CONFIG[tipo].maxSizeMB).toBeGreaterThan(0);
        expect(MEDIA_VALIDATION_CONFIG[tipo].extensions).toBeInstanceOf(Array);
      });
    });

    it('debe tener configuración específica para fotografías', () => {
      const config = MEDIA_VALIDATION_CONFIG.fotografia;
      
      expect(config.formats).toContain('image/jpeg');
      expect(config.formats).toContain('image/png');
      expect(config.formats).toContain('image/webp');
      expect(config.maxSizeMB).toBe(10);
      expect(config.maxDimensions).toEqual({ width: 4000, height: 4000 });
      expect(config.extensions).toContain('.jpg');
      expect(config.extensions).toContain('.png');
    });

    it('debe tener configuración específica para videos', () => {
      const config = MEDIA_VALIDATION_CONFIG.video;
      
      expect(config.formats).toContain('video/mp4');
      expect(config.formats).toContain('video/webm');
      expect(config.maxSizeMB).toBe(100);
      expect(config.maxDuration).toBe(600); // 10 minutos
      expect(config.extensions).toContain('.mp4');
      expect(config.extensions).toContain('.webm');
    });

    it('debe tener configuración específica para audios', () => {
      const config = MEDIA_VALIDATION_CONFIG.audio;
      
      expect(config.formats).toContain('audio/mpeg');
      expect(config.formats).toContain('audio/wav');
      expect(config.formats).toContain('audio/flac');
      expect(config.maxSizeMB).toBe(50);
      expect(config.maxDuration).toBe(1800); // 30 minutos
      expect(config.extensions).toContain('.mp3');
      expect(config.extensions).toContain('.wav');
    });

    it('debe tener configuración específica para cortos de cine', () => {
      const config = MEDIA_VALIDATION_CONFIG.corto_cine;
      
      expect(config.formats).toContain('video/mp4');
      expect(config.formats).toContain('video/webm');
      expect(config.maxSizeMB).toBe(500);
      expect(config.maxDuration).toBe(1800); // 30 minutos
      expect(config.extensions).toContain('.mp4');
      expect(config.extensions).toContain('.webm');
    });
  });

  describe('generateUploadUrl', () => {
    const mockRequest = {
      titulo: 'Test Media',
      tipo_medio: 'fotografia' as TipoMedio,
      categoria_id: 1,
      file_size: 1024 * 1024, // 1MB
      file_type: 'image/jpeg',
      file_name: 'test.jpg'
    };

    it('debe generar URL de subida exitosamente para fotografía válida', async () => {
      // Mock de inscripción válida
      const { prisma } = require('@/lib/prisma');
      prisma.inscripcion.findUnique.mockResolvedValue({ id: 1 });
      prisma.medio.count.mockResolvedValue(0);
      prisma.concurso.findUnique.mockResolvedValue({
        id: 1,
        max_envios: 3,
        status: 'ACTIVO',
        fecha_inicio: new Date(Date.now() - 86400000), // ayer
        fecha_final: new Date(Date.now() + 86400000)   // mañana
      });

      const { immichService } = require('@/services/immich.service');
      immichService.ensureConnection.mockImplementation(() => {});

      const result = await mediaService.generateUploadUrl('user1', 1, mockRequest);

      expect(result).toHaveProperty('upload_token');
      expect(result).toHaveProperty('upload_url');
      expect(result).toHaveProperty('expires_at');
      expect(result).toHaveProperty('max_file_size');
      expect(result).toHaveProperty('allowed_formats');
      expect(result).toHaveProperty('validation_rules');
      
      expect(result.allowed_formats).toContain('image/jpeg');
      expect(result.max_file_size).toBe(10 * 1024 * 1024); // 10MB
    });

    it('debe rechazar archivo que excede el tamaño máximo', async () => {
      const { prisma } = require('@/lib/prisma');
      prisma.inscripcion.findUnique.mockResolvedValue({ id: 1 });
      prisma.medio.count.mockResolvedValue(0);
      prisma.concurso.findUnique.mockResolvedValue({
        id: 1,
        max_envios: 3,
        status: 'ACTIVO',
        fecha_inicio: new Date(Date.now() - 86400000),
        fecha_final: new Date(Date.now() + 86400000)
      });

      const oversizedRequest = {
        ...mockRequest,
        file_size: 15 * 1024 * 1024 // 15MB (excede el límite de 10MB para fotos)
      };

      await expect(
        mediaService.generateUploadUrl('user1', 1, oversizedRequest)
      ).rejects.toThrow('El archivo excede el tamaño máximo de 10MB');
    });

    it('debe rechazar formato no permitido', async () => {
      const { prisma } = require('@/lib/prisma');
      prisma.inscripcion.findUnique.mockResolvedValue({ id: 1 });
      prisma.medio.count.mockResolvedValue(0);
      prisma.concurso.findUnique.mockResolvedValue({
        id: 1,
        max_envios: 3,
        status: 'ACTIVO',
        fecha_inicio: new Date(Date.now() - 86400000),
        fecha_final: new Date(Date.now() + 86400000)
      });

      const invalidFormatRequest = {
        ...mockRequest,
        file_type: 'image/gif', // GIF no está permitido
        file_name: 'test.gif'
      };

      await expect(
        mediaService.generateUploadUrl('user1', 1, invalidFormatRequest)
      ).rejects.toThrow('Formato no permitido');
    });

    it('debe rechazar si el usuario no está inscrito', async () => {
      const { prisma } = require('@/lib/prisma');
      prisma.inscripcion.findUnique.mockResolvedValue(null); // No inscrito

      await expect(
        mediaService.generateUploadUrl('user1', 1, mockRequest)
      ).rejects.toThrow('Debes estar inscrito en el concurso para subir medios');
    });

    it('debe rechazar si se alcanzó el límite de envíos', async () => {
      const { prisma } = require('@/lib/prisma');
      prisma.inscripcion.findUnique.mockResolvedValue({ id: 1 });
      prisma.medio.count.mockResolvedValue(3); // Ya tiene 3 envíos
      prisma.concurso.findUnique.mockResolvedValue({
        id: 1,
        max_envios: 3,
        status: 'ACTIVO',
        fecha_inicio: new Date(Date.now() - 86400000),
        fecha_final: new Date(Date.now() + 86400000)
      });

      await expect(
        mediaService.generateUploadUrl('user1', 1, mockRequest)
      ).rejects.toThrow('Has alcanzado el límite máximo de 3 envíos por concurso');
    });

    it('debe rechazar si el concurso no está activo', async () => {
      const { prisma } = require('@/lib/prisma');
      prisma.inscripcion.findUnique.mockResolvedValue({ id: 1 });
      prisma.medio.count.mockResolvedValue(0);
      prisma.concurso.findUnique.mockResolvedValue({
        id: 1,
        max_envios: 3,
        status: 'FINALIZADO', // Concurso finalizado
        fecha_inicio: new Date(Date.now() - 86400000),
        fecha_final: new Date(Date.now() + 86400000)
      });

      await expect(
        mediaService.generateUploadUrl('user1', 1, mockRequest)
      ).rejects.toThrow('El concurso no está activo para recibir envíos');
    });
  });

  describe('Validación por tipo de medio', () => {
    it('debe validar correctamente archivos de video', async () => {
      const videoRequest = {
        titulo: 'Test Video',
        tipo_medio: 'video' as TipoMedio,
        categoria_id: 1,
        file_size: 50 * 1024 * 1024, // 50MB
        file_type: 'video/mp4',
        file_name: 'test.mp4'
      };

      const { prisma } = require('@/lib/prisma');
      prisma.inscripcion.findUnique.mockResolvedValue({ id: 1 });
      prisma.medio.count.mockResolvedValue(0);
      prisma.concurso.findUnique.mockResolvedValue({
        id: 1,
        max_envios: 3,
        status: 'ACTIVO',
        fecha_inicio: new Date(Date.now() - 86400000),
        fecha_final: new Date(Date.now() + 86400000)
      });

      const { immichService } = require('@/services/immich.service');
      immichService.ensureConnection.mockImplementation(() => {});

      const result = await mediaService.generateUploadUrl('user1', 1, videoRequest);

      expect(result.allowed_formats).toContain('video/mp4');
      expect(result.max_file_size).toBe(100 * 1024 * 1024); // 100MB para videos
    });

    it('debe validar correctamente archivos de audio', async () => {
      const audioRequest = {
        titulo: 'Test Audio',
        tipo_medio: 'audio' as TipoMedio,
        categoria_id: 1,
        file_size: 20 * 1024 * 1024, // 20MB
        file_type: 'audio/mp3',
        file_name: 'test.mp3'
      };

      const { prisma } = require('@/lib/prisma');
      prisma.inscripcion.findUnique.mockResolvedValue({ id: 1 });
      prisma.medio.count.mockResolvedValue(0);
      prisma.concurso.findUnique.mockResolvedValue({
        id: 1,
        max_envios: 3,
        status: 'ACTIVO',
        fecha_inicio: new Date(Date.now() - 86400000),
        fecha_final: new Date(Date.now() + 86400000)
      });

      const { immichService } = require('@/services/immich.service');
      immichService.ensureConnection.mockImplementation(() => {});

      const result = await mediaService.generateUploadUrl('user1', 1, audioRequest);

      expect(result.allowed_formats).toContain('audio/mp3');
      expect(result.max_file_size).toBe(50 * 1024 * 1024); // 50MB para audios
    });

    it('debe validar correctamente cortos de cine', async () => {
      const cortoRequest = {
        titulo: 'Test Corto',
        tipo_medio: 'corto_cine' as TipoMedio,
        categoria_id: 1,
        file_size: 200 * 1024 * 1024, // 200MB
        file_type: 'video/mp4',
        file_name: 'corto.mp4'
      };

      const { prisma } = require('@/lib/prisma');
      prisma.inscripcion.findUnique.mockResolvedValue({ id: 1 });
      prisma.medio.count.mockResolvedValue(0);
      prisma.concurso.findUnique.mockResolvedValue({
        id: 1,
        max_envios: 3,
        status: 'ACTIVO',
        fecha_inicio: new Date(Date.now() - 86400000),
        fecha_final: new Date(Date.now() + 86400000)
      });

      const { immichService } = require('@/services/immich.service');
      immichService.ensureConnection.mockImplementation(() => {});

      const result = await mediaService.generateUploadUrl('user1', 1, cortoRequest);

      expect(result.allowed_formats).toContain('video/mp4');
      expect(result.max_file_size).toBe(500 * 1024 * 1024); // 500MB para cortos de cine
    });
  });

  describe('Token de subida', () => {
    it('debe generar y validar tokens correctamente', () => {
      const mockRequest = {
        titulo: 'Test Media',
        tipo_medio: 'fotografia' as TipoMedio,
        categoria_id: 1,
        file_size: 1024 * 1024,
        file_type: 'image/jpeg',
        file_name: 'test.jpg'
      };

      // Acceder al método privado para testing
      const service = mediaService as any;
      const token = service.generateUploadToken('user1', 1, mockRequest);

      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);

      // Validar que el token se puede decodificar
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      expect(decoded.userId).toBe('user1');
      expect(decoded.concursoId).toBe(1);
      expect(decoded.titulo).toBe('Test Media');
    });
  });
});