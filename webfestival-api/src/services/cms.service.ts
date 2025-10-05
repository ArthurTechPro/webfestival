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
    ContentTemplate,
    AdvancedSearch,
    AnalyticsOverview,
    ContentPerformance,
    TaxonomyStats,
    GrowthTrends,
    EngagementMetrics
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

    // ============================================================================
    // MÉTODOS DE BÚSQUEDA AVANZADA Y ANALYTICS
    // ============================================================================

    /**
     * Búsqueda avanzada por múltiples criterios
     */
    async advancedSearch(params: AdvancedSearch) {
        const {
            q,
            tipo,
            categorias,
            etiquetas,
            autor,
            estado,
            destacado,
            fecha_desde,
            fecha_hasta,
            min_vistas,
            min_likes,
            sort_by,
            sort_order,
            page,
            limit
        } = params;

        // Construir condiciones WHERE complejas
        const whereConditions: Prisma.ContenidoWhereInput = {};

        // Filtro por tipo
        if (tipo) {
            whereConditions.tipo = tipo;
        }

        // Filtro por autor
        if (autor) {
            whereConditions.autor_id = autor;
        }

        // Filtro por estado
        if (estado) {
            whereConditions.estado = estado as EstadoContenido;
        }

        // Búsqueda de texto general
        if (q) {
            whereConditions.OR = [
                { titulo: { contains: q, mode: 'insensitive' } },
                { contenido: { contains: q, mode: 'insensitive' } },
                { resumen: { contains: q, mode: 'insensitive' } }
            ];
        }

        // Filtros por fechas
        if (fecha_desde || fecha_hasta) {
            whereConditions.created_at = {};
            if (fecha_desde) {
                whereConditions.created_at.gte = new Date(fecha_desde);
            }
            if (fecha_hasta) {
                whereConditions.created_at.lte = new Date(fecha_hasta);
            }
        }

        // Filtros por taxonomía (categorías y etiquetas)
        if (categorias?.length || etiquetas?.length) {
            const taxonomyConditions: Prisma.ContenidoTaxonomiaWhereInput[] = [];

            if (categorias?.length) {
                taxonomyConditions.push({
                    tipo_taxonomia: 'categoria',
                    categoria: { in: categorias }
                });
            }

            if (etiquetas?.length) {
                taxonomyConditions.push({
                    tipo_taxonomia: 'etiqueta',
                    etiqueta: { in: etiquetas }
                });
            }

            whereConditions.taxonomia = {
                some: {
                    OR: taxonomyConditions
                }
            };
        }

        // Filtros por configuración
        if (destacado !== undefined) {
            whereConditions.configuracion = {
                destacado
            };
        }

        // Filtros por métricas
        if (min_vistas !== undefined || min_likes !== undefined) {
            whereConditions.metricas = {};
            if (min_vistas !== undefined) {
                whereConditions.metricas.vistas = { gte: min_vistas };
            }
            if (min_likes !== undefined) {
                whereConditions.metricas.likes = { gte: min_likes };
            }
        }

        // Configurar ordenamiento
        const orderBy: Prisma.ContenidoOrderByWithRelationInput = {};
        if (sort_by === 'vistas' || sort_by === 'likes' || sort_by === 'comentarios_count') {
            orderBy.metricas = { [sort_by]: sort_order };
        } else {
            orderBy[sort_by] = sort_order;
        }

        // Ejecutar consultas
        const [contenido, total] = await Promise.all([
            prisma.contenido.findMany({
                where: whereConditions,
                include: {
                    autor: {
                        select: {
                            id: true,
                            nombre: true,
                            email: true,
                            picture_url: true
                        }
                    },
                    configuracion: true,
                    metricas: true,
                    taxonomia: true,
                    _count: {
                        select: {
                            comentarios: true,
                            likes: true
                        }
                    }
                },
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
            hasPrev: page > 1,
            searchParams: params
        };
    }

    /**
     * Obtiene métricas generales del CMS
     */
    async getAnalyticsOverview(params: AnalyticsOverview) {
        const { tipo, fecha_inicio, fecha_fin } = params;

        // Construir filtros de fecha
        const dateFilter: any = {};
        if (fecha_inicio || fecha_fin) {
            if (fecha_inicio) dateFilter.gte = new Date(fecha_inicio);
            if (fecha_fin) dateFilter.lte = new Date(fecha_fin);
        }

        // Filtro por tipo
        const tipoFilter = tipo ? { tipo } : {};

        // Obtener métricas básicas
        const [
            totalContenido,
            contenidoPublicado,
            contenidoBorrador,
            totalVistas,
            totalLikes,
            totalComentarios,
            contenidoReciente
        ] = await Promise.all([
            // Total de contenido
            prisma.contenido.count({
                where: {
                    ...tipoFilter,
                    ...(Object.keys(dateFilter).length > 0 && { created_at: dateFilter })
                }
            }),

            // Contenido publicado
            prisma.contenido.count({
                where: {
                    ...tipoFilter,
                    estado: 'PUBLICADO',
                    ...(Object.keys(dateFilter).length > 0 && { created_at: dateFilter })
                }
            }),

            // Contenido en borrador
            prisma.contenido.count({
                where: {
                    ...tipoFilter,
                    estado: 'BORRADOR',
                    ...(Object.keys(dateFilter).length > 0 && { created_at: dateFilter })
                }
            }),

            // Total de vistas
            prisma.contenidoMetricas.aggregate({
                _sum: { vistas: true },
                where: {
                    contenido: {
                        ...tipoFilter,
                        ...(Object.keys(dateFilter).length > 0 && { created_at: dateFilter })
                    }
                }
            }),

            // Total de likes
            prisma.contenidoMetricas.aggregate({
                _sum: { likes: true },
                where: {
                    contenido: {
                        ...tipoFilter,
                        ...(Object.keys(dateFilter).length > 0 && { created_at: dateFilter })
                    }
                }
            }),

            // Total de comentarios
            prisma.contenidoComentario.count({
                where: {
                    contenido: {
                        ...tipoFilter,
                        ...(Object.keys(dateFilter).length > 0 && { created_at: dateFilter })
                    }
                }
            }),

            // Contenido reciente (últimos 7 días)
            prisma.contenido.count({
                where: {
                    ...tipoFilter,
                    created_at: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    }
                }
            })
        ]);

        // Obtener distribución por tipo si no se especifica tipo
        let distribucionPorTipo = null;
        if (!tipo) {
            const whereClause = Object.keys(dateFilter).length > 0 ? { created_at: dateFilter } : {};
            const tiposCount = await prisma.contenido.groupBy({
                by: ['tipo'],
                _count: { id: true },
                where: whereClause
            });

            distribucionPorTipo = tiposCount.map(item => ({
                tipo: item.tipo,
                count: item._count?.id || 0
            }));
        }

        return {
            resumen: {
                total_contenido: totalContenido,
                contenido_publicado: contenidoPublicado,
                contenido_borrador: contenidoBorrador,
                contenido_reciente: contenidoReciente,
                total_vistas: totalVistas._sum.vistas || 0,
                total_likes: totalLikes._sum.likes || 0,
                total_comentarios: totalComentarios
            },
            distribucion_por_tipo: distribucionPorTipo,
            periodo: {
                fecha_inicio: fecha_inicio || null,
                fecha_fin: fecha_fin || null
            }
        };
    }

    /**
     * Obtiene métricas de rendimiento de contenido
     */
    async getContentPerformance(params: ContentPerformance) {
        const { tipo, limit, metric } = params;

        const tipoFilter = tipo ? { tipo } : {};

        // Configurar ordenamiento según la métrica
        const orderBy: any = {};
        orderBy.metricas = { [metric]: 'desc' };

        const topContent = await prisma.contenido.findMany({
            where: {
                ...tipoFilter,
                estado: 'PUBLICADO'
            },
            include: {
                autor: {
                    select: {
                        id: true,
                        nombre: true,
                        email: true
                    }
                },
                metricas: true,
                taxonomia: true
            },
            orderBy,
            take: limit
        });

        // Calcular métricas promedio
        const avgMetrics = await prisma.contenidoMetricas.aggregate({
            _avg: {
                vistas: true,
                likes: true,
                comentarios_count: true,
                shares: true
            },
            where: {
                contenido: {
                    ...tipoFilter,
                    estado: 'PUBLICADO'
                }
            }
        });

        return {
            top_content: topContent,
            metricas_promedio: {
                vistas_promedio: Math.round(avgMetrics._avg.vistas || 0),
                likes_promedio: Math.round(avgMetrics._avg.likes || 0),
                comentarios_promedio: Math.round(avgMetrics._avg.comentarios_count || 0),
                shares_promedio: Math.round(avgMetrics._avg.shares || 0)
            },
            parametros: params
        };
    }

    /**
     * Obtiene estadísticas de taxonomía
     */
    async getTaxonomyStats(params: TaxonomyStats) {
        const { tipo, limit } = params;

        const tipoFilter = tipo ? { contenido: { tipo } } : {};

        // Obtener categorías más populares
        const topCategorias = await prisma.contenidoTaxonomia.groupBy({
            by: ['categoria'],
            _count: { id: true },
            where: {
                tipo_taxonomia: 'categoria',
                categoria: { not: null },
                ...tipoFilter
            },
            orderBy: {
                _count: { id: 'desc' }
            },
            take: limit
        });

        // Obtener etiquetas más populares
        const topEtiquetas = await prisma.contenidoTaxonomia.groupBy({
            by: ['etiqueta'],
            _count: { id: true },
            where: {
                tipo_taxonomia: 'etiqueta',
                etiqueta: { not: null },
                ...tipoFilter
            },
            orderBy: {
                _count: { id: 'desc' }
            },
            take: limit
        });

        // Obtener totales
        const [totalCategorias, totalEtiquetas] = await Promise.all([
            prisma.contenidoTaxonomia.count({
                where: {
                    tipo_taxonomia: 'categoria',
                    categoria: { not: null },
                    ...tipoFilter
                }
            }),
            prisma.contenidoTaxonomia.count({
                where: {
                    tipo_taxonomia: 'etiqueta',
                    etiqueta: { not: null },
                    ...tipoFilter
                }
            })
        ]);

        return {
            categorias_populares: topCategorias.map(cat => ({
                categoria: cat.categoria,
                uso_count: cat._count.id
            })),
            etiquetas_populares: topEtiquetas.map(tag => ({
                etiqueta: tag.etiqueta,
                uso_count: tag._count.id
            })),
            totales: {
                total_categorias: totalCategorias,
                total_etiquetas: totalEtiquetas
            },
            parametros: params
        };
    }

    /**
     * Obtiene tendencias de crecimiento
     */
    async getGrowthTrends(params: GrowthTrends) {
        const { periodo, tipo, meses } = params;

        // Calcular fecha de inicio basada en el número de meses
        const fechaInicio = new Date();
        fechaInicio.setMonth(fechaInicio.getMonth() - meses);

        // Configurar agrupación según el periodo
        let dateFormat: string;
        switch (periodo) {
            case 'daily':
                dateFormat = 'YYYY-MM-DD';
                break;
            case 'weekly':
                dateFormat = 'YYYY-"W"WW';
                break;
            case 'monthly':
                dateFormat = 'YYYY-MM';
                break;
            case 'yearly':
                dateFormat = 'YYYY';
                break;
        }

        // Obtener datos de crecimiento usando SQL raw para mejor control
        const growthData = await prisma.$queryRaw`
      SELECT 
        TO_CHAR(created_at, ${dateFormat}) as periodo,
        COUNT(*)::int as contenido_creado,
        COUNT(CASE WHEN estado = 'PUBLICADO' THEN 1 END)::int as contenido_publicado
      FROM contenido 
      WHERE created_at >= ${fechaInicio}
        ${tipo ? Prisma.sql`AND tipo = ${tipo}` : Prisma.empty}
      GROUP BY TO_CHAR(created_at, ${dateFormat})
      ORDER BY periodo ASC
    ` as Array<{
            periodo: string;
            contenido_creado: number;
            contenido_publicado: number;
        }>;

        // Calcular métricas de crecimiento
        const totalCreado = growthData.reduce((sum, item) => sum + item.contenido_creado, 0);
        const totalPublicado = growthData.reduce((sum, item) => sum + item.contenido_publicado, 0);

        const promedioCreado = Math.round(totalCreado / Math.max(growthData.length, 1));
        const promedioPublicado = Math.round(totalPublicado / Math.max(growthData.length, 1));

        return {
            tendencias: growthData,
            resumen: {
                total_contenido_creado: totalCreado,
                total_contenido_publicado: totalPublicado,
                promedio_por_periodo: {
                    creado: promedioCreado,
                    publicado: promedioPublicado
                }
            },
            parametros: params
        };
    }

    /**
     * Obtiene métricas de engagement
     */
    async getEngagementMetrics(params: EngagementMetrics) {
        const { tipo, fecha_inicio, fecha_fin } = params;

        // Construir filtros
        const tipoFilter = tipo ? { tipo } : {};
        const dateFilter: any = {};
        if (fecha_inicio || fecha_fin) {
            if (fecha_inicio) dateFilter.gte = new Date(fecha_inicio);
            if (fecha_fin) dateFilter.lte = new Date(fecha_fin);
        }

        // Obtener métricas de engagement
        const [
            metricsAggregate,
            topEngagedContent,
            engagementByType,
            recentActivity
        ] = await Promise.all([
            // Métricas agregadas
            prisma.contenidoMetricas.aggregate({
                _sum: {
                    vistas: true,
                    likes: true,
                    comentarios_count: true,
                    shares: true
                },
                _avg: {
                    vistas: true,
                    likes: true,
                    comentarios_count: true,
                    shares: true
                },
                where: {
                    contenido: {
                        ...tipoFilter,
                        estado: 'PUBLICADO',
                        ...(Object.keys(dateFilter).length > 0 && { created_at: dateFilter })
                    }
                }
            }),

            // Contenido con mayor engagement
            prisma.contenido.findMany({
                where: {
                    ...tipoFilter,
                    estado: 'PUBLICADO',
                    ...(Object.keys(dateFilter).length > 0 && { created_at: dateFilter })
                },
                include: {
                    autor: {
                        select: { id: true, nombre: true }
                    },
                    metricas: true
                },
                orderBy: [
                    { metricas: { likes: 'desc' } },
                    { metricas: { vistas: 'desc' } }
                ],
                take: 10
            }),

            // Engagement por tipo (si no se especifica tipo) - usando query manual
            !tipo ? prisma.$queryRaw`
        SELECT 
          c.tipo,
          COALESCE(SUM(m.vistas), 0)::int as total_vistas,
          COALESCE(SUM(m.likes), 0)::int as total_likes,
          COALESCE(SUM(m.comentarios_count), 0)::int as total_comentarios
        FROM contenido c
        LEFT JOIN contenido_metricas m ON c.id = m.contenido_id
        WHERE c.estado = 'PUBLICADO'
          ${Object.keys(dateFilter).length > 0 ?
                    Prisma.sql`AND c.created_at >= ${dateFilter.gte} AND c.created_at <= ${dateFilter.lte || new Date()}` :
                    Prisma.empty}
        GROUP BY c.tipo
        ORDER BY total_vistas DESC
      ` : Promise.resolve(null),

            // Actividad reciente (últimos 30 días)
            prisma.contenidoComentario.count({
                where: {
                    fecha_comentario: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    },
                    contenido: {
                        ...tipoFilter,
                        ...(Object.keys(dateFilter).length > 0 && { created_at: dateFilter })
                    }
                }
            })
        ]);

        // Calcular tasas de engagement
        const totalVistas = metricsAggregate._sum.vistas || 0;
        const totalLikes = metricsAggregate._sum.likes || 0;
        const totalComentarios = metricsAggregate._sum.comentarios_count || 0;

        const tasaLikes = totalVistas > 0 ? (totalLikes / totalVistas * 100) : 0;
        const tasaComentarios = totalVistas > 0 ? (totalComentarios / totalVistas * 100) : 0;

        return {
            metricas_totales: {
                total_vistas: totalVistas,
                total_likes: totalLikes,
                total_comentarios: totalComentarios,
                total_shares: metricsAggregate._sum.shares || 0
            },
            metricas_promedio: {
                vistas_promedio: Math.round(metricsAggregate._avg.vistas || 0),
                likes_promedio: Math.round(metricsAggregate._avg.likes || 0),
                comentarios_promedio: Math.round(metricsAggregate._avg.comentarios_count || 0),
                shares_promedio: Math.round(metricsAggregate._avg.shares || 0)
            },
            tasas_engagement: {
                tasa_likes: Math.round(tasaLikes * 100) / 100,
                tasa_comentarios: Math.round(tasaComentarios * 100) / 100
            },
            contenido_top_engagement: topEngagedContent,
            engagement_por_tipo: engagementByType as Array<{
                tipo: string;
                total_vistas: number;
                total_likes: number;
                total_comentarios: number;
            }> | null,
            actividad_reciente: {
                comentarios_ultimos_30_dias: recentActivity
            },
            parametros: params
        };
    }
}

export const cmsService = new CMSService();