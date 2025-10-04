import { PrismaClient, Prisma, EstadoContenido } from '@prisma/client';
import { 
  CreateContenido, 
  UpdateContenido, 
  ContentFilters, 
  ContenidoConfiguracion,
  ContenidoSEO,
  ContenidoMetricas,
  ContenidoTaxonomia,
  TipoContenido,
  ContentTemplate
} from '../schemas/cms.schemas';

const prisma = new PrismaClient();

export class CMSService {
  
  /**
   * Genera un slug único basado en el título
   */
  private async generateUniqueSlug(titulo: string, excludeId?: number): Promise<string> {
    const baseSlug = titulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
      .replace(/\s+/g, '-') // Reemplazar espacios con guiones
      .replace(/-+/g, '-') // Remover guiones duplicados
      .replace(/^-|-$/g, ''); // Remover guiones al inicio y final

    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await prisma.contenido.findFirst({
        where: {
          slug,
          ...(excludeId && { id: { not: excludeId } })
        }
      });

      if (!existing) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  /**
   * Obtiene contenido con filtros y paginación
   */
  async getContent(filters: ContentFilters, includeRelations = true) {
    const {
      tipo,
      categoria,
      etiqueta,
      autor,
      estado,
      busqueda,
      activo,
      destacado,
      page,
      limit,
      sort_by,
      sort_order
    } = filters;

    // Construir condiciones WHERE
    const whereConditions: Prisma.ContenidoWhereInput = {};

    if (tipo) {
      whereConditions.tipo = tipo;
    }

    if (autor) {
      whereConditions.autor_id = autor;
    }

    if (estado) {
      whereConditions.estado = estado as EstadoContenido;
    }

    if (busqueda) {
      whereConditions.OR = [
        { titulo: { contains: busqueda, mode: 'insensitive' } },
        { contenido: { contains: busqueda, mode: 'insensitive' } },
        { resumen: { contains: busqueda, mode: 'insensitive' } }
      ];
    }

    // Filtros por taxonomía
    if (categoria || etiqueta) {
      whereConditions.taxonomia = {
        some: {
          ...(categoria && { categoria: { contains: categoria, mode: 'insensitive' } }),
          ...(etiqueta && { etiqueta: { contains: etiqueta, mode: 'insensitive' } })
        }
      };
    }

    // Filtros por configuración
    if (activo !== undefined || destacado !== undefined) {
      whereConditions.configuracion = {
        ...(activo !== undefined && { activo }),
        ...(destacado !== undefined && { destacado })
      };
    }

    // Configurar ordenamiento
    const orderBy: Prisma.ContenidoOrderByWithRelationInput = {};
    if (sort_by === 'vistas') {
      orderBy.metricas = { vistas: sort_order };
    } else {
      orderBy[sort_by] = sort_order;
    }

    // Configurar inclusiones
    const include = includeRelations ? {
      autor: {
        select: {
          id: true,
          nombre: true,
          email: true,
          picture_url: true
        }
      },
      updated_by_user: {
        select: {
          id: true,
          nombre: true,
          email: true
        }
      },
      configuracion: true,
      seo: true,
      metricas: true,
      taxonomia: true,
      _count: {
        select: {
          comentarios: true,
          likes: true,
          reportes: true
        }
      }
    } : {
      autor: {
        select: {
          id: true,
          nombre: true,
          email: true,
          picture_url: true
        }
      }
    };

    // Ejecutar consultas
    const [contenido, total] = await Promise.all([
      prisma.contenido.findMany({
        where: whereConditions,
        include,
        orderBy,
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.contenido.count({ where: whereConditions })
    ]);

    return {
      contenido,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    };
  }

  /**
   * Obtiene contenido por slug
   */
  async getContentBySlug(slug: string, includeRelations = true) {
    const include = includeRelations ? {
      autor: {
        select: {
          id: true,
          nombre: true,
          email: true,
          picture_url: true
        }
      },
      updated_by_user: {
        select: {
          id: true,
          nombre: true,
          email: true
        }
      },
      configuracion: true,
      seo: true,
      metricas: true,
      taxonomia: true,
      comentarios: {
        where: { aprobado: true },
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              picture_url: true
            }
          },
          replies: {
            include: {
              usuario: {
                select: {
                  id: true,
                  nombre: true,
                  picture_url: true
                }
              }
            }
          }
        },
        orderBy: { fecha_comentario: 'desc' as const }
      },
      _count: {
        select: {
          comentarios: true,
          likes: true,
          reportes: true
        }
      }
    } : {
      autor: {
        select: {
          id: true,
          nombre: true,
          email: true,
          picture_url: true
        }
      }
    };

    const contenido = await prisma.contenido.findUnique({
      where: { slug },
      include
    });

    if (!contenido) {
      throw new Error('Contenido no encontrado');
    }

    // Incrementar contador de vistas si tiene métricas
    if (includeRelations && 'metricas' in contenido && contenido.metricas) {
      await this.updateContentMetrics(contenido.id, {
        vistas: contenido.metricas.vistas + 1,
        ultima_vista: new Date()
      });
    }

    return contenido;
  }

