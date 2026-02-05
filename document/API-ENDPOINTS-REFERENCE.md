# WebFestival API - Referencia Completa de Endpoints

## 📋 Referencia JSON Completa

**Para una referencia completa y estructurada de todos los endpoints, consulta:**
👉 **[api-endpoints-reference.json](./api-endpoints-reference.json)**

Este archivo JSON contiene:
- ✅ **Todos los endpoints** organizados por módulo
- ✅ **Métodos HTTP** y rutas completas
- ✅ **Parámetros** de entrada y respuesta
- ✅ **Autenticación** requerida por endpoint
- ✅ **Roles** permitidos para cada acción
- ✅ **Tipos de datos** completos
- ✅ **Códigos de error** y su significado
- ✅ **Ejemplos** de uso y notas importantes

## 🎯 Uso del Archivo JSON

### Para Desarrollo Frontend
```javascript
// Ejemplo de uso en servicios
const API_REFERENCE = require('./api-endpoints-reference.json');
const concursosEndpoints = API_REFERENCE.endpoints.concursos.endpoints;

// Obtener endpoint específico
const loginEndpoint = API_REFERENCE.endpoints.auth.endpoints.find(e => e.name === 'Login');
console.log(`${loginEndpoint.method} ${API_REFERENCE.endpoints.auth.baseRoute}${loginEndpoint.path}`);
// Output: POST /api/v1/auth/login
```

### Para Landing Page
```javascript
// Endpoints públicos para landing
const publicEndpoints = Object.values(API_REFERENCE.endpoints)
  .flatMap(module => module.endpoints)
  .filter(endpoint => !endpoint.auth);
```

### Para Panel de Administración
```javascript
// Endpoints de admin
const adminEndpoints = Object.values(API_REFERENCE.endpoints)
  .flatMap(module => module.endpoints)
  .filter(endpoint => endpoint.roles.includes('ADMIN'));
```

## 🔧 Estructura del JSON

```json
{
  "info": {
    "title": "WebFestival API",
    "version": "2.1.0",
    "baseUrl": "{{baseUrl}}",
    "environments": { "local": "...", "production": "..." }
  },
  "endpoints": {
    "auth": { "baseRoute": "/api/v1/auth", "endpoints": [...] },
    "concursos": { "baseRoute": "/api/v1/concursos", "endpoints": [...] },
    "media": { "baseRoute": "/api/v1/media", "endpoints": [...] },
    "users": { "baseRoute": "/api/v1/users", "endpoints": [...] },
    "evaluations": { "baseRoute": "/api/v1/evaluations", "endpoints": [...] },
    "subscriptions": { "baseRoute": "/api/v1/subscriptions", "endpoints": [...] },
    "interactions": { "baseRoute": "/api/v1/interactions", "endpoints": [...] },
    "proxy": { "baseRoute": "/api/v1/proxy", "endpoints": [...] },
    "health": { "baseRoute": "/api/v1", "endpoints": [...] }
  },
  "dataTypes": { "User": {...}, "Concurso": {...}, ... },
  "errorCodes": { "400": "...", "401": "...", ... }
}
```

## 📚 Módulos Principales

### 🔐 Autenticación (`/api/v1/auth`)
- Login/Register/Logout
- Verificación de tokens
- Recuperación de contraseña

### 🏆 Concursos (`/api/v1/concursos`)
- CRUD completo de concursos
- Inscripciones y verificaciones
- Consultas públicas y admin

### 📸 Medios (`/api/v1/media`)
- Subida de archivos multimedia
- Galerías públicas
- Gestión de medios

### 👥 Usuarios (`/api/v1/users`)
- Gestión de usuarios
- Estadísticas del sistema
- Asignación de jurados

### ⭐ Evaluaciones (`/api/v1/evaluations`)
- Sistema de calificaciones
- Criterios por tipo de medio
- Progreso y estadísticas

### 💳 Suscripciones (`/api/v1/subscriptions`)
- Planes y facturación
- Integración con Stripe
- Límites de uso

### 💬 Interacciones (`/api/v1/interactions`)
- Comentarios y moderación
- Sistema de reportes
- Comunidad

### 🖼️ Proxy (`/api/v1/proxy`)
- Acceso público a medios
- Thumbnails y previews
- Sin autenticación

## 🚀 Ventajas del Archivo JSON

1. **Programáticamente Accesible**: Puedes importar y usar la referencia en tu código
2. **Siempre Actualizado**: Un solo archivo para mantener
3. **Estructurado**: Fácil de parsear y filtrar
4. **Completo**: Incluye todos los detalles necesarios
5. **Versionado**: Trackeable en Git con cambios claros

## 🔄 Mantenimiento

Para mantener actualizada la referencia:
1. Actualiza el archivo JSON cuando agregues/modifiques endpoints
2. Incrementa la versión en `info.version`
3. Documenta cambios importantes en `notes`

---

**Última actualización:** Diciembre 2024  
**Versión API:** 2.1.0