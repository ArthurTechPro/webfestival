import { PrismaClient } from '@prisma/client';

// Configuración de la base de datos
export const databaseConfig = {
  // URL de conexión desde variables de entorno
  url: process.env['DATABASE_URL'],
  
  // Configuración de logging según el entorno
  logging: process.env['NODE_ENV'] === 'development' ? ['query', 'error', 'warn'] : ['error'],
  
  // Configuración de pool de conexiones
  connectionPool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 60000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 200,
  },
  
  // Configuración de reintentos
  retry: {
    attempts: 3,
    delay: 1000,
  }
};

// Validación de configuración de base de datos
export function validateDatabaseConfig() {
  if (!process.env['DATABASE_URL']) {
    throw new Error('DATABASE_URL no está definida en las variables de entorno');
  }

  // Validar formato de URL de PostgreSQL
  const urlPattern = /^postgresql:\/\/[^:]+:[^@]+@[^:]+:\d+\/[^?]+(\?.*)?$/;
  if (!urlPattern.test(process.env['DATABASE_URL'])) {
    throw new Error('DATABASE_URL no tiene el formato correcto para PostgreSQL');
  }

  console.log('✅ Configuración de base de datos validada correctamente');
}

// Función para obtener información de la base de datos
export async function getDatabaseInfo(prisma: PrismaClient) {
  try {
    const result = await prisma.$queryRaw<Array<{ version: string }>>`SELECT version()`;
    const version = result[0]?.version || 'Desconocida';
    
    return {
      type: 'PostgreSQL',
      version: version.split(' ')[1] || 'Desconocida',
      status: 'Conectada',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      type: 'PostgreSQL',
      version: 'Desconocida',
      status: 'Error de conexión',
      error: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    };
  }
}

export default databaseConfig;