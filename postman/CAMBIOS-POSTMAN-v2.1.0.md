# Actualización de Colecciones Postman v2.1.1

## 📋 Resumen de Cambios

Actualización completa de las colecciones de Postman para reflejar los cambios implementados en el sistema de URLs dinámicas, subida de imágenes de concursos, URLs de medios automáticas y nueva gestión de roles.

**Fecha:** 10 de Diciembre, 2025  
**Versión:** 2.1.1

## 🆕 Novedades v2.1.1

### URLs de Medios Automáticas
- Cada medio en el array `medios` incluye URLs completas
- Endpoint GET /concursos/{id} actualizado
- Tests mejorados en flujo completo

### Nueva Colección de Roles
- WebFestival-API-Roles-Permisos.postman_collection.json
- 16 endpoints organizados en 5 grupos
- Gestión completa de jurados y especializaciones

---

## ✅ Cambios Realizados

### 1. WebFestival-API-Media.postman_collection.json

#### Eliminado (Obsoleto)
- ❌ **Generar URL de Subida** - Método multi-paso obsoleto
- ❌ **Procesar Subida Completada** - Ya no se usa

#### Actualizado
- ✅ **Upload Media Seguro** - Ahora es el método principal y recomendado
- ✅ **Obtener Medio por ID** - Actualizado para mostrar URLs dinámicas
- ✅ **Medios por Usuario** - Agregada paginación y filtros
- ✅ **Ver Imagen a través del Proxy** - Nuevo endpoint sin autenticación
- ✅ **Ver Thumbnail a través del Proxy** - Nuevo endpoint con parámetro size

#### Descripción Actualizada
- Menciona URLs dinámicas construidas desde `immich_asset_id`
- Explica el nuevo formato de álbumes
- Documenta los tamaños máximos por tipo de medio

---

### 2. WebFestival-API-Flujo-Completo-Subida.postman_collection.json

#### Eliminado (Obsoleto)
- ❌ **5️⃣ Preparar Subida (Método Anterior)** - Sección completa eliminada
  - Obtener Configuración
  - Generar URL de Subida
- ❌ **6️⃣ Subir Archivo (Método Anterior)** - Sección completa eliminada
  - Subir a Immich
- ❌ **7️⃣ Procesar Subida (Método Anterior)** - Sección completa eliminada
  - Confirmar Subida
- ❌ **8️⃣ Verificación (Método Anterior)** - Sección completa eliminada
  - Ver Medio Subido
  - Mis Medios en el Concurso
  - Verificar Límites

#### Mantenido y Actualizado
- ✅ **1️⃣ Autenticación** - Sin cambios
- ✅ **2️⃣ Explorar Concursos** - Actualizado para mostrar URLs dinámicas de imágenes
- ✅ **2.5️⃣ Consultar Imagen del Concurso** - Nueva sección
  - Ver Imagen del Concurso (Original)
  - Ver Thumbnail del Concurso
- ✅ **3️⃣ Inscripción** - Sin cambios
- ✅ **4️⃣ Subida Segura (Nuevo Método)** - Ahora es el método principal
  - Upload Media Seguro
  - Ver Medio Subido
  - Listar Mis Medios
- ✅ **9️⃣ Consultar Imágenes (Frontend)** - Actualizado
  - Ver Imagen Original (Proxy)
  - Ver Thumbnail (Proxy)
  - Ver Preview (Proxy)
  - Listar Medios con URLs

#### Descripción Actualizada
- Eliminada mención al "método anterior"
- Enfoque en el método actual de un solo paso
- Documentación del nuevo formato de álbumes
- Explicación de URLs dinámicas

---

### 3. WebFestival-API-Concursos.postman_collection.json

#### Agregado (Nuevo)
- ✅ **Subir Imagen de Concurso** - Nuevo endpoint POST /api/v1/concursos/:id/imagen
  - Sube imagen a Immich
  - Se almacena en álbum "Sistema - Administrador"
  - Retorna URLs dinámicas

#### Actualizado
- ✅ **Detalle de Concurso** - Ahora muestra URLs dinámicas de imagen
  - `imagen_asset_id`
  - `imagen_url`
  - `imagen_thumbnail`
  - `imagen_preview`

---

### 4. WebFestival-API-Upload-Immich.postman_collection.json

#### Sin Cambios Mayores
- ✅ Colección ya estaba actualizada con el método seguro
- ✅ Descripción mejorada para claridad

---

### 5. postman/README-ENDPOINTS.md

#### Actualizado
- ✅ Sección de "Endpoints de Subida Segura" actualizada
- ✅ Agregada información sobre URLs dinámicas
- ✅ Documentado nuevo endpoint de subida de imagen de concurso
- ✅ Actualizado changelog con versión 2.1.0
- ✅ Eliminadas referencias a métodos obsoletos

---

## 📊 Estadísticas de Cambios

### Endpoints Eliminados
- **Total:** 6 endpoints obsoletos
- Generar URL de Subida
- Procesar Subida Completada
- Subir a Immich (directo)
- Confirmar Subida
- Ver Medio Subido (método antiguo)
- Mis Medios en el Concurso (método antiguo)

