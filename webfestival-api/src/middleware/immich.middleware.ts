import { Request, Response, NextFunction } from 'express';
import { immichService } from '../services/immich.service';

/**
 * Middleware para verificar la conectividad con Immich
 * Se puede usar en rutas que requieren funcionalidad de Immich
 */
export const requireImmichConnection = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const isConnected = await immichService.checkConnectivity();
    
    if (!isConnected) {
      res.status(503).json({
        error: 'Servicio no disponible',
        message: 'El servicio de almacenamiento de medios no está disponible temporalmente',
        code: 'IMMICH_UNAVAILABLE'
      });
      return;
    }

    next();
  } catch (error) {
    console.error('❌ Error al verificar conexión con Immich:', error);
    
    res.status(503).json({
      error: 'Servicio no disponible',
      message: 'Error al conectar con el servicio de almacenamiento de medios',
      code: 'IMMICH_CONNECTION_ERROR'
    });
  }
};

/**
 * Función para inicializar Immich al arrancar la aplicación
 * Debe ser llamada durante el startup de la aplicación
 */
export const initializeImmich = async (): Promise<void> => {
  try {
    console.log('🚀 Inicializando conexión con Immich...');
    await immichService.initialize();
    console.log('✅ Immich inicializado correctamente');
  } catch (error) {
    console.error('❌ Error al inicializar Immich:', error);
    
    // En desarrollo, podemos continuar sin Immich
    if (process.env['NODE_ENV'] === 'development') {
      console.warn('⚠️ Continuando en modo desarrollo sin Immich');
      return;
    }
    
    // En producción, Immich es crítico
    throw new Error('Fallo crítico: No se pudo inicializar Immich');
  }
};