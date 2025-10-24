import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Nav, Tab, Alert, Spinner } from 'react-bootstrap';
import { useEvaluation } from '../../hooks/useEvaluation';
import MediaEvaluationCard from './MediaEvaluationCard';
import ProgressTracker from './ProgressTracker';
import SpecializationManager from './SpecializationManager';
import EvaluationFilters from './EvaluationFilters';
import type { FiltrosEvaluacion } from '../../types';

/**
 * Dashboard principal para evaluaciones de jurados especializados
 */
const EvaluationDashboard: React.FC = () => {
  const {
    asignaciones,
    mediosParaEvaluacion,
    progreso,
    estadisticas,
    especializacion,
    loading,
    error,
    loadMediosParaEvaluacion
  } = useEvaluation();

  const [activeTab, setActiveTab] = useState('evaluaciones');
  const [filtros, setFiltros] = useState<FiltrosEvaluacion>({
    page: 1,
    limit: 12
  });

  // Cargar medios cuando cambien los filtros
  useEffect(() => {
    loadMediosParaEvaluacion(filtros);
  }, [filtros, loadMediosParaEvaluacion]);

  const handleFiltrosChange = (nuevosFiltros: FiltrosEvaluacion) => {
    setFiltros({ ...nuevosFiltros, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFiltros({ ...filtros, page });
  };

  if (loading && !mediosParaEvaluacion.data.length) {
    return (
      <Container fluid className="py-4 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-light">Cargando panel de evaluación...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h2 mb-1 text-white">Panel de Evaluación Especializado</h1>
              <p className="text-light mb-0">
                Evalúa medios multimedia según tu especialización profesional
              </p>
            </div>
            <div className="d-flex gap-2">
              {especializacion?.especializaciones.map(esp => (
                <Badge key={esp} bg="success" className="fs-6">
                  {esp === 'fotografia' ? '📸 Fotografía' :
                   esp === 'video' ? '🎬 Video' :
                   esp === 'audio' ? '🎵 Audio' :
                   esp === 'corto_cine' ? '🎭 Cine' : esp}
                </Badge>
              ))}
            </div>
          </div>
        </Col>
      </Row>

      {/* Error Alert */}
      {error && (
        <Row className="mb-4">
          <Col>
            <Alert variant="danger" dismissible onClose={() => {}}>
              {error}
            </Alert>
          </Col>
        </Row>
      )}

      {/* Estadísticas Rápidas */}
      {estadisticas && (
        <Row className="mb-4">
          <Col lg={3} md={6} className="mb-3">
            <Card className="bg-dark text-white border-0 h-100">
              <Card.Body className="text-center">
                <div className="display-6 text-warning mb-2">📋</div>
                <h3 className="text-warning mb-1">{estadisticas.total_evaluaciones_pendientes}</h3>
                <p className="text-light mb-0">Evaluaciones Pendientes</p>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <Card className="bg-dark text-white border-0 h-100">
              <Card.Body className="text-center">
                <div className="display-6 text-success mb-2">✅</div>
                <h3 className="text-success mb-1">{estadisticas.total_evaluaciones_completadas}</h3>
                <p className="text-light mb-0">Evaluaciones Completadas</p>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <Card className="bg-dark text-white border-0 h-100">
              <Card.Body className="text-center">
                <div className="display-6 text-info mb-2">🥇</div>
                <h3 className="text-info mb-1">{estadisticas.total_asignaciones}</h3>
                <p className="text-light mb-0">Categorías Asignadas</p>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <Card className="bg-dark text-white border-0 h-100">
              <Card.Body className="text-center">
                <div className="display-6 text-primary mb-2">⭐</div>
                <h3 className="text-primary mb-1">{estadisticas.promedio_calificacion.toFixed(1)}</h3>
                <p className="text-light mb-0">Promedio Calificación</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Tabs de Navegación */}
      <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'evaluaciones')}>
        <Row>
          <Col>
            <Nav variant="tabs" className="mb-4">
              <Nav.Item>
                <Nav.Link eventKey="evaluaciones" className="text-white">
                  📋 Evaluaciones
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="progreso" className="text-white">
                  📊 Progreso
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="especializacion" className="text-white">
                  🥇 Especialización
                </Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              {/* Tab de Evaluaciones */}
              <Tab.Pane eventKey="evaluaciones">
                <Row>
                  <Col lg={3} className="mb-4">
                    <EvaluationFilters
                      asignaciones={asignaciones}
                      filtros={filtros}
                      onFiltrosChange={handleFiltrosChange}
                    />
                  </Col>
                  <Col lg={9}>
                    {mediosParaEvaluacion.data.length === 0 ? (
                      <Card className="bg-dark text-white border-0">
                        <Card.Body className="text-center py-5">
                          <div className="display-1 mb-3">🎯</div>
                          <h4 className="text-white mb-3">No hay medios para evaluar</h4>
                          <p className="text-light">
                            {filtros.evaluado === false 
                              ? 'No tienes medios pendientes de evaluación con los filtros actuales.'
                              : 'No se encontraron medios con los filtros aplicados.'
                            }
                          </p>
                          <Button 
                            variant="outline-primary" 
                            onClick={() => setFiltros({ page: 1, limit: 12 })}
                          >
                            Limpiar Filtros
                          </Button>
                        </Card.Body>
                      </Card>
                    ) : (
                      <>
                        <Row>
                          {mediosParaEvaluacion.data.map(medio => (
                            <Col key={medio.id} lg={6} xl={4} className="mb-4">
                              <MediaEvaluationCard medio={medio} />
                            </Col>
                          ))}
                        </Row>

                        {/* Paginación */}
                        {mediosParaEvaluacion.totalPages > 1 && (
                          <Row className="mt-4">
                            <Col className="d-flex justify-content-center">
                              <nav>
                                <ul className="pagination">
                                  <li className={`page-item ${mediosParaEvaluacion.page === 1 ? 'disabled' : ''}`}>
                                    <button 
                                      className="page-link bg-dark text-white border-secondary"
                                      onClick={() => handlePageChange(mediosParaEvaluacion.page - 1)}
                                      disabled={mediosParaEvaluacion.page === 1}
                                    >
                                      Anterior
                                    </button>
                                  </li>
                                  {Array.from({ length: mediosParaEvaluacion.totalPages }, (_, i) => i + 1).map(page => (
                                    <li key={page} className={`page-item ${page === mediosParaEvaluacion.page ? 'active' : ''}`}>
                                      <button 
                                        className="page-link bg-dark text-white border-secondary"
                                        onClick={() => handlePageChange(page)}
                                      >
                                        {page}
                                      </button>
                                    </li>
                                  ))}
                                  <li className={`page-item ${mediosParaEvaluacion.page === mediosParaEvaluacion.totalPages ? 'disabled' : ''}`}>
                                    <button 
                                      className="page-link bg-dark text-white border-secondary"
                                      onClick={() => handlePageChange(mediosParaEvaluacion.page + 1)}
                                      disabled={mediosParaEvaluacion.page === mediosParaEvaluacion.totalPages}
                                    >
                                      Siguiente
                                    </button>
                                  </li>
                                </ul>
                              </nav>
                            </Col>
                          </Row>
                        )}
                      </>
                    )}
                  </Col>
                </Row>
              </Tab.Pane>

              {/* Tab de Progreso */}
              <Tab.Pane eventKey="progreso">
                <ProgressTracker progreso={progreso} estadisticas={estadisticas} />
              </Tab.Pane>

              {/* Tab de Especialización */}
              <Tab.Pane eventKey="especializacion">
                <SpecializationManager especializacion={especializacion} />
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
};

export default EvaluationDashboard;