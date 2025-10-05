# Integración Frontend - Sistema de Redes Sociales

## Componentes React Listos para Usar

### 1. Hook Personalizado para Redes Sociales

```jsx
// hooks/useSocialMediaShare.js
import { useState, useCallback } from 'react';
import axios from 'axios';

export const useSocialMediaShare = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [shareData, setShareData] = useState(null);

  const generateShareLinks = useCallback(async (medioId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/v1/social-media/share-links', 
        { medioId },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      setShareData(response.data.data);
      return response.data.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error generando enlaces';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const openShareWindow = useCallback((url, platform) => {
    const width = 600;
    const height = 400;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    
    window.open(
      url,
      `share-${platform}`,
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );
  }, []);

  const copyToClipboard = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // Fallback para navegadores sin soporte
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    }
  }, []);

  return {
    loading,
    error,
    shareData,
    generateShareLinks,
    openShareWindow,
    copyToClipboard
  };
};
```

### 2. Componente de Botones de Compartir

```jsx
// components/ShareButtons.jsx
import React, { useState } from 'react';
import { useSocialMediaShare } from '../hooks/useSocialMediaShare';
import './ShareButtons.css';

const ShareButtons = ({ medioId, className = '' }) => {
  const { 
    loading, 
    error, 
    shareData, 
    generateShareLinks, 
    openShareWindow, 
    copyToClipboard 
  } = useSocialMediaShare();
  
  const [showLinks, setShowLinks] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');

  const handleGenerateLinks = async () => {
    try {
      await generateShareLinks(medioId);
      setShowLinks(true);
    } catch (err) {
      console.error('Error generando enlaces:', err);
    }
  };

  const handleShare = (platform) => {
    if (!shareData?.shareUrls?.[platform]) return;
    
    const url = shareData.shareUrls[platform];
    
    if (platform === 'instagram') {
      handleCopyLink(url);
    } else {
      openShareWindow(url, platform);
    }
  };

  const handleCopyLink = async (url) => {
    try {
      await copyToClipboard(url);
      setCopySuccess('¡Enlace copiado!');
      setTimeout(() => setCopySuccess(''), 3000);
    } catch (err) {
      setCopySuccess('Error copiando enlace');
      setTimeout(() => setCopySuccess(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className={`share-buttons loading ${className}`}>
        <div className="spinner"></div>
        <span>Generando enlaces...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`share-buttons error ${className}`}>
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          {error}
        </div>
      </div>
    );
  }

  if (!showLinks) {
    return (
      <div className={`share-buttons ${className}`}>
        <button 
          className="generate-links-btn"
          onClick={handleGenerateLinks}
        >
          <i className="fas fa-share-alt"></i>
          Compartir en Redes Sociales
        </button>
      </div>
    );
  }

  return (
    <div className={`share-buttons active ${className}`}>
      <div className="share-header">
        <h4>¡Comparte tu logro!</h4>
        <p>{shareData.shareContent.title}</p>
      </div>
      
      <div className="social-platforms">
        <button
          className="social-btn facebook"
          onClick={() => handleShare('facebook')}
          title="Compartir en Facebook"
        >
          <i className="fab fa-facebook-f"></i>
          <span>Facebook</span>
        </button>
        
        <button
          className="social-btn twitter"
          onClick={() => handleShare('twitter')}
          title="Compartir en Twitter"
        >
          <i className="fab fa-twitter"></i>
          <span>Twitter</span>
        </button>
        
        <button
          className="social-btn linkedin"
          onClick={() => handleShare('linkedin')}
          title="Compartir en LinkedIn"
        >
          <i className="fab fa-linkedin-in"></i>
          <span>LinkedIn</span>
        </button>
        
        <button
          className="social-btn instagram"
          onClick={() => handleShare('instagram')}
          title="Copiar enlace para Instagram"
        >
          <i className="fab fa-instagram"></i>
          <span>Instagram</span>
        </button>
        
        <button
          className="social-btn copy-link"
          onClick={() => handleCopyLink(shareData.shareUrls.shareableLink)}
          title="Copiar enlace"
        >
          <i className="fas fa-link"></i>
          <span>Copiar enlace</span>
        </button>
      </div>
      
      {copySuccess && (
        <div className="copy-success">
          <i className="fas fa-check"></i>
          {copySuccess}
        </div>
      )}
      
      <div className="hashtags">
        <p>Hashtags sugeridos:</p>
        <div className="hashtag-list">
          {shareData.shareContent.hashtags.map((tag, index) => (
            <span key={index} className="hashtag">#{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShareButtons;
```

