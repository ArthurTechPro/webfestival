# API de Redes Sociales - Documentación Completa

## Endpoints Disponibles

### 1. Generar Enlaces para Compartir

**Endpoint**: `POST /api/v1/social-media/share-links`  
**Autenticación**: Requerida (JWT Token)  
**Rate Limit**: 50 requests/15min por usuario  

#### Descripción
Genera enlaces optimizados para compartir un medio ganador en redes sociales. Solo disponible para medios que ocupen los primeros 3 lugares en concursos finalizados.

#### Request Body
```json
{
  "medioId": 123
}
```

#### Parámetros
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| medioId | number | Sí | ID del medio a compartir |

#### Response Exitoso (200)
```json
{
  "success": true,
  "data": {
    "medio": {
      "id": 123,
      "titulo": "Atardecer en la Montaña",
      "autor": "Juan Pérez",
      "concurso": "Concurso Nacional de Fotografía 2024",
      "posicion": 1,
      "tipoMedio": "fotografia"
    },
    "shareUrls": {
      "facebook": "https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Flocalhost%3A3001%2Fpublic%2Fmedia%2F123%2Fatardecer-en-la-montana&quote=%F0%9F%8F%86...",
      "twitter": "https://twitter.com/intent/tweet?url=http%3A%2F%2Flocalhost%3A3001%2Fpublic%2Fmedia%2F123%2Fatardecer-en-la-montana&text=%F0%9F%8F%86...",
      "linkedin": "https://www.linkedin.com/sharing/share-offsite/?url=http%3A%2F%2Flocalhost%3A3001%2Fpublic%2Fmedia%2F123%2Fatardecer-en-la-montana&title=%F0%9F%8F%86...",
      "instagram": "http://localhost:3001/public/media/123/atardecer-en-la-montana",
      "shareableLink": "http://localhost:3001/public/media/123/atardecer-en-la-montana"
    },
    "shareContent": {
      "title": "🏆 🥇 Primer lugar en Concurso Nacional de Fotografía 2024",
      "description": "\"Atardecer en la Montaña\" por Juan Pérez - 🥇 Primer lugar en la categoría de fotografía del concurso Concurso Nacional de Fotografía 2024. ¡Descubre más talento creativo en WebFestival!",
      "hashtags": ["WebFestival", "ConcursoMultimedia", "Fotografia", "Photography", "Ganador", "Winner"],
      "link": "http://localhost:3001/public/media/123/atardecer-en-la-montana",
      "imageUrl": "https://immich.example.com/media/123-thumbnail.jpg"
    },
    "message": "Enlaces de compartir generados exitosamente"
  }
}
```

#### Errores Posibles

**404 - Medio no encontrado**
```json
{
  "success": false,
  "message": "Medio no encontrado"
}
```

**400 - Concurso no finalizado**
```json
{
  "success": false,
  "message": "Solo se pueden compartir medios de concursos finalizados"
}
```

**403 - Sin permisos**
```json
{
  "success": false,
  "message": "Solo puedes compartir tus propios medios"
}
```

**400 - No es ganador**
```json
{
  "success": false,
  "message": "Solo se pueden compartir medios ganadores (primeros 3 lugares)"
}
```

#### Ejemplo de Uso con JavaScript

```javascript
// Usando fetch API
async function generateShareLinks(medioId) {
  try {
    const response = await fetch('/api/v1/social-media/share-links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ medioId })
    });

    const data = await response.json();
    
    if (data.success) {
      // Mostrar botones de compartir
      displayShareButtons(data.data.shareUrls);
    } else {
      console.error('Error:', data.message);
    }
  } catch (error) {
    console.error('Error de red:', error);
  }
}

function displayShareButtons(shareUrls) {
  // Crear botones para cada red social
  const facebookBtn = document.createElement('a');
  facebookBtn.href = shareUrls.facebook;
  facebookBtn.target = '_blank';
  facebookBtn.textContent = 'Compartir en Facebook';
  
  const twitterBtn = document.createElement('a');
  twitterBtn.href = shareUrls.twitter;
  twitterBtn.target = '_blank';
  twitterBtn.textContent = 'Compartir en Twitter';
  
  // Agregar al DOM
  document.getElementById('share-buttons').appendChild(facebookBtn);
  document.getElementById('share-buttons').appendChild(twitterBtn);
}
```

#### Ejemplo con React

