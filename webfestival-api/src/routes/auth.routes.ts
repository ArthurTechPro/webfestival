import { Router } from 'express';
import { authController } from '@/controllers/auth.controller';
import { authenticateToken } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validation';
import { 
  loginSchema, 
  registerSchema, 
  refreshTokenSchema, 
  changePasswordSchema 
} from '@/schemas/auth.schemas';

const router = Router();

/**
 * @route   POST /api/v1/auth/login
 * @desc    Autenticar usuario y obtener tokens
 * @access  Public
 * @body    { email: string, password: string }
 */
router.post('/login', 
  validateRequest(loginSchema),
  authController.login.bind(authController)
);

/**
 * @route   POST /api/v1/auth/register
 * @desc    Registrar nuevo usuario
 * @access  Public
 * @body    { email: string, password: string, nombre: string, bio?: string }
 */
router.post('/register',
  validateRequest(registerSchema),
  authController.register.bind(authController)
);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Renovar tokens de acceso
 * @access  Public
 * @body    { refreshToken: string }
 */
router.post('/refresh',
  validateRequest(refreshTokenSchema),
  authController.refreshToken.bind(authController)
);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Obtener información del usuario actual
 * @access  Private
 * @headers Authorization: Bearer <token>
 */
router.get('/me',
  authenticateToken,
  authController.getMe.bind(authController)
);

/**
 * @route   PUT /api/v1/auth/change-password
 * @desc    Cambiar contraseña del usuario
 * @access  Private
 * @headers Authorization: Bearer <token>
 * @body    { currentPassword: string, newPassword: string }
 */
router.put('/change-password',
  authenticateToken,
  validateRequest(changePasswordSchema),
  authController.changePassword.bind(authController)
);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Cerrar sesión (invalidar tokens del lado del cliente)
 * @access  Private
 * @headers Authorization: Bearer <token>
 */
router.post('/logout',
  authenticateToken,
  authController.logout.bind(authController)
);

/**
 * @route   GET /api/v1/auth/validate
 * @desc    Validar si un token es válido
 * @access  Public
 * @headers Authorization: Bearer <token>
 */
router.get('/validate',
  authenticateToken,
  authController.validateToken.bind(authController)
);

export default router;