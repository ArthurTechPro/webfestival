import React from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

/**
 * Dashboard específico para administradores de contenido
 */
const ContentAdminDashboard: React.FC = () => {
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
              <h1>Panel de Gestión de Contenido</h1>
              <Badge bg="info" className="fs-6">
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
                  <Card.Title>CMS Dinámico</Card.Title>
                  <Card.Text>
                    Gestiona contenido estático, blog posts y secciones CMS de forma unificada
                  </Card.Text>
                  <Button variant="info" disabled>
                    Gestionar Contenido (Próximamente)
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>Blog de la Comunidad</Card.Title>
                  <Card.Text>
                    Crear y editar posts del blog con editor WYSIWYG
                  </Card.Text>
                  <Button variant="info" disabled>
                    Gestionar Blog (Próximamente)
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>Contenido Educativo</Card.Title>
                  <Card.Text>
                    Gestionar tutoriales y guías por tipo de medio (foto, video, audio, cine)
                  </Card.Text>
                  <Button variant="outline-info" disabled>
                    Gestionar Tutoriales (Próximamente)
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>Moderación</Card.Title>
                  <Card.Text>
                    Moderar comentarios y gestionar reportes de contenido
                  </Card.Text>
                  <Button variant="outline-info" disabled>
                    Panel de Moderación (Próximamente)
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            <Col md={12} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>Analytics de Contenido</Card.Title>
                  <Card.Text>
                    Estadísticas de engagement, contenido más popular y métricas del newsletter
                  </Card.Text>
                  <Button variant="outline-info" disabled>
                    Ver Analytics (Próximamente)
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

export default ContentAdminDashboard;