  /**
   * Crea nuevo contenido
   */
  async createContent(data: CreateContenido, autorId: string) {
    // Generar slug si no se proporciona
    const slug = data.slug || await this.generateUniqueSlug(data.titulo);

    // Verificar que el slug sea único
    const existingContent = await prisma.contenido.findUnique({
      where: { slug }
    });

    if (existingContent) {
      throw new Error('Ya existe contenido con este slug');
    }

    // Crear contenido en transacción
    return await prisma.$transaction(async (tx) => {
      // Crear contenido principal
      const contenido = await tx.contenido.create({
        data: {
          tipo: data.tipo,
          titulo: data.titulo,
          contenido: data.contenido || null,
          resumen: data.resumen || null,
          imagen_destacada: data.imagen_destacada || null,
          estado: data.estado,
          slug,
          autor_id: autorId,
          fecha_publicacion: data.fecha_publicacion ? new Date(data.fecha_publicacion) : null
        },
        include: {
          autor: {
            select: {
              id: true,
              nombre: true,
              email: true,
              picture_url: true
            }
          }
        }
      });

      // Crear configuración por defecto
      await tx.contenidoConfiguracion.create({
        data: {
          contenido_id: contenido.id,
          activo: true,
          orden: 0,
          permite_comentarios: true,
          destacado: false
        }
      });

      // Crear métricas por defecto
      await tx.contenidoMetricas.create({
        data: {
          contenido_id: contenido.id,
          vistas: 0,
          likes: 0,
          comentarios_count: 0,
          shares: 0,
          primera_publicacion: contenido.estado === 'PUBLICADO' ? new Date() : null
        }
      });

      // Crear SEO por defecto
      await tx.contenidoSEO.create({
        data: {
          contenido_id: contenido.id,
          seo_titulo: data.titulo.substring(0, 60),
          seo_descripcion: data.resumen?.substring(0, 160) || null,
          seo_keywords: []
        }
      });

      return contenido;
    });
  }

