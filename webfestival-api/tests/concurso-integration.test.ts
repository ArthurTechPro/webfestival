/// <reference types="jest" />

// IMPORTANTE: NO IMPORTAR FUNCIONES DE 'node:test' - USAR JEST GLOBALS
// Jest proporciona describe, it, expect, beforeEach, afterEach globalmente

import request from 'supertest';
import { app } from '../src/index';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

describe('Concurso Integration Tests', () => {
  let authToken: string;
  let adminToken: string;
  let testUserId: string;
  let adminUserId: string;
  let testConcursoId: number;

  beforeAll(async () => {
    // Crear usuario de prueba
    const testUser = await prisma.usuario.create({
      data: {
        email: 'participant@integration.test',
        nombre: 'Test Participant',
        password: 'hashedpassword',
        role: 'PARTICIPANTE'
      }
    });
    testUserId = testUser.id;

    // Crear usuario admin de prueba
    const adminUser = await prisma.usuario.create({
      data: {
        email: 'admin@integration.test',
        nombre: 'Test Admin',
        password: 'hashedpassword',
        role: 'ADMIN'
      }
    });
    adminUserId = adminUser.id;

    // Generar tokens JWT
    authToken = jwt.sign(
      {
        id: testUserId,
        userId: testUserId,
        email: testUser.email,
        role: testUser.role
      },
      process.env['JWT_SECRET'] || 'test-secret',
      { expiresIn: '1h' }
    );

    adminToken = jwt.sign(
      {
        id: adminUserId,
        userId: adminUserId,
        email: adminUser.email,
        role: adminUser.role
      },
      process.env['JWT_SECRET'] || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    // Limpiar datos de prueba
    if (testConcursoId) {
      await prisma.inscripcion.deleteMany({
        where: { concurso_id: testConcursoId }
      });
      await prisma.concurso.delete({
        where: { id: testConcursoId }
      }).catch(() => {});
    }

    await prisma.usuario.deleteMany({
      where: {
        email: {
          in: ['participant@integration.test', 'admin@integration.test']
        }
      }
    });

    await prisma.$disconnect();
  });

  describe('GET /api/v1/concursos/activos', () => {
    it('debería obtener concursos activos sin autenticación', async () => {
      const response = await request(app)
        .get('/api/v1/concursos/activos');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('debería incluir información de categorías y conteos', async () => {
      const response = await request(app)
        .get('/api/v1/concursos/activos');

      expect(response.status).toBe(200);
      
      if (response.body.data.length > 0) {
        const concurso = response.body.data[0];
        expect(concurso).toHaveProperty('id');
        expect(concurso).toHaveProperty('titulo');
        expect(concurso).toHaveProperty('descripcion');
        expect(concurso).toHaveProperty('status');
        expect(concurso).toHaveProperty('categorias');
        expect(concurso).toHaveProperty('_count');
      }
    });
  });

  describe('POST /api/v1/concursos', () => {
    it('debería crear un concurso como admin', async () => {
      const concursoData = {
        titulo: 'Concurso de Integración',
        descripcion: 'Concurso creado en test de integración',
        reglas: 'Reglas del concurso de prueba',
        fecha_inicio: new Date(Date.now() + 86400000).toISOString(), // Mañana
        fecha_final: new Date(Date.now() + 7 * 86400000).toISOString(), // En una semana
        max_envios: 3,
        tamano_max_mb: 10
      };

      const response = await request(app)
        .post('/api/v1/concursos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(concursoData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.titulo).toBe(concursoData.titulo);
      expect(response.body.data.status).toBe('PROXIMAMENTE');

      testConcursoId = response.body.data.id;
    });

    it('debería fallar sin autenticación', async () => {
      const concursoData = {
        titulo: 'Concurso Sin Auth',
        descripcion: 'Este concurso no debería crearse',
        fecha_inicio: new Date(Date.now() + 86400000).toISOString(),
        fecha_final: new Date(Date.now() + 7 * 86400000).toISOString()
      };

      const response = await request(app)
        .post('/api/v1/concursos')
        .send(concursoData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('debería fallar con usuario no admin', async () => {
      const concursoData = {
        titulo: 'Concurso No Admin',
        descripcion: 'Este concurso no debería crearse',
        fecha_inicio: new Date(Date.now() + 86400000).toISOString(),
        fecha_final: new Date(Date.now() + 7 * 86400000).toISOString()
      };

      const response = await request(app)
        .post('/api/v1/concursos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(concursoData);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('debería validar datos de entrada', async () => {
      const concursoInvalido = {
        titulo: '', // Título vacío
        descripcion: 'Descripción válida',
        fecha_inicio: new Date(Date.now() + 7 * 86400000).toISOString(), // En una semana
        fecha_final: new Date(Date.now() + 86400000).toISOString() // Mañana (fecha final antes que inicio)
      };

      const response = await request(app)
        .post('/api/v1/concursos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(concursoInvalido);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('POST /api/v1/concursos/inscribirse', () => {
    beforeAll(async () => {
      // Asegurar que tenemos un concurso activo para inscripciones
      if (!testConcursoId) {
        const concurso = await prisma.concurso.create({
          data: {
            titulo: 'Concurso para Inscripción',
            descripcion: 'Concurso para probar inscripciones',
            fecha_inicio: new Date(Date.now() - 86400000), // Ayer
            fecha_final: new Date(Date.now() + 7 * 86400000), // En una semana
            status: 'ACTIVO'
          }
        });
        testConcursoId = concurso.id;
      } else {
        // Actualizar el concurso existente para que esté activo
        await prisma.concurso.update({
          where: { id: testConcursoId },
          data: { 
            status: 'ACTIVO',
            fecha_inicio: new Date(Date.now() - 86400000),
            fecha_final: new Date(Date.now() + 7 * 86400000)
          }
        });
      }
    });

    it('debería inscribir usuario autenticado exitosamente', async () => {
      const response = await request(app)
        .post('/api/v1/concursos/inscribirse')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ concurso_id: testConcursoId });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.usuario_id).toBe(testUserId);
      expect(response.body.data.concurso_id).toBe(testConcursoId);
    });

    it('debería fallar sin autenticación', async () => {
      const response = await request(app)
        .post('/api/v1/concursos/inscribirse')
        .send({ concurso_id: testConcursoId });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('debería fallar si ya está inscrito', async () => {
      const response = await request(app)
        .post('/api/v1/concursos/inscribirse')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ concurso_id: testConcursoId });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('inscrito');
    });

    it('debería validar ID de concurso', async () => {
      const response = await request(app)
        .post('/api/v1/concursos/inscribirse')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ concurso_id: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/concursos/:concursoId/verificar-inscripcion', () => {
    it('debería verificar inscripción existente', async () => {
      const response = await request(app)
        .get(`/api/v1/concursos/${testConcursoId}/verificar-inscripcion`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.inscrito).toBe(true);
    });

    it('debería verificar no inscripción para otro concurso', async () => {
      // Crear otro concurso temporal
      const otroConcurso = await prisma.concurso.create({
        data: {
          titulo: 'Otro Concurso',
          descripcion: 'Concurso para verificar no inscripción',
          fecha_inicio: new Date(Date.now() - 86400000),
          fecha_final: new Date(Date.now() + 7 * 86400000),
          status: 'ACTIVO'
        }
      });

      const response = await request(app)
        .get(`/api/v1/concursos/${otroConcurso.id}/verificar-inscripcion`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.inscrito).toBe(false);

      // Limpiar
      await prisma.concurso.delete({ where: { id: otroConcurso.id } });
    });

    it('debería fallar sin autenticación', async () => {
      const response = await request(app)
        .get(`/api/v1/concursos/${testConcursoId}/verificar-inscripcion`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('debería manejar ID de concurso inválido', async () => {
      const response = await request(app)
        .get('/api/v1/concursos/invalid/verificar-inscripcion')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/concursos/:id', () => {
    it('debería obtener concurso por ID', async () => {
      const response = await request(app)
        .get(`/api/v1/concursos/${testConcursoId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testConcursoId);
      expect(response.body.data).toHaveProperty('titulo');
      expect(response.body.data).toHaveProperty('descripcion');
      expect(response.body.data).toHaveProperty('categorias');
    });

    it('debería manejar concurso no encontrado', async () => {
      const response = await request(app)
        .get('/api/v1/concursos/99999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('debería manejar ID inválido', async () => {
      const response = await request(app)
        .get('/api/v1/concursos/invalid');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/concursos/:id', () => {
    it('debería actualizar concurso como admin', async () => {
      const updateData = {
        titulo: 'Concurso Actualizado',
        descripcion: 'Descripción actualizada en test de integración',
        status: 'ACTIVO'
      };

      const response = await request(app)
        .put(`/api/v1/concursos/${testConcursoId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.titulo).toBe(updateData.titulo);
      expect(response.body.data.descripcion).toBe(updateData.descripcion);
      expect(response.body.data.status).toBe(updateData.status);
    });

    it('debería fallar sin autenticación', async () => {
      const response = await request(app)
        .put(`/api/v1/concursos/${testConcursoId}`)
        .send({ titulo: 'Nuevo título' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('debería fallar con usuario no admin', async () => {
      const response = await request(app)
        .put(`/api/v1/concursos/${testConcursoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ titulo: 'Nuevo título' });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('debería manejar concurso no encontrado', async () => {
      const response = await request(app)
        .put('/api/v1/concursos/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ titulo: 'Nuevo título' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Flujo completo de concurso', () => {
    it('debería manejar el flujo completo: crear, inscribir, verificar', async () => {
      // 1. Crear concurso
      const concursoData = {
        titulo: 'Concurso Flujo Completo',
        descripcion: 'Test de flujo completo',
        fecha_inicio: new Date(Date.now() - 86400000).toISOString(), // Ayer
        fecha_final: new Date(Date.now() + 7 * 86400000).toISOString(), // En una semana
        max_envios: 3,
        tamano_max_mb: 10
      };

      const createResponse = await request(app)
        .post('/api/v1/concursos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(concursoData);

      expect(createResponse.status).toBe(201);
      const concursoId = createResponse.body.data.id;

      // 2. Activar concurso
      const updateResponse = await request(app)
        .put(`/api/v1/concursos/${concursoId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'ACTIVO' });

      expect(updateResponse.status).toBe(200);

      // 3. Crear nuevo usuario para inscripción
      const newUser = await prisma.usuario.create({
        data: {
          email: 'newuser@integration.test',
          nombre: 'New User',
          password: 'hashedpassword',
          role: 'PARTICIPANTE'
        }
      });

      const newUserToken = jwt.sign(
        {
          id: newUser.id,
          userId: newUser.id,
          email: newUser.email,
          role: newUser.role
        },
        process.env['JWT_SECRET'] || 'test-secret',
        { expiresIn: '1h' }
      );

      // 4. Inscribir usuario
      const inscripcionResponse = await request(app)
        .post('/api/v1/concursos/inscribirse')
        .set('Authorization', `Bearer ${newUserToken}`)
        .send({ concurso_id: concursoId });

      expect(inscripcionResponse.status).toBe(201);

      // 5. Verificar inscripción
      const verificacionResponse = await request(app)
        .get(`/api/v1/concursos/${concursoId}/verificar-inscripcion`)
        .set('Authorization', `Bearer ${newUserToken}`);

      expect(verificacionResponse.status).toBe(200);
      expect(verificacionResponse.body.data.inscrito).toBe(true);

      // 6. Obtener concurso y verificar datos
      const getResponse = await request(app)
        .get(`/api/v1/concursos/${concursoId}`);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.data.titulo).toBe(concursoData.titulo);
      expect(getResponse.body.data.status).toBe('ACTIVO');

      // Limpiar
      await prisma.inscripcion.deleteMany({ where: { concurso_id: concursoId } });
      await prisma.concurso.delete({ where: { id: concursoId } });
      await prisma.usuario.delete({ where: { id: newUser.id } });
    });
  });
});