### Endpoints Agregados
- **Total:** 4 nuevos endpoints
- POST /api/v1/concursos/:id/imagen
- GET /api/v1/proxy/media/:assetId
- GET /api/v1/proxy/media/:assetId?size=400x225
- GET /api/v1/proxy/media/:assetId?size=1280x720

### Endpoints Actualizados
- **Total:** 5 endpoints
- GET /api/v1/media/:id (URLs dinámicas)
- GET /api/v1/media/user/:userId (paginación)
- GET /api/v1/concursos/:id (URLs dinámicas de imagen)
- POST /api/v1/media/upload (documentación mejorada)
- GET /api/v1/concursos/activos (URLs dinámicas)

---

## 🔑 Cambios Clave

### 1. URLs Dinámicas

**Antes:**
```json
{
  "medio_url": "https://medios.webfestival.art/api/assets/abc/original",
  "thumbnail_url": "https://medios.webfestival.art/api/assets/abc/thumbnail"
}
```

**Ahora:**
```json
{
  "immich_asset_id": "abc-123",
  "medio_url": "https://api.webfestival.art/api/v1/proxy/media/abc-123",
  "thumbnail_url": "https://api.webfestival.art/api/v1/proxy/media/abc-123?size=400x225",
  "preview_url": "https://api.webfestival.art/api/v1/proxy/media/abc-123?size=1280x720"
}
```

### 2. Formato de Álbumes

**Antes:**
```
Concurso: Fotografía de Naturaleza 2025 / Usuario: Juan Pérez
```

**Ahora:**
```
Fotografía de Naturaleza 2025 - Juan Pérez
```

### 3. Método de Subida

**Antes (Multi-paso):**
1. Generar URL de subida
2. Subir a Immich directamente
3. Confirmar subida

**Ahora (Un solo paso):**
1. POST /api/v1/media/upload (todo en uno)

---

## 🎯 Beneficios de los Cambios

### Para Desarrolladores
1. **Menos complejidad:** Un solo endpoint en lugar de tres
2. **Más seguro:** No se exponen credenciales de Immich
3. **Mejor manejo de errores:** Rollback automático
4. **URLs consistentes:** Todas construidas desde el mismo patrón

### Para el Sistema
1. **Flexibilidad:** Cambiar dominio solo requiere actualizar `API_BASE_URL`
2. **Mantenibilidad:** Código más limpio y unificado
3. **Escalabilidad:** Fácil agregar CDN o cambiar servidor de medios
4. **Consistencia:** Mismo sistema para medios y concursos

---

## 📝 Guía de Migración

### Si usabas el método anterior (multi-paso)

**Paso 1:** Actualiza tus colecciones de Postman
```bash
# Importa las nuevas versiones desde:
postman/WebFestival-API-Media.postman_collection.json
postman/WebFestival-API-Flujo-Completo-Subida.postman_collection.json
postman/WebFestival-API-Concursos.postman_collection.json
```

**Paso 2:** Cambia tu código de cliente

**Antes:**
```javascript
// 1. Generar URL
const urlResponse = await fetch('/media/contests/1/upload-url', {
  method: 'POST',
  body: JSON.stringify({ titulo, tipo_medio, ... })
});
const { upload_url, upload_token } = await urlResponse.json();

// 2. Subir a Immich
const formData = new FormData();
formData.append('assetData', file);
await fetch(upload_url, {
  method: 'POST',
  body: formData
});

// 3. Confirmar
await fetch('/media/contests/1/process-upload', {
  method: 'POST',
  body: JSON.stringify({ uploadId: upload_token, ... })
});
```

**Ahora:**
```javascript
// Un solo paso
const formData = new FormData();
formData.append('file', file);
formData.append('titulo', titulo);
formData.append('tipoMedio', tipoMedio);
formData.append('concursoId', concursoId);
formData.append('categoriaId', categoriaId);

const response = await fetch('/api/v1/media/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const { data } = await response.json();
// data.mediaUrl ya está listo para usar
```

**Paso 3:** Actualiza cómo muestras las imágenes

**Antes:**
```html
<img src="{{medio.medio_url}}" />
```

**Ahora (igual, pero las URLs son dinámicas):**
```html
<!-- Original -->
<img src="{{medio.medio_url}}" />

<!-- Thumbnail -->
<img src="{{medio.thumbnail_url}}" />

<!-- Preview -->
<img src="{{medio.preview_url}}" />
```

---

## 🧪 Testing

### Probar Subida de Medio

1. Importa la colección actualizada
2. Configura el environment (baseUrl, accessToken)
3. Ejecuta el flujo:
   - Login
   - Ver Concursos Activos
   - Inscribirse
   - Upload Media Seguro
   - Ver Medio Subido

### Probar Imagen de Concurso

1. Login como ADMIN
2. Crear o seleccionar concurso
3. Ejecutar "Subir Imagen de Concurso"
4. Verificar respuesta con URLs dinámicas
5. Probar acceso a imagen vía proxy

