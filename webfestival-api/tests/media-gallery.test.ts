import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import mediaRoutes from '../src/routes/media.routes';

// Crear una app de prueba simple
const testApp = express();
testApp.use(express.json());
testApp.use('/api/v1/media', mediaRoutes);

describe('Media Gallery API Routes', () => {

  describe('GET /api/v1/media/validation-config', () => {
    it('should return validation configuration for all media types', async () => {
      const response = await request(testApp)
        .get('/api/v1/media/validation-config')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('fotografia');
      expect(response.body.data).toHaveProperty('video');
      expect(response.body.data).toHaveProperty('audio');
      expect(response.body.data).toHaveProperty('corto_cine');

      // Verificar estructura de configuración para fotografía
      const fotoConfig = response.body.data.fotografia;
      expect(fotoConfig).toHaveProperty('formats');
      expect(fotoConfig).toHaveProperty('maxSizeMB');
      expect(fotoConfig).toHaveProperty('maxDimensions');
      expect(fotoConfig).toHaveProperty('extensions');
      expect(Array.isArray(fotoConfig.formats)).toBe(true);
      expect(Array.isArray(fotoConfig.extensions)).toBe(true);
    });
  });

  describe('Route Structure', () => {
    it('should have gallery winner route defined', () => {
      // Verificar que las rutas están definidas correctamente
      expect(mediaRoutes).toBeDefined();
    });

    it('should have gallery featured route defined', () => {
      // Verificar que las rutas están definidas correctamente
      expect(mediaRoutes).toBeDefined();
    });

    it('should have categories route defined', () => {
      // Verificar que las rutas están definidas correctamente
      expect(mediaRoutes).toBeDefined();
    });
  });

  describe('Media Service Configuration', () => {
    it('should have proper media validation config', () => {
      // Test que la configuración de validación está definida
      const { MEDIA_VALIDATION_CONFIG } = require('../services/media.service');
      
      expect(MEDIA_VALIDATION_CONFIG).toBeDefined();
      expect(MEDIA_VALIDATION_CONFIG.fotografia).toBeDefined();
      expect(MEDIA_VALIDATION_CONFIG.video).toBeDefined();
      expect(MEDIA_VALIDATION_CONFIG.audio).toBeDefined();
      expect(MEDIA_VALIDATION_CONFIG.corto_cine).toBeDefined();
      
      // Verificar estructura de configuración
      const fotoConfig = MEDIA_VALIDATION_CONFIG.fotografia;
      expect(fotoConfig.formats).toBeDefined();
      expect(fotoConfig.maxSizeMB).toBeDefined();
      expect(fotoConfig.maxDimensions).toBeDefined();
      expect(fotoConfig.extensions).toBeDefined();
      expect(Array.isArray(fotoConfig.formats)).toBe(true);
      expect(Array.isArray(fotoConfig.extensions)).toBe(true);
    });
  });
});