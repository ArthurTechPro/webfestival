import { ImmichService } from '@/services/immich.service';
import { validateImmichConfig } from '@/config/immich';

// Mock del SDK de Immich
jest.mock('@immich/sdk', () => ({
  ImmichApi: jest.fn().mockImplementation(() => ({
    serverInfoApi: {
      getServerInfo: jest.fn(),
    },
  })),
  defaults: {
    baseUrl: '',
    headers: {},
  },
}));

// Mock de la configuración
jest.mock('@/config/immich', () => ({
  immichConfig: {
    serverUrl: 'http://localhost:2283',
    apiKey: 'test-api-key',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  validateImmichConfig: jest.fn(),
}));

describe('ImmichService', () => {
  let immichService: ImmichService;
  const mockValidateImmichConfig = validateImmichConfig as jest.MockedFunction<typeof validateImmichConfig>;

  beforeEach(() => {
    immichService = new ImmichService();
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('debería inicializar correctamente con configuración válida', async () => {
      // Arrange
      mockValidateImmichConfig.mockImplementation(() => {});
      const mockGetServerInfo = jest.fn().mockResolvedValue({
        version: '1.0.0',
        versionHash: 'abc123',
      });

      // Mock de la API
      const { ImmichApi } = require('@immich/sdk');
      ImmichApi.mockImplementation(() => ({
        serverInfoApi: {
          getServerInfo: mockGetServerInfo,
        },
      }));

      // Act
      await immichService.initialize();

      // Assert
      expect(mockValidateImmichConfig).toHaveBeenCalled();
      expect(mockGetServerInfo).toHaveBeenCalled();
      
      const connectionInfo = immichService.getConnectionInfo();
      expect(connectionInfo.isConnected).toBe(true);
      expect(connectionInfo.serverUrl).toBe('http://localhost:2283');
    });

    it('debería fallar con configuración inválida', async () => {
      // Arrange
      mockValidateImmichConfig.mockImplementation(() => {
        throw new Error('Configuración inválida');
      });

      // Act & Assert
      await expect(immichService.initialize()).rejects.toThrow('Fallo al inicializar Immich');
      
      const connectionInfo = immichService.getConnectionInfo();
      expect(connectionInfo.isConnected).toBe(false);
    });
  });

  describe('performHealthCheck', () => {
    it('debería retornar healthy cuando la API responde correctamente', async () => {
      // Arrange
      const mockGetServerInfo = jest.fn().mockResolvedValue({
        version: '1.0.0',
        versionHash: 'abc123',
      });

      mockValidateImmichConfig.mockImplementation(() => {});
      
      const { ImmichApi } = require('@immich/sdk');
      ImmichApi.mockImplementation(() => ({
        serverInfoApi: {
          getServerInfo: mockGetServerInfo,
        },
      }));

      await immichService.initialize();

      // Act
      const healthStatus = await immichService.performHealthCheck();

      // Assert
      expect(healthStatus.isHealthy).toBe(true);
      expect(healthStatus.serverVersion).toBe('1.0.0');
      expect(healthStatus.timestamp).toBeInstanceOf(Date);
      expect(healthStatus.error).toBeUndefined();
    });

    it('debería retornar unhealthy cuando la API falla', async () => {
      // Arrange
      const mockGetServerInfo = jest.fn().mockRejectedValue(new Error('Connection failed'));

      mockValidateImmichConfig.mockImplementation(() => {});
      
      const { ImmichApi } = require('@immich/sdk');
      ImmichApi.mockImplementation(() => ({
        serverInfoApi: {
          getServerInfo: mockGetServerInfo,
        },
      }));

      await immichService.initialize();

      // Act
      const healthStatus = await immichService.performHealthCheck();

      // Assert
      expect(healthStatus.isHealthy).toBe(false);
      expect(healthStatus.error).toBe('Connection failed');
      expect(healthStatus.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('executeWithRetry', () => {
    it('debería ejecutar operación exitosa sin reintentos', async () => {
      // Arrange
      const mockOperation = jest.fn().mockResolvedValue('success');

      // Act
      const result = await immichService.executeWithRetry(mockOperation, {
        attempts: 3,
        delay: 100,
      });

      // Assert
      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });

    it('debería reintentar operación fallida', async () => {
      // Arrange
      const mockOperation = jest.fn()
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockRejectedValueOnce(new Error('Second attempt failed'))
        .mockResolvedValue('success');

      // Act
      const result = await immichService.executeWithRetry(mockOperation, {
        attempts: 3,
        delay: 10, // Delay corto para tests
      });

      // Assert
      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(3);
    });

    it('debería fallar después de agotar todos los reintentos', async () => {
      // Arrange
      const mockOperation = jest.fn().mockRejectedValue(new Error('Always fails'));

      // Act & Assert
      await expect(
        immichService.executeWithRetry(mockOperation, {
          attempts: 2,
          delay: 10,
        })
      ).rejects.toThrow('Always fails');

      expect(mockOperation).toHaveBeenCalledTimes(2);
    });
  });

  describe('checkConnectivity', () => {
    it('debería retornar true cuando el health check es exitoso', async () => {
      // Arrange
      const mockGetServerInfo = jest.fn().mockResolvedValue({
        version: '1.0.0',
      });

      mockValidateImmichConfig.mockImplementation(() => {});
      
      const { ImmichApi } = require('@immich/sdk');
      ImmichApi.mockImplementation(() => ({
        serverInfoApi: {
          getServerInfo: mockGetServerInfo,
        },
      }));

      await immichService.initialize();

      // Act
      const isConnected = await immichService.checkConnectivity();

      // Assert
      expect(isConnected).toBe(true);
    });

    it('debería retornar false cuando el health check falla', async () => {
      // Arrange
      const mockGetServerInfo = jest.fn().mockRejectedValue(new Error('Connection failed'));

      mockValidateImmichConfig.mockImplementation(() => {});
      
      const { ImmichApi } = require('@immich/sdk');
      ImmichApi.mockImplementation(() => ({
        serverInfoApi: {
          getServerInfo: mockGetServerInfo,
        },
      }));

      await immichService.initialize();

      // Act
      const isConnected = await immichService.checkConnectivity();

      // Assert
      expect(isConnected).toBe(false);
    });
  });

  describe('getConnectionInfo', () => {
    it('debería retornar información de conexión correcta', () => {
      // Act
      const connectionInfo = immichService.getConnectionInfo();

      // Assert
      expect(connectionInfo).toEqual({
        serverUrl: 'http://localhost:2283',
        isConnected: false,
        lastHealthCheck: undefined,
        serverInfo: undefined,
      });
    });
  });

  describe('disconnect', () => {
    it('debería limpiar el estado de conexión', async () => {
      // Arrange
      mockValidateImmichConfig.mockImplementation(() => {});
      
      const { ImmichApi } = require('@immich/sdk');
      ImmichApi.mockImplementation(() => ({
        serverInfoApi: {
          getServerInfo: jest.fn().mockResolvedValue({ version: '1.0.0' }),
        },
      }));

      await immichService.initialize();

      // Act
      immichService.disconnect();

      // Assert
      const connectionInfo = immichService.getConnectionInfo();
      expect(connectionInfo.isConnected).toBe(false);
      
      // Debería fallar al intentar usar la API después de disconnect
      expect(() => immichService.getApi()).toThrow('Servicio de Immich no inicializado');
    });
  });
});