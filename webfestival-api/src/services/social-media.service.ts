import axios from 'axios';
import { z } from 'zod';

// Esquemas de validación
const ShareContentSchema = z.object({
  imageUrl: z.string().url(),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(500),
  hashtags: z.array(z.string()).max(10),
  link: z.string().url()
});

const ShareableLinkDataSchema = z.object({
  medioId: z.number(),
  titulo: z.string(),
  autorNombre: z.string(),
  concursoTitulo: z.string(),
  posicion: z.number(),
  tipoMedio: z.enum(['fotografia', 'video', 'audio', 'corto_cine']),
  medioUrl: z.string().url(),
  thumbnailUrl: z.string().url().optional()
});

export type ShareContent = z.infer<typeof ShareContentSchema>;
export type ShareableLinkData = z.infer<typeof ShareableLinkDataSchema>;

export interface SocialMediaConfig {
  facebook: {
    appId: string;
    appSecret: string;
  };
  instagram: {
    accessToken: string;
  };
  twitter: {
    apiKey: string;
    apiSecret: string;
  };
  linkedin: {
    clientId: string;
    clientSecret: string;
  };
  baseUrl: string;
}

export class SocialMediaService {
  private config: SocialMediaConfig;

  constructor() {
    this.config = {
      facebook: {
        appId: process.env['FACEBOOK_APP_ID'] || '',
        appSecret: process.env['FACEBOOK_APP_SECRET'] || ''
      },
      instagram: {
        accessToken: process.env['INSTAGRAM_ACCESS_TOKEN'] || ''
      },
      twitter: {
        apiKey: process.env['TWITTER_API_KEY'] || '',
        apiSecret: process.env['TWITTER_API_SECRET'] || ''
      },
      linkedin: {
        clientId: process.env['LINKEDIN_CLIENT_ID'] || '',
        clientSecret: process.env['LINKEDIN_CLIENT_SECRET'] || ''
      },
      baseUrl: process.env['SERVER_URL'] || 'http://localhost:3001'
    };
  }

  /**
   * Genera un enlace público compartible para un medio ganador
   * Requisito 11.2: Generar enlace público con contenido, título del concurso y posición
   */
  generateShareableLink(data: ShareableLinkData): string {
    const validatedData = ShareableLinkDataSchema.parse(data);
    
    // Generar slug amigable para SEO
    const slug = this.generateSlug(validatedData.titulo);
    const shareableUrl = `${this.config.baseUrl}/public/media/${validatedData.medioId}/${slug}`;
    
    return shareableUrl;
  }

  /**
   * Genera contenido optimizado para compartir en redes sociales
   * Requisito 11.3: Incluir hashtags relevantes del concurso y la plataforma
   */
  generateShareContent(data: ShareableLinkData): ShareContent {
    const validatedData = ShareableLinkDataSchema.parse(data);
    
    // Generar título optimizado
    const posicionTexto = this.getPosicionTexto(validatedData.posicion);
    const title = `🏆 ${posicionTexto} en ${validatedData.concursoTitulo}`;
    
    // Generar descripción
    const tipoMedioTexto = this.getTipoMedioTexto(validatedData.tipoMedio);
    const description = `"${validatedData.titulo}" por ${validatedData.autorNombre} - ${posicionTexto} en la categoría de ${tipoMedioTexto} del concurso ${validatedData.concursoTitulo}. ¡Descubre más talento creativo en WebFestival!`;
    
    // Generar hashtags relevantes
    const hashtags = this.generateHashtags(validatedData);
    
    // Generar enlace compartible
    const link = this.generateShareableLink(validatedData);
    
    const shareContent: ShareContent = {
      imageUrl: validatedData.thumbnailUrl || validatedData.medioUrl,
      title,
      description,
      hashtags,
      link
    };

    return ShareContentSchema.parse(shareContent);
  }

  /**
   * Genera URLs para compartir en Facebook
   * Requisito 11.1: Mostrar botones para compartir en Facebook
   */
  generateFacebookShareUrl(shareContent: ShareContent): string {
    const params = new URLSearchParams({
      u: shareContent.link,
      quote: `${shareContent.title}\n\n${shareContent.description}\n\n${shareContent.hashtags.map(tag => `#${tag}`).join(' ')}`
    });

    return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;
  }

  /**
   * Genera URLs para compartir en Twitter
   * Requisito 11.1: Mostrar botones para compartir en Twitter
   */
  generateTwitterShareUrl(shareContent: ShareContent): string {
    // Twitter tiene límite de 280 caracteres
    const tweetText = this.truncateForTwitter(shareContent.title, shareContent.hashtags);
    
    const params = new URLSearchParams({
      url: shareContent.link,
      text: tweetText,
      hashtags: shareContent.hashtags.slice(0, 5).join(',') // Máximo 5 hashtags
    });

    return `https://twitter.com/intent/tweet?${params.toString()}`;
  }

  /**
   * Genera URLs para compartir en LinkedIn
   * Requisito 11.1: Mostrar botones para compartir en LinkedIn
   */
  generateLinkedInShareUrl(shareContent: ShareContent): string {
    const params = new URLSearchParams({
      url: shareContent.link,
      title: shareContent.title,
      summary: shareContent.description,
      source: 'WebFestival'
    });

    return `https://www.linkedin.com/sharing/share-offsite/?${params.toString()}`;
  }

