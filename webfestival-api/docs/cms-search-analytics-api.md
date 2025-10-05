# API de Búsqueda Avanzada y Analytics del CMS

Esta documentación describe las nuevas funcionalidades implementadas para la tarea 6.3 "APIs de organización y búsqueda" del sistema CMS de WebFestival.

## Descripción General

El sistema de búsqueda avanzada y analytics proporciona herramientas completas para:
- Gestión flexible de categorías y etiquetas
- Búsqueda avanzada con múltiples criterios
- Autocompletado inteligente de etiquetas
- Analytics unificado del contenido

## Endpoints Implementados

### 1. Gestión de Categorías

#### GET /api/v1/cms/categories
Obtiene todas las categorías disponibles con filtros opcionales.

**Parámetros de consulta:**
- `tipo` (opcional): Filtrar por tipo de contenido
- `activo` (opcional): Filtrar por estado activo/inactivo
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 20)

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "cat_123",
        "nombre": "Fotografía Digital",
        "descripcion": "Contenido relacionado con fotografía digital",
        "tipo": "BLOG_POST",
        "activo": true,
        "contenidoCount": 15,
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

#### POST /api/v1/cms/categories
Crea una nueva categoría.

**Cuerpo de la petición:**
```json
{
  "nombre": "Video Profesional",
  "descripcion": "Contenido sobre técnicas de video profesional",
  "tipo": "TUTORIAL",
  "activo": true
}
```

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "data": {
    "id": "cat_456",
    "nombre": "Video Profesional",
    "descripcion": "Contenido sobre técnicas de video profesional",
    "tipo": "TUTORIAL",
    "activo": true,
    "contenidoCount": 0,
    "createdAt": "2024-01-15T11:00:00Z"
  }
}
```

#### PUT /api/v1/cms/categories/:categoryId
Actualiza una categoría existente.

**Parámetros de ruta:**
- `categoryId`: ID de la categoría a actualizar

**Cuerpo de la petición:**
```json
{
  "nombre": "Video Profesional Avanzado",
  "descripcion": "Técnicas avanzadas de video profesional",
  "activo": true
}
```

#### DELETE /api/v1/cms/categories/:categoryId
Elimina una categoría (solo si no tiene contenido asociado).

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Categoría eliminada exitosamente"
}
```

### 2. Gestión de Etiquetas

#### GET /api/v1/cms/tags/autocomplete
Proporciona autocompletado inteligente de etiquetas basado en contenido existente.

**Parámetros de consulta:**
- `q`: Término de búsqueda (mínimo 2 caracteres)
- `tipo` (opcional): Filtrar por tipo de contenido
- `limit` (opcional): Número máximo de sugerencias (default: 10)

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "etiqueta": "fotografía nocturna",
        "count": 12,
        "relevancia": 0.95
      },
      {
        "etiqueta": "fotografía de paisaje",
        "count": 8,
        "relevancia": 0.87
      }
    ]
  }
}
```

#### GET /api/v1/cms/tags/popular
Obtiene las etiquetas más populares del sistema.

**Parámetros de consulta:**
- `tipo` (opcional): Filtrar por tipo de contenido
- `periodo` (opcional): Período de tiempo (7d, 30d, 90d, all) - default: 30d
- `limit` (opcional): Número de etiquetas (default: 20)

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "tags": [
      {
        "etiqueta": "tutorial",
        "count": 45,
        "crecimiento": 15.2
      },
      {
        "etiqueta": "principiante",
        "count": 38,
        "crecimiento": 8.7
      }
    ],
    "periodo": "30d"
  }
}
```

### 3. Búsqueda Avanzada

#### GET /api/v1/cms/search
Realiza búsqueda avanzada de contenido con múltiples criterios.

**Parámetros de consulta:**
- `q` (opcional): Término de búsqueda en título y contenido
- `tipo` (opcional): Tipo de contenido (PAGINA_ESTATICA, BLOG_POST, TUTORIAL, etc.)
- `categoria` (opcional): ID o nombre de categoría
- `etiquetas` (opcional): Lista de etiquetas separadas por coma
- `autor` (opcional): ID del autor
- `estado` (opcional): Estado del contenido (BORRADOR, PUBLICADO, ARCHIVADO)
- `fechaDesde` (opcional): Fecha de inicio (ISO 8601)
- `fechaHasta` (opcional): Fecha de fin (ISO 8601)
- `ordenarPor` (opcional): Campo de ordenamiento (fecha, titulo, popularidad, relevancia)
- `orden` (opcional): Dirección del ordenamiento (asc, desc)
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 20)

