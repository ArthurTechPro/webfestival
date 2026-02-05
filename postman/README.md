# WebFestival API - Colecciones de Postman

Esta carpeta contiene todas las colecciones de Postman organizadas por controladores de la API de WebFestival.

## 📁 Estructura de Colecciones

Cada controlador tiene su propia colección con carpetas internas para organizar los endpoints:

### Colecciones por Controlador

1. **WebFestival-API-Auth.postman_collection.json** - Autenticación y gestión de sesiones
2. **WebFestival-API-Concursos.postman_collection.json** - Gestión de concursos e inscripciones
3. **WebFestival-API-Media.postman_collection.json** - Gestión de medios multimedia
4. **WebFestival-API-Criterios.postman_collection.json** - Criterios de evaluación
5. **WebFestival-API-Calificaciones.postman_collection.json** - Sistema de calificaciones y evaluación
6. **WebFestival-API-Usuarios.postman_collection.json** - Perfiles, seguimientos y jurados
7. **WebFestival-API-Jurado-Asignacion.postman_collection.json** - Asignación inteligente de jurados
8. **WebFestival-API-CMS.postman_collection.json** - Sistema de gestión de contenido
9. **WebFestival-API-Interactions.postman_collection.json** - Likes, comentarios y reportes
10. **WebFestival-API-Newsletter.postman_collection.json** - Newsletter y contenido educativo
11. **WebFestival-API-Subscriptions.postman_collection.json** - Suscripciones y planes
12. **WebFestival-API-Billing.postman_collection.json** - Facturación y pagos
13. **WebFestival-API-Notifications.postman_collection.json** - Sistema de notificaciones
14. **WebFestival-API-Social-Media.postman_collection.json** - Integración con redes sociales
15. **WebFestival-API-Health.postman_collection.json** - Health checks y diagnósticos
16. **WebFestival-API-Upload-Immich.postman_collection.json** - ✨ **NUEVO** - Subida de imágenes a Immich

### Colección Especial

- **WebFestival-API-Flujo-Completo-Subida.postman_collection.json** - Flujo completo paso a paso para subir medios

### Environments

- **Local.postman_environment.json** - Configuración para desarrollo local
- **Production.postman_environment.json** - Configuración para producción

## 🚀 Cómo Usar

### Importar en Postman

1. Abre Postman
2. Click en "Import" en la esquina superior izquierda
3. Arrastra y suelta todos los archivos `.json` de esta carpeta
4. Las colecciones y environments se importarán automáticamente

### Configurar Environment

1. Selecciona el environment apropiado (Local o Production) en el dropdown superior derecho
2. Para Local: Asegúrate de que tu servidor esté corriendo en `http://localhost:3000`
3. Para Production: Usa `http://api.webfestival.art/api/v1`

### Autenticación

La mayoría de los endpoints requieren autenticación. Sigue estos pasos:

1. Ve a la colección **Auth**
2. Ejecuta el endpoint **POST Login** o **POST Register**
3. Copia el `accessToken` de la respuesta
4. El token se guardará automáticamente en la variable de environment `{{accessToken}}`
5. Los demás endpoints usarán automáticamente este token

## 📝 Variables de Environment

### Variables Comunes

- `baseUrl` - URL base de la API
- `accessToken` - Token JWT de autenticación
- `refreshToken` - Token para renovar el accessToken
- `userId` - ID del usuario autenticado
- `currentUserId` - ID del usuario actual (para uploads)
- `concursoId` - ID de concurso para pruebas
- `medioId` - ID de medio para pruebas
- `categoriaId` - ID de categoría para pruebas
- `criterioId` - ID de criterio
- `calificacionId` - ID de calificación
- `contenidoId` - ID de contenido CMS
- `comentarioId` - ID de comentario
- `notificacionId` - ID de notificación
- `planId` - ID de plan de suscripción
- `invoiceId` - ID de factura
- `uploadId` - ID de subida temporal
- `immichAssetId` - ID de asset en Immich
- `authToken` - Alias de accessToken (para compatibilidad)

## 🔐 Roles de Usuario

La API maneja diferentes roles con permisos específicos:

- **PARTICIPANTE** - Usuario regular que puede participar en concursos
- **JURADO** - Puede evaluar medios asignados
- **ADMIN** - Acceso completo al sistema
- **CONTENT_ADMIN** - Gestión de contenido CMS

## 📚 Documentación por Módulo

### Auth (Autenticación)
- Login y registro de usuarios
- Renovación de tokens
- Cambio de contraseña
- Validación de sesión

### Concursos
- CRUD de concursos (Admin)
- Inscripción y cancelación
- Consulta de concursos activos/finalizados
- Verificación de inscripción