### 3. Estilos CSS para los Componentes

```css
/* components/ShareButtons.css */
.share-buttons {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  margin: 0 auto;
}

.share-buttons.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 20px;
  color: #666;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.share-buttons.error {
  padding: 20px;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #dc3545;
  font-size: 14px;
}

.generate-links-btn {
  width: 100%;
  padding: 16px 24px;
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.generate-links-btn:hover {
  background: linear-gradient(135deg, #0056b3, #004085);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 123, 255, 0.3);
}

.share-header {
  text-align: center;
  margin-bottom: 24px;
}

.share-header h4 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

.share-header p {
  margin: 0;
  color: #666;
  font-size: 14px;
  line-height: 1.4;
}

.social-platforms {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.social-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 12px;
  font-weight: 500;
  text-decoration: none;
  color: white;
}

.social-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.social-btn i {
  font-size: 20px;
}

.social-btn.facebook {
  background: linear-gradient(135deg, #1877f2, #166fe5);
}

.social-btn.twitter {
  background: linear-gradient(135deg, #1da1f2, #0d8bd9);
}

.social-btn.linkedin {
  background: linear-gradient(135deg, #0077b5, #005885);
}

.social-btn.instagram {
  background: linear-gradient(135deg, #e4405f, #c13584, #833ab4);
}

.social-btn.copy-link {
  background: linear-gradient(135deg, #6c757d, #545b62);
}

.copy-success {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: #d4edda;
  color: #155724;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 14px;
  font-weight: 500;
}

.hashtags {
  border-top: 1px solid #eee;
  padding-top: 16px;
}

.hashtags p {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.hashtag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hashtag {
  background: #f8f9fa;
  color: #007bff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid #e9ecef;
}

/* Responsive */
@media (max-width: 768px) {
  .share-buttons {
    margin: 0 16px;
    padding: 16px;
  }
  
  .social-platforms {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .social-btn {
    padding: 12px 8px;
    font-size: 11px;
  }
  
  .social-btn i {
    font-size: 18px;
  }
}
```

### 4. Componente para Medios Públicos

