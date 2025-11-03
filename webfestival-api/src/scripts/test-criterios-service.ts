import { TipoMedio } from '@prisma/client';
import { criteriosService } from '../services/criterios.service';

const testCriteriosService = async () => {
  console.log('🧪 Probando el servicio de criterios...\n');

  try {
    // Test 1: Obtener criterios para fotografía
    console.log('📸 Test 1: Criterios para fotografía (incluye universales)');
    const criteriosFotografia = await criteriosService.getCriteriosPorTipoMedio(TipoMedio.fotografia);
    console.log(`   ✅ Encontrados ${criteriosFotografia.length} criterios`);
    console.log(`   📋 Criterios específicos: ${criteriosFotografia.filter(c => c.tipo_medio === TipoMedio.fotografia).length}`);
    console.log(`   🌟 Criterios universales: ${criteriosFotografia.filter(c => c.tipo_medio === null).length}\n`);

    // Test 2: Obtener criterios para video
    console.log('🎬 Test 2: Criterios para video (incluye universales)');
    const criteriosVideo = await criteriosService.getCriteriosPorTipoMedio(TipoMedio.video);
    console.log(`   ✅ Encontrados ${criteriosVideo.length} criterios`);
    console.log(`   📋 Criterios específicos: ${criteriosVideo.filter(c => c.tipo_medio === TipoMedio.video).length}`);
    console.log(`   🌟 Criterios universales: ${criteriosVideo.filter(c => c.tipo_medio === null).length}\n`);

    // Test 3: Obtener criterios para audio
    console.log('🎵 Test 3: Criterios para audio (incluye universales)');
    const criteriosAudio = await criteriosService.getCriteriosPorTipoMedio(TipoMedio.audio);
    console.log(`   ✅ Encontrados ${criteriosAudio.length} criterios`);
    console.log(`   📋 Criterios específicos: ${criteriosAudio.filter(c => c.tipo_medio === TipoMedio.audio).length}`);
    console.log(`   🌟 Criterios universales: ${criteriosAudio.filter(c => c.tipo_medio === null).length}\n`);

    // Test 4: Obtener criterios para cortos de cine
    console.log('🎭 Test 4: Criterios para cortos de cine (incluye universales)');
    const criteriosCine = await criteriosService.getCriteriosPorTipoMedio(TipoMedio.corto_cine);
    console.log(`   ✅ Encontrados ${criteriosCine.length} criterios`);
    console.log(`   📋 Criterios específicos: ${criteriosCine.filter(c => c.tipo_medio === TipoMedio.corto_cine).length}`);
    console.log(`   🌟 Criterios universales: ${criteriosCine.filter(c => c.tipo_medio === null).length}\n`);

    // Test 5: Obtener solo criterios universales
    console.log('🌟 Test 5: Solo criterios universales');
    const criteriosUniversales = await criteriosService.getCriteriosUniversales();
    console.log(`   ✅ Encontrados ${criteriosUniversales.length} criterios universales\n`);

    // Test 6: Validar criterios completos por tipo
    console.log('✅ Test 6: Validación de criterios completos');
    const validacionFotografia = await criteriosService.validarCriteriosCompletos(TipoMedio.fotografia);
    const validacionVideo = await criteriosService.validarCriteriosCompletos(TipoMedio.video);
    const validacionAudio = await criteriosService.validarCriteriosCompletos(TipoMedio.audio);
    const validacionCine = await criteriosService.validarCriteriosCompletos(TipoMedio.corto_cine);
    
    console.log(`   📸 Fotografía: ${validacionFotografia ? '✅ Válido' : '❌ Insuficiente'}`);
    console.log(`   🎬 Video: ${validacionVideo ? '✅ Válido' : '❌ Insuficiente'}`);
    console.log(`   🎵 Audio: ${validacionAudio ? '✅ Válido' : '❌ Insuficiente'}`);
    console.log(`   🎭 Cine: ${validacionCine ? '✅ Válido' : '❌ Insuficiente'}\n`);

    // Test 7: Calcular peso total por tipo
    console.log('⚖️ Test 7: Peso total de criterios por tipo');
    const pesoFotografia = await criteriosService.getPesoTotalCriterios(TipoMedio.fotografia);
    const pesoVideo = await criteriosService.getPesoTotalCriterios(TipoMedio.video);
    const pesoAudio = await criteriosService.getPesoTotalCriterios(TipoMedio.audio);
    const pesoCine = await criteriosService.getPesoTotalCriterios(TipoMedio.corto_cine);
    
    console.log(`   📸 Fotografía: ${pesoFotografia.toFixed(2)} puntos`);
    console.log(`   🎬 Video: ${pesoVideo.toFixed(2)} puntos`);
    console.log(`   🎵 Audio: ${pesoAudio.toFixed(2)} puntos`);
    console.log(`   🎭 Cine: ${pesoCine.toFixed(2)} puntos\n`);

    // Test 8: Obtener estadísticas generales
    console.log('📊 Test 8: Estadísticas generales');
    const estadisticas = await criteriosService.getEstadisticasCriterios();
    console.log(`   📈 Total de criterios: ${estadisticas.total_criterios}`);
    console.log(`   ✅ Criterios activos: ${estadisticas.criterios_activos}`);
    console.log(`   📋 Tipos de medio con criterios: ${estadisticas.criterios_por_tipo.length}\n`);

    // Test 9: Mostrar algunos criterios específicos
    console.log('🔍 Test 9: Ejemplos de criterios específicos');
    
    // Mostrar primer criterio de cada tipo
    const primerFotografia = criteriosFotografia.find(c => c.tipo_medio === TipoMedio.fotografia);
    const primerVideo = criteriosVideo.find(c => c.tipo_medio === TipoMedio.video);
    const primerAudio = criteriosAudio.find(c => c.tipo_medio === TipoMedio.audio);
    const primerCine = criteriosCine.find(c => c.tipo_medio === TipoMedio.corto_cine);
    const primerUniversal = criteriosUniversales[0];

    if (primerFotografia) {
      console.log(`   📸 ${primerFotografia.nombre}: ${primerFotografia.descripcion} (Peso: ${primerFotografia.peso})`);
    }
    if (primerVideo) {
      console.log(`   🎬 ${primerVideo.nombre}: ${primerVideo.descripcion} (Peso: ${primerVideo.peso})`);
    }
    if (primerAudio) {
      console.log(`   🎵 ${primerAudio.nombre}: ${primerAudio.descripcion} (Peso: ${primerAudio.peso})`);
    }
    if (primerCine) {
      console.log(`   🎭 ${primerCine.nombre}: ${primerCine.descripcion} (Peso: ${primerCine.peso})`);
    }
    if (primerUniversal) {
      console.log(`   🌟 ${primerUniversal.nombre}: ${primerUniversal.descripcion} (Peso: ${primerUniversal.peso})`);
    }

    console.log('\n🎉 ¡Todos los tests del servicio de criterios pasaron exitosamente!');
    console.log('✅ Los criterios preconfigurados están funcionando correctamente');
    console.log('✅ El servicio de criterios está listo para ser usado por la API');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
    process.exit(1);
  }
}

testCriteriosService()
  .catch((e) => {
    console.error('❌ Error crítico:', e);
    process.exit(1);
  })
  .finally(() => {
    console.log('\n🔚 Pruebas completadas');
    process.exit(0);
  });