### Media (Medios)
- Generación de URLs de subida
- Procesamiento de archivos
- Galerías de ganadores y destacados
- Gestión de medios por usuario/concurso

### Criterios
- CRUD de criterios de evaluación
- Criterios por tipo de medio
- Criterios universales
- Reordenamiento y estadísticas

### Calificaciones
- Crear y actualizar calificaciones (Jurado)
- Asignaciones de medios a jurados
- Progreso de evaluación
- Resultados finales y rankings

### Usuarios
- Perfiles públicos y privados
- Sistema de seguimientos
- Especialización de jurados
- Búsqueda de usuarios

### Jurado-Asignación
- Asignación manual y automática
- Sugerencias inteligentes
- Validación de cobertura
- Estadísticas de asignación

### CMS
- Gestión de contenido (blog, páginas)
- Taxonomía (categorías, etiquetas)
- SEO y métricas
- Analytics y búsqueda avanzada

### Interactions
- Likes unificados
- Comentarios anidados
- Sistema de reportes
- Moderación centralizada

### Newsletter
- Suscripción y confirmación
- Contenido educativo
- Generación de digests
- Estadísticas de suscriptores

### Subscriptions
- Planes de suscripción
- Procesamiento de pagos (Stripe/PayPal)
- Límites de uso
- Webhooks de pago

### Billing
- Historial de facturas
- Métodos de pago
- Estadísticas de facturación
- Recuperación de pagos fallidos

### Notifications
- Notificaciones de usuario
- Trabajos programados
- Limpieza de notificaciones antiguas

### Social Media
- Generación de enlaces para compartir
- Acceso público a medios ganadores
- Configuración de APIs sociales

### Health
- Estado general del sistema
- Health check de base de datos
- Health check de Immich
- Estadísticas del sistema

### Upload Immich ⭐ **ACTUALIZADO v2.1.0**
- Subida segura de medios en un solo paso (POST /api/v1/media/upload)
- Subida de avatares de usuario (POST /api/v1/users/:id/avatar)
- Subida de posters de concurso (POST /api/v1/concursos/:id/imagen) - **NUEVO**
- Subida de imágenes CMS (POST /api/v1/cms/contenido/:id/imagen)
- Subida de portfolios de jurado (POST /api/v1/jurados/:id/portfolio)
- URLs dinámicas construidas desde `immich_asset_id`
- Proxy de imágenes sin autenticación (GET /api/v1/proxy/media/:assetId)
- Álbumes simplificados: "{Concurso} - {Usuario}"
- Tests automáticos incluidos

## 🛠️ Troubleshooting

### Token Expirado
Si recibes error 401, ejecuta el endpoint **POST Refresh Token** en la colección Auth.

### Variables No Definidas
Asegúrate de tener seleccionado el environment correcto (Local o Production).

### Errores de Conexión
Verifica que el servidor esté corriendo y que la URL base sea correcta.

## 📞 Soporte