  /**
   * Actualiza contenido existente
   */
  async updateContent(id: number, data: UpdateContenido, updatedBy: string) {
    // Verificar que el contenido existe
    const existingContent = await prisma.contenido.findUnique({
      where: { id }
    });

    if (!existingContent) {
      throw new Error('Contenido no encontrado');
    }

    // Generar nuevo slug si se cambió el título
    let slug = data.slug;
    if (data.titulo && data.titulo !== existingContent.titulo && !slug) {
      slug = await this.generateUniqueSlug(data.titulo, id);
    }

    // Verificar unicidad del slug si se proporciona uno nuevo
    if (slug && slug !== existingContent.slug) {
      const existingSlug = await prisma.contenido.findUnique({
        where: { slug }
      });

      if (existingSlug && existingSlug.id !== id) {
        throw new Error('Ya existe contenido con este slug');
      }
    }

    // Actualizar contenido
    const updateData: any = {
      updated_by: updatedBy
    };

    if (data.tipo) updateData.tipo = data.tipo;
    if (data.titulo) updateData.titulo = data.titulo;
    if (data.contenido !== undefined) updateData.contenido = data.contenido || null;
    if (data.resumen !== undefined) updateData.resumen = data.resumen || null;
    if (data.imagen_destacada !== undefined) updateData.imagen_destacada = data.imagen_destacada || null;
    if (data.estado) updateData.estado = data.estado;
    if (slug) updateData.slug = slug;
    if (data.fecha_publicacion !== undefined) {
      updateData.fecha_publicacion = data.fecha_publicacion ? new Date(data.fecha_publicacion) : null;
    }

    const updatedContent = await prisma.contenido.update({
      where: { id },
      data: updateData,
      include: {
        autor: {
          select: {
            id: true,
            nombre: true,
            email: true,
            picture_url: true
          }
        },
        updated_by_user: {
          select: {
            id: true,
            nombre: true,
            email: true
          }
        },
        configuracion: true,
        seo: true,
        metricas: true,
        taxonomia: true
      }
    });

    // Actualizar fecha de primera publicación si se está publicando por primera vez
    if (data.estado === 'PUBLICADO' && existingContent.estado !== 'PUBLICADO') {
      await this.updateContentMetrics(id, {
        primera_publicacion: new Date()
      });
    }

    return updatedContent;
  }

  /**
   * Elimina contenido
   */
  async deleteContent(id: number, _userId: string) {
    // Verificar que el contenido existe
    const existingContent = await prisma.contenido.findUnique({
      where: { id }
    });

    if (!existingContent) {
      throw new Error('Contenido no encontrado');
    }

    // Eliminar en transacción (las relaciones se eliminan por CASCADE)
    await prisma.contenido.delete({
      where: { id }
    });

    return { message: 'Contenido eliminado exitosamente' };
  }

  /**
   * Publica contenido
   */
  async publishContent(id: number, userId: string) {
    const contenido = await prisma.contenido.findUnique({
      where: { id },
      include: { metricas: true }
    });

    if (!contenido) {
      throw new Error('Contenido no encontrado');
    }

    const updatedContent = await prisma.contenido.update({
      where: { id },
      data: {
        estado: 'PUBLICADO',
        fecha_publicacion: new Date(),
        updated_by: userId
      }
    });

    // Actualizar métricas si es la primera publicación
    if (!contenido.metricas?.primera_publicacion) {
      await this.updateContentMetrics(id, {
        primera_publicacion: new Date()
      });
    }

    return updatedContent;
  }

  /**
   * Actualiza configuración de contenido
   */
  async updateContentConfig(contentId: number, config: ContenidoConfiguracion) {
    const updateData = {
      activo: config.activo,
      orden: config.orden,
      permite_comentarios: config.permite_comentarios,
      destacado: config.destacado,
      configuracion_adicional: config.configuracion_adicional as any
    };

    return await prisma.contenidoConfiguracion.upsert({
      where: { contenido_id: contentId },
      update: updateData,
      create: {
        contenido_id: contentId,
        ...updateData
      }
    });
  }

  /**
   * Actualiza SEO de contenido
   */
  async updateContentSEO(contentId: number, seo: ContenidoSEO) {
    const updateData = {
      seo_titulo: seo.seo_titulo || null,
      seo_descripcion: seo.seo_descripcion || null,
      seo_keywords: seo.seo_keywords,
      meta_tags: seo.meta_tags as any,
      structured_data: seo.structured_data as any
    };

    return await prisma.contenidoSEO.upsert({
      where: { contenido_id: contentId },
      update: updateData,
      create: {
        contenido_id: contentId,
        ...updateData
      }
    });
  }

