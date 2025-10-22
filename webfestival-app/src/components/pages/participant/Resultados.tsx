import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Alert, Spinner, Form, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { mediaService, type MedioConResultados } from '../../../services/media.service';
import { useAuth } from '../../../contexts/AuthContext';
import CardPremium from '../../ui/CardPremium';
import ButtonCinematic from '../../ui/ButtonCinematic';

interface FiltrosResultados {
  tipo_medio: string;
  concurso: string;
  año: string;
  estado: 'todos' | 'calificados' | 'pendientes';
}

export const Resultados: React.FC = () => {
  const { user } = useAuth();
  const [resultados, setResultados] = useState<MedioConResultados[]>([]);
  const [resultadosFiltrados, setResultadosFiltrados] = useState<MedioConResultados[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<FiltrosResultados>({
    tipo_medio: '',
    concurso: '',
    año: '',
    estado: 'todos'
  });

  useEffect(() => {
    if (user) {
      loadResultados();
    }
  }, [user]);

  useEffect(() => {
    aplicarFiltros();
  }, [resultados, filtros]);

  const loadResultados = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const medios = await mediaService.getMediaByUser(user.id);
      setResultados(medios);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar resultados');
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let filtrados = [...resultados];

    // Filtrar por tipo de medio
    if (filtros.tipo_medio) {
      filtrados = filtrados.filter(medio => medio.tipo_medio === filtros.tipo_medio);
    }

    // Filtrar por concurso
    if (filtros.concurso) {
      filtrados = filtrados.filter(medio => 
        medio.concurso.titulo.toLowerCase().includes(filtros.concurso.toLowerCase())
      );
    }

    // Filtrar por año
    if (filtros.año) {
      filtrados = filtrados.filter(medio => 
        new Date(medio.fecha_subida).getFullYear().toString() === filtros.año
      );
    }

    // Filtrar por estado de calificación
    if (filtros.estado !== 'todos') {
      if (filtros.estado === 'calificados') {
        filtrados = filtrados.filter(medio => medio.puntaje_final !== undefined);
      } else if (filtros.estado === 'pendientes') {
        filtrados = filtrados.filter(medio => medio.puntaje_final === undefined);
      }
    }

    setResultadosFiltrados(filtrados);
  };

  const handleFiltroChange = (campo: keyof FiltrosResultados, valor: string) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      tipo_medio: '',
      concurso: '',
      año: '',
      estado: 'todos'
    });
  };

  const getMediaTypeIcon = (tipo: string): string => {
    const icons = {
      fotografia: '📸',
      video: '🎬',
      audio: '🎵',
      corto_cine: '🎭'
    };
    return icons[tipo as keyof typeof icons] || '📄';
  };

  const getPuntuacionColor = (puntuacion?: number): string => {
    if (!puntuacion) return 'secondary';
    if (puntuacion >= 90) return 'success';
    if (puntuacion >= 80) return 'info';
    if (puntuacion >= 70) return 'warning';
    return 'danger';
  };

  const getPosicionBadge = (posicion?: number) => {
    if (!posicion) return null;
    
    let variant = 'secondary';
    let icon = '';
    
    if (posicion === 1) {
      variant = 'warning';
      icon = '🥇';
    } else if (posicion === 2) {
      variant = 'secondary';
      icon = '🥈';
    } else if (posicion === 3) {
      variant = 'warning';
      icon = '🥉';
    }
    
    return (
      <Badge bg={variant} className="me-2">
        {icon} #{posicion}
      </Badge>
    );
  };

  const getEstadisticas = () => {
    const total = resultados.length;
    const calificados = resultados.filter(r => r.puntaje_final !== undefined).length;
    const pendientes = total - calificados;
    const ganadores = resultados.filter(r => r.posicion && r.posicion <= 3).length;
    const promedioGeneral = calificados > 0 
      ? resultados
          .filter(r => r.puntaje_final !== undefined)
          .reduce((sum, r) => sum + (r.puntaje_final || 0), 0) / calificados
      : 0;

    return {
      total,
      calificados,
      pendientes,
      ganadores,
      promedioGeneral: promedioGeneral.toFixed(1)
    };
  };

  const obtenerAñosDisponibles = (): string[] => {
    const años = resultados.map(medio => new Date(medio.fecha_subida).getFullYear());
    return [...new Set(años)].sort((a, b) => b - a).map(año => año.toString());
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

  const estadisticas = getEstadisticas();

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h2 mb-1">Mis Resultados</h1>
              <p className="text-muted mb-0">
                Historial completo de participaciones y calificaciones
              </p>
            </div>
            <Link to="/participante/dashboard">
              <ButtonCinematic variant="outline" size="sm">
                Volver al Dashboard
              </ButtonCinematic>
            </Link>
          </div>
        </Col>
      </Row>

      {/* Estadísticas Generales */}
      <Row className="mb-4">
        <Col md={2}>
          <CardPremium className="text-center h-100">
            <Card.Body>
              <div className="display-6 text-primary mb-2">📊</div>
              <h5 className="card-title">{estadisticas.total}</h5>
              <p className="card-text text-muted small">Total Envíos</p>
            </Card.Body>
          </CardPremium>
        </Col>
        <Col md={2}>
          <CardPremium className="text-center h-100">
            <Card.Body>
              <div className="display-6 text-success mb-2">✅</div>
              <h5 className="card-title">{estadisticas.calificados}</h5>
              <p className="card-text text-muted small">Calificados</p>
            </Card.Body>
          </CardPremium>
        </Col>
        <Col md={2}>
          <CardPremium className="text-center h-100">
            <Card.Body>
              <div className="display-6 text-warning mb-2">⏳</div>
              <h5 className="card-title">{estadisticas.pendientes}</h5>
              <p className="card-text text-muted small">Pendientes</p>
            </Card.Body>
          </CardPremium>
        </Col>
        <Col md={3}>
          <CardPremium className="text-center h-100">
            <Card.Body>
              <div className="display-6 text-info mb-2">🏆</div>
              <h5 className="card-title">{estadisticas.ganadores}</h5>
              <p className="card-text text-muted small">Posiciones Top 3</p>
            </Card.Body>
          </CardPremium>
        </Col>
        <Col md={3}>
          <CardPremium className="text-center h-100">
            <Card.Body>
              <div className="display-6 text-secondary mb-2">📈</div>
              <h5 className="card-title">{estadisticas.promedioGeneral}</h5>
              <p className="card-text text-muted small">Promedio General</p>
            </Card.Body>
          </CardPremium>
        </Col>
      </Row>

      {/* Filtros */}
      <Row className="mb-4">
        <Col>
          <CardPremium>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Filtros</h5>
                <Button variant="outline-secondary" size="sm" onClick={limpiarFiltros}>
                  Limpiar Filtros
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Tipo de Medio</Form.Label>
                    <Form.Select
                      value={filtros.tipo_medio}
                      onChange={(e) => handleFiltroChange('tipo_medio', e.target.value)}
                    >
                      <option value="">Todos los tipos</option>
                      <option value="fotografia">📸 Fotografía</option>
                      <option value="video">🎬 Video</option>
                      <option value="audio">🎵 Audio</option>
                      <option value="corto_cine">🎭 Corto de Cine</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Concurso</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="text"
                        placeholder="Buscar concurso..."
                        value={filtros.concurso}
                        onChange={(e) => handleFiltroChange('concurso', e.target.value)}
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Año</Form.Label>
                    <Form.Select
                      value={filtros.año}
                      onChange={(e) => handleFiltroChange('año', e.target.value)}
                    >
                      <option value="">Todos los años</option>
                      {obtenerAñosDisponibles().map(año => (
                        <option key={año} value={año}>{año}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Estado</Form.Label>
                    <Form.Select
                      value={filtros.estado}
                      onChange={(e) => handleFiltroChange('estado', e.target.value as any)}
                    >
                      <option value="todos">Todos</option>
                      <option value="calificados">Calificados</option>
                      <option value="pendientes">Pendientes</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </CardPremium>
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

      {/* Lista de Resultados */}
      {resultadosFiltrados.length === 0 ? (
        <Row>
          <Col>
            <CardPremium>
              <Card.Body className="text-center py-5">
                <div className="display-1 mb-3">🔍</div>
                <h4>No se encontraron resultados</h4>
                <p className="text-muted mb-4">
                  {resultados.length === 0 
                    ? 'Aún no tienes participaciones en concursos.'
                    : 'No hay resultados que coincidan con los filtros aplicados.'
                  }
                </p>
                {resultados.length === 0 ? (
                  <Link to="/participante/dashboard">
                    <ButtonCinematic variant="primary">
                      Explorar Concursos
                    </ButtonCinematic>
                  </Link>
                ) : (
                  <ButtonCinematic variant="outline" onClick={limpiarFiltros}>
                    Limpiar Filtros
                  </ButtonCinematic>
                )}
              </Card.Body>
            </CardPremium>
          </Col>
        </Row>
      ) : (
        <Row>
          {resultadosFiltrados.map((medio) => (
            <Col key={medio.id} lg={6} xl={4} className="mb-4">
              <CardPremium className="h-100">
                <Card.Body>
                  {/* Header con tipo y posición */}
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <span className="fs-4">{getMediaTypeIcon(medio.tipo_medio)}</span>
                      <div>
                        <h6 className="mb-0">{medio.titulo}</h6>
                        <small className="text-muted text-capitalize">
                          {medio.tipo_medio.replace('_', ' ')}
                        </small>
                      </div>
                    </div>
                    <div className="text-end">
                      {getPosicionBadge(medio.posicion)}
                      {medio.puntaje_final ? (
                        <Badge bg={getPuntuacionColor(medio.puntaje_final)}>
                          {medio.puntaje_final}/100
                        </Badge>
                      ) : (
                        <Badge bg="secondary">Pendiente</Badge>
                      )}
                    </div>
                  </div>

                  {/* Thumbnail */}
                  <div className="mb-3" style={{ height: '120px', overflow: 'hidden' }}>
                    {medio.tipo_medio === 'fotografia' ? (
                      <img 
                        src={medio.thumbnail_url || medio.preview_url || medio.medio_url}
                        alt={medio.titulo}
                        className="img-fluid w-100 h-100 rounded"
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="d-flex align-items-center justify-content-center h-100 bg-light rounded">
                        <div className="text-center">
                          <div className="display-4 mb-1">{getMediaTypeIcon(medio.tipo_medio)}</div>
                          <small className="text-muted">{medio.formato}</small>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Información del concurso */}
                  <div className="mb-3">
                    <small className="text-muted d-block">
                      <strong>Concurso:</strong> {medio.concurso.titulo}
                    </small>
                    <small className="text-muted d-block">
                      <strong>Fecha:</strong> {new Date(medio.fecha_subida).toLocaleDateString()}
                    </small>
                    <small className="text-muted d-block">
                      <strong>Tamaño:</strong> {mediaService.formatFileSize(medio.tamaño_archivo)}
                    </small>
                  </div>

                  {/* Calificaciones resumidas */}
                  {medio.calificaciones && medio.calificaciones.length > 0 && (
                    <div className="mb-3">
                      <small className="text-muted d-block">
                        <strong>Evaluaciones:</strong> {medio.calificaciones.length} jurado(s)
                      </small>
                      <small className="text-muted d-block">
                        <strong>Criterios:</strong> {
                          medio.calificaciones.reduce((acc, cal) => acc + cal.detalles.length, 0)
                        } evaluados
                      </small>
                    </div>
                  )}

                  {/* Acciones */}
                  <div className="d-flex gap-2 mt-auto">
                    {medio.puntaje_final ? (
                      <Link 
                        to={`/participante/resultados/${medio.id}`}
                        className="flex-grow-1"
                      >
                        <ButtonCinematic 
                          variant="primary" 
                          size="sm" 
                          className="w-100"
                        >
                          Ver Calificaciones
                        </ButtonCinematic>
                      </Link>
                    ) : (
                      <ButtonCinematic 
                        variant="secondary" 
                        size="sm" 
                        className="flex-grow-1"
                        disabled
                      >
                        Evaluación Pendiente
                      </ButtonCinematic>
                    )}
                  </div>
                </Card.Body>
              </CardPremium>
            </Col>
          ))}
        </Row>
      )}

      {/* Información adicional */}
      {resultadosFiltrados.length > 0 && (
        <Row className="mt-4">
          <Col>
            <Card className="bg-light">
              <Card.Body className="text-center">
                <small className="text-muted">
                  Mostrando {resultadosFiltrados.length} de {resultados.length} resultados
                  {Object.values(filtros).some(f => f !== '' && f !== 'todos') && (
                    <span> (filtrados)</span>
                  )}
                </small>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Resultados;