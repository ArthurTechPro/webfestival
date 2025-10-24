import React, { useState } from 'react';
import { Container, Row, Col, Nav, Tab, Card } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useEvaluation } from '../hooks/useEvaluation';
import SpecializationManager from '../components/evaluation/SpecializationManager';
import SpecializationPerformanceDashboard from '../components/evaluation/SpecializationPerformanceDashboard';
import JuryFeedbackSystem from '../components/evaluation/JuryFeedbackSystem';

/**
 * Página completa para gestión de especialización de jurados
 * Implementa los requisitos 35.1-35.4 de la tarea 14.2
 */
const SpecializationManagementPage: React.FC = () => {
  const { user } = useAuth();
  const { especializacion } = useEvaluation();
  const [activeTab, setActiveTab] = useState('configuracion');

  // Solo jurados pueden acceder a esta página
  if (!user || user.role !== 'JURADO') {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Card className="bg-dark text-white border-0 text-center">
              <Card.Body className="py-5">
                <div style={{ fontSize: '3rem' }}>🚫</div>
                <h3 className="text-white mt-3">Acceso Restringido</h3>
                <p className="text-light">
                  Esta página está disponible solo para usuarios con rol de jurado.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center mb-3">
            <div className="me-3" style={{ fontSize: '2.5rem' }}>🎯</div>
            <div>
              <h1 className="text-white mb-1">Gestión de Especialización</h1>
              <p className="text-light mb-0">
                Configura tu especialización, revisa tu rendimiento y gestiona feedback con otros jurados
              </p>
            </div>
          </div>
        </Col>
      </Row>

      {/* Tabs de navegación */}
      <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'configuracion')}>
        <Row>
          <Col>
            <Nav variant="tabs" className="mb-4">
              <Nav.Item>
                <Nav.Link eventKey="configuracion" className="text-white">
                  ⚙️ Configuración
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="rendimiento" className="text-white">
                  📊 Rendimiento
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="feedback" className="text-white">
                  💬 Feedback
                </Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              {/* Tab de Configuración de Especialización */}
              <Tab.Pane eventKey="configuracion">
                <Row>
                  <Col>
                    <Card className="bg-dark text-white border-0 mb-4">
                      <Card.Header>
                        <h5 className="mb-0">⚙️ Configuración de Especialización</h5>
                        <small className="text-muted">
                          Requisito 35.1: Interfaz para configurar especializaciones por tipo de medio
                        </small>
                      </Card.Header>
                      <Card.Body>
                        <p className="text-light mb-4">
                          Configura tus áreas de especialización para recibir asignaciones de evaluación 
                          apropiadas según tu experiencia profesional en diferentes tipos de medios multimedia.
                        </p>
                        <SpecializationManager especializacion={especializacion} />
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab.Pane>

              {/* Tab de Dashboard de Rendimiento */}
              <Tab.Pane eventKey="rendimiento">
                <Row>
                  <Col>
                    <Card className="bg-dark text-white border-0 mb-4">
                      <Card.Header>
                        <h5 className="mb-0">📊 Dashboard de Rendimiento por Especialización</h5>
                        <small className="text-muted">
                          Requisito 35.3: Dashboard de rendimiento por especialización
                        </small>
                      </Card.Header>
                      <Card.Body>
                        <p className="text-light mb-4">
                          Analiza tu rendimiento como jurado en cada una de tus especializaciones. 
                          Revisa métricas de consistencia, tiempo de evaluación y calidad de tus calificaciones.
                        </p>
                        <SpecializationPerformanceDashboard juradoId={user.id} />
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab.Pane>

              {/* Tab de Sistema de Feedback */}
              <Tab.Pane eventKey="feedback">
                <Row>
                  <Col>
                    <Card className="bg-dark text-white border-0 mb-4">
                      <Card.Header>
                        <h5 className="mb-0">💬 Sistema de Feedback entre Jurados</h5>
                        <small className="text-muted">
                          Requisito 35.4: Sistema de feedback entre jurados especializados
                        </small>
                      </Card.Header>
                      <Card.Body>
                        <p className="text-light mb-4">
                          Intercambia feedback constructivo con otros jurados especializados. 
                          Mejora tu técnica de evaluación y contribuye al crecimiento profesional de la comunidad.
                        </p>
                        <JuryFeedbackSystem />
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>

      {/* Footer informativo */}
      <Row className="mt-5">
        <Col>
          <Card className="bg-secondary border-0">
            <Card.Body>
              <Row>
                <Col md={3} className="text-center mb-3">
                  <div style={{ fontSize: '2rem' }}>🎯</div>
                  <h6 className="text-white mt-2">Especialización</h6>
                  <small className="text-muted">
                    Define tus áreas de expertise para recibir asignaciones apropiadas
                  </small>
                </Col>
                <Col md={3} className="text-center mb-3">
                  <div style={{ fontSize: '2rem' }}>📊</div>
                  <h6 className="text-white mt-2">Rendimiento</h6>
                  <small className="text-muted">
                    Analiza tu consistencia y calidad como evaluador especializado
                  </small>
                </Col>
                <Col md={3} className="text-center mb-3">
                  <div style={{ fontSize: '2rem' }}>💬</div>
                  <h6 className="text-white mt-2">Feedback</h6>
                  <small className="text-muted">
                    Intercambia comentarios constructivos con otros jurados
                  </small>
                </Col>
                <Col md={3} className="text-center mb-3">
                  <div style={{ fontSize: '2rem' }}>🏆</div>
                  <h6 className="text-white mt-2">Excelencia</h6>
                  <small className="text-muted">
                    Contribuye a la calidad y profesionalismo de las evaluaciones
                  </small>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SpecializationManagementPage;