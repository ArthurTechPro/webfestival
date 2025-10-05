import './globals';
import request from 'supertest';
import { app } from '../src/index';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

describe('CMS Search and Analytics API', () => {
  let authToken: string;
  let contentAdminToken: string;
  let testUserId: string;
  let contentAdminId: string;
  let testContentId: number;

  beforeAll(async () => {
    // Crear usuario de prueba
    const testUser = await prisma.usuario.create({
      data: {
        email: 'test-cms-search@example.com',
        nombre: 'Test User CMS Search',
        password: 'hashedpassword',
        role: 'PARTICIPANTE'
      }
    });
    testUserId = testUser.id;

    // Crear usuario CONTENT_ADMIN
    const contentAdmin = await prisma.usuario.create({
      data: {
        email: 'content-admin-search@example.com',
        nombre: 'Content Admin Search',
        password: 'hashedpassword',
        role: 'CONTENT_ADMIN'
      }
    });
    contentAdminId = contentAdmin.id;

    // Generar tokens JWT
    authToken = jwt.sign(
      { userId: testUserId, role: 'PARTICIPANTE' },
      process.env['JWT_SECRET'] || 'test-secret',
      { expiresIn: '1h' }
    );

    contentAdminToken = jwt.sign(
      { userId: contentAdminId, role: 'CONTENT_ADMIN' },
      process.env['JWT_SECRET'] || 'test-secret',
      { expiresIn: '1h' }
    );

    // Crear contenido de prueba
    const testContent = await prisma.contenido.create({
      data: {
        tipo: 'BLOG_POST',
        titulo: 'Test Content for Search',
        contenido: 'Este es contenido de prueba para búsqueda avanzada',
        slug: 'test-content-search',
        estado: 'PUBLICADO',
        autor_id: contentAdminId
      }
    });
    testContentId = testContent.id;

    // Crear configuración, métricas y taxonomía
    await Promise.all([
      prisma.contenidoConfiguracion.create({
        data: {
          contenido_id: testContentId,
          activo: true,
          orden: 0,
          permite_comentarios: true,
          destacado: true
        }
      }),
      prisma.contenidoMetricas.create({
        data: {
          contenido_id: testContentId,
          vistas: 100,
          likes: 25,
          comentarios_count: 5,
          shares: 10
        }
      }),
      prisma.contenidoSEO.create({
        data: {
          contenido_id: testContentId,
          seo_titulo: 'Test Content SEO',
          seo_descripcion: 'Descripción SEO de prueba',
          seo_keywords: ['test', 'search', 'cms']
        }
      }),
      prisma.contenidoTaxonomia.createMany({
        data: [
          {
            contenido_id: testContentId,
            categoria: 'tecnologia',
            tipo_taxonomia: 'categoria'
          },
          {
            contenido_id: testContentId,
            etiqueta: 'prueba',
            tipo_taxonomia: 'etiqueta'
          },
          {
            contenido_id: testContentId,
            etiqueta: 'busqueda',
            tipo_taxonomia: 'etiqueta'
          }
        ]
      })
    ]);
  });

  afterAll(async () => {
    // Limpiar datos de prueba
    await prisma.contenidoTaxonomia.deleteMany({
      where: { contenido_id: testContentId }
    });
    await prisma.contenidoSEO.deleteMany({
      where: { contenido_id: testContentId }
    });
    await prisma.contenidoMetricas.deleteMany({
      where: { contenido_id: testContentId }
    });
    await prisma.contenidoConfiguracion.deleteMany({
      where: { contenido_id: testContentId }
    });
    await prisma.contenido.deleteMany({
      where: { id: testContentId }
    });
    await prisma.usuario.deleteMany({
      where: { id: { in: [testUserId, contentAdminId] } }
    });
    await prisma.$disconnect();
  });

  describe('GET /api/v1/cms/search - Búsqueda Avanzada', () => {
    it('debería realizar búsqueda básica por texto', async () => {
      const response = await request(app)
        .get('/api/v1/cms/search')
        .query({ q: 'prueba' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.contenido).toBeInstanceOf(Array);
      expect(response.body.data.pagination.total).toBeGreaterThanOrEqual(0);
    });

    it('debería filtrar por tipo de contenido', async () => {
      const response = await request(app)
        .get('/api/v1/cms/search')
        .query({ tipo: 'BLOG_POST' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.contenido).toBeInstanceOf(Array);
    });

    it('debería filtrar por categorías', async () => {
      const response = await request(app)
        .get('/api/v1/cms/search')
        .query({ categoria: 'tecnologia' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.contenido).toBeInstanceOf(Array);
    });

    it('debería filtrar por etiquetas', async () => {
      const response = await request(app)
        .get('/api/v1/cms/search')
        .query({ etiquetas: 'prueba,busqueda' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.contenido).toBeInstanceOf(Array);
    });

    it('debería filtrar por estado', async () => {
      const response = await request(app)
        .get('/api/v1/cms/search')
        .query({ estado: 'PUBLICADO' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.contenido).toBeInstanceOf(Array);
    });

    it('debería ordenar por diferentes criterios', async () => {
      const response = await request(app)
        .get('/api/v1/cms/search')
        .query({ 
          ordenarPor: 'popularidad',
          orden: 'desc'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.contenido).toBeInstanceOf(Array);
    });

    it('debería manejar paginación correctamente', async () => {
      const response = await request(app)
        .get('/api/v1/cms/search')
        .query({ 
          page: '1',
          limit: '5'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.contenido.length).toBeLessThanOrEqual(5);
    });

    it('debería filtrar por rango de fechas', async () => {
      const fechaDesde = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const fechaHasta = new Date().toISOString();

      const response = await request(app)
        .get('/api/v1/cms/search')
        .query({ 
          fechaDesde,
          fechaHasta
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.contenido).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/v1/cms/categories - Gestión de Categorías', () => {
    it('debería obtener todas las categorías', async () => {
      const response = await request(app)
        .get('/api/v1/cms/categories');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.categories).toBeInstanceOf(Array);
    });

    it('debería filtrar categorías por tipo', async () => {
      const response = await request(app)
        .get('/api/v1/cms/categories')
        .query({ tipo: 'BLOG_POST' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.categories).toBeInstanceOf(Array);
    });

    it('debería crear nueva categoría (CONTENT_ADMIN)', async () => {
      const response = await request(app)
        .post('/api/v1/cms/categories')
        .set('Authorization', `Bearer ${contentAdminToken}`)
        .send({
          nombre: 'Test Category',
          descripcion: 'Categoría de prueba',
          tipo: 'BLOG_POST',
          activo: true
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.nombre).toBe('Test Category');
    });

    it('debería rechazar creación sin permisos', async () => {
      const response = await request(app)
        .post('/api/v1/cms/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nombre: 'Unauthorized Category',
          descripcion: 'No debería crearse',
          tipo: 'BLOG_POST'
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/cms/tags/autocomplete - Autocompletado de Etiquetas', () => {
    it('debería proporcionar sugerencias de etiquetas', async () => {
      const response = await request(app)
        .get('/api/v1/cms/tags/autocomplete')
        .query({ q: 'pru' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.suggestions).toBeInstanceOf(Array);
    });

    it('debería requerir mínimo 2 caracteres', async () => {
      const response = await request(app)
        .get('/api/v1/cms/tags/autocomplete')
        .query({ q: 'p' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('debería limitar número de sugerencias', async () => {
      const response = await request(app)
        .get('/api/v1/cms/tags/autocomplete')
        .query({ q: 'test', limit: '3' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.suggestions.length).toBeLessThanOrEqual(3);
    });
  });

  describe('GET /api/v1/cms/tags/popular - Etiquetas Populares', () => {
    it('debería obtener etiquetas más populares', async () => {
      const response = await request(app)
        .get('/api/v1/cms/tags/popular');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tags).toBeInstanceOf(Array);
      expect(response.body.data.periodo).toBeDefined();
    });

    it('debería filtrar por período', async () => {
      const response = await request(app)
        .get('/api/v1/cms/tags/popular')
        .query({ periodo: '7d' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.periodo).toBe('7d');
    });
  });

  describe('GET /api/v1/cms/analytics/overview - Analytics Overview', () => {
    it('debería requerir autenticación CONTENT_ADMIN', async () => {
      const response = await request(app)
        .get('/api/v1/cms/analytics/overview');

      expect(response.status).toBe(401);
    });

    it('debería rechazar usuarios sin permisos', async () => {
      const response = await request(app)
        .get('/api/v1/cms/analytics/overview')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
    });

    it('debería obtener métricas generales para CONTENT_ADMIN', async () => {
      const response = await request(app)
        .get('/api/v1/cms/analytics/overview')
        .set('Authorization', `Bearer ${contentAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.resumen).toBeDefined();
      expect(response.body.data.resumen.totalContenido).toBeGreaterThanOrEqual(0);
      expect(response.body.data.resumen.contenidoPublicado).toBeGreaterThanOrEqual(0);
      expect(response.body.data.resumen.totalVistas).toBeGreaterThanOrEqual(0);
    });

    it('debería filtrar por tipo de contenido', async () => {
      const response = await request(app)
        .get('/api/v1/cms/analytics/overview')
        .set('Authorization', `Bearer ${contentAdminToken}`)
        .query({ tipo: 'BLOG_POST' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.resumen).toBeDefined();
    });

    it('debería incluir tendencias y métricas por tipo', async () => {
      const response = await request(app)
        .get('/api/v1/cms/analytics/overview')
        .set('Authorization', `Bearer ${contentAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.porTipo).toBeInstanceOf(Array);
      expect(response.body.data.tendencias).toBeDefined();
    });
  });

  describe('GET /api/v1/cms/analytics/engagement - Métricas de Engagement', () => {
    it('debería obtener métricas de engagement', async () => {
      const response = await request(app)
        .get('/api/v1/cms/analytics/engagement')
        .set('Authorization', `Bearer ${contentAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.metricas).toBeDefined();
      expect(response.body.data.tendenciasTempo).toBeInstanceOf(Array);
    });

    it('debería filtrar por rango de fechas', async () => {
      const fechaInicio = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const fechaFin = new Date().toISOString();

      const response = await request(app)
        .get('/api/v1/cms/analytics/engagement')
        .set('Authorization', `Bearer ${contentAdminToken}`)
        .query({ 
          periodo: '30d'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.metricas).toBeDefined();
    });

    it('debería incluir comparación con período anterior', async () => {
      const response = await request(app)
        .get('/api/v1/cms/analytics/engagement')
        .set('Authorization', `Bearer ${contentAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.comparacion).toBeDefined();
    });
  });

  describe('GET /api/v1/cms/analytics/content-performance - Rendimiento de Contenido', () => {
    it('debería obtener contenido con mejor rendimiento', async () => {
      const response = await request(app)
        .get('/api/v1/cms/analytics/content-performance')
        .set('Authorization', `Bearer ${contentAdminToken}`)
        .query({ 
          ordenarPor: 'vistas',
          limite: '5'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.contenidoTop).toBeInstanceOf(Array);
      expect(response.body.data.estadisticas).toBeDefined();
    });

    it('debería ordenar por diferentes métricas', async () => {
      const response = await request(app)
        .get('/api/v1/cms/analytics/content-performance')
        .set('Authorization', `Bearer ${contentAdminToken}`)
        .query({ ordenarPor: 'engagement' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.contenidoTop).toBeInstanceOf(Array);
    });

    it('debería incluir scores de rendimiento', async () => {
      const response = await request(app)
        .get('/api/v1/cms/analytics/content-performance')
        .set('Authorization', `Bearer ${contentAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.estadisticas.distribucionRendimiento).toBeDefined();
    });
  });

  describe('Validación de parámetros', () => {
    it('debería validar parámetros de búsqueda inválidos', async () => {
      const response = await request(app)
        .get('/api/v1/cms/search')
        .query({ 
          page: '-1',
          limit: '200'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('debería validar parámetros de analytics inválidos', async () => {
      const response = await request(app)
        .get('/api/v1/cms/analytics/content-performance')
        .set('Authorization', `Bearer ${contentAdminToken}`)
        .query({ 
          limite: '1000',
          ordenarPor: 'invalid_metric'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('debería validar formato de fechas', async () => {
      const response = await request(app)
        .get('/api/v1/cms/search')
        .query({ 
          fechaDesde: 'invalid-date',
          fechaHasta: 'also-invalid'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('debería validar tipos de contenido válidos', async () => {
      const response = await request(app)
        .get('/api/v1/cms/search')
        .query({ tipo: 'INVALID_TYPE' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('Manejo de errores', () => {
    it('debería manejar errores de base de datos graciosamente', async () => {
      // Simular error cerrando la conexión temporalmente
      await prisma.$disconnect();
      
      const response = await request(app)
        .get('/api/v1/cms/search')
        .query({ q: 'test' });

      // Reconectar para otros tests
      await prisma.$connect();

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('debería manejar tokens JWT inválidos', async () => {
      const response = await request(app)
        .get('/api/v1/cms/analytics/overview')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});