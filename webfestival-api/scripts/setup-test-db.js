#!/usr/bin/env node

/**
 * Script para configurar la base de datos de pruebas
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🗄️ Configurando base de datos de pruebas...\n');

// Configuración de la base de datos de pruebas
const TEST_DB_CONFIG = {
  host: 'localhost',
  port: 5432,
  database: 'webfestival_test_db',
  username: 'postgres',
  password: 'wasi3355' // Usando la misma contraseña del .env principal
};

const TEST_DATABASE_URL = `postgresql://${TEST_DB_CONFIG.username}:${TEST_DB_CONFIG.password}@${TEST_DB_CONFIG.host}:${TEST_DB_CONFIG.port}/${TEST_DB_CONFIG.database}`;

try {
  console.log('1. Verificando conexión a PostgreSQL...');
  
  // Verificar que PostgreSQL esté disponible
  execSync(`psql -h ${TEST_DB_CONFIG.host} -U ${TEST_DB_CONFIG.username} -c "SELECT version();"`, {
    env: { ...process.env, PGPASSWORD: TEST_DB_CONFIG.password },
    stdio: 'pipe'
  });
  console.log('   ✅ PostgreSQL está disponible');

  console.log('\n2. Creando base de datos de pruebas...');
  
  // Intentar crear la base de datos de pruebas
  try {
    execSync(`psql -h ${TEST_DB_CONFIG.host} -U ${TEST_DB_CONFIG.username} -c "CREATE DATABASE ${TEST_DB_CONFIG.database};"`, {
      env: { ...process.env, PGPASSWORD: TEST_DB_CONFIG.password },
      stdio: 'pipe'
    });
    console.log('   ✅ Base de datos de pruebas creada');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('   ℹ️ Base de datos de pruebas ya existe');
    } else {
      throw error;
    }
  }

  console.log('\n3. Actualizando archivo .env.test...');
  
  // Actualizar el archivo .env.test con la configuración correcta
  const envTestPath = path.join(__dirname, '..', '.env.test');
  let envTestContent = fs.readFileSync(envTestPath, 'utf8');
  
  // Reemplazar la DATABASE_URL
  envTestContent = envTestContent.replace(
    /DATABASE_URL=".*"/,
    `DATABASE_URL="${TEST_DATABASE_URL}"`
  );
  
  fs.writeFileSync(envTestPath, envTestContent);
  console.log('   ✅ Archivo .env.test actualizado');

  console.log('\n4. Ejecutando migraciones de Prisma...');
  
  // Ejecutar migraciones en la base de datos de pruebas
  execSync('npx prisma migrate deploy', {
    env: { 
      ...process.env, 
      DATABASE_URL: TEST_DATABASE_URL,
      NODE_ENV: 'test'
    },
    stdio: 'inherit'
  });
  console.log('   ✅ Migraciones ejecutadas');

  console.log('\n5. Generando cliente de Prisma...');
  
  // Generar el cliente de Prisma
  execSync('npx prisma generate', {
    stdio: 'inherit'
  });
  console.log('   ✅ Cliente de Prisma generado');

  console.log('\n🎉 Base de datos de pruebas configurada exitosamente!');
  console.log(`📊 Configuración:`);
  console.log(`   - Host: ${TEST_DB_CONFIG.host}`);
  console.log(`   - Puerto: ${TEST_DB_CONFIG.port}`);
  console.log(`   - Base de datos: ${TEST_DB_CONFIG.database}`);
  console.log(`   - Usuario: ${TEST_DB_CONFIG.username}`);
  console.log(`   - URL: ${TEST_DATABASE_URL}`);

} catch (error) {
  console.error('\n❌ Error al configurar la base de datos de pruebas:');
  console.error(error.message);
  
  console.log('\n🔧 Posibles soluciones:');
  console.log('1. Verificar que PostgreSQL esté ejecutándose');
  console.log('2. Verificar las credenciales de la base de datos');
  console.log('3. Verificar que el usuario tenga permisos para crear bases de datos');
  console.log('4. Ejecutar: createdb webfestival_test_db');
  
  process.exit(1);
}