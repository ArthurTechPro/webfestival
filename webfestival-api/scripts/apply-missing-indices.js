/**
 * Script para aplicar índices específicos que faltan en el sistema CMS
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function applyMissingIndices() {
  try {
    console.log('🔧 Aplicando índices faltantes del sistema CMS...');

    const indicesFaltantes = [
      // Índice para tipo de contenido
      `CREATE INDEX IF NOT EXISTS idx_contenido_tipo ON contenido(tipo)`,
      
      // Índice compuesto para consultas frecuentes
      `CREATE INDEX IF NOT EXISTS idx_contenido_tipo_estado_fecha ON contenido(tipo, estado, fecha_publicacion DESC)`,
      
      // Índice para búsqueda de texto en título
      `CREATE INDEX IF NOT EXISTS idx_contenido_titulo_gin ON contenido USING gin(to_tsvector('spanish', titulo))`,
      
      // Índice para configuración activa
      `CREATE INDEX IF NOT EXISTS idx_contenido_config_activo ON contenido_configuracion(activo)`,
      
      // Índice para métricas de vistas
      `CREATE INDEX IF NOT EXISTS idx_contenido_metricas_vistas ON contenido_metricas(vistas DESC)`,
      
      // Índice para taxonomía por categoría
      `CREATE INDEX IF NOT EXISTS idx_contenido_taxonomia_categoria ON contenido_taxonomia(categoria)`,
      
      // Índice para comentarios por contenido
      `CREATE INDEX IF NOT EXISTS idx_contenido_comentarios_contenido_id ON contenido_comentarios(contenido_id)`,
      
      // Índice compuesto para comentarios aprobados
      `CREATE INDEX IF NOT EXISTS idx_contenido_comentarios_contenido_aprobado_fecha ON contenido_comentarios(contenido_id, aprobado, fecha_comentario DESC)`,
      
      // Índice para likes por contenido
      `CREATE INDEX IF NOT EXISTS idx_contenido_likes_contenido_id ON contenido_likes(contenido_id)`,
      
      // Índice para reportes por elemento
      `CREATE INDEX IF NOT EXISTS idx_contenido_reportes_elemento_id ON contenido_reportes(elemento_id)`,
      
      // Índice compuesto para reportes por estado
      `CREATE INDEX IF NOT EXISTS idx_contenido_reportes_estado_fecha ON contenido_reportes(estado, fecha_reporte DESC)`,
      
      // Índice para newsletter activo
      `CREATE INDEX IF NOT EXISTS idx_newsletter_activo ON newsletter_suscriptores(activo)`,
      
      // Índice compuesto para suscriptores activos y confirmados
      `CREATE INDEX IF NOT EXISTS idx_newsletter_activo_confirmado ON newsletter_suscriptores(activo, confirmado)`,
      
      // Índices parciales para optimización
      `CREATE INDEX IF NOT EXISTS idx_contenido_destacado_activo ON contenido_configuracion(destacado, activo) WHERE destacado = true AND activo = true`,
      
      `CREATE INDEX IF NOT EXISTS idx_contenido_publicado ON contenido(fecha_publicacion DESC) WHERE estado = 'PUBLICADO'`,
      
      `CREATE INDEX IF NOT EXISTS idx_comentarios_validos ON contenido_comentarios(contenido_id, fecha_comentario DESC) WHERE aprobado = true AND reportado = false`
    ];

    console.log(`📝 Aplicando ${indicesFaltantes.length} índices faltantes...`);

    for (let i = 0; i < indicesFaltantes.length; i++) {
      const indice = indicesFaltantes[i];
      try {
        await prisma.$executeRawUnsafe(indice);
        
        // Extraer nombre del índice
        const match = indice.match(/CREATE INDEX.*?(\w+)\s+ON/i);
        const nombre = match ? match[1] : `índice ${i + 1}`;
        
        console.log(`✅ ${nombre} aplicado correctamente`);
      } catch (error) {
        if (error.message.includes('already exists') || error.message.includes('ya existe')) {
          const match = indice.match(/CREATE INDEX.*?(\w+)\s+ON/i);
          const nombre = match ? match[1] : `índice ${i + 1}`;
          console.log(`ℹ️  ${nombre} ya existe`);
        } else {
          console.error(`❌ Error aplicando índice ${i + 1}: ${error.message}`);
        }
      }
    }

    console.log('\n🎉 Índices faltantes aplicados correctamente');

    // Verificar índices aplicados
    console.log('\n🔍 Verificando índices críticos...');
    
    const indicesVerificar = [
      'idx_contenido_tipo',
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
          console.log(`✅ ${indice} verificado`);
        } else {
          console.log(`⚠️  ${indice} no encontrado`);
        }
      } catch (error) {
        console.error(`❌ Error verificando ${indice}: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Error aplicando índices faltantes:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
if (require.main === module) {
  applyMissingIndices()
    .then(() => {
      console.log('\n🎯 Índices faltantes aplicados exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error:', error);
      process.exit(1);
    });
}

module.exports = { applyMissingIndices };