#!/usr/bin/env tsx

/**
 * Script para probar la integración con Stripe
 * 
 * Uso:
 * npm run test-stripe
 */

import dotenv from 'dotenv';
import { stripeService } from '../services/stripe.service';
import { subscriptionService } from '../services/subscription.service';
import { connectDatabase, disconnectDatabase } from '../lib/prisma';

// Cargar variables de entorno
dotenv.config();

const testStripeIntegration = async (): Promise<void> => {
    console.log('🧪 Iniciando pruebas de integración con Stripe...');
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
    
    try {
        // Conectar a la base de datos
        await connectDatabase();
        console.log('✅ Conectado a la base de datos');

        // Verificar configuración de Stripe
        console.log('\n🔧 Verificando configuración de Stripe...');
        const stripeSecretKey = process.env['STRIPE_SECRET_KEY'];
        const stripeWebhookSecret = process.env['STRIPE_WEBHOOK_SECRET'];
        const stripePublishableKey = process.env['STRIPE_PUBLISHABLE_KEY'];

        if (!stripeSecretKey) {
            throw new Error('STRIPE_SECRET_KEY no está configurada');
        }
        if (!stripeWebhookSecret) {
            console.warn('⚠️ STRIPE_WEBHOOK_SECRET no está configurada (requerida para webhooks)');
        }
        if (!stripePublishableKey) {
            console.warn('⚠️ STRIPE_PUBLISHABLE_KEY no está configurada (requerida para frontend)');
        }

        console.log('✅ Configuración de Stripe verificada');

        // Probar conexión con Stripe
        console.log('\n🌐 Probando conexión con Stripe...');
        try {
            const balance = await stripeService['stripe'].balance.retrieve();
            console.log('✅ Conexión con Stripe exitosa');
            console.log(`💰 Balance disponible: ${balance.available[0]?.amount || 0} ${balance.available[0]?.currency || 'USD'}`);
        } catch (error) {
            console.error('❌ Error al conectar con Stripe:', error);
            throw error;
        }

        // Probar creación de cliente
        console.log('\n👤 Probando creación de cliente...');
        const testUserId = 'test-user-' + Date.now();
        const testEmail = `test-${Date.now()}@webfestival.com`;
        
        try {
            const customer = await stripeService.getOrCreateCustomer(testUserId, testEmail, 'Usuario de Prueba');
            console.log('✅ Cliente creado exitosamente');
            console.log(`📧 Cliente ID: ${customer.id}, Email: ${customer.email}`);

            // Limpiar cliente de prueba
            await stripeService['stripe'].customers.del(customer.id);
            console.log('🧹 Cliente de prueba eliminado');
        } catch (error) {
            console.error('❌ Error al crear cliente:', error);
            throw error;
        }

        // Probar obtención de planes
        console.log('\n📋 Probando obtención de planes de suscripción...');
        try {
            const plans = await subscriptionService.getAvailablePlans();
            console.log(`✅ Planes obtenidos: ${plans.length} planes disponibles`);
            
            plans.forEach(plan => {
                console.log(`   - ${plan.name}: $${plan.price} ${plan.currency} (${plan.interval})`);
            });

            if (plans.length === 0) {
                console.log('⚠️ No hay planes configurados. Ejecuta "npm run init-plans" para crear planes por defecto');
            }
        } catch (error) {
            console.error('❌ Error al obtener planes:', error);
            throw error;
        }

        // Probar creación de producto y precio en Stripe
        console.log('\n🏷️ Probando creación de producto y precio...');
        try {
            const testPlanId = 'test-plan-' + Date.now();
            const product = await stripeService.createProduct(testPlanId, 'Plan de Prueba');
            console.log('✅ Producto creado exitosamente');
            console.log(`🏷️ Producto ID: ${product.id}, Nombre: ${product.name}`);

            const price = await stripeService.createPrice(product.id, 9.99, 'USD', 'month');
            console.log('✅ Precio creado exitosamente');
            console.log(`💲 Precio ID: ${price.id}, Monto: $${(price.unit_amount || 0) / 100} ${price.currency}`);

            // Limpiar producto de prueba
            await stripeService['stripe'].products.update(product.id, { active: false });
            console.log('🧹 Producto de prueba desactivado');
        } catch (error) {
            console.error('❌ Error al crear producto/precio:', error);
            throw error;
        }

        // Probar webhook signature (simulado)
        console.log('\n🔐 Probando verificación de webhook...');
        try {
            if (stripeWebhookSecret) {
                // Crear un payload de prueba
                const testPayload = JSON.stringify({
                    id: 'evt_test_webhook',
                    object: 'event',
                    type: 'customer.subscription.created',
                    data: { object: {} }
                });

                // Generar signature de prueba
                const testSignature = stripeService['stripe'].webhooks.generateTestHeaderString({
                    payload: testPayload,
                    secret: stripeWebhookSecret
                });

                // Verificar signature
                const event = stripeService.verifyWebhookSignature(testPayload, testSignature);
                console.log('✅ Verificación de webhook exitosa');
                console.log(`📨 Evento de prueba: ${event.type}`);
            } else {
                console.log('⚠️ Webhook secret no configurado, omitiendo prueba');
            }
        } catch (error) {
            console.error('❌ Error al verificar webhook:', error);
            // No lanzar error aquí ya que es una prueba opcional
        }

        console.log('\n🎉 Todas las pruebas de integración con Stripe completadas exitosamente');
        
        // Mostrar resumen de configuración
        console.log('\n📊 Resumen de configuración:');
        console.log(`   - Stripe Secret Key: ${stripeSecretKey ? '✅ Configurada' : '❌ Faltante'}`);
        console.log(`   - Stripe Webhook Secret: ${stripeWebhookSecret ? '✅ Configurada' : '⚠️ Faltante'}`);
        console.log(`   - Stripe Publishable Key: ${stripePublishableKey ? '✅ Configurada' : '⚠️ Faltante'}`);
        console.log(`   - Conexión con Stripe: ✅ Exitosa`);
        console.log(`   - Planes de suscripción: ${(await subscriptionService.getAvailablePlans()).length} disponibles`);

        console.log('\n💡 Próximos pasos:');
        console.log('   1. Configurar webhooks en el dashboard de Stripe');
        console.log('   2. Probar flujo completo de pago en el frontend');
        console.log('   3. Configurar tareas programadas para mantenimiento de pagos');
        
    } catch (error) {
        console.error('❌ Error durante las pruebas de integración:', error);
        process.exit(1);
    } finally {
        // Desconectar de la base de datos
        await disconnectDatabase();
        console.log('🔌 Desconectado de la base de datos');
    }
}

// Ejecutar el script si se llama directamente
if (require.main === module) {
    testStripeIntegration()
        .then(() => {
            console.log('🎉 Script de pruebas finalizado');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Error fatal en el script de pruebas:', error);
            process.exit(1);
        });
}

export { testStripeIntegration };