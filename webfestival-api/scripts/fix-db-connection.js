#!/usr/bin/env node
// 🔧 SCRIPT PARA SOLUCIONAR PROBLEMAS DE CONEXIÓN A POSTGRESQL
// Diagnostica y soluciona problemas comunes de conexión con Prisma

const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const print = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  title: (msg) => console.log(`${colors.cyan}\n🔧 ${msg}${colors.reset}`)
};

async function diagnosticarConexion() {
  print.title('DIAGNÓSTICO DE CONEXIÓN A POSTGRESQL');
  
  // 1. Verificar variables de entorno
  print.info('1. Verificando variables de entorno...');
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    print.error('DATABASE_URL no está definida');
    return false;
  }
  
  print.success(`DATABASE_URL configurada: ${databaseUrl.replace(/:[^:@]*@/, ':****@')}`);
  
  // 2. Verificar que PostgreSQL esté corriendo
  print.info('2. Verificando estado de PostgreSQL...');
  try {
    execSync('pg_isready -h localhost -p 5432', { stdio: 'pipe' });
    print.success('PostgreSQL está corriendo');
  } catch (error) {
    print.error('PostgreSQL no está corriendo o no es accesible');
    print.info('Inicia PostgreSQL con: net start postgresql-x64-14');
    return false;
  }
  
  // 3. Probar conexión directa con psql
  print.info('3. Probando conexión directa...');
  try {
    const url = new URL(databaseUrl);
    const command = `psql -h ${url.hostname} -p ${url.port} -U ${url.username} -d ${url.pathname.slice(1)} -c "SELECT 1;"`;
    execSync(command, { stdio: 'pipe', env: { ...process.env, PGPASSWORD: url.password } });
    print.success('Conexión directa exitosa');
  } catch (error) {
    print.error('Error en conexión directa');
    print.info('Verifica usuario, contraseña y base de datos');
    return false;
  }
  
  // 4. Probar conexión con Prisma
  print.info('4. Probando conexión con Prisma...');
  const prisma = new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: {
        url: databaseUrl
      }
    }
  });
  
  try {
    await prisma.$connect();
    print.success('Conexión con Prisma exitosa');
    
    // Probar una consulta simple
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    print.success('Consulta de prueba exitosa');
    
    await prisma.$disconnect();
    return true;
  } catch (error) {
    print.error(`Error con Prisma: ${error.message}`);
    
    if (error.message.includes('terminando la conexión debido a una orden del administrador')) {
      print.warning('Error específico: Conexión terminada por administrador');
      print.info('Posibles causas:');
      print.info('- Pool de conexiones agotado');
      print.info('- Timeout de conexión');
      print.info('- Configuración de PostgreSQL restrictiva');
      print.info('- Proceso de PostgreSQL reiniciándose');
    }
    
    await prisma.$disconnect();
    return false;
  }
}

async function aplicarSoluciones() {
  print.title('APLICANDO SOLUCIONES');
  
  // 1. Reiniciar pool de conexiones de Prisma
  print.info('1. Regenerando cliente de Prisma...');
  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    print.success('Cliente de Prisma regenerado');
  } catch (error) {
    print.error('Error al regenerar cliente de Prisma');
  }
  
  // 2. Verificar y aplicar migraciones
  print.info('2. Verificando migraciones...');
  try {
    execSync('npx prisma migrate status', { stdio: 'pipe' });
    print.success('Migraciones están al día');
  } catch (error) {
    print.warning('Hay migraciones pendientes, aplicando...');
    try {
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      print.success('Migraciones aplicadas');
    } catch (migrateError) {
      print.error('Error al aplicar migraciones');
    }
  }
  
  // 3. Limpiar conexiones activas
  print.info('3. Limpiando conexiones activas...');
  const prisma = new PrismaClient();
  try {
    // Terminar conexiones idle
    await prisma.$queryRaw`
      SELECT pg_terminate_backend(pid) 
      FROM pg_stat_activity 
      WHERE datname = 'webfestival_db' 
      AND pid <> pg_backend_pid() 
      AND state = 'idle'
    `;
    print.success('Conexiones idle terminadas');
  } catch (error) {
    print.warning('No se pudieron terminar conexiones idle (puede ser normal)');
  } finally {
    await prisma.$disconnect();
  }
  
  // 4. Verificar configuración de PostgreSQL
  print.info('4. Verificando configuración de PostgreSQL...');
  try {
    const prisma2 = new PrismaClient();
    const config = await prisma2.$queryRaw`
      SELECT name, setting, unit, context 
      FROM pg_settings 
      WHERE name IN ('max_connections', 'shared_preload_libraries', 'log_connections', 'log_disconnections')
    `;
    
    print.info('Configuración actual de PostgreSQL:');
    config.forEach(row => {
      console.log(`  ${row.name}: ${row.setting}${row.unit || ''}`);
    });
    
    await prisma2.$disconnect();
  } catch (error) {
    print.warning('No se pudo obtener configuración de PostgreSQL');
  }
}

