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
  // ✅ FUNCIONES DE FLECHA para helpers y utilidades internas
  private sanitizeLoginInput = (data: any) => ({
    email: data.email?.toLowerCase().trim(),
    password: data.password?.trim()
  });

  private validateCredentials = (email: string, password: string) => {
    const errors: string[] = [];
    
    if (!email || !email.includes('@')) {
      errors.push('Email inválido');
    }
    
    if (!password || password.length < 6) {
      errors.push('Contraseña debe tener al menos 6 caracteres');
    }
    
    return errors;
  };

  private formatAuthResponse = (user: any, tokens: any, message: string) => ({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        role: user.role,
        ...(user.picture_url && { picture_url: user.picture_url }),
        ...(user.bio && { bio: user.bio })
      },
      tokens,
      loginTime: new Date().toISOString()
    },
    message
  });

  private logAuthAttempt = (email: string, success: boolean, ip?: string) => {
    console.log(`[AUTH] ${success ? 'SUCCESS' : 'FAILED'} login attempt for ${email} from ${ip || 'unknown'}`);
  };

  /**
   * ✅ FUNCIÓN TRADICIONAL para endpoint principal de login
   * Razón: Método principal que necesita binding correcto y puede ser heredado
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sanitizedData = this.sanitizeLoginInput(req.body);
      const validationErrors = this.validateCredentials(sanitizedData.email, sanitizedData.password);

      if (validationErrors.length > 0) {
        this.logAuthAttempt(sanitizedData.email, false, req.ip);
        const error = new Error('Datos de entrada inválidos') as ApiError;
        error.status = 400;
        (error as any).details = validationErrors;
        throw error;
      }

      // Validar con schema para seguridad adicional
      const validatedData = loginSchema.parse(sanitizedData) as LoginRequest;

      // Autenticar usuario
      const result = await authService.login(validatedData);
      
      this.logAuthAttempt(validatedData.email, true, req.ip);
      const response = this.formatAuthResponse(result.user, result.tokens, 'Login exitoso');

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // ✅ FUNCIONES DE FLECHA para helpers de registro
  private sanitizeRegistrationData = (data: any) => ({
    email: data.email?.toLowerCase().trim(),
    password: data.password?.trim(),
    nombre: data.nombre?.trim(),
    bio: data.bio?.trim() || null
  });

  private validatePasswordStrength = (password: string) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const score = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;
    
    return {
      isStrong: score >= 3,
      score,
      suggestions: [
        !hasUpperCase && 'Agregar mayúsculas',
        !hasLowerCase && 'Agregar minúsculas', 
        !hasNumbers && 'Agregar números',
        !hasSpecialChar && 'Agregar caracteres especiales'
      ].filter(Boolean)
    };
  };

  private validateRegistrationData = (data: any) => {
    const errors: string[] = [];
    
    if (!data.email || !data.email.includes('@')) {
      errors.push('Email inválido');
    }
    
    if (!data.nombre || data.nombre.length < 2) {
      errors.push('Nombre debe tener al menos 2 caracteres');
    }
    
    const passwordCheck = this.validatePasswordStrength(data.password);
    if (!passwordCheck.isStrong) {
      errors.push(`Contraseña muy débil. Sugerencias: ${passwordCheck.suggestions.join(', ')}`);
    }
    
    return errors;
  };

  /**
   * ✅ FUNCIÓN TRADICIONAL para endpoint principal de registro
   * Razón: Método principal que necesita binding correcto y puede ser heredado
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sanitizedData = this.sanitizeRegistrationData(req.body);
      const validationErrors = this.validateRegistrationData(sanitizedData);

      if (validationErrors.length > 0) {
        const error = new Error('Datos de entrada inválidos') as ApiError;
        error.status = 400;
        (error as any).details = validationErrors;
        throw error;
      }
      // Validar con schema para seguridad adicional
      const validatedData = registerSchema.parse(sanitizedData) as RegisterRequest;
      
      const sanitized = {
        ...validatedData,
        bio: validatedData.bio ?? undefined, // convierte null en undefined
      };
      // Registrar usuario
      const result = await authService.register(sanitized);
      
      console.log(`[AUTH] New user registered: ${result.user.email}`);
      const response = this.formatAuthResponse(result.user, result.tokens, 'Registro exitoso');

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  // ✅ FUNCIÓN DE FLECHA para validar refresh token
  private validateRefreshTokenInput = (data: any) => {
    if (!data.refreshToken || typeof data.refreshToken !== 'string') {
      throw new Error('Refresh token requerido');
    }
    
    if (data.refreshToken.length < 10) {
      throw new Error('Refresh token inválido');
    }
    
    return data.refreshToken.trim();
  };

  /**
   * ✅ FUNCIÓN TRADICIONAL para endpoint de refresh token
   * Razón: Método principal que necesita binding correcto
   */
  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = this.validateRefreshTokenInput(req.body);
      
      // Validar con schema para seguridad adicional
      const validatedData = refreshTokenSchema.parse({ refreshToken }) as RefreshTokenRequest;

      // Renovar tokens
      const tokens = await authService.refreshToken(validatedData.refreshToken);

      const response: ApiResponse = {
        success: true,
        data: { 
          tokens,
          refreshedAt: new Date().toISOString()
        },
        message: 'Tokens renovados exitosamente'
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // ✅ FUNCIÓN DE FLECHA para validar usuario autenticado
  private validateAuthenticatedUser = (req: Request) => {
    if (!req.user) {
      const error = new Error('Usuario no autenticado') as ApiError;
      error.status = 401;
      throw error;
    }
    return req.user;
  };

  // ✅ FUNCIÓN DE FLECHA para formatear respuesta de usuario
  private formatUserResponse = (user: any) => ({
    id: user.id,
    email: user.email,
    nombre: user.nombre,
    role: user.role,
    ...(user.picture_url && { picture_url: user.picture_url }),
    ...(user.bio && { bio: user.bio }),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastAccess: new Date().toISOString()
  });

  /**
   * ✅ FUNCIÓN TRADICIONAL para endpoint de obtener información del usuario
   * Razón: Método principal que necesita binding correcto
   */
  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authenticatedUser = this.validateAuthenticatedUser(req);

      // Obtener información actualizada del usuario
      const user = await authService.getUserById(authenticatedUser.userId);

      if (!user) {
        const error = new Error('Usuario no encontrado') as ApiError;
        error.status = 404;
        throw error;
      }

      const formattedUser = this.formatUserResponse(user);

      const response: ApiResponse = {
        success: true,
        data: { user: formattedUser },
        message: 'Información del usuario obtenida exitosamente'
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // ✅ FUNCIÓN DE FLECHA para validar cambio de contraseña
  private validatePasswordChangeData = (data: any) => {
    const errors: string[] = [];
    
    if (!data.currentPassword) {
      errors.push('Contraseña actual requerida');
    }
    
    if (!data.newPassword) {
      errors.push('Nueva contraseña requerida');
    }
    
    if (data.currentPassword === data.newPassword) {
      errors.push('La nueva contraseña debe ser diferente a la actual');
    }
    
    if (data.newPassword) {
      const passwordCheck = this.validatePasswordStrength(data.newPassword);
      if (!passwordCheck.isStrong) {
        errors.push(`Nueva contraseña muy débil. Sugerencias: ${passwordCheck.suggestions.join(', ')}`);
      }
    }
    
    return errors;
  };

  /**
   * ✅ FUNCIÓN TRADICIONAL para endpoint de cambio de contraseña
   * Razón: Método principal que necesita binding correcto
   */
  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authenticatedUser = this.validateAuthenticatedUser(req);
      
      const validationErrors = this.validatePasswordChangeData(req.body);
      if (validationErrors.length > 0) {
        const error = new Error('Datos inválidos') as ApiError;
        error.status = 400;
        (error as any).details = validationErrors;
        throw error;
      }

      // Validar con schema para seguridad adicional
      const validatedData = changePasswordSchema.parse(req.body) as ChangePasswordRequest;

      // Cambiar contraseña
      await authService.changePassword(
        authenticatedUser.userId,
        validatedData.currentPassword,
        validatedData.newPassword
      );

      console.log(`[AUTH] Password changed for user: ${authenticatedUser.email}`);

      const response: ApiResponse = {
        success: true,
        message: 'Contraseña cambiada exitosamente',
        data: {
          changedAt: new Date().toISOString()
        }
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // ✅ FUNCIÓN DE FLECHA para generar respuesta de logout
  private generateLogoutResponse = () => ({
    success: true,
    message: 'Logout exitoso. Por favor elimina los tokens del almacenamiento local.',
    data: {
      logoutTime: new Date().toISOString(),
      instructions: [
        'Eliminar accessToken del localStorage',
        'Eliminar refreshToken del localStorage',
        'Limpiar cookies de sesión si las hay'
      ]
    }
  });

  /**
   * ✅ FUNCIÓN TRADICIONAL para endpoint de logout
   * Razón: Método principal que puede ser extendido para implementar blacklist
   */
  async logout(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // En una implementación JWT stateless, el logout se maneja del lado del cliente
      // eliminando los tokens del almacenamiento local/cookies
      // Aquí podríamos implementar una blacklist de tokens si fuera necesario

      const response = this.generateLogoutResponse();
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // ✅ FUNCIÓN DE FLECHA para extraer token del header
  private extractTokenFromHeader = (authHeader: string | undefined) => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  };

  // ✅ FUNCIÓN DE FLECHA para validar formato de token
  private validateTokenFormat = (token: string) => {
    return token && token.length > 10 && token.split('.').length === 3;
  };

  // ✅ FUNCIÓN DE FLECHA para generar respuesta de validación
  private generateValidationResponse = (isValid: boolean, user: any = null) => ({
    success: true,
    data: { 
      valid: isValid,
      user: isValid ? user : null,
      validatedAt: new Date().toISOString()
    },
    message: isValid ? 'Token válido' : 'Token inválido'
  });

  /**
   * ✅ FUNCIÓN TRADICIONAL para endpoint de validación de token
   * Razón: Método principal que puede ser extendido para diferentes tipos de validación
   */
  async validateToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers['authorization'];
      const token = this.extractTokenFromHeader(authHeader);

      if (!token) {
        const error = new Error('Token no proporcionado') as ApiError;
        error.status = 400;
        throw error;
      }

      if (!this.validateTokenFormat(token)) {
        const error = new Error('Formato de token inválido') as ApiError;
        error.status = 400;
        throw error;
      }

      const isValid = authService.isTokenValid(token);
      const response = this.generateValidationResponse(isValid, req.user);

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