// 🎯 EJEMPLO: RUTAS HÍBRIDAS - COMBINANDO FUNCIONES TRADICIONALES Y DE FLECHA
// Demuestra cómo aplicar la estrategia híbrida en las rutas de Express

import { Router } from 'express';
import { authController } from '../src/controllers/auth.controller';
import { hybridAuthMiddleware, logRequest, simpleRateLimit } from '../src/middleware/hybrid-auth.middleware';

const router = Router();

// 🎯 EJEMPLO 1: MIDDLEWARE HÍBRIDO
// ✅ Funciones de flecha para middleware simple
const corsHeaders = (req: any, res: any, next: any) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
};

const requestTimer = (req: any, res: any, next: any) => {
    const startTime = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - startTime;
        console.log(`[TIMING] ${req.method} ${req.path} - ${duration}ms`);
    });

    next();
};

// ✅ Función tradicional para middleware complejo
async function validateContentType(req: any, res: any, next: any): Promise<void> {
    try {
        // ✅ Funciones de flecha para helpers internos
        const isJsonRequest = (req: any) => {
            return req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH';
        };

        const hasValidContentType = (req: any) => {
            const contentType = req.headers['content-type'];
            return contentType && contentType.includes('application/json');
        };

        const sendContentTypeError = (res: any) => {
            res.status(400).json({
                success: false,
                message: 'Content-Type debe ser application/json',
                received: req.headers['content-type'] || 'none'
            });
        };

        if (isJsonRequest(req) && !hasValidContentType(req)) {
            sendContentTypeError(res);
            return; // ✅ SOLUCIÓN: return sin valor después de enviar respuesta
        }

        next();
    } catch (error) {
        next(error);
    }
}

// 🎯 APLICAR MIDDLEWARE HÍBRIDO
router.use(corsHeaders); // ✅ Función de flecha simple
router.use(requestTimer); // ✅ Función de flecha simple
router.use(logRequest); // ✅ Función de flecha importada
router.use(validateContentType); // ✅ Función tradicional compleja

// 🎯 EJEMPLO 2: RUTAS CON CONTROLADORES HÍBRIDOS
// ✅ Binding tradicional para métodos de clase
router.post('/auth/login',
    simpleRateLimit(10, 15 * 60 * 1000), // ✅ Función de flecha con configuración
    authController.login.bind(authController) // ✅ Función tradicional con binding
);

router.post('/auth/register',
    simpleRateLimit(5, 15 * 60 * 1000), // ✅ Función de flecha
    authController.register.bind(authController) // ✅ Función tradicional
);

router.post('/auth/refresh',
    authController.refreshToken.bind(authController) // ✅ Función tradicional
);

// 🎯 EJEMPLO 3: RUTAS CON MIDDLEWARE HÍBRIDO DE AUTENTICACIÓN
router.get('/auth/me',
    hybridAuthMiddleware.authenticateToken.bind(hybridAuthMiddleware), // ✅ Función tradicional
    authController.getMe.bind(authController) // ✅ Función tradicional
);

router.put('/auth/change-password',
    hybridAuthMiddleware.authenticateToken.bind(hybridAuthMiddleware), // ✅ Función tradicional
    authController.changePassword.bind(authController) // ✅ Función tradicional
);

// 🎯 EJEMPLO 4: RUTAS CON MIDDLEWARE DE ROLES HÍBRIDO
router.get('/admin/users',
    hybridAuthMiddleware.authenticateToken.bind(hybridAuthMiddleware), // ✅ Función tradicional
    hybridAuthMiddleware.requireRole(['ADMIN']), // ✅ Función tradicional que retorna función
    // ✅ Función de flecha inline para endpoint simple
    async (req, res, next) => {
        try {
            // ✅ Funciones de flecha para transformaciones
            const formatUser = (user: any) => ({
                id: user.id,
                email: user.email,
                nombre: user.nombre,
                role: user.role,
                isActive: user.status === 'ACTIVE'
            });

            const filterActiveUsers = (users: any[]) => {
                return users.filter(user => user.isActive);
            };

            // Simulación de obtener usuarios
            const users = []; // Aquí iría la lógica real
            const formattedUsers = users.map(formatUser);
            const activeUsers = filterActiveUsers(formattedUsers);

            res.json({
                success: true,
                data: activeUsers,
                total: activeUsers.length
            });
        } catch (error) {
            next(error);
        }
    }
);

