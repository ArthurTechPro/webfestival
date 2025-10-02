import { z } from 'zod';

// Esquema para login
export const loginSchema = z.object({
  email: z.string()
    .email('Formato de email inválido')
    .min(1, 'El email es requerido'),
  password: z.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña no puede exceder 100 caracteres')
});

// Esquema para registro
export const registerSchema = z.object({
  email: z.string()
    .email('Formato de email inválido')
    .min(1, 'El email es requerido'),
  password: z.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña no puede exceder 100 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La contraseña debe contener al menos una letra minúscula, una mayúscula y un número'
    ),
  nombre: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
  bio: z.string()
    .max(500, 'La biografía no puede exceder 500 caracteres')
    .optional()
});

// Esquema para refresh token
export const refreshTokenSchema = z.object({
  refreshToken: z.string()
    .min(1, 'El refresh token es requerido')
});

// Esquema para cambio de contraseña
export const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, 'La contraseña actual es requerida'),
  newPassword: z.string()
    .min(6, 'La nueva contraseña debe tener al menos 6 caracteres')
    .max(100, 'La nueva contraseña no puede exceder 100 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La nueva contraseña debe contener al menos una letra minúscula, una mayúscula y un número'
    )
});

// Esquema para solicitud de reset de contraseña
export const forgotPasswordSchema = z.object({
  email: z.string()
    .email('Formato de email inválido')
    .min(1, 'El email es requerido')
});

// Esquema para reset de contraseña
export const resetPasswordSchema = z.object({
  token: z.string()
    .min(1, 'El token es requerido'),
  newPassword: z.string()
    .min(6, 'La nueva contraseña debe tener al menos 6 caracteres')
    .max(100, 'La nueva contraseña no puede exceder 100 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La nueva contraseña debe contener al menos una letra minúscula, una mayúscula y un número'
    )
});

// Tipos derivados de los esquemas
export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;
export type RefreshTokenRequest = z.infer<typeof refreshTokenSchema>;
export type ChangePasswordRequest = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordRequest = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordRequest = z.infer<typeof resetPasswordSchema>;