Para más información sobre la API, consulta:
- Documentación Swagger: `http://localhost:3000/api-docs` (Local)
- Repositorio: [GitHub](https://github.com/tu-repo/webfestival-api)

## 🆕 Novedades - v2.1.0: URLs Dinámicas y Mejoras

### ⭐ Cambios Principales

La API ha sido actualizada con URLs dinámicas y mejoras en la gestión de imágenes:

#### 🔄 URLs Dinámicas
- Eliminados campos obsoletos: `medio_url`, `thumbnail_url`, `preview_url`, `imagen_url`
- URLs construidas dinámicamente desde `immich_asset_id`
- Cambiar dominio solo requiere actualizar `API_BASE_URL`
- Proxy sin autenticación: GET /api/v1/proxy/media/:assetId

#### 🖼️ Nuevo Endpoint de Imágenes de Concursos
- POST /api/v1/concursos/:id/imagen - Subir poster de concurso
- Se almacena en álbum "Sistema - Administrador"
- Solo guarda `imagen_asset_id` en BD
- URLs construidas dinámicamente

#### 📁 Álbumes Simplificados
- Formato anterior: "Concurso: Fotografía 2025 / Usuario: Juan Pérez"
- Formato nuevo: "Fotografía 2025 - Juan Pérez"
- Álbum del sistema: "Sistema - Administrador"

### ⭐ Subida Segura en Un Solo Paso (v2.0.0)

La API incluye un sistema simplificado de subida de medios que **no expone credenciales de Immich al cliente**:

#### Endpoint Principal de Subida Segura

- **POST** `/api/v1/media/upload` - **NUEVO** - Subir medio en un solo paso
  - Sube fotografías, videos, audio o cortometrajes
  - Validación automática de archivos
  - Rollback automático en caso de error
  - Rate limiting (10 uploads cada 15 minutos)
  - Organización automática en álbumes de Immich

#### Endpoints de Consulta

- **GET** `/api/v1/media/:id` - **NUEVO** - Obtener información de un medio
- **GET** `/api/v1/media/user/:userId` - **NUEVO** - Listar medios de usuario (paginado)

#### Endpoints de Upload Específicos

- **POST** `/api/v1/users/:userId/avatar` - Subir avatar (máx 5MB)
- **POST** `/api/v1/concursos/:concursoId/imagen` - Subir poster (máx 10MB)
- **POST** `/api/v1/cms/contenido/:contenidoId/imagen` - Subir imagen CMS (máx 10MB)
- **POST** `/api/v1/jurados/:juradoId/portfolio` - Subir portfolio (máx 5MB)

### 🎯 Ventajas del Nuevo Sistema

- ✅ **Seguridad:** Credenciales de Immich permanecen en el servidor
- ✅ **Simplicidad:** Un solo endpoint para todo el proceso
- ✅ **Confiabilidad:** Rollback automático si algo falla
- ✅ **Validación:** Tipos de archivo, tamaños y formatos automáticos
- ✅ **Rate Limiting:** Protección contra abuso
- ✅ **Organización:** Álbumes automáticos en Immich

### 📏 Límites y Formatos

| Tipo de Medio | Tamaño Máximo | Formatos Soportados |
|---------------|---------------|---------------------|
| Fotografía | 50 MB | JPEG, PNG, HEIC, WebP |
| Video | 500 MB | MP4, MOV, AVI |
| Audio | 100 MB | MP3, WAV, AAC |
| Avatar | 5 MB | JPEG, PNG, WebP |
| Poster/CMS | 10 MB | JPEG, PNG, WebP |

### 📚 Documentación Completa

Para información detallada, consulta:

- **[README-ENDPOINTS.md](./README-ENDPOINTS.md)** - Índice completo de endpoints
- **[../webfestival-api/docs/API-MEDIA-UPLOAD-SWAGGER.md](../webfestival-api/docs/API-MEDIA-UPLOAD-SWAGGER.md)** - Documentación con ejemplos de código
- **Colección Postman:** `WebFestival-API-Upload-Immich.postman_collection.json`
- **Flujo Completo:** `WebFestival-API-Flujo-Completo-Subida.postman_collection.json`

### 🔄 Migración desde Método Anterior

Si estabas usando el método multi-paso anterior:

**Antes (3 pasos - OBSOLETO):**
1. ~~Generar URL de subida~~
2. ~~Subir archivo a Immich~~
3. ~~Confirmar subida~~

**Ahora (1 paso):**
1. POST `/api/v1/media/upload` con el archivo

**Nota:** El método multi-paso ha sido eliminado. Usa el método de un solo paso.

### URLs Dinámicas en Respuestas

Todos los endpoints que retornan medios incluyen URLs construidas dinámicamente:

```json
{
  "immich_asset_id": "abc-123-def",
  "medio_url": "https://api.webfestival.art/api/v1/proxy/media/abc-123-def",
  "thumbnail_url": "https://api.webfestival.art/api/v1/proxy/media/abc-123-def?size=400x225",
  "preview_url": "https://api.webfestival.art/api/v1/proxy/media/abc-123-def?size=1280x720"
}
```

**Beneficios:**
- ✅ Flexibilidad: Cambiar dominio solo requiere actualizar `API_BASE_URL`
- ✅ Consistencia: Todas las URLs desde una única fuente de verdad
- ✅ Seguridad: No se exponen credenciales de Immich
- ✅ Mantenibilidad: Código más limpio y unificado
- ✅ Escalabilidad: Fácil agregar CDN

### 📊 Changelog

#### v2.1.0 (2025-11-29) - URLs Dinámicas
- ✅ URLs construidas dinámicamente desde `immich_asset_id`
- ✅ Eliminados campos obsoletos de BD
- ✅ Nuevo endpoint POST /api/v1/concursos/:id/imagen
- ✅ Proxy sin autenticación GET /api/v1/proxy/media/:assetId
- ✅ Formato de álbumes simplificado
- ✅ Colecciones Postman actualizadas

#### v2.0.0 (2024-01-15) - Subida Segura
- ✅ Nuevo endpoint POST /api/v1/media/upload
- ✅ Método de un solo paso
- ✅ Eliminado método multi-paso

---

**Versión:** 2.1.0  
**Última actualización:** Noviembre 29, 2025
