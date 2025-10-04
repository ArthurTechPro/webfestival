# Ejemplos Prácticos - CMS API

## 🎯 Casos de Uso Comunes

### 1. Crear y Publicar un Artículo de Blog

```javascript
// 1. Crear artículo en borrador
const createResponse = await fetch('/api/cms/content', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    tipo: 'blog_post',
    titulo: 'Ganadores del WebFestival 2024',
    contenido: `
      <h2>¡Felicitaciones a todos los participantes!</h2>
      <p>Este año hemos tenido una participación récord...</p>
      <img src="/images/winners-2024.jpg" alt="Ganadores 2024" />
    `,
    resumen: 'Conoce a los ganadores del concurso multimedia más importante del año',
    imagen_destacada: 'https://cdn.webfestival.com/winners-2024-hero.jpg',
    estado: 'BORRADOR'
  })
});

const { data: articulo } = await createResponse.json();

// 2. Configurar SEO
await fetch(`/api/cms/content/${articulo.id}/seo`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    seo_titulo: 'Ganadores WebFestival 2024 - Concurso Multimedia',
    seo_descripcion: 'Descubre quiénes son los ganadores del WebFestival 2024, el concurso multimedia más importante del año con premios increíbles.',
    seo_keywords: ['webfestival', 'ganadores', '2024', 'concurso', 'multimedia'],
    meta_tags: {
      'og:title': 'Ganadores del WebFestival 2024',
      'og:description': 'Conoce a los talentosos ganadores de este año',
      'og:image': 'https://cdn.webfestival.com/winners-2024-social.jpg',
      'og:type': 'article',
      'twitter:card': 'summary_large_image'
    }
  })
});

// 3. Agregar taxonomía
await fetch(`/api/cms/content/${articulo.id}/taxonomy`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify([
    {
      tipo_taxonomia: 'categoria',
      categoria: 'Noticias'
    },
    {
      tipo_taxonomia: 'categoria',
      categoria: 'Resultados'
    },
    {
      tipo_taxonomia: 'etiqueta',
      etiqueta: 'ganadores'
    },
    {
      tipo_taxonomia: 'etiqueta',
      etiqueta: 'webfestival-2024'
    },
    {
      tipo_taxonomia: 'etiqueta',
      etiqueta: 'premios'
    }
  ])
});

// 4. Configurar como destacado
await fetch(`/api/cms/content/${articulo.id}/config`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    activo: true,
    destacado: true,
    permite_comentarios: true,
    orden: 1
  })
});

// 5. Publicar
await fetch(`/api/cms/content/${articulo.id}/publish`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

console.log('Artículo publicado exitosamente!');
```

### 2. Sistema de Blog con Paginación

```javascript
class BlogManager {
  constructor(apiUrl, token) {
    this.apiUrl = apiUrl;
    this.token = token;
  }

  async getPosts(page = 1, filters = {}) {
    const params = new URLSearchParams({
      tipo: 'blog_post',
      estado: 'PUBLICADO',
      page: page.toString(),
      limit: '6',
      sort_by: 'fecha_publicacion',
      sort_order: 'desc',
      ...filters
    });

    const response = await fetch(`${this.apiUrl}/cms/content?${params}`);
    return await response.json();
  }

  async getPostBySlug(slug) {
    const response = await fetch(`${this.apiUrl}/cms/content/${slug}`);
    return await response.json();
  }

  async getFeaturedPosts() {
    const params = new URLSearchParams({
      tipo: 'blog_post',
      estado: 'PUBLICADO',
      destacado: 'true',
      limit: '3',
      sort_by: 'fecha_publicacion',
      sort_order: 'desc'
    });

    const response = await fetch(`${this.apiUrl}/cms/content?${params}`);
    return await response.json();
  }

  async searchPosts(query) {
    const params = new URLSearchParams({
      tipo: 'blog_post',
      estado: 'PUBLICADO',
      busqueda: query,
      limit: '10'
    });

    const response = await fetch(`${this.apiUrl}/cms/content?${params}`);
    return await response.json();
  }

  async getPostsByCategory(categoria) {
    const params = new URLSearchParams({
      tipo: 'blog_post',
      estado: 'PUBLICADO',
      categoria: categoria,
      limit: '10'
    });

    const response = await fetch(`${this.apiUrl}/cms/content?${params}`);
    return await response.json();
  }

  async incrementViews(postId) {
    // Obtener métricas actuales
    const metricsResponse = await fetch(`${this.apiUrl}/cms/content/${postId}/metrics`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    
    if (metricsResponse.ok) {
      const { data: metrics } = await metricsResponse.json();
      
      // Incrementar vistas
      await fetch(`${this.apiUrl}/cms/content/${postId}/metrics`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vistas: metrics.vistas + 1,
          ultima_vista: new Date().toISOString()
        })
      });
    }
  }
}

// Uso del BlogManager
const blog = new BlogManager('/api', userToken);

// Obtener posts de la página principal
const { data: postsData } = await blog.getPosts(1);
console.log(`Mostrando ${postsData.contenido.length} de ${postsData.total} posts`);

// Obtener posts destacados para el hero
const { data: featuredData } = await blog.getFeaturedPosts();
console.log('Posts destacados:', featuredData.contenido);

// Buscar posts
const { data: searchData } = await blog.searchPosts('concurso');
console.log('Resultados de búsqueda:', searchData.contenido);
```

