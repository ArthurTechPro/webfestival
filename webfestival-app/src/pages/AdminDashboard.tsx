import React from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatsCard from '../components/ui/StatsCard';
import SimpleChart from '../components/ui/SimpleChart';

/**
 * Dashboard específico para administradores
 */
const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <Container fluid className="py-4">
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="h2 mb-1 text-white">Panel de Administración</h1>
                <p className="text-light mb-0">Gestiona toda la plataforma WebFestival</p>
              </div>
              <Badge bg="danger" className="fs-6">
                {user?.role}
              </Badge>
            </div>
          </Col>
        </Row>

        {/* Estadísticas del Sistema */}
        <Row className="mb-4">
          <Col lg={3} md={6} className="mb-3">
            <StatsCard
              title="Total Usuarios"
              value={1247}
              icon="👥"
              color="primary"
              trend={{ value: 12, isPositive: true }}
            />
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <StatsCard
              title="Concursos Activos"
              value={8}
              icon="🏆"
              color="success"
              trend={{ value: 2, isPositive: true }}
            />
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <StatsCard
              title="Medios Subidos"
              value={3542}
              icon="📁"
              color="info"
              trend={{ value: 25, isPositive: true }}
            />
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <StatsCard
              title="Ingresos Mensuales"
              value="$12.5K"
              icon="💰"
              color="warning"
              trend={{ value: 8, isPositive: true }}
            />
          </Col>
        </Row>

        {/* Gráficos de Analytics */}
        <Row className="mb-4">
          <Col lg={8}>
            <SimpleChart
              title="Usuarios Registrados por Mes"
              type="bar"
              height={250}
              data={[
                { label: 'Ene', value: 120 },
                { label: 'Feb', value: 190 },
                { label: 'Mar', value: 150 },
                { label: 'Abr', value: 220 },
                { label: 'May', value: 180 },
                { label: 'Jun', value: 250 }
              ]}
            />
          </Col>
          <Col lg={4}>
            <SimpleChart
              title="Usuarios por Rol"
              type="donut"
              height={250}
              data={[
                { label: 'Participantes', value: 1180, color: '#346CB0' },
                { label: 'Jurados', value: 45, color: '#2ed573' },
                { label: 'Admins', value: 15, color: '#ffa502' },
                { label: 'Content', value: 7, color: '#3742fa' }
              ]}
            />
          </Col>
        </Row>

        {/* Módulos de Administración */}
        <Row>
          <Col md={4} className="mb-4">
            <Card className="h-100 bg-dark text-white border-0">
              <Card.Body>
                <Card.Title className="text-white">🏆 Gestión de Concursos</Card.Title>
                <Card.Text className="text-light">
                  Crear, editar y gestionar concursos multimedia
                </Card.Text>
                <Button variant="danger" disabled>
                  Gestionar Concursos (Próximamente)
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4} className="mb-4">
            <Card className="h-100 bg-dark text-white border-0">
              <Card.Body>
                <Card.Title className="text-white">👥 Gestión de Usuarios</Card.Title>
                <Card.Text className="text-light">
                  Administrar usuarios, roles y permisos
                </Card.Text>
                <Button variant="outline-danger" disabled>
                  Gestionar Usuarios (Próximamente)
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4} className="mb-4">
            <Card className="h-100 bg-dark text-white border-0">
              <Card.Body>
                <Card.Title className="text-white">⚖️ Asignación de Jurados</Card.Title>
                <Card.Text className="text-light">
                  Asignar jurados especializados a categorías
                </Card.Text>
                <Button variant="outline-warning" disabled>
                  Asignar Jurados (Próximamente)
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4} className="mb-4">
            <Card className="h-100 bg-dark text-white border-0">
              <Card.Body>
                <Card.Title className="text-white">📝 Criterios de Evaluación</Card.Title>
                <Card.Text className="text-light">
                  Gestionar criterios dinámicos por tipo de medio
                </Card.Text>
                <Button variant="outline-info" disabled>
                  Gestionar Criterios (Próximamente)
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4} className="mb-4">
            <Card className="h-100 bg-dark text-white border-0">
              <Card.Body>
                <Card.Title className="text-white">📊 Métricas y Analytics</Card.Title>
                <Card.Text className="text-light">
                  Estadísticas detalladas de la plataforma
                </Card.Text>
                <Button variant="outline-success" disabled>
                  Ver Métricas (Próximamente)
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4} className="mb-4">
            <Card className="h-100 bg-dark text-white border-0">
              <Card.Body>
                <Card.Title className="text-white">💳 Suscripciones</Card.Title>
                <Card.Text className="text-light">
                  Gestionar planes y suscripciones de usuarios
                </Card.Text>
                <Button variant="outline-primary" disabled>
                  Gestionar Suscripciones (Próximamente)
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </DashboardLayout>
  );
};

export default AdminDashboard;