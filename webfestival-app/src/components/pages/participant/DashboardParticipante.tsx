import React, { useState } from 'react';
import { Container, Row, Col, Card, Badge, Button, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useConcursos } from '../../../hooks/useConcursos';
import { useAuth } from '../../../contexts/AuthContext';
import CardPremium from '../../ui/CardPremium';
import ButtonCinematic from '../../ui/ButtonCinematic';
import StatsCard from '../../ui/StatsCard';
import SimpleChart from '../../ui/SimpleChart';
import DashboardLayout from '../../layout/DashboardLayout';

interface TipoMedioFilter {
  value: string;
  label: string;
  icon: string;
}

const tiposMedio: TipoMedioFilter[] = [
  { value: '', label: 'Todos', icon: '🎨' },
  { value: 'fotografia', label: 'Fotografía', icon: '📸' },
  { value: 'video', label: 'Video', icon: '🎬' },
  { value: 'audio', label: 'Audio', icon: '🎵' },
  { value: 'corto_cine', label: 'Corto de Cine', icon: '🎭' }
];

export const DashboardParticipante: React.FC = () => {
  const { user } = useAuth();
  const {
    concursosActivos,
    misInscripciones,
    loading,
    error,
    inscribirseAConcurso,
    getEstadisticas
  } = useConcursos();

  const [filtroTipoMedio, setFiltroTipoMedio] = useState<string>('');
  const [procesandoInscripcion, setProcesandoInscripcion] = useState<number | null>(null);

  const estadisticas = getEstadisticas();

  const concursosFiltrados = filtroTipoMedio
    ? concursosActivos.filter(() => {
      // En una implementación real, aquí filtrarías por tipo de medio
      // Por ahora mostramos todos los concursos
      return true;
    })
    : concursosActivos;

  const handleInscripcion = async (concursoId: number) => {
    setProcesandoInscripcion(concursoId);
    try {
      await inscribirseAConcurso(concursoId);
    } finally {
      setProcesandoInscripcion(null);
    }
  };

  const estaInscrito = (concursoId: number): boolean => {
    return misInscripciones.some(inscripcion => inscripcion.concurso.id === concursoId);
  };

  const getDiasRestantes = (fechaFinal: Date): number => {
    return Math.ceil((new Date(fechaFinal).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  };

  const getStatusBadgeVariant = (status: string): string => {
    switch (status) {
      case 'Activo': return 'success';
      case 'Próximamente': return 'warning';
      case 'Calificación': return 'info';
      case 'Finalizado': return 'secondary';
      default: return 'primary';
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <DashboardLayout>
      <Container fluid className="py-4">
        {/* Header del Dashboard */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="h2 mb-1 text-white">¡Bienvenido, {user?.nombre}!</h1>
                <p className="text-light mb-0">Descubre y participa en concursos multimedia</p>
              </div>
              <div className="d-flex gap-2">
                <Link to="/participante/mis-envios">
                  <ButtonCinematic variant="outline" size="sm">
                    Mis Envíos
                  </ButtonCinematic>
                </Link>
                <Link to="/participante/resultados">
                  <ButtonCinematic variant="outline" size="sm">
                    Resultados
                  </ButtonCinematic>
                </Link>
              </div>
            </div>
          </Col>
        </Row>

      {/* Estadísticas Rápidas */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <StatsCard
            title="Concursos Inscritos"
            value={estadisticas.totalInscripciones}
            icon="🏆"
            color="primary"
            trend={{ value: 12, isPositive: true }}
          />
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <StatsCard
            title="Concursos Activos"
            value={estadisticas.totalActivos}
            icon="🎯"
            color="success"
            trend={{ value: 8, isPositive: true }}
          />
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <StatsCard
            title="Finalizan Pronto"
            value={estadisticas.concursosProximosAFinalizar}
            icon="⏰"
            color="warning"
            trend={{ value: 3, isPositive: false }}
          />
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <StatsCard
            title="Finalizados"
            value={estadisticas.totalFinalizados}
            icon="📊"
            color="info"
            trend={{ value: 15, isPositive: true }}
          />
        </Col>
      </Row>

      {/* Filtros por Tipo de Medio */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <h5 className="card-title mb-3">Filtrar por Tipo de Medio</h5>
              <div className="d-flex flex-wrap gap-2">
                {tiposMedio.map((tipo) => (
                  <Button
                    key={tipo.value}
                    variant={filtroTipoMedio === tipo.value ? 'primary' : 'outline-primary'}
                    size="sm"
                    onClick={() => setFiltroTipoMedio(tipo.value)}
                    className="d-flex align-items-center gap-2"
                  >
                    <span>{tipo.icon}</span>
                    {tipo.label}
                  </Button>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Mensajes de Error */}
      {error && (
        <Row className="mb-4">
          <Col>
            <Alert variant="danger">
              <Alert.Heading>Error</Alert.Heading>
              {error}
            </Alert>
          </Col>
        </Row>
      )}

      {/* Gráficos y Analytics */}
      <Row className="mb-4">
        <Col lg={8}>
          <SimpleChart
            title="Participaciones por Mes"
            type="bar"
            height={250}
            data={[
              { label: 'Ene', value: 12 },
              { label: 'Feb', value: 19 },
              { label: 'Mar', value: 8 },
              { label: 'Abr', value: 25 },
              { label: 'May', value: 15 },
              { label: 'Jun', value: 22 }
            ]}
          />
        </Col>
        <Col lg={4}>
          <SimpleChart
            title="Rendimiento por Tipo"
            type="donut"
            height={250}
            data={[
              { label: 'Fotografía', value: 45, color: '#346CB0' },
              { label: 'Video', value: 30, color: '#2ed573' },
              { label: 'Audio', value: 15, color: '#ffa502' },
              { label: 'Cine', value: 10, color: '#3742fa' }
            ]}
          />
        </Col>
      </Row>

      {/* Lista de Concursos Activos */}
      <Row>
        <Col>
          <h3 className="mb-3 text-white">
            Concursos Activos
            {filtroTipoMedio && (
              <Badge bg="primary" className="ms-2">
                {tiposMedio.find(t => t.value === filtroTipoMedio)?.label}
              </Badge>
            )}
          </h3>

          {concursosFiltrados.length === 0 ? (
            <CardPremium>
              <Card.Body className="text-center py-5">
                <div className="display-1 mb-3">🎨</div>
                <h4>No hay concursos disponibles</h4>
                <p className="text-muted">
                  {filtroTipoMedio
                    ? 'No hay concursos activos para el tipo de medio seleccionado.'
                    : 'No hay concursos activos en este momento.'
                  }
                </p>
              </Card.Body>
            </CardPremium>
          ) : (
            <Row>
              {concursosFiltrados.map((concurso) => {
                const diasRestantes = getDiasRestantes(concurso.fecha_final);
                const inscrito = estaInscrito(concurso.id);

                return (
                  <Col key={concurso.id} lg={6} xl={4} className="mb-4">
                    <CardPremium className="h-100">
                      {concurso.imagen_url && (
                        <Card.Img
                          variant="top"
                          src={concurso.imagen_url}
                          style={{ height: '200px', objectFit: 'cover' }}
                        />
                      )}
                      <Card.Body className="d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <Badge bg={getStatusBadgeVariant(concurso.status)}>
                            {concurso.status}
                          </Badge>
                          {diasRestantes <= 7 && diasRestantes > 0 && (
                            <Badge bg="warning" text="dark">
                              ⏰ {diasRestantes} días
                            </Badge>
                          )}
                        </div>

                        <Card.Title className="h5">{concurso.titulo}</Card.Title>
                        <Card.Text className="text-muted flex-grow-1">
                          {concurso.descripcion}
                        </Card.Text>

                        <div className="mb-3">
                          <small className="text-muted d-block">
                            <strong>Inicio:</strong> {new Date(concurso.fecha_inicio).toLocaleDateString()}
                          </small>
                          <small className="text-muted d-block">
                            <strong>Fin:</strong> {new Date(concurso.fecha_final).toLocaleDateString()}
                          </small>
                          <small className="text-muted d-block">
                            <strong>Máximo envíos:</strong> {concurso.max_envios}
                          </small>
                        </div>

                        <div className="d-flex gap-2 mt-auto">
                          <Link
                            to={`/participante/concurso/${concurso.id}`}
                            className="flex-grow-1"
                          >
                            <ButtonCinematic
                              variant="outline"
                              size="sm"
                              className="w-100"
                            >
                              Ver Detalles
                            </ButtonCinematic>
                          </Link>

                          {!inscrito ? (
                            <ButtonCinematic
                              variant="primary"
                              size="sm"
                              onClick={() => handleInscripcion(concurso.id)}
                              disabled={procesandoInscripcion === concurso.id}
                            >
                              {procesandoInscripcion === concurso.id ? (
                                <Spinner animation="border" size="sm" />
                              ) : (
                                'Inscribirse'
                              )}
                            </ButtonCinematic>
                          ) : (
                            <Link to={`/participante/concurso/${concurso.id}/subir`}>
                              <ButtonCinematic variant="primary" size="sm">
                                Subir Medio
                              </ButtonCinematic>
                            </Link>
                          )}
                        </div>
                      </Card.Body>
                    </CardPremium>
                  </Col>
                );
              })}
            </Row>
          )}
        </Col>
      </Row>
      </Container>
    </DashboardLayout>
  );
};

export default DashboardParticipante;