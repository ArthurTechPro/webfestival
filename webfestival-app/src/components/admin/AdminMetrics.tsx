import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Badge, 
  Alert,
  Spinner,
  ButtonGroup,
  Table
} from 'react-bootstrap';
import { useAdmin } from '../../hooks/useAdmin';
import StatsCard from '../ui/StatsCard';
import SimpleChart from '../ui/SimpleChart';

/**
 * Componente para métricas y analytics administrativos
 */
const AdminMetrics: React.FC = () => {
  const { 
    stats,
    metricas,
    loadStats,
    loadMetricas,
    loading,
    error,
    setError
  } = useAdmin();

  // Estados locales
  const [activeMetricType, setActiveMetricType] = useState<'participacion' | 'jurados' | 'crecimiento'>('participacion');

  // Cargar datos iniciales
  useEffect(() => {
    loadStats();
    loadMetricas(activeMetricType);
  }, [loadStats, loadMetricas, activeMetricType]);

  // Cambiar tipo de métrica
  const handleMetricTypeChange = (tipo: 'participacion' | 'jurados' | 'crecimiento') => {
    setActiveMetricType(tipo);
    loadMetricas(tipo);
  };

  // Datos para gráficos de crecimiento
  const crecimientoData = stats?.crecimientoMensual?.map(item => ({
    label: item.mes,
    value: item.usuarios
  })) || [];

  // Datos para gráfico de usuarios por rol
  const usuariosPorRolData = stats?.usuariosPorRol ? Object.entries(stats.usuariosPorRol).map(([role, count]) => ({
    label: role,
    value: count,
    color: getRoleColor(role)
  })) : [];

  // Obtener color por rol
  function getRoleColor(role: string): string {
    switch (role) {
      case 'ADMIN': return '#dc3545';
      case 'JURADO': return '#ffc107';
      case 'CONTENT_ADMIN': return '#0dcaf0';
      case 'PARTICIPANTE': return '#198754';
      default: return '#6c757d';
    }
  }

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="text-white mb-1">Métricas y Analytics</h2>
              <p className="text-light mb-0">Estadísticas detalladas de la plataforma WebFestival</p>
            </div>
            <Badge bg="info" className="fs-6">
              Actualizado en tiempo real
            </Badge>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Estadísticas Generales */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <StatsCard
            title="Total Usuarios"
            value={stats?.totalUsuarios || 0}
            icon="👥"
            color="primary"
            trend={{ value: 12, isPositive: true }}
          />
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <StatsCard
            title="Concursos Activos"
            value={stats?.concursosActivos || 0}
            icon="🏆"
            color="success"
            trend={{ value: 2, isPositive: true }}
          />
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <StatsCard
            title="Medios Subidos"
            value={stats?.mediosSubidos || 0}
            icon="📁"
            color="info"
            trend={{ value: 25, isPositive: true }}
          />
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <StatsCard
            title="Ingresos Mensuales"
            value={stats?.ingresosMensuales || '$0'}
            icon="💰"
            color="warning"
            trend={{ value: 8, isPositive: true }}
          />
        </Col>
      </Row>

      {/* Gráficos Principales */}
      <Row className="mb-4">
        <Col lg={8}>
          <SimpleChart
            title="Crecimiento de Usuarios por Mes"
            type="bar"
            height={300}
            data={crecimientoData}
          />
        </Col>
        <Col lg={4}>
          <SimpleChart
            title="Distribución de Usuarios por Rol"
            type="donut"
            height={300}
            data={usuariosPorRolData}
          />
        </Col>
      </Row>

      {/* Selector de Métricas Detalladas */}
      <Row className="mb-3">
        <Col>
          <Card className="bg-dark text-white border-0">
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Métricas Detalladas</h5>
                <ButtonGroup>
                  <Button
                    variant={activeMetricType === 'participacion' ? 'danger' : 'outline-danger'}
                    onClick={() => handleMetricTypeChange('participacion')}
                  >
                    Participación
                  </Button>
                  <Button
                    variant={activeMetricType === 'jurados' ? 'danger' : 'outline-danger'}
                    onClick={() => handleMetricTypeChange('jurados')}
                  >
                    Jurados
                  </Button>
                  <Button
                    variant={activeMetricType === 'crecimiento' ? 'danger' : 'outline-danger'}
                    onClick={() => handleMetricTypeChange('crecimiento')}
                  >
                    Crecimiento
                  </Button>
                </ButtonGroup>
              </div>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" variant="light" />
                  <p className="mt-2 text-light">Cargando métricas...</p>
                </div>
              ) : (
                <MetricasContent tipo={activeMetricType} data={metricas} />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Acciones Rápidas */}
      <Row>
        <Col>
          <Card className="bg-dark text-white border-0">
            <Card.Header>
              <h5 className="mb-0">Acciones Rápidas</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3} className="mb-3">
                  <Button 
                    variant="outline-success" 
                    className="w-100"
                    onClick={() => loadStats()}
                  >
                    🔄 Actualizar Estadísticas
                  </Button>
                </Col>
                <Col md={3} className="mb-3">
                  <Button 
                    variant="outline-info" 
                    className="w-100"
                    onClick={() => window.open('/admin/export-data', '_blank')}
                  >
                    📊 Exportar Datos
                  </Button>
                </Col>
                <Col md={3} className="mb-3">
                  <Button 
                    variant="outline-warning" 
                    className="w-100"
                    onClick={() => window.open('/admin/reports', '_blank')}
                  >
                    📈 Generar Reporte
                  </Button>
                </Col>
                <Col md={3} className="mb-3">
                  <Button 
                    variant="outline-primary" 
                    className="w-100"
                    onClick={() => window.open('/admin/analytics-dashboard', '_blank')}
                  >
                    📋 Dashboard Avanzado
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

