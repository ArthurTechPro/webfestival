/// <reference types="jest" />

// IMPORTANTE: NO IMPORTAR FUNCIONES DE 'node:test' - USAR JEST GLOBALS
// Jest proporciona describe, it, expect, beforeEach, afterEach globalmente

import { ImmichService } from '../src/services/immich.service';
import { MediaService } from '../src/services/media.service';
import { immichConfig } from '../src/config/immich';

// Mock completo del SDK de Immich
const mockImmichApi = {
  serverInfoApi: {
    getServerInfo: jest.fn()
  },
  assetApi: {
    uploadAsset: jest.fn(),
    getAssetInfo: jest.fn(),
    deleteAsset: jest.fn()
  },
  albumApi: {
    createAlbum: jest.fn(),
    addAssetsToAlbum: jest.fn()
  }
};

jest.mock('@immich/sdk', () => ({
  ImmichApi: jest.fn(() => mockImmichApi),
  defaults: {
    baseUrl: '',
    headers: {}
  }
}));

// Mock de la configuración
jest.mock('../src/config/immich', () => ({
  immichConfig: {
    serverUrl: 'http://localhost:2283',
    apiKey: 'test-api-key-123',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000
  },
  validateImmichConfig: jest.fn()
}));

// Mock de Prisma para MediaService
const mockPrisma = {
  inscripcion: {
    findUnique: jest.fn()
  },
  medio: {
    count: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  concurso: {
    findUnique: jest.fn()
  }
};

jest.mock('../src/lib/prisma', () => ({
  prisma: mockPrisma
}));

describe('Immich Integration Tests', () => {
  let immichService: ImmichService;
  let mediaService: MediaService;

  beforeEach(() => {
    jest.clearAllMocks();
    immichService = new ImmichService();
    mediaService = new MediaService();
  });

  describe('ImmichService - Conexión y Configuración', () => {
    it('debería inicializar correctamente con configuración válida', async () => {
      // Arrange
      const mockServerInfo = {
        version: '1.138.1',
        versionHash: 'abc123def456',
        repository: 'immich-app/immich',
        build: 'production'
      };

      mockImmichApi.serverInfoApi.getServerInfo.mockResolvedValue(mockServerInfo);

      // Act
      await immichService.initialize();

      // Assert
      expect(mockImmichApi.serverInfoApi.getServerInfo).toHaveBeenCalled();
      
      const connectionInfo = immichService.getConnectionInfo();
      expect(connectionInfo.isConnected).toBe(true);
      expect(connectionInfo.serverUrl).toBe(immichConfig.serverUrl);
    });

    it('debería manejar errores de conexión durante la inicialización', async () => {
      // Arrange
      mockImmichApi.serverInfoApi.getServerInfo.mockRejectedValue(
        new Error('ECONNREFUSED: Connection refused')
      );

      // Act & Assert
      await expect(immichService.initialize()).rejects.toThrow('Fallo al inicializar Immich');
      
      const connectionInfo = immichService.getConnectionInfo();
      expect(connectionInfo.isConnected).toBe(false);
    });

    it('debería realizar health check exitosamente', async () => {
      // Arrange
      const mockServerInfo = {
        version: '1.138.1',
        versionHash: 'abc123def456'
      };

      mockImmichApi.serverInfoApi.getServerInfo.mockResolvedValue(mockServerInfo);
      await immichService.initialize();

      // Act
      const healthStatus = await immichService.performHealthCheck();

      // Assert
      expect(healthStatus.isHealthy).toBe(true);
      expect(healthStatus.serverVersion).toBe('1.138.1');
      expect(healthStatus.timestamp).toBeInstanceOf(Date);
      expect(healthStatus.error).toBeUndefined();
    });

    it('debería detectar servidor no saludable', async () => {
      // Arrange
      mockImmichApi.serverInfoApi.getServerInfo
        .mockResolvedValueOnce({ version: '1.138.1' }) // Para initialize
        .mockRejectedValueOnce(new Error('Server timeout')); // Para health check

      await immichService.initialize();

      // Act
      const healthStatus = await immichService.performHealthCheck();

      // Assert
      expect(healthStatus.isHealthy).toBe(false);
      expect(healthStatus.error).toBe('Server timeout');
      expect(healthStatus.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('ImmichService - Operaciones con Reintentos', () => {
    beforeEach(async () => {
      mockImmichApi.serverInfoApi.getServerInfo.mockResolvedValue({ version: '1.138.1' });
      await immichService.initialize();
    });

    it('debería ejecutar operación exitosa sin reintentos', async () => {
      // Arrange
      const mockOperation = jest.fn().mockResolvedValue('success');

      // Act
      const result = await immichService.executeWithRetry(mockOperation, {
        attempts: 3,
        delay: 100
      });

      // Assert
      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });

    it('debería reintentar operación fallida hasta el éxito', async () => {
      // Arrange
      const mockOperation = jest.fn()
        .mockRejectedValueOnce(new Error('Temporary failure 1'))
        .mockRejectedValueOnce(new Error('Temporary failure 2'))
        .mockResolvedValue('success on third attempt');

      // Act
      const result = await immichService.executeWithRetry(mockOperation, {
        attempts: 3,
        delay: 10 // Delay corto para tests
      });

      // Assert
      expect(result).toBe('success on third attempt');
      expect(mockOperation).toHaveBeenCalledTimes(3);
    });

    it('debería fallar después de agotar todos los reintentos', async () => {
      // Arrange
      const mockOperation = jest.fn().mockRejectedValue(new Error('Persistent failure'));

      // Act & Assert
      await expect(
        immichService.executeWithRetry(mockOperation, {
          attempts: 2,
          delay: 10
        })
      ).rejects.toThrow('Persistent failure');

      expect(mockOperation).toHaveBeenCalledTimes(2);
    });

    it('debería implementar delay incremental entre reintentos', async () => {
      // Arrange
      const mockOperation = jest.fn()
        .mockRejectedValueOnce(new Error('Failure 1'))
        .mockRejectedValueOnce(new Error('Failure 2'))
        .mockResolvedValue('success');

      const startTime = Date.now();

      // Act
      await immichService.executeWithRetry(mockOperation, {
        attempts: 3,
        delay: 50
      });

      const endTime = Date.now();

      // Assert
      expect(mockOperation).toHaveBeenCalledTimes(3);
      // Debería haber tomado al menos 50ms (primer delay) + 100ms (segundo delay)
      expect(endTime - startTime).toBeGreaterThan(100);
    });
  });

  describe('MediaService - Integración con Immich', () => {
    beforeEach(async () => {
      mockImmichApi.serverInfoApi.getServerInfo.mockResolvedValue({ version: '1.138.1' });
      
      // Mock de datos de prueba para MediaService
      mockPrisma.inscripcion.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.medio.count.mockResolvedValue(0);
      mockPrisma.concurso.findUnique.mockResolvedValue({
        id: 1,
        max_envios: 3,
        status: 'ACTIVO',
        fecha_inicio: new Date(Date.now() - 86400000),
        fecha_final: new Date(Date.now() + 86400000)
      });
    });

    it('debería generar URL de subida para fotografía válida', async () => {
      // Arrange
      const uploadRequest = {
        titulo: 'Fotografía de Prueba',
        tipo_medio: 'fotografia' as const,
        categoria_id: 1,
        file_size: 5 * 1024 * 1024, // 5MB
        file_type: 'image/jpeg',
        file_name: 'test-photo.jpg'
      };

      // Act
      const result = await mediaService.generateUploadUrl('user-123', 1, uploadRequest);

      // Assert
      expect(result).toHaveProperty('upload_token');
      expect(result).toHaveProperty('upload_url');
      expect(result).toHaveProperty('expires_at');
      expect(result).toHaveProperty('max_file_size');
      expect(result).toHaveProperty('allowed_formats');
      expect(result).toHaveProperty('validation_rules');

      expect(result.allowed_formats).toContain('image/jpeg');
      expect(result.max_file_size).toBe(10 * 1024 * 1024); // 10MB para fotografías
      expect(result.validation_rules.maxDimensions).toEqual({ width: 4000, height: 4000 });
    });

    it('debería generar URL de subida para video válido', async () => {
      // Arrange
      const uploadRequest = {
        titulo: 'Video de Prueba',
        tipo_medio: 'video' as const,
        categoria_id: 1,
        file_size: 50 * 1024 * 1024, // 50MB
        file_type: 'video/mp4',
        file_name: 'test-video.mp4'
      };

      // Act
      const result = await mediaService.generateUploadUrl('user-123', 1, uploadRequest);

      // Assert
      expect(result.allowed_formats).toContain('video/mp4');
      expect(result.max_file_size).toBe(100 * 1024 * 1024); // 100MB para videos
      expect(result.validation_rules.maxDuration).toBe(600); // 10 minutos
    });

    it('debería generar URL de subida para audio válido', async () => {
      // Arrange
      const uploadRequest = {
        titulo: 'Audio de Prueba',
        tipo_medio: 'audio' as const,
        categoria_id: 1,
        file_size: 20 * 1024 * 1024, // 20MB
        file_type: 'audio/mp3',
        file_name: 'test-audio.mp3'
      };

      // Act
      const result = await mediaService.generateUploadUrl('user-123', 1, uploadRequest);

      // Assert
      expect(result.allowed_formats).toContain('audio/mp3');
      expect(result.max_file_size).toBe(50 * 1024 * 1024); // 50MB para audios
      expect(result.validation_rules.maxDuration).toBe(1800); // 30 minutos
    });

    it('debería generar URL de subida para corto de cine válido', async () => {
      // Arrange
      const uploadRequest = {
        titulo: 'Corto de Cine de Prueba',
        tipo_medio: 'corto_cine' as const,
        categoria_id: 1,
        file_size: 200 * 1024 * 1024, // 200MB
        file_type: 'video/mp4',
        file_name: 'test-short-film.mp4'
      };

      // Act
      const result = await mediaService.generateUploadUrl('user-123', 1, uploadRequest);

      // Assert
      expect(result.allowed_formats).toContain('video/mp4');
      expect(result.max_file_size).toBe(500 * 1024 * 1024); // 500MB para cortos de cine
      expect(result.validation_rules.maxDuration).toBe(1800); // 30 minutos
    });

    it('debería rechazar archivo que excede el tamaño máximo', async () => {
      // Arrange
      const oversizedRequest = {
        titulo: 'Archivo Muy Grande',
        tipo_medio: 'fotografia' as const,
        categoria_id: 1,
        file_size: 15 * 1024 * 1024, // 15MB (excede límite de 10MB para fotos)
        file_type: 'image/jpeg',
        file_name: 'huge-photo.jpg'
      };

      // Act & Assert
      await expect(
        mediaService.generateUploadUrl('user-123', 1, oversizedRequest)
      ).rejects.toThrow('El archivo excede el tamaño máximo de 10MB');
    });

    it('debería rechazar formato no permitido', async () => {
      // Arrange
      const invalidFormatRequest = {
        titulo: 'Formato Inválido',
        tipo_medio: 'fotografia' as const,
        categoria_id: 1,
        file_size: 5 * 1024 * 1024,
        file_type: 'image/gif', // GIF no está permitido para fotografías
        file_name: 'test.gif'
      };

      // Act & Assert
      await expect(
        mediaService.generateUploadUrl('user-123', 1, invalidFormatRequest)
      ).rejects.toThrow('Formato no permitido');
    });

    it('debería rechazar si el usuario no está inscrito', async () => {
      // Arrange
      mockPrisma.inscripcion.findUnique.mockResolvedValue(null);

      const uploadRequest = {
        titulo: 'Sin Inscripción',
        tipo_medio: 'fotografia' as const,
        categoria_id: 1,
        file_size: 5 * 1024 * 1024,
        file_type: 'image/jpeg',
        file_name: 'test.jpg'
      };

      // Act & Assert
      await expect(
        mediaService.generateUploadUrl('user-123', 1, uploadRequest)
      ).rejects.toThrow('Debes estar inscrito en el concurso para subir medios');
    });

    it('debería rechazar si se alcanzó el límite de envíos', async () => {
      // Arrange
      mockPrisma.medio.count.mockResolvedValue(3); // Ya tiene 3 envíos

      const uploadRequest = {
        titulo: 'Límite Alcanzado',
        tipo_medio: 'fotografia' as const,
        categoria_id: 1,
        file_size: 5 * 1024 * 1024,
        file_type: 'image/jpeg',
        file_name: 'test.jpg'
      };

      // Act & Assert
      await expect(
        mediaService.generateUploadUrl('user-123', 1, uploadRequest)
      ).rejects.toThrow('Has alcanzado el límite máximo de 3 envíos por concurso');
    });

    it('debería rechazar si el concurso no está activo', async () => {
      // Arrange
      mockPrisma.concurso.findUnique.mockResolvedValue({
        id: 1,
        max_envios: 3,
        status: 'FINALIZADO', // Concurso finalizado
        fecha_inicio: new Date(Date.now() - 86400000),
        fecha_final: new Date(Date.now() + 86400000)
      });

      const uploadRequest = {
        titulo: 'Concurso Inactivo',
        tipo_medio: 'fotografia' as const,
        categoria_id: 1,
        file_size: 5 * 1024 * 1024,
        file_type: 'image/jpeg',
        file_name: 'test.jpg'
      };

      // Act & Assert
      await expect(
        mediaService.generateUploadUrl('user-123', 1, uploadRequest)
      ).rejects.toThrow('El concurso no está activo para recibir envíos');
    });
  });

  describe('ImmichService - Gestión de Conectividad', () => {
    it('debería verificar conectividad exitosamente', async () => {
      // Arrange
      mockImmichApi.serverInfoApi.getServerInfo.mockResolvedValue({ version: '1.138.1' });
      await immichService.initialize();

      // Act
      const isConnected = await immichService.checkConnectivity();

      // Assert
      expect(isConnected).toBe(true);
    });

    it('debería detectar pérdida de conectividad', async () => {
      // Arrange
      mockImmichApi.serverInfoApi.getServerInfo
        .mockResolvedValueOnce({ version: '1.138.1' }) // Para initialize
        .mockRejectedValueOnce(new Error('Network error')); // Para connectivity check

      await immichService.initialize();

      // Act
      const isConnected = await immichService.checkConnectivity();

      // Assert
      expect(isConnected).toBe(false);
    });

    it('debería obtener información de conexión correcta', async () => {
      // Arrange
      const mockServerInfo = { version: '1.138.1', versionHash: 'abc123' };
      mockImmichApi.serverInfoApi.getServerInfo.mockResolvedValue(mockServerInfo);
      await immichService.initialize();

      // Act
      const connectionInfo = immichService.getConnectionInfo();

      // Assert
      expect(connectionInfo).toEqual({
        serverUrl: immichConfig.serverUrl,
        isConnected: true,
        lastHealthCheck: expect.any(Date),
        serverInfo: mockServerInfo
      });
    });

    it('debería limpiar estado al desconectar', () => {
      // Act
      immichService.disconnect();

      // Assert
      const connectionInfo = immichService.getConnectionInfo();
      expect(connectionInfo.isConnected).toBe(false);
      expect(connectionInfo.lastHealthCheck).toBeUndefined();
      expect(connectionInfo.serverInfo).toBeUndefined();
    });
  });

  describe('Configuración de Validación de Medios', () => {
    it('debería tener configuración completa para todos los tipos de medios', () => {
      // Arrange
      const { MEDIA_VALIDATION_CONFIG } = require('../src/services/media.service');

      // Assert
      expect(MEDIA_VALIDATION_CONFIG).toBeDefined();
      
      const tiposEsperados = ['fotografia', 'video', 'audio', 'corto_cine'];
      tiposEsperados.forEach(tipo => {
        expect(MEDIA_VALIDATION_CONFIG[tipo]).toBeDefined();
        expect(MEDIA_VALIDATION_CONFIG[tipo].formats).toBeInstanceOf(Array);
        expect(MEDIA_VALIDATION_CONFIG[tipo].maxSizeMB).toBeGreaterThan(0);
        expect(MEDIA_VALIDATION_CONFIG[tipo].extensions).toBeInstanceOf(Array);
      });
    });

    it('debería tener límites apropiados por tipo de medio', () => {
      // Arrange
      const { MEDIA_VALIDATION_CONFIG } = require('../src/services/media.service');

      // Assert
      expect(MEDIA_VALIDATION_CONFIG.fotografia.maxSizeMB).toBe(10);
      expect(MEDIA_VALIDATION_CONFIG.video.maxSizeMB).toBe(100);
      expect(MEDIA_VALIDATION_CONFIG.audio.maxSizeMB).toBe(50);
      expect(MEDIA_VALIDATION_CONFIG.corto_cine.maxSizeMB).toBe(500);

      expect(MEDIA_VALIDATION_CONFIG.video.maxDuration).toBe(600); // 10 minutos
      expect(MEDIA_VALIDATION_CONFIG.audio.maxDuration).toBe(1800); // 30 minutos
      expect(MEDIA_VALIDATION_CONFIG.corto_cine.maxDuration).toBe(1800); // 30 minutos
    });

    it('debería tener formatos específicos por tipo de medio', () => {
      // Arrange
      const { MEDIA_VALIDATION_CONFIG } = require('../src/services/media.service');

      // Assert
      expect(MEDIA_VALIDATION_CONFIG.fotografia.formats).toEqual(
        expect.arrayContaining(['image/jpeg', 'image/png', 'image/webp'])
      );
      expect(MEDIA_VALIDATION_CONFIG.video.formats).toEqual(
        expect.arrayContaining(['video/mp4', 'video/webm'])
      );
      expect(MEDIA_VALIDATION_CONFIG.audio.formats).toEqual(
        expect.arrayContaining(['audio/mpeg', 'audio/wav', 'audio/flac'])
      );
      expect(MEDIA_VALIDATION_CONFIG.corto_cine.formats).toEqual(
        expect.arrayContaining(['video/mp4', 'video/webm'])
      );
    });
  });
});