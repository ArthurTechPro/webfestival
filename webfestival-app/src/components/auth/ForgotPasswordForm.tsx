import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { authService } from '../../services/auth.service';
import { useAuthForm } from '../../hooks/useAuthForm';
import type { ForgotPasswordData } from '../../types/auth';

/**
 * Componente de formulario para recuperación de contraseña
 */
const ForgotPasswordForm: React.FC = () => {
  const {
    isSubmitting,
    errors,
    validateEmail,
    executeFormAction,
  } = useAuthForm();

  const [email, setEmail] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);

  /**
   * Manejar envío del formulario
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      return;
    }

    const formData: ForgotPasswordData = { email };

    await executeFormAction(async () => {
      await authService.forgotPassword(formData);
      setIsEmailSent(true);
    });
  };

  // Mostrar mensaje de éxito si el email fue enviado
  if (isEmailSent) {
    return (
      <div className="forgot-password-success text-center">
        <div className="mb-4">
          <div className="text-success mb-3" style={{ fontSize: '3rem' }}>
            ✉️
          </div>
          <h2 className="h4 mb-3">Email enviado</h2>
          <p className="text-muted mb-4">
            Hemos enviado las instrucciones para restablecer tu contraseña a{' '}
            <strong>{email}</strong>
          </p>
        </div>

        <Alert variant="info" className="mb-4">
          <strong>¿No ves el email?</strong>
          <br />
          Revisa tu carpeta de spam o correo no deseado.
          <br />
          El enlace expirará en 1 hora.
        </Alert>

        <div className="d-grid gap-2">
          <Button
            variant="outline-primary"
            onClick={() => {
              setIsEmailSent(false);
              setEmail('');
            }}
          >
            Enviar a otro email
          </Button>
          
          <Link to="/login" className="btn btn-primary">
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-form">
      <div className="text-center mb-4">
        <h2 className="h3 mb-3 fw-normal">Recuperar Contraseña</h2>
        <p className="text-muted">
          Ingresa tu email y te enviaremos las instrucciones para restablecer tu contraseña
        </p>
      </div>

      {errors.general && (
        <Alert variant="danger" className="mb-3">
          {errors.general}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-4">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            isInvalid={!!errors.email}
            disabled={isSubmitting}
            autoComplete="email"
            autoFocus
          />
          <Form.Control.Feedback type="invalid">
            {errors.email}
          </Form.Control.Feedback>
          <Form.Text className="text-muted">
            Debe ser el email con el que te registraste en WebFestival
          </Form.Text>
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
              Enviando...
            </>
          ) : (
            'Enviar instrucciones'
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

export default ForgotPasswordForm;