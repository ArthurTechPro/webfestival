import { useState } from 'react';
import type { LoginCredentials, RegisterData, AuthError } from '../types/auth';

// Hook para manejar formularios de autenticación
export const useAuthForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Validar credenciales de login
   */
  const validateLoginCredentials = (credentials: LoginCredentials): boolean => {
    const newErrors: Record<string, string> = {};

    if (!credentials.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!credentials.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (credentials.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Validar datos de registro
   */
  const validateRegisterData = (data: RegisterData): boolean => {
    const newErrors: Record<string, string> = {};

    if (!data.nombre) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (data.nombre.length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!data.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!data.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (data.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!data.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (data.password !== data.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Validar email para recuperación de contraseña
   */
  const validateEmail = (email: string): boolean => {
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'El email no es válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Manejar errores del servidor
   */
  const handleServerError = (error: unknown): void => {
    if (error instanceof Error) {
      // Si el error tiene información de campo específico
      const authError = error as AuthError;
      if (authError.field) {
        setErrors({ [authError.field]: authError.message });
      } else {
        setErrors({ general: authError.message });
      }
    } else {
      setErrors({ general: 'Error inesperado. Inténtalo de nuevo.' });
    }
  };

  /**
   * Limpiar errores
   */
  const clearErrors = (): void => {
    setErrors({});
  };

  /**
   * Ejecutar acción de formulario con manejo de estado
   */
  const executeFormAction = async (action: () => Promise<void>): Promise<void> => {
    setIsSubmitting(true);
    clearErrors();

    try {
      await action();
    } catch (error) {
      handleServerError(error);
      throw error; // Re-lanzar para que el componente pueda manejarlo si es necesario
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    errors,
    validateLoginCredentials,
    validateRegisterData,
    validateEmail,
    handleServerError,
    clearErrors,
    executeFormAction,
    setIsSubmitting,
  };
};