/// <reference types="jest" />
/// <reference path="./globals.d.ts" />

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
        tipo: 'blog_post',
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

  describe('GET /api/cms/search - Búsqueda Avanzada', () => {
    it('debería realizar búsqueda básica por texto', async () => {
      const response = await request(app)
        .get('/api/cms/search')
        .query({ q: 'prueba' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.contenido).toBeInstanceOf(Array);
      expect(response.body.data.total).toBeGreaterThan(0);
    });

    it('debería filtrar por tipo de contenido', async () => {
      const response = await request(app)
        .get('/api/cms/search')
        .query({ tipo: 'blog_post' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.contenido).toBeInstanceOf(Array);
    });

    it('debería filtrar por categorías', async () => {
      const response = await request(app)
        .get('/api/cms/search')
        .query({ categorias: ['tecnologia'] });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.contenido).toBeInstanceOf(Array);
    });

    it('debería filtrar por etiquetas', async () => {
      const response = await request(app)
        .get('/api/cms/search')
        .query({ etiquetas: ['prueba', 'busqueda'] });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.contenido).toBeInstanceOf(Array);
    });

    it('debería filtrar por contenido destacado', async () => {
      const response = await request(app)
        .get('/api/cms/search')
        .query({ destacado: 'true' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.contenido).toBeInstanceOf(Array);
    });

    it('debería filtrar por métricas mínimas', async () => {
      const response = await request(app)
        .get('/api/cms/search')
        .query({ 
          min_vistas: '50',
          min_likes: '10'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.contenido).toBeInstanceOf(Array);
    });

    it('debería ordenar por diferentes criterios', async () => {
      const response = await request(app)
        .get('/api/cms/search')
        .query({ 
          sort_by: 'vistas',
          sort_order: 'desc'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.contenido).toBeInstanceOf(Array);
    });

    it('debería manejar paginación correctamente', async () => {
      const response = await request(app)
        .get('/api/cms/search')
        .query({ 
          page: '1',
          limit: '5'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.contenido.length).toBeLessThanOrEqual(5);
    });
  });

  describe('GET /api/cms/analytics/overview - Analytics Overview', () => {
    it('debería requerir autenticación CONTENT_ADMIN', async () => {
      const response = await request(app)
        .get('/api/cms/analytics/overview');

      expect(response.status).toBe(401);
    });

    it('debería rechazar usuarios sin permisos', async () => {
      const response = await request(app)
        .get('/api/cms/analytics/overview')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
    });

    it('debería obtener métricas generales para CONTENT_ADMIN', async () => {
      const response = await request(app)
        .get('/api/cms/analytics/overview')
        .set('Authorization', `Bearer ${contentAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.resumen).toBeDefined();
      expect(response.body.data.resumen.total_contenido).toBeGreaterThanOrEqual(0);
      expect(response.body.data.resumen.contenido_publicado).toBeGreaterThanOrEqual(0);
      expect(response.body.data.resumen.total_vistas).toBeGreaterThanOrEqual(0);
    });

    it('debería filtrar por tipo de contenido', async () => {
      const response = await request(app)
        .get('/api/cms/analytics/overview')
        .set('Authorization', `Bearer ${contentAdminToken}`)
        .query({ tipo: 'blog_post' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.resumen).toBeDefined();
    });
  });

  describe('GET /api/cms/analytics/content-performance - Content Performance', () => {
    it('debería obtener contenido con mejor rendimiento', async () => {
      const response = await request(app)
        .get('/api/cms/analytics/content-performance')
        .set('Authorization', `Bearer ${contentAdminToken}`)
        .query({ 
          metric: 'vistas',
          limit: '5'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.top_content).toBeInstanceOf(Array);
      expect(response.body.data.metricas_promedio).toBeDefined();
      expect(response.body.data.metricas_promedio.vistas_promedio).toBeGreaterThanOrEqual(0);
    });

    it('debería ordenar por diferentes métricas', async () => {
      const response = await request(app)
        .get('/api/cms/analytics/content-performance')
        .set('Authorization', `Bearer ${contentAdminToken}`)
        .query({ metric: 'likes' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.top_content).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/cms/analytics/taxonomy-stats - Taxonomy Stats', () => {
    it('debería obtener estadísticas de taxonomía', async () => {
      const response = await request(app)
        .get('/api/cms/analytics/taxonomy-stats')
        .set('Authorization', `Bearer ${contentAdminToken}`)
        .query({ limit: '10' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.categorias_populares).toBeInstanceOf(Array);
      expect(response.body.data.etiquetas_populares).toBeInstanceOf(Array);
      expect(response.body.data.totales).toBeDefined();
    });

    it('debería filtrar por tipo de contenido', async () => {
      const response = await request(app)
        .get('/api/cms/analytics/taxonomy-stats')
        .set('Authorization', `Bearer ${contentAdminToken}`)
        .query({ 
          tipo: 'blog_post',
          limit: '5'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.categorias_populares).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/cms/analytics/growth-trends - Growth Trends', () => {
    it('debería obtener tendencias de crecimiento mensuales', async () => {
      const response = await request(app)
        .get('/api/cms/analytics/growth-trends')
        .set('Authorization', `Bearer ${contentAdminToken}`)
        .query({ 
          periodo: 'monthly',
          meses: '6'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tendencias).toBeInstanceOf(Array);
      expect(response.body.data.resumen).toBeDefined();
    });

    it('debería manejar diferentes periodos', async () => {
      const response = await request(app)
        .get('/api/cms/analytics/growth-trends')
        .set('Authorization', `Bearer ${contentAdminToken}`)
        .query({ periodo: 'weekly' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tendencias).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/cms/analytics/engagement-metrics - Engagement Metrics', () => {
    it('debería obtener métricas de engagement', async () => {
      const response = await request(app)
        .get('/api/cms/analytics/engagement-metrics')
        .set('Authorization', `Bearer ${contentAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.metricas_totales).toBeDefined();
      expect(response.body.data.metricas_promedio).toBeDefined();
      expect(response.body.data.tasas_engagement).toBeDefined();
      expect(response.body.data.contenido_top_engagement).toBeInstanceOf(Array);
    });

    it('debería filtrar por rango de fechas', async () => {
      const fechaInicio = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const fechaFin = new Date().toISOString();

      const response = await request(app)
        .get('/api/cms/analytics/engagement-metrics')
        .set('Authorization', `Bearer ${contentAdminToken}`)
        .query({ 
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.metricas_totales).toBeDefined();
    });
  });

  describe('Validación de parámetros', () => {
    it('debería validar parámetros de búsqueda inválidos', async () => {
      const response = await request(app)
        .get('/api/cms/search')
        .query({ 
          page: '-1',
          limit: '200'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('debería validar parámetros de analytics inválidos', async () => {
      const response = await request(app)
        .get('/api/cms/analytics/content-performance')
        .set('Authorization', `Bearer ${contentAdminToken}`)
        .query({ 
          limit: '100',
          metric: 'invalid_metric'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });
});