# Sistema de Roles y Permisos - WebFestival API

## Visión General

El sistema de roles y permisos de WebFestival está diseñado para proporcionar un control granular de acceso a las diferentes funcionalidades de la plataforma. Implementa un modelo basado en roles con permisos específicos que permite una gestión flexible y segura de los recursos.

## Arquitectura del Sistema

### Componentes Principales

1. **Middleware de Autenticación** (`auth.ts`)
2. **Guards de Rutas** (`routeGuards.middleware.ts`)
3. **Middleware de CONTENT_ADMIN** (`contentAdmin.middleware.ts`)
4. **Utilidades de Roles** (`roleUtils.ts`)

## Roles del Sistema

### 1. PARTICIPANTE
**Descripción**: Usuarios que participan en concursos multimedia
**Permisos**:
- `contest:view` - Ver concursos
- `contest:participate` - Participar en concursos
- `media:upload` - Subir medios multimedia
- `media:view_own` - Ver sus propios medios
- `profile:edit_own` - Editar su propio perfil
- `comment:create` - Crear comentarios
- `follow:manage` - Gestionar seguimientos

### 2. JURADO
**Descripción**: Usuarios especializados que evalúan concursos
**Permisos**:
- `contest:view` - Ver concursos
- `contest:evaluate` - Evaluar concursos
- `media:view_assigned` - Ver medios asignados para evaluación
- `evaluation:create` - Crear evaluaciones
- `evaluation:edit_own` - Editar sus propias evaluaciones
- `profile:edit_own` - Editar su propio perfil
- `specialization:manage_own` - Gestionar sus especializaciones

### 3. CONTENT_ADMIN
**Descripción**: Administradores de contenido y CMS
**Permisos**:
- `content:create` - Crear contenido
- `content:edit` - Editar contenido
- `content:publish` - Publicar contenido
- `content:delete` - Eliminar contenido
- `cms:manage` - Gestionar CMS
- `blog:manage` - Gestionar blog
- `newsletter:manage` - Gestionar newsletter
- `media:upload_cms` - Subir medios al CMS
- `seo:manage` - Gestionar SEO
- `taxonomy:manage` - Gestionar taxonomías

### 4. ADMIN
**Descripción**: Administradores del sistema con acceso completo
**Permisos**: Todos los permisos de otros roles más:
- `contest:create` - Crear concursos
- `contest:edit` - Editar concursos
- `contest:delete` - Eliminar concursos
- `contest:manage_all` - Gestionar todos los concursos
- `user:manage` - Gestionar usuarios
- `role:assign` - Asignar roles
- `jury:assign` - Asignar jurados
- `criteria:manage` - Gestionar criterios
- `analytics:view` - Ver analytics
- `system:configure` - Configurar sistema
- `subscription:manage` - Gestionar suscripciones

## Middlewares de Autenticación

### authenticateToken
Verifica la validez del token JWT en las cabeceras de la petición.

```typescript
router.get('/profile', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});
```

### authenticateAndVerifyUser
Verifica el token JWT y además valida que el usuario existe en la base de datos.

```typescript
router.get('/profile/detailed', authenticateAndVerifyUser, (req, res) => {
  res.json({ user: req.user });
});
```

## Middlewares de Autorización

### requireRole
Requiere uno o más roles específicos.

```typescript
// Solo administradores
router.post('/contests', authenticateToken, requireRole('ADMIN'), handler);

// Múltiples roles permitidos
router.get('/evaluate', authenticateToken, requireRole(['JURADO', 'ADMIN']), handler);
```

### requirePermission
Requiere un permiso específico.

```typescript
router.get('/admin/users', 
  authenticateToken, 
  requirePermission('user:manage'), 
  handler
);
```

### requireAllPermissions
Requiere que el usuario tenga todos los permisos especificados.

```typescript
router.post('/admin/system/config',
  authenticateToken,
  requireAllPermissions(['system:configure', 'analytics:view']),
  handler
);
```

