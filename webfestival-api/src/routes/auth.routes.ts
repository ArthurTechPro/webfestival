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
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Autenticación]
 *     summary: Autenticar usuario y obtener tokens JWT
 *     description: Permite a un usuario autenticarse con email y contraseña para obtener tokens de acceso y refresh
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email del usuario registrado
 *                 example: "usuario@ejemplo.com"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: Contraseña del usuario
 *                 example: "miContraseña123"
 *     responses:
 *       200:
 *         description: Autenticación exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Login exitoso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     accessToken:
 *                       type: string
 *                       description: Token JWT para autenticación
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     refreshToken:
 *                       type: string
 *                       description: Token para renovar el accessToken
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     expiresIn:
 *                       type: string
 *                       description: Tiempo de expiración del token
 *                       example: "1h"
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Datos de entrada inválidos"
 *               error: "VALIDATION_ERROR"
 *       401:
 *         description: Credenciales incorrectas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Email o contraseña incorrectos"
 *               error: "INVALID_CREDENTIALS"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/login', 
  validateRequest(loginSchema),
  authController.login.bind(authController)
);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Autenticación]
 *     summary: Registrar nuevo usuario en la plataforma
 *     description: Permite crear una nueva cuenta de usuario con rol PARTICIPANTE por defecto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - nombre
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email único del usuario
 *                 example: "nuevo@ejemplo.com"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: Contraseña segura
 *                 example: "miContraseña123"
 *               nombre:
 *                 type: string
 *                 minLength: 2
 *                 description: Nombre completo del usuario
 *                 example: "Juan Pérez"
 *               bio:
 *                 type: string
 *                 maxLength: 500
 *                 description: Biografía opcional del usuario
 *                 example: "Fotógrafo profesional especializado en retratos"
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Usuario registrado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     accessToken:
 *                       type: string
 *                       description: Token JWT para autenticación inmediata
 *                     refreshToken:
 *                       type: string
 *                       description: Token para renovar el accessToken
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Email ya registrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "El email ya está registrado"
 *               error: "EMAIL_ALREADY_EXISTS"
 */
router.post('/register',
  validateRequest(registerSchema),
  authController.register.bind(authController)
);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags: [Autenticación]
 *     summary: Renovar token de acceso
 *     description: Permite obtener un nuevo accessToken usando un refreshToken válido
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Token de refresh válido
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Token renovado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Token renovado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       description: Nuevo token JWT
 *                     refreshToken:
 *                       type: string
 *                       description: Nuevo refresh token
 *                     expiresIn:
 *                       type: string
 *                       example: "1h"
 *       401:
 *         description: Refresh token inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/refresh',
  validateRequest(refreshTokenSchema),
  authController.refreshToken.bind(authController)
);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Autenticación]
 *     summary: Obtener información del usuario autenticado
 *     description: Retorna los datos del perfil del usuario actualmente autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información del usuario obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Usuario obtenido exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Token no válido o no proporcionado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Token no válido"
 *               error: "INVALID_TOKEN"
 */
router.get('/me',
  authenticateToken,
  authController.getMe.bind(authController)
);

/**
 * @swagger
 * /auth/change-password:
 *   put:
 *     tags: [Autenticación]
 *     summary: Cambiar contraseña del usuario
 *     description: Permite al usuario cambiar su contraseña actual por una nueva
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: Contraseña actual del usuario
 *                 example: "contraseñaActual123"
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 description: Nueva contraseña segura
 *                 example: "nuevaContraseña456"
 *     responses:
 *       200:
 *         description: Contraseña cambiada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Contraseña cambiada exitosamente"
 *       400:
 *         description: Contraseña actual incorrecta
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/change-password',
  authenticateToken,
  validateRequest(changePasswordSchema),
  authController.changePassword.bind(authController)
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Autenticación]
 *     summary: Cerrar sesión del usuario
 *     description: Invalida la sesión actual del usuario (se debe eliminar el token del lado del cliente)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Sesión cerrada exitosamente"
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/logout',
  authenticateToken,
  authController.logout.bind(authController)
);

/**
 * @swagger
 * /auth/validate:
 *   get:
 *     tags: [Autenticación]
 *     summary: Validar token de autenticación
 *     description: Verifica si un token JWT es válido y no ha expirado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Token válido"
 *                 data:
 *                   type: object
 *                   properties:
 *                     valid:
 *                       type: boolean
 *                       example: true
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Token inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/validate',
  authenticateToken,
  authController.validateToken.bind(authController)
);

export default router;