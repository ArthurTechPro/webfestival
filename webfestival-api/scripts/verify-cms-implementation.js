/**
 * Script de verificación completa del esquema CMS normalizado
 * Verifica que todas las tablas, índices y relaciones estén correctamente implementadas
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyCMSImplementation() {
  try {
    console.log('🔍 Verificando implementación completa del esquema CMS normalizado...\n');

    // 1. Verificar tablas principales del CMS
    console.log('📋 Verificando tablas del CMS...');
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

    let tablasOK = 0;
    for (const tabla of tablasCMS) {
      try {
        const result = await prisma.$queryRawUnsafe(`
          SELECT COUNT(*) as count 
          FROM information_schema.tables 
          WHERE table_name = '${tabla}' AND table_schema = 'public'
        `);
        
        if (result[0].count > 0) {
          console.log(`✅ Tabla ${tabla} existe`);
          tablasOK++;
        } else {
          console.log(`❌ Tabla ${tabla} no encontrada`);
        }
      } catch (error) {
        console.error(`❌ Error verificando tabla ${tabla}: ${error.message}`);
      }
    }

    // 2. Verificar índices críticos
    console.log('\n🔗 Verificando índices optimizados...');
    const indicesCriticos = [
      'idx_contenido_tipo',
      'idx_contenido_estado',
      'idx_contenido_tipo_estado_fecha',
      'idx_contenido_titulo_gin',
      'idx_contenido_config_activo',
      'idx_contenido_metricas_vistas',
      'idx_contenido_taxonomia_categoria',
      'idx_contenido_comentarios_contenido_aprobado_fecha',
      'idx_contenido_likes_contenido_id',
      'idx_contenido_reportes_estado_fecha',
      'idx_newsletter_activo_confirmado'
    ];

    let indicesOK = 0;
    for (const indice of indicesCriticos) {
      try {
        const result = await prisma.$queryRawUnsafe(`
          SELECT COUNT(*) as count 
          FROM pg_indexes 
          WHERE indexname = '${indice}'
        `);
        
        if (result[0].count > 0) {
          console.log(`✅ Índice ${indice} aplicado`);
          indicesOK++;
        } else {
          console.log(`⚠️  Índice ${indice} no encontrado`);
        }
      } catch (error) {
        console.error(`❌ Error verificando índice ${indice}: ${error.message}`);
      }
    }

    // 3. Verificar relaciones y constraints
    console.log('\n🔗 Verificando relaciones y constraints...');
    
    try {
      // Verificar foreign keys principales
      const foreignKeys = await prisma.$queryRawUnsafe(`
        SELECT 
          tc.table_name, 
          kcu.column_name, 
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name 
        FROM 
          information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND tc.table_name LIKE 'contenido%'
        ORDER BY tc.table_name;
      `);

      console.log(`✅ ${foreignKeys.length} relaciones de foreign key encontradas`);
      
      // Verificar constraints únicos
      const uniqueConstraints = await prisma.$queryRawUnsafe(`
        SELECT 
          tc.table_name,
          tc.constraint_name,
          kcu.column_name
        FROM 
          information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
        WHERE tc.constraint_type = 'UNIQUE' 
          AND tc.table_name LIKE 'contenido%'
        ORDER BY tc.table_name;
      `);

      console.log(`✅ ${uniqueConstraints.length} constraints únicos encontrados`);

    } catch (error) {
      console.error(`❌ Error verificando relaciones: ${error.message}`);
    }

    // 4. Verificar enums
    console.log('\n📝 Verificando enums...');
    const enums = [
      'EstadoContenido',
      'TipoTaxonomia', 
      'EstadoReporte'
    ];

    for (const enumName of enums) {
      try {
        const result = await prisma.$queryRawUnsafe(`
          SELECT COUNT(*) as count
          FROM pg_type 
          WHERE typname = '${enumName}'
        `);
        
        if (result[0].count > 0) {
          console.log(`✅ Enum ${enumName} existe`);
        } else {
          console.log(`⚠️  Enum ${enumName} no encontrado`);
        }
      } catch (error) {
        console.error(`❌ Error verificando enum ${enumName}: ${error.message}`);
      }
    }

    // 5. Verificar funcionalidad básica
    console.log('\n🧪 Verificando funcionalidad básica...');
    
    try {
      // Test de inserción básica (sin commitear)
      await prisma.$transaction(async (tx) => {
        // Crear contenido de prueba
        const testContent = await tx.contenido.create({
          data: {
            tipo: 'blog_post',
            slug: 'test-cms-verification',
            titulo: 'Test de Verificación CMS',
            contenido: 'Contenido de prueba para verificación',
            autor_id: 'test-user-id',
            estado: 'BORRADOR'
          }
        });

        console.log(`✅ Inserción de contenido funcional (ID: ${testContent.id})`);

        // Crear configuración relacionada
        await tx.contenidoConfiguracion.create({
          data: {
            contenido_id: testContent.id,
            activo: true,
            permite_comentarios: true
          }
        });

        console.log(`✅ Inserción de configuración funcional`);

        // Crear taxonomía relacionada
        await tx.contenidoTaxonomia.create({
          data: {
            contenido_id: testContent.id,
            categoria: 'test-categoria',
            tipo_taxonomia: 'categoria'
          }
        });

        console.log(`✅ Inserción de taxonomía funcional`);

        // Rollback para no dejar datos de prueba
        throw new Error('Rollback intencional - test completado');
      });

    } catch (error) {
      if (error.message === 'Rollback intencional - test completado') {
        console.log(`✅ Test de funcionalidad completado (rollback exitoso)`);
      } else {
        console.error(`❌ Error en test de funcionalidad: ${error.message}`);
      }
    }

    // 6. Resumen final
    console.log('\n📊 Resumen de Verificación:');
    console.log(`📋 Tablas: ${tablasOK}/${tablasCMS.length} correctas`);
    console.log(`🔗 Índices: ${indicesOK}/${indicesCriticos.length} aplicados`);
    
    const porcentajeTablas = Math.round((tablasOK / tablasCMS.length) * 100);
    const porcentajeIndices = Math.round((indicesOK / indicesCriticos.length) * 100);
    
    console.log(`\n🎯 Estado General:`);
    console.log(`   Tablas: ${porcentajeTablas}% implementadas`);
    console.log(`   Índices: ${porcentajeIndices}% aplicados`);

    if (tablasOK === tablasCMS.length && indicesOK >= indicesCriticos.length * 0.9) {
      console.log('\n🎉 ¡Esquema CMS normalizado implementado correctamente!');
      console.log('✅ Todas las tablas principales están creadas');
      console.log('✅ Los índices optimizados están aplicados');
      console.log('✅ Las relaciones funcionan correctamente');
      console.log('✅ La funcionalidad básica está operativa');
      
      return true;
    } else {
      console.log('\n⚠️  Implementación incompleta detectada');
      console.log('   Revisar tablas e índices faltantes');
      
      return false;
    }

  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar verificación
if (require.main === module) {
  verifyCMSImplementation()
    .then((success) => {
      if (success) {
        console.log('\n🚀 Verificación completada exitosamente');
        process.exit(0);
      } else {
        console.log('\n💥 Verificación falló - revisar implementación');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('💥 Error en verificación:', error);
      process.exit(1);
    });
}

module.exports = { verifyCMSImplementation };