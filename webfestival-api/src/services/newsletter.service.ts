import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import {
  NewsletterSubscriptionInput,
  NewsletterConfirmationInput,
  NewsletterUnsubscribeInput,
  NewsletterSubscribersFilters,
  UpdateNewsletterSubscriberInput,
  CreateContenidoEducativoInput,
  UpdateContenidoEducativoInput,
  ContenidoEducativoFilters,
  RecommendationsFilters,
  TrackContentViewInput,
  ContenidoEducativoMetricsFilters,
  NewsletterDigestInput
} from '../schemas/newsletter.schemas';

const prisma = new PrismaClient();

/**
 * Servicio para gestión de newsletter y contenido educativo
 */
export class NewsletterService {

  // ============================================================================
  // MÉTODOS DE NEWSLETTER
  // ============================================================================

  /**
   * Suscribe un email al newsletter
   */
  async subscribeToNewsletter(data: NewsletterSubscriptionInput) {
    // Verificar si ya existe una suscripción activa
    const existingSubscription = await prisma.newsletterSuscriptor.findUnique({
      where: { email: data.email }
    });

    if (existingSubscription) {
      if (existingSubscription.activo && existingSubscription.confirmado) {
        throw new Error('Este email ya está suscrito al newsletter');
      }
      
      // Reactivar suscripción existente
      const token = crypto.randomBytes(32).toString('hex');
      
      return await prisma.newsletterSuscriptor.update({
        where: { email: data.email },
        data: {
          activo: true,
          confirmado: false,
          token_confirmacion: token,
          fecha_suscripcion: new Date(),
          fecha_cancelacion: null,
          usuario_id: data.usuario_id || existingSubscription.usuario_id
        }
      });
    }

    // Crear nueva suscripción
    const token = crypto.randomBytes(32).toString('hex');
    
    return await prisma.newsletterSuscriptor.create({
      data: {
        email: data.email,
        usuario_id: data.usuario_id || null,
        activo: true,
        confirmado: false,
        token_confirmacion: token,
        fecha_suscripcion: new Date()
      }
    });
  }

  /**
   * Confirma una suscripción al newsletter
   */
  async confirmSubscription(data: NewsletterConfirmationInput) {
    const subscription = await prisma.newsletterSuscriptor.findUnique({
      where: { token_confirmacion: data.token }
    });

    if (!subscription) {
      throw new Error('Token de confirmación inválido');
    }

    if (subscription.confirmado) {
      throw new Error('Esta suscripción ya está confirmada');
    }

    return await prisma.newsletterSuscriptor.update({
      where: { id: subscription.id },
      data: {
        confirmado: true,
        fecha_confirmacion: new Date(),
        token_confirmacion: null
      }
    });
  }

  /**
   * Cancela una suscripción al newsletter
   */
  async unsubscribeFromNewsletter(data: NewsletterUnsubscribeInput) {
    const whereClause = data.token 
      ? { token_confirmacion: data.token }
      : { email: data.email };

    const subscription = await prisma.newsletterSuscriptor.findFirst({
      where: whereClause
    });

    if (!subscription) {
      throw new Error('Suscripción no encontrada');
    }

    return await prisma.newsletterSuscriptor.update({
      where: { id: subscription.id },
      data: {
        activo: false,
        fecha_cancelacion: new Date()
      }
    });
  }

