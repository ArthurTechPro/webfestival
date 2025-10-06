# WebFestival API - Colecciones de Postman

Esta carpeta contiene colecciones completas de Postman para probar todos los endpoints de la API WebFestival.

## 📋 Colecciones Disponibles

### 🎯 Colección Maestra (Recomendada)
- **`WebFestival-Master-Collection.postman_collection.json`**
  - **Colección unificada "Web Festival"** con toda la API organizada
  - Quick Start con 7 pasos básicos
  - Todas las funcionalidades organizadas por módulos
  - Scripts automáticos para guardar tokens
  - Variables compartidas entre todos los endpoints

### 🔐 Autenticación y Usuarios
- **`WebFestival-API-Auth.postman_collection.json`**
  - Login, registro, refresh tokens
  - Gestión de perfiles de usuario
  - Cambio de contraseñas
  - Validación de tokens

### 🏆 Concursos y Participación
- **`WebFestival-API-Concursos.postman_collection.json`**
  - CRUD de concursos
  - Inscripciones y cancelaciones
  - Consulta de concursos activos/finalizados
  - Verificación de inscripciones

### 📊 Criterios de Evaluación
- **`WebFestival-API-Criterios.postman_collection.json`**
  - Gestión de criterios dinámicos
  - Criterios por tipo de medio
  - Calificaciones y evaluaciones
  - Asignación de jurados

### 🎬 Medios Multimedia
- **`WebFestival-API-Media.postman_collection.json`**
  - Subida de medios (foto, video, audio, cine)
  - Validación de archivos
  - Galerías públicas
  - Gestión de metadatos

### 📝 Sistema CMS
- **`WebFestival-API-CMS.postman_collection.json`**
  - Gestión de contenido
  - Categorías y etiquetas
  - Búsqueda avanzada
  - Analytics y métricas

### 💬 Interacciones Sociales
- **`WebFestival-API-Interactions.postman_collection.json`**
  - Likes unificados
  - Comentarios con anidamiento
  - Sistema de reportes
  - Moderación centralizada

### 💳 Suscripciones y Pagos
- **`WebFestival-API-Subscriptions.postman_collection.json`**
  - Planes de suscripción
  - Procesamiento de pagos
  - Gestión de límites
  - Facturación automática

### 🔔 Notificaciones
- **`WebFestival-API-Notifications.postman_collection.json`**
  - Notificaciones automáticas
  - Gestión de preferencias
  - Historial de notificaciones
  - Templates personalizados

### 📧 Newsletter y Contenido Educativo
- **`WebFestival-API-Newsletter.postman_collection.json`**
  - Suscripción al newsletter
  - Contenido educativo por tipo de medio
  - Recomendaciones personalizadas
  - Progreso de aprendizaje

### 🌐 Redes Sociales
- **`WebFestival-API-Social-Media.postman_collection.json`**
  - Enlaces compartibles
  - Integración con redes sociales
  - Open Graph metadata
  - Medios públicos

### 🏥 Health Checks y Sistema
- **`WebFestival-API-Health.postman_collection.json`**
  - Health checks del servidor
  - Monitoreo de base de datos
  - Estado de servicios externos
  - Información de la API

## 🚀 Cómo Usar las Colecciones

### 1. Preparación del Servidor
Antes de usar las colecciones, asegúrate de que el servidor esté ejecutándose:

```bash
# Navegar al directorio del proyecto
cd webfestival-api

# Instalar dependencias (si es la primera vez)
npm install

# Configurar base de datos (si es la primera vez)
npx prisma db push
npx prisma db seed

# Iniciar el servidor de desarrollo
npm run dev
```

El servidor estará disponible en: `http://localhost:3001`

### 2. Importar en Postman

#### Opción A: Colección Maestra (Más Fácil - Recomendado)
1. **Abre Postman**
2. **Haz clic en "Import"** en la esquina superior izquierda
3. **Importa estos 2 archivos**:
   - `WebFestival-Master-Collection.postman_collection.json` (Colección completa)
   - `WebFestival-Development.postman_environment.json` (Entorno de desarrollo)
4. **¡Listo!** Tendrás toda la API organizada en una sola colección "Web Festival"

