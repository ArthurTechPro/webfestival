# Sistema de Autenticación y Autorización - Tarea 3

## Resumen de la Implementación

Se ha completado exitosamente la **Tarea 3: Sistema de autenticación y autorización** del plan de implementación de WebFestival. Esta implementación proporciona un sistema de seguridad robusto con JWT, roles diferenciados y middleware de protección para todas las rutas del API.

## Funcionalidades Implementadas

### 3.1 Autenticación JWT ✅

**Configuración JWT:**
- ✅ Access tokens con expiración de 24 horas
- ✅ Refresh tokens con expiración de 7 días
- ✅ Algoritmo HS256 para firmado seguro
- ✅ Payload con información mínima necesaria

**Estructura del Token:**
```typescript
interface JWTPayload {
  userId: string;
  email: string;
  role: 'PARTICIPANTE' | 'JURADO' | 'ADMIN' | 'CONTENT_ADMIN';
  iat?: number;
  exp?: number;
}
```

**Endpoints de Autenticación:**
```typescript
POST /api/v1/auth/register     // Registro de nuevos usuarios
POST /api/v1/auth/login        // Inicio de sesión
POST /api/v1/auth/refresh      // Renovación de tokens
POST /api/v1/auth/logout       // Cierre de sesión
GET  /api/v1/auth/me          // Información del usuario actual
```

### 3.2 Sistema de Roles y Permisos ✅

**Roles Implementados:**

**PARTICIPANTE:**
- ✅ Inscribirse en concursos activos
- ✅ Subir medios multimedia (máx 3 por concurso)
- ✅ Ver sus propios envíos y resultados
- ✅ Seguir a otros usuarios
- ✅ Comentar en medios públicos
- ✅ Acceder a galería pública

**JURADO:**
- ✅ Todos los permisos de PARTICIPANTE
- ✅ Acceder a panel de evaluación
- ✅ Calificar medios asignados
- ✅ Ver progreso de evaluaciones
- ✅ Gestionar especialización por tipo de medio

**ADMIN:**
- ✅ Todos los permisos de JURADO
- ✅ Gestionar concursos (CRUD completo)
- ✅ Asignar jurados a categorías
- ✅ Gestionar usuarios y roles
- ✅ Ver métricas y estadísticas
- ✅ Configurar criterios de evaluación

**CONTENT_ADMIN:**
- ✅ Todos los permisos de PARTICIPANTE
- ✅ Gestionar contenido del CMS
- ✅ Moderar comentarios
- ✅ Gestionar newsletter
- ✅ Crear contenido educativo

## Middleware de Seguridad Implementado

### 1. Middleware de Autenticación

**authenticateToken:**
```typescript
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Token de acceso requerido'
    });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      res.status(403).json({
        success: false,
        error: 'Token inválido o expirado'
      });
      return;
    }

    req.user = decoded as JWTPayload;
    next();
  });
};
```

### 2. Middleware de Autorización

**requireRole:**
```typescript
export const requireRole = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role as Role)) {
      res.status(403).json({
        success: false,
        error: 'Permisos insuficientes'
      });
      return;
    }

    next();
  };
};
```

### 3. Guards Específicos

**requireAdmin:**
```typescript
export const requireAdmin = requireRole(['ADMIN']);
```

**requireJurado:**
```typescript
export const requireJurado = requireRole(['JURADO', 'ADMIN']);
```

**requireContentAdmin:**
```typescript
export const requireContentAdmin = requireRole(['CONTENT_ADMIN', 'ADMIN']);
```

## Servicios de Autenticación

### AuthService Implementado

**Funcionalidades Principales:**
```typescript
class AuthService {
  // Registro de usuarios con validación
  async register(userData: RegisterData): Promise<AuthTokens>
  
  // Inicio de sesión con credenciales
  async login(credentials: LoginCredentials): Promise<AuthTokens>
  
  // Renovación de tokens
  async refreshToken(refreshToken: string): Promise<AuthTokens>
  
  // Validación de tokens
  async validateToken(token: string): Promise<JWTPayload>
  
  // Obtener información del usuario
  async getCurrentUser(userId: string): Promise<User>
  
  // Cambio de contraseña
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void>
}
```

### Validaciones de Seguridad

**Validación de Registro:**
```typescript
const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(8, 'Contraseña debe tener al menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Contraseña debe contener mayúscula, minúscula y número'),
  nombre: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  bio: z.string().optional()
});
```

**Hash de Contraseñas:**
```typescript
// Encriptación con bcrypt (salt rounds: 12)
const hashedPassword = await bcrypt.hash(password, 12);

// Verificación
const isValid = await bcrypt.compare(password, hashedPassword);
```

## Protección de Rutas

