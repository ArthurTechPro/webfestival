import request from 'supertest';

// Mock de los servicios de pago antes de importar la app
jest.mock('../src/services/stripe.service', () => require('./__mocks__/stripe.service'));
jest.mock('../src/services/paypal.service', () => require('./__mocks__/paypal.service'));

import { app } from '../src/index';

describe('Subscription API Endpoints', () => {

  describe('GET /api/v1/subscriptions/plans', () => {
    it('debería obtener todos los planes disponibles', async () => {
      const response = await request(app)
        .get('/api/v1/subscriptions/plans')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('debería filtrar planes por intervalo', async () => {
      const response = await request(app)
        .get('/api/v1/subscriptions/plans?interval=monthly')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/subscriptions/limits', () => {
    it('debería requerir autenticación', async () => {
      await request(app)
        .get('/api/v1/subscriptions/limits')
        .expect(401);
    });
  });

  describe('GET /api/v1/subscriptions/can/:action', () => {
    it('debería requerir autenticación para verificar permisos', async () => {
      await request(app)
        .get('/api/v1/subscriptions/can/participate')
        .expect(401);
    });

    it('debería rechazar acciones inválidas sin autenticación', async () => {
      await request(app)
        .get('/api/v1/subscriptions/can/invalid_action')
        .expect(401);
    });
  });

  describe('GET /api/v1/subscriptions/my-subscription', () => {
    it('debería requerir autenticación', async () => {
      await request(app)
        .get('/api/v1/subscriptions/my-subscription')
        .expect(401);
    });
  });
});