#### Opción B: Importar Todo (Para usuarios avanzados)
1. **Abre Postman**
2. **Haz clic en "Import"** en la esquina superior izquierda
3. **Selecciona "Upload Files"** o arrastra toda la carpeta `postman/`
4. **Importa todos los archivos JSON** de una vez:
   - Todas las colecciones (12 archivos individuales)
   - El entorno de desarrollo (`WebFestival-Development.postman_environment.json`)

#### Opción C: Importar Selectivamente
Si solo necesitas ciertas funcionalidades específicas:
- **Básico**: Auth + Health + Workspace
- **Concursos**: Auth + Concursos + Media + Criterios
- **CMS**: Auth + CMS + Interactions + Newsletter
- **Completo**: Colección Maestra (recomendado)

### 3. Configurar Entorno de Desarrollo

#### Automático (Recomendado)
1. **Importa el archivo** `WebFestival-Development.postman_environment.json`
2. **Selecciona el entorno** "WebFestival Development" en Postman
3. **¡Listo!** Todas las variables están preconfiguradas

#### Manual (Si prefieres crear tu propio entorno)
Crea un nuevo entorno con estas variables:

```json
{
  "base_url": "http://localhost:3001/api/v1",
  "server_url": "http://localhost:3001",
  "access_token": "",
  "refresh_token": "",
  "user_id": "",
  "admin_token": "",
  "jurado_token": "",
  "content_admin_token": "",
  "test_email": "test@webfestival.com",
  "test_password": "TestPassword123!",
  "admin_email": "admin@webfestival.com",
  "admin_password": "AdminPassword123!",
  "concurso_id": "",
  "categoria_id": "",
  "medio_id": "",
  "criterio_id": "",
  "contenido_id": "",
  "comentario_id": "",
  "reporte_id": "",
  "subscription_id": ""
}
```

### 4. Flujo de Inicio Rápido (Quick Start)

#### 🎯 Opción 1: Usar la Colección Maestra (Más Fácil)
1. **Abre la colección** "Web Festival"
2. **Ejecuta la carpeta** "🚀 Quick Start"
3. **Ejecuta los requests en orden**:
   - Health Check → Verificar servidor
   - Registrar Usuario → Crear cuenta de prueba
   - Login Usuario → Obtener token (se guarda automáticamente)
   - Obtener Perfil → Verificar autenticación
   - Ver Concursos Activos → Explorar contenido
   - Ver Criterios → Entender evaluación
   - Ver Planes → Conocer suscripciones

#### 🎯 Opción 2: Flujo Manual Paso a Paso

**Paso 1: Verificar Servidor**
```http
GET {{server_url}}/health
```
✅ Respuesta esperada: `{ "status": "OK", "timestamp": "..." }`

**Paso 2: Registrar Usuario de Prueba**
```http
POST {{base_url}}/auth/register
Content-Type: application/json

{
  "email": "{{test_email}}",
  "password": "{{test_password}}",
  "nombre": "Usuario de Prueba",
  "bio": "Usuario creado para testing de la API"
}
```

**Paso 3: Hacer Login (Token se guarda automáticamente)**
```http
POST {{base_url}}/auth/login
Content-Type: application/json

{
  "email": "{{test_email}}",
  "password": "{{test_password}}"
}
```

**Paso 4: Verificar Autenticación**
```http
GET {{base_url}}/auth/me
Authorization: Bearer {{access_token}}
```

**Paso 5: Explorar Contenido**
```http
GET {{base_url}}/concursos/activos
```

### 5. Flujos de Testing Avanzados

#### 🏆 Flujo Completo de Concurso
**Ejecutar en este orden:**

1. **Login como Admin**
   ```http
   POST {{base_url}}/auth/login
   {
     "email": "{{admin_email}}",
     "password": "{{admin_password}}"
   }
   ```

2. **Crear Concurso**
   ```http
   POST {{base_url}}/concursos
   Authorization: Bearer {{admin_token}}
   {
     "titulo": "Concurso de Fotografía Urbana 2025",
     "descripcion": "Captura la esencia de la vida urbana",
     "fecha_inicio": "2025-01-15T00:00:00Z",
     "fecha_final": "2025-03-15T23:59:59Z",
     "max_envios": 3,
     "tamano_max_mb": 10
   }
   ```

