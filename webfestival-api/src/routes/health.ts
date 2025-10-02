import { Router } from 'express';
import { checkDatabaseHealth } from '../lib/prisma';
import { getDatabaseInfo } from '../config/database';
import prisma from '../lib/prisma';

const router = Router();

/**
 * GET /health
 * Endpoint para verificar el estado general del sistema
 */
router.get('/', async (_req, res) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    const dbInfo = await getDatabaseInfo(prisma);
    
    const healthStatus = {
      status: dbHealth.status === 'healthy' ? 'OK' : 'ERROR',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env['NODE_ENV'] || 'development',
      services: {
        database: {
          status: dbHealth.status,
          message: dbHealth.message,
          info: dbInfo
        },
        api: {
          status: 'healthy',
          message: 'API funcionando correctamente'
        }
      }
    };

    const statusCode = dbHealth.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(healthStatus);
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      message: 'Error verificando el estado del sistema',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

/**
 * GET /health/database
 * Endpoint específico para verificar el estado de la base de datos
 */
router.get('/database', async (_req, res) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    const dbInfo = await getDatabaseInfo(prisma);
    
    res.status(dbHealth.status === 'healthy' ? 200 : 503).json({
      ...dbHealth,
      info: dbInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      message: 'Error verificando la base de datos',
      error: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /health/database/stats
 * Endpoint para obtener estadísticas básicas de la base de datos
 */
router.get('/database/stats', async (_req, res) => {
  try {
    const [
      totalUsuarios,
      totalConcursos,
      totalMedios,
      totalCriterios,
      totalPlanes
    ] = await Promise.all([
      prisma.usuario.count(),
      prisma.concurso.count(),
      prisma.medio.count(),
      prisma.criterio.count(),
      prisma.subscriptionPlan.count()
    ]);

    const stats = {
      usuarios: totalUsuarios,
      concursos: totalConcursos,
      medios: totalMedios,
      criterios: totalCriterios,
      planes_suscripcion: totalPlanes,
      timestamp: new Date().toISOString()
    };

    res.json({
      status: 'OK',
      message: 'Estadísticas de base de datos obtenidas correctamente',
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Error obteniendo estadísticas de la base de datos',
      error: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;