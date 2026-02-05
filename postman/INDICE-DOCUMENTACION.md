# 📚 Índice de Documentación - WebFestival API Postman

**Versión:** 2.1.1  
**Fecha:** 10 de Diciembre, 2025

---

## 🎯 Guías Principales

### Para Empezar

1. **[README.md](./README.md)** - Guía principal de las colecciones
   - Cómo importar colecciones
   - Configurar environments
   - Autenticación
   - Variables de entorno
   - Roles de usuario

2. **[README-ENDPOINTS.md](./README-ENDPOINTS.md)** - Índice completo de endpoints
   - Lista de todos los endpoints
   - Ejemplos de uso
   - Parámetros y respuestas
   - Límites y restricciones
   - Códigos de error

---

## 📊 Estado Actual (v2.1.0)

### Guías Específicas

3. **[URLS-IMAGENES-CONCURSOS.md](./URLS-IMAGENES-CONCURSOS.md)** - ⭐ URLs de imágenes en concursos
   - Confirmación: URLs ya incluidas en respuestas
   - Endpoints que incluyen URLs
   - Ejemplos de uso en frontend
   - Tamaños disponibles
   - Guía completa

### Documentos de Verificación

4. **[ESTADO-ENDPOINTS-v2.1.0.md](./ESTADO-ENDPOINTS-v2.1.0.md)** - Estado actual de endpoints
   - Endpoints activos
   - Endpoints obsoletos
   - Campos eliminados
   - Límites y restricciones
   - Organización en Immich

5. **[RESUMEN-VERIFICACION-FINAL.md](./RESUMEN-VERIFICACION-FINAL.md)** - Verificación completa
   - Búsqueda de obsoletos
   - Verificación de colecciones
   - Estadísticas de cambios
   - Checklist final

---

## 🔄 Historial de Cambios

### Cambios v2.1.1 (URLs en Medios + Roles)

6. **[CAMBIOS-POSTMAN-v2.1.0.md](./CAMBIOS-POSTMAN-v2.1.0.md)** - Cambios detallados v2.1.0 y v2.1.1
   - URLs automáticas para medios y concursos
   - Nueva colección de roles y permisos
   - Flujo completo actualizado
   - Documentación consolidada y limpia

### Cambios v2.1.0 (URLs Dinámicas)

7. **[RESUMEN-ACTUALIZACION-POSTMAN.md](./RESUMEN-ACTUALIZACION-POSTMAN.md)** - Resumen ejecutivo
   - Cambios principales
   - Archivos modificados
   - Beneficios
   - Próximos pasos

### Cambios v2.0.0 (Subida Segura)

8. **[ACTUALIZACION-COLECCION-UPLOAD.md](./ACTUALIZACION-COLECCION-UPLOAD.md)** - Actualización de upload
   - Problemas corregidos
   - Nombres de campos
   - Tests actualizados
   - Troubleshooting

9. **[FIX-FLUJO-COMPLETO-IMMICH.md](./FIX-FLUJO-COMPLETO-IMMICH.md)** - Fix de flujo completo
   - Corrección de URL
   - Flujo correcto
   - Verificación de variables
   - Troubleshooting

10. **[RESUMEN-ACTUALIZACIONES.md](./RESUMEN-ACTUALIZACIONES.md)** - Resumen de actualizaciones
   - Historial de cambios
   - Mejoras implementadas

---

## 📦 Colecciones de Postman

### Colecciones Principales

#### Autenticación y Usuarios
- **WebFestival-API-Auth.postman_collection.json** - Autenticación
- **WebFestival-API-Usuarios.postman_collection.json** - Gestión de usuarios
- **WebFestival-API-Roles-Permisos.postman_collection.json** ⭐ NUEVO - Roles y permisos

#### Concursos y Medios
- **WebFestival-API-Concursos.postman_collection.json** ⭐ v2.1.0
- **WebFestival-API-Inscripciones.postman_collection.json** ⭐ NUEVO - Inscripciones detalladas
- **WebFestival-API-Media.postman_collection.json** ⭐ v2.1.0
- **WebFestival-API-Upload-Immich.postman_collection.json** ⭐ v2.1.0
- **WebFestival-API-Flujo-Completo-Subida.postman_collection.json** ⭐ v2.1.0
- **WebFestival-API-Categorias.postman_collection.json**

