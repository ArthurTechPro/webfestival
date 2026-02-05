# Estado de Endpoints - WebFestival API v2.1.0

## 📊 Resumen Ejecutivo

**Fecha:** 29 de Noviembre, 2025  
**Versión:** 2.1.0  
**Estado:** ✅ Actualizado y Verificado

---

## ✅ Endpoints Activos y Actualizados

### 1. Media Upload (Subida Segura)

#### POST /api/v1/media/upload
**Estado:** ✅ ACTIVO  
**Versión:** 2.0.0+  
**Descripción:** Subida de medios en un solo paso  
**Colección:** WebFestival-API-Upload-Immich.postman_collection.json  
**Características:**
- Subida en un solo paso
- No expone credenciales de Immich
- Rollback automático
- Rate limiting (10 uploads/15min)
- Organización automática en álbumes

**Body (multipart/form-data):**
- `file` - Archivo multimedia
- `titulo` - Título del medio
- `tipoMedio` - fotografia, video, audio, corto_cine
- `concursoId` - ID del concurso
- `categoriaId` - ID de la categoría

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "immichAssetId": "abc-123",
    "mediaUrl": "https://api.webfestival.art/api/v1/proxy/media/abc-123",
    "thumbnailUrl": "https://api.webfestival.art/api/v1/proxy/media/abc-123?size=400x225"
  }
}
```

---

#### GET /api/v1/media/:id
**Estado:** ✅ ACTIVO  
**Versión:** 2.1.0 (URLs dinámicas)  
**Descripción:** Obtener información de un medio  
**Colección:** WebFestival-API-Media.postman_collection.json

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "immich_asset_id": "abc-123",
    "medio_url": "https://api.webfestival.art/api/v1/proxy/media/abc-123",
    "thumbnail_url": "https://api.webfestival.art/api/v1/proxy/media/abc-123?size=400x225",
    "preview_url": "https://api.webfestival.art/api/v1/proxy/media/abc-123?size=1280x720"
  }
}
```

**Nota:** URLs construidas dinámicamente desde `immich_asset_id`

---

#### GET /api/v1/media/user/:userId
**Estado:** ✅ ACTIVO  
**Versión:** 2.1.0 (URLs dinámicas)  
**Descripción:** Listar medios de un usuario con paginación  
**Colección:** WebFestival-API-Media.postman_collection.json

**Query Parameters:**
- `page` - Número de página (default: 1)
- `limit` - Resultados por página (default: 20, max: 100)
- `tipoMedio` - Filtrar por tipo (opcional)

---

### 2. Uploads Específicos

#### POST /api/v1/users/:userId/avatar
**Estado:** ✅ ACTIVO  
**Versión:** 2.0.0+  
**Descripción:** Subir avatar de usuario  
**Colección:** WebFestival-API-Upload-Immich.postman_collection.json  
**Límite:** 5MB  
**Formatos:** JPG, PNG, WebP  
**Campo:** `avatar`

---

#### POST /api/v1/concursos/:concursoId/imagen
**Estado:** ✅ ACTIVO (NUEVO en v2.1.0)  
**Versión:** 2.1.0  
**Descripción:** Subir poster de concurso a Immich  
**Colección:** WebFestival-API-Concursos.postman_collection.json  
**Límite:** 10MB  
**Formatos:** JPG, PNG, WebP, HEIC  
**Campo:** `imagen`  
**Rol:** ADMIN

