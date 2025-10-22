import React from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatsCard from '../components/ui/StatsCard';
import SimpleChart from '../components/ui/SimpleChart';

/**
 * Dashboard específico para administradores de contenido
 */
const ContentAdminDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <Container fluid className="py-4">
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="h2 mb-1 text-white">Panel de Gestión de Contenido</h1>
                <p className="text-light mb-0">Gestiona contenido, blog y comunidad</p>
              </div>
              <Badge bg="info" className="fs-6">
                {user?.role}
              </Badge>
            </div>
          </Col>
        </Row>

        {/* Estadísticas de Contenido */}
        <Row className="mb-4">
          <Col lg={3} md={6} className="mb-3">
            <StatsCard
              title="Posts Publicados"
              value={156}
              icon="📝"
              color="primary"
              trend={{ value: 8, isPositive: true }}
            />
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <StatsCard
              title="Suscriptores Newsletter"
              value={2847}
              icon="📧"
              color="success"
              trend={{ value: 15, isPositive: true }}
            />
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <StatsCard
              title="Comentarios Moderados"
              value={89}
              icon="🛡️"
              color="warning"
              trend={{ value: 3, isPositive: false }}
            />
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <StatsCard
              title="Engagement Rate"
              value="12.5%"
              icon="📊"
              color="info"
              trend={{ value: 2, isPositive: true }}
            />
          </Col>
        </Row>

        {/* Gráficos de Contenido */}
        <Row className="mb-4">
          <Col lg={8}>
            <SimpleChart
              title="Engagement por Mes"
              type="line"
              height={250}
              data={[
                { label: 'Ene', value: 85 },
                { label: 'Feb', value: 92 },
                { label: 'Mar', value: 78 },
                { label: 'Abr', value: 105 },
                { label: 'May', value: 118 },
                { label: 'Jun', value: 125 }
              ]}
            />
          </Col>
          <Col lg={4}>
            <SimpleChart
              title="Contenido por Tipo"
              type="donut"
              height={250}
              data={[
                { label: 'Blog Posts', value: 45, color: '#346CB0' },
                { label: 'Tutoriales', value: 30, color: '#2ed573' },
                { label: 'Noticias', value: 15, color: '#ffa502' },
                { label: 'Eventos', value: 10, color: '#3742fa' }
              ]}
            />
          </Col>
        </Row>

        {/* Módulos de Gestión de Contenido */}
        <Row>
          <Col md={6} className="mb-4">
            <Card className="h-100 bg-dark text-white border-0">
              <Card.Body>
                <Card.Title className="text-white">✏️ CMS Dinámico</Card.Title>
                <Card.Text className="text-light">
                  Gestiona contenido estático, blog posts y secciones CMS de forma unificada
                </Card.Text>
                <Button variant="info" disabled>
                  Gestionar Contenido (Próximamente)
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} className="mb-4">
            <Card className="h-100 bg-dark text-white border-0">
              <Card.Body>
                <Card.Title className="text-white">📄 Blog de la Comunidad</Card.Title>
                <Card.Text className="text-light">
                  Crear y editar posts del blog con editor WYSIWYG
                </Card.Text>
                <Button variant="outline-info" disabled>
                  Gestionar Blog (Próximamente)
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} className="mb-4">
            <Card className="h-100 bg-dark text-white border-0">
              <Card.Body>
                <Card.Title className="text-white">🎓 Contenido Educativo</Card.Title>
                <Card.Text className="text-light">
                  Gestionar tutoriales y guías por tipo de medio (foto, video, audio, cine)
                </Card.Text>
                <Button variant="outline-success" disabled>
                  Gestionar Tutoriales (Próximamente)
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} className="mb-4">
            <Card className="h-100 bg-dark text-white border-0">
              <Card.Body>
                <Card.Title className="text-white">🛡️ Moderación</Card.Title>
                <Card.Text className="text-light">
                  Moderar comentarios y gestionar reportes de contenido
                </Card.Text>
                <Button variant="outline-warning" disabled>
                  Panel de Moderación (Próximamente)
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col md={12} className="mb-4">
            <Card className="h-100 bg-dark text-white border-0">
              <Card.Body>
                <Card.Title className="text-white">📊 Analytics de Contenido</Card.Title>
                <Card.Text className="text-light">
                  Estadísticas de engagement, contenido más popular y métricas del newsletter
                </Card.Text>
                <Button variant="outline-primary" disabled>
                  Ver Analytics (Próximamente)
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </DashboardLayout>
  );
};

export default ContentAdminDashboard;