#### Evaluación
- **WebFestival-API-Criterios.postman_collection.json**
- **WebFestival-API-Calificaciones.postman_collection.json**
- **WebFestival-API-Jurado-Asignacion.postman_collection.json**

#### Contenido y Social
- **WebFestival-API-CMS.postman_collection.json**
- **WebFestival-API-Interactions.postman_collection.json**
- **WebFestival-API-Newsletter.postman_collection.json**
- **WebFestival-API-Social-Media.postman_collection.json**

#### Suscripciones y Pagos
- **WebFestival-API-Subscriptions.postman_collection.json**
- **WebFestival-API-Billing.postman_collection.json**

#### Sistema
- **WebFestival-API-Notifications.postman_collection.json**
- **WebFestival-API-Health.postman_collection.json**
- **WebFestival-API-Voting.postman_collection.json** ⭐ NUEVO - Sistema de votaciones

### Environments

- **Local.postman_environment.json** - Desarrollo local
- **Production.postman_environment.json** - Producción

---

## 🎓 Guías por Caso de Uso

### Subir Medios

**Documentos relevantes:**
1. [README-ENDPOINTS.md](./README-ENDPOINTS.md) - Sección "Media Upload"
2. [ESTADO-ENDPOINTS-v2.1.0.md](./ESTADO-ENDPOINTS-v2.1.0.md) - Sección "Media Upload"
3. Colección: `WebFestival-API-Upload-Immich.postman_collection.json`
4. Flujo: `WebFestival-API-Flujo-Completo-Subida.postman_collection.json`

**Endpoints:**
- POST /api/v1/media/upload
- GET /api/v1/media/:id
- GET /api/v1/media/user/:userId

---

### Gestionar Inscripciones

**Documentos relevantes:**
1. [INSCRIPCIONES-ENDPOINTS.md](./INSCRIPCIONES-ENDPOINTS.md) - **NUEVO** - Guía de inscripciones
2. [README-ENDPOINTS.md](./README-ENDPOINTS.md) - Sección "Inscripciones"
3. Colección: `WebFestival-API-Inscripciones.postman_collection.json` - **NUEVA**
4. Colección: `WebFestival-API-Concursos.postman_collection.json` - Sección actualizada

**Endpoints:**
- POST /api/v1/concursos/inscripcion
- GET /api/v1/concursos/mis-inscripciones
- GET /api/v1/concursos/:id/verificar-inscripcion
- DELETE /api/v1/concursos/inscripcion/:id

---

### Gestionar Concursos

**Documentos relevantes:**
1. [README-ENDPOINTS.md](./README-ENDPOINTS.md) - Sección "Concursos"
2. [CAMBIOS-POSTMAN-v2.1.0.md](./CAMBIOS-POSTMAN-v2.1.0.md) - Sección "Concursos"
3. Colección: `WebFestival-API-Concursos.postman_collection.json`

**Endpoints:**
- GET /api/v1/concursos/activos
- GET /api/v1/concursos/:id
- POST /api/v1/concursos
- POST /api/v1/concursos/:id/imagen (nuevo en v2.1.0)

---

### Subir Imágenes Específicas

**Documentos relevantes:**
1. [ACTUALIZACION-COLECCION-UPLOAD.md](./ACTUALIZACION-COLECCION-UPLOAD.md)
2. [ESTADO-ENDPOINTS-v2.1.0.md](./ESTADO-ENDPOINTS-v2.1.0.md) - Sección "Uploads Específicos"
3. Colección: `WebFestival-API-Upload-Immich.postman_collection.json`

**Endpoints:**
- POST /api/v1/users/:id/avatar
- POST /api/v1/concursos/:id/imagen
- POST /api/v1/cms/contenido/:id/imagen
- POST /api/v1/jurados/:id/portfolio

---

### Acceder a Imágenes (Frontend)

**Documentos relevantes:**
1. [URLS-IMAGENES-CONCURSOS.md](./URLS-IMAGENES-CONCURSOS.md) - **NUEVO** - URLs en concursos
2. [README-ENDPOINTS.md](./README-ENDPOINTS.md) - Sección "Proxy de Imágenes"
3. [CAMBIOS-POSTMAN-v2.1.0.md](./CAMBIOS-POSTMAN-v2.1.0.md) - Sección "Proxy"
4. Colección: `WebFestival-API-Media.postman_collection.json`

