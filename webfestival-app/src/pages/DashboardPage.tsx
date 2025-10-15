import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/auth/ProtectedRoute';

/**
 * Página de dashboard (temporal para testing de autenticación)
 */
const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <ProtectedRoute>
      <Container className="py-5">
        <Row>
          <Col>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1>Dashboard</h1>
              <Button variant="outline-danger" onClick={handleLogout}>
                Cerrar Sesión
              </Button>
            </div>

            <Card>
              <Card.Body>
                <Card.Title>¡Bienvenido, {user?.nombre}!</Card.Title>
                <Card.Text>
                  Has iniciado sesión exitosamente en WebFestival.
                </Card.Text>
                
                <div className="mt-4">
                  <h5>Información de tu cuenta:</h5>
                  <ul className="list-unstyled">
                    <li><strong>ID:</strong> {user?.id}</li>
                    <li><strong>Email:</strong> {user?.email}</li>
                    <li><strong>Rol:</strong> {user?.role}</li>
                    <li><strong>Fecha de registro:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</li>
                  </ul>
                </div>

                <div className="alert alert-success mt-4">
                  <strong>Sistema de autenticación funcionando correctamente!</strong>
                  <br />
                  ✅ Contexto de autenticación con JWT
                  <br />
                  ✅ Hooks para login, logout y verificación de roles
                  <br />
                  ✅ Componentes de login, registro y recuperación de contraseña
                  <br />
                  ✅ Protección de rutas implementada
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </ProtectedRoute>
  );
};

export default DashboardPage;