### requireAnyPermission
Requiere que el usuario tenga al menos uno de los permisos especificados.

```typescript
router.get('/content/manage',
  authenticateToken,
  requireAnyPermission(['content:create', 'content:edit', 'cms:manage']),
  handler
);
```

### requireOwnershipOrRole
Permite acceso si el usuario es propietario del recurso o tiene un rol específico.

```typescript
router.put('/users/:userId/profile',
  authenticateToken,
  requireOwnershipOrRole(['ADMIN'], 'userId'),
  handler
);
```

## Guards Específicos por Funcionalidad

### ContestRouteGuards
Guards específicos para rutas de concursos:
- `createContest` - Crear concursos
- `editContest` - Editar concursos
- `deleteContest` - Eliminar concursos
- `participateInContest` - Participar en concursos
- `evaluateContest` - Evaluar concursos

### UserRouteGuards
Guards específicos para rutas de usuarios:
- `manageUsers` - Gestionar usuarios
- `assignRoles` - Asignar roles
- `editOwnProfile` - Editar perfil propio
- `ownerOrAdmin` - Propietario o administrador

### MediaRouteGuards
Guards específicos para rutas de medios:
- `uploadMedia` - Subir medios
- `uploadCMSMedia` - Subir medios al CMS
- `viewOwnMedia` - Ver medios propios
- `viewAssignedMedia` - Ver medios asignados

### EvaluationRouteGuards
Guards específicos para rutas de evaluación:
- `createEvaluation` - Crear evaluaciones
- `editOwnEvaluation` - Editar evaluaciones propias
- `manageCriteria` - Gestionar criterios
- `assignJury` - Asignar jurados

### ContentRouteGuards
Guards específicos para rutas de contenido:
- `createContent` - Crear contenido
- `editContent` - Editar contenido
- `publishContent` - Publicar contenido
- `deleteContent` - Eliminar contenido
- `manageCMS` - Gestionar CMS
- `manageBlog` - Gestionar blog
- `manageSEO` - Gestionar SEO
- `manageNewsletter` - Gestionar newsletter

## Sistema de Permisos para CONTENT_ADMIN

### Permisos por Tipo de Contenido

#### Página Estática
- `create`: `content:create`, `cms:manage`
- `edit`: `content:edit`, `cms:manage`
- `publish`: `content:publish`, `cms:manage`
- `delete`: `content:delete`, `cms:manage`
- `seo_manage`: `seo:manage`

#### Blog Post
- `create`: `content:create`, `blog:manage`
- `edit`: `content:edit`, `blog:manage`
- `publish`: `content:publish`, `blog:manage`
- `delete`: `content:delete`, `blog:manage`
- `moderate`: `blog:manage`
- `seo_manage`: `seo:manage`

#### Newsletter
- `create`: `newsletter:manage`
- `edit`: `newsletter:manage`
- `publish`: `newsletter:manage`
- `delete`: `newsletter:manage`

### Middlewares Específicos

#### requireContentAdminPermission
Valida permisos específicos para un tipo de contenido y acción.

```typescript
router.post('/blog/posts',
  authenticateToken,
  requireContentAdminPermission('blog_post', 'create'),
  handler
);
```

#### requireContentOwnershipOrAdmin
Verifica que el usuario es propietario del contenido o tiene permisos administrativos.

```typescript
router.put('/content/:contentId',
  authenticateToken,
  requireContentOwnershipOrAdmin('authorId'),
  handler
);
```

## Guards Compuestos

### createCompositeGuard
Ejecuta múltiples guards en secuencia (todos deben pasar).

```typescript
router.post('/admin/contests/special',
  authenticateToken,
  createCompositeGuard(
    requireAdmin,
    ContestRouteGuards.createContest,
    SystemRouteGuards.configureSystem
  ),
  handler
);
```

### createOrGuard
Permite acceso si al menos uno de los guards pasa.

