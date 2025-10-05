/// <reference types="jest" />

// IMPORTANTE: NO IMPORTAR FUNCIONES DE 'node:test' - USAR JEST GLOBALS
// Jest proporciona describe, it, expect, beforeEach, afterEach globalmente
// El autofix de Kiro IDE puede agregar importaciones incorrectas - eliminarlas siempre

import { socialMediaService, ShareableLinkData } from '../src/services/social-media.service';

describe('SocialMediaService', () => {
  const mockShareData: ShareableLinkData = {
    medioId: 1,
    titulo: 'Atardecer en la Montaña',
    autorNombre: 'Juan Pérez',
    concursoTitulo: 'Concurso Nacional de Fotografía 2024',
    posicion: 1,
    tipoMedio: 'fotografia',
    medioUrl: 'https://example.com/media/sunset.jpg',
    thumbnailUrl: 'https://example.com/media/sunset-thumb.jpg'
  };

  beforeEach(() => {
    // Configurar variables de entorno para pruebas
    process.env['SERVER_URL'] = 'http://localhost:3001';
    process.env['FACEBOOK_APP_ID'] = 'test-facebook-id';
    process.env['FACEBOOK_APP_SECRET'] = 'test-facebook-secret';
    process.env['TWITTER_API_KEY'] = 'test-twitter-key';
    process.env['TWITTER_API_SECRET'] = 'test-twitter-secret';
    process.env['LINKEDIN_CLIENT_ID'] = 'test-linkedin-id';
    process.env['LINKEDIN_CLIENT_SECRET'] = 'test-linkedin-secret';
    process.env['INSTAGRAM_ACCESS_TOKEN'] = 'test-instagram-token';
  });

  describe('generateShareableLink', () => {
    it('debe generar un enlace compartible válido', () => {
      const link = socialMediaService.generateShareableLink(mockShareData);
      
      expect(link).toContain('http://localhost:3001/public/media/1/');
      expect(link).toContain('atardecer-en-la-montana');
    });

    it('debe generar slug sin caracteres especiales', () => {
      const dataConAcentos = {
        ...mockShareData,
        titulo: 'Fotografía Artística con Ñ y Acentos'
      };
      
      const link = socialMediaService.generateShareableLink(dataConAcentos);
      
      expect(link).toContain('fotografia-artistica-con-n-y-acentos');
      expect(link).not.toContain('ñ');
      expect(link).not.toContain('í');
    });
  });

  describe('generateShareContent', () => {
    it('debe generar contenido para compartir con título correcto', () => {
      const content = socialMediaService.generateShareContent(mockShareData);
      
      expect(content.title).toBe('🏆 🥇 Primer lugar en Concurso Nacional de Fotografía 2024');
      expect(content.description).toContain('Juan Pérez');
      expect(content.description).toContain('Atardecer en la Montaña');
      expect(content.hashtags).toContain('WebFestival');
      expect(content.hashtags).toContain('Fotografia');
    });

    it('debe generar títulos diferentes según la posición', () => {
      const content1 = socialMediaService.generateShareContent({ ...mockShareData, posicion: 1 });
      const content2 = socialMediaService.generateShareContent({ ...mockShareData, posicion: 2 });
      const content3 = socialMediaService.generateShareContent({ ...mockShareData, posicion: 3 });
      
      expect(content1.title).toContain('🥇 Primer lugar');
      expect(content2.title).toContain('🥈 Segundo lugar');
      expect(content3.title).toContain('🥉 Tercer lugar');
    });

    it('debe generar hashtags específicos por tipo de medio', () => {
      const contentFoto = socialMediaService.generateShareContent({ ...mockShareData, tipoMedio: 'fotografia' });
      const contentVideo = socialMediaService.generateShareContent({ ...mockShareData, tipoMedio: 'video' });
      const contentAudio = socialMediaService.generateShareContent({ ...mockShareData, tipoMedio: 'audio' });
      const contentCine = socialMediaService.generateShareContent({ ...mockShareData, tipoMedio: 'corto_cine' });
      
      expect(contentFoto.hashtags).toContain('Fotografia');
      expect(contentVideo.hashtags).toContain('Video');
      expect(contentAudio.hashtags).toContain('Audio');
      expect(contentCine.hashtags).toContain('Cortometraje');
    });

    it('debe incluir hashtag de ganador para primeros 3 lugares', () => {
      const content1 = socialMediaService.generateShareContent({ ...mockShareData, posicion: 1 });
      const content2 = socialMediaService.generateShareContent({ ...mockShareData, posicion: 2 });
      const content3 = socialMediaService.generateShareContent({ ...mockShareData, posicion: 3 });
      const content4 = socialMediaService.generateShareContent({ ...mockShareData, posicion: 4 });
      
      expect(content1.hashtags).toContain('Ganador');
      expect(content2.hashtags).toContain('Ganador');
      expect(content3.hashtags).toContain('Ganador');
      expect(content4.hashtags).not.toContain('Ganador');
    });
  });

  describe('generateFacebookShareUrl', () => {
    it('debe generar URL válida para Facebook', () => {
      const shareContent = socialMediaService.generateShareContent(mockShareData);
      const facebookUrl = socialMediaService.generateFacebookShareUrl(shareContent);
      
      expect(facebookUrl).toContain('facebook.com/sharer/sharer.php');
      expect(facebookUrl).toContain('u=');
      expect(facebookUrl).toContain('quote=');
    });
  });

  describe('generateTwitterShareUrl', () => {
    it('debe generar URL válida para Twitter', () => {
      const shareContent = socialMediaService.generateShareContent(mockShareData);
      const twitterUrl = socialMediaService.generateTwitterShareUrl(shareContent);
      
      expect(twitterUrl).toContain('twitter.com/intent/tweet');
      expect(twitterUrl).toContain('url=');
      expect(twitterUrl).toContain('text=');
      expect(twitterUrl).toContain('hashtags=');
    });

    it('debe truncar texto largo para Twitter', () => {
      const dataLarga = {
        ...mockShareData,
        titulo: 'Este es un título extremadamente largo que definitivamente excederá los límites de caracteres de Twitter y necesita ser truncado apropiadamente'
      };
      
      const shareContent = socialMediaService.generateShareContent(dataLarga);
      const twitterUrl = socialMediaService.generateTwitterShareUrl(shareContent);
      
      // Extraer parámetros de la URL
      const urlParams = new URLSearchParams(twitterUrl.split('?')[1]);
      const text = urlParams.get('text') || '';
      
      // El texto total (incluyendo hashtags y URL) debe ser menor a 280 caracteres
      expect(text.length).toBeLessThan(280);
    });

    it('debe limitar hashtags a máximo 5 para Twitter', () => {
      const shareContent = socialMediaService.generateShareContent(mockShareData);
      const twitterUrl = socialMediaService.generateTwitterShareUrl(shareContent);
      
      const urlParams = new URLSearchParams(twitterUrl.split('?')[1]);
      const hashtags = urlParams.get('hashtags')?.split(',') || [];
      
      expect(hashtags.length).toBeLessThanOrEqual(5);
    });
  });

  describe('generateLinkedInShareUrl', () => {
    it('debe generar URL válida para LinkedIn', () => {
      const shareContent = socialMediaService.generateShareContent(mockShareData);
      const linkedinUrl = socialMediaService.generateLinkedInShareUrl(shareContent);
      
      expect(linkedinUrl).toContain('linkedin.com/sharing/share-offsite');
      expect(linkedinUrl).toContain('url=');
      expect(linkedinUrl).toContain('title=');
      expect(linkedinUrl).toContain('summary=');
      expect(linkedinUrl).toContain('source=WebFestival');
    });
  });

  describe('generateOpenGraphMetadata', () => {
    it('debe generar metadatos Open Graph completos', () => {
      const metadata = socialMediaService.generateOpenGraphMetadata(mockShareData);
      
      expect(metadata['og:type']).toBe('article');
      expect(metadata['og:title']).toContain('Primer lugar');
      expect(metadata['og:description']).toContain('Juan Pérez');
      expect(metadata['og:image']).toBe(mockShareData.thumbnailUrl);
      expect(metadata['og:url']).toContain('public/media/1');
      expect(metadata['og:site_name']).toBe('WebFestival');
      expect(metadata['og:locale']).toBe('es_ES');
    });

    it('debe incluir metadatos de Twitter Card', () => {
      const metadata = socialMediaService.generateOpenGraphMetadata(mockShareData);
      
      expect(metadata['twitter:card']).toBe('summary_large_image');
      expect(metadata['twitter:site']).toBe('@WebFestival');
      expect(metadata['twitter:title']).toContain('Primer lugar');
      expect(metadata['twitter:description']).toContain('Juan Pérez');
      expect(metadata['twitter:image']).toBe(mockShareData.thumbnailUrl);
    });

    it('debe incluir metadatos de artículo', () => {
      const metadata = socialMediaService.generateOpenGraphMetadata(mockShareData);
      
      expect(metadata['article:author']).toBe('Juan Pérez');
      expect(metadata['article:section']).toBe('Concurso Nacional de Fotografía 2024');
      expect(metadata['article:tag']).toContain('WebFestival');
    });
  });

  describe('getAllShareUrls', () => {
    it('debe generar todas las URLs de compartir', () => {
      const shareUrls = socialMediaService.getAllShareUrls(mockShareData);
      
      expect(shareUrls.facebook).toContain('facebook.com');
      expect(shareUrls.twitter).toContain('twitter.com');
      expect(shareUrls.linkedin).toContain('linkedin.com');
      expect(shareUrls.instagram).toContain('public/media/1');
      expect(shareUrls.shareableLink).toContain('public/media/1');
    });
  });

  describe('validateConfiguration', () => {
    it('debe validar configuración completa', () => {
      // Crear una nueva instancia del servicio para evitar interferencias
      const { SocialMediaService } = require('../src/services/social-media.service');
      const testService = new SocialMediaService();
      const validation = testService.validateConfiguration();
      
      expect(validation.isValid).toBe(true);
      expect(validation.missingKeys).toHaveLength(0);
    });

    it('debe detectar claves faltantes', () => {
      delete process.env['FACEBOOK_APP_ID'];
      delete process.env['TWITTER_API_KEY'];
      
      const validation = socialMediaService.validateConfiguration();
      
      expect(validation.isValid).toBe(false);
      expect(validation.missingKeys).toContain('FACEBOOK_APP_ID');
      expect(validation.missingKeys).toContain('TWITTER_API_KEY');
    });
  });

  describe('Validación de datos de entrada', () => {
    it('debe rechazar datos inválidos', () => {
      const datosInvalidos = {
        ...mockShareData,
        medioId: -1, // ID inválido
        tipoMedio: 'invalido' as any
      };
      
      expect(() => {
        socialMediaService.generateShareableLink(datosInvalidos);
      }).toThrow();
    });

    it('debe rechazar URLs inválidas', () => {
      const datosInvalidos = {
        ...mockShareData,
        medioUrl: 'url-invalida'
      };
      
      expect(() => {
        socialMediaService.generateShareableLink(datosInvalidos);
      }).toThrow();
    });
  });

  describe('Casos edge', () => {
    it('debe manejar títulos vacíos', () => {
      const datosVacios = {
        ...mockShareData,
        titulo: ''
      };
      
      expect(() => {
        socialMediaService.generateShareableLink(datosVacios);
      }).toThrow();
    });

    it('debe manejar nombres de autor vacíos', () => {
      const datosVacios = {
        ...mockShareData,
        autorNombre: ''
      };
      
      expect(() => {
        socialMediaService.generateShareableLink(datosVacios);
      }).toThrow();
    });

    it('debe usar medioUrl si no hay thumbnailUrl', () => {
      const sinThumbnail = {
        ...mockShareData,
        thumbnailUrl: undefined
      };
      
      const content = socialMediaService.generateShareContent(sinThumbnail);
      expect(content.imageUrl).toBe(mockShareData.medioUrl);
    });
  });
});