async function probarConexionMejorada() {
  print.title('PROBANDO CONEXIÓN MEJORADA');
  
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });
  
  try {
    // Probar múltiples conexiones simultáneas
    print.info('Probando múltiples conexiones simultáneas...');
    
    const promises = Array.from({ length: 5 }, async (_, i) => {
      const result = await prisma.$queryRaw`SELECT ${i + 1} as connection_test, NOW() as timestamp`;
      return result[0];
    });
    
    const results = await Promise.all(promises);
    print.success(`${results.length} conexiones simultáneas exitosas`);
    
    // Probar consulta a tabla real
    print.info('Probando consulta a tabla de usuarios...');
    const userCount = await prisma.usuario.count();
    print.success(`Consulta exitosa: ${userCount} usuarios en la base de datos`);
    
    await prisma.$disconnect();
    return true;
    
  } catch (error) {
    print.error(`Error en prueba mejorada: ${error.message}`);
    await prisma.$disconnect();
    return false;
  }
}

async function main() {
  console.log('🔧 Script de Diagnóstico y Reparación de Conexión PostgreSQL\n');
  
  // Cargar variables de entorno
  require('dotenv').config();
  
  // Paso 1: Diagnóstico
  const diagnosticoOk = await diagnosticarConexion();
  
  if (!diagnosticoOk) {
    print.warning('Diagnóstico falló, aplicando soluciones...');
    await aplicarSoluciones();
    
    // Volver a diagnosticar
    print.info('Volviendo a diagnosticar después de aplicar soluciones...');
    const segundoDiagnostico = await diagnosticarConexion();
    
    if (!segundoDiagnostico) {
      print.error('Las soluciones automáticas no resolvieron el problema');
      print.info('Soluciones manuales recomendadas:');
      print.info('1. Reiniciar PostgreSQL: net stop postgresql-x64-14 && net start postgresql-x64-14');
      print.info('2. Verificar logs de PostgreSQL en: C:\\Program Files\\PostgreSQL\\14\\data\\log\\');
      print.info('3. Aumentar max_connections en postgresql.conf');
      print.info('4. Verificar que no hay procesos bloqueando la base de datos');
      process.exit(1);
    }
  }
  
  // Paso 2: Prueba mejorada
  const pruebaOk = await probarConexionMejorada();
  
  if (pruebaOk) {
    print.success('🎉 Conexión a PostgreSQL funcionando correctamente');
    print.info('Puedes ejecutar tu aplicación con: npm run dev');
  } else {
    print.error('La conexión básica funciona pero hay problemas con consultas complejas');
    print.info('Revisa los logs de la aplicación para más detalles');
    process.exit(1);
  }
}

// Manejar errores no capturados
process.on('unhandledRejection', (error) => {
  print.error(`Error no manejado: ${error.message}`);
  process.exit(1);
});

process.on('SIGINT', () => {
  print.info('Script interrumpido por el usuario');
  process.exit(0);
});

main().catch((error) => {
  print.error(`Error en script principal: ${error.message}`);
  process.exit(1);
});