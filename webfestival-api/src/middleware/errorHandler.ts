import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@/types';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export const errorHandler = (
  err: ApiError | ZodError | Prisma.PrismaClientKnownRequestError | Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Datos de entrada inválidos',
      details: err.errors.map(error => ({
        field: error.path.join('.'),
        message: error.message
      }))
    });
  }

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    let status = 500;
    let message = 'Error de base de datos';

    switch (err.code) {
      case 'P2002':
        status = 409;
        message = 'El registro ya existe (violación de restricción única)';
        break;
      case 'P2025':
        status = 404;
        message = 'Registro no encontrado';
        break;
      case 'P2003':
        status = 400;
        message = 'Violación de clave foránea';
        break;
      default:
        message = 'Error de base de datos';
    }

    return res.status(status).json({
      success: false,
      error: message,
      ...(process.env['NODE_ENV'] !== 'production' && {
        code: err.code,
        meta: err.meta
      })
    });
  }

  // Handle custom API errors
  const apiError = err as ApiError;
  let status = apiError.status || 500;
  let message = apiError.message || 'Error interno del servidor';

  // Handle specific error types
  if (apiError.name === 'ValidationError') {
    status = 400;
    message = 'Error de validación';
  } else if (apiError.name === 'UnauthorizedError') {
    status = 401;
    message = 'No autorizado';
  } else if (apiError.name === 'ForbiddenError') {
    status = 403;
    message = 'Acceso prohibido';
  } else if (apiError.name === 'NotFoundError') {
    status = 404;
    message = 'Recurso no encontrado';
  }

  res.status(status).json({
    success: false,
    error: message,
    ...(process.env['NODE_ENV'] !== 'production' && {
      stack: apiError.stack,
      details: apiError
    }),
    ...((apiError as any).details && { details: (apiError as any).details })
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
};

export default errorHandler;