```typescript
router.get('/content/preview/:contentId',
  authenticateToken,
  createOrGuard(
    ContentRouteGuards.editContent,
    requireContentOwnershipOrAdmin('authorId'),
    requireAdmin
  ),
  handler
);
```

## Utilidades de Roles

### RoleUtils
Clase con métodos estáticos para verificación de roles y permisos:

```typescript
// Verificar permisos
RoleUtils.hasPermission('ADMIN', 'user:manage'); // true

// Verificar roles administrativos
RoleUtils.isAdministrativeRole('CONTENT_ADMIN'); // true

// Verificar jerarquía
RoleUtils.hasEqualOrHigherAuthority('ADMIN', 'PARTICIPANTE'); // true

// Obtener tipos de contenido gestionables
RoleUtils.getManageableContentTypes('CONTENT_ADMIN');

// Validar transiciones de roles
RoleUtils.isRoleTransitionAllowed('PARTICIPANTE', 'JURADO', 'ADMIN');
```

## Decoradores

### @RequirePermission
Decorador para métodos que requieren permisos específicos.

```typescript
class MyController {
  @RequirePermission('user:manage')
  manageUsers(req: Request, res: Response) {
    // Lógica del método
  }
}
```

### @RequireRole
Decorador para métodos que requieren roles específicos.

```typescript
class MyController {
  @RequireRole(['ADMIN', 'CONTENT_ADMIN'])
  adminFunction(req: Request, res: Response) {
    // Lógica del método
  }
}
```

## Ejemplos de Uso

### Ruta Básica con Autenticación
```typescript
router.get('/profile', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});
```

### Ruta con Rol Específico
```typescript
router.post('/contests', 
  authenticateToken, 
  requireAdmin, 
  (req, res) => {
    res.json({ message: 'Concurso creado' });
  }
);
```

### Ruta con Permisos Específicos
```typescript
router.get('/admin/users',
  authenticateToken,
  requirePermission('user:manage'),
  (req, res) => {
    res.json({ users: [] });
  }
);
```

### Ruta con Ownership
```typescript
router.put('/users/:userId/profile',
  authenticateToken,
  requireOwnershipOrRole(['ADMIN'], 'userId'),
  (req, res) => {
    res.json({ message: 'Perfil actualizado' });
  }
);
```

### Ruta con Guards Específicos
```typescript
router.post('/blog/posts',
  authenticateToken,
  requireContentAdminPermission('blog_post', 'create'),
  (req, res) => {
    res.json({ message: 'Blog post creado' });
  }
);
```

## Manejo de Errores

El sistema devuelve errores estructurados con códigos específicos:

### Errores de Autenticación
- `TOKEN_REQUIRED` (401): Token no proporcionado
- `TOKEN_EXPIRED` (401): Token expirado
- `TOKEN_INVALID` (403): Token inválido
- `USER_NOT_FOUND` (401): Usuario no encontrado

### Errores de Autorización
- `AUTH_REQUIRED` (401): Autenticación requerida
- `INSUFFICIENT_PERMISSIONS` (403): Permisos insuficientes
- `PERMISSION_DENIED` (403): Permiso específico denegado
- `OWNERSHIP_REQUIRED` (403): Ownership requerido
- `CONTENT_ADMIN_REQUIRED` (403): Rol CONTENT_ADMIN requerido

## Mejores Prácticas

1. **Principio de Menor Privilegio**: Asignar solo los permisos mínimos necesarios
2. **Separación de Responsabilidades**: Usar roles específicos para diferentes funciones
3. **Validación en Capas**: Combinar autenticación, autorización y ownership
4. **Logging de Seguridad**: Registrar intentos de acceso no autorizados
5. **Revisión Regular**: Auditar permisos y roles periódicamente

## Testing

El sistema incluye tests completos que cubren:
- Configuración de permisos por rol
- Middlewares de autenticación
- Middlewares de autorización
- Guards específicos
- Utilidades de roles
- Casos edge y manejo de errores

Para ejecutar los tests:
```bash
npm test -- roleSystem.test.ts
```