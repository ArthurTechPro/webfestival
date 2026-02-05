# 📋 WebFestival API - Índice Completo de Endpoints

## 📚 Colecciones de Postman Disponibles

### 1. WebFestival-API-Auth.postman_collection.json
Autenticación y gestión de sesiones

### 2. WebFestival-API-Usuarios.postman_collection.json
Gestión de usuarios, perfiles y jurados

### 3. WebFestival-API-Concursos.postman_collection.json ⭐ ACTUALIZADO v2.1.0
Gestión de concursos, inscripciones y subida de imágenes

### 4. WebFestival-API-Categorias.postman_collection.json
Gestión de categorías de concursos

### 5. WebFestival-API-Upload-Immich.postman_collection.json
Subida segura de medios a Immich (método actual)

### 6. WebFestival-API-Flujo-Completo-Subida.postman_collection.json ⭐ ACTUALIZADO v2.1.0
Flujo completo de subida de medios (método simplificado de un solo paso)

### 7. WebFestival-API-Media.postman_collection.json ⭐ ACTUALIZADO v2.1.0
Gestión de medios con URLs dinámicas y proxy

### 8. WebFestival-API-Calificaciones.postman_collection.json
Sistema de calificaciones de jurados

### 9. WebFestival-API-Criterios.postman_collection.json
Gestión de criterios de evaluación

### 10. WebFestival-API-Jurado-Asignacion.postman_collection.json
Asignación de jurados a categorías

### 11. WebFestival-API-Subscriptions.postman_collection.json
Gestión de suscripciones y planes

### 12. WebFestival-API-Billing.postman_collection.json
Facturación y pagos

### 13. WebFestival-API-Notifications.postman_collection.json
Sistema de notificaciones

### 14. WebFestival-API-Interactions.postman_collection.json
Interacciones sociales (likes, comentarios)

### 15. WebFestival-API-Social-Media.postman_collection.json
Compartir en redes sociales

### 16. WebFestival-API-CMS.postman_collection.json
Gestión de contenido

### 17. WebFestival-API-Newsletter.postman_collection.json
Gestión de newsletters

### 18. WebFestival-API-Health.postman_collection.json
Health checks y estado del sistema

---

## 🆕 Endpoints de Subida Segura de Medios (Método Actual)

### POST /api/v1/media/upload
**Descripción:** Sube un archivo multimedia a Immich de forma segura en un solo paso  
**Autenticación:** Requerida (JWT)  
**Body:** multipart/form-data
- file (File) - Archivo multimedia
- titulo (String) - Título del medio
- tipoMedio (String) - Tipo: fotografia, video, audio, corto_cine
- concursoId (Integer) - ID del concurso
- categoriaId (Integer) - ID de la categoría

**Características:**
- ✅ Subida en un solo paso
- ✅ No expone credenciales de Immich
- ✅ Rollback automático en caso de error
- ✅ Organización automática en álbumes
- ✅ URLs construidas dinámicamente

**Respuesta:** 201 Created
```json
{
  "success": true,
  "message": "Medio subido exitosamente",
  "data": {
    "id": 123,
    "immichAssetId": "550e8400-e29b-41d4-a716-446655440000",
    "mediaUrl": "https://api.webfestival.art/api/v1/proxy/media/550e8400...",
    "thumbnailUrl": "https://api.webfestival.art/api/v1/proxy/media/550e8400...?size=400x225"
  }
}
```

**Errores:**
- 400: Archivo inválido o campos faltantes
- 401: No autenticado
- 413: Archivo muy grande
- 429: Rate limit excedido
- 502: Error comunicándose con Immich
- 503: Servicio no disponible

---

### GET /api/v1/media/:id
**Descripción:** Obtiene información de un medio por ID con URLs dinámicas  
**Autenticación:** Requerida (JWT)  
**Parámetros:**
- id (Integer) - ID del medio

**Respuesta:** 200 OK
```json
{
  "success": true,
  "data": {
    "id": 123,
    "titulo": "Mi foto",
    "tipoMedio": "fotografia",
    "immich_asset_id": "550e8400-e29b-41d4-a716-446655440000",
    "medio_url": "https://api.webfestival.art/api/v1/proxy/media/550e8400...",
    "thumbnail_url": "https://api.webfestival.art/api/v1/proxy/media/550e8400...?size=400x225",
    "preview_url": "https://api.webfestival.art/api/v1/proxy/media/550e8400...?size=1280x720",
    "formato": "image/jpeg",
    "tamanoArchivo": 2048576,
    "fechaSubida": "2024-01-15T10:30:00Z",
    "usuario": { ... }
  }
}
```

**Nota:** Las URLs se construyen dinámicamente desde `immich_asset_id`

**Errores:**
- 400: ID inválido
- 404: Medio no encontrado

---

