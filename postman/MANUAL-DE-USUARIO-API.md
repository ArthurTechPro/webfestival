# 📖 MANUAL DE USUARIO - WebFestival API

## Guía Completa del Sistema de Concursos Multimedia

---

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Configuración Inicial](#configuración-inicial)
3. [Roles y Permisos](#roles-y-permisos)
4. [Flujo Completo del Sistema](#flujo-completo-del-sistema)
5. [Módulo de Autenticación](#módulo-de-autenticación)
6. [Módulo de Usuarios](#módulo-de-usuarios)
7. [Módulo de Concursos](#módulo-de-concursos)
8. [Módulo de Criterios de Evaluación](#módulo-de-criterios-de-evaluación)
9. [Módulo de Subida de Medios](#módulo-de-subida-de-medios)
10. [Módulo de Asignación de Jurados](#módulo-de-asignación-de-jurados)
11. [Módulo de Calificaciones](#módulo-de-calificaciones)
12. [Consulta de Resultados](#consulta-de-resultados)
13. [Casos de Uso Completos](#casos-de-uso-completos)
14. [Solución de Problemas](#solución-de-problemas)
15. [Glosario](#glosario)

---

## 1. Introducción

### ¿Qué es WebFestival API?

WebFestival es una plataforma integral para la gestión de concursos multimedia que permite:

- **Participantes**: Subir y competir con fotografías, videos, audios y cortometrajes
- **Jurados**: Evaluar medios de forma profesional con criterios configurables
- **Administradores**: Gestionar concursos, usuarios, criterios y resultados

### Características Principales

✅ **Gestión de Concursos**: Creación y administración completa de concursos multimedia  
✅ **Subida Segura**: Integración con Immich para almacenamiento optimizado  
✅ **Evaluación Dinámica**: Sistema de criterios configurables por tipo de medio  
✅ **Asignación Inteligente**: Algoritmo automático de asignación de jurados  
✅ **Resultados Transparentes**: Rankings y estadísticas detalladas  

### Tipos de Medios Soportados

| Tipo | Formatos | Tamaño Máximo | Uso |
|------|----------|---------------|-----|
| **Fotografía** | JPEG, PNG, WebP | 10 MB | Concursos de fotografía |
| **Video** | MP4, WebM, MOV | 100 MB | Videografía y documentales |
| **Audio** | MP3, WAV, FLAC | 50 MB | Música y arte sonoro |
| **Cortometraje** | MP4, MOV, AVI | 500 MB | Cine y narrativa audiovisual |

---

## 2. Configuración Inicial

### 2.1 Requisitos Previos


- **Postman**: Versión 10.0 o superior
- **Colecciones**: Importar todas las colecciones de la carpeta `/postman`
- **Environment**: Configurar variables de entorno (Local o Production)

### 2.2 Importar Colecciones en Postman

**Paso 1**: Abrir Postman

**Paso 2**: Click en "Import" (esquina superior izquierda)

**Paso 3**: Arrastrar todos los archivos `.json` de la carpeta `/postman`:
- WebFestival-API-Auth.postman_collection.json
- WebFestival-API-Usuarios.postman_collection.json
- WebFestival-API-Concursos.postman_collection.json
- WebFestival-API-Criterios.postman_collection.json
- WebFestival-API-Media.postman_collection.json
- WebFestival-API-Jurado-Asignacion.postman_collection.json
- WebFestival-API-Calificaciones.postman_collection.json
- WebFestival-API-Flujo-Completo-Subida.postman_collection.json

**Paso 4**: Importar los environments:
- Local.postman_environment.json
- Production.postman_environment.json

### 2.3 Configurar Variables de Entorno

**Environment: Local**
```
baseUrl: http://localhost:3001/api/v1
immichUrl: http://localhost:2283
```

**Environment: Production**
```
baseUrl: https://api.webfestival.art/api/v1
immichUrl: https://medios.webfestival.art
```

**Variables Automáticas** (se configuran automáticamente durante el flujo):
- `accessToken`: Token JWT de autenticación
- `refreshToken`: Token para renovar sesión
- `userId`: ID del usuario autenticado
- `concursoId`: ID del concurso seleccionado
- `categoriaId`: ID de la categoría
- `medioId`: ID del medio subido
- `criterioId`: ID del criterio
- `calificacionId`: ID de la calificación
- `uploadId`: ID de subida temporal
- `immichAssetId`: ID del asset en Immich

---

## 3. Roles y Permisos

### 3.1 Tipos de Roles


#### 🎨 PARTICIPANTE (Usuario Regular)

**Permisos:**
- ✅ Ver concursos activos y finalizados
- ✅ Inscribirse a concursos
- ✅ Subir medios (fotos, videos, audios, cortometrajes)
- ✅ Editar su perfil
- ✅ Seguir a otros usuarios
- ✅ Ver resultados públicos
- ❌ No puede evaluar medios
- ❌ No puede crear concursos

**Uso típico**: Fotógrafos, videomakers, músicos, cineastas que participan en concursos

#### ⚖️ JURADO (Evaluador)

**Permisos:**
- ✅ Todos los permisos de PARTICIPANTE
- ✅ Ver medios asignados para evaluación
- ✅ Calificar medios según criterios
- ✅ Dejar comentarios profesionales
- ✅ Ver progreso de evaluación
- ✅ Configurar especialización
- ❌ No puede ver calificaciones de otros jurados
- ❌ No puede crear concursos

**Uso típico**: Profesionales que evalúan trabajos en su área de especialización

#### 👑 ADMIN (Administrador)

**Permisos:**
- ✅ Acceso completo al sistema
- ✅ Crear, editar y eliminar concursos
- ✅ Gestionar usuarios y roles
- ✅ Crear y configurar criterios de evaluación
- ✅ Asignar jurados a categorías
- ✅ Ver todas las calificaciones
- ✅ Generar reportes y estadísticas
- ✅ Publicar resultados finales

**Uso típico**: Organizadores de concursos, gestores de la plataforma

#### 📝 CONTENT_ADMIN (Administrador de Contenido)

**Permisos:**
- ✅ Gestionar contenido del CMS
- ✅ Crear y editar posts del blog
- ✅ Gestionar newsletter
- ✅ Moderar comentarios
- ❌ No puede gestionar concursos
- ❌ No puede asignar jurados

**Uso típico**: Editores de contenido, community managers

### 3.2 Matriz de Permisos

| Acción | PARTICIPANTE | JURADO | ADMIN | CONTENT_ADMIN |
|--------|--------------|--------|-------|---------------|
| Ver concursos | ✅ | ✅ | ✅ | ✅ |
| Inscribirse | ✅ | ✅ | ✅ | ✅ |
| Subir medios | ✅ | ✅ | ✅ | ✅ |
| Calificar medios | ❌ | ✅ | ✅ | ❌ |
| Crear concursos | ❌ | ❌ | ✅ | ❌ |
| Asignar jurados | ❌ | ❌ | ✅ | ❌ |
| Crear criterios | ❌ | ❌ | ✅ | ❌ |
| Ver estadísticas | ❌ | Parcial | ✅ | ❌ |
| Gestionar CMS | ❌ | ❌ | ✅ | ✅ |

---


## 4. Flujo Completo del Sistema

### 4.1 Diagrama de Flujo General

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO COMPLETO WEBFESTIVAL                   │
└─────────────────────────────────────────────────────────────────┘

1. ADMINISTRADOR                    2. PARTICIPANTE                3. JURADO
   │                                   │                              │
   ├─► Crear Concurso                 ├─► Registrarse               ├─► Configurar
   │   └─► Definir fechas             │   └─► Login                 │   Especialización
   │                                   │                              │
   ├─► Crear Criterios                ├─► Ver Concursos             │
   │   ├─► Por Fotografía             │   Activos                    │
   │   ├─► Por Video                  │                              │
   │   ├─► Por Audio                  ├─► Inscribirse               │
   │   └─► Por Cine                   │   al Concurso                │
   │                                   │                              │
   ├─► Asignar Jurados                ├─► Subir Medio               │
   │   ├─► Manual                     │   ├─► Generar URL            │
   │   └─► Automático                 │   ├─► Subir a Immich        │
   │                                   │   └─► Confirmar              │
   │                                   │                              │
   │                                   ├─► Ver Estado                ├─► Ver Asignaciones
   │                                   │                              │
   │                                   │                              ├─► Evaluar Medios
   │                                   │                              │   ├─► Por Criterios
   │                                   │                              │   └─► Comentarios
   │                                   │                              │
   ├─► Ver Progreso                   │                              ├─► Completar
   │   de Evaluación                  │                              │   Evaluaciones
   │                                   │                              │
   ├─► Calcular                       │                              │
   │   Resultados                     │                              │
   │                                   │                              │
   ├─► Publicar                       ├─► Ver Resultados            ├─► Ver Resultados
   │   Ganadores                      │   y Rankings                 │   Finales
   │                                   │                              │
   └─► Generar                        └─► Compartir                 └─► Feedback
       Reportes                           Logros                         Recibido
```

### 4.2 Fases del Concurso

#### Fase 1: Configuración (ADMIN)
- Crear concurso
- Definir categorías
- Configurar criterios de evaluación
- Establecer fechas y límites

#### Fase 2: Inscripción (PARTICIPANTE)
- Registro de usuarios
- Inscripción al concurso
- Subida de medios

#### Fase 3: Asignación (ADMIN)
- Asignar jurados a categorías
- Validar cobertura
- Notificar a jurados

#### Fase 4: Evaluación (JURADO)
- Revisar medios asignados
- Calificar según criterios
- Dejar comentarios constructivos

#### Fase 5: Resultados (ADMIN)
- Calcular promedios
- Generar rankings
- Publicar ganadores

---


## 5. Módulo de Autenticación

### 5.1 Registro de Usuario

**Endpoint**: `POST /auth/register`

**Descripción**: Crea una nueva cuenta de usuario con rol PARTICIPANTE por defecto.

**Request Body**:
```json
{
  "email": "arthur@webfestival.art",
  "password": "Password123!",
  "nombre": "Arturo Hernandez",
  "bio": "Fotógrafo profesional especializado en paisajes"
}
```

**Validaciones**:
- ✅ Email único (no registrado previamente)
- ✅ Password mínimo 6 caracteres
- ✅ Nombre requerido
- ✅ Biografia opcional

**Response (201 Created)**:
```json
{
"success": true,
    "data": {
        "user": {
            "id": "user_123",
            "email": "arthur@webfestival.art",
            "nombre": "Arturo Hernandez",
            "role": "PARTICIPANTE"
            },
        "tokens" :{
            "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        },
        "loginTime": "2025-11-14T02:24:49.393Z"
    },
    "message": "Login exitoso"
}
```

### 5.2 Iniciar Sesión

**Endpoint**: `POST /auth/login`

**Descripción**: Autentica un usuario existente y retorna tokens JWT. 

**Request Body**:
```json
{
  "email": "arthur@webfestival.art",
  "password": "Password123!"
}
```

**Response (200 OK)**:
```json
{
    "success": true,
    "data": {
        "user": {
            "id": "user_123",
            "email": "arthur@webfestival.art",
            "nombre": "Arturo Hernandez",
            "role": "PARTICIPANTE"
            },
        "tokens" :{
            "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        },
        "loginTime": "2025-11-14T02:24:49.393Z"
    },
    "message": "Login exitoso"
}
```

**Tokens JWT**:
- **accessToken**: Válido por 1 hora, usar en header `Authorization: Bearer {token}`
- **refreshToken**: Válido por 7 días, usar para renovar el accessToken

### 5.3 Renovar Token

**Endpoint**: `POST /auth/refresh`

**Descripción**: Obtiene un nuevo accessToken usando el refreshToken.

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Cuándo usar**: Cuando el accessToken expira (error 401 Unauthorized)

### 5.4 Validar Token

**Endpoint**: `GET /auth/validate`

**Headers**: `Authorization: Bearer {accessToken}`

**Descripción**: Verifica si el token actual es válido.

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "valid": true,
    "user": {
      "id": "user_123",
      "email": "arthur@webfestival.art",
      "role": "PARTICIPANTE"
    }
  }
}
```

### 5.5 Obtener Usuario Autenticado

**Endpoint**: `GET /auth/me`

**Headers**: `Authorization: Bearer {accessToken}`

**Descripción**: Retorna el perfil completo del usuario autenticado.

**Response (200 OK)**:
```json
{
    "success": true,
    "data": {
        "user": {
            "id": "user_123",
            "email": "arthur@webfestival.art",
            "nombre": "Arturo Hernandez",
            "role": "PARTICIPANTE"
            },
        "tokens" :{
            "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        },
        "loginTime": "2025-11-14T02:24:49.393Z"
    },
    "message": "Login exitoso"
}
```

### 5.6 Cambiar Contraseña

**Endpoint**: `PUT /auth/change-password`

**Headers**: `Authorization: Bearer {accessToken}`

**Request Body**:
```json
{
  "currentPassword": "Password123!",
  "newPassword": "NewPassword456!"
}
```

**Validaciones**:
- ✅ Contraseña actual correcta
- ✅ Nueva contraseña diferente a la actual
- ✅ Nueva contraseña mínimo 6 caracteres

### 5.7 Cerrar Sesión

**Endpoint**: `POST /auth/logout`

**Headers**: `Authorization: Bearer {accessToken}`

**Descripción**: Invalida la sesión actual del usuario.

---


## 6. Módulo de Usuarios

### 6.1 Ver Perfil Público

**Endpoint**: `GET /users/{userId}/profile`

**Descripción**: Obtiene el perfil público de cualquier usuario.

**Response**:
```json
{
    "success": true,
    "data": {
        "user": {
            "id": "cmhocp76h0001y0pftwj4iygy",
            "nombre": "Arturo Hermandez",
            "bio": "Fotógrafo aficionado interesado en concursos",
            "role": "PARTICIPANTE",
            "stats": {
                "concursos_participados": 0,
                "medios_subidos": 0,
                "seguidores": 0,
                "siguiendo": 0
            }
        }
    },
    "message": "Perfil de usuario obtenido exitosamente"
}
```

### 6.2 Actualizar Mi Perfil

**Endpoint**: `PUT /users/profile`

**Headers**: `Authorization: Bearer {accessToken}`

**Request Body**:
```json
{
  "nombre": "Juan Carlos Pérez",
  "bio": "Fotógrafo profesional especializado en paisajes y naturaleza",
}
```

**Campos editables**:
- `nombre`: Nombre completo
- `bio`: Biografía (máx 500 caracteres)

### 6.3 Buscar Usuarios

**Endpoint**: `GET /users/search`

**Query Parameters**:
- `search`: Término de búsqueda (nombre o email)
- `role`: Filtrar por rol (PARTICIPANTE, JURADO, ADMIN)
- `especializacion`: Filtrar por especialización (solo jurados)
- `page`: Número de página (default: 1)
- `limit`: Resultados por página (default: 20)

**Ejemplo**:
```
GET /users/search?search=juan&role=JURADO&page=1&limit=20
```

**Response**:
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_123",
        "nombre": "Carlos Hermandez",
        "role": "JURADO",
        "especializacion": ["fotografia", "video"],
        "picture_url": "..."
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

### 6.4 Sistema de Seguimientos

#### 6.4.1 Seguir Usuario

**Endpoint**: `POST /users/follow`

**Headers**: `Authorization: Bearer {accessToken}`

**Request Body**:
```json
{
  "seguido_id": "user_456"
}
```

**Validaciones**:
- ✅ No puedes seguirte a ti mismo
- ✅ No puedes seguir al mismo usuario dos veces

#### 6.4.2 Dejar de Seguir

**Endpoint**: `DELETE /users/follow/{userId}`

**Headers**: `Authorization: Bearer {accessToken}`

**Ejemplo**:
```
DELETE /users/follow/user_456
```

#### 6.4.3 Ver Mis Seguidos

**Endpoint**: `GET /users/following`

**Headers**: `Authorization: Bearer {accessToken}`

**Query Parameters**:
- `page`: Número de página
- `limit`: Resultados por página

#### 6.4.4 Ver Mis Seguidores

**Endpoint**: `GET /users/followers`

**Headers**: `Authorization: Bearer {accessToken}`

### 6.5 Especialización de Jurados

#### 6.5.1 Crear Especialización (Solo JURADO)

**Endpoint**: `POST /users/jurado/especializacion`

**Headers**: `Authorization: Bearer {accessToken}`

**Request Body**:
```json
{
  "especializaciones": ["fotografia", "video"],
  "experiencia_años": 5,
  "certificaciones": [
    "Certificado Adobe Photoshop",
    "Diplomado en Fotografía Profesional"
  ],
  "portfolio_url": "https://portfolio.juanperez.com"
}
```

**Especializaciones válidas**:
- `fotografia`: Fotografía
- `video`: Videografía
- `audio`: Música y audio
- `corto_cine`: Cortometrajes y cine

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "usuario_id": "user_123",
    "especializaciones": ["fotografia", "video"],
    "experiencia_años": 5,
    "certificaciones": ["..."],
    "portfolio_url": "https://portfolio.juanperez.com",
    "created_at": "2024-11-13T10:00:00Z"
  }
}
```

#### 6.5.2 Actualizar Especialización

**Endpoint**: `PUT /users/jurado/especializacion`

**Headers**: `Authorization: Bearer {accessToken}`

**Request Body**: (Campos a actualizar)
```json
{
  "experiencia_años": 7,
  "certificaciones": [
    "Certificado Adobe Photoshop",
    "Diplomado en Fotografía Profesional",
    "Master en Dirección de Fotografía"
  ]
}
```

#### 6.5.3 Listar Jurados Especializados (ADMIN)

**Endpoint**: `GET /users/jurados/{especializacion}`

**Headers**: `Authorization: Bearer {accessToken}`

**Ejemplo**:
```
GET /users/jurados/fotografia
```

**Response**: Lista de jurados especializados en fotografía

---


## 7. Módulo de Concursos

### 7.1 Ver Concursos Activos (Público)

**Endpoint**: `GET /concursos/activos`

**Descripción**: Retorna concursos disponibles para inscripción.

**Filtros automáticos**:
- Estado: Activo
- Dentro del período de inscripción
- Fecha de inicio no pasada

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "titulo": "Concurso de Fotografía de Naturaleza 2024",
      "descripcion": "Concurso anual de fotografía enfocado en naturaleza",
      "status": "Activo",
      "fecha_inicio": "2024-03-01T00:00:00Z",
      "fecha_final": "2024-03-31T23:59:59Z",
      "max_envios": 3,
      "tamaño_max_mb": 10,
      "poster_url": "https://medios.webfestival.art/api/asset/file/poster123",
      "categorias": [
        {
          "id": 1,
          "nombre": "Fotografía de Paisaje",
          "tipo_medio": "fotografia"
        },
        {
          "id": 2,
          "nombre": "Fotografía de Fauna",
          "tipo_medio": "fotografia"
        }
      ],
      "total_participantes": 150,
      "total_medios": 420
    }
  ]
}
```

### 7.2 Ver Concursos Finalizados (Público)

**Endpoint**: `GET /concursos/finalizados`

**Descripción**: Retorna concursos con resultados publicados.

**Uso**: Ver ganadores y resultados históricos

### 7.3 Ver Detalles de Concurso (Público)

**Endpoint**: `GET /concursos/{concursoId}`

**Descripción**: Información completa de un concurso específico.

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "titulo": "Concurso de Fotografía de Naturaleza 2024",
    "descripcion": "Descripción completa del concurso...",
    "reglas": "1. Solo fotografías originales\n2. Máximo 3 envíos por participante\n3. Formato JPEG o PNG...",
    "status": "Activo",
    "fecha_inicio": "2024-03-01T00:00:00Z",
    "fecha_final": "2024-03-31T23:59:59Z",
    "max_envios": 3,
    "tamaño_max_mb": 10,
    "poster_url": "https://medios.webfestival.art/api/asset/file/poster123",
    "categorias": [
      {
        "id": 1,
        "nombre": "Fotografía de Paisaje",
        "descripcion": "Captura la belleza de paisajes naturales",
        "tipo_medio": "fotografia",
        "max_participantes": 100
      }
    ],
    "estadisticas": {
      "total_participantes": 150,
      "total_medios": 420,
      "medios_por_categoria": {
        "Fotografía de Paisaje": 250,
        "Fotografía de Fauna": 170
      }
    },
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

### 7.4 Inscribirse a Concurso (PARTICIPANTE)

**Endpoint**: `POST /concursos/inscripcion`

**Headers**: `Authorization: Bearer {accessToken}`

**Request Body**:
```json
{
  "concursoId": 1
}
```

**Validaciones**:
- ✅ Concurso debe estar activo
- ✅ Dentro del período de inscripción
- ✅ No inscrito previamente
- ✅ Usuario autenticado

**Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "usuario_id": "user_123",
    "concurso_id": 1,
    "fecha_inscripcion": "2024-11-13T10:00:00Z",
    "concurso": {
      "titulo": "Concurso de Fotografía de Naturaleza 2024",
      "max_envios": 3
    }
  },
  "message": "Inscripción exitosa al concurso"
}
```

**⚠️ IMPORTANTE**: La inscripción es **requisito obligatorio** para subir medios.

### 7.5 Cancelar Inscripción

**Endpoint**: `DELETE /concursos/inscripcion/{concursoId}`

**Headers**: `Authorization: Bearer {accessToken}`

**Validaciones**:
- ✅ Debe estar inscrito
- ✅ No haber subido medios (o eliminarlos primero)

### 7.6 Ver Mis Inscripciones

**Endpoint**: `GET /concursos/mis-inscripciones`

**Headers**: `Authorization: Bearer {accessToken}`

**Response**: Lista de concursos donde estás inscrito

### 7.7 Verificar Inscripción

**Endpoint**: `GET /concursos/{concursoId}/verificar-inscripcion`

**Headers**: `Authorization: Bearer {accessToken}`

**Response**:
```json
{
  "success": true,
  "data": {
    "inscrito": true,
    "fecha_inscripcion": "2024-11-13T10:00:00Z",
    "medios_subidos": 2,
    "max_envios": 3,
    "puede_subir_mas": true
  }
}
```

### 7.8 Gestión de Concursos (ADMIN)

#### 7.8.1 Listar Todos los Concursos

**Endpoint**: `GET /concursos`

**Headers**: `Authorization: Bearer {accessToken}`

**Query Parameters**:
- `page`: Número de página
- `limit`: Resultados por página
- `status`: Filtrar por estado (Próximo, Activo, Evaluación, Finalizado)

#### 7.8.2 Crear Concurso

**Endpoint**: `POST /concursos`

**Headers**: `Authorization: Bearer {accessToken}`

**Request Body**:
```json
{
  "titulo": "Concurso de Fotografía de Naturaleza 2025",
  "descripcion": "Concurso anual enfocado en fotografía de naturaleza",
  "reglas": "1. Solo fotografías originales. Máximo 3 envíos. Formato JPEG o PNG",
  "fecha_inicio": "2024-03-01T00:00:00Z",
  "fecha_final": "2024-03-31T23:59:59Z",
  "max_envios": 3,
  "tamaño_max_mb": 10,
  "poster_url": "https://medios.webfestival.art/api/asset/file/poster123"
}
```

**Campos**:
- `titulo` (requerido): Nombre del concurso
- `descripcion` (requerido): Descripción detallada
- `reglas`: Reglas y términos del concurso
- `fecha_inicio` (requerido): Fecha de inicio (ISO 8601)
- `fecha_final` (requerido): Fecha de finalización
- `max_envios`: Máximo de medios por participante (default: 3)
- `tamaño_max_mb`: Tamaño máximo de archivo en MB (default: 10)
- `poster_url`: URL del poster del concurso

**Estados del concurso**:
- `PROXIMO`: Aún no ha iniciado
- `ACTIVO`: Abierto para inscripciones y envíos
- `EVALUACION`: Cerrado, en proceso de evaluación de jurados
- `FINALIZADO`: Resultados publicados

#### 7.8.3 Actualizar Concurso

**Endpoint**: `PUT /concursos/{concursoId}`

**Headers**: `Authorization: Bearer {accessToken}`

**Request Body**: (Campos a actualizar)
```json
{
  "titulo": "Concurso de Fotografía de Naturaleza 2025 - Actualizado",
  "status": "Activo",
  "max_envios": 5
}
```

#### 7.8.4 Eliminar Concurso

**Endpoint**: `DELETE /concursos/{concursoId}`

**Headers**: `Authorization: Bearer {accessToken}`

**⚠️ PRECAUCIÓN**: Elimina el concurso y todas sus relaciones (inscripciones, medios, calificaciones)

---


## 8. Módulo de Criterios de Evaluación

### 8.1 Introducción a los Criterios

Los criterios son los parámetros que los jurados usan para evaluar los medios. Pueden ser:

- **Universales**: Aplican a todos los tipos de medios (ej: Originalidad, Creatividad)
- **Específicos**: Solo para un tipo de medio (ej: Composición para fotografía)

### 8.2 Ver Todos los Criterios (Público)

**Endpoint**: `GET /criterios`

**Query Parameters**:
- `activo`: true/false (filtrar por estado)
- `tipo_medio`: fotografia, video, audio, corto_cine (filtrar por tipo)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Composición",
      "descripcion": "Evaluación de la composición y encuadre de la imagen",
      "tipo_medio": "fotografia",
      "peso": 1.5,
      "orden": 1,
      "activo": true
    },
    {
      "id": 2,
      "nombre": "Creatividad",
      "descripcion": "Originalidad y creatividad del trabajo",
      "tipo_medio": null,
      "peso": 2.0,
      "orden": 2,
      "activo": true
    }
  ]
}
```

**Nota**: `tipo_medio: null` indica que es un criterio universal

### 8.3 Ver Criterios Universales

**Endpoint**: `GET /criterios/universales`

**Descripción**: Retorna solo criterios que aplican a todos los tipos de medios.

**Ejemplos de criterios universales**:
- Originalidad
- Creatividad
- Impacto emocional
- Mensaje/Narrativa

### 8.4 Ver Criterios por Tipo de Medio

**Endpoint**: `GET /criterios/tipo/{tipoMedio}`

**Tipos válidos**:
- `fotografia`
- `video`
- `audio`
- `corto_cine`

**Ejemplo**:
```
GET /criterios/tipo/fotografia
```

**Response**:
```json
{
  "success": true,
  "data": {
    "especificos": [
      {
        "id": 1,
        "nombre": "Composición",
        "descripcion": "Evaluación de la composición y encuadre",
        "tipo_medio": "fotografia",
        "peso": 1.5,
        "orden": 1
      },
      {
        "id": 2,
        "nombre": "Exposición",
        "descripcion": "Manejo de luz y exposición",
        "tipo_medio": "fotografia",
        "peso": 1.5,
        "orden": 2
      }
    ],
    "universales": [
      {
        "id": 10,
        "nombre": "Creatividad",
        "descripcion": "Originalidad y creatividad",
        "tipo_medio": null,
        "peso": 2.0,
        "orden": 1
      }
    ],
    "total": 3
  }
}
```

### 8.5 Criterios Predefinidos por Tipo

#### 📸 Criterios para Fotografía
1. **Composición** (peso: 1.5)
   - Regla de tercios
   - Líneas guía
   - Balance visual

2. **Exposición** (peso: 1.5)
   - Manejo de luz
   - Contraste
   - Rango dinámico

3. **Enfoque** (peso: 1.0)
   - Nitidez
   - Profundidad de campo
   - Punto focal

4. **Color** (peso: 1.0)
   - Armonía cromática
   - Saturación
   - Balance de blancos

5. **Creatividad** (peso: 2.0) - Universal
   - Originalidad
   - Concepto único

#### 🎥 Criterios para Video
1. **Narrativa** (peso: 2.0)
   - Historia coherente
   - Estructura
   - Ritmo

2. **Técnica Visual** (peso: 1.5)
   - Cinematografía
   - Encuadres
   - Movimientos de cámara

3. **Audio** (peso: 1.5)
   - Calidad de sonido
   - Música
   - Efectos sonoros

4. **Edición** (peso: 1.5)
   - Transiciones
   - Ritmo
   - Continuidad

5. **Impacto Emocional** (peso: 2.0) - Universal

#### 🎵 Criterios para Audio
1. **Calidad Técnica** (peso: 1.5)
   - Grabación
   - Mezcla
   - Masterización

2. **Composición** (peso: 2.0)
   - Melodía
   - Armonía
   - Estructura

3. **Producción** (peso: 1.5)
   - Arreglos
   - Instrumentación
   - Efectos

4. **Originalidad** (peso: 2.0) - Universal

#### 🎬 Criterios para Cortometraje
1. **Narrativa** (peso: 2.5)
   - Guion
   - Desarrollo de personajes
   - Estructura dramática

2. **Cinematografía** (peso: 2.0)
   - Fotografía
   - Iluminación
   - Composición visual

3. **Audio** (peso: 1.5)
   - Diseño sonoro
   - Diálogos
   - Música

4. **Actuación/Dirección** (peso: 2.0)
   - Interpretación
   - Dirección de actores

5. **Impacto General** (peso: 2.0) - Universal

### 8.6 Validar Criterios Suficientes

**Endpoint**: `GET /criterios/validar/{tipoMedio}`

**Descripción**: Verifica que existan criterios mínimos para evaluar un tipo de medio.

**Response**:
```json
{
  "success": true,
  "data": {
    "valido": true,
    "criterios_count": 8,
    "minimo_requerido": 3,
    "mensaje": "Criterios suficientes para evaluación"
  }
}
```

### 8.7 Ver Estadísticas de Criterios

**Endpoint**: `GET /criterios/estadisticas`

**Response**:
```json
{
  "success": true,
  "data": {
    "total_criterios": 25,
    "criterios_activos": 23,
    "criterios_inactivos": 2,
    "por_tipo": {
      "fotografia": 6,
      "video": 5,
      "audio": 4,
      "corto_cine": 5,
      "universales": 5
    }
  }
}
```

### 8.8 Gestión de Criterios (ADMIN)

#### 8.8.1 Crear Criterio

**Endpoint**: `POST /criterios`

**Headers**: `Authorization: Bearer {accessToken}`

**Request Body**:
```json
{
  "nombre": "Composición",
  "descripcion": "Evaluación de la composición y encuadre de la imagen",
  "tipo_medio": "fotografia",
  "peso": 1.5,
  "orden": 1
}
```

**Campos**:
- `nombre` (requerido): Nombre del criterio
- `descripcion`: Descripción detallada
- `tipo_medio`: fotografia, video, audio, corto_cine, o null para universal
- `peso`: Peso del criterio en la calificación final (default: 1.0)
- `orden`: Orden de presentación (default: 0)

**Peso del criterio**:
- `1.0`: Peso normal
- `1.5`: Peso medio-alto
- `2.0`: Peso alto (criterios más importantes)
- `0.5`: Peso bajo

#### 8.8.2 Actualizar Criterio

**Endpoint**: `PUT /criterios/{criterioId}`

**Headers**: `Authorization: Bearer {accessToken}`

**Request Body**: (Campos a actualizar)
```json
{
  "nombre": "Composición Actualizada",
  "peso": 2.0,
  "activo": true
}
```

#### 8.8.3 Eliminar Criterio

**Endpoint**: `DELETE /criterios/{criterioId}`

**Headers**: `Authorization: Bearer {accessToken}`

**⚠️ PRECAUCIÓN**: Elimina el criterio y todas sus calificaciones asociadas

#### 8.8.4 Reordenar Criterios

**Endpoint**: `POST /criterios/reordenar`

**Headers**: `Authorization: Bearer {accessToken}`

**Request Body**:
```json
{
  "criterios": [
    {"id": 1, "orden": 1},
    {"id": 2, "orden": 2},
    {"id": 3, "orden": 3}
  ]
}
```

**Uso**: Cambiar el orden de presentación de múltiples criterios a la vez

---


## 9. Módulo de Subida de Medios

### 9.1 Flujo Completo de Subida

```
┌─────────────────────────────────────────────────────────────┐
│              FLUJO DE SUBIDA DE MEDIOS                      │
└─────────────────────────────────────────────────────────────┘

1. Autenticación
   └─► Login → Obtener accessToken

2. Explorar Concursos
   └─► Ver concursos activos → Seleccionar concurso

3. Inscripción
   └─► Inscribirse al concurso (OBLIGATORIO)

4. Preparar Subida
   ├─► Ver configuración de validación
   └─► Generar URL de subida temporal

5. Subir Archivo
   └─► Subir a Immich usando la URL generada

6. Procesar Subida
   ├─► Confirmar subida con asset_id
   └─► Crear álbum automático en Immich

7. Verificación
   ├─► Ver medio subido
   └─► Verificar límites restantes
```

### 9.2 Configuración de Validación

**Endpoint**: `GET /media/validation-config`

**Descripción**: Obtiene los límites y formatos permitidos.

**Response**:
```json
{
  "success": true,
  "data": {
    "maxFileSize": 10485760,
    "maxFileSizeMB": 10,
    "allowedFormats": {
      "fotografia": [
        "image/jpeg",
        "image/png",
        "image/webp"
      ],
      "video": [
        "video/mp4",
        "video/webm",
        "video/quicktime"
      ],
      "audio": [
        "audio/mpeg",
        "audio/wav",
        "audio/flac"
      ],
      "corto_cine": [
        "video/mp4",
        "video/quicktime",
        "video/x-msvideo"
      ]
    }
  }
}
```

### 9.3 Generar URL de Subida

**Endpoint**: `POST /media/contests/{concursoId}/upload-url`

**Headers**: `Authorization: Bearer {accessToken}`

**Request Body**:
```json
{
  "titulo": "Mi Fotografía Ganadora",
  "tipo_medio": "fotografia",
  "categoria_id": 1,
  "file_type": "image/jpeg",
  "file_name": "mi-fotografia-ganadora.jpg",
  "file_size": 2048576
}
```

**Campos**:
- `titulo` (requerido): Título del medio
- `tipo_medio` (requerido): fotografia, video, audio, corto_cine
- `categoria_id` (requerido): ID de la categoría del concurso
- `file_type` (requerido): MIME type del archivo
- `file_name` (requerido): Nombre del archivo
- `file_size` (requerido): Tamaño en bytes

**Validaciones automáticas**:
- ✅ Usuario inscrito al concurso
- ✅ Formato de archivo permitido
- ✅ Tamaño dentro del límite
- ✅ No excede máximo de envíos
- ✅ Concurso activo

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "upload_token": "upload_abc123xyz",
    "upload_url": "https://medios.webfestival.art/api/assets",
    "immich_api_key": "immich_key_secret",
    "expires_at": "2024-11-13T10:15:00Z",
    "expires_in": 900,
    "metadata": {
      "titulo": "Mi Fotografía Ganadora",
      "tipo_medio": "fotografia",
      "categoria_id": 1,
      "concurso_id": 1
    }
  }
}
```

**Importante**:
- La URL expira en **15 minutos**
- El `upload_token` debe usarse en el siguiente paso
- El `immich_api_key` se usa para autenticar con Immich

### 9.4 Subir Archivo a Immich

**Endpoint**: `POST https://medios.webfestival.art/api/assets`

**Headers**:
- `x-api-key`: {immich_api_key} (del paso anterior)

**Body** (multipart/form-data):
```
assetData: [ARCHIVO] (seleccionar archivo)
deviceAssetId: {upload_token}
deviceId: webfestival-api
fileCreatedAt: 2024-11-13T10:00:00Z
fileModifiedAt: 2024-11-13T10:00:00Z
```

**En Postman**:
1. Cambiar Body a "form-data"
2. Agregar campo `assetData` tipo "File" y seleccionar archivo
3. Agregar campos de texto con los valores correspondientes
4. Click en "Send"

**Response (201 Created)**:
```json
{
  "id": "996199b5-2af5-48fa-b09e-5a21b07d442d",
  "deviceAssetId": "upload_abc123xyz",
  "ownerId": "immich_user_id",
  "deviceId": "webfestival-api",
  "type": "IMAGE",
  "originalPath": "/upload/library/user_id/2024/11/13/filename.jpg",
  "originalFileName": "mi-fotografia-ganadora.jpg",
  "fileCreatedAt": "2024-11-13T10:00:00Z",
  "fileModifiedAt": "2024-11-13T10:00:00Z",
  "isFavorite": false,
  "isArchived": false,
  "duration": "0:00:00.000000",
  "exifInfo": {
    "make": "Canon",
    "model": "EOS 5D Mark IV",
    "exposureTime": "1/250",
    "fNumber": 5.6,
    "iso": 400
  }
}
```

**Guardar**: El campo `id` es el `immich_asset_id` necesario para el siguiente paso

### 9.5 Procesar Subida Completada

**Endpoint**: `POST /media/contests/{concursoId}/process-upload`

**Headers**:
- `Authorization: Bearer {accessToken}`
- `x-upload-token: {upload_token}` (del paso 9.3)

**Request Body**:
```json
{
  "asset_id": "996199b5-2af5-48fa-b09e-5a21b07d442d",
  "titulo": "Mi Fotografía Ganadora",
  "tipo_medio": "fotografia",
  "categoria_id": 1,
  "file_size": 2048576,
  "file_type": "image/jpeg",
  "original_filename": "mi-fotografia-ganadora.jpg"
}
```

**Proceso automático**:
1. ✅ Valida el upload_token
2. ✅ Verifica que el asset existe en Immich
3. ✅ Crea registro en la base de datos
4. ✅ Crea/actualiza álbum en Immich
5. ✅ Asocia el medio al concurso y categoría
6. ✅ Actualiza contador de envíos del usuario

**Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "titulo": "Mi Fotografía Ganadora",
    "tipo_medio": "fotografia",
    "medio_url": "http://localhost:3001/proxy/media/996199b5-2af5-48fa-b09e-5a21b07d442d",
    "thumbnail_url": "http://localhost:3001/proxy/media/996199b5-2af5-48fa-b09e-5a21b07d442d?size=400x225",
    "preview_url": "http://localhost:3001/proxy/media/996199b5-2af5-48fa-b09e-5a21b07d442d?size=1280x720",
    "immich_asset_id": "996199b5-2af5-48fa-b09e-5a21b07d442d",
    "immich_album_id": "album-concurso-1-user-123",
    "usuario": {
      "id": "user_123",
      "nombre": "Juan Pérez"
    },
    "concurso": {
      "id": 1,
      "titulo": "Concurso de Fotografía 2024"
    },
    "categoria": {
      "id": 1,
      "nombre": "Fotografía de Paisaje"
    },
    "created_at": "2024-11-13T10:00:00Z"
  },
  "message": "Medio procesado y registrado exitosamente"
}
```

### 9.6 Organización Automática en Immich

#### 📁 Formato de Álbumes

Los medios se organizan automáticamente en álbumes con el formato:

```
Concurso: [Título del Concurso] / Usuario: [Nombre del Usuario]
```

**Ejemplos**:
- `Concurso: Fotografía de Naturaleza 2024 / Usuario: Juan Pérez`
- `Concurso: Video Documental 2024 / Usuario: María García`
- `Concurso: Cortometraje Experimental / Usuario: Carlos Hernández`

#### Comportamiento

- ✅ Si el álbum ya existe, se reutiliza
- ✅ Todos los medios del usuario para ese concurso van al mismo álbum
- ✅ El `immich_album_id` se guarda en la base de datos
- ✅ Cada medio también se agrega al álbum "Sistema" (álbum general)

### 9.7 URLs de Acceso a Medios

Cada medio incluye 3 URLs optimizadas:

#### 1. URL Original
```
http://localhost:3001/proxy/media/{immich_asset_id}
```
**Uso**: Ver imagen en tamaño completo

#### 2. URL Thumbnail (Miniatura)
```
http://localhost:3001/proxy/media/{immich_asset_id}?size=400x225
```
**Uso**: Listados, galerías, previews
**Tamaño**: 400x225px (16:9)

#### 3. URL Preview (Vista Previa HD)
```
http://localhost:3001/proxy/media/{immich_asset_id}?size=1280x720
```
**Uso**: Vista detallada, lightbox
**Tamaño**: 1280x720px (HD)

**Ventajas del Proxy**:
- ✅ No requiere autenticación
- ✅ Funciona directamente en el navegador
- ✅ Headers de cache configurados
- ✅ API key de Immich no se expone

### 9.8 Consultar Medios

#### 9.8.1 Ver Medio por ID

**Endpoint**: `GET /media/{medioId}`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "titulo": "Mi Fotografía Ganadora",
    "descripcion": null,
    "tipo_medio": "fotografia",
    "medio_url": "http://localhost:3001/proxy/media/996199b5-2af5-48fa-b09e-5a21b07d442d",
    "thumbnail_url": "http://localhost:3001/proxy/media/996199b5-2af5-48fa-b09e-5a21b07d442d?size=400x225",
    "preview_url": "http://localhost:3001/proxy/media/996199b5-2af5-48fa-b09e-5a21b07d442d?size=1280x720",
    "immich_asset_id": "996199b5-2af5-48fa-b09e-5a21b07d442d",
    "usuario": {
      "id": "user_123",
      "nombre": "Juan Pérez",
      "picture_url": "..."
    },
    "concurso": {
      "id": 1,
      "titulo": "Concurso de Fotografía 2024"
    },
    "categoria": {
      "id": 1,
      "nombre": "Fotografía de Paisaje"
    },
    "estadisticas": {
      "calificacion_promedio": 8.5,
      "total_calificaciones": 3,
      "posicion": 5
    },
    "created_at": "2024-11-13T10:00:00Z"
  }
}
```

#### 9.8.2 Medios por Usuario

**Endpoint**: `GET /media/user/{userId}`

**Query Parameters**:
- `page`: Número de página
- `limit`: Resultados por página
- `tipo_medio`: Filtrar por tipo

#### 9.8.3 Medios por Concurso

**Endpoint**: `GET /media/contests/{concursoId}`

**Query Parameters**:
- `page`: Número de página
- `limit`: Resultados por página
- `categoria_id`: Filtrar por categoría

### 9.9 Actualizar Medio

**Endpoint**: `PUT /media/{medioId}`

**Headers**: `Authorization: Bearer {accessToken}`

**Request Body**:
```json
{
  "titulo": "Título Actualizado",
  "descripcion": "Nueva descripción del medio"
}
```

**⚠️ Limitaciones**:
- Solo el propietario puede actualizar
- No se puede cambiar el archivo
- No se puede cambiar si el concurso está en evaluación

### 9.10 Eliminar Medio

**Endpoint**: `DELETE /media/{medioId}`

**Headers**: `Authorization: Bearer {accessToken}`

**Validaciones**:
- ✅ Solo el propietario puede eliminar
- ✅ Concurso no debe estar en evaluación
- ✅ No debe tener calificaciones

---


## 10. Módulo de Asignación de Jurados

### 10.1 Introducción

El sistema de asignación de jurados permite:
- **Asignación Manual**: El administrador asigna jurados específicos
- **Asignación Automática**: Algoritmo inteligente basado en especialización
- **Validación de Cobertura**: Verifica que todas las categorías tengan jurados suficientes

### 10.2 Crear Asignación Manual (ADMIN)

**Endpoint**: `POST /jurado-asignacion`

**Headers**: `Authorization: Bearer {accessToken}`

**Request Body**:
```json
{
  "usuarioId": "user_123",
  "categoriaId": 1,
  "especialidad": "Fotografía de paisaje",
  "nivel_experiencia": "experto"
}
```

**Campos**:
- `usuarioId` (requerido): ID del jurado
- `categoriaId` (requerido): ID de la categoría
- `especialidad`: Área específica de especialización
- `nivel_experiencia`: principiante, intermedio, avanzado, experto

**Validaciones**:
- ✅ Usuario debe tener rol JURADO
- ✅ Categoría debe existir
- ✅ No asignado previamente a la misma categoría

**Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "usuario_id": "user_123",
    "categoria_id": 1,
    "especialidad": "Fotografía de paisaje",
    "nivel_experiencia": "experto",
    "jurado": {
      "id": "user_123",
      "nombre": "Juan Pérez",
      "especializacion": ["fotografia"]
    },
    "categoria": {
      "id": 1,
      "nombre": "Fotografía de Paisaje",
      "tipo_medio": "fotografia",
      "concurso": {
        "id": 1,
        "titulo": "Concurso de Fotografía 2024"
      }
    },
    "created_at": "2024-11-13T10:00:00Z"
  }
}
```

### 10.3 Listar Asignaciones (ADMIN)

**Endpoint**: `GET /jurado-asignacion`

**Headers**: `Authorization: Bearer {accessToken}`

**Query Parameters**:
- `page`: Número de página
- `limit`: Resultados por página
- `concursoId`: Filtrar por concurso
- `categoriaId`: Filtrar por categoría
- `usuarioId`: Filtrar por jurado

**Ejemplo**:
```
GET /jurado-asignacion?concursoId=1&page=1&limit=20
```

### 10.4 Ver Asignaciones de un Jurado

**Endpoint**: `GET /jurado-asignacion/jurado/{userId}`

**Headers**: `Authorization: Bearer {accessToken}`

**Descripción**: Lista todas las categorías asignadas a un jurado específico.

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "categoria": {
        "id": 1,
        "nombre": "Fotografía de Paisaje",
        "tipo_medio": "fotografia",
        "concurso": {
          "id": 1,
          "titulo": "Concurso de Fotografía 2024",
          "status": "Activo"
        }
      },
      "especialidad": "Fotografía de paisaje",
      "nivel_experiencia": "experto",
      "medios_asignados": 25,
      "medios_evaluados": 10,
      "progreso": 40
    }
  ]
}
```

### 10.5 Ver Jurados de una Categoría

**Endpoint**: `GET /jurado-asignacion/categoria/{categoriaId}`

**Headers**: `Authorization: Bearer {accessToken}`

**Descripción**: Lista todos los jurados asignados a una categoría.

**Response**:
```json
{
  "success": true,
  "data": {
    "categoria": {
      "id": 1,
      "nombre": "Fotografía de Paisaje",
      "tipo_medio": "fotografia"
    },
    "jurados": [
      {
        "id": "user_123",
        "nombre": "Juan Pérez",
        "especializacion": ["fotografia"],
        "experiencia_años": 5,
        "nivel_experiencia": "experto",
        "medios_evaluados": 10,
        "medios_pendientes": 15
      }
    ],
    "total_jurados": 1,
    "cobertura_adecuada": false,
    "minimo_recomendado": 3
  }
}
```

### 10.6 Ver Jurados de un Concurso

**Endpoint**: `GET /jurado-asignacion/concurso/{concursoId}`

**Headers**: `Authorization: Bearer {accessToken}`

**Descripción**: Lista jurados agrupados por categoría para un concurso.

**Response**:
```json
{
  "success": true,
  "data": {
    "concurso": {
      "id": 1,
      "titulo": "Concurso de Fotografía 2024"
    },
    "categorias": [
      {
        "id": 1,
        "nombre": "Fotografía de Paisaje",
        "jurados": [
          {
            "id": "user_123",
            "nombre": "Juan Pérez",
            "nivel_experiencia": "experto"
          }
        ],
        "total_jurados": 1,
        "total_medios": 50
      }
    ],
    "resumen": {
      "total_categorias": 3,
      "total_jurados": 8,
      "categorias_sin_jurados": 0,
      "cobertura_completa": true
    }
  }
}
```

### 10.7 Asignación Automática Inteligente (ADMIN)

**Endpoint**: `POST /jurado-asignacion/asignar-automaticamente/{concursoId}`

**Headers**: `Authorization: Bearer {accessToken}`

**Request Body**:
```json
{
  "min_jurados_por_categoria": 3,
  "max_jurados_por_categoria": 5,
  "priorizar_experiencia": true,
  "balancear_carga": true
}
```

**Parámetros**:
- `min_jurados_por_categoria`: Mínimo de jurados por categoría (default: 3)
- `max_jurados_por_categoria`: Máximo de jurados por categoría (default: 5)
- `priorizar_experiencia`: Priorizar jurados con más experiencia (default: true)
- `balancear_carga`: Distribuir equitativamente la carga (default: true)

**Algoritmo**:
1. ✅ Identifica categorías sin jurados o con pocos jurados
2. ✅ Busca jurados especializados en el tipo de medio
3. ✅ Prioriza por nivel de experiencia
4. ✅ Balancea la carga entre jurados
5. ✅ Evita sobrecargar a un jurado
6. ✅ Crea asignaciones automáticamente

**Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "asignaciones_creadas": 12,
    "categorias_cubiertas": 4,
    "jurados_asignados": 8,
    "detalles": [
      {
        "categoria": "Fotografía de Paisaje",
        "jurados_asignados": 3,
        "jurados": [
          {
            "id": "user_123",
            "nombre": "Juan Pérez",
            "nivel_experiencia": "experto"
          }
        ]
      }
    ],
    "advertencias": [
      "Categoría 'Video Documental' solo tiene 2 jurados (mínimo recomendado: 3)"
    ]
  },
  "message": "Asignación automática completada"
}
```

### 10.8 Obtener Sugerencias Inteligentes (ADMIN)

**Endpoint**: `GET /jurado-asignacion/sugerencias/{concursoId}`

**Headers**: `Authorization: Bearer {accessToken}`

**Query Parameters**:
- `min_jurados_por_categoria`: Mínimo recomendado (default: 3)

**Descripción**: Obtiene sugerencias de asignación sin crear las asignaciones.

**Response**:
```json
{
  "success": true,
  "data": {
    "sugerencias": [
      {
        "categoria": {
          "id": 1,
          "nombre": "Fotografía de Paisaje",
          "tipo_medio": "fotografia"
        },
        "jurados_actuales": 1,
        "jurados_recomendados": 3,
        "jurados_sugeridos": [
          {
            "id": "user_456",
            "nombre": "María García",
            "especializacion": ["fotografia"],
            "experiencia_años": 7,
            "nivel_experiencia": "experto",
            "score": 95,
            "razon": "Alta experiencia en fotografía de paisaje"
          },
          {
            "id": "user_789",
            "nombre": "Carlos López",
            "especializacion": ["fotografia", "video"],
            "experiencia_años": 4,
            "nivel_experiencia": "avanzado",
            "score": 85,
            "razon": "Experiencia en fotografía"
          }
        ]
      }
    ]
  }
}
```

**Score de sugerencia**:
- 90-100: Excelente match (especialización exacta + alta experiencia)
- 70-89: Buen match (especialización relacionada + experiencia)
- 50-69: Match aceptable (especialización general)
- <50: Match bajo (sin especialización específica)

### 10.9 Validar Cobertura de Jurados (ADMIN)

**Endpoint**: `GET /jurado-asignacion/cobertura/{concursoId}`

**Headers**: `Authorization: Bearer {accessToken}`

**Descripción**: Verifica si todas las categorías tienen suficientes jurados.

**Response**:
```json
{
  "success": true,
  "data": {
    "concurso": {
      "id": 1,
      "titulo": "Concurso de Fotografía 2024"
    },
    "cobertura_completa": false,
    "minimo_recomendado": 3,
    "categorias": [
      {
        "id": 1,
        "nombre": "Fotografía de Paisaje",
        "jurados_asignados": 3,
        "cobertura_adecuada": true,
        "estado": "OK"
      },
      {
        "id": 2,
        "nombre": "Fotografía de Fauna",
        "jurados_asignados": 1,
        "cobertura_adecuada": false,
        "estado": "INSUFICIENTE",
        "jurados_faltantes": 2
      }
    ],
    "resumen": {
      "total_categorias": 2,
      "categorias_ok": 1,
      "categorias_insuficientes": 1,
      "total_jurados": 4
    },
    "recomendaciones": [
      "Asignar 2 jurados más a 'Fotografía de Fauna'",
      "Considerar usar asignación automática"
    ]
  }
}
```

### 10.10 Eliminar Asignación (ADMIN)

**Endpoint**: `DELETE /jurado-asignacion/{usuarioId}/{categoriaId}`

**Headers**: `Authorization: Bearer {accessToken}`

**Ejemplo**:
```
DELETE /jurado-asignacion/user_123/1
```

**Validaciones**:
- ✅ Asignación debe existir
- ✅ No debe haber calificaciones en progreso

### 10.11 Estadísticas de Asignación (ADMIN)

**Endpoint**: `GET /jurado-asignacion/estadisticas`

**Headers**: `Authorization: Bearer {accessToken}`

**Response**:
```json
{
  "success": true,
  "data": {
    "total_asignaciones": 45,
    "total_jurados_activos": 15,
    "total_categorias_cubiertas": 12,
    "promedio_jurados_por_categoria": 3.75,
    "distribucion_por_experiencia": {
      "experto": 8,
      "avanzado": 5,
      "intermedio": 2
    },
    "jurados_mas_asignados": [
      {
        "id": "user_123",
        "nombre": "Juan Pérez",
        "total_asignaciones": 5,
        "categorias": ["Fotografía de Paisaje", "Fotografía de Fauna"]
      }
    ],
    "categorias_sin_cobertura": []
  }
}
```

---


## 11. Módulo de Cali