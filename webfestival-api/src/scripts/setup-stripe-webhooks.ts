#!/usr/bin/env tsx

/**
 * Script para configurar webhooks de Stripe automáticamente
 * 
 * Uso:
 * npm run setup-webhooks
 * 
 * Este script crea automáticamente el endpoint de webhook en Stripe
 * y configura los eventos necesarios para el sistema de suscripciones
 */

import dotenv from 'dotenv';
import { stripeService } from '../services/stripe.service';

// Cargar variables de entorno
dotenv.config();

// Eventos de webhook que necesitamos escuchar
const REQUIRED_WEBHOOK_EVENTS = [
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
  'invoice.payment_action_required',
  'customer.subscription.trial_will_end',
  'invoice.upcoming',
  'payment_method.attached',
  'payment_method.detached',
  'setup_intent.succeeded',
  'setup_intent.setup_failed'
];

const setupStripeWebhooks = async (): Promise<void> => {
  console.log('🔗 Configurando webhooks de Stripe...');
  console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
  
  try {
    // Verificar configuración
    const serverUrl = process.env['SERVER_URL'];
    if (!serverUrl) {
      throw new Error('SERVER_URL no está configurada en las variables de entorno');
    }

    const webhookUrl = `${serverUrl}/api/v1/subscriptions/webhooks/stripe`;
    console.log(`🌐 URL del webhook: ${webhookUrl}`);

    // Obtener webhooks existentes
    console.log('\n📋 Verificando webhooks existentes...');
    const existingWebhooks = await stripeService['stripe'].webhookEndpoints.list();
    
    // Buscar webhook existente para nuestra URL
    const existingWebhook = existingWebhooks.data.find(
      webhook => webhook.url === webhookUrl
    );

    if (existingWebhook) {
      console.log(`✅ Webhook existente encontrado: ${existingWebhook.id}`);
      
      // Verificar que tenga todos los eventos necesarios
      const missingEvents = REQUIRED_WEBHOOK_EVENTS.filter(
        event => !existingWebhook.enabled_events.includes(event as any)
      );

      if (missingEvents.length > 0) {
        console.log(`🔄 Actualizando webhook para incluir eventos faltantes: ${missingEvents.join(', ')}`);
        
        await stripeService['stripe'].webhookEndpoints.update(existingWebhook.id, {
          enabled_events: REQUIRED_WEBHOOK_EVENTS as any[]
        });
        
        console.log('✅ Webhook actualizado exitosamente');
      } else {
        console.log('✅ El webhook ya tiene todos los eventos necesarios');
      }

      console.log(`🔑 Secret del webhook: ${existingWebhook.secret}`);
      console.log('\n💡 Asegúrate de configurar STRIPE_WEBHOOK_SECRET en tu archivo .env:');
      console.log(`STRIPE_WEBHOOK_SECRET="${existingWebhook.secret}"`);
      
    } else {
      console.log('🆕 Creando nuevo webhook...');
      
      const newWebhook = await stripeService['stripe'].webhookEndpoints.create({
        url: webhookUrl,
        enabled_events: REQUIRED_WEBHOOK_EVENTS as any[]
      });

      console.log(`✅ Webhook creado exitosamente: ${newWebhook.id}`);
      console.log(`🔑 Secret del webhook: ${newWebhook.secret}`);
      console.log('\n💡 Configura STRIPE_WEBHOOK_SECRET en tu archivo .env:');
      console.log(`STRIPE_WEBHOOK_SECRET="${newWebhook.secret}"`);
    }

    // Mostrar resumen de configuración
    console.log('\n📊 Resumen de configuración:');
    console.log(`   - URL del webhook: ${webhookUrl}`);
    console.log(`   - Eventos configurados: ${REQUIRED_WEBHOOK_EVENTS.length}`);
    console.log('   - Eventos incluidos:');
    REQUIRED_WEBHOOK_EVENTS.forEach(event => {
      console.log(`     • ${event}`);
    });

    console.log('\n🎯 Próximos pasos:');
    console.log('   1. Copia el STRIPE_WEBHOOK_SECRET mostrado arriba a tu archivo .env');
    console.log('   2. Reinicia tu servidor para aplicar los cambios');
    console.log('   3. Prueba los webhooks usando el dashboard de Stripe');
    console.log('   4. Verifica que los eventos se procesen correctamente en los logs');

    console.log('\n✅ Configuración de webhooks completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante la configuración de webhooks:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid API Key')) {
        console.log('\n💡 Solución:');
        console.log('   1. Obtén tu clave secreta de Stripe desde https://dashboard.stripe.com/apikeys');
        console.log('   2. Configura STRIPE_SECRET_KEY en tu archivo .env');
        console.log('   3. Ejecuta este script nuevamente');
      } else if (error.message.includes('SERVER_URL')) {
        console.log('\n💡 Solución:');
        console.log('   1. Configura SERVER_URL en tu archivo .env (ej: http://localhost:3001)');
        console.log('   2. Para producción, usa tu dominio real (ej: https://api.webfestival.com)');
      }
    }
    
    process.exit(1);
  }
}

// Ejecutar el script si se llama directamente
if (require.main === module) {
  setupStripeWebhooks()
    .then(() => {
      console.log('🎉 Script de configuración finalizado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal en el script de configuración:', error);
      process.exit(1);
    });
}

export { setupStripeWebhooks };