import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthForm } from '../../hooks/useAuthForm';
import { useRoleBasedNavigation } from '../../hooks/useRoleBasedNavigation';
import { useTheme } from '../../hooks/useTheme';
import type { LoginCredentials, RegisterData } from '../../types/auth';

interface AuthFormProfessionalProps {
  mode: 'login' | 'register' | 'forgot-password';
  onSubmit?: (data: LoginCredentials | RegisterData) => void;
  loading?: boolean;
  error?: string;
  announcementContent?: {
    title: string;
    description: string;
    action?: {
      text: string;
      href: string;
    };
    backgroundImage?: string;
  };
  theme?: 'looper' | 'corporate' | 'auto';
  className?: string;
}

/**
 * Componente de autenticación profesional basado en auth-signin-v2.html
 * Diseño de dos paneles: formulario + panel promocional
 * Complementa al LoginForm existente para temas profesionales
 */
const AuthFormProfessional: React.FC<AuthFormProfessionalProps> = ({
  mode,
  onSubmit,
  loading: externalLoading,
  error: externalError,
  announcementContent,
  theme = 'auto',
  className = ''
}) => {
  const { login, register } = useAuth();
  const { navigateToDashboard } = useRoleBasedNavigation();
  const { theme: currentTheme } = useTheme();
  const {
    isSubmitting,
    errors,
    validateLoginCredentials,
    validateRegisterData,
    executeFormAction,
  } = useAuthForm();

  // Estados del formulario
  const [loginCredentials, setLoginCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });

  const [registerData, setRegisterData] = useState<RegisterData>({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Determinar el tema efectivo
  const effectiveTheme = theme === 'auto' ? currentTheme : theme;

  // Estados de carga y error
  const isLoading = externalLoading || isSubmitting;
  const currentError = externalError || errors.general;

  // Contenido por defecto del panel de anuncio
  const defaultAnnouncement = {
    title: 'Únete a WebFestival',
    description: 'Descubre, participa y conecta con una comunidad global de artistas creativos. Compite en concursos multimedia y muestra tu talento al mundo.',
    action: {
      text: 'Explorar Concursos',
      href: '/concursos'
    }
  };

  const announcement = announcementContent || defaultAnnouncement;

  // Clases de tema específico
  const getThemeClasses = () => {
    if (effectiveTheme === 'looper') {
      return 'wf-auth-professional-looper';
    }
    if (effectiveTheme === 'corporate') {
      return 'wf-auth-professional-corporate';
    }
    return 'wf-auth-professional-default';
  };

  // Manejar cambios en campos de login
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginCredentials(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Manejar cambios en campos de registro
  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'login') {
      if (!validateLoginCredentials(loginCredentials)) {
        return;
      }

      await executeFormAction(async () => {
        if (onSubmit) {
          onSubmit(loginCredentials);
        } else {
          await login(loginCredentials);
          navigateToDashboard();
        }
      });
    } else if (mode === 'register') {
      if (!validateRegisterData(registerData)) {
        return;
      }

      await executeFormAction(async () => {
        if (onSubmit) {
          onSubmit(registerData);
        } else {
          await register(registerData);
          navigateToDashboard();
        }
      });
    }
  };

  // Obtener título del formulario
  const getFormTitle = () => {
    switch (mode) {
      case 'register':
        return 'Crear Cuenta';
      case 'forgot-password':
        return 'Recuperar Contraseña';
      default:
        return 'Iniciar Sesión';
    }
  };

  return (
    <div className={`wf-auth-professional ${getThemeClasses()} ${className}`}>
      <div className="wf-auth-container">
        {/* Panel del formulario */}
        <div className="wf-auth-form-panel">
          <div className="wf-auth-form-content">
            <div className="wf-auth-header">
              <h1 className="wf-auth-title">{getFormTitle()}</h1>
              <p className="wf-auth-subtitle">
                {mode === 'register' 
                  ? 'Únete a la comunidad de artistas creativos'
                  : mode === 'forgot-password'
                  ? 'Te enviaremos un enlace para restablecer tu contraseña'
                  : 'Accede a tu cuenta de WebFestival'
                }
              </p>
            </div>

            {/* Mensaje de error */}
            {currentError && (
              <div className="wf-auth-error">
                {currentError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="wf-auth-form">
              {mode === 'register' && (
                <div className="wf-form-group">
                  <label className="wf-form-label">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={registerData.nombre}
                    onChange={handleRegisterChange}
                    placeholder="Tu nombre completo"
                    className="wf-form-control"
                    disabled={isLoading}
                    required
                  />
                  {errors.nombre && (
                    <div className="wf-form-error">
                      {errors.nombre}
                    </div>
                  )}
                </div>
              )}

              <div className="wf-form-group">
                <label className="wf-form-label">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={mode === 'register' ? registerData.email : loginCredentials.email}
                  onChange={mode === 'register' ? handleRegisterChange : handleLoginChange}
                  placeholder="tu@email.com"
                  className="wf-form-control"
                  disabled={isLoading}
                  autoComplete="email"
                  required
                />
                {errors.email && (
                  <div className="wf-form-error">
                    {errors.email}
                  </div>
                )}
              </div>

              {mode !== 'forgot-password' && (
                <div className="wf-form-group">
                  <label className="wf-form-label">
                    Contraseña
                  </label>
                  <div className="wf-form-input-group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={mode === 'register' ? registerData.password : loginCredentials.password}
                      onChange={mode === 'register' ? handleRegisterChange : handleLoginChange}
                      placeholder="Tu contraseña"
                      className="wf-form-control"
                      disabled={isLoading}
                      autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                      required
                    />
                    <button
                      type="button"
                      className="wf-form-input-addon"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? 'Ocultar' : 'Mostrar'}
                    </button>
                  </div>
                  {errors.password && (
                    <div className="wf-form-error">
                      {errors.password}
                    </div>
                  )}
                </div>
              )}

              {mode === 'register' && (
                <div className="wf-form-group">
                  <label className="wf-form-label">
                    Confirmar contraseña
                  </label>
                  <div className="wf-form-input-group">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={registerData.confirmPassword}
                      onChange={handleRegisterChange}
                      placeholder="Confirma tu contraseña"
                      className="wf-form-control"
                      disabled={isLoading}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="wf-form-input-addon"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? 'Ocultar' : 'Mostrar'}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <div className="wf-form-error">
                      {errors.confirmPassword}
                    </div>
                  )}
                </div>
              )}

              {mode === 'login' && (
                <div className="wf-form-options">
                  <label className="wf-form-checkbox">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={isLoading}
                    />
                    <span className="wf-form-checkbox-label">Recordarme</span>
                  </label>
                  
                  <a href="/forgot-password" className="wf-form-link">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
              )}

              <button
                type="submit"
                className="wf-btn wf-btn-primary wf-btn-lg wf-w-full"
                disabled={isLoading}
              >
                {isLoading 
                  ? 'Procesando...' 
                  : mode === 'register' 
                  ? 'Crear Cuenta' 
                  : mode === 'forgot-password'
                  ? 'Enviar Enlace'
                  : 'Iniciar Sesión'
                }
              </button>
            </form>

            <div className="wf-auth-footer">
              {mode === 'login' ? (
                <p>
                  ¿No tienes cuenta?{' '}
                  <a href="/register" className="wf-form-link">
                    Regístrate aquí
                  </a>
                </p>
              ) : mode === 'register' ? (
                <p>
                  ¿Ya tienes cuenta?{' '}
                  <a href="/login" className="wf-form-link">
                    Inicia sesión
                  </a>
                </p>
              ) : (
                <p>
                  <a href="/login" className="wf-form-link">
                    Volver al inicio de sesión
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Panel de anuncio/promocional */}
        <div 
          className="wf-auth-announcement-panel"
          style={'backgroundImage' in announcement && announcement.backgroundImage ? {
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4)), url(${announcement.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          } : undefined}
        >
          <div className="wf-auth-announcement-content">
            <h2 className="wf-auth-announcement-title">
              {announcement.title}
            </h2>
            <p className="wf-auth-announcement-description">
              {announcement.description}
            </p>
            {'action' in announcement && announcement.action && (
              <a
                href={announcement.action.href}
                className="wf-btn wf-btn-outline-light wf-btn-lg"
              >
                {announcement.action.text}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthFormProfessional;