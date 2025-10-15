import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthForm } from '../../hooks/useAuthForm';
import { useRoleBasedNavigation } from '../../hooks/useRoleBasedNavigation';
// import { ButtonCinematic } from '../ui';
import type { LoginCredentials } from '../../types/auth';

/**
 * Componente de formulario de inicio de sesión
 */
const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const { navigateToDashboard } = useRoleBasedNavigation();
  const {
    isSubmitting,
    errors,
    validateLoginCredentials,
    executeFormAction,
  } = useAuthForm();

  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  /**
   * Manejar cambios en los campos del formulario
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Manejar envío del formulario
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateLoginCredentials(credentials)) {
      return;
    }

    await executeFormAction(async () => {
      await login(credentials);
      navigateToDashboard();
    });
  };

  return (
    <div>
      {/* Mensaje de error general */}
      {errors.general && (
        <div className="wf-minimal-error wf-minimal-spacing-md">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Campo Email */}
        <div className="wf-form-group-minimal">
          <label className="wf-form-label-minimal">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={credentials.email}
            onChange={handleInputChange}
            placeholder="tu@email.com"
            className="wf-form-input-minimal"
            disabled={isSubmitting}
            autoComplete="email"
            required
          />
          {errors.email && (
            <div className="wf-minimal-error wf-mt-2">
              {errors.email}
            </div>
          )}
        </div>

        {/* Campo Contraseña */}
        <div className="wf-form-group-minimal">
          <label className="wf-form-label-minimal">
            Contraseña
          </label>
          <div className="wf-relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={credentials.password}
              onChange={handleInputChange}
              placeholder="Tu contraseña"
              className="wf-form-input-minimal"
              disabled={isSubmitting}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="wf-absolute wf-right-3 wf-top-3 wf-bg-transparent wf-border-none wf-cursor-pointer wf-text-muted"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isSubmitting}
            >
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          {errors.password && (
            <div className="wf-minimal-error wf-mt-2">
              {errors.password}
            </div>
          )}
        </div>

        {/* Opciones adicionales */}
        <div className="wf-flex wf-justify-between wf-items-center wf-minimal-spacing-md">
          <label className="wf-flex wf-items-center wf-space-x-2 wf-cursor-pointer">
            <input
              type="checkbox"
              className="wf-w-4 wf-h-4"
              disabled={isSubmitting}
            />
            <span className="wf-minimal-text">Recordarme</span>
          </label>
        </div>

        {/* Botón de envío */}
        <button
          type="submit"
          className="wf-btn-minimal-primary wf-w-full wf-py-3"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;