### GET /api/v1/media/user/:userId
**Descripción:** Lista medios de un usuario con paginación  
**Autenticación:** Requerida (JWT)  
**Parámetros:**
- userId (String) - ID del usuario

**Query Parameters:**
- page (Integer) - Número de página (default: 1)
- limit (Integer) - Resultados por página (default: 20, max: 100)
- tipoMedio (String) - Filtrar por tipo (opcional)

**Respuesta:** 200 OK
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

**Errores:**
- 400: Parámetros inválidos

---

## 📤 Endpoints de Upload Específicos

### POST /api/v1/users/:userId/avatar
**Descripción:** Sube avatar de usuario  
**Autenticación:** Requerida (JWT)  
**Body:** multipart/form-data
- avatar (File) - Imagen del avatar (max 5MB)

**Formatos:** JPG, PNG, WebP

---

### POST /api/v1/concursos/:concursoId/imagen
**Descripción:** Sube poster de concurso a Immich  
**Autenticación:** Requerida (JWT + ADMIN)  
**Body:** multipart/form-data
- imagen (File) - Imagen del poster (max 10MB)

**Formatos:** JPG, PNG, WebP, HEIC

**Características:**
- ✅ Se almacena en álbum "Sistema - Administrador"
- ✅ Solo guarda `imagen_asset_id` en BD
- ✅ URLs construidas dinámicamente
- ✅ Reemplaza imagen anterior si existe

**Respuesta:** 200 OK
```json
{
  "success": true,
  "message": "Imagen del concurso actualizada exitosamente",
  "data": {
    "imagen_asset_id": "abc-123-def",
    "imagen_url": "https://api.webfestival.art/api/v1/proxy/media/abc-123-def",
    "imagen_thumbnail": "https://api.webfestival.art/api/v1/proxy/media/abc-123-def?size=400x225",
    "imagen_preview": "https://api.webfestival.art/api/v1/proxy/media/abc-123-def?size=1280x720"
  }
}
```

---

### POST /api/v1/cms/contenido/:contenidoId/imagen
**Descripción:** Sube imagen destacada de contenido CMS  
**Autenticación:** Requerida (JWT + ADMIN/CONTENT_ADMIN)  
**Body:** multipart/form-data
- imagen (File) - Imagen destacada (max 10MB)

**Formatos:** JPG, PNG, WebP

---

### POST /api/v1/jurados/:juradoId/portfolio
**Descripción:** Sube portfolio de jurado  
**Autenticación:** Requerida (JWT + JURADO/ADMIN)  
**Body:** multipart/form-data
- portfolio (File) - Imagen del portfolio (max 5MB)

**Formatos:** JPG, PNG, WebP

---

## 📊 Límites y Restricciones

### Tamaños Máximos por Tipo

| Tipo | Tamaño Máximo |
|------|---------------|
| Fotografía | 50 MB |
| Video | 500 MB |
| Audio | 100 MB |
| Avatar | 5 MB |
| Poster/CMS | 10 MB |
| Portfolio | 5 MB |

### Formatos Soportados

**Imágenes:**
- JPEG (.jpg, .jpeg)
- PNG (.png)
- HEIC (.heic)
- WebP (.webp)

**Videos:**
- MP4 (.mp4)
- QuickTime (.mov)
- AVI (.avi)

**Audio:**
- MP3 (.mp3)
- WAV (.wav)
- AAC (.aac)

### Rate Limiting

**Uploads de Medios:**
- Ventana: 15 minutos
- Límite: 10 uploads

**Otros Endpoints:**
- Ventana: 15 minutos
- Límite: 100 requests

---

## 🔐 Autenticación

Todos los endpoints (excepto públicos) requieren autenticación JWT:

```http
Authorization: Bearer <tu-token-jwt>
```

### Obtener Token

