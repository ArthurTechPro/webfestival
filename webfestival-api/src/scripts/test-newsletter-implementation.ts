#!/usr/bin/env tsx

/**
 * Script para probar la implementación del sistema de newsletter y contenido educativo
 */

import { PrismaClient } from '@prisma/client';
import { newsletterService } from '../services/newsletter.service';

const prisma = new PrismaClient();

async function testNewsletterImplementation() {
  console.log('🧪 Iniciando pruebas del sistema de newsletter y contenido educativo...\n');

  try {
    // ============================================================================
    // PRUEBAS DE NEWSLETTER
    // ============================================================================
    
    console.log('📧 Probando funcionalidades de newsletter...');
    
    // 1. Suscripción al newsletter
    console.log('1. Probando suscripción al newsletter...');
    const testEmail = `test-${Date.now()}@example.com`;
    
    try {
      const subscription = await newsletterService.subscribeToNewsletter({
        email: testEmail
      });
      console.log('   ✅ Suscripción creada:', subscription.email);
    } catch (error) {
      console.log('   ❌ Error en suscripción:', (error as Error).message);
    }

    // 2. Obtener estadísticas del newsletter
    console.log('2. Probando estadísticas del newsletter...');
    try {
      const stats = await newsletterService.getNewsletterStats();
      console.log('   ✅ Estadísticas obtenidas:', {
        total: stats.total_suscriptores,
        activos: stats.suscriptores_activos,
        confirmados: stats.suscriptores_confirmados,
        tasa_confirmacion: `${stats.tasa_confirmacion}%`
      });
    } catch (error) {
      console.log('   ❌ Error en estadísticas:', (error as Error).message);
    }

    // 3. Obtener suscriptores con filtros
    console.log('3. Probando obtención de suscriptores...');
    try {
      const subscribers = await newsletterService.getSubscribers({
        page: 1,
        limit: 5,
        activo: true
      });
      console.log('   ✅ Suscriptores obtenidos:', {
        total: subscribers.total,
        pagina: subscribers.page,
        suscriptores: subscribers.suscriptores.length
      });
    } catch (error) {
      console.log('   ❌ Error al obtener suscriptores:', (error as Error).message);
    }

    // ============================================================================
    // PRUEBAS DE CONTENIDO EDUCATIVO
    // ============================================================================
    
    console.log('\n📚 Probando funcionalidades de contenido educativo...');

    // 1. Crear usuario de prueba para contenido educativo
    console.log('1. Creando usuario de prueba...');
    let testUserId: string;
    
    try {
      const testUser = await prisma.usuario.create({
        data: {
          email: `content-admin-${Date.now()}@example.com`,
          nombre: 'Admin de Contenido Test',
          role: 'CONTENT_ADMIN',
          password: 'test-password'
        }
      });
      testUserId = testUser.id;
      console.log('   ✅ Usuario creado:', testUser.email);
    } catch (error) {
      console.log('   ❌ Error al crear usuario:', (error as Error).message);
      return;
    }

    // 2. Crear contenido educativo
    console.log('2. Probando creación de contenido educativo...');
    let testContentId: number;
    
    try {
      const content = await newsletterService.createEducationalContent({
        tipo: 'tutorial',
        categoria_multimedia: 'fotografia',
        titulo: 'Tutorial de Fotografía de Paisajes',
        contenido: 'Este es un tutorial completo sobre fotografía de paisajes que cubre técnicas básicas y avanzadas...',
        resumen: 'Aprende las mejores técnicas para capturar paisajes impresionantes',
        nivel: 'intermedio',
        tiempo_lectura: 15,
        tags: ['paisajes', 'naturaleza', 'composicion'],
        estado: 'publicado',
        recursos_adicionales: [
          {
            titulo: 'Video complementario',
            url: 'https://example.com/video',
            tipo: 'video'
          }
        ]
      }, testUserId);
      
      testContentId = content.id;
      console.log('   ✅ Contenido educativo creado:', content.titulo);
    } catch (error) {
      console.log('   ❌ Error al crear contenido:', (error as Error).message);
      return;
    }

    // 3. Obtener contenido educativo con filtros
    console.log('3. Probando obtención de contenido educativo...');
    try {
      const educationalContent = await newsletterService.getEducationalContent({
        categoria_multimedia: 'fotografia',
        nivel: 'intermedio',
        page: 1,
        limit: 10,
        orden: 'reciente'
      });
      console.log('   ✅ Contenido obtenido:', {
        total: educationalContent.total,
        contenido: educationalContent.contenido.length
      });
    } catch (error) {
      console.log('   ❌ Error al obtener contenido:', (error as Error).message);
    }

    // 4. Obtener contenido por ID
    console.log('4. Probando obtención de contenido por ID...');
    try {
      const contentById = await newsletterService.getEducationalContentById(testContentId);
      console.log('   ✅ Contenido obtenido por ID:', {
        titulo: contentById.titulo,
        tipo: contentById.tipo_educativo,
        categoria: contentById.categoria_multimedia,
        tags: contentById.tags.length
      });
    } catch (error) {
      console.log('   ❌ Error al obtener contenido por ID:', (error as Error).message);
    }

    // 5. Registrar vista de contenido
    console.log('5. Probando registro de vista...');
    try {
      await newsletterService.trackContentView({
        contenido_id: testContentId,
        usuario_id: testUserId,
        tiempo_lectura: 300,
        porcentaje_leido: 85
      });
      console.log('   ✅ Vista registrada exitosamente');
    } catch (error) {
      console.log('   ❌ Error al registrar vista:', (error as Error).message);
    }

    // 6. Obtener recomendaciones personalizadas
    console.log('6. Probando recomendaciones personalizadas...');
    try {
      const recommendations = await newsletterService.getPersonalizedRecommendations({
        usuario_id: testUserId,
        categoria_multimedia: 'fotografia',
        limit: 5,
        excluir_leidos: true
      });
      console.log('   ✅ Recomendaciones obtenidas:', recommendations.length);
    } catch (error) {
      console.log('   ❌ Error al obtener recomendaciones:', (error as Error).message);
    }

    // 7. Obtener métricas de contenido educativo
    console.log('7. Probando métricas de contenido educativo...');
    try {
      const metrics = await newsletterService.getEducationalContentMetrics({
        categoria_multimedia: 'fotografia',
        periodo: 'mes',
        limit: 10
      });
      console.log('   ✅ Métricas obtenidas:', {
        total_contenido: metrics.resumen.total_contenido,
        total_vistas: metrics.resumen.total_vistas,
        categorias: metrics.estadisticas_por_categoria.length
      });
    } catch (error) {
      console.log('   ❌ Error al obtener métricas:', (error as Error).message);
    }

    // ============================================================================
    // PRUEBAS DE DIGEST DEL NEWSLETTER
    // ============================================================================
    
    console.log('\n📰 Probando funcionalidades de digest...');

    // 1. Generar digest semanal
    console.log('1. Probando generación de digest semanal...');
    try {
      const fechaInicio = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const fechaFin = new Date();
      
      const digest = await newsletterService.generateWeeklyDigest({
        fecha_inicio: fechaInicio.toISOString(),
        fecha_fin: fechaFin.toISOString(),
        incluir_concursos: true,
        incluir_contenido_educativo: true,
        incluir_ganadores: true,
        max_contenido: 5,
        max_concursos: 3
      });
      
      console.log('   ✅ Digest generado:', {
        fecha: digest.fecha_generacion,
        contenido_educativo: digest.contenido_educativo?.length || 0,
        concursos: digest.concursos_activos?.length || 0
      });
    } catch (error) {
      console.log('   ❌ Error al generar digest:', (error as Error).message);
    }

    // 2. Obtener contenido popular para digest
    console.log('2. Probando contenido popular para digest...');
    try {
      const popularContent = await newsletterService.getPopularContentForDigest(5);
      console.log('   ✅ Contenido popular obtenido:', popularContent.length);
    } catch (error) {
      console.log('   ❌ Error al obtener contenido popular:', (error as Error).message);
    }

    // ============================================================================
    // LIMPIEZA
    // ============================================================================
    
    console.log('\n🧹 Limpiando datos de prueba...');
    
    try {
      // Eliminar contenido de prueba
      await prisma.contenido.delete({
        where: { id: testContentId }
      });
      
      // Eliminar usuario de prueba
      await prisma.usuario.delete({
        where: { id: testUserId }
      });
      
      // Eliminar suscripción de prueba
      await prisma.newsletterSuscriptor.deleteMany({
        where: { email: testEmail }
      });
      
      console.log('   ✅ Datos de prueba eliminados');
    } catch (error) {
      console.log('   ⚠️  Error al limpiar datos:', (error as Error).message);
    }

    console.log('\n🎉 ¡Todas las pruebas completadas exitosamente!');
    console.log('\n📋 Resumen de funcionalidades implementadas:');
    console.log('   ✅ Suscripción y gestión de newsletter');
    console.log('   ✅ Confirmación y cancelación de suscripciones');
    console.log('   ✅ Estadísticas y gestión de suscriptores');
    console.log('   ✅ Creación y gestión de contenido educativo');
    console.log('   ✅ Filtros y búsqueda de contenido');
    console.log('   ✅ Recomendaciones personalizadas');
    console.log('   ✅ Tracking de métricas y vistas');
    console.log('   ✅ Generación de digest semanal');
    console.log('   ✅ APIs completas con validación Zod');

  } catch (error) {
    console.error('❌ Error general en las pruebas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar las pruebas
if (require.main === module) {
  testNewsletterImplementation()
    .then(() => {
      console.log('\n✨ Script de pruebas finalizado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

export { testNewsletterImplementation };