```jsx
import React, { useState } from 'react';
import axios from 'axios';

const ShareButtons = ({ medioId }) => {
  const [shareUrls, setShareUrls] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateShareLinks = async () => {
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
      
      setShareUrls(response.data.data.shareUrls);
    } catch (err) {
      setError(err.response?.data?.message || 'Error generando enlaces');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Generando enlaces...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="share-buttons">
      {!shareUrls ? (
        <button onClick={generateShareLinks}>
          Compartir en Redes Sociales
        </button>
      ) : (
        <div className="social-links">
          <a href={shareUrls.facebook} target="_blank" rel="noopener noreferrer">
            <i className="fab fa-facebook"></i> Facebook
          </a>
          <a href={shareUrls.twitter} target="_blank" rel="noopener noreferrer">
            <i className="fab fa-twitter"></i> Twitter
          </a>
          <a href={shareUrls.linkedin} target="_blank" rel="noopener noreferrer">
            <i className="fab fa-linkedin"></i> LinkedIn
          </a>
          <button onClick={() => navigator.clipboard.writeText(shareUrls.instagram)}>
            <i className="fab fa-instagram"></i> Copiar enlace
          </button>
        </div>
      )}
    </div>
  );
};

export default ShareButtons;
```

---

### 2. Acceso Público a Medios Compartidos

**Endpoint**: `GET /api/v1/social-media/public/media/:medioId/:slug?`  
**Autenticación**: No requerida (Público)  
**Rate Limit**: 100 requests/15min por IP  

#### Descripción
Endpoint público para acceder a medios compartidos. Incluye metadatos Open Graph para previews optimizados en redes sociales.

#### Parámetros de URL
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| medioId | number | Sí | ID del medio |
| slug | string | No | Slug SEO-friendly (opcional) |

#### Response Exitoso (200)
```json
{
  "success": true,
  "data": {
    "medio": {
      "id": 123,
      "titulo": "Atardecer en la Montaña",
      "tipoMedio": "fotografia",
      "medioUrl": "https://immich.example.com/media/123.jpg",
      "thumbnailUrl": "https://immich.example.com/media/123-thumb.jpg",
      "previewUrl": "https://immich.example.com/media/123-preview.jpg",
      "duracion": null,
      "formato": "image/jpeg",
      "fechaSubida": "2024-01-15T10:30:00.000Z"
    },
    "autor": {
      "nombre": "Juan Pérez",
      "pictureUrl": "https://immich.example.com/avatars/user123.jpg"
    },
    "concurso": {
      "titulo": "Concurso Nacional de Fotografía 2024",
      "descripcion": "El concurso más importante del año...",
      "fechaInicio": "2024-01-01T00:00:00.000Z",
      "fechaFinal": "2024-01-31T23:59:59.000Z"
    },
    "categoria": {
      "nombre": "Paisajes Naturales"
    },
    "resultado": {
      "posicion": 1,
      "puntajePromedio": "9.2",
      "puntajePonderado": "9.4"
    },
    "estadisticas": {
      "totalJurados": 5,
      "puntajePromedio": "9.2",
      "puntajePonderado": "9.4",
      "criteriosEvaluados": 5
    },
    "openGraph": {
      "og:type": "article",
      "og:title": "🏆 🥇 Primer lugar en Concurso Nacional de Fotografía 2024",
      "og:description": "\"Atardecer en la Montaña\" por Juan Pérez - 🥇 Primer lugar en la categoría de fotografía del concurso Concurso Nacional de Fotografía 2024. ¡Descubre más talento creativo en WebFestival!",
      "og:image": "https://immich.example.com/media/123-thumb.jpg",
      "og:url": "http://localhost:3001/public/media/123/atardecer-en-la-montana",
      "og:site_name": "WebFestival",
      "og:locale": "es_ES",
      "twitter:card": "summary_large_image",
      "twitter:site": "@WebFestival",
      "twitter:title": "🏆 🥇 Primer lugar en Concurso Nacional de Fotografía 2024",
      "twitter:description": "\"Atardecer en la Montaña\" por Juan Pérez...",
      "twitter:image": "https://immich.example.com/media/123-thumb.jpg",
      "article:author": "Juan Pérez",
      "article:section": "Concurso Nacional de Fotografía 2024",
      "article:tag": "WebFestival, ConcursoMultimedia, Fotografia, Photography, Ganador, Winner"
    },
    "shareUrls": {
      "facebook": "https://www.facebook.com/sharer/sharer.php?...",
      "twitter": "https://twitter.com/intent/tweet?...",
      "linkedin": "https://www.linkedin.com/sharing/share-offsite/?...",
      "instagram": "http://localhost:3001/public/media/123/atardecer-en-la-montana",
      "shareableLink": "http://localhost:3001/public/media/123/atardecer-en-la-montana"
    }
  }
}
```

#### Errores Posibles

**404 - Medio no encontrado**
```json
{
  "success": false,
  "message": "Medio no encontrado"
}
```

**404 - Medio no público**
```json
{
  "success": false,
  "message": "Medio no disponible públicamente"
}
```

#### Ejemplo de Uso

