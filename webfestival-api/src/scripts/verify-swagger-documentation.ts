#!/usr/bin/env tsx

/**
 * Script para verificar la documentación de Swagger
 * Verifica qué endpoints están documentados y cuáles faltan
 */

import { swaggerSpec } from '../config/swagger';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const verifySwaggerDocumentation = async () => {
  console.log('🔍 Verificando documentación de Swagger...\n');

  try {
    // 1. Verificar que la especificación se genera correctamente
    console.log('1. Verificando especificación de Swagger...');
    
    if (!swaggerSpec || !(swaggerSpec as any).paths) {
      console.log('   ❌ Error: No se pudo generar la especificación de Swagger');
      return false;
    }

    console.log(`   ✅ Especificación generada: ${(swaggerSpec as any).info?.title} v${(swaggerSpec as any).info?.version}`);
    console.log(`   📊 Total de paths documentados: ${Object.keys((swaggerSpec as any).paths).length}`);

    // 2. Listar todos los endpoints documentados
    console.log('\n2. Endpoints documentados en Swagger:');
    const documentedEndpoints: string[] = [];
    
    for (const [path, methods] of Object.entries((swaggerSpec as any).paths)) {
      if (methods && typeof methods === 'object') {
        for (const method of Object.keys(methods)) {
          const endpoint = `${method.toUpperCase()} ${path}`;
          documentedEndpoints.push(endpoint);
          console.log(`   ✅ ${endpoint}`);
        }
      }
    }

    // 3. Verificar archivos de rutas existentes
    console.log('\n3. Verificando archivos de rutas...');
    const routesDir = join(process.cwd(), 'src', 'routes');
    const routeFiles = readdirSync(routesDir).filter(file => file.endsWith('.ts') && file !== 'index.ts');
    
    console.log(`   📁 Archivos de rutas encontrados: ${routeFiles.length}`);
    
    for (const file of routeFiles) {
      const filePath = join(routesDir, file);
      const content = readFileSync(filePath, 'utf-8');
      
      // Contar comentarios @swagger
      const swaggerComments = (content.match(/@swagger/g) || []).length;
      
      // Contar rutas definidas (router.get, router.post, etc.)
      const routeDefinitions = (content.match(/router\.(get|post|put|delete|patch)/g) || []).length;
      
      console.log(`   📄 ${file}:`);
      console.log(`      - Rutas definidas: ${routeDefinitions}`);
      console.log(`      - Documentación @swagger: ${swaggerComments}`);
      
      if (swaggerComments === 0 && routeDefinitions > 0) {
        console.log(`      ⚠️  Sin documentación Swagger`);
      } else if (swaggerComments < routeDefinitions) {
        console.log(`      ⚠️  Documentación incompleta (${swaggerComments}/${routeDefinitions})`);
      } else {
        console.log(`      ✅ Documentación completa`);
      }
    }

    // 4. Verificar tags utilizados
    console.log('\n4. Tags de documentación:');
    const tags = (swaggerSpec as any).tags || [];
    for (const tag of tags) {
      console.log(`   🏷️  ${tag.name}: ${tag.description}`);
    }

    // 5. Verificar esquemas definidos
    console.log('\n5. Esquemas de datos definidos:');
    const schemas = (swaggerSpec as any).components?.schemas || {};
    for (const schemaName of Object.keys(schemas)) {
      console.log(`   📋 ${schemaName}`);
    }

    // 6. Verificar servidores configurados
    console.log('\n6. Servidores configurados:');
    const servers = (swaggerSpec as any).servers || [];
    for (const server of servers) {
      console.log(`   🌐 ${server.url} - ${server.description}`);
    }

    console.log('\n🎉 Verificación de Swagger completada');
    console.log(`📊 Resumen:`);
    console.log(`   - Endpoints documentados: ${documentedEndpoints.length}`);
    console.log(`   - Archivos de rutas: ${routeFiles.length}`);
    console.log(`   - Tags definidos: ${tags.length}`);
    console.log(`   - Esquemas definidos: ${Object.keys(schemas).length}`);
    console.log(`   - Servidores configurados: ${servers.length}`);

    return true;

  } catch (error) {
    console.log(`\n❌ Error durante la verificación: ${(error as Error).message}`);
    return false;
  }
}

// Ejecutar la verificación
verifySwaggerDocumentation()
  .then((success) => {
    console.log(`\n${success ? '✅' : '❌'} Verificación ${success ? 'exitosa' : 'fallida'}`);
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('❌ Error ejecutando verificación:', error);
    process.exit(1);
  });