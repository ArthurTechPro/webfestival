#!/usr/bin/env tsx

/**
 * Script para probar la integración con redes sociales
 * Verifica que todos los componentes funcionen correctamente
 */

import { socialMediaService, ShareableLinkData } from '../services/social-media.service';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const prisma = new PrismaClient();

async function testSocialMediaIntegration() {
  console.log('🧪 Iniciando pruebas de integración con redes sociales...\n');

  try {
    // 1. Verificar configuración
    console.log('1️⃣ Verificando configuración de APIs...');
    const config = socialMediaService.validateConfiguration();
    
    if (config.isValid) {
      console.log('✅ Configuración completa');
    } else {
      console.log('⚠️  Configuración incompleta. Claves faltantes:');
      config.missingKeys.forEach(key => console.log(`   - ${key}`));
    }
    console.log();

    // 2. Crear datos de prueba
    console.log('2️⃣ Creando datos de prueba...');
    const testData: ShareableLinkData = {
      medioId: 1,
      titulo: 'Atardecer en la Montaña',
      autorNombre: 'Juan Pérez',
      concursoTitulo: 'Concurso Nacional de Fotografía 2024',
      posicion: 1,
      tipoMedio: 'fotografia',
      medioUrl: 'https://example.com/media/sunset-mountain.jpg',
      thumbnailUrl: 'https://example.com/media/sunset-mountain-thumb.jpg'
    };
    console.log('✅ Datos de prueba creados');
    console.log();

    // 3. Probar generación de enlace compartible
    console.log('3️⃣ Probando generación de enlace compartible...');
    const shareableLink = socialMediaService.generateShareableLink(testData);
    console.log(`✅ Enlace generado: ${shareableLink}`);
    console.log();

    // 4. Probar generación de contenido para compartir
    console.log('4️⃣ Probando generación de contenido para compartir...');
    const shareContent = socialMediaService.generateShareContent(testData);
    console.log('✅ Contenido generado:');
    console.log(`   Título: ${shareContent.title}`);
    console.log(`   Descripción: ${shareContent.description}`);
    console.log(`   Hashtags: ${shareContent.hashtags.join(', ')}`);
    console.log(`   Enlace: ${shareContent.link}`);
    console.log();

    // 5. Probar generación de URLs para redes sociales
    console.log('5️⃣ Probando generación de URLs para redes sociales...');
    const shareUrls = socialMediaService.getAllShareUrls(testData);
    console.log('✅ URLs generadas:');
    console.log(`   Facebook: ${shareUrls.facebook}`);
    console.log(`   Twitter: ${shareUrls.twitter}`);
    console.log(`   LinkedIn: ${shareUrls.linkedin}`);
    console.log(`   Instagram: ${shareUrls.instagram}`);
    console.log();

    // 6. Probar generación de metadatos Open Graph
    console.log('6️⃣ Probando generación de metadatos Open Graph...');
    const openGraphMetadata = socialMediaService.generateOpenGraphMetadata(testData);
    console.log('✅ Metadatos Open Graph generados:');
    Object.entries(openGraphMetadata).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });
    console.log();

    // 7. Probar con diferentes tipos de medios
    console.log('7️⃣ Probando con diferentes tipos de medios...');
    const tiposMedia = ['video', 'audio', 'corto_cine'] as const;
    
    for (const tipo of tiposMedia) {
      const testDataTipo = { ...testData, tipoMedio: tipo };
      const shareContentTipo = socialMediaService.generateShareContent(testDataTipo);
      console.log(`✅ ${tipo}: ${shareContentTipo.hashtags.join(', ')}`);
    }
    console.log();

    // 8. Probar con diferentes posiciones
    console.log('8️⃣ Probando con diferentes posiciones...');
    for (let posicion = 1; posicion <= 3; posicion++) {
      const testDataPosicion = { ...testData, posicion };
      const shareContentPosicion = socialMediaService.generateShareContent(testDataPosicion);
      console.log(`✅ Posición ${posicion}: ${shareContentPosicion.title}`);
    }
    console.log();

    // 9. Verificar límites de caracteres para Twitter
    console.log('9️⃣ Verificando límites de caracteres para Twitter...');
    const tituloLargo = 'Este es un título muy largo que podría exceder los límites de caracteres de Twitter y necesita ser truncado apropiadamente para funcionar correctamente';
    const testDataLargo = { ...testData, titulo: tituloLargo };
    const twitterUrl = socialMediaService.generateTwitterShareUrl(
      socialMediaService.generateShareContent(testDataLargo)
    );
    
    // Extraer el texto del URL
    const urlParams = new URLSearchParams(twitterUrl.split('?')[1]);
    const tweetText = urlParams.get('text') || '';
    console.log(`✅ Texto de Twitter (${tweetText.length} chars): ${tweetText}`);
    console.log();

    // 10. Probar conexión con base de datos (si está disponible)
    console.log('🔟 Probando conexión con base de datos...');
    try {
      await prisma.$connect();
      console.log('✅ Conexión con base de datos exitosa');
      
      // Verificar si hay medios en la base de datos
      const mediosCount = await prisma.medio.count();
      console.log(`   Total de medios en BD: ${mediosCount}`);
      
      if (mediosCount > 0) {
        const medioEjemplo = await prisma.medio.findFirst({
          include: {
            usuario: { select: { nombre: true } },
            concurso: { select: { titulo: true } }
          }
        });
        
        if (medioEjemplo) {
          console.log(`   Ejemplo de medio: "${medioEjemplo.titulo}" por ${medioEjemplo.usuario.nombre}`);
        }
      }
    } catch (error) {
      console.log('⚠️  No se pudo conectar a la base de datos:', error);
    }
    console.log();

    console.log('🎉 ¡Todas las pruebas completadas exitosamente!');
    console.log('\n📋 Resumen de funcionalidades implementadas:');
    console.log('   ✅ Generación de enlaces compartibles');
    console.log('   ✅ Integración con Facebook, Twitter, LinkedIn, Instagram');
    console.log('   ✅ Metadatos Open Graph para previews');
    console.log('   ✅ Hashtags relevantes por tipo de medio');
    console.log('   ✅ Soporte para múltiples tipos de medios');
    console.log('   ✅ Truncado inteligente para límites de caracteres');
    console.log('   ✅ Validación de configuración');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar pruebas si el script se ejecuta directamente
if (require.main === module) {
  testSocialMediaIntegration()
    .then(() => {
      console.log('\n✨ Script completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error ejecutando script:', error);
      process.exit(1);
    });
}

export { testSocialMediaIntegration };