import { Request, Response, NextFunction } from 'express';
import { authService } from '@/services/auth.service';
import { 
  loginSchema, 
  registerSchema, 
  refreshTokenSchema, 
  changePasswordSchema,
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  ChangePasswordRequest
} from '@/schemas/auth.schemas';
import { ApiResponse, ApiError } from '@/types';
import { ZodError } from 'zod';

export class AuthController {
  /**
   * Endpoint de login
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validar datos de entrada
      const validatedData = loginSchema.parse(req.body) as LoginRequest;

      // Autenticar usuario
      const result = await authService.login(validatedData);

      const response: ApiResponse = {
        success: true,
        data: {
          user: result.user,
          tokens: result.tokens
        },
        message: 'Login exitoso'
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Endpoint de registro
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validar datos de entrada
      const validatedData = registerSchema.parse(req.body) as RegisterRequest;

      // Registrar usuario
      const result = await authService.register(validatedData);

      const response: ApiResponse = {
        success: true,
        data: {
          user: result.user,
          tokens: result.tokens
        },
        message: 'Registro exitoso'
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Endpoint para renovar tokens
   */
  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validar datos de entrada
      const validatedData = refreshTokenSchema.parse(req.body) as RefreshTokenRequest;

      // Renovar tokens
      const tokens = await authService.refreshToken(validatedData.refreshToken);

      const response: ApiResponse = {
        success: true,
        data: { tokens },
        message: 'Tokens renovados exitosamente'
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Endpoint para obtener información del usuario actual
   */
  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        const error = new Error('Usuario no autenticado') as ApiError;
        error.status = 401;
        throw error;
      }

      // Obtener información actualizada del usuario
      const user = await authService.getUserById(req.user.userId);

      if (!user) {
        const error = new Error('Usuario no encontrado') as ApiError;
        error.status = 404;
        throw error;
      }

      const response: ApiResponse = {
        success: true,
        data: { user },
        message: 'Información del usuario obtenida exitosamente'
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Endpoint para cambiar contraseña
   */
  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        const error = new Error('Usuario no autenticado') as ApiError;
        error.status = 401;
        throw error;
      }

      // Validar datos de entrada
      const validatedData = changePasswordSchema.parse(req.body) as ChangePasswordRequest;

      // Cambiar contraseña
      await authService.changePassword(
        req.user.userId,
        validatedData.currentPassword,
        validatedData.newPassword
      );

      const response: ApiResponse = {
        success: true,
        message: 'Contraseña cambiada exitosamente'
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Endpoint de logout (invalidar token del lado del cliente)
   */
  async logout(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // En una implementación JWT stateless, el logout se maneja del lado del cliente
      // eliminando los tokens del almacenamiento local/cookies
      // Aquí podríamos implementar una blacklist de tokens si fuera necesario

      const response: ApiResponse = {
        success: true,
        message: 'Logout exitoso. Por favor elimina los tokens del almacenamiento local.'
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Endpoint para validar token
   */
  async validateToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        const error = new Error('Token no proporcionado') as ApiError;
        error.status = 400;
        throw error;
      }

      const isValid = authService.isTokenValid(token);

      const response: ApiResponse = {
        success: true,
        data: { 
          valid: isValid,
          user: isValid ? req.user : null
        },
        message: isValid ? 'Token válido' : 'Token inválido'
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

// Función para manejar errores de validación de Zod
export const handleValidationError = (error: unknown, next: NextFunction): void => {
  if (error instanceof ZodError) {
    const validationError = new Error('Datos de entrada inválidos') as ApiError;
    validationError.status = 400;
    validationError.code = 'VALIDATION_ERROR';
    
    // Agregar detalles de los errores de validación
    (validationError as any).details = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }));
    
    next(validationError);
    return;
  }
  next(error);
};

export const authController = new AuthController();