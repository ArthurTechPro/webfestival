# 🔧 Soluciones para Errores Comunes de TypeScript en Middleware

## ❌ **Problema Común: "Type 'Response' is not assignable to type 'void'"**

Este error ocurre cuando usas `return res.status().json()` en funciones de middleware que tienen tipo de retorno `Promise<void>`.

### 🚨 **Error Típico:**
```typescript
async function middleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (someCondition) {
    return res.status(400).json({ error: 'Bad request' }); // ❌ ERROR
  }
  next();
}
```

**Error de TypeScript:**
```
Type 'Response<any, Record<string, any>, number>' is not assignable to type 'void'.
```

---

## ✅ **SOLUCIONES**

### **Solución 1: Return sin valor (RECOMENDADA)**
```typescript
async function middleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (someCondition) {
    res.status(400).json({ error: 'Bad request' });
    return; // ✅ CORRECTO: return sin valor
  }
  next();
}
```

### **Solución 2: Void operator**
```typescript
async function middleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (someCondition) {
    return void res.status(400).json({ error: 'Bad request' }); // ✅ CORRECTO
  }
  next();
}
```

### **Solución 3: Cambiar tipo de retorno**
```typescript
async function middleware(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
  if (someCondition) {
    return res.status(400).json({ error: 'Bad request' }); // ✅ CORRECTO
  }
  next();
}
```

### **Solución 4: Usar any (NO RECOMENDADA)**
```typescript
async function middleware(req: any, res: any, next: any): Promise<void> {
  if (someCondition) {
    return res.status(400).json({ error: 'Bad request' }); // ✅ Funciona pero pierde tipado
  }
  next();
}
```

---

## 🎯 **MEJORES PRÁCTICAS**

### ✅ **Patrón Recomendado para Middleware de Validación**
```typescript
import { Request, Response, NextFunction } from 'express';

async function validateData(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // ✅ Funciones de flecha para helpers
    const validateEmail = (email: string) => {
      return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const sendError = (message: string, errors?: string[]) => {
      res.status(400).json({
        success: false,
        message,
        ...(errors && { errors })
      });
    };

    // Validaciones
    const { email, password } = req.body;
    const errors: string[] = [];

    if (!validateEmail(email)) {
      errors.push('Email inválido');
    }

    if (!password || password.length < 6) {
      errors.push('Contraseña muy corta');
    }

    if (errors.length > 0) {
      sendError('Datos inválidos', errors);
      return; // ✅ CORRECTO: return sin valor
    }

    // Si todo está bien, continuar
    next();
  } catch (error) {
    next(error);
  }
}
```

### ✅ **Patrón para Middleware de Autenticación**
```typescript
async function authenticateToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // ✅ Helper functions
    const extractToken = (authHeader: string | undefined) => {
      return authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    };

    const sendUnauthorized = (message: string) => {
      res.status(401).json({
        success: false,
        message,
        timestamp: new Date().toISOString()
      });
    };

    const token = extractToken(req.headers.authorization);

    if (!token) {
      sendUnauthorized('Token requerido');
      return; // ✅ CORRECTO
    }

    // Verificar token...
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
    return; // ✅ CORRECTO
  }
}
```

### ✅ **Patrón para Error Handlers**
```typescript
async function errorHandler(
  error: any, 
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> {
  // ✅ Helpers con funciones de flecha
  const getErrorType = (err: any) => {
    if (err.name === 'ValidationError') return 'VALIDATION';
    if (err.status) return 'HTTP';
    return 'UNKNOWN';
  };

  const formatError = (err: any, type: string) => ({
    success: false,
    error: {
      type,
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    },
    timestamp: new Date().toISOString()
  });

  try {
    const errorType = getErrorType(error);
    const response = formatError(error, errorType);
    const statusCode = error.status || 500;
    
    res.status(statusCode).json(response);
    // ✅ No necesita return explícito al final
  } catch (handlerError) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
    // ✅ No necesita return explícito al final
  }
}
```