```javascript
// Obtener información pública de un medio
async function getPublicMedia(medioId, slug = '') {
  try {
    const url = `/api/v1/social-media/public/media/${medioId}${slug ? '/' + slug : ''}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.success) {
      // Mostrar información del medio
      displayMediaInfo(data.data);
      
      // Inyectar metadatos Open Graph si es necesario
      injectOpenGraphMetadata(data.data.openGraph);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

function injectOpenGraphMetadata(openGraph) {
  // Inyectar metadatos en el head del documento
  Object.entries(openGraph).forEach(([property, content]) => {
    const meta = document.createElement('meta');
    meta.setAttribute('property', property);
    meta.setAttribute('content', content);
    document.head.appendChild(meta);
  });
}
```

---

### 3. Configuración de APIs (Solo Administradores)

**Endpoint**: `GET /api/v1/social-media/configuration`  
**Autenticación**: Requerida (JWT Token + Role ADMIN)  
**Rate Limit**: 50 requests/15min por usuario  

#### Descripción
Obtiene el estado de configuración de las APIs de redes sociales. Solo disponible para administradores.

#### Response Exitoso (200)
```json
{
  "success": true,
  "data": {
    "isConfigured": false,
    "missingKeys": [
      "FACEBOOK_APP_ID",
      "FACEBOOK_APP_SECRET",
      "INSTAGRAM_ACCESS_TOKEN"
    ],
    "availableServices": {
      "facebook": false,
      "instagram": false,
      "twitter": true,
      "linkedin": true
    }
  }
}
```

#### Ejemplo de Uso

```javascript
// Verificar configuración (solo admins)
async function checkSocialMediaConfig() {
  try {
    const response = await fetch('/api/v1/social-media/configuration', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      if (!data.data.isConfigured) {
        console.warn('APIs no configuradas:', data.data.missingKeys);
      }
      
      // Mostrar estado de servicios
      displayServiceStatus(data.data.availableServices);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
```

---

## Códigos de Estado HTTP

| Código | Descripción | Cuándo ocurre |
|--------|-------------|---------------|
| 200 | OK | Operación exitosa |
| 400 | Bad Request | Datos inválidos, medio no compartible |
| 401 | Unauthorized | Token JWT inválido o faltante |
| 403 | Forbidden | Sin permisos para la operación |
| 404 | Not Found | Medio no encontrado |
| 409 | Conflict | Conflicto en el estado del recurso |
| 429 | Too Many Requests | Rate limit excedido |
| 500 | Internal Server Error | Error interno del servidor |

## Rate Limiting

### Límites por Endpoint

| Endpoint | Límite | Ventana | Aplicado a |
|----------|--------|---------|------------|
| `/share-links` | 50 requests | 15 minutos | Usuario autenticado |
| `/public/media/*` | 100 requests | 15 minutos | IP address |
| `/configuration` | 50 requests | 15 minutos | Usuario autenticado |

### Headers de Rate Limiting

```http
X-RateLimit-Limit: 50
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1640995200
```

## Autenticación

### JWT Token

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Roles Requeridos

- **share-links**: Usuario autenticado (cualquier rol)
- **public/media**: Sin autenticación
- **configuration**: ADMIN únicamente

## Ejemplos de Integración Frontend

### React Hook Personalizado

```jsx
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

  return {
    loading,
    error,
    shareData,
    generateShareLinks,
    openShareWindow
  };
};
```

### Vue.js Composable

```javascript
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
      navigator.clipboard.writeText(url);
      alert('Enlace copiado al portapapeles');
    } else {
      // Abrir ventana de compartir
      window.open(url, `share-${platform}`, 'width=600,height=400');
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

## Mejores Prácticas

### 1. Manejo de Errores

```javascript
// Siempre manejar errores específicos
try {
  const shareData = await generateShareLinks(medioId);
  // Éxito
} catch (error) {
  switch (error.response?.status) {
    case 400:
      showError('Este medio no se puede compartir');
      break;
    case 403:
      showError('No tienes permisos para compartir este medio');
      break;
    case 404:
      showError('Medio no encontrado');
      break;
    default:
      showError('Error inesperado. Intenta de nuevo.');
  }
}
```

### 2. Optimización de UX

```javascript
// Mostrar estado de carga
const ShareButton = ({ medioId }) => {
  const [loading, setLoading] = useState(false);
  
  const handleShare = async () => {
    setLoading(true);
    try {
      const shareData = await generateShareLinks(medioId);
      // Mostrar opciones de compartir
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <button onClick={handleShare} disabled={loading}>
      {loading ? 'Generando enlaces...' : 'Compartir'}
    </button>
  );
};
```

### 3. Caché de Enlaces

```javascript
// Cachear enlaces generados para evitar requests repetidos
const shareCache = new Map();

const getCachedShareLinks = async (medioId) => {
  if (shareCache.has(medioId)) {
    return shareCache.get(medioId);
  }
  
  const shareData = await generateShareLinks(medioId);
  shareCache.set(medioId, shareData);
  
  // Limpiar caché después de 1 hora
  setTimeout(() => shareCache.delete(medioId), 3600000);
  
  return shareData;
};
```

## Conclusión

La API de redes sociales proporciona una interfaz completa y robusta para compartir medios ganadores en múltiples plataformas sociales. Con autenticación segura, rate limiting, validaciones exhaustivas y metadatos Open Graph optimizados, garantiza una experiencia de usuario excelente tanto para participantes como para visitantes públicos.