3. **Cambiar a Usuario Normal**
   ```http
   POST {{base_url}}/auth/login
   {
     "email": "{{test_email}}",
     "password": "{{test_password}}"
   }
   ```

4. **Inscribirse al Concurso**
   ```http
   POST {{base_url}}/concursos/inscripcion
   {
     "concursoId": {{concurso_id}}
   }
   ```

5. **Generar URL de Subida**
   ```http
   POST {{base_url}}/media/contests/{{concurso_id}}/upload-url
   {
     "titulo": "Mi Fotografía Urbana",
     "tipo_medio": "fotografia",
     "categoria_id": 1,
     "formato": "image/jpeg",
     "tamaño_archivo": 2048576
   }
   ```

#### 💬 Flujo de Interacciones Sociales
1. **Dar Like a Contenido**
2. **Crear Comentario**
3. **Responder Comentario**
4. **Reportar Contenido Inapropiado**
5. **Moderar como Admin**

#### 💳 Flujo de Suscripciones
1. **Ver Planes Disponibles**
2. **Suscribirse a Plan Premium**
3. **Verificar Límites**
4. **Gestionar Suscripción**

### 6. Automatización y Scripts

#### Variables que se Actualizan Automáticamente
Las colecciones incluyen scripts que guardan automáticamente:

```javascript
// Ejemplo de script en el request de Login
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set('access_token', response.data.accessToken);
    pm.environment.set('refresh_token', response.data.refreshToken);
    pm.environment.set('user_id', response.data.user.id);
    console.log('Token guardado:', response.data.accessToken.substring(0, 20) + '...');
}
```

#### Ejecutar Colecciones Completas
Puedes ejecutar colecciones completas usando el **Collection Runner**:

1. **Haz clic derecho** en una colección
2. **Selecciona "Run collection"**
3. **Configura el orden** de ejecución
4. **Ejecuta automáticamente** todos los tests

### 7. Testing de Diferentes Roles

#### 👤 Usuario Normal (Participante)
```bash
Email: test@webfestival.com
Password: TestPassword123!
Permisos: Participar en concursos, subir medios, interacciones sociales
```

#### 👨‍💼 Administrador
```bash
Email: admin@webfestival.com
Password: AdminPassword123!
Permisos: Gestión completa de concursos, usuarios, configuración
```

#### 👨‍⚖️ Jurado
```bash
# Crear jurado usando el endpoint de admin
POST {{base_url}}/users/create-jurado
Permisos: Evaluar medios, asignar calificaciones
```

#### ✍️ Content Admin
```bash
# Crear content admin usando el endpoint de admin
POST {{base_url}}/users/create-content-admin
Permisos: Gestión de CMS, moderación de contenido
```

### 8. Validación de Respuestas

#### Códigos de Estado Esperados
- **200**: Operación exitosa
- **201**: Recurso creado exitosamente
- **400**: Error de validación (revisar datos enviados)
- **401**: No autenticado (verificar token)
- **403**: Sin permisos (verificar rol de usuario)
- **404**: Recurso no encontrado
- **409**: Conflicto (ej: email ya existe)
- **500**: Error interno del servidor

#### Estructura de Respuestas
```json
{
  "success": true,
  "data": {
    // Datos de la respuesta
  },
  "message": "Operación completada exitosamente"
}
```

#### Estructura de Errores
```json
{
  "success": false,
  "message": "Descripción del error",
  "errors": [
    // Detalles específicos del error
  ]
}
```

## 🔧 Configuración del Servidor

Asegúrate de que el servidor esté ejecutándose:

```bash
cd webfestival-api
npm run dev
```

El servidor estará disponible en: `http://localhost:3001`

## 📚 Documentación Adicional

- **Swagger UI**: http://localhost:3001/api-docs
- **API JSON**: http://localhost:3001/api-docs.json
- **Health Check**: http://localhost:3001/health

## 🧪 Ejemplos de Pruebas

