// 🎯 EJEMPLO PRÁCTICO: COMBINANDO FUNCIONES TRADICIONALES Y DE FLECHA

import { Request, Response, NextFunction } from 'express';
import { ApiResponse, ApiError } from '@/types';

export class HybridController {
  // ✅ FUNCIONES TRADICIONALES para métodos principales de clase
  // Razón: Necesitan binding correcto, herencia, y stack traces claros
  async getUserProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.id;
      
      // ✅ FUNCIÓN DE FLECHA para operaciones internas/helpers
      // Razón: No necesitan binding, son más concisas, contexto léxico preservado
      const validateUserId = (id: string) => {
        if (!id || id.length < 3) {
          throw new Error('ID de usuario inválido');
        }
        return id.trim();
      };

      // ✅ FUNCIÓN DE FLECHA para transformaciones de datos
      const formatUserResponse = (user: any) => ({
        id: user.id,
        name: user.nombre,
        email: user.email,
        createdAt: user.created_at
      });

      // ✅ FUNCIÓN DE FLECHA para filtros/mapeos
      const filterSensitiveData = (data: any) => {
        const { password, ...safeData } = data;
        return safeData;
      };

      const validUserId = validateUserId(userId);
      const user = await this.userService.findById(validUserId);
      
      if (!user) {
        const error = new Error('Usuario no encontrado') as ApiError;
        error.status = 404;
        throw error;
      }

      const formattedUser = formatUserResponse(user);
      const safeUser = filterSensitiveData(formattedUser);