```jsx
// components/PublicMediaViewer.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ShareButtons from './ShareButtons';
import './PublicMediaViewer.css';

const PublicMediaViewer = () => {
  const { medioId, slug } = useParams();
  const [mediaData, setMediaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMediaData = async () => {
      try {
        const url = `/api/v1/social-media/public/media/${medioId}${slug ? '/' + slug : ''}`;
        const response = await axios.get(url);
        setMediaData(response.data.data);
        
        // Inyectar metadatos Open Graph
        injectOpenGraphMetadata(response.data.data.openGraph);
      } catch (err) {
        setError(err.response?.data?.message || 'Error cargando el medio');
      } finally {
        setLoading(false);
      }
    };

    fetchMediaData();
  }, [medioId, slug]);

  const injectOpenGraphMetadata = (openGraph) => {
    // Limpiar metadatos existentes
    const existingMetas = document.querySelectorAll('meta[property^="og:"], meta[property^="twitter:"], meta[property^="article:"]');
    existingMetas.forEach(meta => meta.remove());

    // Inyectar nuevos metadatos
    Object.entries(openGraph).forEach(([property, content]) => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', property);
      meta.setAttribute('content', content);
      document.head.appendChild(meta);
    });

    // Actualizar título de la página
    document.title = openGraph['og:title'] || 'WebFestival';
  };

  const renderMediaContent = () => {
    const { medio } = mediaData;
    
    switch (medio.tipoMedio) {
      case 'fotografia':
        return (
          <img 
            src={medio.previewUrl || medio.medioUrl} 
            alt={medio.titulo}
            className="media-content photo"
          />
        );
      
      case 'video':
      case 'corto_cine':
        return (
          <video 
            src={medio.medioUrl}
            poster={medio.thumbnailUrl}
            controls
            className="media-content video"
          >
            Tu navegador no soporta el elemento video.
          </video>
        );
      
      case 'audio':
        return (
          <div className="audio-player">
            {medio.thumbnailUrl && (
              <img 
                src={medio.thumbnailUrl} 
                alt={medio.titulo}
                className="audio-cover"
              />
            )}
            <audio 
              src={medio.medioUrl}
              controls
              className="media-content audio"
            >
              Tu navegador no soporta el elemento audio.
            </audio>
          </div>
        );
      
      default:
        return (
          <div className="media-placeholder">
            <i className="fas fa-file"></i>
            <p>Tipo de medio no soportado</p>
          </div>
        );
    }
  };

  const getPosicionIcon = (posicion) => {
    switch (posicion) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏅';
    }
  };

  if (loading) {
    return (
      <div className="public-media-viewer loading">
        <div className="spinner-large"></div>
        <p>Cargando medio...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="public-media-viewer error">
        <div className="error-container">
          <i className="fas fa-exclamation-triangle"></i>
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.history.back()}>
            Volver
          </button>
        </div>
      </div>
    );
  }

  const { medio, autor, concurso, categoria, resultado, estadisticas } = mediaData;

  return (
    <div className="public-media-viewer">
      <div className="media-container">
        <div className="media-header">
          <div className="position-badge">
            {getPosicionIcon(resultado?.posicion)} 
            Posición {resultado?.posicion}
          </div>
          <h1>{medio.titulo}</h1>
        </div>

        <div className="media-display">
          {renderMediaContent()}
        </div>

        <div className="media-info">
          <div className="author-info">
            <div className="author-avatar">
              {autor.pictureUrl ? (
                <img src={autor.pictureUrl} alt={autor.nombre} />
              ) : (
                <div className="avatar-placeholder">
                  <i className="fas fa-user"></i>
                </div>
              )}
            </div>
            <div className="author-details">
              <h3>{autor.nombre}</h3>
              <p>Artista</p>
            </div>
          </div>

          <div className="contest-info">
            <h4>{concurso.titulo}</h4>
            <p className="category">Categoría: {categoria.nombre}</p>
            <p className="description">{concurso.descripcion}</p>
          </div>

          {estadisticas && (
            <div className="statistics">
              <h4>Estadísticas de Evaluación</h4>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-value">{estadisticas.puntajePromedio}</span>
                  <span className="stat-label">Puntaje Promedio</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{estadisticas.totalJurados}</span>
                  <span className="stat-label">Jurados</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{estadisticas.criteriosEvaluados}</span>
                  <span className="stat-label">Criterios</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="share-section">
          <ShareButtons medioId={medio.id} />
        </div>
      </div>
    </div>
  );
};

export default PublicMediaViewer;
```

## Integración con Vue.js

### 1. Composable para Vue 3

```javascript
// composables/useSocialMediaShare.js
import { ref, computed } from 'vue';
import axios from 'axios';

export function useSocialMediaShare() {
  const loading = ref(false);
  const error = ref(null);
  const shareData = ref(null);

  const isShareable = computed(() => {
    return shareData.value && shareData.value.shareUrls;
  });

  const generateShareLinks = async (medioId) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await axios.post('/api/v1/social-media/share-links', 
        { medioId },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      shareData.value = response.data.data;
      return response.data.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error generando enlaces';
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  const shareToSocial = (platform) => {
    if (!shareData.value?.shareUrls?.[platform]) return;
    
    const url = shareData.value.shareUrls[platform];
    
    if (platform === 'instagram') {
      // Para Instagram, copiar al portapapeles
      navigator.clipboard.writeText(url).then(() => {
        alert('Enlace copiado al portapapeles');
      });
    } else {
      // Abrir ventana de compartir
      const width = 600;
      const height = 400;
      const left = (window.innerWidth - width) / 2;
      const top = (window.innerHeight - height) / 2;
      
      window.open(
        url, 
        `share-${platform}`, 
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
      );
    }
  };

  return {
    loading,
    error,
    shareData,
    isShareable,
    generateShareLinks,
    shareToSocial
  };
}
```

### 2. Componente Vue