### Flujo Completo de Concurso
1. **Autenticación**: Login como admin
2. **Crear Concurso**: POST /concursos
3. **Crear Categorías**: POST /concursos/{id}/categorias
4. **Login como Participante**: Cambiar token
5. **Inscribirse**: POST /concursos/inscripcion
6. **Subir Medio**: POST /media/contests/{id}/upload-url
7. **Procesar Subida**: POST /media/contests/{id}/process-upload

### Flujo de Evaluación
1. **Login como Jurado**: Obtener token de jurado
2. **Ver Asignaciones**: GET /jurado-asignaciones/mis-asignaciones
3. **Obtener Criterios**: GET /criterios/tipo/{tipoMedio}
4. **Calificar Medio**: POST /calificaciones
5. **Ver Progreso**: GET /calificaciones/progreso

### Flujo de CMS
1. **Login como Content Admin**: Obtener token
2. **Crear Contenido**: POST /cms/contenido
3. **Agregar Taxonomía**: POST /cms/categories
4. **Publicar**: PUT /cms/contenido/{id}/publish
5. **Ver Analytics**: GET /cms/analytics/overview

## 🔍 Tips de Uso

### Variables Dinámicas
Las colecciones incluyen variables que se actualizan automáticamente:
- `{{access_token}}`: Token de autenticación
- `{{base_url}}`: URL base de la API
- `{{user_id}}`: ID del usuario autenticado

### Orden de Ejecución
Para mejores resultados, ejecuta las colecciones en este orden:
1. Health (verificar servidor)
2. Auth (autenticación)
3. Concursos (crear estructura)
4. Media (subir contenido)
5. Criterios (configurar evaluación)
6. Interactions (probar funciones sociales)

### Datos de Prueba
Las colecciones incluyen datos de ejemplo realistas:
- Emails válidos
- Contraseñas seguras
- Contenido en español
- Metadatos apropiados

## 🧪 Casos de Uso Específicos

### 📸 Testing de Subida de Medios por Tipo

#### Fotografía
```http
POST {{base_url}}/media/contests/{{concurso_id}}/upload-url
{
  "titulo": "Atardecer en la Ciudad",
  "tipo_medio": "fotografia",
  "categoria_id": 1,
  "formato": "image/jpeg",
  "tamaño_archivo": 3145728
}
```

#### Video
```http
POST {{base_url}}/media/contests/{{concurso_id}}/upload-url
{
  "titulo": "Documental Urbano",
  "tipo_medio": "video",
  "categoria_id": 2,
  "formato": "video/mp4",
  "tamaño_archivo": 52428800
}
```

#### Audio
```http
POST {{base_url}}/media/contests/{{concurso_id}}/upload-url
{
  "titulo": "Sonidos de la Ciudad",
  "tipo_medio": "audio",
  "categoria_id": 3,
  "formato": "audio/mp3",
  "tamaño_archivo": 10485760
}
```

#### Corto de Cine
```http
POST {{base_url}}/media/contests/{{concurso_id}}/upload-url
{
  "titulo": "Vida Urbana - Cortometraje",
  "tipo_medio": "corto_cine",
  "categoria_id": 4,
  "formato": "video/mp4",
  "tamaño_archivo": 104857600
}
```

### 🎯 Testing de Criterios por Tipo de Medio

#### Obtener Criterios Específicos
```http
# Criterios para fotografía
GET {{base_url}}/criterios/tipo/fotografia

# Criterios para video
GET {{base_url}}/criterios/tipo/video

# Criterios para audio
GET {{base_url}}/criterios/tipo/audio

# Criterios para corto de cine
GET {{base_url}}/criterios/tipo/corto_cine

# Criterios universales
GET {{base_url}}/criterios/universales
```

### 💰 Testing de Suscripciones y Límites

#### Verificar Límites por Plan
```http
# Ver límites actuales
GET {{base_url}}/subscriptions/usage

# Verificar si puede participar en más concursos
GET {{base_url}}/subscriptions/can-participate

# Ver historial de uso
GET {{base_url}}/subscriptions/usage-history?period=30d
```

### 📊 Testing de Analytics y Métricas

#### CMS Analytics
```http
# Métricas generales
GET {{base_url}}/cms/analytics/overview?period=30d

# Análisis de engagement
GET {{base_url}}/cms/analytics/engagement?tipoContenido=blog_post

# Rendimiento de contenido
GET {{base_url}}/cms/analytics/content-performance?limit=10
```

