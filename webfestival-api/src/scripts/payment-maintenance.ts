#!/usr/bin/env tsx

/**
 * Script para ejecutar tareas de mantenimiento de pagos y suscripciones
 * 
 * Uso:
 * npm run payment-maintenance
 * 
 * Este script debe ejecutarse periódicamente (ej: cada hora) usando cron o un scheduler
 */

import dotenv from 'dotenv';
import { paymentRecoveryService } from '../services/payment-recovery.service';
import { connectDatabase, disconnectDatabase } from '../lib/prisma';

// Cargar variables de entorno
dotenv.config();

async function runPaymentMaintenance(): Promise<void> {
    console.log('🚀 Iniciando mantenimiento de pagos y suscripciones...');
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
    
    try {
        // Conectar a la base de datos
        await connectDatabase();
        console.log('✅ Conectado a la base de datos');

        // Ejecutar tareas de mantenimiento
        await paymentRecoveryService.runMaintenanceTasks();

        // Obtener y mostrar estadísticas
        const stats = await paymentRecoveryService.getRecoveryStats();
        console.log('📊 Estadísticas de recuperación de pagos (últimos 30 días):');
        console.log(`   - Fallos de pago totales: ${stats.totalFailures}`);
        console.log(`   - Reintentos exitosos: ${stats.successfulRetries}`);
        console.log(`   - Reintentos fallidos: ${stats.failedRetries}`);
        console.log(`   - Cancelaciones por pago: ${stats.canceledDueToPayment}`);
        
        if (stats.totalFailures > 0) {
            const successRate = ((stats.successfulRetries / stats.totalFailures) * 100).toFixed(2);
            console.log(`   - Tasa de éxito en recuperación: ${successRate}%`);
        }

        console.log('✅ Mantenimiento de pagos completado exitosamente');
        
    } catch (error) {
        console.error('❌ Error durante el mantenimiento de pagos:', error);
        process.exit(1);
    } finally {
        // Desconectar de la base de datos
        await disconnectDatabase();
        console.log('🔌 Desconectado de la base de datos');
    }
}

// Ejecutar el script si se llama directamente
if (require.main === module) {
    runPaymentMaintenance()
        .then(() => {
            console.log('🎉 Script de mantenimiento finalizado');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Error fatal en el script de mantenimiento:', error);
            process.exit(1);
        });
}

export { runPaymentMaintenance };