**Endpoints:**
- GET /api/v1/concursos/activos - URLs incluidas automáticamente
- GET /api/v1/concursos/:id - URLs incluidas automáticamente
- GET /api/v1/proxy/media/:assetId (sin autenticación)
- GET /api/v1/proxy/media/:assetId?size=400x225 (thumbnail)
- GET /api/v1/proxy/media/:assetId?size=1280x720 (preview)

---

## 🔍 Búsqueda Rápida

### Por Versión

**v2.1.0 (URLs Dinámicas):**
- [CAMBIOS-POSTMAN-v2.1.0.md](./CAMBIOS-POSTMAN-v2.1.0.md)
- [RESUMEN-ACTUALIZACION-POSTMAN.md](./RESUMEN-ACTUALIZACION-POSTMAN.md)
- [ESTADO-ENDPOINTS-v2.1.0.md](./ESTADO-ENDPOINTS-v2.1.0.md)
- [RESUMEN-VERIFICACION-FINAL.md](./RESUMEN-VERIFICACION-FINAL.md)

**v2.0.0 (Subida Segura):**
- [ACTUALIZACION-COLECCION-UPLOAD.md](./ACTUALIZACION-COLECCION-UPLOAD.md)
- [FIX-FLUJO-COMPLETO-IMMICH.md](./FIX-FLUJO-COMPLETO-IMMICH.md)
- [RESUMEN-ACTUALIZACIONES.md](./RESUMEN-ACTUALIZACIONES.md)

### Por Tema

**Endpoints:**
- [README-ENDPOINTS.md](./README-ENDPOINTS.md) - Índice completo
- [ESTADO-ENDPOINTS-v2.1.0.md](./ESTADO-ENDPOINTS-v2.1.0.md) - Estado actual

**Colecciones:**
- [README.md](./README.md) - Guía de colecciones
- [RESUMEN-VERIFICACION-FINAL.md](./RESUMEN-VERIFICACION-FINAL.md) - Verificación

**Cambios:**
- [CAMBIOS-POSTMAN-v2.1.0.md](./CAMBIOS-POSTMAN-v2.1.0.md) - Detallado
- [RESUMEN-ACTUALIZACION-POSTMAN.md](./RESUMEN-ACTUALIZACION-POSTMAN.md) - Resumen

**Troubleshooting:**
- [ACTUALIZACION-COLECCION-UPLOAD.md](./ACTUALIZACION-COLECCION-UPLOAD.md) - Upload
- [FIX-FLUJO-COMPLETO-IMMICH.md](./FIX-FLUJO-COMPLETO-IMMICH.md) - Flujo completo

---

## 📖 Documentación del Sistema

### En la carpeta `document/`

**Guías de Producción:**
- `GUIA-DESPLIEGUE-PRODUCCION-FINAL.md` - Guía completa de despliegue
- `APLICAR-MIGRACION-PRODUCCION.md` - Aplicar migraciones
- `ACTUALIZAR-CODIGO-PRODUCCION.md` - Actualizar código
- `RESOLVER-CONFLICTOS-GIT-SERVIDOR.md` - Resolver conflictos

**Cambios del Sistema:**
- `RESUMEN-FINAL-CAMBIOS.md` - Resumen completo de cambios
- `RESUMEN-CAMBIOS-COMPLETOS.md` - Cambios detallados
- `MIGRACION-URLS-DINAMICAS.md` - Migración de URLs
- `CAMBIOS-IMAGENES-CONCURSOS-IMMICH.md` - Imágenes de concursos

**Formatos y Organización:**
- `FORMATO-ALBUMES-IMMICH.md` - Formato de álbumes
- `ALBUM-ORGANIZATION-IMPLEMENTATION.md` - Implementación de álbumes
- `REESTRUCTURACION-IMAGENES-CONCURSOS.md` - Reestructuración

**Manual de Usuario:**
- `MANUAL-DE-USUARIO-API.md` - Manual completo de la API
- `MANUAL-ACTUALIZACION-v2.0.0.md` - Actualización v2.0.0

---

## 🎯 Flujos de Trabajo Recomendados

### 1. Primer Uso

