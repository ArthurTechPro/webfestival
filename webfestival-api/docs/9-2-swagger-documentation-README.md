# Documentación Swagger/OpenAPI 3.0 - WebFestival API

## Descripción General

Se ha implementado una documentación completa de la API WebFestival utilizando Swagger/OpenAPI 3.0. La documentación incluye todos los endpoints principales con ejemplos detallados, esquemas de datos y información de autenticación.

## Características Implementadas

### ✅ Configuración Base de Swagger
- **OpenAPI 3.0** configurado con información completa del proyecto
- **Servidores múltiples** (desarrollo y producción)
- **Esquemas de seguridad** con JWT Bearer Authentication
- **Tags organizados** por funcionalidad (Autenticación, Concursos, Medios, etc.)

### ✅ Esquemas de Datos Completos
- **Esquemas principales**: User, Concurso, Categoria, Medio, Criterio, Calificacion
- **Esquemas de respuesta**: ApiResponse, ErrorResponse, PaginatedResponse
- **Validaciones**: Tipos de datos, formatos, restricciones y ejemplos

### ✅ Documentación de Endpoints

#### Autenticación (7 endpoints documentados)
- `POST /auth/login` - Autenticación con email/contraseña
- `POST /auth/register` - Registro de nuevos usuarios
- `POST /auth/refresh` - Renovación de tokens JWT
- `GET /auth/me` - Información del usuario autenticado
- `PUT /auth/change-password` - Cambio de contraseña
- `POST /auth/logout` - Cierre de sesión
- `GET /auth/validate` - Validación de tokens

#### Concursos (8 endpoints documentados)
- `GET /concursos/activos` - Concursos disponibles para inscripción
- `GET /concursos/finalizados` - Concursos con resultados
- `GET /concursos/{id}` - Detalles de concurso específico
- `POST /concursos/inscripcion` - Inscripción a concursos
- `DELETE /concursos/inscripcion/{concursoId}` - Cancelar inscripción
- `GET /concursos/mis-inscripciones` - Inscripciones del usuario
- `GET /concursos/{concursoId}/verificar-inscripcion` - Verificar estado
- Endpoints administrativos (CRUD completo)

#### Medios Multimedia (3 endpoints clave documentados)
- `GET /media/validation-config` - Configuración de validación
- `POST /media/contests/{concursoId}/upload-url` - Generar URL de subida
- `POST /media/contests/{concursoId}/process-upload` - Procesar subida
- `GET /media/gallery/winners` - Galería de ganadores
- `GET /media/gallery/featured` - Medios destacados

#### Criterios de Evaluación (10 endpoints documentados)
- `GET /criterios` - Todos los criterios
- `GET /criterios/universales` - Criterios universales
- `GET /criterios/tipo/{tipoMedio}` - Criterios por tipo de medio
- `GET /criterios/validar/{tipoMedio}` - Validar criterios
- `GET /criterios/estadisticas` - Estadísticas de uso
- `GET /criterios/{id}` - Criterio específico
- Endpoints administrativos (CRUD y reordenamiento)

### ✅ Características Avanzadas
- **Autenticación JWT** integrada en la documentación
- **Ejemplos detallados** para cada endpoint
- **Códigos de error** específicos con descripciones
- **Filtros y paginación** documentados
- **Validaciones de entrada** con esquemas Zod
- **Respuestas estructuradas** con formato consistente

## Acceso a la Documentación

### URLs de Acceso
```
Documentación Interactiva: http://localhost:3001/api-docs
Especificación JSON:      http://localhost:3001/api-docs.json
```

### Configuración del Servidor
La documentación se sirve automáticamente cuando el servidor está ejecutándose:

```typescript
// Swagger UI con configuración personalizada
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'WebFestival API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'none',
    filter: true,
    tryItOutEnabled: true
  }
}));
```

## Estructura de la Documentación

### Información del Proyecto
```yaml
info:
  title: WebFestival API
  version: 1.0.0
  description: API completa para la plataforma WebFestival - Sistema de concursos multimedia
  contact:
    name: WebFestival Team
    email: api@webfestival.com
```

### Esquemas de Seguridad
```yaml
securitySchemes:
  bearerAuth:
    type: http
    scheme: bearer
    bearerFormat: JWT
    description: Token JWT para autenticación. Formato: Bearer <token>
```

