import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthForm } from '../../hooks/useAuthForm';
import { useRoleBasedNavigation } from '../../hooks/useRoleBasedNavigation';
import type { RegisterData } from '../../types/auth';

/**
 * Componente de formulario de registro
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
    <div className="register-form">
      <div className="text-center mb-4">
        <h2 className="h3 mb-3 fw-normal">Crear Cuenta</h2>
        <p className="text-muted">
          Únete a la comunidad de WebFestival
        </p>
      </div>

      {errors.general && (
        <Alert variant="danger" className="mb-3">
          {errors.general}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Nombre completo</Form.Label>
          <Form.Control
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            placeholder="Tu nombre completo"
            isInvalid={!!errors.nombre}
            disabled={isSubmitting}
            autoComplete="name"
          />
          <Form.Control.Feedback type="invalid">
            {errors.nombre}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="tu@email.com"
            isInvalid={!!errors.email}
            disabled={isSubmitting}
            autoComplete="email"
          />
          <Form.Control.Feedback type="invalid">
            {errors.email}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Contraseña</Form.Label>
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

        <Form.Group className="mb-3">
          <Form.Label>Confirmar contraseña</Form.Label>
          <div className="position-relative">
            <Form.Control
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Repite tu contraseña"
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

        <Form.Group className="mb-3">
          <Form.Check
            type="checkbox"
            id="accept-terms"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            disabled={isSubmitting}
            label={
              <>
                Acepto los{' '}
                <Link to="/terms" target="_blank" className="text-decoration-none">
                  términos y condiciones
                </Link>{' '}
                y la{' '}
                <Link to="/privacy" target="_blank" className="text-decoration-none">
                  política de privacidad
                </Link>
              </>
            }
            required
          />
        </Form.Group>

        <Button
          variant="primary"
          type="submit"
          className="w-100 mb-3"
          disabled={isSubmitting || !acceptedTerms}
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
              Creando cuenta...
            </>
          ) : (
            'Crear Cuenta'
          )}
        </Button>

        <div className="text-center">
          <span className="text-muted">¿Ya tienes cuenta? </span>
          <Link to="/login" className="text-decoration-none">
            Inicia sesión aquí
          </Link>
        </div>
      </Form>
    </div>
  );
};

export default RegisterForm;