### 3. Gestión de Páginas Estáticas

```javascript
class StaticPageManager {
  constructor(apiUrl, token) {
    this.apiUrl = apiUrl;
    this.token = token;
  }

  async createPage(pageData) {
    const response = await fetch(`${this.apiUrl}/cms/content`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tipo: 'pagina_estatica',
        ...pageData,
        estado: 'PUBLICADO'
      })
    });

    const { data: page } = await response.json();

    // Configurar orden y SEO automáticamente
    await this.setupPageConfig(page.id, pageData.orden || 0);
    await this.setupPageSEO(page.id, pageData);

    return page;
  }

  async setupPageConfig(pageId, orden) {
    await fetch(`${this.apiUrl}/cms/content/${pageId}/config`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        activo: true,
        orden: orden,
        permite_comentarios: false,
        destacado: false
      })
    });
  }

  async setupPageSEO(pageId, pageData) {
    await fetch(`${this.apiUrl}/cms/content/${pageId}/seo`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        seo_titulo: pageData.titulo,
        seo_descripcion: pageData.resumen || pageData.titulo,
        seo_keywords: pageData.keywords || []
      })
    });
  }

  async getNavigationPages() {
    const params = new URLSearchParams({
      tipo: 'pagina_estatica',
      estado: 'PUBLICADO',
      activo: 'true',
      sort_by: 'orden',
      sort_order: 'asc',
      limit: '20'
    });

    const response = await fetch(`${this.apiUrl}/cms/content?${params}`);
    return await response.json();
  }
}

// Crear páginas del sitio
const pageManager = new StaticPageManager('/api', adminToken);

// Página de inicio
await pageManager.createPage({
  titulo: 'Bienvenido a WebFestival',
  slug: 'inicio',
  contenido: `
    <section class="hero">
      <h1>El Concurso Multimedia Más Grande</h1>
      <p>Participa y muestra tu talento al mundo</p>
    </section>
  `,
  resumen: 'WebFestival es la plataforma líder para concursos multimedia',
  orden: 1,
  keywords: ['webfestival', 'concurso', 'multimedia', 'inicio']
});

// Página sobre nosotros
await pageManager.createPage({
  titulo: 'Sobre Nosotros',
  slug: 'sobre-nosotros',
  contenido: `
    <h2>Nuestra Historia</h2>
    <p>WebFestival nació con la misión de...</p>
  `,
  orden: 2
});
```

### 4. Sistema de Autocompletado para Etiquetas

