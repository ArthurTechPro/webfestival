# CMS API - WebFestival

## 🚀 Inicio Rápido

### Instalación y Configuración

```bash
# Instalar dependencias
npm install

# Configurar base de datos
npx prisma generate
npx prisma db push

# Iniciar servidor de desarrollo
npm run dev
```

### Autenticación

Todas las rutas de escritura requieren autenticación JWT:

```javascript
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN'
}
```

## 📚 Endpoints Principales

### Contenido

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/cms/content` | Listar contenido con filtros | No |
| GET | `/api/cms/content/:slug` | Obtener por slug | No |
| POST | `/api/cms/content` | Crear contenido | CONTENT_ADMIN |
| PUT | `/api/cms/content/:id` | Actualizar contenido | CONTENT_ADMIN |
| DELETE | `/api/cms/content/:id` | Eliminar contenido | CONTENT_ADMIN |
| POST | `/api/cms/content/:id/publish` | Publicar contenido | CONTENT_ADMIN |

### Gestión Avanzada

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| PUT | `/api/cms/content/:id/config` | Configuración | CONTENT_ADMIN |
| PUT | `/api/cms/content/:id/seo` | SEO | CONTENT_ADMIN |
| PUT | `/api/cms/content/:id/metrics` | Métricas | Sí |
| PUT | `/api/cms/content/:id/taxonomy` | Taxonomía | CONTENT_ADMIN |
| GET | `/api/cms/content/:id/preview` | Preview | CONTENT_ADMIN |

### Utilidades

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/cms/categories` | Listar categorías | No |
| GET | `/api/cms/tags` | Autocompletado etiquetas | No |
| GET | `/api/cms/content-types` | Tipos de contenido | No |
| GET | `/api/cms/content-template/:tipo` | Plantillas | No |

## 🔧 Ejemplos de Uso

### Crear Contenido

```javascript
const response = await fetch('/api/cms/content', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    tipo: 'blog_post',
    titulo: 'Mi Artículo',
    contenido: '<p>Contenido HTML...</p>',
    estado: 'BORRADOR'
  })
});
```

### Buscar Contenido

```javascript
const params = new URLSearchParams({
  busqueda: 'webfestival',
  tipo: 'blog_post',
  page: '1',
  limit: '10'
});

const response = await fetch(`/api/cms/content?${params}`);
const data = await response.json();
```

### Actualizar SEO

```javascript
await fetch(`/api/cms/content/${id}/seo`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    seo_titulo: 'Título SEO',
    seo_descripcion: 'Descripción meta',
    seo_keywords: ['palabra1', 'palabra2']
  })
});
```

## 📋 Tipos de Contenido

### `pagina_estatica`
- Contenido estático para landing page
- Campos: título, contenido, resumen, imagen
- Sin comentarios, con orden

### `blog_post`
- Artículos del blog
- Campos: título, contenido, resumen, imagen, taxonomía
- Con comentarios, sin orden

### `seccion_cms`
- Secciones personalizables
- Campos: título, contenido opcional, configuración
- Sin comentarios, con orden

## 🔍 Filtros Disponibles

```javascript
{
  tipo: 'blog_post',           // Tipo de contenido
  categoria: 'noticias',       // Categoría
  etiqueta: 'concurso',        // Etiqueta
  autor: 'user-id',            // ID del autor
  estado: 'PUBLICADO',         // Estado
  busqueda: 'texto',           // Búsqueda de texto
  activo: true,                // Solo activos
  destacado: false,            // Solo destacados
  page: 1,                     // Página
  limit: 10,                   // Elementos por página
  sort_by: 'created_at',       // Campo de ordenamiento
  sort_order: 'desc'           // Orden asc/desc
}
```

## 🏗️ Estructura de Respuesta

### Éxito
```javascript
{
  "success": true,
  "data": { /* datos */ },
  "message": "Operación exitosa"
}
```

### Error
```javascript
{
  "success": false,
  "message": "Descripción del error",
  "errors": [ /* detalles de validación */ ]
}
```

### Lista Paginada
```javascript
{
  "success": true,
  "data": {
    "contenido": [ /* array de contenido */ ],
    "total": 50,
    "page": 1,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## 🔐 Códigos de Estado

- `200` - Éxito
- `201` - Creado
- `400` - Datos inválidos
- `401` - No autenticado
- `403` - Sin permisos
- `404` - No encontrado
- `409` - Conflicto (slug duplicado)
- `500` - Error del servidor

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests específicos del CMS
npm test -- --grep "CMS"

# Coverage
npm run test:coverage
```

## 📁 Estructura de Archivos

```
src/
├── controllers/
│   └── cms.controller.ts     # Controlador principal
├── services/
│   └── cms.service.ts        # Lógica de negocio
├── schemas/
│   └── cms.schemas.ts        # Validación Zod
├── routes/
│   └── cms.routes.ts         # Definición de rutas
└── types/
    └── index.ts              # Tipos TypeScript
```

## 🔧 Configuración

### Variables de Entorno

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
FRONTEND_URL="http://localhost:3002"
```

### Permisos Requeridos

- **CONTENT_ADMIN** - Crear, editar, eliminar contenido
- **ADMIN** - Todos los permisos de CONTENT_ADMIN
- **Usuario autenticado** - Ver métricas, generar preview

## 🚀 Deployment

### Producción

```bash
# Build
npm run build

# Migrar base de datos
npx prisma migrate deploy

# Iniciar
npm start
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
EXPOSE 3001
CMD ["npm", "start"]
```

## 📖 Documentación Adicional

- [Documentación completa del API](./cms-api-documentation.md)
- [Esquema de base de datos](../prisma/schema.prisma)
- [Ejemplos de integración](./examples/)

---

**Versión:** 1.0.0  
**Última actualización:** Diciembre 2024