---

## 📞 Soporte

### Documentación Relacionada
- `document/RESUMEN-FINAL-CAMBIOS.md` - Cambios completos del sistema
- `document/CAMBIOS-IMAGENES-CONCURSOS-IMMICH.md` - Imágenes de concursos
- `document/MIGRACION-URLS-DINAMICAS.md` - URLs dinámicas
- `postman/README-ENDPOINTS.md` - Documentación de endpoints

### Problemas Comunes

**Error: "Cannot POST /media/contests/:id/upload-url"**
- Este endpoint ya no existe, usa `/api/v1/media/upload`

**Error: "medio_url is undefined"**
- Asegúrate de usar la versión actualizada del backend
- Las URLs ahora se construyen desde `immich_asset_id`

**Error: "imagen_url is null"**
- El campo `imagen_url` ya no existe en la BD
- Usa `imagen_asset_id` y construye la URL dinámicamente

---

## ✅ Checklist de Actualización

### Colecciones de Postman
- [ ] Importadas colecciones actualizadas
- [ ] Variables de entorno configuradas
- [ ] Probado flujo de subida de medio
- [ ] Probado subida de imagen de concurso
- [ ] Probado acceso a imágenes vía proxy

### Código Cliente
- [ ] Actualizado a método de un solo paso
- [ ] Eliminadas referencias a endpoints obsoletos
- [ ] Actualizado manejo de URLs dinámicas
- [ ] Probado en desarrollo
- [ ] Probado en producción

### Documentación
- [ ] README actualizado
- [ ] Ejemplos de código actualizados
- [ ] Guías de usuario actualizadas

---

## 🎉 Conclusión

Las colecciones de Postman han sido completamente actualizadas para reflejar el nuevo sistema de URLs dinámicas y subida simplificada de medios. Los cambios mejoran significativamente la seguridad, mantenibilidad y experiencia de desarrollo.

**Próximos pasos:**
1. Importar las colecciones actualizadas
2. Probar los flujos completos
3. Actualizar código cliente si es necesario
4. Desplegar en producción

---

**Última actualización:** 29 de Noviembre, 2025  
**Versión:** 2.1.0  
**Estado:** ✅ Completado

---

## 🆕 Cambios v2.1.1 (10 de Diciembre, 2025)

### 1. WebFestival-API-Concursos.postman_collection.json

#### Actualizado
- ✅ **Detalle de Concurso** - Ahora incluye URLs de medios en la documentación
- ✅ **Ejemplos de respuesta** - Muestran medios con URLs completas
- ✅ **Documentación** - Explica las URLs automáticas de medios

### 2. WebFestival-API-Flujo-Completo-Subida.postman_collection.json

#### Actualizado
- ✅ **Test "Detalles del Concurso"** - Muestra URLs de medios en consola
- ✅ **Documentación** - Ejemplos actualizados con medios y URLs
- ✅ **Debugging** - Información mejorada sobre medios participantes

### 3. WebFestival-API-Roles-Permisos.postman_collection.json ⭐ NUEVO

#### Funcionalidades
- ✅ **Consultas de Usuarios** (3 endpoints) - Búsqueda con filtros avanzados
- ✅ **Gestión de Jurados** (6 endpoints) - Especializaciones y asignaciones
- ✅ **Gestión de Roles** (2 endpoints) - Administración de usuarios
- ✅ **Seguimiento Social** (4 endpoints) - Sistema de seguimiento
- ✅ **Perfil Personal** (2 endpoints) - Gestión de perfil

#### Características
- 16 endpoints organizados en 5 grupos
- Tests automáticos con extracción de IDs
- Documentación completa con ejemplos
- URLs de imágenes de perfil incluidas

## 📊 Resumen de Cambios v2.1.1

### Archivos Modificados
- `WebFestival-API-Concursos.postman_collection.json` - URLs de medios
- `WebFestival-API-Flujo-Completo-Subida.postman_collection.json` - Tests mejorados

### Archivos Nuevos
- `WebFestival-API-Roles-Permisos.postman_collection.json` - Nueva colección

### Archivos Eliminados (Consolidación)
- `ACTUALIZACION-FLUJO-COMPLETO-v2.1.0.md` - Obsoleto
- `URLS-IMAGENES-CONCURSOS.md` - Información consolidada
- `VERIFICAR-URLS-IMAGENES-CONCURSOS.md` - Obsoleto
- `RESUMEN-ACTUALIZACIONES.md` - Duplicado
- `RESUMEN-EJECUTIVO.md` - Duplicado

### Beneficios
- ✅ **URLs automáticas** - Medios incluyen URLs completas
- ✅ **Gestión completa** - Nueva colección de roles y permisos
- ✅ **Documentación limpia** - Eliminados duplicados y obsoletos
- ✅ **Tests mejorados** - Mejor debugging e información
- ✅ **Consistencia** - Formato uniforme en todas las colecciones

---

**Total de colecciones:** 19  
**Total de endpoints:** 150+  
**Documentos de apoyo:** 8 (consolidados)