```javascript
class TagAutocomplete {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
    this.cache = new Map();
    this.debounceTimer = null;
  }

  async searchTags(query, limit = 10) {
    // Cache simple
    const cacheKey = `${query}-${limit}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const params = new URLSearchParams({
      query: query,
      limit: limit.toString()
    });

    try {
      const response = await fetch(`${this.apiUrl}/cms/tags?${params}`);
      const { data: tags } = await response.json();
      
      // Guardar en cache por 5 minutos
      this.cache.set(cacheKey, tags);
      setTimeout(() => this.cache.delete(cacheKey), 5 * 60 * 1000);
      
      return tags;
    } catch (error) {
      console.error('Error buscando etiquetas:', error);
      return [];
    }
  }

  setupAutocomplete(inputElement, onSelect) {
    let currentSuggestions = [];

    inputElement.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      
      // Debounce
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(async () => {
        if (query.length >= 2) {
          currentSuggestions = await this.searchTags(query);
          this.showSuggestions(inputElement, currentSuggestions, onSelect);
        } else {
          this.hideSuggestions();
        }
      }, 300);
    });

    // Manejar navegación con teclado
    inputElement.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        this.navigateSuggestions(e.key === 'ArrowDown' ? 1 : -1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        this.selectCurrentSuggestion(onSelect);
      } else if (e.key === 'Escape') {
        this.hideSuggestions();
      }
    });
  }

  showSuggestions(inputElement, suggestions, onSelect) {
    // Implementar UI de sugerencias
    let dropdown = document.getElementById('tag-suggestions');
    
    if (!dropdown) {
      dropdown = document.createElement('div');
      dropdown.id = 'tag-suggestions';
      dropdown.className = 'tag-suggestions-dropdown';
      inputElement.parentNode.appendChild(dropdown);
    }

    dropdown.innerHTML = suggestions
      .map((tag, index) => `
        <div class="suggestion-item" data-index="${index}" data-tag="${tag}">
          ${tag}
        </div>
      `)
      .join('');

    // Event listeners para clicks
    dropdown.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        onSelect(item.dataset.tag);
        this.hideSuggestions();
      });
    });

    dropdown.style.display = 'block';
  }

  hideSuggestions() {
    const dropdown = document.getElementById('tag-suggestions');
    if (dropdown) {
      dropdown.style.display = 'none';
    }
  }
}

// Uso del autocompletado
const tagAutocomplete = new TagAutocomplete('/api');
const tagInput = document.getElementById('tag-input');
const selectedTags = new Set();

tagAutocomplete.setupAutocomplete(tagInput, (selectedTag) => {
  if (!selectedTags.has(selectedTag)) {
    selectedTags.add(selectedTag);
    addTagToUI(selectedTag);
    tagInput.value = '';
  }
});

function addTagToUI(tag) {
  const tagContainer = document.getElementById('selected-tags');
  const tagElement = document.createElement('span');
  tagElement.className = 'tag-item';
  tagElement.innerHTML = `
    ${tag}
    <button onclick="removeTag('${tag}')" class="remove-tag">×</button>
  `;
  tagContainer.appendChild(tagElement);
}

function removeTag(tag) {
  selectedTags.delete(tag);
  // Actualizar UI
}
```

### 5. Dashboard de Métricas

```javascript
class ContentMetricsDashboard {
  constructor(apiUrl, token) {
    this.apiUrl = apiUrl;
    this.token = token;
  }

