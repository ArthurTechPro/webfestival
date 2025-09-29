import request from 'supertest';
import { app } from '../src/index';

describe('App', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'ok',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
      });
    });
  });

  describe('GET /api/v1', () => {
    it('should return API info', async () => {
      const response = await request(app)
        .get('/api/v1')
        .expect(200);

      expect(response.body).toEqual({
        message: 'WebFestival API v1.0.0',
        version: '1.0.0',
        timestamp: expect.any(String),
      });
    });
  });

  describe('404 handler', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/unknown-route')
        .expect(404);

      expect(response.body).toEqual({
        error: 'Not Found',
        message: 'Route not found',
        path: '/unknown-route',
      });
    });
  });
});