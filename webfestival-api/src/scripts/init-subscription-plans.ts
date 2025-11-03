#!/usr/bin/env node

/**
 * Script para inicializar los planes de suscripción predeterminados
 * 
 * Uso:
 * npm run init-plans
 * o
 * node dist/scripts/init-subscription-plans.js
 */

import { PrismaClient } from '@prisma/client';
import { DEFAULT_PLANS } from '../types/subscription.types';

const prisma = new PrismaClient();

const initializePlans = async () => {
  console.log('🚀 Inicializando planes de suscripción predeterminados...');

  try {
    let createdCount = 0;
    let updatedCount = 0;

    for (const planData of DEFAULT_PLANS) {
      console.log(`📋 Procesando plan: ${planData.name}`);

      // Verificar si el plan ya existe
      const existingPlan = await prisma.subscriptionPlan.findUnique({
        where: { id: planData.id }
      });

      if (existingPlan) {
        // Actualizar plan existente
        await prisma.subscriptionPlan.update({
          where: { id: planData.id },
          data: {
            name: planData.name,
            price: planData.price,
            currency: planData.currency || 'USD',
            interval: planData.interval,
            features: planData.features as any,
            limits: planData.limits as any,
            active: true
          }
        });
        updatedCount++;
        console.log(`✅ Plan ${planData.name} actualizado`);
      } else {
        // Crear nuevo plan
        await prisma.subscriptionPlan.create({
          data: {
            id: planData.id,
            name: planData.name,
            price: planData.price,
            currency: planData.currency || 'USD',
            interval: planData.interval,
            features: planData.features as any,
            limits: planData.limits as any,
            active: true
          }
        });
        createdCount++;
        console.log(`🆕 Plan ${planData.name} creado`);
      }
    }

    console.log('\n📊 Resumen:');
    console.log(`   • Planes creados: ${createdCount}`);
    console.log(`   • Planes actualizados: ${updatedCount}`);
    console.log(`   • Total procesados: ${createdCount + updatedCount}`);

    // Mostrar todos los planes activos
    console.log('\n📋 Planes de suscripción activos:');
    const activePlans = await prisma.subscriptionPlan.findMany({
      where: { active: true },
      orderBy: { price: 'asc' }
    });

    activePlans.forEach(plan => {
      console.log(`   • ${plan.name} - $${plan.price}/${plan.interval === 'monthly' ? 'mes' : 'año'}`);
    });

    console.log('\n✅ Inicialización completada exitosamente');

  } catch (error) {
    console.error('❌ Error al inicializar planes:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  initializePlans()
    .then(() => {
      console.log('\n🎉 Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

export { initializePlans };