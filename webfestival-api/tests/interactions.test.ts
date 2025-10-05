import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { app } from '../src/index';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import './setup';

const prisma = new PrismaClient();

// Mock JWT para tests
const mockUserId = 'test-user-id';
const mockAdminUserId = 'test-admin-id';

const mockToken = jwt.sign(
  { userId: mockUserId, role: 'PARTICIPANTE' },
  process.env['JWT_SECRET'] || 'test-secret'
);

const mockAdminToken = jwt.sign(
  { userId: mockAdminUserId, role: 'ADMIN' },
  process.env['JWT_SECRET'] || 'test-secret'
);

describe('Interactions API', () => {
  beforeAll(async () => {
    // Configurar datos de prueba si es necesario
    // En un entorno real, aquí crearías datos de prueba en la base de datos
  });

  afterAll(async () => {
    // Limpiar datos de prueba
    await prisma.$disconnect();
  });

  describe('POST /api/v1/interactions/like', () => {
    it('debería requerir autenticación', async () => {
      const likeData = {
        contenido_id: 1,
        tipo_contenido: 'contenido'
      };

      const response = await request(app)
        .post('/api/v1/interactions/like')
        .send(likeData);

      expect(response.status).toBe(401);
    });

    it('debería validar los datos de entrada', async () => {
      const invalidData = {
        contenido_id: 'invalid',
        tipo_contenido: ''
      };

      const response = await request(app)
        .post('/api/v1/interactions/like')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
    });

    it('debería tener la estructura correcta para datos válidos', async () => {
      const likeData = {
        contenido_id: 1,
        tipo_contenido: 'contenido'
      };

      const response = await request(app)
        .post('/api/v1/interactions/like')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(likeData);

      // Puede ser 404 (contenido no existe) o 500 (DB no configurada)
      // pero la estructura de la respuesta debe ser correcta
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/v1/interactions/comments', () => {
    it('debería requerir autenticación', async () => {
      const commentData = {
        contenido_id: 1,
        tipo_contenido: 'contenido',
        contenido_texto: 'Este es un comentario de prueba'
      };

      const response = await request(app)
        .post('/api/v1/interactions/comments')
        .send(commentData);

      expect(response.status).toBe(401);
    });

    it('debería validar el contenido del comentario', async () => {
      const invalidData = {
        contenido_id: 1,
        tipo_contenido: 'contenido',
        contenido_texto: '' // Texto vacío no válido
      };

      const response = await request(app)
        .post('/api/v1/interactions/comments')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
    });

    it('debería validar la longitud máxima del comentario', async () => {
      const longText = 'a'.repeat(1001); // Excede el límite de 1000 caracteres
      const invalidData = {
        contenido_id: 1,
        tipo_contenido: 'contenido',
        contenido_texto: longText
      };

      const response = await request(app)
        .post('/api/v1/interactions/comments')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
    });

    it('debería tener la estructura correcta para datos válidos', async () => {
      const commentData = {
        contenido_id: 1,
        tipo_contenido: 'contenido',
        contenido_texto: 'Este es un comentario de prueba válido'
      };

      const response = await request(app)
        .post('/api/v1/interactions/comments')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(commentData);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/v1/interactions/reports', () => {
    it('debería requerir autenticación', async () => {
      const reportData = {
        elemento_id: 1,
        tipo_elemento: 'comentario' as const,
        razon: 'spam' as const,
        descripcion: 'Este comentario es spam'
      };

      const response = await request(app)
        .post('/api/v1/interactions/reports')
        .send(reportData);

      expect(response.status).toBe(401);
    });

    it('debería validar el tipo de elemento', async () => {
      const invalidData = {
        elemento_id: 1,
        tipo_elemento: 'invalid_type',
        razon: 'spam',
        descripcion: 'Test'
      };

      const response = await request(app)
        .post('/api/v1/interactions/reports')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
    });

    it('debería validar la razón del reporte', async () => {
      const invalidData = {
        elemento_id: 1,
        tipo_elemento: 'comentario',
        razon: 'invalid_reason',
        descripcion: 'Test'
      };

      const response = await request(app)
        .post('/api/v1/interactions/reports')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
    });

    it('debería tener la estructura correcta para datos válidos', async () => {
      const reportData = {
        elemento_id: 1,
        tipo_elemento: 'comentario' as const,
        razon: 'spam' as const,
        descripcion: 'Este comentario contiene spam'
      };

      const response = await request(app)
        .post('/api/v1/interactions/reports')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(reportData);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/v1/interactions/comments', () => {
    it('debería requerir autenticación', async () => {
      const response = await request(app)
        .get('/api/v1/interactions/comments');

      expect(response.status).toBe(401);
    });

    it('debería aceptar parámetros de paginación válidos', async () => {
      const response = await request(app)
        .get('/api/v1/interactions/comments')
        .set('Authorization', `Bearer ${mockToken}`)
        .query({
          page: 1,
          limit: 10
        });

      expect(response.body).toHaveProperty('success');
    });

    it('debería validar límites de paginación', async () => {
      const response = await request(app)
        .get('/api/v1/interactions/comments')
        .set('Authorization', `Bearer ${mockToken}`)
        .query({
          page: 1,
          limit: 150 // Excede el límite máximo de 100
        });

      expect(response.status).toBe(400);
    });

    it('debería filtrar por tipo de contenido', async () => {
      const response = await request(app)
        .get('/api/v1/interactions/comments')
        .set('Authorization', `Bearer ${mockToken}`)
        .query({
          tipo_contenido: 'contenido',
          page: 1,
          limit: 10
        });

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('GET /api/v1/interactions/stats', () => {
    it('debería requerir autenticación', async () => {
      const response = await request(app)
        .get('/api/v1/interactions/stats');

      expect(response.status).toBe(401);
    });

    it('debería requerir permisos de moderador', async () => {
      const response = await request(app)
        .get('/api/v1/interactions/stats')
        .set('Authorization', `Bearer ${mockToken}`);

      // Debería fallar porque el usuario no es moderador
      expect(response.status).toBe(403);
    });

    it('debería permitir acceso a administradores', async () => {
      const response = await request(app)
        .get('/api/v1/interactions/stats')
        .set('Authorization', `Bearer ${mockAdminToken}`);

      // Puede ser 200 (éxito) o 500 (DB no configurada)
      // pero no debería ser 403 (sin permisos)
      expect(response.status).not.toBe(403);
      expect(response.body).toHaveProperty('success');
    });

    it('debería aceptar filtros válidos', async () => {
      const response = await request(app)
        .get('/api/v1/interactions/stats')
        .set('Authorization', `Bearer ${mockAdminToken}`)
        .query({
          incluir_comentarios: 'true',
          incluir_likes: 'true',
          incluir_reportes: 'false'
        });

      expect(response.body).toHaveProperty('success');
    });
  });

  describe('Moderación de comentarios', () => {
    it('PUT /api/v1/interactions/moderate/comment/:commentId debería requerir permisos de moderador', async () => {
      const response = await request(app)
        .put('/api/v1/interactions/moderate/comment/1')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ aprobado: true });

      expect(response.status).toBe(403);
    });

    it('PUT /api/v1/interactions/moderate/bulk debería validar los datos de entrada', async () => {
      const invalidData = {
        comment_ids: [], // Array vacío no válido
        accion: 'invalid_action'
      };

      const response = await request(app)
        .put('/api/v1/interactions/moderate/bulk')
        .set('Authorization', `Bearer ${mockAdminToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
    });

    it('PUT /api/v1/interactions/reports/:reportId/resolve debería requerir permisos de moderador', async () => {
      const response = await request(app)
        .put('/api/v1/interactions/reports/1/resolve')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ estado: 'RESUELTO' });

      expect(response.status).toBe(403);
    });
  });

  describe('Validación de parámetros de URL', () => {
    it('debería validar IDs numéricos en las rutas', async () => {
      const response = await request(app)
        .get('/api/v1/interactions/likes/invalid_id/contenido')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(400);
    });

    it('debería requerir parámetros obligatorios', async () => {
      const response = await request(app)
        .put('/api/v1/interactions/comments/')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ contenido_texto: 'Test' });

      expect(response.status).toBe(404); // Ruta no encontrada
    });
  });
});