---

## 🔧 **CASOS ESPECÍFICOS CORREGIDOS**

### **Antes (Con errores):**
```typescript
// ❌ PROBLEMÁTICO
async function validateComplexData(req, res, next): Promise<void> {
  if (errors.length > 0) {
    return res.status(400).json({ // ❌ Error de TypeScript
      success: false,
      message: 'Datos inválidos',
      errors
    });
  }
  next();
}
```

### **Después (Corregido):**
```typescript
// ✅ CORRECTO
async function validateComplexData(req: any, res: any, next: any): Promise<void> {
  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: 'Datos inválidos',
      errors
    });
    return; // ✅ SOLUCIÓN: return sin valor
  }
  next();
}
```

---

## 🎯 **ESTRATEGIA HÍBRIDA APLICADA**

### ✅ **Middleware Híbrido Correcto**
```typescript
export class HybridMiddleware {
  // ✅ FUNCIONES DE FLECHA para helpers
  private extractToken = (authHeader: string | undefined) => {
    return authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  };

  private sendError = (res: Response, status: number, message: string) => {
    res.status(status).json({
      success: false,
      message,
      timestamp: new Date().toISOString()
    });
  };

  // ✅ FUNCIÓN TRADICIONAL para método principal
  async authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = this.extractToken(req.headers.authorization);

      if (!token) {
        this.sendError(res, 401, 'Token requerido');
        return; // ✅ CORRECTO
      }

      // Lógica de autenticación...
      req.user = decoded;
      next();
    } catch (error) {
      this.sendError(res, 401, 'Token inválido');
      return; // ✅ CORRECTO
    }
  }
}
```

---

## 📋 **CHECKLIST DE CORRECCIÓN**

### ✅ **Para Middleware Existente:**
- [ ] Identificar todos los `return res.status().json()`
- [ ] Cambiar a `res.status().json()` seguido de `return;`
- [ ] Verificar que el tipo de retorno sea `Promise<void>`
- [ ] Probar que el build compile sin errores

### ✅ **Para Nuevo Middleware:**
- [ ] Usar `res.status().json()` sin return del resultado
- [ ] Usar `return;` sin valor después de enviar respuesta
- [ ] Aplicar estrategia híbrida (helpers como funciones de flecha)
- [ ] Tipar correctamente los parámetros

### ✅ **Para Error Handlers:**
- [ ] No necesitan return explícito al final
- [ ] Usar helpers con funciones de flecha
- [ ] Manejar casos de error en el propio handler

---

## 🚨 **ERRORES COMUNES A EVITAR**

### ❌ **NO Hacer:**
```typescript
// ❌ Return del resultado de res.json()
return res.status(400).json({ error: 'Bad request' });

// ❌ Tipo de retorno incorrecto
async function middleware(): Promise<Response> { }

// ❌ No manejar el caso de error
if (error) {
  res.status(400).json({ error });
  next(); // ❌ MALO: continúa después de enviar respuesta
}
```

### ✅ **SÍ Hacer:**
```typescript
// ✅ Enviar respuesta y return sin valor
res.status(400).json({ error: 'Bad request' });
return;

// ✅ Tipo de retorno correcto
async function middleware(): Promise<void> { }

// ✅ Manejar correctamente los errores
if (error) {
  res.status(400).json({ error });
  return; // ✅ BUENO: termina la ejecución
}
```

---

## 🎉 **RESULTADO FINAL**

Siguiendo estos patrones, tu middleware será:
- ✅ **Libre de errores de TypeScript**
- ✅ **Más legible** con helpers organizados
- ✅ **Más mantenible** con separación clara
- ✅ **Más eficiente** con la estrategia híbrida

---

**📝 Documento actualizado**: 6 de octubre de 2025  
**🎯 Propósito**: Solucionar errores comunes de TypeScript en middleware  
**👥 Audiencia**: Desarrolladores del equipo WebFestival