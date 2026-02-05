# Actualización Postman: Endpoint "Mis Medios"

## ✅ Estado: COMPLETADO

Se ha agregado exitosamente el endpoint **"Mis Medios en Concurso"** a la colección de Postman de Concursos.

## 📍 Ubicación en Postman

**Colección**: `WebFestival-API-Concursos.postman_collection.json`
**Sección**: `Inscripciones` (después de "Verificar Inscripción")
**Nombre**: `Mis Medios en Concurso`

## 🎯 Endpoint Agregado

```
GET /api/v1/concursos/{concursoId}/mis-medios
```

### Parámetros
- **Path**: `concursoId` (requerido) - ID del concurso
- **Query**: 
  - `page` (opcional) - Número de página (default: 1)
  - `limit` (opcional) - Elementos por página (default: 10, máx: 100)
- **Headers**: `Authorization: Bearer {accessToken}` (requerido)

## 🧪 Funcionalidades de Testing

### Scripts de Test Automáticos
El endpoint incluye scripts de test que:

✅ **Verifican respuesta exitosa** (200)
✅ **Muestran información del concurso** (título, estado)
✅ **Muestran estadísticas completas**:
   - Total enviados
   - Límite de envíos  
   - Restantes
   - En evaluación
   - Evaluados

✅ **Listan medios encontrados** con:
   - Título y tipo de medio
   - Estado de evaluación
   - Categoría (si existe)
   - URL de imagen (si existe)

✅ **Muestran información de paginación**
✅ **Manejan errores** (403: No inscrito, 404: No encontrado)

### Ejemplo de Output en Consola
```
✅ Medios del usuario obtenidos exitosamente
🏆 Concurso: Concurso de Fotografía 2026
📊 Estadísticas:
   📸 Total enviados: 1
   📝 Límite de envíos: 3
   ⏳ Restantes: 2
   🔍 En evaluación: 1
   ✅ Evaluados: 0
📋 Medios encontrados: 1
   1. Mi Fotografía de Paisaje (fotografia)
      Estado: PENDIENTE
      Categoría: Paisajes
      URL: https://api.webfestival.art/api/v1/proxy/media/abc-123
📄 Paginación:
   Página: 1
   Total páginas: 1
   Total elementos: 1
```

## 📋 Documentación Incluida

### Descripción Completa
- ✅ Requisitos de autenticación
- ✅ Características principales
- ✅ Parámetros de consulta
- ✅ Ejemplo de respuesta completa
- ✅ Estados de evaluación explicados
- ✅ URLs de imagen detalladas
- ✅ Casos de error documentados
- ✅ Casos de uso prácticos

### Información Técnica
- ✅ Estructura de respuesta JSON
- ✅ Códigos de estado HTTP
- ✅ Manejo de errores
- ✅ Paginación
- ✅ Autenticación JWT

## 🔧 Variables de Entorno Utilizadas

- `{{baseUrl}}` - URL base de la API
- `{{accessToken}}` - Token JWT de autenticación  
- `{{concursoId}}` - ID del concurso (se establece automáticamente desde otros endpoints)

## 📝 Ejemplo de Respuesta Documentada

```json
{
  "success": true,
  "message": "Medios del usuario obtenidos exitosamente",
  "data": {
    "concurso": {
      "id": 5,
      "titulo": "Concurso de Fotografía 2026",
      "status": "ACTIVO",
      "max_envios": 3,
      "fecha_final": "2026-03-31T23:59:59.000Z"
    },
    "medios": [
      {
        "id": 12,
        "titulo": "Mi Fotografía de Paisaje",
        "tipo_medio": "fotografia",
        "fecha_subida": "2026-01-10T15:30:00.000Z",
        "estado_evaluacion": "PENDIENTE",
        "puntaje_promedio": null,
        "posicion": null,
        "imagen_url": "https://api.webfestival.art/api/v1/proxy/media/abc-123",
        "imagen_thumbnail": "https://api.webfestival.art/api/v1/proxy/media/abc-123?size=400x225",
        "imagen_preview": "https://api.webfestival.art/api/v1/proxy/media/abc-123?size=1280x720",
        "categoria": {
          "id": 1,
          "nombre": "Paisajes"
        }
      }
    ],
    "estadisticas": {
      "total_enviados": 1,
      "limite_envios": 3,
      "restantes": 2,
      "en_evaluacion": 1,
      "evaluados": 0
    },
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

## 🎯 Casos de Uso Documentados

1. **Dashboard del participante**
2. **Página "Mis Envíos"**
3. **Seguimiento de medios por concurso**
4. **Verificar límites de envío**
5. **Monitorear estado de evaluación**
6. **Gestión de portfolio personal**

## 🚨 Casos de Error Documentados

- `400`: Parámetros de paginación inválidos
- `401`: Token de autenticación inválido o expirado
- `403`: No estás inscrito en este concurso
- `404`: Concurso no encontrado
- `500`: Error interno del servidor

## 🎉 Resultado

El endpoint **"Mis Medios en Concurso"** está ahora completamente integrado en la colección de Postman de Concursos, con:

1. ✅ **Documentación completa** y detallada
2. ✅ **Scripts de test automáticos** con logging informativo
3. ✅ **Manejo de errores** apropiado
4. ✅ **Ejemplos de respuesta** realistas
5. ✅ **Casos de uso** claramente definidos

**La colección está lista para usar y probar el nuevo endpoint.**

## 🔄 Próximos Pasos

Para usar el endpoint en Postman:

1. **Importar/Actualizar** la colección `WebFestival-API-Concursos.postman_collection.json`
2. **Configurar variables** de entorno (`baseUrl`, `accessToken`)
3. **Ejecutar "Login"** para obtener el token
4. **Ejecutar "Concursos Activos"** para obtener un `concursoId`
5. **Ejecutar "Inscribirse"** si no estás inscrito
6. **Ejecutar "Mis Medios en Concurso"** para probar el nuevo endpoint

**¡El endpoint está listo para ser probado!**