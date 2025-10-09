// 🎯 EJEMPLO REAL: CÓMO IMPLEMENTAR HÍBRIDO EN WEBFESTIVAL

import { Request, Response, NextFunction } from 'express';
import { Router } from 'express';

// ✅ Definir tipos localmente para el ejemplo
interface ApiResponse {
  success: boolean;
  data?: any;
  message: string;
}

interface ApiError extends Error {
  status?: number;
}

interface JWTPayload {
  id: string;
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

interface User {
  id: string;
  email: string;
  nombre: string;
  role: string;
  picture_url?: string;
  bio?: string;
}

// ✅ Extender Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

// ✅ Mock del authService para el ejemplo
const authService = {
  login: async (credentials: any) => ({ 
    user: { 
      id: '1', 
      email: credentials.email, 
      nombre: 'Usuario Test', 
      role: 'PARTICIPANTE' 
    }, 
    tokens: { 
      accessToken: 'mock_access_token', 
      refreshToken: 'mock_refresh_token' 
    } 
  }),
  register: async (userData: any) => ({ 
    user: { 
      id: '2', 
      email: userData.email, 
      nombre: userData.nombre, 
      role: 'PARTICIPANTE' 
    }, 
    tokens: { 
      accessToken: 'mock_access_token', 
      refreshToken: 'mock_refresh_token' 
    } 
  }),
  refreshToken: async (token: string) => ({ 
    accessToken: 'new_mock_access_token', 
    refreshToken: 'new_mock_refresh_token' 
  }),
  verifyAccessToken: async (token: string): Promise<JWTPayload> => ({ 
    id: '1',
    userId: '1', 
    email: 'test@example.com',
    role: 'PARTICIPANTE'
  })
};

export class ModernAuthController {
  // ✅ FUNCIÓN TRADICIONAL para método principal (necesita binding)
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // ✅ FUNCIONES DE FLECHA para validaciones internas
      const validateCredentials = (email: string, password: string) => {
        const errors: string[] = [];
        
        if (!email || !email.includes('@')) {
          errors.push('Email inválido');
        }
        
        if (!password || password.length < 6) {
          errors.push('Contraseña muy corta');
        }
        
        return errors;
      };

      // ✅ FUNCIÓN DE FLECHA para sanitización
      const sanitizeInput = (data: any) => ({
        email: data.email?.toLowerCase().trim(),
        password: data.password?.trim()
      });

      // ✅ FUNCIÓN DE FLECHA para formatear respuesta
      const formatLoginResponse = (user: any, tokens: any) => ({
        user: {
          id: user.id,
          email: user.email,
          nombre: user.nombre,
          role: user.role
        },
        tokens,
        loginTime: new Date().toISOString()
      });

      const { email, password } = sanitizeInput(req.body);
      const validationErrors = validateCredentials(email, password);

      if (validationErrors.length > 0) {
        const error = new Error('Datos inválidos') as ApiError;
        error.status = 400;
        (error as any).details = validationErrors;
        throw error;
      }

      const result = await authService.login({ email, password });
      const responseData = formatLoginResponse(result.user, result.tokens);

      const response: ApiResponse = {
        success: true,
        data: responseData,
        message: 'Login exitoso'
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // ✅ FUNCIÓN TRADICIONAL para método que puede ser heredado
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // ✅ FUNCIONES DE FLECHA para transformaciones
      const processRegistrationData = (data: any) => ({
        email: data.email?.toLowerCase().trim(),
        password: data.password?.trim(),
        nombre: data.nombre?.trim(),
        bio: data.bio?.trim() || null
      });

      const checkPasswordStrength = (password: string) => {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        return {
          isStrong: hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
          score: [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length
        };
      };

      const userData = processRegistrationData(req.body);
      const passwordCheck = checkPasswordStrength(userData.password);

      if (passwordCheck.score < 3) {
        const error = new Error('Contraseña muy débil') as ApiError;
        error.status = 400;
        throw error;
      }

      const result = await authService.register(userData);

      res.status(201).json({
        success: true,
        data: result,
        message: 'Registro exitoso'
      });
    } catch (error) {
      next(error);
    }
  }

  // ✅ PROPIEDAD CON FUNCIÓN DE FLECHA para callback/handler
  private handleTokenRefresh = async (refreshToken: string) => {
    try {
      return await authService.refreshToken(refreshToken);
    } catch (error) {
      throw new Error('Token de refresh inválido');
    }
  };

  // ✅ FUNCIÓN TRADICIONAL que usa el handler
  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        const error = new Error('Refresh token requerido') as ApiError;
        error.status = 400;
        throw error;
      }

      const tokens = await this.handleTokenRefresh(refreshToken);

      res.status(200).json({
        success: true,
        data: { tokens },
        message: 'Tokens renovados exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
}

// 🎯 EN LAS RUTAS - MISMO PATRÓN DE BINDING
const router = Router();
const authController = new ModernAuthController();

// ✅ Binding explícito para funciones tradicionales
router.post('/login', authController.login.bind(authController));
router.post('/register', authController.register.bind(authController));
router.post('/refresh', authController.refreshToken.bind(authController));

// 🎯 MIDDLEWARE HÍBRIDO
export const hybridAuthMiddleware = {
  // ✅ FUNCIÓN DE FLECHA para middleware simple
  extractToken: (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    
    if (token) {
      (req as any).token = token;
    }
    
    next();
  },

  // ✅ FUNCIÓN TRADICIONAL para middleware complejo
  async validateToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // ✅ FUNCIÓN DE FLECHA para validación interna
      const isTokenValid = (token: string) => {
        return token && token.length > 10 && token.split('.').length === 3;
      };

      const token = (req as any).token;

      if (!token || !isTokenValid(token)) {
        res.status(401).json({
          success: false,
          message: 'Token inválido'
        });
        return; // ✅ CORRECCIÓN: return sin valor
      }

      // Validar token con el servicio...
      const decoded = await authService.verifyAccessToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  }
};

export default ModernAuthController;