import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/auth/ProtectedRoute';

/**
 * Página de perfil de usuario (temporal)
 */
const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <Container className="py-5">
        <Row>
          <Col md={8} className="mx-auto">
            <h1 className="text-center mb-5">Mi Perfil</h1>
            
            <Card>
              <Card.Body>
                <Card.Title>Información Personal</Card.Title>
                
                <Row className="mb-3">
                  <Col md={6}>
                    <strong>Nombre:</strong> {user?.nombre}
                  </Col>
                  <Col md={6}>
                    <strong>Email:</strong> {user?.email}
                  </Col>
                </Row>
                
                <Row className="mb-3">
                  <Col md={6}>
                    <strong>Rol:</strong> {user?.role}
                  </Col>
                  <Col md={6}>
                    <strong>ID:</strong> {user?.id}
                  </Col>
                </Row>
                
                <Row className="mb-3">
                  <Col md={12}>
                    <strong>Fecha de registro:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </Col>
                </Row>
                
                {user?.bio && (
                  <Row className="mb-3">
                    <Col md={12}>
                      <strong>Biografía:</strong>
                      <p className="mt-2">{user.bio}</p>
                    </Col>
                  </Row>
                )}
                
                <div className="text-center mt-4">
                  <Button variant="primary" disabled>
                    Editar Perfil (Próximamente)
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </ProtectedRoute>
  );
};

export default ProfilePage;