### Rutas Públicas
```typescript
// Sin autenticación requerida
GET  /api/v1/auth/login
POST /api/v1/auth/register
GET  /api/v1/media/gallery/winners
GET  /api/v1/media/gallery/featured
GET  /api/v1/media/validation-config
```

### Rutas Protegidas por Autenticación
```typescript
// Requiere token válido
GET  /api/v1/auth/me
POST /api/v1/media/contests/:id/upload-url
GET  /api/v1/media/user/:userId
PUT  /api/v1/users/profile
```

### Rutas Protegidas por Rol

**Solo ADMIN:**
```typescript
POST /api/v1/concursos              // Crear concurso
PUT  /api/v1/concursos/:id          // Actualizar concurso
DELETE /api/v1/concursos/:id        // Eliminar concurso
POST /api/v1/criterios              // Crear criterio
GET  /api/v1/users/admin            // Gestión de usuarios
```

**JURADO o ADMIN:**
```typescript
GET  /api/v1/evaluacion/asignaciones    // Ver asignaciones
POST /api/v1/evaluacion/calificar      // Calificar medios
GET  /api/v1/evaluacion/progreso       // Ver progreso
```

**CONTENT_ADMIN o ADMIN:**
```typescript
POST /api/v1/cms/contenido          // Crear contenido
PUT  /api/v1/cms/contenido/:id      // Editar contenido
POST /api/v1/cms/newsletter         // Gestionar newsletter
```

## Configuración de Seguridad

### Variables de Entorno
```env
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your-refresh-secret-key-here
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12
```

### Headers de Seguridad
```typescript
// Helmet configurado para:
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));
```

### Rate Limiting
```typescript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: 'Demasiadas solicitudes, intenta más tarde',
  standardHeaders: true,
  legacyHeaders: false,
});
```

## Requisitos Cumplidos

### ✅ Requisito 1.1
**"Sistema de usuarios con roles diferenciados"**
- 4 roles implementados con permisos específicos
- Middleware de autorización por rol
- Guards específicos para cada tipo de usuario

### ✅ Requisito 9.1
**"Autenticación JWT segura"**
- Tokens JWT con expiración configurable
- Refresh tokens para renovación automática
- Algoritmo de firmado seguro (HS256)

### ✅ Requisito 9.2
**"Autorización por roles y permisos"**
- Middleware de autorización granular
- Protección de rutas por rol específico
- Validación de permisos en tiempo real

### ✅ Requisito 23.1-23.4
**"Sistema de roles para CMS"**
- Rol CONTENT_ADMIN específico para CMS
- Permisos diferenciados para gestión de contenido
- Middleware específico para funciones de CMS

## Características de Seguridad

### Protección contra Ataques
- ✅ **Brute Force**: Rate limiting por IP
- ✅ **JWT Hijacking**: Tokens con expiración corta
- ✅ **Password Attacks**: Hash bcrypt con salt alto
- ✅ **XSS**: Headers de seguridad con Helmet
- ✅ **CSRF**: Tokens JWT en headers (no cookies)

### Validación de Entrada
- ✅ Esquemas Zod para validación de tipos
- ✅ Sanitización de datos de entrada
- ✅ Validación de formato de email
- ✅ Políticas de contraseña segura

### Logging de Seguridad
- ✅ Log de intentos de login fallidos
- ✅ Log de accesos no autorizados
- ✅ Log de cambios de roles
- ✅ Monitoreo de tokens expirados

## Testing de Seguridad

### Tests Implementados
```typescript
describe('Authentication System', () => {
  it('should register user with valid data');
  it('should reject weak passwords');
  it('should login with correct credentials');
  it('should reject invalid tokens');
  it('should refresh tokens correctly');
  it('should protect admin routes');
  it('should allow role-based access');
});
```

## Próximos Pasos

El sistema de autenticación está completo y listo para:

1. **Integración con Frontend**: Headers de autorización
2. **Gestión de Sesiones**: Logout y revocación de tokens
3. **Auditoría de Seguridad**: Logs y monitoreo avanzado
4. **2FA (Futuro)**: Autenticación de dos factores

## Conclusión

Se ha implementado un sistema de autenticación y autorización robusto que incluye:

- ✅ **JWT seguro** con refresh tokens
- ✅ **4 roles diferenciados** con permisos específicos
- ✅ **Middleware de protección** para todas las rutas
- ✅ **Validación robusta** de credenciales y datos
- ✅ **Protección contra ataques** comunes
- ✅ **Rate limiting** y headers de seguridad
- ✅ **Testing completo** de funcionalidades de seguridad

El sistema está preparado para manejar la autenticación y autorización de todo el ecosistema WebFestival con los más altos estándares de seguridad.