      const response: ApiResponse = {
        success: true,
        data: { user: safeUser },
        message: 'Usuario obtenido exitosamente'
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // ✅ FUNCIÓN TRADICIONAL para método principal
  async updateUserProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // ✅ FUNCIONES DE FLECHA para validaciones inline
      const validateUpdateData = (data: any) => {
        const errors: string[] = [];
        
        if (data.email && !data.email.includes('@')) {
          errors.push('Email inválido');
        }
        
        if (data.nombre && data.nombre.length < 2) {
          errors.push('Nombre muy corto');
        }
        
        return errors;
      };

      // ✅ FUNCIÓN DE FLECHA para transformación de datos
      const sanitizeInput = (input: any) => ({
        nombre: input.nombre?.trim(),
        email: input.email?.toLowerCase().trim(),
        bio: input.bio?.trim()
      });

      const sanitizedData = sanitizeInput(req.body);
      const validationErrors = validateUpdateData(sanitizedData);

      if (validationErrors.length > 0) {
        const error = new Error('Datos inválidos') as ApiError;
        error.status = 400;
        (error as any).details = validationErrors;
        throw error;
      }

      const updatedUser = await this.userService.update(req.user!.userId, sanitizedData);
      
      res.status(200).json({
        success: true,
        data: { user: updatedUser },
        message: 'Perfil actualizado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }

  // ✅ FUNCIÓN TRADICIONAL para método que puede ser heredado
  async handleError(error: Error, req: Request, res: Response): Promise<void> {
    // ✅ FUNCIÓN DE FLECHA para logging interno
    const logError = (err: Error, context: string) => {
      console.error(`[${context}] ${err.message}`, {
        stack: err.stack,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
      });
    };

    // ✅ FUNCIÓN DE FLECHA para formatear respuesta de error
    const formatErrorResponse = (err: Error) => ({
      success: false,
      message: err.message,
      timestamp: new Date().toISOString(),
      path: req.path
    });

    logError(error, 'HybridController');
    const errorResponse = formatErrorResponse(error);
    
    res.status(500).json(errorResponse);
  }

  // ✅ PROPIEDAD CON FUNCIÓN DE FLECHA para callbacks/handlers simples
  // Razón: Se usa como callback, necesita preservar contexto léxico
  private handleAsyncOperation = async (operation: () => Promise<any>) => {
    try {
      return await operation();
    } catch (error) {
      console.error('Async operation failed:', error);
      throw error;
    }
  };

  // ✅ FUNCIÓN TRADICIONAL para método público que usa el helper
  async performComplexOperation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Usando el helper con función de flecha
      const result = await this.handleAsyncOperation(async () => {
        // ✅ FUNCIÓN DE FLECHA para operación específica
        const processData = (data: any) => {
          return data.map((item: any) => ({
            ...item,
            processed: true,
            timestamp: Date.now()
          }));
        };

        const rawData = await this.dataService.getRawData();
        return processData(rawData);
      });

      res.status(200).json({
        success: true,
        data: result,
        message: 'Operación completada exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
}

// 🎯 EJEMPLO EN SERVICIOS
export class HybridService {
  // ✅ FUNCIÓN TRADICIONAL para método principal del servicio
  async processUserData(userId: string, options: any): Promise<any> {
    // ✅ FUNCIONES DE FLECHA para transformaciones y utilidades
    const transformUser = (user: any) => ({
      id: user.id,
      displayName: user.nombre || user.email,
      isActive: user.status === 'ACTIVE'
    });

    const applyFilters = (data: any[], filters: any) => {
      return data.filter(item => {
        if (filters.active !== undefined) {
          return item.isActive === filters.active;
        }
        return true;
      });
    };

    const sortByDate = (items: any[]) => {
      return items.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    };

    try {
      const user = await this.findUserById(userId);
      const transformedUser = transformUser(user);
      const userData = await this.getUserRelatedData(userId);
      const filteredData = applyFilters(userData, options.filters || {});
      const sortedData = sortByDate(filteredData);

      return {
        user: transformedUser,
        data: sortedData,
        total: sortedData.length
      };
    } catch (error) {
      throw error;
    }
  }

  // ✅ FUNCIÓN TRADICIONAL para método que puede ser sobrescrito
  async findUserById(userId: string): Promise<any> {
    return await this.database.user.findUnique({
      where: { id: userId }
    });
  }
}

// 🎯 EJEMPLO EN UTILIDADES/HELPERS
export class UtilityFunctions {
  // ✅ FUNCIONES DE FLECHA para utilidades puras (sin estado)
  static validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  static formatCurrency = (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  static debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  };

  // ✅ FUNCIÓN TRADICIONAL para método con lógica compleja
  static async processFileUpload(file: any, options: any): Promise<any> {
    // ✅ FUNCIONES DE FLECHA para validaciones internas
    const validateFileType = (file: any) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      return allowedTypes.includes(file.mimetype);
    };

    const validateFileSize = (file: any, maxSize: number) => {
      return file.size <= maxSize;
    };

    const generateFileName = (originalName: string) => {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2);
      const extension = originalName.split('.').pop();
      return `${timestamp}_${random}.${extension}`;
    };

    if (!validateFileType(file)) {
      throw new Error('Tipo de archivo no permitido');
    }

    if (!validateFileSize(file, options.maxSize || 5 * 1024 * 1024)) {
      throw new Error('Archivo muy grande');
    }

    const fileName = generateFileName(file.originalname);
    
    // Lógica de procesamiento...
    return {
      fileName,
      size: file.size,
      type: file.mimetype,
      processed: true
    };
  }
}

// 🎯 EJEMPLO EN MIDDLEWARE
export const hybridMiddleware = {
  // ✅ FUNCIÓN DE FLECHA para middleware simple
  logRequest: (req: Request, res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
  },

  // ✅ FUNCIÓN TRADICIONAL para middleware complejo que puede ser extendido
  async authenticateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // ✅ FUNCIONES DE FLECHA para validaciones internas
      const extractToken = (authHeader: string | undefined) => {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return null;
        }
        return authHeader.substring(7);
      };

      const validateTokenFormat = (token: string) => {
        return token && token.length > 10 && token.includes('.');
      };

      const authHeader = req.headers.authorization;
      const token = extractToken(authHeader);

      if (!token || !validateTokenFormat(token)) {
        return res.status(401).json({
          success: false,
          message: 'Token de acceso requerido'
        });
      }

      // Validar token...
      const decoded = await this.verifyToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  }
};

export default HybridController;