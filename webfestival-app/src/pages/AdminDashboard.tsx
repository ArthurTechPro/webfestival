import React from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

/**
 * Dashboard específico para administradores
 */
const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <Container className="py-5">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1>Panel de Administración</h1>
              <Badge bg="danger" className="fs-6">
                {user?.role}
              </Badge>
            </div>
            <Button variant="outline-danger" onClick={handleLogout}>
              Cerrar Sesión
            </Button>
          </div>

          <Row>
            <Col md={4} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>Gestión de Concursos</Card.Title>
                  <Card.Text>
                    Crear, editar y gestionar concursos multimedia
                  </Card.Text>
                  <Button variant="danger" disabled>
                    Gestionar Concursos (Próximamente)
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>Gestión de Usuarios</Card.Title>
                  <Card.Text>
                    Administrar usuarios, roles y permisos
                  </Card.Text>
                  <Button variant="danger" disabled>
                    Gestionar Usuarios (Próximamente)
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>Asignación de Jurados</Card.Title>
                  <Card.Text>
                    Asignar jurados especializados a categorías
                  </Card.Text>
                  <Button variant="danger" disabled>
                    Asignar Jurados (Próximamente)
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>Criterios de Evaluación</Card.Title>
                  <Card.Text>
                    Gestionar criterios dinámicos por tipo de medio
                  </Card.Text>
                  <Button variant="outline-danger" disabled>
                    Gestionar Criterios (Próximamente)
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>Métricas y Analytics</Card.Title>
                  <Card.Text>
                    Estadísticas detalladas de la plataforma
                  </Card.Text>
                  <Button variant="outline-danger" disabled>
                    Ver Métricas (Próximamente)
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>Suscripciones</Card.Title>
                  <Card.Text>
                    Gestionar planes y suscripciones de usuarios
                  </Card.Text>
                  <Button variant="outline-danger" disabled>
                    Gestionar Suscripciones (Próximamente)
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card className="mt-4">
            <Card.Body>
              <Card.Title>Información de tu cuenta</Card.Title>
              <Row>
                <Col md={6}>
                  <ul className="list-unstyled">
                    <li><strong>Nombre:</strong> {user?.nombre}</li>
                    <li><strong>Email:</strong> {user?.email}</li>
                    <li><strong>Rol:</strong> {user?.role}</li>
                  </ul>
                </Col>
                <Col md={6}>
                  <ul className="list-unstyled">
                    <li><strong>ID:</strong> {user?.id}</li>
                    <li><strong>Registro:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</li>
                  </ul>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;