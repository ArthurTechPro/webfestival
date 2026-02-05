# 📋 Nuevo Endpoint: Mis Medios en Concurso

## ✅ Implementación Completada

Se ha implementado exitosamente el endpoint `GET /api/v1/concursos/{concursoId}/mis-medios` que permite a los participantes consultar sus propios medios en un concurso específico.

## 🔗 Endpoint

```
GET /api/v1/concursos/{concursoId}/mis-medios
```

## 🔐 Autenticación

- **Requerida**: Sí
- **Header**: `Authorization: Bearer {token}`
- **Rol**: PARTICIPANTE

## 📝 Parámetros

### Path Parameters
- `concursoId` (integer, required): ID del concurso

### Query Parameters
- `page` (integer, optional, default: 1): Número de página
- `limit` (integer, optional, default: 10): Elementos por página (máx: 100)

## 📊 Respuesta Exitosa (200)

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
        "titulo": "Mi Fotografía",
        "tipo_medio": "fotografia",
        "fecha_subida": "2026-01-10T15:30:00.000Z",
        "estado_evaluacion": "PENDIENTE",
        "puntaje_promedio": null,
        "posicion": null,
        "imagen_url": "https://api.webfestival.art/api/v1/proxy/media/abc-123",
        "imagen_thumbnail": "https://api.webfestival.art/api/v1/proxy/media/abc-123?size=400x225",
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

## ❌ Errores Posibles

### 400 - Bad Request
```json
{
  "success": false,
  "message": "ID de concurso inválido"
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "error": "Token de acceso requerido"
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "message": "No estás inscrito en este concurso"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Concurso no encontrado"
}
```

## 🧪 Pruebas Realizadas

✅ **Casos de éxito:**
- Usuario inscrito sin medios: Retorna array vacío con estadísticas correctas
- Usuario inscrito con medios: Retorna medios con URLs de imagen
- Paginación: Funciona correctamente

✅ **Validaciones:**
- Concurso inexistente (404)
- Usuario no inscrito (403)
- ID inválido (400)
- Sin autenticación (401)

## 🎯 Casos de Uso

1. **Dashboard del participante**: Mostrar medios enviados por concurso
2. **Verificar límites**: Saber cuántos medios más puede enviar
3. **Seguimiento**: Ver estado de evaluación de sus medios
4. **Gestión**: Revisar y administrar sus envíos

## 📋 Para Agregar a Postman

**Nombre**: `Mis Medios en Concurso`
**Método**: `GET`
**URL**: `{{baseUrl}}/concursos/{{concursoId}}/mis-medios?page=1&limit=10`
**Headers**: 
- `Authorization: Bearer {{accessToken}}`

**Script de Test**:
```javascript
if (pm.response.code === 200) {
    const res = pm.response.json();
    console.log('✅ Medios del usuario obtenidos exitosamente');
    console.log('📊 Estadísticas:');
    console.log('   - Total enviados:', res.data.estadisticas.total_enviados);
    console.log('   - Límite:', res.data.estadisticas.limite_envios);
    console.log('   - Restantes:', res.data.estadisticas.restantes);
    
    if (res.data.medios && res.data.medios.length > 0) {
        console.log('📸 Medios encontrados:');
        res.data.medios.forEach((medio, index) => {
            console.log(`   ${index + 1}. ${medio.titulo} (${medio.tipo_medio})`);
            console.log(`      - Fecha: ${new Date(medio.fecha_subida).toLocaleDateString()}`);
            console.log(`      - Categoría: ${medio.categoria?.nombre || 'Sin categoría'}`);
        });
    } else {
        console.log('📭 No hay medios enviados aún');
    }
} else if (pm.response.code === 403) {
    console.log('❌ No estás inscrito en este concurso');
} else if (pm.response.code === 404) {
    console.log('❌ Concurso no encontrado');
}
```

## 🚀 Estado: LISTO PARA USO

El endpoint está completamente implementado, probado y documentado. Puede ser utilizado inmediatamente por el frontend para mostrar los medios del usuario en cada concurso.