  /**
   * Actualiza métricas de contenido
   */
  async updateContentMetrics(contentId: number, metricas: Partial<ContenidoMetricas>) {
    const updateData: any = {};
    
    if (metricas.vistas !== undefined) updateData.vistas = metricas.vistas;
    if (metricas.likes !== undefined) updateData.likes = metricas.likes;
    if (metricas.comentarios_count !== undefined) updateData.comentarios_count = metricas.comentarios_count;
    if (metricas.shares !== undefined) updateData.shares = metricas.shares;
    if (metricas.ultima_vista !== undefined) {
      updateData.ultima_vista = metricas.ultima_vista ? new Date(metricas.ultima_vista) : null;
    }
    if (metricas.primera_publicacion !== undefined) {
      updateData.primera_publicacion = metricas.primera_publicacion ? new Date(metricas.primera_publicacion) : null;
    }

    return await prisma.contenidoMetricas.upsert({
      where: { contenido_id: contentId },
      update: updateData,
      create: {
        contenido_id: contentId,
        vistas: 0,
        likes: 0,
        comentarios_count: 0,
        shares: 0,
        ...updateData
      }
    });
  }

  /**
   * Actualiza taxonomía de contenido
   */
  async updateContentTaxonomy(contentId: number, taxonomia: ContenidoTaxonomia[]) {
    return await prisma.$transaction(async (tx) => {
      // Eliminar taxonomía existente
      await tx.contenidoTaxonomia.deleteMany({
        where: { contenido_id: contentId }
      });

      // Crear nueva taxonomía
      if (taxonomia.length > 0) {
        await tx.contenidoTaxonomia.createMany({
          data: taxonomia.map(item => ({
            contenido_id: contentId,
            categoria: item.categoria || null,
            etiqueta: item.etiqueta || null,
            tipo_taxonomia: item.tipo_taxonomia
          }))
        });
      }

      // Retornar taxonomía actualizada
      return await tx.contenidoTaxonomia.findMany({
        where: { contenido_id: contentId }
      });
    });
  }

  /**
   * Obtiene categorías únicas
   */
  async getCategories(tipo?: TipoContenido): Promise<string[]> {
    const whereCondition = tipo ? {
      contenido: { tipo }
    } : {};

    const categories = await prisma.contenidoTaxonomia.findMany({
      where: {
        tipo_taxonomia: 'categoria',
        categoria: { not: null },
        ...whereCondition
      },
      select: { categoria: true },
      distinct: ['categoria']
    });

    return categories
      .map(cat => cat.categoria)
      .filter((cat): cat is string => cat !== null)
      .sort();
  }

  /**
   * Obtiene etiquetas con autocompletado
   */
  async getTags(query?: string, limit = 10): Promise<string[]> {
    const whereCondition = query ? {
      etiqueta: {
        contains: query,
        mode: 'insensitive' as const
      }
    } : {};

    const tags = await prisma.contenidoTaxonomia.findMany({
      where: {
        tipo_taxonomia: 'etiqueta',
        etiqueta: { not: null },
        ...whereCondition
      },
      select: { etiqueta: true },
      distinct: ['etiqueta'],
      take: limit,
      orderBy: { etiqueta: 'asc' }
    });

    return tags
      .map(tag => tag.etiqueta)
      .filter((tag): tag is string => tag !== null);
  }

  /**
   * Obtiene métricas de contenido
   */
  async getContentMetrics(contentId: number) {
    return await prisma.contenidoMetricas.findUnique({
      where: { contenido_id: contentId }
    });
  }