**Ejemplo de petición:**
```
GET /api/v1/cms/search?q=fotografía&tipo=TUTORIAL&etiquetas=principiante,nocturna&ordenarPor=popularidad&orden=desc&page=1&limit=10
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "contenido": [
      {
        "id": "cont_789",
        "titulo": "Guía de Fotografía Nocturna para Principiantes",
        "resumen": "Aprende las técnicas básicas de fotografía nocturna...",
        "tipo": "TUTORIAL",
        "estado": "PUBLICADO",
        "autor": {
          "id": "user_123",
          "nombre": "María González",
          "avatar": "https://example.com/avatar.jpg"
        },
        "categoria": {
          "id": "cat_123",
          "nombre": "Fotografía Digital"
        },
        "etiquetas": ["principiante", "nocturna", "tutorial"],
        "metricas": {
          "vistas": 1250,
          "likes": 89,
          "comentarios": 23,
          "compartidos": 15
        },
        "fechaPublicacion": "2024-01-10T14:30:00Z",
        "relevancia": 0.92
      }
    ],
    "filtrosAplicados": {
      "q": "fotografía",
      "tipo": "TUTORIAL",
      "etiquetas": ["principiante", "nocturna"],
      "ordenarPor": "popularidad",
      "orden": "desc"
    },
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 156,
      "totalPages": 16
    },
    "estadisticas": {
      "tiempoRespuesta": "45ms",
      "resultadosEncontrados": 156,
      "filtrosActivos": 3
    }
  }
}
```

### 4. Analytics Unificado

#### GET /api/v1/cms/analytics/overview
Proporciona métricas generales del contenido del CMS.

**Parámetros de consulta:**
- `periodo` (opcional): Período de análisis (7d, 30d, 90d, 1y) - default: 30d
- `tipo` (opcional): Filtrar por tipo de contenido

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "resumen": {
      "totalContenido": 1247,
      "contenidoPublicado": 1089,
      "contenidoBorrador": 158,
      "totalVistas": 45678,
      "totalLikes": 3456,
      "totalComentarios": 892,
      "crecimientoContenido": 12.5,
      "crecimientoEngagement": 8.7
    },
    "porTipo": [
      {
        "tipo": "BLOG_POST",
        "count": 567,
        "vistas": 23456,
        "engagement": 0.067
      },
      {
        "tipo": "TUTORIAL",
        "count": 234,
        "vistas": 15678,
        "engagement": 0.089
      }
    ],
    "tendencias": {
      "contenidoMasVisto": [
        {
          "id": "cont_456",
          "titulo": "Técnicas Avanzadas de Composición",
          "vistas": 2345,
          "tipo": "TUTORIAL"
        }
      ],
      "etiquetasPopulares": [
        {
          "etiqueta": "composición",
          "count": 89,
          "crecimiento": 23.4
        }
      ],
      "categoriasActivas": [
        {
          "categoria": "Fotografía Digital",
          "contenidoCount": 156,
          "engagement": 0.078
        }
      ]
    },
    "periodo": "30d"
  }
}
```

#### GET /api/v1/cms/analytics/engagement
Analiza métricas de engagement detalladas.

**Parámetros de consulta:**
- `contenidoId` (opcional): ID específico de contenido
- `tipo` (opcional): Filtrar por tipo de contenido
- `periodo` (opcional): Período de análisis
- `agruparPor` (opcional): Agrupar por (dia, semana, mes)

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "metricas": {
      "promedioVistas": 387,
      "promedioLikes": 28,
      "promedioComentarios": 7,
      "tasaEngagement": 0.067,
      "tiempoPromedioLectura": "3m 45s"
    },
    "tendenciasTempo": [
      {
        "fecha": "2024-01-15",
        "vistas": 1234,
        "likes": 89,
        "comentarios": 23,
        "engagement": 0.091
      }
    ],
    "comparacion": {
      "periodoAnterior": {
        "vistas": 1156,
        "likes": 82,
        "comentarios": 19,
        "cambioVistas": 6.7,
        "cambioLikes": 8.5,
        "cambioComentarios": 21.1
      }
    }
  }
}
```

#### GET /api/v1/cms/analytics/content-performance
Analiza el rendimiento individual del contenido.

