import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import ResetPasswordForm from '../components/auth/ResetPasswordForm';
import PublicRoute from '../components/auth/PublicRoute';

/**
 * Página de restablecimiento de contraseña
 */
const ResetPasswordPage: React.FC = () => {
  return (
    <PublicRoute>
      <div className="min-vh-100 d-flex align-items-center bg-light">
        <Container>
          <Row className="justify-content-center">
            <Col md={6} lg={5} xl={4}>
              <Card className="shadow-sm">
                <Card.Body className="p-4">
                  <div className="text-center mb-4">
                    <img
                      src="/logo.svg"
                      alt="WebFestival"
                      height="40"
                      className="mb-3"
                    />
                  </div>
                  <ResetPasswordForm />
                </Card.Body>
              </Card>
              
              <div className="text-center mt-3">
                <small className="text-muted">
                  © 2024 WebFestival. Todos los derechos reservados.
                </small>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </PublicRoute>
  );
};

export default ResetPasswordPage;