import React from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

/**
 * Dashboard específico para jurados especializados
 */
const JuradoDashboard: React.FC = () => {
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
              <h1>Panel de Evaluación</h1>
              <Badge bg="success" className="fs-6">
                {user?.role}
              </Badge>
            </div>
            <Button variant="outline-danger" onClick={handleLogout}>
              Cerrar Sesión
            </Button>
          </div>

          <Row>
            <Col md={6} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>Categorías Asignadas</Card.Title>
                  <Card.Text>
                    Revisa las categorías que tienes asignadas para evaluar según tu especialización
                  </Card.Text>
                  <Button variant="success" disabled>
                    Ver Asignaciones (Próximamente)
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>Evaluaciones Pendientes</Card.Title>
                  <Card.Text>
                    Medios multimedia que requieren tu evaluación profesional
                  </Card.Text>
                  <Button variant="warning" disabled>
                    Evaluar Medios (Próximamente)
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>Mi Especialización</Card.Title>
                  <Card.Text>
                    Configura tus áreas de expertise (fotografía, video, audio, cine)
                  </Card.Text>
                  <Button variant="outline-success" disabled>
                    Gestionar Especialización (Próximamente)
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>Progreso de Evaluaciones</Card.Title>
                  <Card.Text>
                    Revisa tu progreso y métricas de evaluación por tipo de medio
                  </Card.Text>
                  <Button variant="outline-success" disabled>
                    Ver Progreso (Próximamente)
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

export default JuradoDashboard;