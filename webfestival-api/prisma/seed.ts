import { PrismaClient, TipoMedio } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // 1. Crear planes de suscripción
  console.log('📋 Creando planes de suscripción...');
  
  const basicPlan = await prisma.subscriptionPlan.upsert({
    where: { id: 'basic' },
    update: {},
    create: {
      id: 'basic',
      name: 'Básico',
      price: 0,
      currency: 'USD',
      interval: 'monthly',
      features: {
        participacion_concursos: true,
        subida_medios: true,
        galeria_publica: true,
        comentarios: true,
        seguimientos: true
      },
      limits: {
        maxConcursosPerMonth: 5,
        maxUploadsPerMonth: 15,
        maxPrivateContests: 0,
        maxTeamMembers: 0,
        analyticsAccess: false,
        prioritySupport: false,
        apiAccess: false
      }
    }
  });

  const proPlan = await prisma.subscriptionPlan.upsert({
    where: { id: 'professional' },
    update: {},
    create: {
      id: 'professional',
      name: 'Profesional',
      price: 9.99,
      currency: 'USD',
      interval: 'monthly',
      features: {
        participacion_concursos: true,
        subida_medios: true,
        galeria_publica: true,
        comentarios: true,
        seguimientos: true,
        concursos_privados: true,
        analytics_basico: true,
        soporte_prioritario: true
      },
      limits: {
        maxConcursosPerMonth: 20,
        maxUploadsPerMonth: 50,
        maxPrivateContests: 3,
        maxTeamMembers: 5,
        analyticsAccess: true,
        prioritySupport: true,
        apiAccess: false
      }
    }
  });

  const premiumPlan = await prisma.subscriptionPlan.upsert({
    where: { id: 'premium' },
    update: {},
    create: {
      id: 'premium',
      name: 'Premium',
      price: 19.99,
      currency: 'USD',
      interval: 'monthly',
      features: {
        participacion_concursos: true,
        subida_medios: true,
        galeria_publica: true,
        comentarios: true,
        seguimientos: true,
        concursos_privados: true,
        analytics_avanzado: true,
        soporte_prioritario: true,
        api_access: true,
        contenido_educativo_premium: true
      },
      limits: {
        maxConcursosPerMonth: -1, // ilimitado
        maxUploadsPerMonth: 200,
        maxPrivateContests: 10,
        maxTeamMembers: 15,
        analyticsAccess: true,
        prioritySupport: true,
        apiAccess: true
      }
    }
  });

  // 2. Crear criterios preconfigurados por tipo de medio
  console.log('🎯 Creando criterios de evaluación preconfigurados...');

  // Criterios para Fotografía
  const criteriosFotografia = [
    { nombre: 'Enfoque', descripcion: 'Nitidez y precisión del enfoque en el sujeto principal', peso: 1.2, orden: 1 },
    { nombre: 'Exposición', descripcion: 'Correcta exposición de luces y sombras', peso: 1.1, orden: 2 },
    { nombre: 'Composición', descripcion: 'Regla de tercios, líneas guía, equilibrio visual', peso: 1.3, orden: 3 },
    { nombre: 'Creatividad', descripcion: 'Originalidad y perspectiva única', peso: 1.4, orden: 4 },
    { nombre: 'Impacto Visual', descripcion: 'Capacidad de captar la atención del espectador', peso: 1.5, orden: 5 }
  ];

  for (const criterio of criteriosFotografia) {
    await prisma.criterio.upsert({
      where: { nombre: `${criterio.nombre} - Fotografía` },
      update: {},
      create: {
        nombre: `${criterio.nombre} - Fotografía`,
        descripcion: criterio.descripcion,
        tipo_medio: TipoMedio.fotografia,
        peso: criterio.peso,
        orden: criterio.orden,
        activo: true
      }
    });
  }

  // Criterios para Video
  const criteriosVideo = [
    { nombre: 'Narrativa', descripcion: 'Estructura y desarrollo de la historia', peso: 1.5, orden: 1 },
    { nombre: 'Técnica Visual', descripcion: 'Calidad de imagen, encuadre y movimientos de cámara', peso: 1.2, orden: 2 },
    { nombre: 'Audio', descripcion: 'Calidad del sonido, música y efectos sonoros', peso: 1.1, orden: 3 },
    { nombre: 'Creatividad', descripcion: 'Originalidad en el concepto y ejecución', peso: 1.4, orden: 4 },
    { nombre: 'Impacto Emocional', descripcion: 'Capacidad de generar emociones en el espectador', peso: 1.3, orden: 5 }
  ];

  for (const criterio of criteriosVideo) {
    await prisma.criterio.upsert({
      where: { nombre: `${criterio.nombre} - Video` },
      update: {},
      create: {
        nombre: `${criterio.nombre} - Video`,
        descripcion: criterio.descripcion,
        tipo_medio: TipoMedio.video,
        peso: criterio.peso,
        orden: criterio.orden,
        activo: true
      }
    });
  }

  // Criterios para Audio
  const criteriosAudio = [
    { nombre: 'Calidad Técnica', descripcion: 'Claridad, ausencia de ruido y calidad de grabación', peso: 1.2, orden: 1 },
    { nombre: 'Composición', descripcion: 'Estructura musical, armonía y melodía', peso: 1.4, orden: 2 },
    { nombre: 'Creatividad', descripcion: 'Originalidad en el concepto sonoro', peso: 1.3, orden: 3 },
    { nombre: 'Producción', descripcion: 'Mezcla, masterización y efectos', peso: 1.1, orden: 4 },
    { nombre: 'Impacto Sonoro', descripcion: 'Capacidad de generar emociones a través del sonido', peso: 1.5, orden: 5 }
  ];

  for (const criterio of criteriosAudio) {
    await prisma.criterio.upsert({
      where: { nombre: `${criterio.nombre} - Audio` },
      update: {},
      create: {
        nombre: `${criterio.nombre} - Audio`,
        descripcion: criterio.descripcion,
        tipo_medio: TipoMedio.audio,
        peso: criterio.peso,
        orden: criterio.orden,
        activo: true
      }
    });
  }

  // Criterios para Cortos de Cine
  const criteriosCine = [
    { nombre: 'Narrativa', descripcion: 'Desarrollo de la historia, guión y estructura', peso: 1.5, orden: 1 },
    { nombre: 'Dirección', descripcion: 'Dirección de actores y visión cinematográfica', peso: 1.4, orden: 2 },
    { nombre: 'Técnica', descripcion: 'Cinematografía, edición y aspectos técnicos', peso: 1.2, orden: 3 },
    { nombre: 'Creatividad', descripcion: 'Originalidad y innovación cinematográfica', peso: 1.3, orden: 4 },
    { nombre: 'Impacto Cinematográfico', descripcion: 'Capacidad de conmover y entretener', peso: 1.6, orden: 5 }
  ];

  for (const criterio of criteriosCine) {
    await prisma.criterio.upsert({
      where: { nombre: `${criterio.nombre} - Cine` },
      update: {},
      create: {
        nombre: `${criterio.nombre} - Cine`,
        descripcion: criterio.descripcion,
        tipo_medio: TipoMedio.corto_cine,
        peso: criterio.peso,
        orden: criterio.orden,
        activo: true
      }
    });
  }

  // Criterios Universales (aplicables a todos los tipos de medios)
  const criteriosUniversales = [
    { nombre: 'Originalidad', descripcion: 'Nivel de innovación y unicidad del trabajo', peso: 1.3, orden: 1 },
    { nombre: 'Mensaje', descripcion: 'Claridad y fuerza del mensaje transmitido', peso: 1.2, orden: 2 },
    { nombre: 'Ejecución Técnica', descripcion: 'Dominio técnico de las herramientas utilizadas', peso: 1.1, orden: 3 },
    { nombre: 'Coherencia Artística', descripcion: 'Consistencia en el estilo y concepto', peso: 1.0, orden: 4 }
  ];

  for (const criterio of criteriosUniversales) {
    await prisma.criterio.upsert({
      where: { nombre: `${criterio.nombre} - Universal` },
      update: {},
      create: {
        nombre: `${criterio.nombre} - Universal`,
        descripcion: criterio.descripcion,
        tipo_medio: null, // null significa que aplica a todos los tipos
        peso: criterio.peso,
        orden: criterio.orden,
        activo: true
      }
    });
  }

  // 3. Crear usuario administrador por defecto
  console.log('👤 Creando usuario administrador...');
  
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const adminUser = await prisma.usuario.upsert({
    where: { email: 'admin@webfestival.com' },
    update: {},
    create: {
      email: 'admin@webfestival.com',
      nombre: 'Administrador WebFestival',
      password: hashedPassword,
      role: 'ADMIN',
      bio: 'Usuario administrador del sistema WebFestival'
    }
  });

  // 4. Crear usuario de contenido por defecto
  console.log('📝 Creando usuario administrador de contenido...');
  
  const contentAdminUser = await prisma.usuario.upsert({
    where: { email: 'content@webfestival.com' },
    update: {},
    create: {
      email: 'content@webfestival.com',
      nombre: 'Administrador de Contenido',
      password: hashedPassword,
      role: 'CONTENT_ADMIN',
      bio: 'Usuario administrador de contenido y CMS'
    }
  });

  // 5. Crear algunos usuarios de prueba
  console.log('🧪 Creando usuarios de prueba...');
  
  const testParticipant = await prisma.usuario.upsert({
    where: { email: 'participante@test.com' },
    update: {},
    create: {
      email: 'participante@test.com',
      nombre: 'Participante de Prueba',
      password: hashedPassword,
      role: 'PARTICIPANTE',
      bio: 'Usuario participante para pruebas del sistema'
    }
  });

  const testJurado = await prisma.usuario.upsert({
    where: { email: 'jurado@test.com' },
    update: {},
    create: {
      email: 'jurado@test.com',
      nombre: 'Jurado de Prueba',
      password: hashedPassword,
      role: 'JURADO',
      bio: 'Usuario jurado especializado para pruebas'
    }
  });

  // 6. Crear especializaciones para el jurado de prueba
  console.log('🎨 Creando especializaciones de jurado...');
  
  await prisma.juradoEspecializacion.createMany({
    data: [
      {
        usuario_id: testJurado.id,
        especializacion: TipoMedio.fotografia,
        experiencia_anios: 5,
        certificaciones: ['Certificación en Fotografía Digital', 'Workshop de Composición Avanzada']
      },
      {
        usuario_id: testJurado.id,
        especializacion: TipoMedio.video,
        experiencia_anios: 3,
        certificaciones: ['Curso de Producción Audiovisual']
      }
    ],
    skipDuplicates: true
  });

  console.log('✅ Seed completado exitosamente!');
  console.log(`📊 Planes de suscripción creados: ${[basicPlan, proPlan, premiumPlan].length}`);
  console.log(`🎯 Criterios de evaluación creados: ${criteriosFotografia.length + criteriosVideo.length + criteriosAudio.length + criteriosCine.length + criteriosUniversales.length}`);
  console.log(`👥 Usuarios creados: 4 (admin, content_admin, participante, jurado)`);
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });