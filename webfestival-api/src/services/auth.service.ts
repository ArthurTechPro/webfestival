import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AuthTokens, JWTPayload, LoginCredentials, RegisterData, User, ApiError } from '@/types';
import { prisma } from '../lib/prisma';
import { Role } from '@prisma/client';

export class AuthService {
  private readonly JWT_SECRET: string;
  private readonly JWT_EXPIRES_IN: string;
  private readonly JWT_REFRESH_SECRET: string;
  private readonly JWT_REFRESH_EXPIRES_IN: string;

  constructor() {
    this.JWT_SECRET = process.env['JWT_SECRET'] || '';
    this.JWT_EXPIRES_IN = process.env['JWT_EXPIRES_IN'] || '7d';
    this.JWT_REFRESH_SECRET = process.env['JWT_REFRESH_SECRET'] || '';
    this.JWT_REFRESH_EXPIRES_IN = process.env['JWT_REFRESH_EXPIRES_IN'] || '30d';

    if (!this.JWT_SECRET || !this.JWT_REFRESH_SECRET) {
      throw new Error('JWT secrets are required. Please check your environment variables.');
    }
  }

  /**
   * Genera tokens de acceso y refresh para un usuario
   */
  generateTokens(payload: Omit<JWTPayload, 'iat' | 'exp'>): AuthTokens {
    // Crear el payload como un objeto plano
    const tokenPayload = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role
    };

    // Usar any para evitar problemas de tipos con jwt.sign
    const accessToken = (jwt.sign as any)(
      tokenPayload, 
      this.JWT_SECRET, 
      { expiresIn: this.JWT_EXPIRES_IN }
    );

    const refreshToken = (jwt.sign as any)(
      tokenPayload, 
      this.JWT_REFRESH_SECRET, 
      { expiresIn: this.JWT_REFRESH_EXPIRES_IN }
    );

    return { accessToken, refreshToken };
  }

  /**
   * Verifica un token de acceso
   */
  verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.JWT_SECRET) as JWTPayload;
    } catch (error) {
      const authError = new Error('Token de acceso inválido o expirado') as ApiError;
      authError.status = 401;
      throw authError;
    }
  }

  /**
   * Verifica un refresh token
   */
  verifyRefreshToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.JWT_REFRESH_SECRET) as JWTPayload;
    } catch (error) {
      const authError = new Error('Refresh token inválido o expirado') as ApiError;
      authError.status = 401;
      throw authError;
    }
  }

  /**
   * Hashea una contraseña
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Compara una contraseña con su hash
   */
  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Autentica un usuario con email y contraseña
   */
  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    const { email, password } = credentials;

    // Buscar usuario por email
    const usuario = await prisma.usuario.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!usuario || !usuario.password) {
      const error = new Error('Credenciales inválidas') as ApiError;
      error.status = 401;
      throw error;
    }

    // Verificar contraseña
    const isPasswordValid = await this.comparePassword(password, usuario.password);
    if (!isPasswordValid) {
      const error = new Error('Credenciales inválidas') as ApiError;
      error.status = 401;
      throw error;
    }

    // Generar tokens
    const tokenPayload: Omit<JWTPayload, 'iat' | 'exp'> = {
      id: usuario.id,
      userId: usuario.id,
      email: usuario.email,
      role: usuario.role
    };

    const tokens = this.generateTokens(tokenPayload);

    // Convertir usuario a formato de respuesta (sin password)
    const userResponse: User = {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre || '',
      role: usuario.role as 'PARTICIPANTE' | 'JURADO' | 'ADMIN' | 'CONTENT_ADMIN',
      ...(usuario.picture_url && { picture_url: usuario.picture_url }),
      ...(usuario.bio && { bio: usuario.bio }),
      createdAt: usuario.created_at,
      updatedAt: usuario.updated_at
    };

    return { user: userResponse, tokens };
  }

  /**
   * Registra un nuevo usuario
   */
  async register(userData: RegisterData): Promise<{ user: User; tokens: AuthTokens }> {
    const { email, password, nombre, bio } = userData;

    // Verificar si el email ya existe
    const existingUser = await prisma.usuario.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      const error = new Error('El email ya está registrado') as ApiError;
      error.status = 409;
      throw error;
    }

    // Hashear contraseña
    const hashedPassword = await this.hashPassword(password);

    // Crear usuario
    const usuario = await prisma.usuario.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        nombre,
        bio: bio || null,
        role: Role.PARTICIPANTE
      }
    });

    // Generar tokens
    const tokenPayload: Omit<JWTPayload, 'iat' | 'exp'> = {
      id: usuario.id,
      userId: usuario.id,
      email: usuario.email,
      role: usuario.role
    };

    const tokens = this.generateTokens(tokenPayload);

    // Convertir usuario a formato de respuesta
    const userResponse: User = {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre || '',
      role: usuario.role as 'PARTICIPANTE' | 'JURADO' | 'ADMIN' | 'CONTENT_ADMIN',
      ...(usuario.picture_url && { picture_url: usuario.picture_url }),
      ...(usuario.bio && { bio: usuario.bio }),
      createdAt: usuario.created_at,
      updatedAt: usuario.updated_at
    };

    return { user: userResponse, tokens };
  }

  /**
   * Renueva los tokens usando un refresh token
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    // Verificar refresh token
    const decoded = this.verifyRefreshToken(refreshToken);

    // Verificar que el usuario aún existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.userId }
    });

    if (!usuario) {
      const error = new Error('Usuario no encontrado') as ApiError;
      error.status = 404;
      throw error;
    }

    // Generar nuevos tokens
    const tokenPayload: Omit<JWTPayload, 'iat' | 'exp'> = {
      id: usuario.id,
      userId: usuario.id,
      email: usuario.email,
      role: usuario.role
    };

    return this.generateTokens(tokenPayload);
  }

  /**
   * Obtiene información del usuario por ID
   */
  async getUserById(userId: string): Promise<User | null> {
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId }
    });

    if (!usuario) {
      return null;
    }

    return {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre || '',
      role: usuario.role as 'PARTICIPANTE' | 'JURADO' | 'ADMIN' | 'CONTENT_ADMIN',
      ...(usuario.picture_url && { picture_url: usuario.picture_url }),
      ...(usuario.bio && { bio: usuario.bio }),
      createdAt: usuario.created_at,
      updatedAt: usuario.updated_at
    };
  }

  /**
   * Cambia la contraseña de un usuario
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    // Obtener usuario
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId }
    });

    if (!usuario || !usuario.password) {
      const error = new Error('Usuario no encontrado') as ApiError;
      error.status = 404;
      throw error;
    }

    // Verificar contraseña actual
    const isCurrentPasswordValid = await this.comparePassword(currentPassword, usuario.password);
    if (!isCurrentPasswordValid) {
      const error = new Error('Contraseña actual incorrecta') as ApiError;
      error.status = 400;
      throw error;
    }

    // Hashear nueva contraseña
    const hashedNewPassword = await this.hashPassword(newPassword);

    // Actualizar contraseña
    await prisma.usuario.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });
  }

  /**
   * Valida si un token es válido sin lanzar excepción
   */
  isTokenValid(token: string): boolean {
    try {
      this.verifyAccessToken(token);
      return true;
    } catch {
      return false;
    }
  }
}

export const authService = new AuthService();