#### Estadísticas de Interacciones
```http
# Estadísticas de moderación
GET {{base_url}}/interactions/stats?fechaInicio=2024-01-01&fechaFin=2024-12-31

# Métricas por tipo de contenido
GET {{base_url}}/interactions/stats?tipoContenido=blog_post&groupBy=estado
```

## 🔄 Flujos de Testing Automatizados

### Runner de Postman - Configuración Recomendada

#### 1. Flujo de Smoke Testing (Verificación Básica)
**Orden de ejecución:**
1. Health Check
2. API Info
3. Login Usuario
4. Obtener Perfil
5. Ver Concursos Activos
6. Logout

**Configuración del Runner:**
- **Iterations**: 1
- **Delay**: 500ms entre requests
- **Data**: No necesario
- **Environment**: WebFestival Development

#### 2. Flujo de Regresión Completa
**Orden de ejecución:**
1. Toda la colección Auth
2. Toda la colección Concursos
3. Toda la colección Media
4. Toda la colección Interactions
5. Health checks finales

**Configuración del Runner:**
- **Iterations**: 1
- **Delay**: 1000ms entre requests
- **Stop on error**: Habilitado
- **Save responses**: Habilitado

### Scripts de Validación Personalizados

#### Validar Estructura de Respuesta
```javascript
// Agregar en la pestaña "Tests" de cualquier request
pm.test("Response has correct structure", function () {
    const response = pm.response.json();
    pm.expect(response).to.have.property('success');
    pm.expect(response).to.have.property('data');
    pm.expect(response.success).to.be.a('boolean');
});

pm.test("Response time is acceptable", function () {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});
```

#### Validar Autenticación
```javascript
// Para requests que requieren autenticación
pm.test("User is authenticated", function () {
    const response = pm.response.json();
    if (pm.response.code === 401) {
        pm.expect.fail("Authentication failed - check token");
    }
    pm.expect(pm.response.code).to.be.oneOf([200, 201]);
});
```

## 🐛 Troubleshooting Detallado

### Problemas de Servidor

#### Error: "ECONNREFUSED" o "Network Error"
**Causa**: El servidor no está ejecutándose
**Solución**:
```bash
cd webfestival-api
npm run dev
# Verificar que aparezca: "🚀 WebFestival API running on port 3001"
```

#### Error: "Database connection failed"
**Causa**: PostgreSQL no está ejecutándose o mal configurado
**Solución**:
```bash
# Verificar PostgreSQL
pg_isready -h localhost -p 5432

# Verificar variables de entorno
cat webfestival-api/.env | grep DATABASE_URL

# Sincronizar base de datos
cd webfestival-api
npx prisma db push
```

### Problemas de Autenticación

#### Error 401: "Token expired"
**Solución Automática**:
```http
POST {{base_url}}/auth/refresh
{
  "refreshToken": "{{refresh_token}}"
}
```

#### Error 401: "Invalid token"
**Solución**: Hacer login nuevamente
```http
POST {{base_url}}/auth/login
{
  "email": "{{test_email}}",
  "password": "{{test_password}}"
}
```

#### Error 403: "Insufficient permissions"
**Causa**: El usuario no tiene el rol necesario
**Solución**: Usar el token correcto según el endpoint:
- Endpoints de admin: `{{admin_token}}`
- Endpoints de content admin: `{{content_admin_token}}`
- Endpoints de jurado: `{{jurado_token}}`

### Problemas de Datos

#### Error 404: "Concurso not found"
**Causa**: El ID del concurso no existe
**Solución**:
```http
# Crear un concurso primero (como admin)
POST {{base_url}}/concursos
Authorization: Bearer {{admin_token}}

# O usar un ID existente
GET {{base_url}}/concursos/activos
```

#### Error 400: "Validation failed"
**Causa**: Datos enviados no cumplen las validaciones
**Solución**: Revisar la documentación Swagger para ver los campos requeridos:
```
http://localhost:3001/api-docs
```

### Problemas de Medios

