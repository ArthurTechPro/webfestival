import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Badge, ProgressBar, Alert, Spinner, Nav, Tab } from 'react-bootstrap';
import { useEvaluation } from '../../hooks/useEvaluation';
import { useJuryFeedback } from '../../hooks/useJuryFeedback';
import type { PerformanceMetrics } from '../../types';

interface SpecializationPerformanceDashboardProps {
  juradoId?: string;
}

/**
 * Dashboard de rendimiento por especialización para jurados
 * Muestra métricas detalladas de evaluaciones por tipo de medio
 */
const SpecializationPerformanceDashboard: React.FC<SpecializationPerformanceDashboardProps> = ({ 
  juradoId 
}) => {
  const { getPerformanceMetrics, loading: evaluationLoading } = useEvaluation();
  const { feedbackStats, loading: feedbackLoading } = useJuryFeedback();
  
  const [performanceData, setPerformanceData] = useState<PerformanceMetrics | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPerformanceData();
  }, [juradoId]);

  const loadPerformanceData = async () => {
    try {
      setError(null);
      const data = await getPerformanceMetrics(juradoId);
      setPerformanceData(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al cargar métricas');
    }
  };

  const getSpecializationIcon = (tipo: string) => {
    switch (tipo) {
      case 'fotografia': return '📸';
      case 'video': return '🎬';
      case 'audio': return '🎵';
      case 'corto_cine': return '🎭';
      default: return '📄';
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 4.5) return 'success';
    if (score >= 4.0) return 'info';
    if (score >= 3.5) return 'warning';
    return 'danger';
  };

  const getConsistencyColor = (consistency: number) => {
    if (consistency >= 90) return 'success';
    if (consistency >= 80) return 'info';
    if (consistency >= 70) return 'warning';
    return 'danger';
  };

  if (evaluationLoading || feedbackLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="text-light mt-2">Cargando métricas de rendimiento...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Error al cargar datos</Alert.Heading>
        <p>{error}</p>
      </Alert>
    );
  }

  if (!performanceData) {
    return (
      <div className="text-center py-5">
        <div style={{ fontSize: '3rem' }}>📊</div>
        <p className="text-light mt-2">No hay datos de rendimiento disponibles</p>
        <p className="text-muted">
          Las métricas aparecerán después de completar evaluaciones
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header con métricas generales */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <Card className="bg-dark text-white border-0 h-100">
            <Card.Body className="text-center">
              <div className="display-6 text-primary mb-2">📊</div>
              <h3 className="text-primary mb-1">{performanceData.total_evaluaciones}</h3>
              <p className="text-light mb-0">Evaluaciones Totales</p>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="bg-dark text-white border-0 h-100">
            <Card.Body className="text-center">
              <div className="display-6 text-success mb-2">⭐</div>
              <h3 className="text-success mb-1">{performanceData.promedio_general.toFixed(1)}</h3>
              <p className="text-light mb-0">Promedio General</p>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="bg-dark text-white border-0 h-100">
            <Card.Body className="text-center">
              <div className="display-6 text-info mb-2">🎯</div>
              <h3 className="text-info mb-1">{performanceData.consistencia.toFixed(0)}%</h3>
              <p className="text-light mb-0">Consistencia</p>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="bg-dark text-white border-0 h-100">
            <Card.Body className="text-center">
              <div className="display-6 text-warning mb-2">⚡</div>
              <h3 className="text-warning mb-1">{performanceData.tiempo_promedio_minutos}</h3>
              <p className="text-light mb-0">Min/Evaluación</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabs de navegación */}
      <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'general')}>
        <Row>
          <Col>
            <Nav variant="tabs" className="mb-4">
              <Nav.Item>
                <Nav.Link eventKey="general" className="text-white">
                  📊 Vista General
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="especializaciones" className="text-white">
                  🎯 Por Especialización
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="tendencias" className="text-white">
                  📈 Tendencias
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="comparacion" className="text-white">
                  ⚖️ Comparación
                </Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              {/* Tab General */}
              <Tab.Pane eventKey="general">
                <Row>
                  <Col lg={8} className="mb-4">
                    <Card className="bg-dark text-white border-0">
                      <Card.Header>
                        <h5 className="mb-0">📊 Rendimiento por Criterio</h5>
                      </Card.Header>
                      <Card.Body>
                        {performanceData.rendimiento_por_criterio.map(criterio => (
                          <div key={criterio.criterio_id} className="mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <h6 className="text-white mb-0">{criterio.criterio_nombre}</h6>
                              <Badge bg={getPerformanceColor(criterio.promedio_puntuacion)}>
                                {criterio.promedio_puntuacion.toFixed(1)}
                              </Badge>
                            </div>
                            <ProgressBar 
                              now={(criterio.promedio_puntuacion / 10) * 100} 
                              variant={getPerformanceColor(criterio.promedio_puntuacion)}
                              className="mb-1"
                            />
                            <div className="d-flex justify-content-between text-muted">
                              <small>{criterio.total_evaluaciones} evaluaciones</small>
                              <small>Desv: ±{criterio.desviacion_estandar.toFixed(1)}</small>
                            </div>
                          </div>
                        ))}
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col lg={4} className="mb-4">
                    <Card className="bg-dark text-white border-0 mb-3">
                      <Card.Header>
                        <h5 className="mb-0">🏆 Logros</h5>
                      </Card.Header>
                      <Card.Body>
                        <div className="mb-3">
                          <div className="d-flex align-items-center mb-2">
                            <span className="me-2" style={{ fontSize: '1.5rem' }}>🥇</span>
                            <div>
                              <div className="text-white">Evaluaciones Completadas</div>
                              <small className="text-muted">
                                {performanceData.total_evaluaciones} evaluaciones
                              </small>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <div className="d-flex align-items-center mb-2">
                            <span className="me-2" style={{ fontSize: '1.5rem' }}>⚡</span>
                            <div>
                              <div className="text-white">Evaluador Eficiente</div>
                              <small className="text-muted">
                                {performanceData.tiempo_promedio_minutos} min promedio
                              </small>
                            </div>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="d-flex align-items-center mb-2">
                            <span className="me-2" style={{ fontSize: '1.5rem' }}>🎯</span>
                            <div>
                              <div className="text-white">Consistencia Alta</div>
                              <small className="text-muted">
                                {performanceData.consistencia.toFixed(0)}% consistencia
                              </small>
                            </div>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>

                    {feedbackStats && (
                      <Card className="bg-dark text-white border-0">
                        <Card.Header>
                          <h5 className="mb-0">💬 Feedback Recibido</h5>
                        </Card.Header>
                        <Card.Body>
                          <div className="text-center mb-3">
                            <div className="display-6 text-success mb-2">
                              {feedbackStats.promedio_profesionalismo.toFixed(1)}
                            </div>
                            <p className="text-light mb-0">Profesionalismo</p>
                          </div>
                          <div className="text-center">
                            <div className="display-6 text-primary mb-2">
                              {feedbackStats.promedio_conocimiento.toFixed(1)}
                            </div>
                            <p className="text-light mb-0">Conocimiento</p>
                          </div>
                        </Card.Body>
                      </Card>
                    )}
                  </Col>
                </Row>
              </Tab.Pane>

              {/* Tab Por Especialización */}
              <Tab.Pane eventKey="especializaciones">
                <Row>
                  {performanceData.rendimiento_por_especializacion.map(esp => (
                    <Col key={esp.especializacion} lg={6} className="mb-4">
                      <Card className="bg-dark text-white border-0 h-100">
                        <Card.Header>
                          <h5 className="mb-0">
                            {getSpecializationIcon(esp.especializacion)} {' '}
                            {esp.especializacion === 'fotografia' ? 'Fotografía' :
                             esp.especializacion === 'video' ? 'Video' :
                             esp.especializacion === 'audio' ? 'Audio' :
                             esp.especializacion === 'corto_cine' ? 'Corto de Cine' : esp.especializacion}
                          </h5>
                        </Card.Header>
                        <Card.Body>
                          <div className="row text-center mb-3">
                            <div className="col-4">
                              <div className="text-primary mb-1">
                                <strong>{esp.total_evaluaciones}</strong>
                              </div>
                              <small className="text-muted">Evaluaciones</small>
                            </div>
                            <div className="col-4">
                              <div className="text-success mb-1">
                                <strong>{esp.promedio_puntuacion.toFixed(1)}</strong>
                              </div>
                              <small className="text-muted">Promedio</small>
                            </div>
                            <div className="col-4">
                              <div className="text-info mb-1">
                                <strong>{esp.consistencia.toFixed(0)}%</strong>
                              </div>
                              <small className="text-muted">Consistencia</small>
                            </div>
                          </div>

                          <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <small className="text-light">Rendimiento</small>
                              <Badge bg={getPerformanceColor(esp.promedio_puntuacion)}>
                                {esp.promedio_puntuacion.toFixed(1)}/10
                              </Badge>
                            </div>
                            <ProgressBar 
                              now={(esp.promedio_puntuacion / 10) * 100} 
                              variant={getPerformanceColor(esp.promedio_puntuacion)}
                            />
                          </div>

                          <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <small className="text-light">Consistencia</small>
                              <Badge bg={getConsistencyColor(esp.consistencia)}>
                                {esp.consistencia.toFixed(0)}%
                              </Badge>
                            </div>
                            <ProgressBar 
                              now={esp.consistencia} 
                              variant={getConsistencyColor(esp.consistencia)}
                            />
                          </div>

                          <div className="text-center">
                            <small className="text-muted">
                              Tiempo promedio: {esp.tiempo_promedio_minutos} min
                            </small>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Tab.Pane>

              {/* Tab Tendencias */}
              <Tab.Pane eventKey="tendencias">
                <Card className="bg-dark text-white border-0">
                  <Card.Header>
                    <h5 className="mb-0">📈 Evolución del Rendimiento</h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="text-center py-5">
                      <div style={{ fontSize: '3rem' }}>📈</div>
                      <p className="text-light mt-2">Gráficos de Tendencias</p>
                      <p className="text-muted">
                        Próximamente: Gráficos interactivos de evolución del rendimiento
                      </p>
                    </div>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Tab Comparación */}
              <Tab.Pane eventKey="comparacion">
                <Card className="bg-dark text-white border-0">
                  <Card.Header>
                    <h5 className="mb-0">⚖️ Comparación con Otros Jurados</h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="text-center py-5">
                      <div style={{ fontSize: '3rem' }}>⚖️</div>
                      <p className="text-light mt-2">Comparación de Rendimiento</p>
                      <p className="text-muted">
                        Próximamente: Comparación anónima con otros jurados de tu especialización
                      </p>
                    </div>
                  </Card.Body>
                </Card>
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </div>
  );
};

export default SpecializationPerformanceDashboard;