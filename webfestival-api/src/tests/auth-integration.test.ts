import { describe, it, expect } from '@jest/globals';
import './setup';
import request from 'supertest';
import { app } from '../index';

describe('Auth Integration Tests', () => {
    describe('POST /api/v1/auth/login', () => {
        it('debería responder con error 400 para datos inválidos', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'invalid-email',
                    password: '123'
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/v1/auth/register', () => {
        it('debería responder con error 400 para datos inválidos', async () => {
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    email: 'invalid-email',
                    password: '123',
                    nombre: 'A'
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /api/v1/auth/validate', () => {
        it('debería responder con error 401 sin token', async () => {
            const response = await request(app)
                .get('/api/v1/auth/validate');

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /api/v1/auth/me', () => {
        it('debería responder con error 401 sin token', async () => {
            const response = await request(app)
                .get('/api/v1/auth/me');

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });
});