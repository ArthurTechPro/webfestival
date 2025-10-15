import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Página de acceso no autorizado
 */
const UnauthorizedPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="text-center">
            <Card.Body className="p-5">
              <div className="mb-4" style={{ fontSize: '4rem' }}>
                🚫
              </div>
              
              <h1 className="h3 mb-3">Acceso No Autorizado</h1>
              
              <p className="text-muted mb-4">
                No tienes permisos para acceder a esta página.
              </p>

              {user && (
                <div className="alert alert-info mb-4">
                  <strong>Usuario actual:</strong> {user.nombre} ({user.role})
                </div>
              )}

              <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                <Button 
                  variant="primary" 
                  onClick={handleGoBack}
                  className="me-md-2"
                >
                  Volver atrás
                </Button>
                
                <Link to="/dashboard" className="btn btn-outline-primary">
                  Ir al Dashboard
                </Link>
                
                <Button 
                  variant="outline-danger" 
                  onClick={handleLogout}
                >
                  Cerrar Sesión
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UnauthorizedPage;