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

---

**Versión:** 1.0.0  
**Última actualización:** 2024