#### Error: "File too large"
**Causa**: El archivo excede el límite del tipo de medio
**Solución**: Verificar límites por tipo:
```http
GET {{base_url}}/media/validation-config
```

#### Error: "Invalid file format"
**Causa**: El formato no está permitido para el tipo de medio
**Solución**: Usar formatos válidos:
- **Fotografía**: JPEG, PNG, WebP
- **Video**: MP4, WebM, MOV
- **Audio**: MP3, WAV, FLAC
- **Corto de cine**: MP4, WebM, MOV

### Problemas de Suscripciones

#### Error: "Subscription limit exceeded"
**Causa**: El usuario ha alcanzado los límites de su plan
**Solución**:
```http
# Verificar límites actuales
GET {{base_url}}/subscriptions/usage

# Upgrade a un plan superior
POST {{base_url}}/subscriptions/upgrade
{
  "planId": "plan_premium"
}
```

## 📈 Monitoreo y Métricas

### Health Checks Periódicos
Ejecuta estos endpoints regularmente para monitorear el sistema:

```http
# Estado general
GET {{server_url}}/health

# Estado de base de datos
GET {{server_url}}/health/database

# Estado de Immich
GET {{server_url}}/health/immich

# Estado de email
GET {{server_url}}/health/email
```

### Métricas de Rendimiento
```http
# Estadísticas de base de datos
GET {{server_url}}/health/database/stats

# Información del sistema
GET {{base_url}}/
```

### Logs y Debugging
Para debugging avanzado, revisa los logs del servidor:
```bash
# En la terminal donde ejecutas npm run dev
# Los logs aparecerán automáticamente
```

## 🎓 Mejores Prácticas

### Organización de Testing
1. **Usa nombres descriptivos** para tus requests personalizados
2. **Agrupa requests relacionados** en carpetas
3. **Documenta casos de uso específicos** en las descripciones
4. **Mantén los datos de prueba consistentes**

### Gestión de Tokens
```javascript
// Script recomendado para manejar tokens expirados
pm.sendRequest({
    url: pm.environment.get('base_url') + '/auth/refresh',
    method: 'POST',
    header: {
        'Content-Type': 'application/json'
    },
    body: {
        mode: 'raw',
        raw: JSON.stringify({
            refreshToken: pm.environment.get('refresh_token')
        })
    }
}, function (err, response) {
    if (response.code === 200) {
        const newToken = response.json().data.accessToken;
        pm.environment.set('access_token', newToken);
        console.log('Token renovado automáticamente');
    }
});
```

### Validaciones Personalizadas
```javascript
// Validar que los medios tengan metadatos correctos
pm.test("Media has required metadata", function () {
    const response = pm.response.json();
    if (response.data && response.data.tipo_medio) {
        pm.expect(response.data).to.have.property('formato');
        pm.expect(response.data).to.have.property('tamano_archivo');
        pm.expect(response.data).to.have.property('fecha_subida');
    }
});

// Validar estructura de paginación
pm.test("Pagination structure is correct", function () {
    const response = pm.response.json();
    if (response.pagination) {
        pm.expect(response.pagination).to.have.property('page');
        pm.expect(response.pagination).to.have.property('limit');
        pm.expect(response.pagination).to.have.property('total');
        pm.expect(response.pagination).to.have.property('totalPages');
    }
});
```

## 📚 Recursos Adicionales

### Documentación Oficial
- **Swagger UI**: http://localhost:3001/api-docs
- **OpenAPI JSON**: http://localhost:3001/api-docs.json
- **Documentación de Implementación**: `../webfestival-api/docs/Ejecucion.md`

### Herramientas Complementarias
- **Newman** (CLI de Postman): Para ejecutar colecciones desde línea de comandos
- **Postman Monitors**: Para ejecutar tests automáticamente
- **Postman Flows**: Para crear flujos visuales de testing

### Comandos Útiles con Newman
```bash
# Instalar Newman
npm install -g newman

# Ejecutar una colección
newman run WebFestival-API-Auth.postman_collection.json \
  -e WebFestival-Development.postman_environment.json

# Ejecutar con reporte HTML
newman run WebFestival-API-Workspace.postman_collection.json \
  -e WebFestival-Development.postman_environment.json \
  -r html --reporter-html-export report.html

# Ejecutar solo la carpeta Quick Start
newman run WebFestival-API-Workspace.postman_collection.json \
  -e WebFestival-Development.postman_environment.json \
  --folder "🚀 Quick Start - Flujo Completo"
```