  /**
   * Obtiene lista de suscriptores con filtros
   */
  async getSubscribers(filters: NewsletterSubscribersFilters) {
    const where: any = {};
    
    if (filters.activo !== undefined) {
      where.activo = filters.activo;
    }
    
    if (filters.confirmado !== undefined) {
      where.confirmado = filters.confirmado;
    }
    
    if (filters.fecha_desde || filters.fecha_hasta) {
      where.fecha_suscripcion = {};
      if (filters.fecha_desde) {
        where.fecha_suscripcion.gte = new Date(filters.fecha_desde);
      }
      if (filters.fecha_hasta) {
        where.fecha_suscripcion.lte = new Date(filters.fecha_hasta);
      }
    }

    const [suscriptores, total] = await Promise.all([
      prisma.newsletterSuscriptor.findMany({
        where,
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              email: true
            }
          }
        },
        orderBy: { fecha_suscripcion: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit
      }),
      prisma.newsletterSuscriptor.count({ where })
    ]);

    return {
      suscriptores,
      total,
      page: filters.page,
      totalPages: Math.ceil(total / filters.limit)
    };
  }

  /**
   * Actualiza un suscriptor
   */
  async updateSubscriber(id: number, data: UpdateNewsletterSubscriberInput) {
    const subscription = await prisma.newsletterSuscriptor.findUnique({
      where: { id }
    });

    if (!subscription) {
      throw new Error('Suscriptor no encontrado');
    }

    return await prisma.newsletterSuscriptor.update({
      where: { id },
      data: {
        ...(data.activo !== undefined && { activo: data.activo }),
        ...(data.confirmado !== undefined && { confirmado: data.confirmado }),
        ...(data.activo === false && { fecha_cancelacion: new Date() })
      }
    });
  }

  /**
   * Obtiene estadísticas del newsletter
   */
  async getNewsletterStats() {
    const [
      totalSuscriptores,
      suscriptoresActivos,
      suscriptoresConfirmados,
      nuevosEstesMes
    ] = await Promise.all([
      prisma.newsletterSuscriptor.count(),
      prisma.newsletterSuscriptor.count({ where: { activo: true } }),
      prisma.newsletterSuscriptor.count({ where: { confirmado: true, activo: true } }),
      prisma.newsletterSuscriptor.count({
        where: {
          fecha_suscripcion: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      })
    ]);

    const tasaConfirmacion = totalSuscriptores > 0 
      ? (suscriptoresConfirmados / totalSuscriptores) * 100 
      : 0;

    return {
      total_suscriptores: totalSuscriptores,
      suscriptores_activos: suscriptoresActivos,
      suscriptores_confirmados: suscriptoresConfirmados,
      nuevos_este_mes: nuevosEstesMes,
      tasa_confirmacion: Math.round(tasaConfirmacion * 100) / 100
    };
  }

  // ============================================================================
  // MÉTODOS DE CONTENIDO EDUCATIVO
  // ============================================================================

  /**
   * Crea nuevo contenido educativo
   */
  async createEducationalContent(data: CreateContenidoEducativoInput, autorId: string) {
    // Generar slug único
    const baseSlug = data.titulo
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    
    let slug = baseSlug;
    let counter = 1;
    
    while (await prisma.contenido.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return await prisma.contenido.create({
      data: {
        tipo: 'contenido_educativo',
        slug,
        titulo: data.titulo,
        contenido: data.contenido,
        resumen: data.resumen || null,
        imagen_destacada: data.imagen_destacada || null,
        autor_id: autorId,
        estado: data.estado === 'publicado' ? 'PUBLICADO' : data.estado === 'borrador' ? 'BORRADOR' : 'ARCHIVADO',
        fecha_publicacion: data.estado === 'publicado' ? new Date() : null,
        // Almacenar datos específicos del contenido educativo en configuración adicional
        configuracion: {
          create: {
            activo: true,
            permite_comentarios: true,
            configuracion_adicional: {
              tipo_educativo: data.tipo,
              categoria_multimedia: data.categoria_multimedia,
              nivel: data.nivel,
              tiempo_lectura: data.tiempo_lectura,
              tags: data.tags,
              recursos_adicionales: data.recursos_adicionales
            }
          }
        },
        metricas: {
          create: {
            vistas: 0,
            likes: 0,
            comentarios_count: 0,
            shares: 0
          }
        }
      },
      include: {
        autor: {
          select: {
            id: true,
            nombre: true,
            email: true
          }
        },
        configuracion: true,
        metricas: true
      }
    });
  }

  /**
   * Actualiza contenido educativo existente
   */
  async updateEducationalContent(id: number, data: UpdateContenidoEducativoInput, updatedBy: string) {
    const contenido = await prisma.contenido.findUnique({
      where: { id },
      include: { configuracion: true }
    });

    if (!contenido) {
      throw new Error('Contenido educativo no encontrado');
    }

    if (contenido.tipo !== 'contenido_educativo') {
      throw new Error('Este contenido no es de tipo educativo');
    }

    // Generar nuevo slug si el título cambió
    let slug = contenido.slug;
    if (data.titulo && data.titulo !== contenido.titulo) {
      const baseSlug = data.titulo
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);
      
      let newSlug = baseSlug;
      let counter = 1;
      
      while (await prisma.contenido.findFirst({ 
        where: { slug: newSlug, id: { not: id } } 
      })) {
        newSlug = `${baseSlug}-${counter}`;
        counter++;
      }
      slug = newSlug;
    }

    // Preparar configuración adicional actualizada
    const currentConfig = contenido.configuracion?.configuracion_adicional as any || {};
    const updatedConfig = {
      ...currentConfig,
      ...(data.tipo && { tipo_educativo: data.tipo }),
      ...(data.categoria_multimedia && { categoria_multimedia: data.categoria_multimedia }),
      ...(data.nivel && { nivel: data.nivel }),
      ...(data.tiempo_lectura && { tiempo_lectura: data.tiempo_lectura }),
      ...(data.tags && { tags: data.tags }),
      ...(data.recursos_adicionales && { recursos_adicionales: data.recursos_adicionales })
    };

    return await prisma.contenido.update({
      where: { id },
      data: {
        ...(data.titulo && { titulo: data.titulo }),
        ...(data.contenido && { contenido: data.contenido }),
        ...(data.resumen !== undefined && { resumen: data.resumen }),
        ...(data.imagen_destacada !== undefined && { imagen_destacada: data.imagen_destacada }),
        ...(data.estado && { 
          estado: data.estado === 'publicado' ? 'PUBLICADO' : data.estado === 'borrador' ? 'BORRADOR' : 'ARCHIVADO',
          fecha_publicacion: data.estado === 'publicado' && !contenido.fecha_publicacion 
            ? new Date() 
            : contenido.fecha_publicacion
        }),
        slug,
        updated_by: updatedBy,
        configuracion: {
          upsert: {
            create: {
              activo: true,
              permite_comentarios: true,
              configuracion_adicional: updatedConfig
            },
            update: {
              configuracion_adicional: updatedConfig
            }
          }
        }
      },
      include: {
        autor: {
          select: {
            id: true,
            nombre: true,
            email: true
          }
        },
        configuracion: true,
        metricas: true
      }
    });
  }

  /**
   * Obtiene contenido educativo con filtros
   */
  async getEducationalContent(filters: ContenidoEducativoFilters) {
    const where: any = {
      tipo: 'contenido_educativo'
    };

    if (filters.estado) {
      where.estado = filters.estado.toUpperCase();
    }

    if (filters.autor_id) {
      where.autor_id = filters.autor_id;
    }

    if (filters.busqueda) {
      where.OR = [
        { titulo: { contains: filters.busqueda, mode: 'insensitive' } },
        { contenido: { contains: filters.busqueda, mode: 'insensitive' } },
        { resumen: { contains: filters.busqueda, mode: 'insensitive' } }
      ];
    }

    if (filters.fecha_desde || filters.fecha_hasta) {
      where.created_at = {};
      if (filters.fecha_desde) {
        where.created_at.gte = new Date(filters.fecha_desde);
      }
      if (filters.fecha_hasta) {
        where.created_at.lte = new Date(filters.fecha_hasta);
      }
    }

    // Filtros específicos del contenido educativo
    if (filters.destacado !== undefined) {
      where.configuracion = {
        destacado: filters.destacado
      };
    }

    // Ordenamiento
    let orderBy: any = { created_at: 'desc' };
    switch (filters.orden) {
      case 'popular':
        orderBy = { metricas: { vistas: 'desc' } };
        break;
      case 'titulo':
        orderBy = { titulo: 'asc' };
        break;
      case 'tiempo_lectura':
        orderBy = { configuracion: { configuracion_adicional: 'asc' } };
        break;
    }

    const [contenido] = await Promise.all([
      prisma.contenido.findMany({
        where,
        include: {
          autor: {
            select: {
              id: true,
              nombre: true,
              email: true
            }
          },
          configuracion: true,
          metricas: true
        },
        orderBy,
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit
      }),
      prisma.contenido.count({ where })
    ]);

    // Procesar y filtrar contenido educativo
    const contenidoEducativo = contenido
      .filter(item => {
        const config = item.configuracion?.configuracion_adicional as any;
        if (!config) return false;

        if (filters.tipo && config.tipo_educativo !== filters.tipo) return false;
        if (filters.categoria_multimedia && config.categoria_multimedia !== filters.categoria_multimedia) return false;
        if (filters.nivel && config.nivel !== filters.nivel) return false;
        if (filters.tags && filters.tags.length > 0) {
          const itemTags = config.tags || [];
          if (!filters.tags.some(tag => itemTags.includes(tag))) return false;
        }

        return true;
      })
      .map(item => ({
        ...item,
        // Extraer datos específicos del contenido educativo
        tipo_educativo: (item.configuracion?.configuracion_adicional as any)?.tipo_educativo,
        categoria_multimedia: (item.configuracion?.configuracion_adicional as any)?.categoria_multimedia,
        nivel: (item.configuracion?.configuracion_adicional as any)?.nivel,
        tiempo_lectura: (item.configuracion?.configuracion_adicional as any)?.tiempo_lectura,
        tags: (item.configuracion?.configuracion_adicional as any)?.tags || [],
        recursos_adicionales: (item.configuracion?.configuracion_adicional as any)?.recursos_adicionales || []
      }));

    return {
      contenido: contenidoEducativo,
      total: contenidoEducativo.length,
      page: filters.page,
      totalPages: Math.ceil(contenidoEducativo.length / filters.limit)
    };
  }

  /**
   * Obtiene contenido educativo por ID
   */
  async getEducationalContentById(id: number) {
    const contenido = await prisma.contenido.findUnique({
      where: { id },
      include: {
        autor: {
          select: {
            id: true,
            nombre: true,
            email: true
          }
        },
        configuracion: true,
        metricas: true,
        comentarios: {
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                picture_url: true
              }
            }
          },
          where: { aprobado: true },
          orderBy: { fecha_comentario: 'desc' }
        }
      }
    });

    if (!contenido || contenido.tipo !== 'contenido_educativo') {
      throw new Error('Contenido educativo no encontrado');
    }

    const config = contenido.configuracion?.configuracion_adicional as any;

    return {
      ...contenido,
      tipo_educativo: config?.tipo_educativo,
      categoria_multimedia: config?.categoria_multimedia,
      nivel: config?.nivel,
      tiempo_lectura: config?.tiempo_lectura,
      tags: config?.tags || [],
      recursos_adicionales: config?.recursos_adicionales || []
    };
  }

  /**
   * Elimina contenido educativo
   */
  async deleteEducationalContent(id: number, _userId: string) {
    const contenido = await prisma.contenido.findUnique({
      where: { id }
    });

    if (!contenido) {
      throw new Error('Contenido educativo no encontrado');
    }

    if (contenido.tipo !== 'contenido_educativo') {
      throw new Error('Este contenido no es de tipo educativo');
    }

    return await prisma.contenido.delete({
      where: { id }
    });
  }

  /**
   * Obtiene recomendaciones personalizadas de contenido educativo
   */
  async getPersonalizedRecommendations(filters: RecommendationsFilters) {
    // Obtener historial del usuario para personalizar recomendaciones
    const userHistory = await prisma.contenido.findMany({
      where: {
        tipo: 'contenido_educativo',
        metricas: {
          // Simular vistas del usuario - en una implementación real tendríamos una tabla de vistas por usuario
          vistas: { gt: 0 }
        }
      },
      include: {
        configuracion: true
      },
      take: 50
    });

    // Extraer preferencias del usuario basadas en su historial
    const userPreferences = this.analyzeUserPreferences(userHistory);

    // Construir query para recomendaciones
    const where: any = {
      tipo: 'contenido_educativo',
      estado: 'PUBLICADO'
    };

    if (filters.categoria_multimedia) {
      where.configuracion = {
        configuracion_adicional: {
          path: ['categoria_multimedia'],
          equals: filters.categoria_multimedia
        }
      };
    }

    if (filters.nivel) {
      where.configuracion = {
        ...where.configuracion,
        configuracion_adicional: {
          ...where.configuracion?.configuracion_adicional,
          path: ['nivel'],
          equals: filters.nivel
        }
      };
    }

    const recomendaciones = await prisma.contenido.findMany({
      where,
      include: {
        autor: {
          select: {
            id: true,
            nombre: true
          }
        },
        configuracion: true,
        metricas: true
      },
      orderBy: [
        { metricas: { vistas: 'desc' } },
        { created_at: 'desc' }
      ],
      take: filters.limit * 2 // Obtener más para filtrar después
    });

    // Aplicar algoritmo de recomendación personalizada
    const scoredRecommendations = recomendaciones
      .map(item => {
        const config = item.configuracion?.configuracion_adicional as any;
        let score = 0;

        // Puntuación basada en preferencias del usuario
        if (userPreferences.categorias_preferidas.includes(config?.categoria_multimedia)) {
          score += 3;
        }
        if (userPreferences.niveles_preferidos.includes(config?.nivel)) {
          score += 2;
        }
        if (userPreferences.tipos_preferidos.includes(config?.tipo_educativo)) {
          score += 2;
        }

        // Puntuación basada en popularidad
        score += (item.metricas?.vistas || 0) * 0.01;
        score += (item.metricas?.likes || 0) * 0.1;

        // Penalizar contenido muy antiguo
        const daysSinceCreation = (Date.now() - item.created_at.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceCreation > 365) {
          score *= 0.8;
        }

        return {
          ...item,
          recommendation_score: score,
          tipo_educativo: config?.tipo_educativo,
          categoria_multimedia: config?.categoria_multimedia,
          nivel: config?.nivel,
          tiempo_lectura: config?.tiempo_lectura,
          tags: config?.tags || []
        };
      })
      .sort((a, b) => b.recommendation_score - a.recommendation_score)
      .slice(0, filters.limit);

    return scoredRecommendations;
  }

  /**
   * Analiza las preferencias del usuario basadas en su historial
   */
  private analyzeUserPreferences(userHistory: any[]) {
    const categorias: { [key: string]: number } = {};
    const niveles: { [key: string]: number } = {};
    const tipos: { [key: string]: number } = {};

    userHistory.forEach(item => {
      const config = item.configuracion?.configuracion_adicional as any;
      if (config) {
        categorias[config.categoria_multimedia] = (categorias[config.categoria_multimedia] || 0) + 1;
        niveles[config.nivel] = (niveles[config.nivel] || 0) + 1;
        tipos[config.tipo_educativo] = (tipos[config.tipo_educativo] || 0) + 1;
      }
    });

    return {
      categorias_preferidas: Object.keys(categorias).sort((a, b) => (categorias[b] || 0) - (categorias[a] || 0)),
      niveles_preferidos: Object.keys(niveles).sort((a, b) => (niveles[b] || 0) - (niveles[a] || 0)),
      tipos_preferidos: Object.keys(tipos).sort((a, b) => (tipos[b] || 0) - (tipos[a] || 0))
    };
  }

  /**
   * Registra una vista de contenido educativo
   */
  async trackContentView(data: TrackContentViewInput) {
    const contenido = await prisma.contenido.findUnique({
      where: { id: data.contenido_id },
      include: { metricas: true }
    });

    if (!contenido || contenido.tipo !== 'contenido_educativo') {
      throw new Error('Contenido educativo no encontrado');
    }

    // Actualizar métricas de vistas
    await prisma.contenidoMetricas.upsert({
      where: { contenido_id: data.contenido_id },
      create: {
        contenido_id: data.contenido_id,
        vistas: 1,
        likes: 0,
        comentarios_count: 0,
        shares: 0,
        ultima_vista: new Date(),
        primera_publicacion: contenido.fecha_publicacion
      },
      update: {
        vistas: { increment: 1 },
        ultima_vista: new Date()
      }
    });

    // En una implementación real, aquí registraríamos la vista específica del usuario
    // para análisis más detallados y recomendaciones personalizadas

    return { success: true };
  }

  /**
   * Obtiene métricas de contenido educativo
   */
  async getEducationalContentMetrics(filters: ContenidoEducativoMetricsFilters) {
    const fechaInicio = filters.fecha_desde 
      ? new Date(filters.fecha_desde)
      : this.getDateByPeriod(filters.periodo);
    
    const fechaFin = filters.fecha_hasta 
      ? new Date(filters.fecha_hasta)
      : new Date();

    const where: any = {
      tipo: 'contenido_educativo',
      created_at: {
        gte: fechaInicio,
        lte: fechaFin
      }
    };

    // Filtros específicos
    if (filters.tipo || filters.categoria_multimedia) {
      where.configuracion = {
        configuracion_adicional: {}
      };
      
      if (filters.tipo) {
        where.configuracion.configuracion_adicional.path = ['tipo_educativo'];
        where.configuracion.configuracion_adicional.equals = filters.tipo;
      }
      
      if (filters.categoria_multimedia) {
        where.configuracion.configuracion_adicional.path = ['categoria_multimedia'];
        where.configuracion.configuracion_adicional.equals = filters.categoria_multimedia;
      }
    }

    const [
      contenidoMasVisto,
      contenidoMasLiked,
      totalContenido,
      totalVistas,
      totalLikes,
      promedioTiempoLectura
    ] = await Promise.all([
      // Contenido más visto
      prisma.contenido.findMany({
        where,
        include: {
          autor: { select: { id: true, nombre: true } },
          configuracion: true,
          metricas: true
        },
        orderBy: { metricas: { vistas: 'desc' } },
        take: filters.limit
      }),
      
      // Contenido más liked
      prisma.contenido.findMany({
        where,
        include: {
          autor: { select: { id: true, nombre: true } },
          configuracion: true,
          metricas: true
        },
        orderBy: { metricas: { likes: 'desc' } },
        take: filters.limit
      }),
      
      // Total de contenido
      prisma.contenido.count({ where }),
      
      // Total de vistas
      prisma.contenidoMetricas.aggregate({
        where: {
          contenido: where
        },
        _sum: { vistas: true }
      }),
      
      // Total de likes
      prisma.contenidoMetricas.aggregate({
        where: {
          contenido: where
        },
        _sum: { likes: true }
      }),
      
      // Promedio de tiempo de lectura
      prisma.contenido.findMany({
        where,
        include: { configuracion: true }
      })
    ]);

    // Calcular promedio de tiempo de lectura
    const tiemposLectura = promedioTiempoLectura
      .map(item => (item.configuracion?.configuracion_adicional as any)?.tiempo_lectura)
      .filter(tiempo => tiempo && tiempo > 0);
    
    const promedioTiempo = tiemposLectura.length > 0 
      ? tiemposLectura.reduce((sum, tiempo) => sum + tiempo, 0) / tiemposLectura.length
      : 0;

    // Estadísticas por categoría
    const estadisticasPorCategoria = await this.getStatsByCategory(where);

    return {
      resumen: {
        total_contenido: totalContenido,
        total_vistas: totalVistas._sum.vistas || 0,
        total_likes: totalLikes._sum.likes || 0,
        promedio_tiempo_lectura: Math.round(promedioTiempo),
        periodo: {
          inicio: fechaInicio,
          fin: fechaFin
        }
      },
      contenido_mas_visto: contenidoMasVisto.map(this.formatEducationalContent),
      contenido_mas_liked: contenidoMasLiked.map(this.formatEducationalContent),
      estadisticas_por_categoria: estadisticasPorCategoria
    };
  }

  /**
   * Obtiene estadísticas por categoría multimedia
   */
  private async getStatsByCategory(baseWhere: any) {
    const categorias = ['fotografia', 'video', 'audio', 'cine', 'general'];
    const stats = [];

    for (const categoria of categorias) {
      const where = {
        ...baseWhere,
        configuracion: {
          configuracion_adicional: {
            path: ['categoria_multimedia'],
            equals: categoria
          }
        }
      };

      const [count, vistas, likes] = await Promise.all([
        prisma.contenido.count({ where }),
        prisma.contenidoMetricas.aggregate({
          where: { contenido: where },
          _sum: { vistas: true }
        }),
        prisma.contenidoMetricas.aggregate({
          where: { contenido: where },
          _sum: { likes: true }
        })
      ]);

      stats.push({
        categoria,
        total_contenido: count,
        total_vistas: vistas._sum.vistas || 0,
        total_likes: likes._sum.likes || 0
      });
    }

    return stats;
  }

  /**
   * Formatea contenido educativo para respuesta
   */
  private formatEducationalContent(item: any) {
    const config = item.configuracion?.configuracion_adicional as any;
    return {
      ...item,
      tipo_educativo: config?.tipo_educativo,
      categoria_multimedia: config?.categoria_multimedia,
      nivel: config?.nivel,
      tiempo_lectura: config?.tiempo_lectura,
      tags: config?.tags || [],
      recursos_adicionales: config?.recursos_adicionales || []
    };
  }

  /**
   * Obtiene fecha de inicio según el período
   */
  private getDateByPeriod(periodo: string): Date {
    const now = new Date();
    switch (periodo) {
      case 'semana':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'mes':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'trimestre':
        return new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
      case 'año':
        return new Date(now.getFullYear(), 0, 1);
      default:
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }
  }

  // ============================================================================
  // MÉTODOS DE DIGEST DEL NEWSLETTER
  // ============================================================================

  /**
   * Genera digest semanal para el newsletter
   */
  async generateWeeklyDigest(data: NewsletterDigestInput) {
    const fechaInicio = new Date(data.fecha_inicio);
    const fechaFin = new Date(data.fecha_fin);

    const digest: any = {
      fecha_generacion: new Date(),
      periodo: {
        inicio: fechaInicio,
        fin: fechaFin
      }
    };

    // Contenido educativo destacado
    if (data.incluir_contenido_educativo) {
      const contenidoEducativo = await prisma.contenido.findMany({
        where: {
          tipo: 'contenido_educativo',
          estado: 'PUBLICADO',
          fecha_publicacion: {
            gte: fechaInicio,
            lte: fechaFin
          }
        },
        include: {
          autor: { select: { id: true, nombre: true } },
          configuracion: true,
          metricas: true
        },
        orderBy: { metricas: { vistas: 'desc' } },
        take: data.max_contenido
      });

      digest.contenido_educativo = contenidoEducativo.map(this.formatEducationalContent);
    }

    // Concursos activos
    if (data.incluir_concursos) {
      const concursosActivos = await prisma.concurso.findMany({
        where: {
          OR: [
            { status: 'ACTIVO' },
            { 
              status: 'PROXIMAMENTE',
              fecha_inicio: {
                gte: fechaInicio,
                lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Próximos 30 días
              }
            }
          ]
        },
        include: {
          categorias: true
        },
        orderBy: { fecha_inicio: 'asc' },
        take: data.max_concursos
      });

      digest.concursos_activos = concursosActivos;
    }

    // Ganadores recientes
    if (data.incluir_ganadores) {
      const concursosFinalizados = await prisma.concurso.findMany({
        where: {
          status: 'FINALIZADO',
          fecha_final: {
            gte: fechaInicio,
            lte: fechaFin
          }
        },
        include: {
          medios: {
            include: {
              usuario: { select: { id: true, nombre: true } },
              categoria: true
            },
            take: 3 // Top 3 por concurso
          }
        },
        take: 3
      });

      digest.ganadores_recientes = concursosFinalizados;
    }

    return digest;
  }

  /**
   * Envía digest a todos los suscriptores activos
   */
  async sendDigestToSubscribers(digest: any) {
    const suscriptoresActivos = await prisma.newsletterSuscriptor.findMany({
      where: {
        activo: true,
        confirmado: true
      }
    });

    // En una implementación real, aquí integraríamos con un servicio de email
    // como SendGrid, Resend, etc.
    
    console.log(`Enviando digest a ${suscriptoresActivos.length} suscriptores`);
    console.log('Digest:', JSON.stringify(digest, null, 2));

    // Simular envío exitoso
    return {
      enviados: suscriptoresActivos.length,
      fallidos: 0,
      fecha_envio: new Date()
    };
  }

  /**
   * Obtiene contenido popular para incluir en el digest
   */
  async getPopularContentForDigest(limit: number = 5) {
    const fechaInicio = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Última semana

    return await prisma.contenido.findMany({
      where: {
        tipo: 'contenido_educativo',
        estado: 'PUBLICADO',
        created_at: { gte: fechaInicio }
      },
      include: {
        autor: { select: { id: true, nombre: true } },
        configuracion: true,
        metricas: true
      },
      orderBy: [
        { metricas: { vistas: 'desc' } },
        { metricas: { likes: 'desc' } }
      ],
      take: limit
    });
  }
}

export const newsletterService = new NewsletterService();