  /**
   * Obtiene tipos de contenido disponibles
   */
  getContentTypes() {
    return [
      {
        tipo: 'pagina_estatica',
        nombre: 'Página Estática',
        descripcion: 'Contenido estático para la landing page',
        campos_requeridos: ['titulo', 'contenido'],
        campos_opcionales: ['resumen', 'imagen_destacada'],
        permite_comentarios: false,
        tiene_orden: true,
        plantilla_defecto: 'pagina_estatica'
      },
      {
        tipo: 'blog_post',
        nombre: 'Post de Blog',
        descripcion: 'Artículos del blog de la comunidad',
        campos_requeridos: ['titulo', 'contenido'],
        campos_opcionales: ['resumen', 'imagen_destacada'],
        permite_comentarios: true,
        tiene_orden: false,
        plantilla_defecto: 'blog_post'
      },
      {
        tipo: 'seccion_cms',
        nombre: 'Sección CMS',
        descripcion: 'Secciones personalizables del CMS',
        campos_requeridos: ['titulo'],
        campos_opcionales: ['contenido', 'resumen', 'imagen_destacada'],
        permite_comentarios: false,
        tiene_orden: true,
        plantilla_defecto: 'seccion_cms'
      }
    ];
  }

  /**
   * Obtiene plantilla de contenido por tipo
   */
  getContentTemplate(tipo: TipoContenido): ContentTemplate {
    const templates: Record<TipoContenido, ContentTemplate> = {
      pagina_estatica: {
        tipo: 'pagina_estatica',
        campos: [
          { nombre: 'titulo', tipo: 'text', requerido: true },
          { nombre: 'contenido', tipo: 'wysiwyg', requerido: true },
          { nombre: 'resumen', tipo: 'textarea', requerido: false },
          { nombre: 'imagen_destacada', tipo: 'image', requerido: false },
          { nombre: 'orden', tipo: 'text', requerido: false }
        ],
        configuracion: {
          permite_comentarios: false,
          tiene_orden: true,
          seo_automatico: true
        }
      },
      blog_post: {
        tipo: 'blog_post',
        campos: [
          { nombre: 'titulo', tipo: 'text', requerido: true },
          { nombre: 'contenido', tipo: 'wysiwyg', requerido: true },
          { nombre: 'resumen', tipo: 'textarea', requerido: false },
          { nombre: 'imagen_destacada', tipo: 'image', requerido: false },
          { nombre: 'categorias', tipo: 'multiselect', requerido: false },
          { nombre: 'etiquetas', tipo: 'multiselect', requerido: false }
        ],
        configuracion: {
          permite_comentarios: true,
          tiene_orden: false,
          seo_automatico: true,
          social_sharing: true
        }
      },
      seccion_cms: {
        tipo: 'seccion_cms',
        campos: [
          { nombre: 'titulo', tipo: 'text', requerido: true },
          { nombre: 'contenido', tipo: 'wysiwyg', requerido: false },
          { nombre: 'configuracion_adicional', tipo: 'textarea', requerido: false },
          { nombre: 'orden', tipo: 'text', requerido: false }
        ],
        configuracion: {
          permite_comentarios: false,
          tiene_orden: true,
          personalizable: true
        }
      }
    };

    return templates[tipo];
  }

  /**
   * Valida permisos de CONTENT_ADMIN
   */
  async validateContentAdmin(userId: string): Promise<boolean> {
    const user = await prisma.usuario.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    return user?.role === 'CONTENT_ADMIN' || user?.role === 'ADMIN';
  }

  /**
   * Genera preview de contenido
   */
  async previewContent(id: number): Promise<string> {
    const contenido = await prisma.contenido.findUnique({
      where: { id },
      include: {
        configuracion: true,
        seo: true,
        taxonomia: true
      }
    });

    if (!contenido) {
      throw new Error('Contenido no encontrado');
    }

    // Generar URL de preview (esto podría ser más sofisticado)
    const baseUrl = process.env['FRONTEND_URL'] || 'http://localhost:3002';
    return `${baseUrl}/preview/${contenido.slug}?token=${Buffer.from(id.toString()).toString('base64')}`;
  }
}

export const cmsService = new CMSService();