1. Leer [README.md](./README.md)
2. Importar colecciones en Postman
3. Configurar environment (Local o Production)
4. Probar autenticación
5. Explorar [README-ENDPOINTS.md](./README-ENDPOINTS.md)

### 2. Desarrollo de Nueva Funcionalidad

1. Consultar [README-ENDPOINTS.md](./README-ENDPOINTS.md)
2. Revisar colección correspondiente
3. Probar endpoints en Postman
4. Verificar tests automáticos
5. Documentar cambios

### 3. Actualización de Versión

1. Leer [CAMBIOS-POSTMAN-v2.1.0.md](./CAMBIOS-POSTMAN-v2.1.0.md)
2. Revisar [RESUMEN-ACTUALIZACION-POSTMAN.md](./RESUMEN-ACTUALIZACION-POSTMAN.md)
3. Importar colecciones actualizadas
4. Probar flujos completos
5. Verificar con [RESUMEN-VERIFICACION-FINAL.md](./RESUMEN-VERIFICACION-FINAL.md)

### 4. Troubleshooting

1. Revisar [ACTUALIZACION-COLECCION-UPLOAD.md](./ACTUALIZACION-COLECCION-UPLOAD.md)
2. Consultar [FIX-FLUJO-COMPLETO-IMMICH.md](./FIX-FLUJO-COMPLETO-IMMICH.md)
3. Verificar [ESTADO-ENDPOINTS-v2.1.0.md](./ESTADO-ENDPOINTS-v2.1.0.md)
4. Revisar logs del servidor
5. Consultar documentación del sistema

---

## 📊 Estadísticas de Documentación

### Documentos Postman

| Tipo | Cantidad |
|------|----------|
| Guías principales | 2 |
| Estado y verificación | 2 |
| Historial de cambios | 2 |
| Colecciones | 19 |
| Environments | 2 |
| **Total** | **25** |

### Documentos del Sistema

| Tipo | Cantidad |
|------|----------|
| Guías de producción | 4 |
| Cambios del sistema | 4 |
| Formatos y organización | 3 |
| Manuales | 2 |
| **Total** | **13** |

---

## 🔗 Enlaces Rápidos

### Documentación Postman
- [Guía Principal](./README.md)
- [Índice de Endpoints](./README-ENDPOINTS.md)
- [Estado Actual](./ESTADO-ENDPOINTS-v2.1.0.md)
- [Verificación Final](./RESUMEN-VERIFICACION-FINAL.md)

### Cambios Recientes
- [Cambios v2.1.0](./CAMBIOS-POSTMAN-v2.1.0.md)
- [Resumen de Actualización](./RESUMEN-ACTUALIZACION-POSTMAN.md)

### Troubleshooting
- [Upload Issues](./ACTUALIZACION-COLECCION-UPLOAD.md)
- [Flujo Completo](./FIX-FLUJO-COMPLETO-IMMICH.md)

### Sistema
- [Guía de Despliegue](../document/GUIA-DESPLIEGUE-PRODUCCION-FINAL.md)
- [Resumen de Cambios](../document/RESUMEN-FINAL-CAMBIOS.md)
- [Manual de Usuario](../document/MANUAL-DE-USUARIO-API.md)

---

## 📞 Soporte

### ¿Dónde buscar?

**Para endpoints:**
→ [README-ENDPOINTS.md](./README-ENDPOINTS.md)

**Para colecciones:**
→ [README.md](./README.md)

**Para cambios recientes:**
→ [CAMBIOS-POSTMAN-v2.1.0.md](./CAMBIOS-POSTMAN-v2.1.0.md)

**Para estado actual:**
→ [ESTADO-ENDPOINTS-v2.1.0.md](./ESTADO-ENDPOINTS-v2.1.0.md)

**Para problemas:**
→ [ACTUALIZACION-COLECCION-UPLOAD.md](./ACTUALIZACION-COLECCION-UPLOAD.md)

**Para despliegue:**
→ [../document/GUIA-DESPLIEGUE-PRODUCCION-FINAL.md](../document/GUIA-DESPLIEGUE-PRODUCCION-FINAL.md)

---

**Última actualización:** 10 de Diciembre, 2025  
**Versión:** 2.1.1  
**Mantenido por:** Equipo WebFestival
