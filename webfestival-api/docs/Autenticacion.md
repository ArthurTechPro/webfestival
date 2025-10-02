# Sistema de Autenticación JWT - WebFestival API

## Resumen de Implementación

El sistema de autenticación JWT ha sido implementado exitosamente con todas las funcionalidades requeridas para la tarea 3.1.

## Componentes Implementados

### 1. Middleware de Autenticación (`src/middleware/auth.ts`)

- ✅ **authenticateToken**: Middleware para validar tokens JWT
- ✅ **requireRole**: Middleware para autorización por roles
- ✅ **requireAdmin**: Middleware específico para administradores
- ✅ **requireContentAdmin**: Middleware para administradores de contenido
- ✅ **requireJurado**: Middleware para jurados

### 2. Servicio de Autenticación (`src/services/auth.service.ts`)

- ✅ **generateTokens**: Genera access token y refresh token
- ✅ **verifyAccessToken**: Verifica y decodifica access tokens
- ✅ **verifyRefreshToken**: Verifica y decodifica refresh tokens
- ✅ **hashPassword**: Hashea contraseñas con bcrypt (12 rounds)
- ✅ **comparePassword**: Compara contraseñas hasheadas
- ✅ **login**: Autentica usuarios con email/contraseña
- ✅ **register**: Registra nuevos usuarios
- ✅ **refreshToken**: Renueva tokens usando refresh token
- ✅ **getUserById**: Obtiene información de usuario por ID
- ✅ **changePassword**: Cambia contraseña de usuario
- ✅ **isTokenValid**: Valida tokens sin lanzar excepciones

### 3. Controlador de Autenticación (`src/controllers/auth.controller.ts`)

- ✅ **POST /login**: Endpoint de autenticación
- ✅ **POST /register**: Endpoint de registro
- ✅ **POST /refresh**: Endpoint para renovar tokens
- ✅ **GET /me**: Endpoint para obtener información del usuario actual
- ✅ **PUT /change-password**: Endpoint para cambiar contraseña
- ✅ **POST /logout**: Endpoint de logout (stateless)
- ✅ **GET /validate**: Endpoint para validar tokens

### 4. Esquemas de Validación (`src/schemas/auth.schemas.ts`)

- ✅ **loginSchema**: Validación para login (email, password)
- ✅ **registerSchema**: Validación para registro (email, password, nombre, bio)
- ✅ **refreshTokenSchema**: Validación para refresh token
- ✅ **changePasswordSchema**: Validación para cambio de contraseña
- ✅ **forgotPasswordSchema**: Validación para recuperación de contraseña
- ✅ **resetPasswordSchema**: Validación para reset de contraseña

### 5. Rutas de Autenticación (`src/routes/auth.routes.ts`)

- ✅ **POST /api/v1/auth/login**: Autenticar usuario
- ✅ **POST /api/v1/auth/register**: Registrar nuevo usuario
- ✅ **POST /api/v1/auth/refresh**: Renovar tokens
- ✅ **GET /api/v1/auth/me**: Obtener usuario actual
- ✅ **PUT /api/v1/auth/change-password**: Cambiar contraseña
- ✅ **POST /api/v1/auth/logout**: Cerrar sesión
- ✅ **GET /api/v1/auth/validate**: Validar token

### 6. Middleware de Validación (`src/middleware/validation.ts`)

- ✅ **validateRequest**: Valida el body de las requests
- ✅ **validateQuery**: Valida query parameters
- ✅ **validateParams**: Valida path parameters

## Configuración de Variables de Entorno

```env
# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"
JWT_REFRESH_EXPIRES_IN="30d"
```

## Verificación de Funcionamiento

### Script de Verificación
```bash
npm run verify-auth
```

Este script verifica:
- ✅ Variables de entorno configuradas
- ✅ Generación de tokens
- ✅ Verificación de access tokens
- ✅ Verificación de refresh tokens
- ✅ Hash de contraseñas
- ✅ Comparación de contraseñas
- ✅ Validación de tokens

### Resultados de Verificación
```
🔐 Verificando configuración de autenticación...

📋 Variables de entorno:
✅ JWT_SECRET: ***
✅ JWT_EXPIRES_IN: 7d
✅ JWT_REFRESH_SECRET: ***
✅ JWT_REFRESH_EXPIRES_IN: 30d

🧪 Probando funcionalidades de autenticación...

1. Generando tokens...
✅ Tokens generados exitosamente

2. Verificando access token...
✅ Access token verificado exitosamente

3. Verificando refresh token...
✅ Refresh token verificado exitosamente

4. Probando hash de contraseña...
✅ Contraseña hasheada exitosamente

5. Comparando contraseñas...
✅ Contraseña correcta: true
✅ Contraseña incorrecta: false

6. Validando token...
✅ Token válido: true
✅ Token inválido: false

🎉 Todas las pruebas de autenticación pasaron exitosamente!
```

## Características de Seguridad

### Tokens JWT
- **Access Token**: Expira en 7 días (configurable)
- **Refresh Token**: Expira en 30 días (configurable)
- **Algoritmo**: HS256 (HMAC SHA-256)
- **Secrets**: Separados para access y refresh tokens

### Contraseñas
- **Hash**: bcrypt con 12 rounds de salt
- **Validación**: Mínimo 6 caracteres, debe incluir mayúscula, minúscula y número
- **Comparación**: Segura usando bcrypt.compare()

### Autorización
- **Roles**: PARTICIPANTE, JURADO, ADMIN, CONTENT_ADMIN
- **Middleware**: Protección por roles en rutas específicas
- **Validación**: Verificación de tokens en cada request protegida

## Integración con la Aplicación

### Rutas Protegidas
```typescript
// Ejemplo de uso en rutas
router.get('/protected', authenticateToken, handler);
router.get('/admin-only', authenticateToken, requireAdmin, handler);
router.get('/jury-only', authenticateToken, requireJurado, handler);
```

### Manejo de Errores
- **401 Unauthorized**: Token inválido o expirado
- **403 Forbidden**: Permisos insuficientes
- **400 Bad Request**: Datos de entrada inválidos
- **409 Conflict**: Email ya registrado

## Cumplimiento de Requisitos

### Requisito 1.1 ✅
- Sistema de registro y gestión de perfiles implementado
- Roles asignados automáticamente (PARTICIPANTE por defecto)
- Validación de datos de entrada

### Requisito 9.1 ✅
- Tokens JWT implementados correctamente
- Manejo de expiración y renovación
- Secrets configurables por entorno

### Requisito 9.2 ✅
- Sistema de roles y permisos implementado
- Middleware de autorización funcional
- Protección de rutas por rol

## Estado de la Tarea

**✅ COMPLETADA** - La tarea 3.1 "Implementar autenticación JWT" ha sido implementada exitosamente con todas las funcionalidades requeridas:

1. ✅ Middleware de autenticación con JWT
2. ✅ Endpoints de login, registro y refresh token
3. ✅ Configuración de validación de tokens y manejo de expiración
4. ✅ Cumplimiento de requisitos 1.1, 9.1, 9.2

El sistema está listo para ser utilizado por otros componentes de la aplicación.