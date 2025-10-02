import { PrismaClient, TipoMedio } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando población de datos iniciales...');

  // ============================================================================
  // CREAR USUARIO ADMINISTRADOR POR DEFECTO
  // ============================================================================
  
  const adminEmail = 'admin@webfestival.com';
  const existingAdmin = await prisma.usuario.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.usuario.create({
      data: {
        email: adminEmail,
        nombre: 'Administrador WebFestival',
        password: hashedPassword,
        role: 'ADMIN',
        bio: 'Administrador principal de la plataforma WebFestival'
      }
    });
    
    console.log('✅ Usuario administrador creado:', admin.email);
  } else {
    console.log('ℹ️  Usuario administrador ya existe:', adminEmail);
  }

  // ============================================================================
  // CREAR USUARIO CONTENT_ADMIN POR DEFECTO
  // ============================================================================
  
  const contentAdminEmail = 'content@webfestival.com';
  const existingContentAdmin = await prisma.usuario.findUnique({
    where: { email: contentAdminEmail }
  });

  if (!existingContentAdmin) {
    const hashedPassword = await bcrypt.hash('content123', 10);
    
    const contentAdmin = await prisma.usuario.create({
      data: {
        email: contentAdminEmail,
        nombre: 'Administrador de Contenido',
        password: hashedPassword,
        role: 'CONTENT_ADMIN',
        bio: 'Administrador de contenido y CMS de WebFestival'
      }
    });
    
    console.log('✅ Usuario administrador de contenido creado:', contentAdmin.email);
  } else {
    console.log('ℹ️  Usuario administrador de contenido ya existe:', contentAdminEmail);
  }

  // ============================================================================
  // CREAR PLANES DE SUSCRIPCIÓN
  // ============================================================================
  
  const planes = [
    {
      id: 'basico',
      name: 'Plan Básico',
      price: 0,
      currency: 'USD',
      interval: 'monthly',
      features: {
        participacion_concursos: true,
        galeria_publica: true,
        comentarios: true,
        seguimientos: true,
        newsletter: true
      },
      limits: {
        maxConcursosPerMonth: 3,
        maxUploadsPerMonth: 10,
        maxPrivateContests: 0,
        maxTeamMembers: 0,
        analyticsAccess: false,
        prioritySupport: false,
        apiAccess: false
      }
    },
    {
      id: 'profesional',
      name: 'Plan Profesional',
      price: 9.99,
      currency: 'USD',
      interval: 'monthly',
      features: {
        participacion_concursos: true,
        galeria_publica: true,
        comentarios: true,
        seguimientos: true,
        newsletter: true,
        contenido_educativo_premium: true,
        estadisticas_basicas: true
      },
      limits: {
        maxConcursosPerMonth: 10,
        maxUploadsPerMonth: 50,
        maxPrivateContests: 2,
        maxTeamMembers: 3,
        analyticsAccess: true,
        prioritySupport: false,
        apiAccess: false
      }
    },
    {
      id: 'premium',
      name: 'Plan Premium',
      price: 19.99,
      currency: 'USD',
      interval: 'monthly',
      features: {
        participacion_concursos: true,
        galeria_publica: true,
        comentarios: true,
        seguimientos: true,
        newsletter: true,
        contenido_educativo_premium: true,
        estadisticas_avanzadas: true,
        soporte_prioritario: true,
        acceso_beta: true
      },
      limits: {
        maxConcursosPerMonth: -1, // ilimitado
        maxUploadsPerMonth: 200,
        maxPrivateContests: 10,
        maxTeamMembers: 10,
        analyticsAccess: true,
        prioritySupport: true,
        apiAccess: true
      }
    },
    {
      id: 'organizador',
      name: 'Plan Organizador',
      price: 49.99,
      currency: 'USD',
      interval: 'monthly',
      features: {
        participacion_concursos: true,
        galeria_publica: true,
        comentarios: true,
        seguimientos: true,
        newsletter: true,
        contenido_educativo_premium: true,
        estadisticas_avanzadas: true,
        soporte_prioritario: true,
        acceso_beta: true,
        crear_concursos: true,
        gestionar_jurados: true,
        branding_personalizado: true
      },
      limits: {
        maxConcursosPerMonth: -1, // ilimitado
        maxUploadsPerMonth: -1, // ilimitado
        maxPrivateContests: -1, // ilimitado
        maxTeamMembers: 50,
        analyticsAccess: true,
        prioritySupport: true,
        apiAccess: true
      }
    }
  ];

  for (const plan of planes) {
    const existingPlan = await prisma.subscriptionPlan.findUnique({
      where: { id: plan.id }
    });

    if (!existingPlan) {
      await prisma.subscriptionPlan.create({
        data: plan
      });
      console.log(`✅ Plan de suscripción creado: ${plan.name}`);
    } else {
      console.log(`ℹ️  Plan de suscripción ya existe: ${plan.name}`);
    }
  }

  // ============================================================================
  // CREAR CRITERIOS PRECONFIGURADOS POR TIPO DE MEDIO
  // ============================================================================
  
  const criteriosPorTipo = {
    [TipoMedio.fotografia]: [
      { nombre: 'Enfoque y Nitidez - Fotografía', descripcion: 'Calidad técnica del enfoque y nitidez de la imagen', peso: 1.2, orden: 1 },
      { nombre: 'Exposición - Fotografía', descripcion: 'Manejo adecuado de la luz y exposición', peso: 1.1, orden: 2 },
      { nombre: 'Composición - Fotografía', descripcion: 'Reglas de composición, encuadre y elementos visuales', peso: 1.3, orden: 3 },
      { nombre: 'Creatividad - Fotografía', descripcion: 'Originalidad y enfoque creativo único', peso: 1.4, orden: 4 },
      { nombre: 'Impacto Visual - Fotografía', descripcion: 'Capacidad de captar la atención y generar emoción', peso: 1.5, orden: 5 }
    ],
    [TipoMedio.video]: [
      { nombre: 'Narrativa - Video', descripcion: 'Estructura narrativa y desarrollo de la historia', peso: 1.5, orden: 1 },
      { nombre: 'Técnica Visual - Video', descripcion: 'Calidad de imagen, estabilización y movimientos de cámara', peso: 1.2, orden: 2 },
      { nombre: 'Audio - Video', descripcion: 'Calidad del sonido, música y efectos sonoros', peso: 1.1, orden: 3 },
      { nombre: 'Creatividad - Video', descripcion: 'Originalidad en el enfoque y técnicas utilizadas', peso: 1.3, orden: 4 },
      { nombre: 'Impacto Emocional - Video', descripcion: 'Capacidad de conectar emocionalmente con la audiencia', peso: 1.4, orden: 5 }
    ],
    [TipoMedio.audio]: [
      { nombre: 'Calidad Técnica - Audio', descripcion: 'Claridad, balance y masterización del audio', peso: 1.3, orden: 1 },
      { nombre: 'Composición - Audio', descripcion: 'Estructura musical y arreglos', peso: 1.4, orden: 2 },
      { nombre: 'Creatividad - Audio', descripcion: 'Originalidad y innovación en el enfoque sonoro', peso: 1.3, orden: 3 },
      { nombre: 'Producción - Audio', descripcion: 'Uso de efectos, instrumentos y técnicas de producción', peso: 1.2, orden: 4 },
      { nombre: 'Impacto Sonoro - Audio', descripcion: 'Capacidad de generar emoción a través del sonido', peso: 1.5, orden: 5 }
    ],
    [TipoMedio.corto_cine]: [
      { nombre: 'Narrativa - Cine', descripcion: 'Desarrollo de la historia, guión y estructura', peso: 1.5, orden: 1 },
      { nombre: 'Dirección - Cine', descripcion: 'Dirección de actores y manejo de la puesta en escena', peso: 1.4, orden: 2 },
      { nombre: 'Técnica - Cine', descripcion: 'Cinematografía, edición y aspectos técnicos', peso: 1.2, orden: 3 },
      { nombre: 'Creatividad - Cine', descripcion: 'Originalidad y visión artística única', peso: 1.3, orden: 4 },
      { nombre: 'Impacto Cinematográfico - Cine', descripcion: 'Capacidad de crear una experiencia cinematográfica memorable', peso: 1.6, orden: 5 }
    ]
  };

  // Criterios universales que aplican a todos los tipos de medios
  const criteriosUniversales = [
    { nombre: 'Mensaje y Concepto', descripcion: 'Claridad y fuerza del mensaje transmitido', peso: 1.3, orden: 10 },
    { nombre: 'Innovación Técnica', descripcion: 'Uso innovador de técnicas y herramientas', peso: 1.1, orden: 11 },
    { nombre: 'Relevancia Cultural', descripcion: 'Conexión con temas actuales y relevancia social', peso: 1.2, orden: 12 }
  ];

  // Crear criterios específicos por tipo de medio
  for (const [tipoMedio, criterios] of Object.entries(criteriosPorTipo)) {
    for (const criterio of criterios) {
      const existingCriterio = await prisma.criterio.findUnique({
        where: {
          nombre: criterio.nombre
        }
      });

      if (!existingCriterio) {
        await prisma.criterio.create({
          data: {
            ...criterio,
            tipo_medio: tipoMedio as TipoMedio,
            activo: true
          }
        });
        console.log(`✅ Criterio creado para ${tipoMedio}: ${criterio.nombre}`);
      } else {
        console.log(`ℹ️  Criterio ya existe para ${tipoMedio}: ${criterio.nombre}`);
      }
    }
  }

  // Crear criterios universales
  for (const criterio of criteriosUniversales) {
    const existingCriterio = await prisma.criterio.findUnique({
      where: {
        nombre: criterio.nombre
      }
    });

    if (!existingCriterio) {
      await prisma.criterio.create({
        data: {
          ...criterio,
          tipo_medio: null, // Universal
          activo: true
        }
      });
      console.log(`✅ Criterio universal creado: ${criterio.nombre}`);
    } else {
      console.log(`ℹ️  Criterio universal ya existe: ${criterio.nombre}`);
    }
  }

  // ============================================================================
  // CREAR CONTENIDO INICIAL PARA EL CMS
  // ============================================================================
  
  const admin = await prisma.usuario.findUnique({
    where: { email: adminEmail }
  });

  if (admin) {
    // Página estática principal
    const existingHomePage = await prisma.contenido.findUnique({
      where: { slug: 'home' }
    });

    if (!existingHomePage) {
      const homePage = await prisma.contenido.create({
        data: {
          tipo: 'pagina_estatica',
          slug: 'home',
          titulo: 'Bienvenido a WebFestival',
          contenido: `
            <h1>La Plataforma Líder en Concursos Multimedia</h1>
            <p>WebFestival conecta artistas creativos de todo el mundo en un ambiente colaborativo y competitivo. Participa en concursos de fotografía, video, audio y cortos de cine.</p>
            
            <h2>¿Por qué elegir WebFestival?</h2>
            <ul>
              <li>Concursos especializados por disciplina artística</li>
              <li>Jurados profesionales especializados</li>
              <li>Comunidad activa de creadores</li>
              <li>Contenido educativo continuo</li>
              <li>Galería pública de obras ganadoras</li>
            </ul>
            
            <h2>Únete a nuestra comunidad</h2>
            <p>Descubre tu potencial creativo y conecta con otros artistas. ¡Regístrate hoy y comienza tu viaje en WebFestival!</p>
          `,
          resumen: 'Plataforma líder en concursos multimedia que conecta artistas creativos de fotografía, video, audio y cine.',
          autor_id: admin.id,
          estado: 'PUBLICADO',
          fecha_publicacion: new Date()
        }
      });

      // Crear configuración para la página home
      await prisma.contenidoConfiguracion.create({
        data: {
          contenido_id: homePage.id,
          activo: true,
          orden: 1,
          permite_comentarios: false,
          destacado: true
        }
      });

      // Crear SEO para la página home
      await prisma.contenidoSEO.create({
        data: {
          contenido_id: homePage.id,
          seo_titulo: 'WebFestival - Concursos Multimedia Online',
          seo_descripcion: 'Plataforma líder en concursos de fotografía, video, audio y cortos de cine. Conecta con artistas creativos y jurados profesionales.',
          seo_keywords: ['concursos', 'fotografía', 'video', 'audio', 'cine', 'multimedia', 'artistas', 'creatividad']
        }
      });

      console.log('✅ Página home creada');
    } else {
      console.log('ℹ️  Página home ya existe');
    }

    // Post de blog inicial
    const existingBlogPost = await prisma.contenido.findUnique({
      where: { slug: 'bienvenidos-webfestival' }
    });

    if (!existingBlogPost) {
      const blogPost = await prisma.contenido.create({
        data: {
          tipo: 'blog_post',
          slug: 'bienvenidos-webfestival',
          titulo: '¡Bienvenidos a WebFestival!',
          contenido: `
            <p>Estamos emocionados de presentar WebFestival, la nueva plataforma que revolucionará la forma en que los artistas creativos participan en concursos multimedia.</p>
            
            <h2>Nuestra Misión</h2>
            <p>Crear un espacio donde fotógrafos, videomakers, músicos y cineastas puedan mostrar su talento, aprender de profesionales y conectar con una comunidad global de creadores.</p>
            
            <h2>¿Qué nos hace diferentes?</h2>
            <ul>
              <li><strong>Especialización por disciplina:</strong> Cada concurso está diseñado específicamente para fotografía, video, audio o cortos de cine</li>
              <li><strong>Jurados especializados:</strong> Profesionales expertos en cada área evalúan las obras</li>
              <li><strong>Criterios dinámicos:</strong> Sistema de evaluación adaptado a cada tipo de medio</li>
              <li><strong>Comunidad activa:</strong> Interacción, seguimientos y feedback constructivo</li>
            </ul>
            
            <h2>Próximos pasos</h2>
            <p>En las próximas semanas estaremos lanzando nuestros primeros concursos. ¡Mantente atento a nuestras actualizaciones!</p>
          `,
          resumen: 'Presentamos WebFestival, la nueva plataforma para concursos multimedia que conecta artistas creativos con jurados profesionales.',
          autor_id: admin.id,
          estado: 'PUBLICADO',
          fecha_publicacion: new Date()
        }
      });

      // Crear taxonomía para el blog post
      await prisma.contenidoTaxonomia.createMany({
        data: [
          {
            contenido_id: blogPost.id,
            categoria: 'anuncios',
            tipo_taxonomia: 'categoria'
          },
          {
            contenido_id: blogPost.id,
            etiqueta: 'bienvenida',
            tipo_taxonomia: 'etiqueta'
          },
          {
            contenido_id: blogPost.id,
            etiqueta: 'comunidad',
            tipo_taxonomia: 'etiqueta'
          }
        ]
      });

      console.log('✅ Post de blog inicial creado');
    } else {
      console.log('ℹ️  Post de blog inicial ya existe');
    }
  }

  console.log('🎉 Población de datos iniciales completada exitosamente');
}

main()
  .catch((e) => {
    console.error('❌ Error durante la población de datos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });