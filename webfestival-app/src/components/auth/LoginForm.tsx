import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthForm } from '../../hooks/useAuthForm';
import { useRoleBasedNavigation } from '../../hooks/useRoleBasedNavigation';
import type { LoginCredentials } from '../../types/auth';

/**
 * Componente de formulario de inicio de sesión
 * Diseño moderno con gradientes y formas orgánicas
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
    <main className="wf-auth-modern">
      <div className="wf-auth-container">

        {/* Panel Izquierdo - Welcome */}
        <div className="wf-auth-welcome-panel">
          {/* Formas orgánicas de fondo */}
          <div className="wf-auth-bg-shapes">
            <div className="wf-shape wf-shape-1"></div>
            <div className="wf-shape wf-shape-2"></div>
            <div className="wf-shape wf-shape-3"></div>
            <div className="wf-shape wf-shape-4"></div>
            <div className="wf-shape wf-shape-5"></div>
          </div>

          {/* Contenido del panel izquierdo */}
          <div className="wf-auth-welcome-content">
            {/* Logo */}
            <div className="wf-auth-logo-modern">
              <div className="wf-logo-circle">
                <div className="wf-logo-inner">
                  <div className="wf-logo-dot"></div>
                </div>
              </div>
              <span className="wf-logo-text">WebFestival</span>
            </div>

            {/* Contenido central */}
            <div className="wf-auth-welcome-main">
              <h1 className="wf-welcome-title">
                Página de Bienvenida
              </h1>
              <p className="wf-welcome-subtitle">
                Inicia sesión para<br />
                continuar acceso
              </p>
            </div>

            {/* Footer */}
            <div className="wf-auth-welcome-footer">
              www.webfestival.com
            </div>
          </div>
        </div>

        {/* Panel Derecho - Formulario */}
        <div className="wf-auth-form-panel">
          <div className="wf-auth-form-content">

            {/* Header del formulario */}
            <div className="wf-auth-header">
              <h2 className="wf-auth-title">Iniciar Sesión</h2>
              <p className="wf-auth-subtitle">
                ¿No tienes cuenta? <Link to="/register" className="wf-auth-link">Crear una</Link>
              </p>
            </div>

            {/* Mensaje de error general */}
            {errors.general && (
              <div className="wf-alert wf-alert-danger wf-mb-4">
                {errors.general}
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="wf-auth-form">

              {/* Campo Email */}
              <div className="wf-form-group">
                <input
                  type="email"
                  name="email"
                  value={credentials.email}
                  onChange={handleInputChange}
                  className="wf-form-control-modern"
                  placeholder="Correo Electrónico"
                  disabled={isSubmitting}
                  autoComplete="email"
                  autoFocus
                  required
                />
                {errors.email && (
                  <div className="wf-form-error">{errors.email}</div>
                )}
              </div>

              {/* Campo Password */}
              <div className="wf-form-group wf-password-group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={credentials.password}
                  onChange={handleInputChange}
                  className="wf-form-control-modern"
                  placeholder="Contraseña"
                  disabled={isSubmitting}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="wf-password-toggle-modern"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
                {errors.password && (
                  <div className="wf-form-error">{errors.password}</div>
                )}
              </div>

              {/* Botón Continue */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="wf-btn-modern wf-btn-primary"
              >
                <span>{isSubmitting ? 'Iniciando sesión...' : 'CONTINUAR'}</span>
                {!isSubmitting && <span className="wf-btn-arrow">→</span>}
              </button>

              {/* Divider */}
              <div className="wf-auth-divider">
                <span>o Conectar con Redes Sociales</span>
              </div>

              {/* Botones de redes sociales */}
              <div className="wf-social-buttons">
                <button
                  type="button"
                  className="wf-btn-social wf-btn-google"
                >
                  <span className="wf-social-icon">🔍</span>
                  <span>Iniciar sesión con Google</span>
                </button>

                <button
                  type="button"
                  className="wf-btn-social wf-btn-facebook"
                >
                  <span className="wf-social-icon">📘</span>
                  <span>Iniciar sesión con Facebook</span>
                </button>
              </div>

              {/* Enlaces adicionales */}
              <div className="wf-auth-links">
                <Link to="/forgot-password" className="wf-auth-link">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

            </form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LoginForm;