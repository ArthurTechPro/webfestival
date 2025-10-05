#!/usr/bin/env tsx

/**
 * Script para probar que el servidor puede iniciarse correctamente
 * Verifica la configuración básica sin iniciar el servidor completo
 */

import dotenv from 'dotenv';
import { validateDatabaseConfig } from '../config/database';
import { swaggerSpec } from '../config/swagger';

// Cargar variables de entorno
dotenv.config();

async function testServerStartup() {
    console.log('🧪 Probando configuración del servidor...\n');

    try {
        // 1. Verificar variables de entorno
        console.log('1. Verificando variables de entorno...');
        const requiredEnvVars = [
            'DATABASE_URL',
            'JWT_SECRET',
            'PORT'
        ];

        const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

        if (missingVars.length > 0) {
            console.log(`   ❌ Variables faltantes: ${missingVars.join(', ')}`);
            return false;
        }
        console.log('   ✅ Variables de entorno configuradas correctamente');

        // 2. Verificar configuración de base de datos
        console.log('2. Verificando configuración de base de datos...');
        try {
            validateDatabaseConfig();
            console.log('   ✅ Configuración de base de datos válida');
        } catch (error) {
            console.log(`   ❌ Error en configuración de base de datos: ${(error as Error).message}`);
            return false;
        }

        // 3. Verificar configuración de Swagger
        console.log('3. Verificando configuración de Swagger...');
        try {
            if (swaggerSpec && swaggerSpec.info && swaggerSpec.info.title) {
                console.log(`   ✅ Swagger configurado: ${swaggerSpec.info.title} v${swaggerSpec.info.version}`);
            } else {
                console.log('   ❌ Configuración de Swagger inválida');
                return false;
            }
        } catch (error) {
            console.log(`   ❌ Error en configuración de Swagger: ${(error as Error).message}`);
            return false;
        }

        // 4. Verificar que los módulos principales se pueden importar
        console.log('4. Verificando importaciones de módulos...');
        try {
            await import('../routes');
            console.log('   ✅ Rutas principales importadas correctamente');

            await import('../middleware/errorHandler');
            console.log('   ✅ Middleware de manejo de errores importado correctamente');

            await import('../lib/prisma');
            console.log('   ✅ Cliente de Prisma importado correctamente');
        } catch (error) {
            console.log(`   ❌ Error importando módulos: ${(error as Error).message}`);
            return false;
        }

        console.log('\n🎉 ¡Todas las verificaciones pasaron exitosamente!');
        console.log('✅ El servidor debería poder iniciarse con "npm run dev"');
        return true;

    } catch (error) {
        console.log(`\n❌ Error durante las verificaciones: ${(error as Error).message}`);
        return false;
    }
}

// Ejecutar el test
testServerStartup()
    .then((success) => {
        process.exit(success ? 0 : 1);
    })
    .catch((error) => {
        console.error('❌ Error ejecutando test:', error);
        process.exit(1);
    });