```vue
<!-- components/ShareButtons.vue -->
<template>
  <div class="share-buttons" :class="{ loading, error: !!error }">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <span>Generando enlaces...</span>
    </div>
    
    <div v-else-if="error" class="error-state">
      <i class="fas fa-exclamation-triangle"></i>
      {{ error }}
    </div>
    
    <div v-else-if="!isShareable" class="initial-state">
      <button @click="handleGenerateLinks" class="generate-btn">
        <i class="fas fa-share-alt"></i>
        Compartir en Redes Sociales
      </button>
    </div>
    
    <div v-else class="share-active">
      <div class="share-header">
        <h4>¡Comparte tu logro!</h4>
        <p>{{ shareData.shareContent.title }}</p>
      </div>
      
      <div class="social-platforms">
        <button
          v-for="platform in platforms"
          :key="platform.name"
          @click="shareToSocial(platform.name)"
          :class="['social-btn', platform.name]"
          :title="platform.title"
        >
          <i :class="platform.icon"></i>
          <span>{{ platform.label }}</span>
        </button>
      </div>
      
      <div class="hashtags">
        <p>Hashtags sugeridos:</p>
        <div class="hashtag-list">
          <span
            v-for="(tag, index) in shareData.shareContent.hashtags"
            :key="index"
            class="hashtag"
          >
            #{{ tag }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useSocialMediaShare } from '../composables/useSocialMediaShare';

const props = defineProps({
  medioId: {
    type: Number,
    required: true
  }
});

const { 
  loading, 
  error, 
  shareData, 
  isShareable, 
  generateShareLinks, 
  shareToSocial 
} = useSocialMediaShare();

const platforms = computed(() => [
  {
    name: 'facebook',
    label: 'Facebook',
    icon: 'fab fa-facebook-f',
    title: 'Compartir en Facebook'
  },
  {
    name: 'twitter',
    label: 'Twitter',
    icon: 'fab fa-twitter',
    title: 'Compartir en Twitter'
  },
  {
    name: 'linkedin',
    label: 'LinkedIn',
    icon: 'fab fa-linkedin-in',
    title: 'Compartir en LinkedIn'
  },
  {
    name: 'instagram',
    label: 'Instagram',
    icon: 'fab fa-instagram',
    title: 'Copiar enlace para Instagram'
  }
]);

const handleGenerateLinks = async () => {
  try {
    await generateShareLinks(props.medioId);
  } catch (err) {
    console.error('Error generando enlaces:', err);
  }
};
</script>

<style scoped>
/* Usar los mismos estilos CSS del componente React */
</style>
```

## Integración con Angular

### 1. Servicio Angular

```typescript
// services/social-media-share.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface ShareData {
  medio: any;
  shareUrls: {
    facebook: string;
    twitter: string;
    linkedin: string;
    instagram: string;
    shareableLink: string;
  };
  shareContent: {
    title: string;
    description: string;
    hashtags: string[];
    link: string;
    imageUrl: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class SocialMediaShareService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);
  private shareDataSubject = new BehaviorSubject<ShareData | null>(null);

  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();
  public shareData$ = this.shareDataSubject.asObservable();

  constructor(private http: HttpClient) {}

  generateShareLinks(medioId: number): Observable<ShareData> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<any>('/api/v1/social-media/share-links', 
      { medioId }, 
      { headers }
    ).pipe(
      tap(response => {
        this.shareDataSubject.next(response.data);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        const errorMessage = error.error?.message || 'Error generando enlaces';
        this.errorSubject.next(errorMessage);
        this.loadingSubject.next(false);
        return throwError(errorMessage);
      })
    );
  }

  shareToSocial(platform: string): void {
    const shareData = this.shareDataSubject.value;
    if (!shareData?.shareUrls?.[platform]) return;

    const url = shareData.shareUrls[platform];

    if (platform === 'instagram') {
      this.copyToClipboard(url);
    } else {
      this.openShareWindow(url, platform);
    }
  }

  private openShareWindow(url: string, platform: string): void {
    const width = 600;
    const height = 400;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;

    window.open(
      url,
      `share-${platform}`,
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );
  }

  private async copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      alert('Enlace copiado al portapapeles');
    } catch (err) {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Enlace copiado al portapapeles');
    }
  }
}
```

### 2. Componente Angular

