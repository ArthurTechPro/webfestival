import React, { useState } from 'react';
import { Row, Col, Card, Button, Badge, Nav, Tab, Alert, Modal, Form, Spinner } from 'react-bootstrap';
import { useJuryFeedback } from '../../hooks/useJuryFeedback';
import type { CreateFeedbackDto, PeerJuror } from '../../types/jury-feedback';

/**
 * Sistema completo de feedback entre jurados especializados
 */
const JuryFeedbackSystem: React.FC = () => {
  const {
    receivedFeedbacks,
    givenFeedbacks,
    feedbackStats,
    feedbackOpportunities,
    error,
    createFeedback,
    getFeedbackTypeIcon,
    getFeedbackTypeColor,
    formatRating,
    getRatingDescription
  } = useJuryFeedback();

  const [activeTab, setActiveTab] = useState('recibidos');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedJuror, setSelectedJuror] = useState<PeerJuror | null>(null);
  const [selectedMedio, setSelectedMedio] = useState<{ id: number; titulo: string; tipo_medio: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [feedbackForm, setFeedbackForm] = useState<CreateFeedbackDto>({
    evaluado_id: '',
    medio_id: 0,
    tipo_feedback: 'constructivo',
    puntuacion_profesionalismo: 5,
    puntuacion_conocimiento: 5,
    comentarios: '',
    es_anonimo: false
  });



  const handleOpenFeedbackModal = (jurado: PeerJuror, medio: { id: number; titulo: string; tipo_medio: string }) => {
    setSelectedJuror(jurado);
    setSelectedMedio(medio);
    setFeedbackForm({
      evaluado_id: jurado.id,
      medio_id: medio.id,
      tipo_feedback: 'constructivo',
      puntuacion_profesionalismo: 5,
      puntuacion_conocimiento: 5,
      comentarios: '',
      es_anonimo: false
    });
    setShowFeedbackModal(true);
    setMessage(null);
  };

  const handleCloseFeedbackModal = () => {
    setShowFeedbackModal(false);
    setSelectedJuror(null);
    setSelectedMedio(null);
    setMessage(null);
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      await createFeedback(feedbackForm);
      setMessage({ type: 'success', text: 'Feedback enviado correctamente' });
      setTimeout(() => {
        handleCloseFeedbackModal();
      }, 2000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Error al enviar feedback'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const tiposFeedback = [
    { value: 'constructivo', label: 'Constructivo', description: 'Sugerencias para mejorar' },
    { value: 'tecnico', label: 'Técnico', description: 'Aspectos técnicos de la evaluación' },
    { value: 'creativo', label: 'Creativo', description: 'Enfoque creativo y artístico' },
    { value: 'general', label: 'General', description: 'Comentarios generales' }
  ];

  return (
    <div>
      {/* Header con estadísticas */}
      {feedbackStats && (
        <Row className="mb-4">
          <Col lg={3} md={6} className="mb-3">
            <Card className="bg-dark text-white border-0 h-100">
              <Card.Body className="text-center">
                <div className="display-6 text-success mb-2">📨</div>
                <h3 className="text-success mb-1">{feedbackStats.total_feedbacks_recibidos}</h3>
                <p className="text-light mb-0">Feedbacks Recibidos</p>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <Card className="bg-dark text-white border-0 h-100">
              <Card.Body className="text-center">
                <div className="display-6 text-info mb-2">📤</div>
                <h3 className="text-info mb-1">{feedbackStats.total_feedbacks_dados}</h3>
                <p className="text-light mb-0">Feedbacks Dados</p>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <Card className="bg-dark text-white border-0 h-100">
              <Card.Body className="text-center">
                <div className="display-6 text-warning mb-2">⭐</div>
                <h3 className="text-warning mb-1">{feedbackStats.promedio_profesionalismo.toFixed(1)}</h3>
                <p className="text-light mb-0">Profesionalismo</p>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <Card className="bg-dark text-white border-0 h-100">
              <Card.Body className="text-center">
                <div className="display-6 text-primary mb-2">🧠</div>
                <h3 className="text-primary mb-1">{feedbackStats.promedio_conocimiento.toFixed(1)}</h3>
                <p className="text-light mb-0">Conocimiento</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Error Alert */}
      {error && (
        <Row className="mb-4">
          <Col>
            <Alert variant="danger" dismissible onClose={() => { }}>
              {error}
            </Alert>
          </Col>
        </Row>
      )}

      {/* Tabs de navegación */}
      <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'recibidos')}>
        <Row>
          <Col>
            <Nav variant="tabs" className="mb-4">
              <Nav.Item>
                <Nav.Link eventKey="recibidos" className="text-white">
                  📨 Feedbacks Recibidos
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="dados" className="text-white">
                  📤 Feedbacks Dados
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="oportunidades" className="text-white">
                  💡 Dar Feedback
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="estadisticas" className="text-white">
                  📊 Estadísticas
                </Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              {/* Tab de Feedbacks Recibidos */}
              <Tab.Pane eventKey="recibidos">
                <Card className="bg-dark text-white border-0">
                  <Card.Header>
                    <h5 className="mb-0">📨 Feedbacks que he Recibido</h5>
                  </Card.Header>
                  <Card.Body>
                    {receivedFeedbacks.data.length === 0 ? (
                      <div className="text-center py-5">
                        <div style={{ fontSize: '3rem' }}>📭</div>
                        <p className="text-light mt-2">No has recibido feedbacks aún</p>
                        <p className="text-muted">
                          Los feedbacks aparecerán aquí cuando otros jurados evalúen tu trabajo
                        </p>
                      </div>
                    ) : (
                      <div>
                        {receivedFeedbacks.data.map(feedback => (
                          <Card key={feedback.id} className="bg-secondary mb-3">
                            <Card.Body>
                              <div className="d-flex justify-content-between align-items-start mb-3">
                                <div className="d-flex align-items-center">
                                  <div className="me-3">
                                    {feedback.es_anonimo ? (
                                      <div className="bg-dark rounded-circle d-flex align-items-center justify-content-center"
                                        style={{ width: '40px', height: '40px' }}>
                                        <span>👤</span>
                                      </div>
                                    ) : (
                                      <img
                                        src={feedback.evaluador.picture_url || '/default-avatar.png'}
                                        alt={feedback.evaluador.nombre}
                                        className="rounded-circle"
                                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                      />
                                    )}
                                  </div>
                                  <div>
                                    <h6 className="text-white mb-1">
                                      {feedback.es_anonimo ? 'Jurado Anónimo' : feedback.evaluador.nombre}
                                    </h6>
                                    <div className="d-flex gap-1 mb-1">
                                      {!feedback.es_anonimo && feedback.evaluador.especializaciones.map(esp => (
                                        <Badge key={esp} bg="info" className="small">
                                          {esp === 'fotografia' ? '📸' :
                                            esp === 'video' ? '🎬' :
                                              esp === 'audio' ? '🎵' :
                                                esp === 'corto_cine' ? '🎭' : esp}
                                        </Badge>
                                      ))}
                                    </div>
                                    <small className="text-muted">
                                      {new Date(feedback.fecha_feedback).toLocaleDateString()}
                                    </small>
                                  </div>
                                </div>
                                <Badge
                                  style={{ backgroundColor: getFeedbackTypeColor(feedback.tipo_feedback) }}
                                  className="fs-6"
                                >
                                  {getFeedbackTypeIcon(feedback.tipo_feedback)} {feedback.tipo_feedback}
                                </Badge>
                              </div>

                              <div className="mb-3">
                                <h6 className="text-white">Sobre: {feedback.medio.titulo}</h6>
                                <Badge bg="secondary">
                                  {feedback.medio.tipo_medio === 'fotografia' ? '📸 Fotografía' :
                                    feedback.medio.tipo_medio === 'video' ? '🎬 Video' :
                                      feedback.medio.tipo_medio === 'audio' ? '🎵 Audio' :
                                        feedback.medio.tipo_medio === 'corto_cine' ? '🎭 Cine' : feedback.medio.tipo_medio}
                                </Badge>
                              </div>

                              <Row className="mb-3">
                                <Col md={6}>
                                  <div className="text-center">
                                    <div className="text-warning mb-1">
                                      {formatRating(feedback.puntuacion_profesionalismo)}
                                    </div>
                                    <small className="text-light">Profesionalismo</small>
                                  </div>
                                </Col>
                                <Col md={6}>
                                  <div className="text-center">
                                    <div className="text-primary mb-1">
                                      {formatRating(feedback.puntuacion_conocimiento)}
                                    </div>
                                    <small className="text-light">Conocimiento</small>
                                  </div>
                                </Col>
                              </Row>

                              <div className="bg-dark p-3 rounded">
                                <p className="text-light mb-0">{feedback.comentarios}</p>
                              </div>
                            </Card.Body>
                          </Card>
                        ))}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Tab de Feedbacks Dados */}
              <Tab.Pane eventKey="dados">
                <Card className="bg-dark text-white border-0">
                  <Card.Header>
                    <h5 className="mb-0">📤 Feedbacks que he Dado</h5>
                  </Card.Header>
                  <Card.Body>
                    {givenFeedbacks.data.length === 0 ? (
                      <div className="text-center py-5">
                        <div style={{ fontSize: '3rem' }}>📝</div>
                        <p className="text-light mt-2">No has dado feedbacks aún</p>
                        <p className="text-muted">
                          Ve a la pestaña "Dar Feedback" para evaluar a otros jurados
                        </p>
                      </div>
                    ) : (
                      <div>
                        {givenFeedbacks.data.map(feedback => (
                          <Card key={feedback.id} className="bg-secondary mb-3">
                            <Card.Body>
                              <div className="d-flex justify-content-between align-items-start mb-3">
                                <div className="d-flex align-items-center">
                                  <div className="me-3">
                                    <img
                                      src={feedback.evaluado.picture_url || '/default-avatar.png'}
                                      alt={feedback.evaluado.nombre}
                                      className="rounded-circle"
                                      style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                    />
                                  </div>
                                  <div>
                                    <h6 className="text-white mb-1">Para: {feedback.evaluado.nombre}</h6>
                                    <div className="d-flex gap-1 mb-1">
                                      {feedback.evaluado.especializaciones.map(esp => (
                                        <Badge key={esp} bg="info" className="small">
                                          {esp === 'fotografia' ? '📸' :
                                            esp === 'video' ? '🎬' :
                                              esp === 'audio' ? '🎵' :
                                                esp === 'corto_cine' ? '🎭' : esp}
                                        </Badge>
                                      ))}
                                    </div>
                                    <small className="text-muted">
                                      {new Date(feedback.fecha_feedback).toLocaleDateString()}
                                    </small>
                                  </div>
                                </div>
                                <Badge
                                  style={{ backgroundColor: getFeedbackTypeColor(feedback.tipo_feedback) }}
                                  className="fs-6"
                                >
                                  {getFeedbackTypeIcon(feedback.tipo_feedback)} {feedback.tipo_feedback}
                                </Badge>
                              </div>

                              <div className="mb-3">
                                <h6 className="text-white">Sobre: {feedback.medio.titulo}</h6>
                                <Badge bg="secondary">
                                  {feedback.medio.tipo_medio === 'fotografia' ? '📸 Fotografía' :
                                    feedback.medio.tipo_medio === 'video' ? '🎬 Video' :
                                      feedback.medio.tipo_medio === 'audio' ? '🎵 Audio' :
                                        feedback.medio.tipo_medio === 'corto_cine' ? '🎭 Cine' : feedback.medio.tipo_medio}
                                </Badge>
                              </div>

                              <Row className="mb-3">
                                <Col md={6}>
                                  <div className="text-center">
                                    <div className="text-warning mb-1">
                                      {formatRating(feedback.puntuacion_profesionalismo)}
                                    </div>
                                    <small className="text-light">Profesionalismo</small>
                                  </div>
                                </Col>
                                <Col md={6}>
                                  <div className="text-center">
                                    <div className="text-primary mb-1">
                                      {formatRating(feedback.puntuacion_conocimiento)}
                                    </div>
                                    <small className="text-light">Conocimiento</small>
                                  </div>
                                </Col>
                              </Row>

                              <div className="bg-dark p-3 rounded">
                                <p className="text-light mb-0">{feedback.comentarios}</p>
                              </div>

                              {feedback.es_anonimo && (
                                <div className="mt-2">
                                  <Badge bg="warning">👤 Feedback Anónimo</Badge>
                                </div>
                              )}
                            </Card.Body>
                          </Card>
                        ))}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Tab de Oportunidades de Feedback */}
              <Tab.Pane eventKey="oportunidades">
                <Card className="bg-dark text-white border-0">
                  <Card.Header>
                    <h5 className="mb-0">💡 Dar Feedback a Otros Jurados</h5>
                  </Card.Header>
                  <Card.Body>
                    {feedbackOpportunities.length === 0 ? (
                      <div className="text-center py-5">
                        <div style={{ fontSize: '3rem' }}>🤝</div>
                        <p className="text-light mt-2">No hay oportunidades de feedback disponibles</p>
                        <p className="text-muted">
                          Las oportunidades aparecen cuando evalúas medios junto con otros jurados
                        </p>
                      </div>
                    ) : (
                      <div>
                        {feedbackOpportunities.map((opportunity, index) => (
                          <Card key={index} className="bg-secondary mb-4">
                            <Card.Body>
                              <div className="d-flex align-items-center mb-3">
                                <div className="me-3">
                                  <img
                                    src={opportunity.jurado.picture_url || '/default-avatar.png'}
                                    alt={opportunity.jurado.nombre}
                                    className="rounded-circle"
                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                  />
                                </div>
                                <div className="flex-grow-1">
                                  <h5 className="text-white mb-1">{opportunity.jurado.nombre}</h5>
                                  <div className="d-flex gap-1 mb-2">
                                    {opportunity.jurado.especializaciones.map(esp => (
                                      <Badge key={esp} bg="info">
                                        {esp === 'fotografia' ? '📸 Fotografía' :
                                          esp === 'video' ? '🎬 Video' :
                                            esp === 'audio' ? '🎵 Audio' :
                                              esp === 'corto_cine' ? '🎭 Cine' : esp}
                                      </Badge>
                                    ))}
                                  </div>
                                  <div className="text-muted">
                                    <small>
                                      {opportunity.jurado.experiencia_años} años de experiencia •
                                      {opportunity.jurado.total_evaluaciones} evaluaciones •
                                      {opportunity.medios_comunes.length} medios evaluados en común
                                    </small>
                                  </div>
                                </div>
                              </div>

                              <div className="mb-3">
                                <h6 className="text-white mb-2">Medios evaluados en común:</h6>
                                <div className="d-flex flex-wrap gap-2">
                                  {opportunity.medios_comunes.map(medio => (
                                    <Button
                                      key={medio.id}
                                      variant="outline-primary"
                                      size="sm"
                                      onClick={() => handleOpenFeedbackModal(opportunity.jurado, medio)}
                                    >
                                      {medio.tipo_medio === 'fotografia' ? '📸' :
                                        medio.tipo_medio === 'video' ? '🎬' :
                                          medio.tipo_medio === 'audio' ? '🎵' :
                                            medio.tipo_medio === 'corto_cine' ? '🎭' : '📄'} {medio.titulo}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            </Card.Body>
                          </Card>
                        ))}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Tab de Estadísticas */}
              <Tab.Pane eventKey="estadisticas">
                {feedbackStats && (
                  <Row>
                    <Col lg={6} className="mb-4">
                      <Card className="bg-dark text-white border-0">
                        <Card.Header>
                          <h5 className="mb-0">📊 Feedbacks por Tipo</h5>
                        </Card.Header>
                        <Card.Body>
                          {feedbackStats.feedbacks_por_tipo.map(item => (
                            <div key={item.tipo} className="d-flex justify-content-between align-items-center mb-2">
                              <div className="d-flex align-items-center">
                                <span className="me-2">{getFeedbackTypeIcon(item.tipo)}</span>
                                <span className="text-white">{item.tipo}</span>
                              </div>
                              <Badge bg="primary">{item.cantidad}</Badge>
                            </div>
                          ))}
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col lg={6} className="mb-4">
                      <Card className="bg-dark text-white border-0">
                        <Card.Header>
                          <h5 className="mb-0">🎯 Feedbacks por Especialización</h5>
                        </Card.Header>
                        <Card.Body>
                          {feedbackStats.feedbacks_por_especializacion.map(item => (
                            <div key={item.especializacion} className="mb-3">
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className="text-white">
                                  {item.especializacion === 'fotografia' ? '📸 Fotografía' :
                                    item.especializacion === 'video' ? '🎬 Video' :
                                      item.especializacion === 'audio' ? '🎵 Audio' :
                                        item.especializacion === 'corto_cine' ? '🎭 Cine' : item.especializacion}
                                </span>
                                <Badge bg="info">{item.cantidad}</Badge>
                              </div>
                              <div className="d-flex justify-content-between text-muted">
                                <small>Prof: {item.promedio_profesionalismo.toFixed(1)}</small>
                                <small>Conoc: {item.promedio_conocimiento.toFixed(1)}</small>
                              </div>
                            </div>
                          ))}
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                )}
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>

      {/* Modal para dar feedback */}
      <Modal show={showFeedbackModal} onHide={handleCloseFeedbackModal} size="lg">
        <Modal.Header closeButton className="bg-dark text-white">
          <Modal.Title>
            💬 Dar Feedback a {selectedJuror?.nombre}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-white">
          {message && (
            <Alert variant={message.type === 'success' ? 'success' : 'danger'} className="mb-4">
              {message.text}
            </Alert>
          )}

          {selectedMedio && (
            <div className="mb-4 p-3 bg-secondary rounded">
              <h6 className="text-white mb-1">Sobre el medio: {selectedMedio.titulo}</h6>
              <Badge bg="info">
                {selectedMedio.tipo_medio === 'fotografia' ? '📸 Fotografía' :
                  selectedMedio.tipo_medio === 'video' ? '🎬 Video' :
                    selectedMedio.tipo_medio === 'audio' ? '🎵 Audio' :
                      selectedMedio.tipo_medio === 'corto_cine' ? '🎭 Cine' : selectedMedio.tipo_medio}
              </Badge>
            </div>
          )}

          <Form onSubmit={handleSubmitFeedback}>
            {/* Tipo de feedback */}
            <Form.Group className="mb-4">
              <Form.Label className="text-white">
                <h6>Tipo de Feedback</h6>
              </Form.Label>
              <Row>
                {tiposFeedback.map(tipo => (
                  <Col key={tipo.value} md={6} className="mb-2">
                    <Form.Check
                      type="radio"
                      id={`tipo-${tipo.value}`}
                      name="tipo_feedback"
                      value={tipo.value}
                      checked={feedbackForm.tipo_feedback === tipo.value}
                      onChange={(e) => setFeedbackForm(prev => ({
                        ...prev,
                        tipo_feedback: e.target.value as any
                      }))}
                      label={
                        <div>
                          <div className="d-flex align-items-center mb-1">
                            <span className="me-2">{getFeedbackTypeIcon(tipo.value)}</span>
                            <strong className="text-white">{tipo.label}</strong>
                          </div>
                          <small className="text-light">{tipo.description}</small>
                        </div>
                      }
                      className="text-white"
                    />
                  </Col>
                ))}
              </Row>
            </Form.Group>

            {/* Puntuaciones */}
            <Row className="mb-4">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-white">
                    <h6>Profesionalismo (1-5)</h6>
                  </Form.Label>
                  <Form.Range
                    min={1}
                    max={5}
                    value={feedbackForm.puntuacion_profesionalismo}
                    onChange={(e) => setFeedbackForm(prev => ({
                      ...prev,
                      puntuacion_profesionalismo: parseInt(e.target.value)
                    }))}
                  />
                  <div className="d-flex justify-content-between text-muted">
                    <small>1</small>
                    <div className="text-center">
                      <div className="text-warning mb-1">
                        {formatRating(feedbackForm.puntuacion_profesionalismo)}
                      </div>
                      <small className="text-white">
                        {getRatingDescription(feedbackForm.puntuacion_profesionalismo)}
                      </small>
                    </div>
                    <small>5</small>
                  </div>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-white">
                    <h6>Conocimiento Técnico (1-5)</h6>
                  </Form.Label>
                  <Form.Range
                    min={1}
                    max={5}
                    value={feedbackForm.puntuacion_conocimiento}
                    onChange={(e) => setFeedbackForm(prev => ({
                      ...prev,
                      puntuacion_conocimiento: parseInt(e.target.value)
                    }))}
                  />
                  <div className="d-flex justify-content-between text-muted">
                    <small>1</small>
                    <div className="text-center">
                      <div className="text-primary mb-1">
                        {formatRating(feedbackForm.puntuacion_conocimiento)}
                      </div>
                      <small className="text-white">
                        {getRatingDescription(feedbackForm.puntuacion_conocimiento)}
                      </small>
                    </div>
                    <small>5</small>
                  </div>
                </Form.Group>
              </Col>
            </Row>

            {/* Comentarios */}
            <Form.Group className="mb-4">
              <Form.Label className="text-white">
                <h6>Comentarios *</h6>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={feedbackForm.comentarios}
                onChange={(e) => setFeedbackForm(prev => ({
                  ...prev,
                  comentarios: e.target.value
                }))}
                className="bg-secondary text-white border-secondary"
                placeholder="Escribe tu feedback constructivo aquí..."
                maxLength={1000}
              />
              <Form.Text className="text-muted">
                {feedbackForm.comentarios.length}/1000 caracteres
              </Form.Text>
            </Form.Group>

            {/* Opción anónima */}
            <Form.Group className="mb-4">
              <Form.Check
                type="checkbox"
                id="es_anonimo"
                checked={feedbackForm.es_anonimo}
                onChange={(e) => setFeedbackForm(prev => ({
                  ...prev,
                  es_anonimo: e.target.checked
                }))}
                label="Enviar feedback de forma anónima"
                className="text-white"
              />
              <Form.Text className="text-muted">
                Si marcas esta opción, tu nombre no será visible para el jurado evaluado
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="bg-dark">
          <Button variant="secondary" onClick={handleCloseFeedbackModal}>
            Cancelar
          </Button>
          <Button
            variant="success"
            onClick={handleSubmitFeedback}
            disabled={submitting || feedbackForm.comentarios.length < 10}
          >
            {submitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Enviando...
              </>
            ) : (
              '📤 Enviar Feedback'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default JuryFeedbackSystem;