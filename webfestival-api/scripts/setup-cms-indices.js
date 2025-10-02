/**
 * Script para configurar índices optimizados del sistema CMS
 * Este script aplica los índices adicionales para mejorar el rendimiento
 * de las consultas del sistema CMS normalizado
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function setupCMSIndices() {
  try {
    console.log('🚀 Configurando índices optimizados para el sistema CMS...');

    // Leer el archivo SQL con los índices
    const sqlPath = path.join(__dirname, '../prisma/indices-optimizados.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Dividir el contenido en comandos individuales
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--') && !cmd.startsWith('/*'));

    console.log(`📝 Aplicando ${commands.length} índices optimizados...`);

    // Ejecutar cada comando de índice
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      try {
        await prisma.$executeRawUnsafe(command + ';');
        
        // Extraer el nombre del índice del comando
        const indexMatch = command.match(/CREATE INDEX.*?(\w+)\s+ON/i);
        const indexName = indexMatch ? indexMatch[1] : `comando ${i + 1}`;
        
        console.log(`✅ Índice ${indexName} aplicado correctamente`);
      } catch (error) {
        // Ignorar errores de índices que ya existen
        if (error.message.includes('already exists') || error.message.includes('ya existe')) {
          const indexMatch = command.match(/CREATE INDEX.*?(\w+)\s+ON/i);
          const indexName = indexMatch ? indexMatch[1] : `comando ${i + 1}`;
          console.log(`ℹ️  Índice ${indexName} ya existe, continuando...`);
        } else {
          console.error(`❌ Error aplicando comando ${i + 1}: ${error.message}`);
          console.error(`   Comando: ${command.substring(0, 100)}...`);
        }
      }
    }

    console.log('🎉 Índices optimizados configurados correctamente');

    // Verificar que las tablas del CMS existen
    console.log('\n🔍 Verificando estructura del CMS...');
    
    const tablasCMS = [
      'contenido',
      'contenido_configuracion', 
      'contenido_seo',
      'contenido_metricas',
      'contenido_taxonomia',
      'contenido_comentarios',
      'contenido_likes',
      'contenido_reportes',
      'newsletter_suscriptores'
    ];

    for (const tabla of tablasCMS) {
      try {
        const result = await prisma.$queryRawUnsafe(`
          SELECT COUNT(*) as count 
          FROM information_schema.tables 
          WHERE table_name = '${tabla}' AND table_schema = 'public'
        `);
        
        if (result[0].count > 0) {
          console.log(`✅ Tabla ${tabla} existe`);
        } else {
          console.log(`❌ Tabla ${tabla} no encontrada`);
        }
      } catch (error) {
        console.error(`❌ Error verificando tabla ${tabla}: ${error.message}`);
      }
    }

    console.log('\n📊 Verificando índices aplicados...');
    
    // Verificar algunos índices clave
    const indicesVerificar = [
      'idx_contenido_tipo',
      'idx_contenido_estado', 
      'idx_contenido_tipo_estado_fecha',
      'idx_contenido_comentarios_contenido_aprobado_fecha',
      'idx_newsletter_activo_confirmado'
    ];

    for (const indice of indicesVerificar) {
      try {
        const result = await prisma.$queryRawUnsafe(`
          SELECT COUNT(*) as count 
          FROM pg_indexes 
          WHERE indexname = '${indice}'
        `);
        
        if (result[0].count > 0) {
          console.log(`✅ Índice ${indice} aplicado`);
        } else {
          console.log(`⚠️  Índice ${indice} no encontrado`);
        }
      } catch (error) {
        console.error(`❌ Error verificando índice ${indice}: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Error configurando índices del CMS:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script si se llama directamente
if (require.main === module) {
  setupCMSIndices()
    .then(() => {
      console.log('\n🎯 Configuración del CMS completada exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en la configuración:', error);
      process.exit(1);
    });
}

module.exports = { setupCMSIndices };