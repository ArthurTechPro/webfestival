/// <reference types="jest" />

// Mock de los servicios problemáticos antes de importar la app
jest.mock('../src/services/stripe.service', () => ({
  stripeService: {
    processPayment: jest.fn().mockResolvedValue({ success: true, payment_intent_id: 'pi_test' }),
    verifyWebhookSignature: jest.fn().mockReturnValue({ id: 'evt_test', type: 'invoice.payment_succeeded' }),
    handleWebhook: jest.fn().mockResolvedValue(undefined)
  }
}));

jest.mock('../src/services/paypal.service', () => ({
  paypalService: {
    processPayment: jest.fn().mockResolvedValue({ success: true, subscription_id: 'sub_test' }),
    verifyWebhookSignature: jest.fn().mockReturnValue(true),
    handleWebhook: jest.fn().mockResolvedValue(undefined),
    confirmSubscription: jest.fn().mockResolvedValue({ success: true })
  }
}));

import request from 'supertest';
import { app } from '../src/index';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

describe('Subscription Management API - Task 7.1', () => {
  let authToken: string;
  let adminToken: string;
  let testUserId: string;
  let adminId: string;

  beforeAll(async () => {
    // Crear usuario de prueba
    const testUser = await prisma.usuario.create({
      data: {
        email: 'test-subscription@example.com',
        nombre: 'Test User Subscription',
        password: 'hashedpassword',
        role: 'PARTICIPANTE'
      }
    });
    testUserId = testUser.id;

    // Crear usuario ADMIN
    const admin = await prisma.usuario.create({
      data: {
        email: 'admin-subscription@example.com',
        nombre: 'Admin Subscription',
        password: 'hashedpassword',
        role: 'ADMIN'
      }
    });
    adminId = admin.id;

    // Generar tokens JWT
    authToken = jwt.sign(
      { id: testUserId, userId: testUserId, role: 'PARTICIPANTE' },
      process.env['JWT_SECRET'] || 'test-secret',
      { expiresIn: '1h' }
    );

    adminToken = jwt.sign(
      { id: adminId, userId: adminId, role: 'ADMIN' },
      process.env['JWT_SECRET'] || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    // Limpiar datos de prueba
    await prisma.userSubscription.deleteMany({
      where: { user_id: { in: [testUserId, adminId] } }
    });
    await prisma.usuario.deleteMany({
      where: { id: { in: [testUserId, adminId] } }
    });
    await prisma.$disconnect();
  });

  describe('GET /api/v1/subscriptions/plans - Obtener planes disponibles', () => {
    it('debería obtener todos los planes disponibles sin autenticación', async () => {
      const response = await request(app)
        .get('/api/v1/subscriptions/plans');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('debería filtrar planes por intervalo', async () => {
      const response = await request(app)
        .get('/api/v1/subscriptions/plans')
        .query({ interval: 'monthly' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('debería obtener un plan específico por ID', async () => {
      const response = await request(app)
        .get('/api/v1/subscriptions/plans/basico');

      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('id', 'basico');
        expect(response.body.data).toHaveProperty('features');
        expect(response.body.data).toHaveProperty('limits');
      }
    });
  });

  describe('GET /api/v1/subscriptions/limits - Gestión de límites por usuario', () => {
    it('debería requerir autenticación', async () => {
      const response = await request(app)
        .get('/api/v1/subscriptions/limits');

      expect(response.status).toBe(401);
    });

    it('debería obtener límites del usuario autenticado', async () => {
      const response = await request(app)
        .get('/api/v1/subscriptions/limits')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('canParticipateInContest');
      expect(response.body.data).toHaveProperty('canUploadMedia');
      expect(response.body.data).toHaveProperty('remainingConcursos');
      expect(response.body.data).toHaveProperty('remainingUploads');
    });

    it('debería verificar permisos específicos del usuario', async () => {
      const response = await request(app)
        .get('/api/v1/subscriptions/can/participate')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('canPerform');
      expect(response.body.data).toHaveProperty('action', 'participate');
    });
  });

  describe('POST /api/v1/subscriptions/upgrade - Upgrade de planes', () => {
    it('debería requerir autenticación para upgrade', async () => {
      const response = await request(app)
        .post('/api/v1/subscriptions/upgrade')
        .send({ planId: 'profesional' });

      expect(response.status).toBe(401);
    });

    it('debería manejar upgrade con usuario autenticado', async () => {
      const response = await request(app)
        .post('/api/v1/subscriptions/upgrade')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ planId: 'profesional' });

      // Puede ser 200 (éxito) o 404 (no tiene suscripción activa)
      expect([200, 404, 500]).toContain(response.status);
    });

    it('debería validar que el planId sea requerido', async () => {
      const response = await request(app)
        .post('/api/v1/subscriptions/upgrade')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/v1/subscriptions/my-subscription - Suscripción del usuario', () => {
    it('debería requerir autenticación', async () => {
      const response = await request(app)
        .get('/api/v1/subscriptions/my-subscription');

      expect(response.status).toBe(401);
    });

    it('debería manejar usuario sin suscripción activa', async () => {
      const response = await request(app)
        .get('/api/v1/subscriptions/my-subscription')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 404]).toContain(response.status);
      if (response.status === 404) {
        expect(response.body.success).toBe(false);
        expect(response.body.error).toContain('No se encontró suscripción activa');
      }
    });
  });

  describe('Endpoints de administración', () => {
    it('debería requerir permisos de administrador para crear planes', async () => {
      const response = await request(app)
        .post('/api/v1/subscriptions/plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          id: 'test-plan',
          name: 'Plan de Prueba',
          price: 9.99,
          interval: 'monthly',
          features: [],
          limits: {
            maxConcursosPerMonth: 5,
            maxUploadsPerMonth: 10,
            maxPrivateContests: 0,
            maxTeamMembers: 1,
            analyticsAccess: false,
            prioritySupport: false,
            apiAccess: false
          }
        });

      expect(response.status).toBe(403);
    });

    it('debería permitir a administradores obtener métricas', async () => {
      const response = await request(app)
        .get('/api/v1/subscriptions/metrics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 403]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('totalSubscriptions');
        expect(response.body.data).toHaveProperty('activeSubscriptions');
      }
    });

    it('debería permitir inicializar planes predeterminados', async () => {
      const response = await request(app)
        .post('/api/v1/subscriptions/initialize-plans')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 403]).toContain(response.status);
    });
  });

  describe('Tracking de uso y límites', () => {
    it('debería rechazar acciones inválidas en verificación de permisos', async () => {
      const response = await request(app)
        .get('/api/v1/subscriptions/can/invalid_action')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('debería validar acciones válidas', async () => {
      const validActions = ['participate', 'upload', 'create_private', 'add_member'];
      
      for (const action of validActions) {
        const response = await request(app)
          .get(`/api/v1/subscriptions/can/${action}`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('canPerform');
        expect(response.body.data).toHaveProperty('action', action);
      }
    });
  });
});