**POST /auth/login**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "Password123!"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "...",
    "user": { ... }
  }
}
```

---

## 🌐 Environments

### Local
```json
{
  "baseUrl": "http://localhost:3001",
  "immichUrl": "https://medios.webfestival.art"
}
```

### Production
```json
{
  "baseUrl": "https://api.webfestival.art",
  "immichUrl": "https://medios.webfestival.art"
}
```

---

## 📝 Variables Comunes

Las siguientes variables se guardan automáticamente durante el flujo:

- `accessToken` - Token JWT de autenticación
- `refreshToken` - Token para renovar sesión
- `userId` - ID del usuario autenticado
- `concursoId` - ID del concurso seleccionado
- `categoriaId` - ID de la categoría seleccionada
- `medioId` - ID del último medio subido
- `immichAssetId` - ID del asset en Immich
- `lastMediaId` - ID del último medio consultado

---

## 🧪 Testing

### Ejecutar Colección Completa

1. Importa la colección en Postman
2. Selecciona el environment (Local o Production)
3. Ejecuta "Run Collection"
4. Los tests se ejecutarán automáticamente

### Tests Automáticos Incluidos

Cada request incluye tests que:
- ✅ Verifican código de estado HTTP
- ✅ Validan estructura de respuesta
- ✅ Guardan variables de entorno
- ✅ Muestran logs en consola

---

## 🔄 Flujos Completos

### Flujo 1: Subir Medio (Método Nuevo - Recomendado)

```
1. Login → Obtener token
2. Ver concursos activos → Seleccionar concurso
3. Ver detalles del concurso → Seleccionar categoría
4. Inscribirse al concurso
5. POST /api/v1/media/upload → Subir medio
6. GET /api/v1/media/:id → Verificar medio
```

### Flujo 2: Listar Mis Medios

```
1. Login → Obtener token
2. GET /api/v1/media/user/:userId → Listar medios
3. Navegar páginas con query params
```

### Flujo 3: Subir Avatar

```
1. Login → Obtener token
2. POST /api/v1/users/:userId/avatar → Subir avatar
3. GET /api/v1/users/:userId/profile → Verificar avatar
```

---

## 📞 Soporte

### Documentación Adicional

- **API Swagger:** `/docs/API-MEDIA-UPLOAD-SWAGGER.md`
- **Manual de Usuario:** `/document/MANUAL-DE-USUARIO-API.md`
- **Implementación:** `/docs/MEDIA-UPLOAD-API-DOCUMENTATION.md`

### Reportar Problemas

1. Verifica los logs del servidor
2. Revisa las variables de entorno
3. Consulta la documentación
4. Ejecuta los tests de Postman

---

## 🔄 Changelog

### v2.1.0 (2025-11-29) - URLs Dinámicas y Mejoras
- ✅ URLs construidas dinámicamente desde `immich_asset_id`
- ✅ Eliminados campos obsoletos: `medio_url`, `thumbnail_url`, `preview_url`, `imagen_url`
- ✅ Nuevo endpoint POST /api/v1/concursos/:id/imagen
- ✅ Proxy de imágenes sin autenticación: GET /api/v1/proxy/media/:assetId
- ✅ Formato de álbumes simplificado: "{Concurso} - {Usuario}"
- ✅ Álbum del sistema: "Sistema - Administrador"
- ❌ Eliminados endpoints obsoletos del método multi-paso
  - ~~POST /api/v1/media/contests/:concursoId/upload-url~~
  - ~~POST /api/v1/media/upload/confirm~~
  - ~~GET /api/v1/media/upload/config~~
- ✅ Colecciones de Postman actualizadas y limpiadas
- ✅ Eliminados endpoints obsoletos del método multi-paso

### v2.0.0 (2024-01-15) - Subida Segura de Medios
- ✅ Nuevo endpoint POST /api/v1/media/upload
- ✅ Endpoint GET /api/v1/media/:id
- ✅ Endpoint GET /api/v1/media/user/:userId
- ✅ Validación automática de archivos
- ✅ Rate limiting específico para uploads
- ✅ Rollback automático en caso de error
- ✅ Organización automática en álbumes de Immich
- ✅ Documentación completa con ejemplos
- ✅ Colecciones de Postman actualizadas

### v1.0.0 (2023-12-01) - Release Inicial
- ✅ Endpoints de autenticación
- ✅ Gestión de usuarios y perfiles
- ✅ Gestión de concursos y categorías
- ✅ Sistema de calificaciones
- ✅ Suscripciones y pagos
- ✅ Notificaciones
- ✅ CMS y contenido

---

## 💡 Tips y Mejores Prácticas

### Para Testing

1. **Usa variables de entorno** para evitar hardcodear valores
2. **Ejecuta los flujos en orden** para que las variables se guarden correctamente
3. **Revisa la consola** para ver logs detallados
4. **Guarda los environments** después de ejecutar tests

### Para Desarrollo

1. **Valida archivos en el cliente** antes de subir
2. **Muestra progreso de subida** para mejor UX
3. **Maneja errores apropiadamente** con mensajes claros
4. **Implementa reintentos** para errores de red
5. **Usa thumbnails** para listados y galerías

### Para Producción

1. **Configura rate limiting** apropiado
2. **Monitorea métricas** de subida
3. **Implementa logging** detallado
4. **Configura alertas** para errores
5. **Realiza backups** regulares de Immich

---

## 📚 Recursos Adicionales

- [Documentación de Immich](https://immich.app/docs)
- [Postman Learning Center](https://learning.postman.com/)
- [JWT.io](https://jwt.io/) - Decodificar tokens JWT
- [Multer Documentation](https://github.com/expressjs/multer) - File uploads

---

**Última actualización:** 2024-01-15  
**Versión de la API:** 2.0.0  
**Mantenido por:** Equipo WebFestival
