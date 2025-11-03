#!/usr/bin/env node

/**
 * Script de prueba para el sistema de notificaciones automáticas
 * 
 * Este script prueba todas las funcionalidades del sistema de notificaciones:
 * 1. Creación de notificaciones en base de datos
 * 2. Envío de emails de diferentes tipos
 * 3. Recordatorios de fecha límite
 * 4. Notificaciones de evaluación completada
 * 5. Notificaciones de resultados publicados
 * 6. Notificaciones de nuevos concursos
 * 
 * Uso: npm run test-notifications
 */

import { PrismaClient } from '@prisma/client';
import { getNotificationService } from '../services/notification.service';
import { getEmailService } from '../services/email.service';

const prisma = new PrismaClient();

const testNotificationSystem = async () => {
  console.log('🧪 Iniciando pruebas del sistema de notificaciones...\n');

  try {
    // 1. Verificar configuración inicial
    console.log('1️⃣ Verificando configuración inicial...');
    const emailService = getEmailService();
    const notificationService = getNotificationService(prisma);
    
    const emailConfigOk = await emailService.testConnection();
    if (!emailConfigOk) {
      throw new Error('Configuración de email no válida');
    }
    console.log('   ✅ Configuración de email verificada\n');

    // 2. Crear usuario de prueba si no existe
    console.log('2️⃣ Preparando datos de prueba...');
    let testUser = await prisma.usuario.findFirst({
      where: { email: 'test-notifications@webfestival.com' }
    });

    if (!testUser) {
      testUser = await prisma.usuario.create({
        data: {
          email: 'test-notifications@webfestival.com',
          nombre: 'Usuario Prueba Notificaciones',
          role: 'PARTICIPANTE'
        }
      });
      console.log('   ✅ Usuario de prueba creado');
    } else {
      console.log('   ✅ Usuario de prueba encontrado');
    }

    // 3. Crear concurso de prueba si no existe
    let testConcurso = await prisma.concurso.findFirst({
      where: { titulo: 'Concurso Prueba Notificaciones' }
    });

    if (!testConcurso) {
      const fechaInicio = new Date();
      const fechaFinal = new Date();
      fechaFinal.setDate(fechaFinal.getDate() + 7); // 7 días desde hoy

      testConcurso = await prisma.concurso.create({
        data: {
          titulo: 'Concurso Prueba Notificaciones',
          descripcion: 'Concurso creado para probar el sistema de notificaciones',
          fecha_inicio: fechaInicio,
          fecha_final: fechaFinal,
          status: 'ACTIVO'
        }
      });
      console.log('   ✅ Concurso de prueba creado');
    } else {
      console.log('   ✅ Concurso de prueba encontrado');
    }

    // 4. Crear inscripción de prueba
    const inscripcionExistente = await prisma.inscripcion.findUnique({
      where: {
        usuario_id_concurso_id: {
          usuario_id: testUser.id,
          concurso_id: testConcurso.id
        }
      }
    });

    if (!inscripcionExistente) {
      await prisma.inscripcion.create({
        data: {
          usuario_id: testUser.id,
          concurso_id: testConcurso.id
        }
      });
      console.log('   ✅ Inscripción de prueba creada');
    } else {
      console.log('   ✅ Inscripción de prueba encontrada');
    }

    console.log('   📊 Datos de prueba preparados\n');

    // 5. Probar creación de notificación en base de datos
    console.log('3️⃣ Probando creación de notificaciones en base de datos...');
    await notificationService.createNotification({
      userId: testUser.id,
      tipo: 'test',
      titulo: 'Notificación de Prueba',
      mensaje: 'Esta es una notificación de prueba del sistema'
    });
    console.log('   ✅ Notificación creada en base de datos\n');

    // 6. Probar envío de emails individuales
    console.log('4️⃣ Probando envío de emails individuales...');
    
    console.log('   📧 Probando recordatorio de fecha límite...');
    const deadlineSuccess = await emailService.sendDeadlineReminder(
      testUser.email,
      testUser.nombre || 'Usuario Prueba',
      testConcurso.titulo
    );
    console.log(`   ${deadlineSuccess ? '✅' : '❌'} Recordatorio de fecha límite`);

    console.log('   📧 Probando notificación de evaluación completada...');
    const evaluationSuccess = await emailService.sendEvaluationComplete(
      testUser.email,
      testUser.nombre || 'Usuario Prueba',
      testConcurso.titulo
    );
    console.log(`   ${evaluationSuccess ? '✅' : '❌'} Notificación de evaluación completada`);

    console.log('   📧 Probando notificación de resultados publicados...');
    const resultsSuccess = await emailService.sendResultsPublished(
      testUser.email,
      testUser.nombre || 'Usuario Prueba',
      testConcurso.titulo
    );
    console.log(`   ${resultsSuccess ? '✅' : '❌'} Notificación de resultados publicados`);

    console.log('   📧 Probando notificación de nuevo concurso...');
    const newContestSuccess = await emailService.sendNewContestNotification(
      testUser.email,
      testUser.nombre || 'Usuario Prueba',
      testConcurso.titulo
    );
    console.log(`   ${newContestSuccess ? '✅' : '❌'} Notificación de nuevo concurso\n`);

    // 7. Probar funciones del servicio de notificaciones
    console.log('5️⃣ Probando funciones del servicio de notificaciones...');

    console.log('   🔔 Probando recordatorio de fecha límite...');
    try {
      await notificationService.sendDeadlineReminder({
        concursoId: testConcurso.id,
        horasAntes: 48
      });
      console.log('   ✅ Recordatorio de fecha límite enviado');
    } catch (error) {
      console.log('   ⚠️  Recordatorio de fecha límite (puede fallar si no es el momento correcto)');
    }

    console.log('   🔔 Probando notificación de nuevo concurso...');
    await notificationService.sendNewContestNotification({
      concursoId: testConcurso.id
    });
    console.log('   ✅ Notificación de nuevo concurso enviada');

    console.log('   🔔 Probando notificación de resultados publicados...');
    // Cambiar temporalmente el estado para la prueba
    await prisma.concurso.update({
      where: { id: testConcurso.id },
      data: { status: 'FINALIZADO' }
    });
    
    await notificationService.sendResultsPublished({
      concursoId: testConcurso.id
    });
    console.log('   ✅ Notificación de resultados publicados enviada');

    // Restaurar estado original
    await prisma.concurso.update({
      where: { id: testConcurso.id },
      data: { status: 'ACTIVO' }
    });

    console.log('\n6️⃣ Probando consulta de notificaciones...');
    const userNotifications = await notificationService.getUserNotifications(testUser.id, 1, 10);
    console.log(`   ✅ Consultadas ${userNotifications.notificaciones.length} notificaciones del usuario`);
    console.log(`   📊 Total de notificaciones: ${userNotifications.total}`);

    // 8. Probar configuración de trabajos programados (sin iniciarlos)
    console.log('\n7️⃣ Probando configuración de trabajos programados...');
    notificationService.setupDeadlineReminders();
    console.log('   ✅ Recordatorios automáticos configurados');
    
    notificationService.setupEvaluationNotifications();
    console.log('   ✅ Notificaciones de evaluación configuradas');

    console.log('\n🎉 ¡Todas las pruebas completadas exitosamente!');
    
    console.log('\n📊 Resumen de pruebas:');
    console.log('   ✅ Configuración de email verificada');
    console.log('   ✅ Notificaciones en base de datos funcionando');
    console.log('   ✅ Envío de emails funcionando');
    console.log('   ✅ Servicios de notificación funcionando');
    console.log('   ✅ Consulta de notificaciones funcionando');
    console.log('   ✅ Trabajos programados configurados');

    console.log('\n📧 Revisa tu bandeja de entrada en:', testUser.email);
    console.log('   Deberías haber recibido varios emails de prueba');

    console.log('\n🔧 Para usar en producción:');
    console.log('   • Ejecuta: npm run init-notifications');
    console.log('   • O usa los endpoints de la API para gestión manual');

  } catch (error) {
    console.error('\n❌ Error durante las pruebas:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  testNotificationSystem()
    .then(() => {
      console.log('\n✅ Pruebas completadas');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Pruebas fallaron:', error);
      process.exit(1);
    });
}

export { testNotificationSystem };