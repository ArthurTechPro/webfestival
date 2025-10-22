import React from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatsCard from '../components/ui/StatsCard';
import SimpleChart from '../components/ui/SimpleChart';

/**
 * Dashboard específico para jurados especializados
 */
const JuradoDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <Container fluid className="py-4">
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="h2 mb-1 text-white">Panel de Evaluación</h1>
                <p className="text-light mb-0">Gestiona tus evaluaciones y especialización</p>
              </div>
              <Badge bg="success" className="fs-6">
                {user?.role}
              </Badge>
            </div>
          </Col>
        </Row>

        {/* Estadísticas del Jurado */}
        <Row className="mb-4">
          <Col lg={3} md={6} className="mb-3">
            <StatsCard
              title="Evaluaciones Pendientes"
              value={12}
              icon="📋"
              color="warning"
              trend={{ value: 5, isPositive: false }}
            />
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <StatsCard
              title="Evaluaciones Completadas"
              value={48}
              icon="✅"
              color="success"
              trend={{ value: 15, isPositive: true }}
            />
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <StatsCard
              title="Especialización"
              value={3}
              icon="🥇"
              color="info"
              trend={{ value: 1, isPositive: true }}
            />
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <StatsCard
              title="Promedio Calificación"
              value="8.7"
              icon="⭐"
              color="primary"
              trend={{ value: 2, isPositive: true }}
            />
          </Col>
        </Row>

        {/* Gráficos de Evaluaciones */}
        <Row className="mb-4">
          <Col lg={8}>
            <SimpleChart
              title="Evaluaciones por Mes"
              type="bar"
              height={250}
              data={[
                { label: 'Ene', value: 8 },
                { label: 'Feb', value: 12 },
                { label: 'Mar', value: 15 },
                { label: 'Abr', value: 10 },
                { label: 'May', value: 18 },
                { label: 'Jun', value: 14 }
              ]}
            />
          </Col>
          <Col lg={4}>
            <SimpleChart
              title="Por Especialización"
              type="donut"
              height={250}
              data={[
                { label: 'Fotografía', value: 35, color: '#346CB0' },
                { label: 'Video', value: 25, color: '#2ed573' },
                { label: 'Audio', value: 20, color: '#ffa502' },
                { label: 'Cine', value: 20, color: '#3742fa' }
              ]}
            />
          </Col>
        </Row>

        {/* Acciones Rápidas */}
        <Row>
          <Col md={6} className="mb-4">
            <Card className="h-100 bg-dark text-white border-0">
              <Card.Body>
                <Card.Title className="text-white">🎯 Evaluaciones Pendientes</Card.Title>
                <Card.Text className="text-light">
                  Medios multimedia que requieren tu evaluación profesional
                </Card.Text>
                <Button variant="warning" disabled>
                  Evaluar Medios (Próximamente)
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} className="mb-4">
            <Card className="h-100 bg-dark text-white border-0">
              <Card.Body>
                <Card.Title className="text-white">🥇 Mi Especialización</Card.Title>
                <Card.Text className="text-light">
                  Configura tus áreas de expertise (fotografía, video, audio, cine)
                </Card.Text>
                <Button variant="outline-success" disabled>
                  Gestionar Especialización (Próximamente)
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} className="mb-4">
            <Card className="h-100 bg-dark text-white border-0">
              <Card.Body>
                <Card.Title className="text-white">📊 Progreso de Evaluaciones</Card.Title>
                <Card.Text className="text-light">
                  Revisa tu progreso y métricas de evaluación por tipo de medio
                </Card.Text>
                <Button variant="outline-info" disabled>
                  Ver Progreso (Próximamente)
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} className="mb-4">
            <Card className="h-100 bg-dark text-white border-0">
              <Card.Body>
                <Card.Title className="text-white">📋 Categorías Asignadas</Card.Title>
                <Card.Text className="text-light">
                  Revisa las categorías que tienes asignadas para evaluar
                </Card.Text>
                <Button variant="outline-primary" disabled>
                  Ver Asignaciones (Próximamente)
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </DashboardLayout>
  );
};

export default JuradoDashboard;