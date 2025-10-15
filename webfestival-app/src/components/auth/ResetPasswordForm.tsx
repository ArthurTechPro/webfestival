import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { authService } from '../../services/auth.service';
import { useAuthForm } from '../../hooks/useAuthForm';
import type { ResetPasswordData } from '../../types/auth';

/**
 * Componente de formulario para restablecer contraseña
 */
const ResetPasswordForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    isSubmitting,
    errors,
    executeFormAction,
    handleServerError,
  } = useAuthForm();

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Obtener token de la URL
  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (!urlToken) {
      navigate('/forgot-password', { replace: true });
    } else {
      setToken(urlToken);
    }
  }, [searchParams, navigate]);

  /**
   * Validar datos del formulario
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (Object.keys(newErrors).length > 0) {
      handleServerError({ message: '', field: Object.keys(newErrors)[0] });
      return false;
    }

    return true;
  };

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

    if (!token) {
      handleServerError({ message: 'Token inválido o expirado' });
      return;
    }

    if (!validateForm()) {
      return;
    }

    const resetData: ResetPasswordData = {
      token,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    };

    await executeFormAction(async () => {
      await authService.resetPassword(resetData);
      setIsSuccess(true);
    });
  };

  // Mostrar mensaje de éxito
  if (isSuccess) {
    return (
      <div className="reset-password-success text-center">
        <div className="mb-4">
          <div className="text-success mb-3" style={{ fontSize: '3rem' }}>
            ✅
          </div>
          <h2 className="h4 mb-3">Contraseña restablecida</h2>
          <p className="text-muted mb-4">
            Tu contraseña ha sido restablecida exitosamente.
            Ya puedes iniciar sesión con tu nueva contraseña.
          </p>
        </div>

        <Link to="/login" className="btn btn-primary btn-lg">
          Iniciar sesión
        </Link>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="text-center">
        <Alert variant="danger">
          <strong>Token inválido</strong>
          <br />
          El enlace de restablecimiento es inválido o ha expirado.
        </Alert>
        <Link to="/forgot-password" className="btn btn-primary">
          Solicitar nuevo enlace
        </Link>
      </div>
    );
  }

  return (
    <div className="reset-password-form">
      <div className="text-center mb-4">
        <h2 className="h3 mb-3 fw-normal">Nueva Contraseña</h2>
        <p className="text-muted">
          Ingresa tu nueva contraseña
        </p>
      </div>

      {errors.general && (
        <Alert variant="danger" className="mb-3">
          {errors.general}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Nueva contraseña</Form.Label>
          <div className="position-relative">
            <Form.Control
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Mínimo 6 caracteres"
              isInvalid={!!errors.password}
              disabled={isSubmitting}
              autoComplete="new-password"
              autoFocus
            />
            <Button
              variant="outline-secondary"
              size="sm"
              className="position-absolute top-50 end-0 translate-middle-y me-2"
              style={{ border: 'none', background: 'transparent' }}
              onClick={() => setShowPassword(!showPassword)}
              disabled={isSubmitting}
              type="button"
            >
              {showPassword ? '🙈' : '👁️'}
            </Button>
          </div>
          <Form.Control.Feedback type="invalid">
            {errors.password}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>Confirmar nueva contraseña</Form.Label>
          <div className="position-relative">
            <Form.Control
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Repite tu nueva contraseña"
              isInvalid={!!errors.confirmPassword}
              disabled={isSubmitting}
              autoComplete="new-password"
            />
            <Button
              variant="outline-secondary"
              size="sm"
              className="position-absolute top-50 end-0 translate-middle-y me-2"
              style={{ border: 'none', background: 'transparent' }}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isSubmitting}
              type="button"
            >
              {showConfirmPassword ? '🙈' : '👁️'}
            </Button>
          </div>
          <Form.Control.Feedback type="invalid">
            {errors.confirmPassword}
          </Form.Control.Feedback>
        </Form.Group>

        <Button
          variant="primary"
          type="submit"
          className="w-100 mb-3"
          disabled={isSubmitting}
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Restableciendo...
            </>
          ) : (
            'Restablecer contraseña'
          )}
        </Button>

        <div className="text-center">
          <Link to="/login" className="text-decoration-none">
            ← Volver al inicio de sesión
          </Link>
        </div>
      </Form>
    </div>
  );
};

export default ResetPasswordForm;