// 🎯 EJEMPLO 5: COMBINANDO DIFERENTES TIPOS DE FUNCIONES EN UNA RUTA
router.post('/complex-endpoint',
    // ✅ Función de flecha para validación simple
    (req: any, res: any, next: any) => {
        if (!req.body || Object.keys(req.body).length === 0) {
            res.status(400).json({
                success: false,
                message: 'Body requerido'
            });
            return; // ✅ SOLUCIÓN: return sin valor después de enviar respuesta
        }
        next();
    },

    // ✅ Función tradicional para middleware complejo
    async function validateComplexData(req: any, res: any, next: any): Promise<void> {
        try {
            // ✅ Funciones de flecha para validaciones internas
            const validateEmail = (email: string) => {
                return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            };

            const validateAge = (age: number) => {
                return age && age >= 18 && age <= 120;
            };

            const sanitizeInput = (data: any) => ({
                email: data.email?.toLowerCase().trim(),
                age: parseInt(data.age),
                name: data.name?.trim()
            });

            const sanitized = sanitizeInput(req.body);
            const errors: string[] = [];

            if (!validateEmail(sanitized.email)) {
                errors.push('Email inválido');
            }

            if (!validateAge(sanitized.age)) {
                errors.push('Edad debe estar entre 18 y 120 años');
            }

            if (errors.length > 0) {
                res.status(400).json({
                    success: false,
                    message: 'Datos inválidos',
                    errors
                });
                return; // ✅ SOLUCIÓN: return sin valor después de enviar respuesta
            }

            req.body = sanitized;
            next();
        } catch (error) {
            next(error);
        }
    },

    // ✅ Función de flecha para el handler final
    async (req, res, next) => {
        try {
            // ✅ Funciones de flecha para procesamiento
            const processData = (data: any) => ({
                ...data,
                processed: true,
                timestamp: new Date().toISOString()
            });

            const generateResponse = (processedData: any) => ({
                success: true,
                data: processedData,
                message: 'Datos procesados exitosamente'
            });

            const processed = processData(req.body);
            const response = generateResponse(processed);

            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }
);

// 🎯 EJEMPLO 6: RUTA CON HANDLER DE CLASE Y HELPERS DE FLECHA
class ComplexRouteHandler {
    // ✅ FUNCIONES DE FLECHA para helpers
    private validateInput = (data: any) => {
        return data && typeof data === 'object' && Object.keys(data).length > 0;
    };

    private formatResponse = (data: any, message: string) => ({
        success: true,
        data,
        message,
        timestamp: new Date().toISOString()
    });

    private logOperation = (operation: string, userId?: string) => {
        console.log(`[COMPLEX_ROUTE] ${operation} - User: ${userId || 'anonymous'} - ${new Date().toISOString()}`);
    };

    // ✅ FUNCIÓN TRADICIONAL para método principal
    async handleComplexOperation(req: any, res: any, next: any): Promise<void> {
        try {
            if (!this.validateInput(req.body)) {
                res.status(400).json({
                    success: false,
                    message: 'Datos de entrada inválidos'
                });
                return; // ✅ SOLUCIÓN: return sin valor después de enviar respuesta
            }

            this.logOperation('COMPLEX_OPERATION_START', req.user?.userId);

            // Simulación de operación compleja
            const result = { processed: true, data: req.body };

            this.logOperation('COMPLEX_OPERATION_SUCCESS', req.user?.userId);

            const response = this.formatResponse(result, 'Operación completada exitosamente');
            res.status(200).json(response);
        } catch (error) {
            this.logOperation('COMPLEX_OPERATION_ERROR', req.user?.userId);
            next(error);
        }
    }
}

const complexHandler = new ComplexRouteHandler();

router.post('/complex-class-handler',
    hybridAuthMiddleware.authenticateToken.bind(hybridAuthMiddleware), // ✅ Función tradicional
    complexHandler.handleComplexOperation.bind(complexHandler) // ✅ Función tradicional con binding
);

// 🎯 EJEMPLO 7: ERROR HANDLER HÍBRIDO
// ✅ Función tradicional para error handler principal
async function hybridErrorHandler(error: any, req: any, res: any, next: any): Promise<void> {
    // ✅ Funciones de flecha para helpers de error
    const getErrorType = (error: any) => {
        if (error.name === 'ValidationError') return 'VALIDATION';
        if (error.name === 'CastError') return 'CAST';
        if (error.status) return 'HTTP';
        return 'UNKNOWN';
    };

    const formatErrorResponse = (error: any, type: string) => ({
        success: false,
        error: {
            type,
            message: error.message,
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        },
        timestamp: new Date().toISOString()
    });

    const logError = (error: any, req: any) => {
        console.error(`[ERROR] ${error.message}`, {
            url: req.url,
            method: req.method,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
    };

    try {
        logError(error, req);

        const errorType = getErrorType(error);
        const response = formatErrorResponse(error, errorType);

        const statusCode = error.status || 500;
        res.status(statusCode).json(response);
    } catch (handlerError) {
        console.error('Error in error handler:', handlerError);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

router.use(hybridErrorHandler); // ✅ Función tradicional para error handling

export default router;