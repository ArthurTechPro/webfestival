# Sistema de Interacciones Unificadas - WebFestival

## 🎯 Descripción General

El Sistema de Interacciones Unificadas es un componente central de la plataforma WebFestival que permite gestionar de forma centralizada todas las interacciones de los usuarios con cualquier tipo de contenido en la plataforma.

## ✨ Características Principales

### 🔥 Likes Unificados
- ✅ Sistema de likes que funciona para cualquier tipo de contenido
- ✅ Prevención de likes duplicados por usuario
- ✅ Actualización automática de métricas
- ✅ API REST completa con paginación

### 💬 Comentarios Universales
- ✅ Comentarios con soporte para anidamiento (1 nivel)
- ✅ Sistema de moderación automática
- ✅ Validación de contenido (máx. 1000 caracteres)
- ✅ Edición y eliminación con permisos

### 🚨 Reportes Centralizados
- ✅ Sistema unificado de reportes para contenido y comentarios
- ✅ Múltiples razones de reporte predefinidas
- ✅ Prevención de reportes duplicados
- ✅ Seguimiento de estado y resolución

### 🛡️ Moderación Avanzada
- ✅ Moderación individual de comentarios
- ✅ Moderación masiva (hasta 50 elementos)
- ✅ Control granular de permisos por roles
- ✅ Historial de acciones de moderación

### 📊 Estadísticas Completas
- ✅ Métricas detalladas de todas las interacciones
- ✅ Filtros por tipo de contenido y fechas
- ✅ Agrupación por estados y categorías
- ✅ Dashboard para administradores

## 🏗️ Arquitectura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Base de Datos │
│                 │    │                 │    │                 │
│ React/Next.js   │◄──►│ Node.js/Express │◄──►│   PostgreSQL    │
│                 │    │                 │    │                 │
│ - Likes UI      │    │ - Validación    │    │ - Likes         │
│ - Comments UI   │    │ - Autenticación │    │ - Comentarios   │
│ - Reports UI    │    │ - Autorización  │    │ - Reportes      │
│ - Moderation UI │    │ - Lógica Negocio│    │ - Métricas      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+
- PostgreSQL 14+
- npm o yarn

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-org/webfestival-api.git
cd webfestival-api

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Ejecutar migraciones
npx prisma migrate dev

# Iniciar servidor de desarrollo
npm run dev
```

### Configuración Básica

```env
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/webfestival"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="1h"
NODE_ENV="development"
```

## 📚 Documentación

### Documentos Disponibles

- **[API Reference](./interactions-api.md)** - Documentación completa de endpoints
- **[Deployment Guide](./interactions-deployment.md)** - Guía de despliegue en producción
- **[Testing Guide](../tests/interactions.test.ts)** - Tests y ejemplos de uso

### Endpoints Principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/v1/interactions/like` | Dar like a contenido |
| `DELETE` | `/api/v1/interactions/like` | Quitar like |
| `POST` | `/api/v1/interactions/comments` | Crear comentario |
| `GET` | `/api/v1/interactions/comments` | Obtener comentarios |
| `POST` | `/api/v1/interactions/reports` | Crear reporte |
| `GET` | `/api/v1/interactions/stats` | Estadísticas (admin) |

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Ejecutar solo tests de interacciones
npm test -- interactions.test.ts

