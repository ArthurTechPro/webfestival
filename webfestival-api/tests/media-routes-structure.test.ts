import { describe, it, expect } from '@jest/globals';

describe('Media Routes Structure', () => {
  it('should have media validation config defined', () => {
    // Test que la configuración de validación está definida
    const { MEDIA_VALIDATION_CONFIG } = require('../src/services/media.service');
    
    expect(MEDIA_VALIDATION_CONFIG).toBeDefined();
    expect(MEDIA_VALIDATION_CONFIG.fotografia).toBeDefined();
    expect(MEDIA_VALIDATION_CONFIG.video).toBeDefined();
    expect(MEDIA_VALIDATION_CONFIG.audio).toBeDefined();
    expect(MEDIA_VALIDATION_CONFIG.corto_cine).toBeDefined();
    
    // Verificar estructura de configuración para fotografía
    const fotoConfig = MEDIA_VALIDATION_CONFIG.fotografia;
    expect(fotoConfig.formats).toBeDefined();
    expect(fotoConfig.maxSizeMB).toBeDefined();
    expect(fotoConfig.maxDimensions).toBeDefined();
    expect(fotoConfig.extensions).toBeDefined();
    expect(Array.isArray(fotoConfig.formats)).toBe(true);
    expect(Array.isArray(fotoConfig.extensions)).toBe(true);
    expect(fotoConfig.maxSizeMB).toBe(10);
    expect(fotoConfig.maxDimensions.width).toBe(4000);
    expect(fotoConfig.maxDimensions.height).toBe(4000);
  });

  it('should have video validation config with correct properties', () => {
    const { MEDIA_VALIDATION_CONFIG } = require('../src/services/media.service');
    const videoConfig = MEDIA_VALIDATION_CONFIG.video;
    
    expect(videoConfig.formats).toContain('video/mp4');
    expect(videoConfig.formats).toContain('video/webm');
    expect(videoConfig.maxSizeMB).toBe(100);
    expect(videoConfig.maxDuration).toBe(600); // 10 minutos
    expect(videoConfig.extensions).toContain('.mp4');
    expect(videoConfig.extensions).toContain('.webm');
  });

  it('should have audio validation config with correct properties', () => {
    const { MEDIA_VALIDATION_CONFIG } = require('../src/services/media.service');
    const audioConfig = MEDIA_VALIDATION_CONFIG.audio;
    
    expect(audioConfig.formats).toContain('audio/mpeg');
    expect(audioConfig.formats).toContain('audio/wav');
    expect(audioConfig.maxSizeMB).toBe(50);
    expect(audioConfig.maxDuration).toBe(1800); // 30 minutos
    expect(audioConfig.extensions).toContain('.mp3');
    expect(audioConfig.extensions).toContain('.wav');
  });

  it('should have corto_cine validation config with correct properties', () => {
    const { MEDIA_VALIDATION_CONFIG } = require('../src/services/media.service');
    const cortoConfig = MEDIA_VALIDATION_CONFIG.corto_cine;
    
    expect(cortoConfig.formats).toContain('video/mp4');
    expect(cortoConfig.formats).toContain('video/webm');
    expect(cortoConfig.maxSizeMB).toBe(500);
    expect(cortoConfig.maxDuration).toBe(1800); // 30 minutos
    expect(cortoConfig.extensions).toContain('.mp4');
    expect(cortoConfig.extensions).toContain('.webm');
  });

  it('should have MediaService class defined with required methods', () => {
    const { MediaService } = require('../src/services/media.service');
    
    expect(MediaService).toBeDefined();
    
    // Verificar que los métodos están definidos
    const mediaService = new MediaService();
    expect(typeof mediaService.generateUploadUrl).toBe('function');
    expect(typeof mediaService.processUpload).toBe('function');
    expect(typeof mediaService.getMediaById).toBe('function');
    expect(typeof mediaService.getMediaByUser).toBe('function');
    expect(typeof mediaService.getMediaByContest).toBe('function');
    expect(typeof mediaService.deleteMedia).toBe('function');
    expect(typeof mediaService.getWinnerGallery).toBe('function');
    expect(typeof mediaService.getFeaturedGallery).toBe('function');
    expect(typeof mediaService.getCategoriesByMediaType).toBe('function');
  });

  it('should have MediaController class defined with required methods', () => {
    const { MediaController } = require('../src/controllers/media.controller');
    
    expect(MediaController).toBeDefined();
    
    // Verificar que los métodos están definidos
    const mediaController = new MediaController();
    expect(typeof mediaController.generateUploadUrl).toBe('function');
    expect(typeof mediaController.processUpload).toBe('function');
    expect(typeof mediaController.getMediaById).toBe('function');
    expect(typeof mediaController.getMediaByUser).toBe('function');
    expect(typeof mediaController.getMediaByContest).toBe('function');
    expect(typeof mediaController.updateMedia).toBe('function');
    expect(typeof mediaController.deleteMedia).toBe('function');
    expect(typeof mediaController.getValidationConfig).toBe('function');
    expect(typeof mediaController.getWinnerGallery).toBe('function');
    expect(typeof mediaController.getFeaturedGallery).toBe('function');
    expect(typeof mediaController.getCategoriesByMediaType).toBe('function');
  });
});