  /**
   * Genera metadatos Open Graph para previews en redes sociales
   * Requisito 11.4: Open Graph tags para previews
   */
  generateOpenGraphMetadata(data: ShareableLinkData): Record<string, string> {
    const validatedData = ShareableLinkDataSchema.parse(data);
    const shareContent = this.generateShareContent(validatedData);
    
    return {
      'og:type': 'article',
      'og:title': shareContent.title,
      'og:description': shareContent.description,
      'og:image': shareContent.imageUrl,
      'og:url': shareContent.link,
      'og:site_name': 'WebFestival',
      'og:locale': 'es_ES',
      
      // Twitter Card metadata
      'twitter:card': 'summary_large_image',
      'twitter:site': '@WebFestival',
      'twitter:title': shareContent.title,
      'twitter:description': shareContent.description,
      'twitter:image': shareContent.imageUrl,
      
      // Metadatos adicionales
      'article:author': validatedData.autorNombre,
      'article:section': validatedData.concursoTitulo,
      'article:tag': shareContent.hashtags.join(', ')
    };
  }

  /**
   * Obtiene todas las URLs de compartir para un medio
   */
  getAllShareUrls(data: ShareableLinkData): {
    facebook: string;
    twitter: string;
    linkedin: string;
    instagram: string; // URL para copiar
    shareableLink: string;
  } {
    const shareContent = this.generateShareContent(data);
    
    return {
      facebook: this.generateFacebookShareUrl(shareContent),
      twitter: this.generateTwitterShareUrl(shareContent),
      linkedin: this.generateLinkedInShareUrl(shareContent),
      instagram: shareContent.link, // Instagram no permite URLs directas, se copia el enlace
      shareableLink: shareContent.link
    };
  }

  /**
   * Valida la configuración de APIs de redes sociales
   */
  validateConfiguration(): { isValid: boolean; missingKeys: string[] } {
    const missingKeys: string[] = [];
    
    if (!this.config.facebook.appId) missingKeys.push('FACEBOOK_APP_ID');
    if (!this.config.facebook.appSecret) missingKeys.push('FACEBOOK_APP_SECRET');
    if (!this.config.instagram.accessToken) missingKeys.push('INSTAGRAM_ACCESS_TOKEN');
    if (!this.config.twitter.apiKey) missingKeys.push('TWITTER_API_KEY');
    if (!this.config.twitter.apiSecret) missingKeys.push('TWITTER_API_SECRET');
    if (!this.config.linkedin.clientId) missingKeys.push('LINKEDIN_CLIENT_ID');
    if (!this.config.linkedin.clientSecret) missingKeys.push('LINKEDIN_CLIENT_SECRET');
    
    return {
      isValid: missingKeys.length === 0,
      missingKeys
    };
  }

  // Métodos auxiliares privados
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
      .replace(/\s+/g, '-') // Reemplazar espacios con guiones
      .replace(/-+/g, '-') // Remover guiones duplicados
      .trim();
  }

  private getPosicionTexto(posicion: number): string {
    switch (posicion) {
      case 1: return '🥇 Primer lugar';
      case 2: return '🥈 Segundo lugar';
      case 3: return '🥉 Tercer lugar';
      default: return `🏅 Posición ${posicion}`;
    }
  }

  private getTipoMedioTexto(tipoMedio: string): string {
    switch (tipoMedio) {
      case 'fotografia': return 'fotografía';
      case 'video': return 'video';
      case 'audio': return 'audio';
      case 'corto_cine': return 'cortometraje';
      default: return 'multimedia';
    }
  }

  private generateHashtags(data: ShareableLinkData): string[] {
    const hashtags = ['WebFestival', 'ConcursoMultimedia'];
    
    // Agregar hashtag del tipo de medio
    switch (data.tipoMedio) {
      case 'fotografia':
        hashtags.push('Fotografia', 'Photography');
        break;
      case 'video':
        hashtags.push('Video', 'Videomaker');
        break;
      case 'audio':
        hashtags.push('Audio', 'Musica');
        break;
      case 'corto_cine':
        hashtags.push('Cortometraje', 'Cine');
        break;
    }
    
    // Agregar hashtag de posición si es ganador
    if (data.posicion <= 3) {
      hashtags.push('Ganador', 'Winner');
    }
    
    // Agregar hashtag del concurso (simplificado)
    const concursoTag = data.concursoTitulo
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '')
      .substring(0, 20);
    
    if (concursoTag) {
      hashtags.push(concursoTag);
    }
    
    return hashtags.slice(0, 8); // Máximo 8 hashtags
  }

  private truncateForTwitter(title: string, hashtags: string[]): string {
    const hashtagsText = hashtags.slice(0, 3).map(tag => `#${tag}`).join(' ');
    const maxTitleLength = 280 - hashtagsText.length - 25; // 25 chars para URL
    
    if (title.length <= maxTitleLength) {
      return `${title} ${hashtagsText}`;
    }
    
    return `${title.substring(0, maxTitleLength - 3)}... ${hashtagsText}`;
  }
}

export const socialMediaService = new SocialMediaService();