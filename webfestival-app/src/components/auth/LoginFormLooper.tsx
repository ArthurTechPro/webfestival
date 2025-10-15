import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthForm } from '../../hooks/useAuthForm';
import { useRoleBasedNavigation } from '../../hooks/useRoleBasedNavigation';
import type { LoginCredentials } from '../../types/auth';

/**
 * Componente de formulario de inicio de sesión estilo Looper v2
 * Diseño de dos paneles: formulario + anuncio lateral
 */
const LoginFormLooper: React.FC = () => {
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

  const [rememberMe, setRememberMe] = useState(false);

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
    <main className="wf-auth wf-auth-floated wf-fullscreen-container">
      {/* Formulario de Login */}
      <form className="wf-auth-form" onSubmit={handleSubmit}>
        <div className="wf-auth-form-content">
        {/* Header con Logo */}
        <div className="wf-mb-4">
          <div className="wf-mb-3">
            <div className="wf-auth-logo">
              <div className="wf-auth-logo-icon">
                🎬
              </div>
            </div>
          </div>
          <h1 className="wf-h3 wf-text-center">Iniciar Sesión</h1>
        </div>

        {/* Enlace de registro */}
        <p className="wf-text-left wf-mb-4">
          ¿No tienes cuenta? <Link to="/register" className="wf-link">Crear una</Link>
        </p>

        {/* Mensaje de error general */}
        {errors.general && (
          <div className="wf-alert wf-alert-danger wf-mb-4">
            {errors.general}
          </div>
        )}

        {/* Campo Username/Email */}
        <div className="wf-form-group wf-mb-4">
          <label className="wf-d-block wf-text-left" htmlFor="inputUser">
            Email
          </label>
          <input
            type="email"
            id="inputUser"
            name="email"
            value={credentials.email}
            onChange={handleInputChange}
            className="wf-form-control wf-form-control-lg"
            placeholder="tu@email.com"
            disabled={isSubmitting}
            autoComplete="email"
            autoFocus
            required
          />
          {errors.email && (
            <div className="wf-form-error">
              {errors.email}
            </div>
          )}
        </div>

        {/* Campo Password */}
        <div className="wf-form-group wf-mb-4">
          <label className="wf-d-block wf-text-left" htmlFor="inputPassword">
            Contraseña
          </label>
          <input
            type="password"
            id="inputPassword"
            name="password"
            value={credentials.password}
            onChange={handleInputChange}
            className="wf-form-control wf-form-control-lg"
            placeholder="Tu contraseña"
            disabled={isSubmitting}
            autoComplete="current-password"
            required
          />
          {errors.password && (
            <div className="wf-form-error">
              {errors.password}
            </div>
          )}
        </div>

        {/* Botón de envío */}
        <div className="wf-form-group wf-mb-4">
          <button
            className="wf-btn wf-btn-lg wf-btn-primary wf-btn-block"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </div>

        {/* Checkbox Remember Me */}
        <div className="wf-form-group wf-text-center">
          <div className="wf-custom-control wf-custom-control-inline wf-custom-checkbox">
            <input
              type="checkbox"
              className="wf-custom-control-input"
              id="remember-me"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isSubmitting}
            />
            <label className="wf-custom-control-label" htmlFor="remember-me">
              Mantenerme conectado
            </label>
          </div>
        </div>

        {/* Enlaces de recuperación */}
        <p className="wf-py-2 wf-text-center">
          <Link to="/forgot-password" className="wf-link">
            ¿Olvidaste tu contraseña?
          </Link>
          <span className="wf-mx-2">·</span>
          <Link to="/forgot-username" className="wf-link">
            ¿Olvidaste tu usuario?
          </Link>
        </p>

        {/* Copyright */}
        <p className="wf-mb-0 wf-px-3 wf-text-muted wf-text-center wf-text-sm">
          © 2024 WebFestival Platform. Plataforma profesional para concursos multimedia.{' '}
          <Link to="/privacy" className="wf-link">Privacidad</Link> y{' '}
          <Link to="/terms" className="wf-link">Términos</Link>
        </p>
        </div>
      </form>

      {/* Panel de Anuncio Lateral */}
      <div id="announcement" className="wf-auth-announcement">
        <div className="wf-announcement-body">
          <h2 className="wf-announcement-title">
            Únete a la Comunidad Creativa Global
          </h2>
          <p className="wf-announcement-description wf-mb-4">
            Descubre, participa y conecta con artistas de todo el mundo. 
            Compite en concursos de fotografía, video, audio y cortometrajes.
          </p>
          <Link to="/gallery" className="wf-btn wf-btn-warning wf-btn-lg">
            <i className="fas fa-fw fa-angle-right"></i> Explorar Galería
          </Link>
        </div>
      </div>
    </main>
  );
};

export default LoginFormLooper;