**Parámetros de consulta:**
- `ordenarPor` (opcional): vistas, likes, comentarios, engagement (default: vistas)
- `orden` (opcional): asc, desc (default: desc)
- `tipo` (opcional): Filtrar por tipo de contenido
- `limite` (opcional): Número de resultados (default: 50)

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "contenidoTop": [
      {
        "id": "cont_789",
        "titulo": "Guía Completa de Iluminación",
        "tipo": "TUTORIAL",
        "metricas": {
          "vistas": 5678,
          "likes": 234,
          "comentarios": 67,
          "compartidos": 45,
          "engagement": 0.089,
          "tiempoLectura": "5m 23s"
        },
        "rendimiento": {
          "score": 92,
          "categoria": "Excelente",
          "factores": {
            "viralidad": 0.85,
            "retencion": 0.78,
            "interaccion": 0.91
          }
        },
        "fechaPublicacion": "2024-01-05T10:00:00Z"
      }
    ],
    "estadisticas": {
      "contenidoAnalizado": 1089,
      "promedioScore": 67,
      "distribucionRendimiento": {
        "excelente": 156,
        "bueno": 445,
        "regular": 334,
        "bajo": 154
      }
    }
  }
}
```

## Códigos de Error

### Errores Comunes

- **400 Bad Request**: Parámetros de consulta inválidos
- **401 Unauthorized**: Token de autenticación requerido
- **403 Forbidden**: Permisos insuficientes
- **404 Not Found**: Recurso no encontrado
- **409 Conflict**: Conflicto con el estado actual (ej: eliminar categoría con contenido)
- **422 Unprocessable Entity**: Datos de entrada inválidos
- **500 Internal Server Error**: Error interno del servidor

### Ejemplos de Respuestas de Error

```json
{
  "success": false,
  "error": {
    "code": "INVALID_SEARCH_PARAMS",
    "message": "Los parámetros de búsqueda son inválidos",
    "details": {
      "fechaDesde": "Formato de fecha inválido",
      "limit": "Debe ser un número entre 1 y 100"
    }
  }
}
```

```json
{
  "success": false,
  "error": {
    "code": "CATEGORY_HAS_CONTENT",
    "message": "No se puede eliminar la categoría porque tiene contenido asociado",
    "details": {
      "categoryId": "cat_123",
      "contentCount": 15
    }
  }
}
```

## Consideraciones de Rendimiento

### Optimizaciones Implementadas

1. **Índices de Base de Datos**: Índices optimizados para búsquedas frecuentes
2. **Caché de Consultas**: Caché de resultados para consultas comunes
3. **Paginación Eficiente**: Límites en resultados para evitar sobrecarga
4. **Búsqueda Full-Text**: Índices de texto completo para búsquedas rápidas

### Límites del Sistema

- **Búsqueda**: Máximo 100 resultados por página
- **Autocompletado**: Máximo 20 sugerencias
- **Analytics**: Datos históricos limitados a 2 años
- **Etiquetas**: Máximo 50 etiquetas por contenido

## Ejemplos de Uso

### Búsqueda Básica
```javascript
// Buscar tutoriales de fotografía
const response = await fetch('/api/v1/cms/search?q=fotografía&tipo=TUTORIAL');
const data = await response.json();
```

### Autocompletado de Etiquetas
```javascript
// Obtener sugerencias de etiquetas
const response = await fetch('/api/v1/cms/tags/autocomplete?q=foto');
const suggestions = await response.json();
```

### Analytics de Contenido
```javascript
// Obtener métricas generales
const response = await fetch('/api/v1/cms/analytics/overview?periodo=30d');
const analytics = await response.json();
```

### Gestión de Categorías
```javascript
// Crear nueva categoría
const response = await fetch('/api/v1/cms/categories', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    nombre: 'Audio Digital',
    descripcion: 'Contenido sobre técnicas de audio digital',
    tipo: 'TUTORIAL'
  })
});
```

## Seguridad y Permisos

### Niveles de Acceso

- **Público**: Búsqueda y autocompletado (sin autenticación)
- **Usuario Autenticado**: Acceso completo a búsqueda y analytics básicos
- **Content Admin**: Gestión de categorías y analytics avanzados
- **Admin**: Acceso completo a todas las funcionalidades

### Validaciones de Seguridad

- Sanitización de parámetros de búsqueda
- Prevención de inyección SQL
- Rate limiting en endpoints públicos
- Validación de permisos por rol

## Integración con Otros Módulos

### CMS Principal
- Sincronización automática de categorías y etiquetas
- Actualización de métricas en tiempo real
- Integración con sistema de publicación

### Sistema de Interacciones
- Métricas de likes y comentarios
- Análisis de engagement
- Reportes de contenido

### Sistema de Usuarios
- Análisis por autor
- Métricas de contribución
- Perfiles de contenido por usuario