import { PrismaClient, TipoMedio } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyCriterios() {
  console.log('🔍 Verificando criterios preconfigurados...\n');

  // Obtener todos los criterios agrupados por tipo de medio
  const criteriosFotografia = await prisma.criterio.findMany({
    where: { tipo_medio: TipoMedio.fotografia },
    orderBy: { orden: 'asc' }
  });

  const criteriosVideo = await prisma.criterio.findMany({
    where: { tipo_medio: TipoMedio.video },
    orderBy: { orden: 'asc' }
  });

  const criteriosAudio = await prisma.criterio.findMany({
    where: { tipo_medio: TipoMedio.audio },
    orderBy: { orden: 'asc' }
  });

  const criteriosCine = await prisma.criterio.findMany({
    where: { tipo_medio: TipoMedio.corto_cine },
    orderBy: { orden: 'asc' }
  });

  const criteriosUniversales = await prisma.criterio.findMany({
    where: { tipo_medio: null },
    orderBy: { orden: 'asc' }
  });

  // Mostrar resumen
  console.log('📸 CRITERIOS PARA FOTOGRAFÍA:');
  criteriosFotografia.forEach((criterio, index) => {
    console.log(`  ${index + 1}. ${criterio.nombre} (Peso: ${criterio.peso})`);
    console.log(`     ${criterio.descripcion}\n`);
  });

  console.log('🎬 CRITERIOS PARA VIDEO:');
  criteriosVideo.forEach((criterio, index) => {
    console.log(`  ${index + 1}. ${criterio.nombre} (Peso: ${criterio.peso})`);
    console.log(`     ${criterio.descripcion}\n`);
  });

  console.log('🎵 CRITERIOS PARA AUDIO:');
  criteriosAudio.forEach((criterio, index) => {
    console.log(`  ${index + 1}. ${criterio.nombre} (Peso: ${criterio.peso})`);
    console.log(`     ${criterio.descripcion}\n`);
  });

  console.log('🎭 CRITERIOS PARA CORTOS DE CINE:');
  criteriosCine.forEach((criterio, index) => {
    console.log(`  ${index + 1}. ${criterio.nombre} (Peso: ${criterio.peso})`);
    console.log(`     ${criterio.descripcion}\n`);
  });

  console.log('🌟 CRITERIOS UNIVERSALES:');
  criteriosUniversales.forEach((criterio, index) => {
    console.log(`  ${index + 1}. ${criterio.nombre} (Peso: ${criterio.peso})`);
    console.log(`     ${criterio.descripcion}\n`);
  });

  // Estadísticas finales
  const totalCriterios = criteriosFotografia.length + criteriosVideo.length + 
                        criteriosAudio.length + criteriosCine.length + criteriosUniversales.length;

  console.log('📊 RESUMEN ESTADÍSTICO:');
  console.log(`  • Criterios para Fotografía: ${criteriosFotografia.length}`);
  console.log(`  • Criterios para Video: ${criteriosVideo.length}`);
  console.log(`  • Criterios para Audio: ${criteriosAudio.length}`);
  console.log(`  • Criterios para Cortos de Cine: ${criteriosCine.length}`);
  console.log(`  • Criterios Universales: ${criteriosUniversales.length}`);
  console.log(`  • TOTAL DE CRITERIOS: ${totalCriterios}`);

  console.log('\n✅ Verificación completada exitosamente!');
}

verifyCriterios()
  .catch((e) => {
    console.error('❌ Error durante la verificación:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });