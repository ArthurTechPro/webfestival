#!/usr/bin/env node

/**
 * Script para poblar la base de datos de pruebas con datos iniciales
 */

const { PrismaClient } = require('@prisma/client');

// Configurar la URL de la base de datos de pruebas
process.env.DATABASE_URL = 'postgresql://postgres:wasi3355@localhost:5432/webfestival_test_db';
process.env.NODE_ENV = 'test';

const prisma = new PrismaClient();

async function seedTestDatabase() {
  console.log('🌱 Poblando base de datos de pruebas...\n');

  try {
    // Limpiar datos existentes (en orden correcto por dependencias)
    console.log('1. Limpiando datos existentes...');
    try {
      await prisma.calificacion.deleteMany();
    } catch (e) { /* tabla puede no existir */ }
    try {
      await prisma.juradoAsignacion.deleteMany();
    } catch (e) { /* tabla puede no existir */ }
    try {
      await prisma.inscripcionConcurso.deleteMany();
    } catch (e) { /* tabla puede no existir */ }
    try {
      await prisma.media.deleteMany();
    } catch (e) { /* tabla puede no existir */ }
    try {
      await prisma.concurso.deleteMany();
    } catch (e) { /* tabla puede no existir */ }
    try {
      await prisma.juradoEspecializacion.deleteMany();
    } catch (e) { /* tabla puede no existir */ }
    try {
      await prisma.criterio.deleteMany();
    } catch (e) { /* tabla puede no existir */ }
    try {
      await prisma.usuario.deleteMany();
    } catch (e) { /* tabla puede no existir */ }
    console.log('   ✅ Datos limpiados');

    // Crear usuarios de prueba
    console.log('\n2. Creando usuarios de prueba...');
    const usuarios = await Promise.all([
      prisma.usuario.create({
        data: {
          email: 'admin@test.com',
          nombre: 'Admin Test User',
          password: 'hashed_password',
          role: 'ADMIN'
        }
      }),
      prisma.usuario.create({
        data: {
          email: 'jurado@test.com',
          nombre: 'Jurado Test User',
          password: 'hashed_password',
          role: 'JURADO'
        }
      }),
      prisma.usuario.create({
        data: {
          email: 'participante@test.com',
          nombre: 'Participante Test User',
          password: 'hashed_password',
          role: 'PARTICIPANTE'
        }
      })
    ]);
    console.log(`   ✅ ${usuarios.length} usuarios creados`);

    // Crear criterios de evaluación
    console.log('\n3. Creando criterios de evaluación...');
    const criterios = await Promise.all([
      // Criterios universales
      prisma.criterio.create({
        data: {
          nombre: 'Creatividad',
          descripcion: 'Originalidad y creatividad de la obra',
          peso: 25,
          tipo_medio: null,
          activo: true
        }
      }),
      prisma.criterio.create({
        data: {
          nombre: 'Técnica',
          descripcion: 'Calidad técnica de la ejecución',
          peso: 25,
          tipo_medio: null,
          activo: true
        }
      }),
      // Criterios específicos para fotografía
      prisma.criterio.create({
        data: {
          nombre: 'Composición Fotográfica',
          descripcion: 'Calidad de la composición y encuadre',
          peso: 30,
          tipo_medio: 'fotografia',
          activo: true
        }
      }),
      prisma.criterio.create({
        data: {
          nombre: 'Iluminación',
          descripcion: 'Uso efectivo de la luz',
          peso: 20,
          tipo_medio: 'fotografia',
          activo: true
        }
      }),
      // Criterios específicos para video
      prisma.criterio.create({
        data: {
          nombre: 'Narrativa Visual',
          descripcion: 'Calidad de la narrativa y storytelling',
          peso: 30,
          tipo_medio: 'video',
          activo: true
        }
      }),
      prisma.criterio.create({
        data: {
          nombre: 'Edición',
          descripcion: 'Calidad de la edición y montaje',
          peso: 20,
          tipo_medio: 'video',
          activo: true
        }
      })
    ]);
    console.log(`   ✅ ${criterios.length} criterios creados`);

    // Crear concursos de prueba
    console.log('\n4. Creando concursos de prueba...');
    const fechaInicio = new Date();
    const fechaFinal = new Date();
    fechaFinal.setMonth(fechaFinal.getMonth() + 1);

    const concursos = await Promise.all([
      prisma.concurso.create({
        data: {
          titulo: 'Concurso de Fotografía Test',
          descripcion: 'Concurso de prueba para fotografía',
          fecha_inicio: fechaInicio,
          fecha_final: fechaFinal,
          status: 'ACTIVO',
          max_envios: 3,
          tamano_max_mb: 10
        }
      }),
      prisma.concurso.create({
        data: {
          titulo: 'Concurso de Video Test',
          descripcion: 'Concurso de prueba para video',
          fecha_inicio: fechaInicio,
          fecha_final: fechaFinal,
          status: 'ACTIVO',
          max_envios: 2,
          tamano_max_mb: 100
        }
      })
    ]);
    console.log(`   ✅ ${concursos.length} concursos creados`);

    // Crear especializaciones de jurado
    console.log('\n5. Creando especializaciones de jurado...');
    const especializaciones = await Promise.all([
      prisma.juradoEspecializacion.create({
        data: {
          usuario_id: usuarios[1].id,
          especializacion: 'fotografia',
          experiencia_anios: 5,
          certificaciones: ['Fotografía Profesional', 'Composición Avanzada']
        }
      }),
      prisma.juradoEspecializacion.create({
        data: {
          usuario_id: usuarios[1].id,
          especializacion: 'video',
          experiencia_anios: 3,
          certificaciones: ['Producción Audiovisual']
        }
      })
    ]);
    console.log(`   ✅ ${especializaciones.length} especializaciones creadas`);

    console.log('\n🎉 Base de datos de pruebas poblada exitosamente!');
    console.log('\n📊 Datos creados:');
    console.log(`   - Usuarios: ${usuarios.length}`);
    console.log(`   - Criterios: ${criterios.length}`);
    console.log(`   - Concursos: ${concursos.length}`);
    console.log(`   - Especializaciones: ${especializaciones.length}`);

  } catch (error) {
    console.error('\n❌ Error al poblar la base de datos:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  seedTestDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { seedTestDatabase };