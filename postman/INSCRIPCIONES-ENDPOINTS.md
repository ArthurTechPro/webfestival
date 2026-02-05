# 📝 Endpoints de Inscripciones - WebFestival API

## 🎯 Propósito
Sistema completo de gestión de inscripciones a concursos multimedia.

## 📋 Endpoints Disponibles

### 1. **Inscribirse a Concurso**
```http
POST {{baseUrl}}/api/v1/concursos/inscripcion
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "concurso_id": 6
}
```

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Inscripción realizada exitosamente",
  "data": {
    "id": 15,
    "usuario_id": "user123",
    "concurso_id": 6,
    "fecha_inscripcion": "2025-12-21T13:45:30.123Z"
  }
}
```

### 2. **Mis Inscripciones**
```http
GET {{baseUrl}}/api/v1/concursos/mis-inscripciones
Authorization: Bearer {{accessToken}}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 3,
      "usuario_id": "user123",
      "concurso_id": 6,
      "fecha_inscripcion": "2025-12-01T04:15:55.082Z",
      "concurso": {
        "id": 6,
        "titulo": "Concurso de Fotografía Infantil 2026",
        "status": "ACTIVO",
        "max_envios": 3,
        "categorias": [...],
        "_count": { "medios": 2 }
      }
    }
  ]
}
```

### 3. **Verificar Inscripción**
```http
GET {{baseUrl}}/api/v1/concursos/{{concursoId}}/verificar-inscripcion
Authorization: Bearer {{accessToken}}
```

### 4. **Cancelar Inscripción**
```http
DELETE {{baseUrl}}/api/v1/concursos/inscripcion/{{concursoId}}
Authorization: Bearer {{accessToken}}
```

## 🚀 Cómo Usar las Colecciones

1. **Importar en Postman:**
   - `WebFestival-API-Concursos.postman_collection.json` (actualizada)
   - `WebFestival-API-Inscripciones.postman_collection.json` (nueva)

2. **Configurar Environment:**
   - `baseUrl`: http://localhost:3000/api/v1
   - `accessToken`: Tu token JWT

3. **Flujo de Prueba:**
   - Ejecutar "Concursos Activos" para obtener `concursoId`
   - Ejecutar "Inscribirse a Concurso"
   - Ejecutar "Mis Inscripciones" para ver el resultado
   - Ejecutar "Verificar Inscripción" para confirmar