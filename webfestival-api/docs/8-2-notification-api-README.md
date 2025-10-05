# API de Notificaciones - Guía de Endpoints

## Descripción

Esta documentación describe todos los endpoints disponibles en la API de notificaciones de WebFestival, incluyendo ejemplos de uso, parámetros requeridos y respuestas esperadas.

## Base URL

```
/api/v1/notifications
```

## Autenticación

Todos los endpoints requieren autenticación mediante JWT token en el header:

```http
Authorization: Bearer <jwt_token>
```

## Endpoints para Usuarios

### 1. Obtener Notificaciones del Usuario

**GET** `/api/v1/notifications`

Obtiene las notificaciones del usuario autenticado con paginación.

#### Parámetros de Query (Opcionales)

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `page` | number | 1 | Número de página |
| `limit` | number | 20 | Límite de resultados por página (máx: 100) |

#### Ejemplo de Solicitud

```http
GET /api/v1/notifications?page=1&limit=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Respuesta Exitosa (200)

```json
{
  "success": true,
  "data": {
    "notificaciones": [
      {
        "id": 1,
        "usuario_id": "user123",
        "tipo": "deadline_reminder",
        "titulo": "⏰ Recordatorio: Concurso de Fotografía",
        "mensaje": "La fecha límite para participar en \"Concurso de Fotografía\" es en 48 horas. ¡No pierdas la oportunidad!",
        "leida": false,
        "fecha_creacion": "2024-12-01T10:00:00.000Z"
      },
      {
        "id": 2,
        "usuario_id": "user123",
        "tipo": "evaluation_complete",
        "titulo": "✅ Evaluación completada - Concurso de Video",
        "mensaje": "Tu medio \"Mi Video Creativo\" ha sido evaluado por el jurado en el concurso \"Concurso de Video\".",
        "leida": true,
        "fecha_creacion": "2024-11-30T15:30:00.000Z"
      }
    ],
    "total": 25,
    "page": 1,
    "totalPages": 3
  }
}
```

### 2. Marcar Notificación como Leída

**PUT** `/api/v1/notifications/:id/read`

Marca una notificación específica como leída.

#### Ejemplo de Solicitud

```http
PUT /api/v1/notifications/1/read
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Respuesta Exitosa (200)

```json
{
  "success": true,
  "message": "Notificación marcada como leída"
}
```

### 3. Marcar Todas las Notificaciones como Leídas

**PUT** `/api/v1/notifications/read-all`

Marca todas las notificaciones del usuario como leídas.

#### Respuesta Exitosa (200)

```json
{
  "success": true,
  "message": "Todas las notificaciones marcadas como leídas"
}
```

## Endpoints Administrativos (Solo ADMIN)

### 4. Enviar Recordatorio de Fecha Límite

**POST** `/api/v1/notifications/deadline-reminder`

Envía recordatorios de fecha límite manualmente para un concurso específico.

#### Cuerpo de la Solicitud

```json
{
  "concursoId": 123,
  "horasAntes": 48
}
```

#### Respuesta Exitosa (200)

```json
{
  "success": true,
  "message": "Recordatorios de fecha límite enviados exitosamente"
}
```

### 5. Enviar Notificación de Evaluación Completada

**POST** `/api/v1/notifications/evaluation-complete`

#### Cuerpo de la Solicitud

```json
{
  "medioId": 456,
  "juradoId": "jurado123"
}
```

### 6. Enviar Notificación de Resultados Publicados

**POST** `/api/v1/notifications/results-published`

#### Cuerpo de la Solicitud

```json
{
  "concursoId": 123
}
```

### 7. Enviar Notificación de Nuevo Concurso

**POST** `/api/v1/notifications/new-contest`

#### Cuerpo de la Solicitud

```json
{
  "concursoId": 789
}
```

## Endpoints de Gestión del Sistema (Solo ADMIN)

### 8. Iniciar Trabajos Programados

**POST** `/api/v1/notifications/start-scheduled-jobs`

Inicia los trabajos programados de notificaciones automáticas.

### 9. Detener Trabajos Programados

**POST** `/api/v1/notifications/stop-scheduled-jobs`

Detiene los trabajos programados de notificaciones automáticas.

### 10. Limpiar Notificaciones Antiguas

**POST** `/api/v1/notifications/cleanup`

Elimina notificaciones antiguas (más de 30 días y leídas).

## Tipos de Notificaciones

### Tipos Disponibles

| Tipo | Descripción | Cuándo se Envía |
|------|-------------|-----------------|
| `deadline_reminder` | Recordatorio de fecha límite | 48 horas antes del cierre del concurso |
| `evaluation_complete` | Evaluación completada | Cuando un jurado completa la evaluación de un medio |
| `results_published` | Resultados publicados | Cuando un concurso cambia a estado FINALIZADO |
| `new_contest` | Nuevo concurso disponible | Cuando un concurso cambia a estado ACTIVO |

## Códigos de Error Comunes

| Código | Descripción | Solución |
|--------|-------------|----------|
| 400 | Bad Request | Verificar parámetros de entrada |
| 401 | Unauthorized | Verificar token de autenticación |
| 403 | Forbidden | Verificar permisos de usuario (ADMIN requerido) |
| 404 | Not Found | Verificar que el recurso existe |
| 500 | Internal Server Error | Error del servidor, revisar logs |

## Ejemplos de Uso con JavaScript

### Obtener Notificaciones

```javascript
const response = await fetch('/api/v1/notifications?page=1&limit=10', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log('Notificaciones:', data.data.notificaciones);
```

### Marcar Notificación como Leída

```javascript
const markAsRead = async (notificationId) => {
  const response = await fetch(`/api/v1/notifications/${notificationId}/read`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  return response.json();
};
```

### Enviar Recordatorio Manual (Admin)

```javascript
const sendDeadlineReminder = async (concursoId) => {
  const response = await fetch('/api/v1/notifications/deadline-reminder', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      concursoId: concursoId,
      horasAntes: 48
    })
  });
  
  return response.json();
};
```

---

**Documentación actualizada**: Diciembre 2024  
**Versión de la API**: 1.0.0  
**Endpoints totales**: 10