**Características:**
- Se almacena en álbum "Sistema - Administrador"
- Solo guarda `imagen_asset_id` en BD
- URLs construidas dinámicamente
- Reemplaza imagen anterior si existe

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "imagen_asset_id": "abc-123",
    "imagen_url": "https://api.webfestival.art/api/v1/proxy/media/abc-123",
    "imagen_thumbnail": "https://api.webfestival.art/api/v1/proxy/media/abc-123?size=400x225",
    "imagen_preview": "https://api.webfestival.art/api/v1/proxy/media/abc-123?size=1280x720"
  }
}
```

---

#### POST /api/v1/cms/contenido/:contenidoId/imagen
**Estado:** ✅ ACTIVO  
**Versión:** 2.0.0+  
**Descripción:** Subir imagen destacada de contenido CMS  
**Colección:** WebFestival-API-Upload-Immich.postman_collection.json  
**Límite:** 10MB  
**Formatos:** JPG, PNG, WebP  
**Campo:** `imagen`  
**Rol:** ADMIN, CONTENT_ADMIN

---

#### POST /api/v1/jurados/:juradoId/portfolio
**Estado:** ✅ ACTIVO  
**Versión:** 2.0.0+  
**Descripción:** Subir portfolio de jurado  
**Colección:** WebFestival-API-Upload-Immich.postman_collection.json  
**Límite:** 5MB  
**Formatos:** JPG, PNG, WebP  
**Campo:** `portfolio`  
**Rol:** JURADO, ADMIN

---

### 3. Proxy de Imágenes

#### GET /api/v1/proxy/media/:assetId
**Estado:** ✅ ACTIVO (NUEVO en v2.1.0)  
**Versión:** 2.1.0  
**Descripción:** Proxy de imágenes sin autenticación  
**Colección:** WebFestival-API-Media.postman_collection.json  
**Autenticación:** No requerida

**Query Parameters:**
- `size` - Tamaño de la imagen (opcional)
  - `400x225` - Thumbnail
  - `1280x720` - Preview
  - Sin parámetro - Original

**Ejemplos:**
```
GET /api/v1/proxy/media/abc-123              # Original
GET /api/v1/proxy/media/abc-123?size=400x225  # Thumbnail
GET /api/v1/proxy/media/abc-123?size=1280x720 # Preview
```

---

### 4. Concursos

#### GET /api/v1/concursos/activos
**Estado:** ✅ ACTIVO  
**Versión:** 2.1.0 (URLs dinámicas)  
**Descripción:** Listar concursos activos  
**Colección:** WebFestival-API-Concursos.postman_collection.json  
**Autenticación:** No requerida

**Características:**
- ✅ URLs de imágenes incluidas automáticamente
- ✅ URLs construidas dinámicamente desde `imagen_asset_id`
- ✅ Proxy sin autenticación

**Respuesta incluye URLs dinámicas:**
```json
{
  "success": true,
  "data": [{
    "id": 1,
    "titulo": "Concurso 2025",
    "imagen_asset_id": "abc-123",
    "imagen_url": "https://api.webfestival.art/api/v1/proxy/media/abc-123",
    "imagen_thumbnail": "https://api.webfestival.art/api/v1/proxy/media/abc-123?size=400x225",
    "imagen_preview": "https://api.webfestival.art/api/v1/proxy/media/abc-123?size=1280x720"
  }]
}
```

**Nota:** Si el concurso no tiene imagen, los campos `imagen_*` no aparecen en la respuesta.

---

#### GET /api/v1/concursos/:id
**Estado:** ✅ ACTIVO  
**Versión:** 2.1.0 (URLs dinámicas)  
**Descripción:** Obtener detalles de un concurso  
**Colección:** WebFestival-API-Concursos.postman_collection.json  
**Autenticación:** No requerida

**Características:**
- ✅ URLs de imágenes incluidas automáticamente
- ✅ Información completa del concurso
- ✅ Categorías, inscripciones y medios incluidos

---

#### POST /api/v1/concursos
**Estado:** ✅ ACTIVO  
**Versión:** 2.1.0 (sin imagen_url)  
**Descripción:** Crear concurso  
**Colección:** WebFestival-API-Concursos.postman_collection.json  
**Rol:** ADMIN

**Body (sin imagen_url):**
```json
{
  "titulo": "Concurso 2025",
  "descripcion": "...",
  "fecha_inicio": "2025-03-01T00:00:00Z",
  "fecha_final": "2025-03-31T23:59:59Z",
  "max_envios": 3,
  "tamano_max_mb": 10,
  "categorias": [
    {"nombre": "Categoría 1"}
  ]
}
```

**Nota:** El campo `imagen_url` ya no se usa. Usa POST /api/v1/concursos/:id/imagen para subir la imagen.

---

## ❌ Endpoints Obsoletos (Eliminados)

### Método Multi-Paso (v1.x)

Los siguientes endpoints del método multi-paso han sido **ELIMINADOS**:

#### ❌ POST /api/v1/media/contests/:concursoId/upload-url
**Estado:** OBSOLETO  
**Eliminado en:** v2.0.0  
**Reemplazo:** POST /api/v1/media/upload

**Razón:** El método de un solo paso es más seguro y simple.

---

#### ❌ POST /api/v1/media/upload/confirm
**Estado:** OBSOLETO  
**Eliminado en:** v2.0.0  
**Reemplazo:** POST /api/v1/media/upload

**Razón:** Ya no es necesario confirmar la subida.

---

#### ❌ GET /api/v1/media/upload/config
**Estado:** OBSOLETO  
**Eliminado en:** v2.0.0  
**Reemplazo:** Configuración interna del servidor

**Razón:** Las credenciales de Immich no se exponen al cliente.

---

## 🔄 Campos Obsoletos en Base de Datos

Los siguientes campos han sido **ELIMINADOS** de la base de datos:

### Tabla `medios`
- ❌ `medio_url` - Eliminado en v2.1.0
- ❌ `thumbnail_url` - Eliminado en v2.1.0
- ❌ `preview_url` - Eliminado en v2.1.0
- ✅ `immich_asset_id` - Fuente de verdad

### Tabla `concursos`
- ❌ `imagen_url` - Eliminado en v2.1.0
- ✅ `imagen_asset_id` - Fuente de verdad

**Migración aplicada:**
- `20251128032801_remove_unused_url_fields`
- `20251128054402_remove_concurso_imagen_url`

---

## 📁 Organización en Immich

### Álbumes de Medios de Participantes

**Formato anterior (obsoleto):**
```
Concurso: Fotografía de Naturaleza 2025 / Usuario: Juan Pérez
```

**Formato actual (v2.1.0):**
```
Fotografía de Naturaleza 2025 - Juan Pérez
```

### Álbum del Sistema

**Nombre:** `Sistema - Administrador`

**Contenido:**
- Posters de concursos
- Banners del sistema
- Imágenes administrativas

---

## 📊 Límites y Restricciones

### Tamaños Máximos

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

### Endpoints Públicos (Sin Autenticación)
- GET /api/v1/proxy/media/:assetId
- GET /api/v1/concursos/activos
- GET /api/v1/concursos/finalizados
- GET /api/v1/concursos/:id

### Endpoints con Autenticación JWT
- Todos los demás endpoints requieren:
  ```
  Authorization: Bearer <token>
  ```

---

## 📦 Colecciones de Postman

### Colecciones Actualizadas (v2.1.0)

1. ✅ **WebFestival-API-Concursos.postman_collection.json**
   - Agregado: POST /api/v1/concursos/:id/imagen
   - Actualizado: Respuestas con URLs dinámicas
   - Eliminado: Campo `imagen_url` de ejemplos

2. ✅ **WebFestival-API-Media.postman_collection.json**
   - Actualizado: URLs dinámicas en respuestas
   - Agregado: Ejemplos de proxy

3. ✅ **WebFestival-API-Upload-Immich.postman_collection.json**
   - Actualizado: Tests y descripciones
   - Verificado: Nombres de campos correctos

4. ✅ **WebFestival-API-Flujo-Completo-Subida.postman_collection.json**
   - Eliminado: Secciones del método multi-paso
   - Actualizado: Flujo simplificado de un solo paso
   - Agregado: Sección de imágenes de concursos

### Colecciones Sin Cambios

Las siguientes colecciones no requieren actualización:
- WebFestival-API-Auth.postman_collection.json
- WebFestival-API-Usuarios.postman_collection.json
- WebFestival-API-Categorias.postman_collection.json
- WebFestival-API-Criterios.postman_collection.json
- WebFestival-API-Calificaciones.postman_collection.json
- WebFestival-API-Jurado-Asignacion.postman_collection.json
- WebFestival-API-CMS.postman_collection.json
- WebFestival-API-Interactions.postman_collection.json
- WebFestival-API-Newsletter.postman_collection.json
- WebFestival-API-Subscriptions.postman_collection.json
- WebFestival-API-Billing.postman_collection.json
- WebFestival-API-Notifications.postman_collection.json
- WebFestival-API-Social-Media.postman_collection.json
- WebFestival-API-Health.postman_collection.json

---

## ✅ Checklist de Verificación

### Base de Datos
- [x] Migración `20251128032801_remove_unused_url_fields` aplicada
- [x] Migración `20251128054402_remove_concurso_imagen_url` aplicada
- [x] Campos obsoletos eliminados
- [x] Campos `immich_asset_id` y `imagen_asset_id` existen

### Backend
- [x] Código actualizado
- [x] URLs construidas dinámicamente
- [x] Endpoint POST /api/v1/concursos/:id/imagen implementado
- [x] Proxy GET /api/v1/proxy/media/:assetId implementado
- [x] Álbumes con formato simplificado

### Postman
- [x] Colecciones actualizadas
- [x] Endpoints obsoletos eliminados
- [x] Ejemplos sin campos obsoletos
- [x] Tests actualizados
- [x] Documentación actualizada

### Documentación
- [x] README.md actualizado
- [x] README-ENDPOINTS.md actualizado
- [x] CAMBIOS-POSTMAN-v2.1.0.md creado
- [x] RESUMEN-ACTUALIZACION-POSTMAN.md creado
- [x] ESTADO-ENDPOINTS-v2.1.0.md creado

---

## 🎯 Próximos Pasos

### Para Desarrolladores Frontend
1. Actualizar código cliente al método de un solo paso
2. Actualizar manejo de URLs (ahora son dinámicas)
3. Implementar nuevo endpoint de imágenes de concursos
4. Probar flujo completo en desarrollo

### Para Testing
1. Importar colecciones actualizadas
2. Probar subida de medios
3. Probar subida de imagen de concurso
4. Verificar URLs dinámicas
5. Probar proxy sin autenticación

### Para Producción
1. Aplicar migraciones de base de datos
2. Actualizar código del servidor
3. Recompilar y reiniciar
4. Verificar logs
5. Monitorear métricas

---

## 📞 Soporte

### Documentación Completa
- `postman/README.md` - Guía principal
- `postman/README-ENDPOINTS.md` - Índice de endpoints
- `postman/CAMBIOS-POSTMAN-v2.1.0.md` - Cambios detallados
- `document/RESUMEN-FINAL-CAMBIOS.md` - Cambios del sistema

### Comandos Útiles

```bash
# Ver estado de migraciones
npx prisma migrate status

# Ver logs del servidor
pm2 logs webfestival-api

# Verificar Immich
curl https://medios.webfestival.art/api/server-info

# Verificar variables de entorno
cat .env | grep -E "(API_BASE_URL|IMMICH)"
```

---

**Última actualización:** 29 de Noviembre, 2025  
**Versión:** 2.1.0  
**Estado:** ✅ Completado y Verificado