```typescript
// components/share-buttons.component.ts
import { Component, Input, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SocialMediaShareService, ShareData } from '../services/social-media-share.service';

@Component({
  selector: 'app-share-buttons',
  templateUrl: './share-buttons.component.html',
  styleUrls: ['./share-buttons.component.css']
})
export class ShareButtonsComponent implements OnDestroy {
  @Input() medioId!: number;

  loading = false;
  error: string | null = null;
  shareData: ShareData | null = null;

  platforms = [
    {
      name: 'facebook',
      label: 'Facebook',
      icon: 'fab fa-facebook-f',
      title: 'Compartir en Facebook'
    },
    {
      name: 'twitter',
      label: 'Twitter',
      icon: 'fab fa-twitter',
      title: 'Compartir en Twitter'
    },
    {
      name: 'linkedin',
      label: 'LinkedIn',
      icon: 'fab fa-linkedin-in',
      title: 'Compartir en LinkedIn'
    },
    {
      name: 'instagram',
      label: 'Instagram',
      icon: 'fab fa-instagram',
      title: 'Copiar enlace para Instagram'
    }
  ];

  private destroy$ = new Subject<void>();

  constructor(private socialMediaService: SocialMediaShareService) {
    this.socialMediaService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loading = loading);

    this.socialMediaService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => this.error = error);

    this.socialMediaService.shareData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(shareData => this.shareData = shareData);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  generateShareLinks(): void {
    this.socialMediaService.generateShareLinks(this.medioId).subscribe();
  }

  shareToSocial(platform: string): void {
    this.socialMediaService.shareToSocial(platform);
  }

  get isShareable(): boolean {
    return !!(this.shareData && this.shareData.shareUrls);
  }
}
```

```html
<!-- share-buttons.component.html -->
<div class="share-buttons" [ngClass]="{ loading: loading, error: !!error }">
  <div *ngIf="loading" class="loading-state">
    <div class="spinner"></div>
    <span>Generando enlaces...</span>
  </div>
  
  <div *ngIf="error && !loading" class="error-state">
    <i class="fas fa-exclamation-triangle"></i>
    {{ error }}
  </div>
  
  <div *ngIf="!isShareable && !loading && !error" class="initial-state">
    <button (click)="generateShareLinks()" class="generate-btn">
      <i class="fas fa-share-alt"></i>
      Compartir en Redes Sociales
    </button>
  </div>
  
  <div *ngIf="isShareable && !loading" class="share-active">
    <div class="share-header">
      <h4>¡Comparte tu logro!</h4>
      <p>{{ shareData?.shareContent.title }}</p>
    </div>
    
    <div class="social-platforms">
      <button
        *ngFor="let platform of platforms"
        (click)="shareToSocial(platform.name)"
        [class]="'social-btn ' + platform.name"
        [title]="platform.title"
      >
        <i [class]="platform.icon"></i>
        <span>{{ platform.label }}</span>
      </button>
    </div>
    
    <div class="hashtags">
      <p>Hashtags sugeridos:</p>
      <div class="hashtag-list">
        <span
          *ngFor="let tag of shareData?.shareContent.hashtags"
          class="hashtag"
        >
          #{{ tag }}
        </span>
      </div>
    </div>
  </div>
</div>
```

## Configuración de Meta Tags Dinámicos

### Para React (usando React Helmet)

```jsx
// components/MetaTags.jsx
import React from 'react';
import { Helmet } from 'react-helmet';

const MetaTags = ({ openGraphData }) => {
  if (!openGraphData) return null;

  return (
    <Helmet>
      <title>{openGraphData['og:title']}</title>
      <meta name="description" content={openGraphData['og:description']} />
      
      {/* Open Graph */}
      <meta property="og:type" content={openGraphData['og:type']} />
      <meta property="og:title" content={openGraphData['og:title']} />
      <meta property="og:description" content={openGraphData['og:description']} />
      <meta property="og:image" content={openGraphData['og:image']} />
      <meta property="og:url" content={openGraphData['og:url']} />
      <meta property="og:site_name" content={openGraphData['og:site_name']} />
      <meta property="og:locale" content={openGraphData['og:locale']} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content={openGraphData['twitter:card']} />
      <meta name="twitter:site" content={openGraphData['twitter:site']} />
      <meta name="twitter:title" content={openGraphData['twitter:title']} />
      <meta name="twitter:description" content={openGraphData['twitter:description']} />
      <meta name="twitter:image" content={openGraphData['twitter:image']} />
      
      {/* Article */}
      <meta property="article:author" content={openGraphData['article:author']} />
      <meta property="article:section" content={openGraphData['article:section']} />
      <meta property="article:tag" content={openGraphData['article:tag']} />
    </Helmet>
  );
};

export default MetaTags;
```