  async getContentMetrics(contentId) {
    const response = await fetch(`${this.apiUrl}/cms/content/${contentId}/metrics`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    return await response.json();
  }

  async getTopContent(limit = 10) {
    const params = new URLSearchParams({
      estado: 'PUBLICADO',
      sort_by: 'vistas',
      sort_order: 'desc',
      limit: limit.toString()
    });

    const response = await fetch(`${this.apiUrl}/cms/content?${params}`);
    return await response.json();
  }

  async getRecentContent(days = 7) {
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    const params = new URLSearchParams({
      estado: 'PUBLICADO',
      sort_by: 'fecha_publicacion',
      sort_order: 'desc',
      limit: '20'
    });

    const response = await fetch(`${this.apiUrl}/cms/content?${params}`);
    const { data } = await response.json();

    // Filtrar por fecha en el cliente (idealmente esto se haría en el servidor)
    const recentContent = data.contenido.filter(item => 
      new Date(item.fecha_publicacion) >= dateFrom
    );

    return { ...data, contenido: recentContent };
  }

  async generateReport() {
    const [topContent, recentContent] = await Promise.all([
      this.getTopContent(5),
      this.getRecentContent(30)
    ]);

    const report = {
      topContent: topContent.data.contenido,
      recentContent: recentContent.contenido,
      totalViews: topContent.data.contenido.reduce((sum, item) => 
        sum + (item.metricas?.vistas || 0), 0
      ),
      totalPosts: topContent.data.total,
      avgViewsPerPost: 0
    };

    report.avgViewsPerPost = report.totalViews / report.totalPosts;

    return report;
  }

  async trackEngagement(contentId, action) {
    const metrics = await this.getContentMetrics(contentId);
    
    if (metrics.success) {
      const currentMetrics = metrics.data;
      const updates = {};

      switch (action) {
        case 'like':
          updates.likes = currentMetrics.likes + 1;
          break;
        case 'share':
          updates.shares = currentMetrics.shares + 1;
          break;
        case 'comment':
          updates.comentarios_count = currentMetrics.comentarios_count + 1;
          break;
      }

      await fetch(`${this.apiUrl}/cms/content/${contentId}/metrics`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
    }
  }
}

// Uso del dashboard
const dashboard = new ContentMetricsDashboard('/api', adminToken);

// Generar reporte mensual
const report = await dashboard.generateReport();
console.log('Reporte de contenido:', report);

// Trackear engagement
await dashboard.trackEngagement(123, 'like');
await dashboard.trackEngagement(123, 'share');
```

### 6. Workflow de Publicación

```javascript
class PublishingWorkflow {
  constructor(apiUrl, token) {
    this.apiUrl = apiUrl;
    this.token = token;
  }

  async createDraft(contentData) {
    const response = await fetch(`${this.apiUrl}/cms/content`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...contentData,
        estado: 'BORRADOR'
      })
    });

    return await response.json();
  }

  async schedulePublication(contentId, publishDate) {
    await fetch(`${this.apiUrl}/cms/content/${contentId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        estado: 'PROGRAMADO',
        fecha_publicacion: publishDate.toISOString()
      })
    });
  }

  async previewContent(contentId) {
    const response = await fetch(`${this.apiUrl}/cms/content/${contentId}/preview`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    
    const { data } = await response.json();
    return data.previewUrl;
  }

  async publishNow(contentId) {
    const response = await fetch(`${this.apiUrl}/cms/content/${contentId}/publish`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.token}` }
    });

    return await response.json();
  }

  async getContentForReview() {
    const params = new URLSearchParams({
      estado: 'BORRADOR',
      sort_by: 'updated_at',
      sort_order: 'desc'
    });

    const response = await fetch(`${this.apiUrl}/cms/content?${params}`);
    return await response.json();
  }
}

// Workflow completo
const workflow = new PublishingWorkflow('/api', editorToken);

// 1. Crear borrador
const { data: draft } = await workflow.createDraft({
  tipo: 'blog_post',
  titulo: 'Nuevo Artículo',
  contenido: 'Contenido del artículo...'
});

// 2. Generar preview para revisión
const previewUrl = await workflow.previewContent(draft.id);
console.log('Preview disponible en:', previewUrl);

// 3. Programar publicación
const publishDate = new Date();
publishDate.setHours(publishDate.getHours() + 2); // Publicar en 2 horas
await workflow.schedulePublication(draft.id, publishDate);

// 4. O publicar inmediatamente
// await workflow.publishNow(draft.id);
```

## 🔧 Utilidades y Helpers

### Cliente API Reutilizable

```javascript
class CMSClient {
  constructor(baseUrl, token = null) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  setToken(token) {
    this.token = token;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
        ...options.headers
      },
      ...options
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error en la petición');
    }

    return data;
  }

  // Métodos de conveniencia
  async get(endpoint, params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${endpoint}?${query}` : endpoint;
    return this.request(url);
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

// Uso del cliente
const cms = new CMSClient('/api/cms');
cms.setToken(userToken);

// Obtener contenido
const content = await cms.get('/content', { tipo: 'blog_post' });

// Crear contenido
const newPost = await cms.post('/content', {
  tipo: 'blog_post',
  titulo: 'Mi Post'
});

// Actualizar
await cms.put(`/content/${newPost.data.id}`, {
  titulo: 'Título Actualizado'
});
```

---

Estos ejemplos muestran cómo integrar y usar efectivamente el CMS API en aplicaciones reales, cubriendo desde casos básicos hasta workflows complejos de gestión de contenido.