/**
 * Componente para mostrar contenido específico de métricas
 */
interface MetricasContentProps {
  tipo: 'participacion' | 'jurados' | 'crecimiento';
  data: any;
}

const MetricasContent: React.FC<MetricasContentProps> = ({ tipo, data }) => {
  if (!data) {
    return (
      <div className="text-center py-4">
        <p className="text-light">No hay datos disponibles para mostrar.</p>
      </div>
    );
  }

  switch (tipo) {
    case 'participacion':
      return (
        <Row>
          <Col md={6}>
            <h6 className="text-light">Participación por Concurso</h6>
            <Table variant="dark" size="sm">
              <thead>
                <tr>
                  <th>Concurso</th>
                  <th>Participantes</th>
                  <th>Medios</th>
                </tr>
              </thead>
              <tbody>
                {data.concursos?.map((concurso: any, index: number) => (
                  <tr key={index}>
                    <td>{concurso.titulo}</td>
                    <td>{concurso.participantes}</td>
                    <td>{concurso.medios}</td>
                  </tr>
                )) || (
                  <tr>
                    <td colSpan={3} className="text-center text-light">
                      No hay datos de participación disponibles
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Col>
          <Col md={6}>
            <h6 className="text-light">Categorías Más Populares</h6>
            <Table variant="dark" size="sm">
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Envíos</th>
                  <th>Porcentaje</th>
                </tr>
              </thead>
              <tbody>
                {data.categorias?.map((categoria: any, index: number) => (
                  <tr key={index}>
                    <td>{categoria.nombre}</td>
                    <td>{categoria.envios}</td>
                    <td>{categoria.porcentaje}%</td>
                  </tr>
                )) || (
                  <tr>
                    <td colSpan={3} className="text-center text-light">
                      No hay datos de categorías disponibles
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Col>
        </Row>
      );

    case 'jurados':
      return (
        <Row>
          <Col md={6}>
            <h6 className="text-light">Rendimiento de Jurados</h6>
            <Table variant="dark" size="sm">
              <thead>
                <tr>
                  <th>Jurado</th>
                  <th>Evaluaciones</th>
                  <th>Tiempo Promedio</th>
                </tr>
              </thead>
              <tbody>
                {data.jurados?.map((jurado: any, index: number) => (
                  <tr key={index}>
                    <td>{jurado.nombre}</td>
                    <td>{jurado.evaluaciones}</td>
                    <td>{jurado.tiempoPromedio}</td>
                  </tr>
                )) || (
                  <tr>
                    <td colSpan={3} className="text-center text-light">
                      No hay datos de jurados disponibles
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Col>
          <Col md={6}>
            <h6 className="text-light">Especialidades</h6>
            <Table variant="dark" size="sm">
              <thead>
                <tr>
                  <th>Especialidad</th>
                  <th>Jurados</th>
                  <th>Asignaciones</th>
                </tr>
              </thead>
              <tbody>
                {data.especialidades?.map((esp: any, index: number) => (
                  <tr key={index}>
                    <td>{esp.nombre}</td>
                    <td>{esp.jurados}</td>
                    <td>{esp.asignaciones}</td>
                  </tr>
                )) || (
                  <tr>
                    <td colSpan={3} className="text-center text-light">
                      No hay datos de especialidades disponibles
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Col>
        </Row>
      );

    case 'crecimiento':
      return (
        <Row>
          <Col md={12}>
            <h6 className="text-light">Tendencias de Crecimiento</h6>
            <Row>
              <Col md={3} className="mb-3">
                <Card className="bg-secondary text-white border-0">
                  <Card.Body className="text-center">
                    <h4>{data.crecimientoSemanal || '0'}%</h4>
                    <small>Crecimiento Semanal</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3} className="mb-3">
                <Card className="bg-secondary text-white border-0">
                  <Card.Body className="text-center">
                    <h4>{data.crecimientoMensual || '0'}%</h4>
                    <small>Crecimiento Mensual</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3} className="mb-3">
                <Card className="bg-secondary text-white border-0">
                  <Card.Body className="text-center">
                    <h4>{data.retencionUsuarios || '0'}%</h4>
                    <small>Retención de Usuarios</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3} className="mb-3">
                <Card className="bg-secondary text-white border-0">
                  <Card.Body className="text-center">
                    <h4>{data.usuariosActivos || '0'}</h4>
                    <small>Usuarios Activos</small>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      );

    default:
      return (
        <div className="text-center py-4">
          <p className="text-light">Tipo de métrica no reconocido.</p>
        </div>
      );
  }
};

export default AdminMetrics;