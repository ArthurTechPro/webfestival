import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthForm } from '../../hooks/useAuthForm';
import { useRoleBasedNavigation } from '../../hooks/useRoleBasedNavigation';
import type { RegisterData } from '../../types/auth';

/**
 * Componente de formulario de registro con estilos SCSS
 */
const RegisterForm: React.FC = () => {
  const { register } = useAuth();
  const { navigateToDashboard } = useRoleBasedNavigation();
  const {
    isSubmitting,
    errors,
    validateRegisterData,
    executeFormAction,
  } = useAuthForm();

  const [formData, setFormData] = useState<RegisterData>({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  /**
   * Manejar cambios en los campos del formulario
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Manejar envío del formulario
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptedTerms) {
      alert('Debes aceptar los términos y condiciones para continuar');
      return;
    }

    if (!validateRegisterData(formData)) {
      return;
    }

    await executeFormAction(async () => {
      await register(formData);
      navigateToDashboard();
    });
  };

  return (
    <main className="wf-auth-modern">
      <div className="wf-auth-container">
        
        {/* Panel Izquierdo - Welcome */}
        <div className="wf-auth-welcome-panel">
          {/* Formas orgánicas de fondo - variante para registro */}
          <div className="wf-auth-bg-shapes">
            <div className="wf-shape wf-shape-register-1"></div>
            <div className="wf-shape wf-shape-register-2"></div>
            <div className="wf-shape wf-shape-register-3"></div>
            <div className="wf-shape wf-shape-register-4"></div>
            <div className="wf-shape wf-shape-register-5"></div>
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
                Únete a Nuestra<br />
                Comunidad
              </h1>
              <p className="wf-welcome-subtitle">
                Crea tu cuenta para<br />
                comenzar tu viaje creativo
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
              <h2 className="wf-auth-title">Crear Cuenta</h2>
              <p className="wf-auth-subtitle">
                ¿Ya tienes cuenta? <Link to="/login" className="wf-auth-link">Inicia sesión</Link>
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
              
              {/* Campo Nombre */}
              <div className="wf-form-group">
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="wf-form-control-modern"
                  placeholder="Nombre Completo"
                  disabled={isSubmitting}
                  autoComplete="name"
                  required
                />
                {errors.nombre && (
                  <div className="wf-form-error">{errors.nombre}</div>
                )}
              </div>

              {/* Campo Email */}
              <div className="wf-form-group">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="wf-form-control-modern"
                  placeholder="Correo Electrónico"
                  disabled={isSubmitting}
                  autoComplete="email"
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
                  value={formData.password}
                  onChange={handleInputChange}
                  className="wf-form-control-modern"
                  placeholder="Contraseña (mín. 6 caracteres)"
                  disabled={isSubmitting}
                  autoComplete="new-password"
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

              {/* Campo Confirmar Password */}
              <div className="wf-form-group wf-password-group">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="wf-form-control-modern"
                  placeholder="Confirmar Contraseña"
                  disabled={isSubmitting}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="wf-password-toggle-modern"
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
                {errors.confirmPassword && (
                  <div className="wf-form-error">{errors.confirmPassword}</div>
                )}
              </div>

              {/* Checkbox Términos */}
              <div className="wf-form-group wf-terms-group">
                <div className="wf-custom-control wf-custom-checkbox">
                  <input
                    type="checkbox"
                    className="wf-custom-control-input"
                    id="accept-terms"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    disabled={isSubmitting}
                    required
                  />
                  <label className="wf-custom-control-label" htmlFor="accept-terms">
                    Acepto los{' '}
                    <Link to="/terms" target="_blank" className="wf-auth-link">
                      términos y condiciones
                    </Link>{' '}
                    y la{' '}
                    <Link to="/privacy" target="_blank" className="wf-auth-link">
                      política de privacidad
                    </Link>
                  </label>
                </div>
              </div>

              {/* Botón Create Account */}
              <button
                type="submit"
                disabled={isSubmitting || !acceptedTerms}
                className="wf-btn-modern wf-btn-primary"
              >
                <span>{isSubmitting ? 'Creando cuenta...' : 'CREAR CUENTA'}</span>
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
                  <span>Registrarse con Google</span>
                </button>
                
                <button
                  type="button"
                  className="wf-btn-social wf-btn-facebook"
                >
                  <span className="wf-social-icon">📘</span>
                  <span>Registrarse con Facebook</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default RegisterForm;