import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Nav } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatsCard from '../components/ui/StatsCard';
import SimpleChart from '../components/ui/SimpleChart';
import ConcursoManagement from '../components/admin/ConcursoManagement';
import UserManagement from '../components/admin/UserManagement';
import JuryAssignment from '../components/admin/JuryAssignment';
import AdminMetrics from '../components/admin/AdminMetrics';
import CriteriaManagement from '../components/admin/CriteriaManagement';
import { useAdmin } from '../hooks/useAdmin';

/**
 * Dashboard específico para administradores
 */
const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { stats } = useAdmin();

  // Estado para controlar la vista activa
  const [activeView, setActiveView] = useState<'dashboard' | 'concursos' | 'usuarios' | 'jurados' | 'criterios' | 'metricas'>('dashboard');

  // Renderizar contenido según la vista activa
  const renderContent = () => {
    switch (activeView) {
      case 'concursos':
        return <ConcursoManagement />;
      case 'usuarios':
        return <UserManagement />;
      case 'jurados':
        return <JuryAssignment />;
      case 'criterios':
        return <CriteriaManagement />;
      case 'metricas':
        return <AdminMetrics />;
      default:
        return renderDashboardOverview();
    }
  };

  // Renderizar vista general del dashboard
  const renderDashboardOverview = () => (
    <>
      {/* Estadísticas del Sistema */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <StatsCard
            title="Total Usuarios"
            value={stats?.totalUsuarios || 1247}
            icon="👥"
            color="primary"
            trend={{ value: 12, isPositive: true }}
          />
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <StatsCard
            title="Concursos Activos"
            value={stats?.concursosActivos || 8}
            icon="🏆"
            color="success"
            trend={{ value: 2, isPositive: true }}
          />
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <StatsCard
            title="Medios Subidos"
            value={stats?.mediosSubidos || 3542}
            icon="📁"
            color="info"
            trend={{ value: 25, isPositive: true }}
          />
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <StatsCard
            title="Ingresos Mensuales"
            value={stats?.ingresosMensuales || "$12.5K"}
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
            data={stats?.crecimientoMensual?.map(item => ({
              label: item.mes,
              value: item.usuarios
            })) || [
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
            data={stats?.usuariosPorRol ? Object.entries(stats.usuariosPorRol).map(([role, count]) => ({
              label: role,
              value: count,
              color: getRoleColor(role)
            })) : [
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
              <Button
                variant="danger"
                onClick={() => setActiveView('concursos')}
              >
                Gestionar Concursos
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
              <Button
                variant="outline-danger"
                onClick={() => setActiveView('usuarios')}
              >
                Gestionar Usuarios
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
              <Button
                variant="outline-warning"
                onClick={() => setActiveView('jurados')}
              >
                Asignar Jurados
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-4">
          <Card className="h-100 bg-dark text-white border-0">
            <Card.Body>
              <Card.Title className="text-white">🎯 Criterios de Evaluación</Card.Title>
              <Card.Text className="text-light">
                Gestionar criterios dinámicos por tipo de medio
              </Card.Text>
              <Button
                variant="outline-info"
                onClick={() => setActiveView('criterios')}
              >
                Gestionar Criterios
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
              <Button
                variant="outline-success"
                onClick={() => setActiveView('metricas')}
              >
                Ver Métricas
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
    </>
  );

  // Función auxiliar para obtener colores por rol
  const getRoleColor = (role: string): string => {
    switch (role) {
      case 'ADMIN': return '#dc3545';
      case 'JURADO': return '#ffc107';
      case 'CONTENT_ADMIN': return '#0dcaf0';
      case 'PARTICIPANTE': return '#198754';
      default: return '#6c757d';
    }
  };

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

        {/* Navegación de pestañas */}
        <Row className="mb-4">
          <Col>
            <Nav variant="pills" className="bg-dark p-2 rounded">
              <Nav.Item>
                <Nav.Link
                  active={activeView === 'dashboard'}
                  onClick={() => setActiveView('dashboard')}
                  className={activeView === 'dashboard' ? 'bg-danger text-white' : 'text-light'}
                >
                  📊 Dashboard
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  active={activeView === 'concursos'}
                  onClick={() => setActiveView('concursos')}
                  className={activeView === 'concursos' ? 'bg-danger text-white' : 'text-light'}
                >
                  🏆 Concursos
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  active={activeView === 'usuarios'}
                  onClick={() => setActiveView('usuarios')}
                  className={activeView === 'usuarios' ? 'bg-danger text-white' : 'text-light'}
                >
                  👥 Usuarios
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  active={activeView === 'jurados'}
                  onClick={() => setActiveView('jurados')}
                  className={activeView === 'jurados' ? 'bg-danger text-white' : 'text-light'}
                >
                  ⚖️ Jurados
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  active={activeView === 'criterios'}
                  onClick={() => setActiveView('criterios')}
                  className={activeView === 'criterios' ? 'bg-danger text-white' : 'text-light'}
                >
                  🎯 Criterios
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  active={activeView === 'metricas'}
                  onClick={() => setActiveView('metricas')}
                  className={activeView === 'metricas' ? 'bg-danger text-white' : 'text-light'}
                >
                  📈 Métricas
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>
        </Row>

        {/* Contenido dinámico según la vista activa */}
        {renderContent()}
      </Container>
    </DashboardLayout>
  );
};

export default AdminDashboard;