### Para Next.js

```jsx
// pages/public/media/[medioId]/[slug].js
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function PublicMedia() {
  const router = useRouter();
  const { medioId, slug } = router.query;
  const [mediaData, setMediaData] = useState(null);

  useEffect(() => {
    if (medioId) {
      fetchMediaData();
    }
  }, [medioId, slug]);

  const fetchMediaData = async () => {
    try {
      const url = `/api/v1/social-media/public/media/${medioId}${slug ? '/' + slug : ''}`;
      const response = await axios.get(url);
      setMediaData(response.data.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (!mediaData) return <div>Cargando...</div>;

  const { openGraph } = mediaData;

  return (
    <>
      <Head>
        <title>{openGraph['og:title']}</title>
        <meta name="description" content={openGraph['og:description']} />
        
        {/* Open Graph */}
        <meta property="og:type" content={openGraph['og:type']} />
        <meta property="og:title" content={openGraph['og:title']} />
        <meta property="og:description" content={openGraph['og:description']} />
        <meta property="og:image" content={openGraph['og:image']} />
        <meta property="og:url" content={openGraph['og:url']} />
        <meta property="og:site_name" content={openGraph['og:site_name']} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content={openGraph['twitter:card']} />
        <meta name="twitter:title" content={openGraph['twitter:title']} />
        <meta name="twitter:description" content={openGraph['twitter:description']} />
        <meta name="twitter:image" content={openGraph['twitter:image']} />
      </Head>
      
      <div>
        {/* Contenido del componente */}
      </div>
    </>
  );
}
```

## Mejores Prácticas de Integración

### 1. Manejo de Errores

```javascript
// utils/errorHandler.js
export const handleSocialMediaError = (error) => {
  const errorMessages = {
    400: 'Este medio no se puede compartir en este momento',
    401: 'Necesitas iniciar sesión para compartir',
    403: 'No tienes permisos para compartir este medio',
    404: 'El medio no fue encontrado',
    429: 'Demasiadas solicitudes. Intenta de nuevo más tarde'
  };

  const status = error.response?.status;
  return errorMessages[status] || 'Error inesperado. Intenta de nuevo.';
};
```

### 2. Caché de Enlaces

```javascript
// utils/shareCache.js
class ShareCache {
  constructor() {
    this.cache = new Map();
    this.ttl = 3600000; // 1 hora
  }

  set(medioId, data) {
    this.cache.set(medioId, {
      data,
      timestamp: Date.now()
    });
  }

  get(medioId) {
    const cached = this.cache.get(medioId);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(medioId);
      return null;
    }

    return cached.data;
  }

  clear() {
    this.cache.clear();
  }
}

export const shareCache = new ShareCache();
```

### 3. Analytics de Compartir

```javascript
// utils/shareAnalytics.js
export const trackShareEvent = (platform, medioId, medioType) => {
  // Google Analytics
  if (typeof gtag !== 'undefined') {
    gtag('event', 'share', {
      method: platform,
      content_type: medioType,
      item_id: medioId
    });
  }

  // Facebook Pixel
  if (typeof fbq !== 'undefined') {
    fbq('track', 'Share', {
      content_type: medioType,
      content_id: medioId
    });
  }

  // Custom analytics
  fetch('/api/v1/analytics/share', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      platform,
      medioId,
      medioType,
      timestamp: new Date().toISOString()
    })
  }).catch(console.error);
};
```

## Conclusión

La integración frontend del sistema de redes sociales proporciona componentes reutilizables y fáciles de implementar para React, Vue.js y Angular. Con manejo robusto de errores, caché inteligente, analytics integrado y metadatos Open Graph dinámicos, garantiza una experiencia de usuario excelente en todas las plataformas.