#!/usr/bin/env tsx

/**
 * Script para verificar la conexión con Immich
 * Prueba la configuración, conectividad y funcionalidades básicas
 */

import dotenv from 'dotenv';
import { immichService } from '../services/immich.service';
import { validateImmichConfig } from '../config/immich';

// Cargar variables de entorno
dotenv.config();

async function verifyImmichConnection() {
  console.log('🔍 Verificando conexión con Immich...\n');

  try {
    // 1. Verificar configuración
    console.log('1️⃣ Verificando configuración...');
    validateImmichConfig();
    console.log('✅ Configuración válida\n');

    // 2. Inicializar conexión
    console.log('2️⃣ Inicializando conexión...');
    await immichService.initialize();
    console.log('✅ Conexión inicializada\n');

    // 3. Realizar health check
    console.log('3️⃣ Realizando health check...');
    const healthStatus = await immichService.performHealthCheck();
    
    if (healthStatus.isHealthy) {
      console.log('✅ Health check exitoso');
      console.log(`📊 Versión del servidor: ${healthStatus.serverVersion}`);
      console.log(`🕐 Timestamp: ${healthStatus.timestamp.toISOString()}\n`);
    } else {
      console.log('❌ Health check falló');
      console.log(`🚨 Error: ${healthStatus.error}\n`);
      return;
    }

    // 4. Verificar conectividad
    console.log('4️⃣ Verificando conectividad...');
    const isConnected = await immichService.checkConnectivity();
    
    if (isConnected) {
      console.log('✅ Conectividad verificada\n');
    } else {
      console.log('❌ Problemas de conectividad\n');
      return;
    }

    // 5. Obtener información de conexión
    console.log('5️⃣ Información de conexión:');
    const connectionInfo = immichService.getConnectionInfo();
    console.log(`🌐 URL del servidor: ${connectionInfo.serverUrl}`);
    console.log(`🔗 Estado: ${connectionInfo.isConnected ? 'Conectado' : 'Desconectado'}`);
    console.log(`🕐 Último health check: ${connectionInfo.lastHealthCheck?.toISOString() || 'N/A'}`);
    
    if (connectionInfo.serverInfo) {
      console.log(`📋 Info del servidor:`, {
        version: connectionInfo.serverInfo.version,
        versionHash: connectionInfo.serverInfo.versionHash?.substring(0, 8) + '...',
      });
    }

    console.log('\n🎉 ¡Verificación completada exitosamente!');
    console.log('✅ Immich está configurado y funcionando correctamente');

  } catch (error) {
    console.error('\n❌ Error durante la verificación:');
    
    if (error instanceof Error) {
      console.error(`🚨 ${error.message}`);
      
      // Mostrar stack trace en modo desarrollo
      if (process.env['NODE_ENV'] === 'development') {
        console.error('\n📋 Stack trace:');
        console.error(error.stack);
      }
    } else {
      console.error('🚨 Error desconocido:', error);
    }

    console.log('\n💡 Sugerencias para resolver problemas:');
    console.log('1. Verifica que el servidor Immich esté ejecutándose');
    console.log('2. Confirma que IMMICH_SERVER_URL sea correcta');
    console.log('3. Verifica que IMMICH_API_KEY sea válida');
    console.log('4. Revisa la conectividad de red');
    console.log('5. Consulta los logs del servidor Immich');

    process.exit(1);
  } finally {
    // Limpiar conexión
    immichService.disconnect();
  }
}

// Ejecutar verificación si el script se ejecuta directamente
if (require.main === module) {
  verifyImmichConnection().catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
}

export { verifyImmichConnection };