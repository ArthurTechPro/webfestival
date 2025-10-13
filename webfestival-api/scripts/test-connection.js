#!/usr/bin/env node
// 🧪 SCRIPT DE PRUEBA DE CONEXIÓN SIMPLE
// Prueba rápida de conexión antes de iniciar la aplicación

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

async function testConnection() {
  try {
    console.log('🔍 Probando conexión a PostgreSQL...');
    
    // Conectar
    await prisma.$connect();
    console.log('✅ Conexión establecida');
    
    // Probar consulta simple
    const result = await prisma.$queryRaw`SELECT NOW() as current_time, version() as pg_version`;
    console.log('✅ Consulta exitosa:', result[0].current_time);
    
    // Probar consulta a tabla
    const userCount = await prisma.usuario.count();
    console.log(`✅ Usuarios en BD: ${userCount}`);
    
    // Desconectar
    await prisma.$disconnect();
    console.log('✅ Desconexión exitosa');
    
    console.log('\n🎉 Conexión funcionando correctamente. Puedes ejecutar npm run dev');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    
    if (error.code === 'P1001') {
      console.error('💡 Solución: Verifica que PostgreSQL esté corriendo');
    } else if (error.code === 'P1000') {
      console.error('💡 Solución: Verifica las credenciales en DATABASE_URL');
    } else if (error.message.includes('does not exist')) {
      console.error('💡 Solución: Ejecuta "npx prisma migrate dev" para crear la base de datos');
    }
    
    await prisma.$disconnect();
    process.exit(1);
  }
}

testConnection();