# Ejecutar tests con coverage
npm run test:coverage
```

### Ejemplo de Test

```javascript
describe('POST /api/v1/interactions/like', () => {
  it('debería crear un like exitosamente', async () => {
    const response = await request(app)
      .post('/api/v1/interactions/like')
      .set('Authorization', `Bearer ${token}`)
      .send({
        contenido_id: 1,
        tipo_contenido: 'contenido'
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
```

## 🔧 Configuración Avanzada

### Rate Limiting

```javascript
// Configuración por defecto
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana
  message: 'Demasiadas solicitudes, intenta más tarde'
});
```

### Validación de Datos

```javascript
// Ejemplo de schema con Zod
const CreateCommentSchema = z.object({
  contenido_id: z.number().int().positive(),
  tipo_contenido: z.string().min(1),
  contenido_texto: z.string().min(1).max(1000),
  parent_id: z.number().int().positive().optional()
});
```

## 🛠️ Desarrollo

### Estructura de Archivos

```
src/
├── controllers/
│   └── interactions.controller.ts    # Controladores HTTP
├── services/
│   └── interactions.service.ts       # Lógica de negocio
├── schemas/
│   └── interactions.schemas.ts       # Validación con Zod
├── routes/
│   └── interactions.routes.ts        # Definición de rutas
└── middleware/
    └── auth.middleware.ts            # Autenticación JWT
```

### Flujo de Desarrollo

1. **Crear rama**: `git checkout -b feature/nueva-funcionalidad`
2. **Desarrollar**: Implementar cambios con tests
3. **Validar**: `npm test && npm run lint`
4. **Commit**: `git commit -m "feat: nueva funcionalidad"`
5. **Push**: `git push origin feature/nueva-funcionalidad`
6. **PR**: Crear Pull Request para revisión

### Estándares de Código

- **TypeScript**: Tipado estricto obligatorio
- **ESLint**: Configuración estándar del proyecto
- **Prettier**: Formateo automático de código
- **Conventional Commits**: Formato estándar de commits

## 🔒 Seguridad

### Autenticación

```javascript
// Middleware de autenticación JWT
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
};
```

### Autorización por Roles

```javascript
// Validación de permisos de moderador
const validateModeratorAccess = async (userId) => {
  const user = await prisma.usuario.findUnique({
    where: { id: userId },
    select: { role: true }
  });
  
  return user?.role === 'ADMIN' || user?.role === 'CONTENT_ADMIN';
};
```

## 📈 Monitoreo y Métricas

### Métricas Clave

- **Likes por minuto**: Actividad de usuarios
- **Comentarios pendientes**: Carga de moderación
- **Reportes activos**: Problemas de contenido
- **Tiempo de respuesta**: Performance de API

### Alertas Configuradas

- 🚨 **Error rate > 5%**: Problemas críticos
- ⚠️ **Comentarios pendientes > 100**: Sobrecarga de moderación
- 📊 **Response time > 2s**: Problemas de performance

## 🤝 Contribución

### Cómo Contribuir

1. **Fork** el repositorio
2. **Crear rama** para tu feature
3. **Implementar** cambios con tests
4. **Documentar** cambios realizados
5. **Crear PR** con descripción detallada

### Reportar Bugs

Usa el template de issues para reportar bugs:

```markdown
**Descripción del Bug**
Descripción clara y concisa del problema.

**Pasos para Reproducir**
1. Ir a '...'
2. Hacer clic en '....'
3. Ver error

**Comportamiento Esperado**
Descripción de lo que esperabas que pasara.

**Screenshots**
Si aplica, agregar screenshots.
```

## 📋 Roadmap

### Versión Actual (v1.0)
- ✅ Sistema básico de likes
- ✅ Comentarios con moderación
- ✅ Reportes centralizados
- ✅ Estadísticas básicas

### Próximas Versiones

#### v1.1 (Q2 2024)
- 🔄 Notificaciones en tiempo real
- 🔄 Moderación automática con IA
- 🔄 Métricas avanzadas

#### v1.2 (Q3 2024)
- 🔄 Comentarios multimedia
- 🔄 Sistema de reputación
- 🔄 API GraphQL

#### v2.0 (Q4 2024)
- 🔄 Microservicios
- 🔄 Escalabilidad horizontal
- 🔄 Machine Learning para moderación

## 📞 Soporte

### Canales de Soporte

- **Issues**: [GitHub Issues](https://github.com/tu-org/webfestival-api/issues)
- **Documentación**: [Docs](./interactions-api.md)
- **Email**: soporte@webfestival.com

### FAQ

**P: ¿Cómo puedo reportar un bug?**
R: Usa GitHub Issues con el template de bug report.

**P: ¿Puedo contribuir al proyecto?**
R: ¡Sí! Lee la guía de contribución arriba.

**P: ¿Hay límites de rate limiting?**
R: Sí, 100 requests por 15 minutos por IP por defecto.

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver [LICENSE](../LICENSE) para más detalles.

---

**Desarrollado con ❤️ por el equipo WebFestival**

*Última actualización: Enero 2024*