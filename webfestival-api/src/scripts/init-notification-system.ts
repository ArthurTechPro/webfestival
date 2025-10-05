#!/usr/bin/env node

/**
 * Script para inicializar el sistema de notificaciones automáticas
 * 
 * Este script:
 * 1. Configura los trabajos programados (cron jobs)
 * 2. Inicia el sistema de notificaciones automáticas
 * 3. Verifica la configuración del servicio de email
 * 
 * Uso: npm run init-notifications
 */

import { PrismaClient } from '@prisma/client';
import { getNotificationService } from '../services/notification.service';
import { getEmailService } from '../services/email.service';

const prisma = new PrismaClient();

async function initNotificationSystem() {
  console.log('🚀 Inicializando sistema de notificaciones automáticas...\n');

  try {
    // 1. Verificar configuración del servicio de email
    console.log('📧 Verificando configuración del servicio de email...');
    const emailService = getEmailService();
    const emailConfigOk = await emailService.testConnection();
    
    if (!emailConfigOk) {
      console.error('❌ Error: Configuración de email no válida');
      console.log('   Verifica las variables de entorno:');
      console.log('   - EMAIL_SERVICE (sendgrid o resend)');
      console.log('   - SENDGRID_API_KEY o RESEND_API_KEY');
      console.log('   - SENDGRID_FROM_EMAIL o RESEND_FROM_EMAIL');
      process.exit(1);
    }
    console.log('✅ Configuración de email verificada\n');

    // 2. Inicializar servicio de notificaciones
    console.log('🔔 Inicializando servicio de notificaciones...');
    const notificationService = getNotificationService(prisma);

    // 3. Configurar trabajos programados
    console.log('⏰ Configurando trabajos programados...');
    
    // Configurar recordatorios de fecha límite (diario a las 9:00 AM)
    notificationService.setupDeadlineReminders();
    console.log('   ✅ Recordatorios de fecha límite configurados (diario 9:00 AM)');
    
    // Configurar notificaciones de evaluación (cada hora)
    notificationService.setupEvaluationNotifications();
    console.log('   ✅ Notificaciones de evaluación configuradas (cada hora)');

    // 4. Iniciar trabajos programados
    console.log('▶️  Iniciando trabajos programados...');
    notificationService.startScheduledJobs();
    console.log('   ✅ Trabajos programados iniciados exitosamente\n');

    // 5. Mostrar resumen de configuración
    console.log('📊 Resumen de configuración:');
    console.log('   • Recordatorios de fecha límite: Activos (diario 9:00 AM)');
    console.log('   • Notificaciones de evaluación: Activas (cada hora)');
    console.log('   • Notificaciones automáticas en eventos: Activas');
    console.log('   • Servicio de email:', process.env['EMAIL_SERVICE'] || 'sendgrid');
    console.log('   • Email remitente:', process.env['SENDGRID_FROM_EMAIL'] || process.env['RESEND_FROM_EMAIL'] || 'noreply@webfestival.com');

    console.log('\n🎉 Sistema de notificaciones inicializado exitosamente!');
    console.log('\n📝 Funcionalidades disponibles:');
    console.log('   • Recordatorios automáticos 48h antes del cierre de concursos');
    console.log('   • Notificaciones cuando jurados completan evaluaciones');
    console.log('   • Notificaciones automáticas al publicar resultados');
    console.log('   • Notificaciones de nuevos concursos al activarlos');
    console.log('   • API endpoints para gestión manual de notificaciones');

    console.log('\n🔧 Gestión del sistema:');
    console.log('   • Iniciar trabajos: POST /api/v1/notifications/start-scheduled-jobs');
    console.log('   • Detener trabajos: POST /api/v1/notifications/stop-scheduled-jobs');
    console.log('   • Limpiar notificaciones: POST /api/v1/notifications/cleanup');

    // Mantener el proceso activo para los cron jobs
    console.log('\n⚠️  Mantén este proceso activo para que funcionen las notificaciones automáticas');
    console.log('   Presiona Ctrl+C para detener el sistema de notificaciones\n');

    // Manejar cierre graceful
    process.on('SIGINT', async () => {
      console.log('\n🛑 Deteniendo sistema de notificaciones...');
      notificationService.stopScheduledJobs();
      await prisma.$disconnect();
      console.log('✅ Sistema de notificaciones detenido');
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n🛑 Deteniendo sistema de notificaciones...');
      notificationService.stopScheduledJobs();
      await prisma.$disconnect();
      console.log('✅ Sistema de notificaciones detenido');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Error inicializando sistema de notificaciones:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  initNotificationSystem();
}

export { initNotificationSystem };