### Integración con CI/CD
```yaml
# Ejemplo para GitHub Actions
name: API Testing
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install Newman
        run: npm install -g newman
      - name: Run API Tests
        run: |
          newman run postman/WebFestival-API-Workspace.postman_collection.json \
            -e postman/WebFestival-Development.postman_environment.json \
            --reporters cli,json --reporter-json-export results.json
```

## 🔧 Personalización Avanzada

### Crear Variables Dinámicas
```javascript
// Generar email único para cada test
pm.environment.set('unique_email', 
  'test_' + Date.now() + '@webfestival.com');

// Generar ID de transacción único
pm.environment.set('transaction_id', 
  'txn_' + Math.random().toString(36).substr(2, 9));

// Fecha actual en formato ISO
pm.environment.set('current_date', 
  new Date().toISOString());
```

### Scripts de Limpieza
```javascript
// Limpiar datos de prueba después del testing
pm.sendRequest({
    url: pm.environment.get('base_url') + '/test/cleanup',
    method: 'POST',
    header: {
        'Authorization': 'Bearer ' + pm.environment.get('admin_token')
    }
}, function (err, response) {
    console.log('Datos de prueba limpiados');
});
```

### Configuración de Múltiples Entornos
```json
// Entorno de Staging
{
  "name": "WebFestival Staging",
  "values": [
    {
      "key": "base_url",
      "value": "https://api-staging.webfestival.com/api/v1"
    },
    {
      "key": "server_url",
      "value": "https://api-staging.webfestival.com"
    }
  ]
}

// Entorno de Producción
{
  "name": "WebFestival Production",
  "values": [
    {
      "key": "base_url",
      "value": "https://api.webfestival.com/api/v1"
    },
    {
      "key": "server_url",
      "value": "https://api.webfestival.com"
    }
  ]
}
```

## 📞 Soporte y Contribución

### Para Problemas o Preguntas
1. **Revisa la documentación Swagger**: http://localhost:3001/api-docs
2. **Consulta los logs del servidor** en la terminal donde ejecutas `npm run dev`
3. **Verifica la configuración** de variables de entorno en `.env`
4. **Revisa el archivo de implementación**: `../webfestival-api/docs/Ejecucion.md`
5. **Verifica el estado del servidor**: http://localhost:3001/health

### Reportar Issues
Si encuentras problemas con las colecciones:
1. **Describe el problema** específico
2. **Incluye el request** que está fallando
3. **Proporciona la respuesta** del servidor
4. **Menciona tu configuración** de entorno

### Contribuir Mejoras
Para agregar nuevos tests o mejorar existentes:
1. **Sigue la estructura** de naming existente
2. **Incluye validaciones** apropiadas
3. **Documenta casos de uso** específicos
4. **Prueba en múltiples escenarios**

## 📊 Estadísticas de las Colecciones

### Cobertura por Módulo
- **Autenticación**: 100% (7/7 endpoints)
- **Concursos**: 100% (8/8 endpoints)
- **Medios**: 100% (5/5 endpoints)
- **Criterios**: 100% (10/10 endpoints)
- **CMS**: 95% (19/20 endpoints)
- **Interacciones**: 100% (15/15 endpoints)
- **Suscripciones**: 100% (10/10 endpoints)
- **Notificaciones**: 100% (10/10 endpoints)
- **Newsletter**: 90% (7/8 endpoints)
- **Redes Sociales**: 100% (3/3 endpoints)
- **Health**: 100% (5/5 endpoints)

### Métricas de Testing
- **Total de requests**: 150+
- **Flujos automatizados**: 15+
- **Scripts de validación**: 25+
- **Variables dinámicas**: 20+
- **Casos de uso documentados**: 30+

---

**Última actualización**: 5 de octubre de 2025  
**Versión de la API**: 1.0.0  
**Total de endpoints cubiertos**: 80+  
**Mantenido por**: Equipo WebFestival  

**¡Happy Testing! 🚀**