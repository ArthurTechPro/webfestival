import { init, getServerVersion } from '@immich/sdk';
import { immichConfig, validateImmichConfig } from '../config/immich';

/**
 * Tipos para el servicio de Immich
 */
export interface ImmichHealthStatus {
  isHealthy: boolean;
  serverVersion?: string;
  error?: string;
  timestamp: Date;
}

export interface ImmichConnectionInfo {
  serverUrl: string;
  isConnected: boolean;
  lastHealthCheck?: Date | undefined;
  serverInfo?: any;
}

export interface RetryOptions {
  attempts: number;
  delay: number;
  backoff?: boolean;
}

/**
 * Servicio para gestionar la conexión con Immich
 * Incluye autenticación, health checks, manejo de errores y reintentos
 */
export class ImmichService {
  private isInitialized = false;
  private lastHealthCheck: Date | null = null;
  private connectionInfo: ImmichConnectionInfo;

  constructor() {
    this.connectionInfo = {
      serverUrl: immichConfig.serverUrl,
      isConnected: false,
    };
  }

  /**
   * Inicializa la conexión con Immich
   * Valida la configuración y establece la autenticación
   */
  async initialize(): Promise<void> {
    try {
      // Validar configuración antes de inicializar
      validateImmichConfig();

      // Inicializar el SDK de Immich
      init({
        baseUrl: immichConfig.serverUrl,
        apiKey: immichConfig.apiKey,
      });

      this.isInitialized = true;

      // Realizar health check inicial
      const healthStatus = await this.performHealthCheck();
      if (!healthStatus.isHealthy) {
        throw new Error(`Health check falló: ${healthStatus.error}`);
      }

      this.connectionInfo.isConnected = true;
      this.connectionInfo.lastHealthCheck = new Date();

      console.log('✅ Conexión con Immich inicializada correctamente');
    } catch (error) {
      this.isInitialized = false;
      this.connectionInfo.isConnected = false;
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('❌ Error al inicializar conexión con Immich:', errorMessage);
      throw new Error(`Fallo al inicializar Immich: ${errorMessage}`);
    }
  }

  /**
   * Verifica si el servicio está inicializado y conectado
   */
  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('Servicio de Immich no inicializado. Llama a initialize() primero.');
    }
  }

  /**
   * Realiza un health check del servidor Immich
   */
  async performHealthCheck(): Promise<ImmichHealthStatus> {
    const timestamp = new Date();
    
    try {
      if (!this.isInitialized) {
        return {
          isHealthy: false,
          error: 'Servicio de Immich no inicializado',
          timestamp,
        };
      }

      // Intentar obtener información del servidor
      const serverInfo = await this.executeWithRetry(
        () => getServerVersion(),
        { attempts: 2, delay: 1000 }
      );

      this.lastHealthCheck = timestamp;
      this.connectionInfo.serverInfo = serverInfo;

      return {
        isHealthy: true,
        serverVersion: (serverInfo as any).version,
        timestamp,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      return {
        isHealthy: false,
        error: errorMessage,
        timestamp,
      };
    }
  }

  /**
   * Obtiene información de la conexión actual
   */
  getConnectionInfo(): ImmichConnectionInfo {
    return {
      ...this.connectionInfo,
      lastHealthCheck: this.lastHealthCheck ?? undefined,
    };
  }

  /**
   * Ejecuta una función con reintentos automáticos
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {
      attempts: immichConfig.retryAttempts,
      delay: immichConfig.retryDelay,
      backoff: true,
    }
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= options.attempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Error desconocido');
        
        // Si es el último intento, lanzar el error
        if (attempt === options.attempts) {
          throw lastError;
        }

        // Calcular delay con backoff exponencial si está habilitado
        const delay = options.backoff 
          ? options.delay * Math.pow(2, attempt - 1)
          : options.delay;

        console.warn(
          `⚠️ Intento ${attempt}/${options.attempts} falló: ${lastError.message}. ` +
          `Reintentando en ${delay}ms...`
        );

        // Esperar antes del siguiente intento
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  /**
   * Verifica que el servicio esté inicializado
   * Útil para operaciones que requieren conexión activa
   */
  ensureConnection(): void {
    this.ensureInitialized();
    if (!this.connectionInfo.isConnected) {
      throw new Error('No hay conexión activa con Immich');
    }
  }

  /**
   * Verifica la conectividad con Immich
   * Realiza un health check y actualiza el estado de conexión
   */
  async checkConnectivity(): Promise<boolean> {
    try {
      const healthStatus = await this.performHealthCheck();
      this.connectionInfo.isConnected = healthStatus.isHealthy;
      return healthStatus.isHealthy;
    } catch (error) {
      this.connectionInfo.isConnected = false;
      console.error('❌ Error al verificar conectividad con Immich:', error);
      return false;
    }
  }

  /**
   * Reinicia la conexión con Immich
   * Útil cuando hay problemas de conectividad
   */
  async reconnect(): Promise<void> {
    console.log('🔄 Reiniciando conexión con Immich...');
    
    this.isInitialized = false;
    this.connectionInfo.isConnected = false;
    
    await this.initialize();
  }

  /**
   * Cierra la conexión con Immich
   */
  disconnect(): void {
    this.isInitialized = false;
    this.connectionInfo.isConnected = false;
    this.lastHealthCheck = null;
    
    console.log('🔌 Conexión con Immich desconectada');
  }
}

// Instancia singleton del servicio
export const immichService = new ImmichService();