### Tags Organizacionales
- **Autenticación**: Gestión de sesiones y usuarios
- **Concursos**: Gestión de concursos y categorías
- **Medios**: Gestión de archivos multimedia
- **Criterios**: Sistema de evaluación dinámico
- **Calificaciones**: Sistema de puntuación
- **Jurados**: Gestión de jurados especializados
- **CMS**: Sistema de gestión de contenido
- **Interacciones**: Likes, comentarios y reportes
- **Newsletter**: Contenido educativo y suscripciones
- **Suscripciones**: Sistema de monetización
- **Facturación**: Gestión de pagos
- **Notificaciones**: Sistema automático
- **Redes Sociales**: Integración social
- **Sistema**: Endpoints de salud y estado

## Ejemplos de Uso

### Autenticación
```bash
# Login
curl -X POST "http://localhost:3001/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "miContraseña123"
  }'

# Usar token en requests autenticados
curl -X GET "http://localhost:3001/api/v1/auth/me" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Subida de Medios
```bash
# 1. Generar URL de subida
curl -X POST "http://localhost:3001/api/v1/media/contests/1/upload-url" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Mi fotografía",
    "tipo_medio": "fotografia",
    "categoria_id": 1,
    "formato": "image/jpeg",
    "tamaño_archivo": 2048576
  }'

# 2. Procesar subida completada
curl -X POST "http://localhost:3001/api/v1/media/contests/1/process-upload" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "uploadId": "upload_123",
    "immichAssetId": "asset_456"
  }'
```

### Gestión de Criterios
```bash
# Obtener criterios por tipo de medio
curl -X GET "http://localhost:3001/api/v1/criterios/tipo/fotografia"

# Crear nuevo criterio (Admin)
curl -X POST "http://localhost:3001/api/v1/criterios" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Composición",
    "descripcion": "Evaluación de la composición y encuadre",
    "tipo_medio": "fotografia",
    "peso": 1.5,
    "orden": 1
  }'
```

## Validación y Testing

### Validación de Esquemas
Todos los endpoints incluyen validación con Zod schemas:
- **Entrada**: Validación de parámetros y body
- **Salida**: Esquemas de respuesta consistentes
- **Errores**: Códigos HTTP específicos con mensajes descriptivos

### Testing con Swagger UI
La interfaz interactiva permite:
- **Probar endpoints** directamente desde el navegador
- **Autenticación persistente** con tokens JWT
- **Visualizar respuestas** en tiempo real
- **Validar esquemas** automáticamente

## Mantenimiento y Extensión

### Agregar Nuevos Endpoints
1. **Documentar en el archivo de rutas** con comentarios `@swagger`
2. **Definir esquemas** en `/src/config/swagger.ts` si es necesario
3. **Incluir ejemplos** y códigos de error apropiados
4. **Probar** en la interfaz Swagger UI

### Actualizar Esquemas
Los esquemas se mantienen en `/src/config/swagger.ts` y se actualizan automáticamente cuando se reinicia el servidor.

### Versionado
La documentación sigue el versionado de la API (`/api/v1`) y se puede extender para futuras versiones.

## Beneficios Implementados

### Para Desarrolladores
- **Documentación siempre actualizada** con el código
- **Testing interactivo** sin herramientas externas
- **Esquemas de datos claros** para integración
- **Ejemplos funcionales** para cada endpoint

### Para el Equipo
- **Comunicación clara** de la API
- **Onboarding rápido** de nuevos desarrolladores
- **Validación automática** de contratos de API
- **Debugging facilitado** con ejemplos en vivo

### Para Integraciones
- **Especificación OpenAPI 3.0** estándar
- **Generación automática** de clientes SDK
- **Validación de contratos** entre frontend y backend
- **Documentación exportable** en múltiples formatos

## Próximos Pasos

1. **Completar documentación** de endpoints restantes (CMS, Interacciones, etc.)
2. **Agregar ejemplos** de flujos completos de usuario
3. **Implementar testing automático** basado en la especificación
4. **Generar clientes SDK** para React y otros frameworks
5. **Configurar CI/CD** para validación automática de la documentación

La documentación Swagger está completamente funcional y lista para uso en desarrollo y producción.