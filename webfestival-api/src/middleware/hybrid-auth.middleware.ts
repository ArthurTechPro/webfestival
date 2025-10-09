// 🎯 EJEMPLO: MIDDLEWARE HÍBRIDO PARA AUTENTICACIÓN
// Demuestra cómo combinar funciones tradicionales y de flecha en middleware

import { Request, Response, NextFunction } from 'express';
import { authService } from '@/services/auth.service';

export class HybridAuthMiddleware {
  // ✅ FUNCIONES DE FLECHA para utilidades y helpers
  private extractToken = (authHeader: string | undefined): string | null => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  };

  private validateTokenFormat = (token: string): boolean => {
    return !!(token && token.length > 10 && token.split('.').length === 3);
  };

  private logAuthAttempt = (success: boolean, userId?: string, ip?: string) => {
    const timestamp = new Date().toISOString();
    const status = success ? 'SUCCESS' : 'FAILED';
    const user = userId || 'unknown';
    const clientIp = ip || 'unknown';
    
    console.log(`[AUTH_MIDDLEWARE] ${timestamp} - ${status} - User: ${user} - IP: ${clientIp}`);
  };

  // Removido - no se usa actualmente
  // private createAuthError = (message: string, status: number = 401): ApiError => {
  //   const error = new Error(message) as ApiError;
  //   error.status = status;
  //   return error;
  // };

  private sendUnauthorizedResponse = (res: Response, message: string) => {
    res.status(401).json({
      success: false,
      message,
      timestamp: new Date().toISOString()
    });
  };

  // ✅ FUNCIÓN TRADICIONAL para middleware principal
  // Razón: Middleware que puede ser heredado y extendido
  async authenticateToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers['authorization'];
      const token = this.extractToken(authHeader);

      if (!token) {
        this.logAuthAttempt(false, undefined, req.ip);
        return this.sendUnauthorizedResponse(res, 'Token de acceso requerido');
      }

      if (!this.validateTokenFormat(token)) {
        this.logAuthAttempt(false, undefined, req.ip);
        return this.sendUnauthorizedResponse(res, 'Formato de token inválido');
      }

      // Verificar token con el servicio
      const decoded = authService.verifyAccessToken(token);
      req.user = decoded;

      this.logAuthAttempt(true, decoded.userId, req.ip);
      next();
    } catch (error) {
      this.logAuthAttempt(false, undefined, req.ip);
      
      if (error instanceof Error) {
        return this.sendUnauthorizedResponse(res, error.message);
      }
      
      next(error);
    }
  }

  // ✅ FUNCIÓN TRADICIONAL para middleware de roles
  // Razón: Middleware complejo que puede ser extendido
  requireRole(allowedRoles: string[]) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          return this.sendUnauthorizedResponse(res, 'Usuario no autenticado');
        }

        // ✅ FUNCIÓN DE FLECHA para validar roles
        const hasValidRole = (userRole: string, allowed: string[]) => {
          return allowed.includes(userRole);
        };

        // ✅ FUNCIÓN DE FLECHA para formatear roles permitidos
        const formatAllowedRoles = (roles: string[]) => {
          return roles.join(', ');
        };

        if (!hasValidRole(req.user.role, allowedRoles)) {
          const allowedRolesStr = formatAllowedRoles(allowedRoles);
          
          res.status(403).json({
            success: false,
            message: `Acceso denegado. Roles permitidos: ${allowedRolesStr}`,
            userRole: req.user.role,
            timestamp: new Date().toISOString()
          });
          return;
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  // ✅ FUNCIÓN TRADICIONAL para middleware opcional
  // Razón: Middleware que puede ser sobrescrito
  async optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers['authorization'];
      const token = this.extractToken(authHeader);

      if (token && this.validateTokenFormat(token)) {
        try {
          const decoded = authService.verifyAccessToken(token);
          req.user = decoded;
          this.logAuthAttempt(true, decoded.userId, req.ip);
        } catch (error) {
          // Token inválido, pero continuamos sin autenticación
          this.logAuthAttempt(false, undefined, req.ip);
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  }
}

// 🎯 MIDDLEWARE FUNCIONAL HÍBRIDO (alternativa más simple)
export const hybridAuthFunctions = {
  // ✅ FUNCIÓN DE FLECHA para middleware simple de logging
  logRequest: (req: Request, _res: Response, next: NextFunction) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.url;
    const ip = req.ip;
    
    console.log(`[REQUEST] ${timestamp} - ${method} ${url} - IP: ${ip}`);
    next();
  },

  // ✅ FUNCIÓN DE FLECHA para middleware de rate limiting simple
  simpleRateLimit: (maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) => {
    const requests = new Map<string, { count: number; resetTime: number }>();
    
    return (req: Request, res: Response, next: NextFunction) => {
      const clientIp = req.ip || 'unknown';
      const now = Date.now();
      
      // ✅ FUNCIÓN DE FLECHA para limpiar registros expirados
      const cleanExpiredRecords = () => {
        for (const [ip, record] of requests.entries()) {
          if (now > record.resetTime) {
            requests.delete(ip);
          }
        }
      };

      // ✅ FUNCIÓN DE FLECHA para verificar límite
      const isRateLimited = (ip: string) => {
        const record = requests.get(ip);
        if (!record) {
          requests.set(ip, { count: 1, resetTime: now + windowMs });
          return false;
        }

        if (now > record.resetTime) {
          requests.set(ip, { count: 1, resetTime: now + windowMs });
          return false;
        }

        record.count++;
        return record.count > maxRequests;
      };

      cleanExpiredRecords();

      if (isRateLimited(clientIp)) {
        res.status(429).json({
          success: false,
          message: 'Demasiadas solicitudes. Intenta de nuevo más tarde.',
          retryAfter: Math.ceil((requests.get(clientIp)?.resetTime || now) - now) / 1000
        });
        return;
      }

      next();
    };
  },

  // ✅ FUNCIÓN TRADICIONAL para middleware complejo de validación
  async validateApiKey(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // ✅ FUNCIONES DE FLECHA para helpers internos
      const extractApiKey = (req: Request) => {
        return req.headers['x-api-key'] as string || 
               req.query['api_key'] as string ||
               null;
      };

      const validateKeyFormat = (key: string) => {
        return key && key.length >= 32 && /^[a-zA-Z0-9]+$/.test(key);
      };

      const isValidApiKey = async (key: string) => {
        // Aquí iría la lógica de validación real
        // Por ahora, simulamos una validación
        return key.startsWith('wf_') && key.length === 35;
      };

      const apiKey = extractApiKey(req);

      if (!apiKey) {
        res.status(401).json({
          success: false,
          message: 'API Key requerida'
        });
        return;
      }

      if (!validateKeyFormat(apiKey)) {
        res.status(401).json({
          success: false,
          message: 'Formato de API Key inválido'
        });
        return;
      }

      const isValid = await isValidApiKey(apiKey);
      if (!isValid) {
        res.status(401).json({
          success: false,
          message: 'API Key inválida'
        });
        return;
      }

      // Agregar información de la API key al request
      (req as any).apiKey = {
        key: apiKey,
        validatedAt: new Date().toISOString()
      };

      next();
    } catch (error) {
      next(error);
    }
  }
};

// Instancia singleton para usar en las rutas
export const hybridAuthMiddleware = new HybridAuthMiddleware();

// Exportar funciones individuales para flexibilidad
export const {
  logRequest,
  simpleRateLimit,
  validateApiKey
} = hybridAuthFunctions;