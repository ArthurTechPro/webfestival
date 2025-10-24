import React, { useState } from 'react';
import { Row, Col, Card, Form, Button, Alert, Badge, Spinner } from 'react-bootstrap';
import { useEvaluation } from '../../hooks/useEvaluation';
import type { JuradoEspecializacion } from '../../types';

interface SpecializationManagerProps {
  especializacion: JuradoEspecializacion | null;
}

/**
 * Componente para gestionar la especialización de jurados por tipo de medio
 */
const SpecializationManager: React.FC<SpecializationManagerProps> = ({ especializacion }) => {
  const { actualizarEspecializacion, loading } = useEvaluation();
  
  const [formData, setFormData] = useState({
    especializaciones: especializacion?.especializaciones || [],
    experiencia_años: especializacion?.experiencia_años || 0,
    certificaciones: especializacion?.certificaciones || [],
    portfolio_url: especializacion?.portfolio_url || ''
  });
  
  const [newCertificacion, setNewCertificacion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const tiposMedio = [
    { value: 'fotografia', label: 'Fotografía', icon: '📸', description: 'Composición, técnica fotográfica, iluminación' },
    { value: 'video', label: 'Video', icon: '🎬', description: 'Narrativa visual, técnica audiovisual, edición' },
    { value: 'audio', label: 'Audio', icon: '🎵', description: 'Producción musical, calidad sonora, composición' },
    { value: 'corto_cine', label: 'Corto de Cine', icon: '🎭', description: 'Dirección cinematográfica, narrativa, técnica' }
  ];

  const handleEspecializacionChange = (tipo: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      especializaciones: checked 
        ? [...prev.especializaciones, tipo as any]
        : prev.especializaciones.filter(e => e !== tipo)
    }));
  };

  const handleAddCertificacion = () => {
    if (newCertificacion.trim()) {
      setFormData(prev => ({
        ...prev,
        certificaciones: [...prev.certificaciones, newCertificacion.trim()]
      }));
      setNewCertificacion('');
    }
  };

  const handleRemoveCertificacion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certificaciones: prev.certificaciones.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.especializaciones.length === 0) {
      setMessage({ type: 'error', text: 'Debes seleccionar al menos una especialización' });
      return;
    }

    try {
      setSubmitting(true);
      setMessage(null);
      
      await actualizarEspecializacion(formData);
      setMessage({ type: 'success', text: 'Especialización actualizada correctamente' });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Error al actualizar especialización' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Información actual */}
      <Row className="mb-4">
        <Col>
          <Card className="bg-dark text-white border-0">
            <Card.Header>
              <h5 className="mb-0">🥇 Mi Especialización Actual</h5>
            </Card.Header>
            <Card.Body>
              {especializacion ? (
                <div>
                  <div className="mb-3">
                    <h6 className="text-light mb-2">Áreas de Especialización:</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {especializacion.especializaciones.map(esp => {
                        const tipo = tiposMedio.find(t => t.value === esp);
                        return (
                          <Badge 
                            key={esp} 
                            bg="success" 
                            className="fs-6 p-2"
                          >
                            {tipo?.icon} {tipo?.label}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                  
                  <Row>
                    <Col md={6}>
                      <div className="mb-2">
                        <strong>Experiencia:</strong> {especializacion.experiencia_años} años
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-2">
                        <strong>Certificaciones:</strong> {especializacion.certificaciones?.length || 0}
                      </div>
                    </Col>
                  </Row>

                  {especializacion.portfolio_url && (
                    <div className="mt-2">
                      <strong>Portfolio:</strong>{' '}
                      <a 
                        href={especializacion.portfolio_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-info"
                      >
                        Ver Portfolio
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <div style={{ fontSize: '3rem' }}>⚠️</div>
                  <p className="text-light mt-2">No tienes especialización configurada</p>
                  <p className="text-muted">
                    Configura tu especialización para recibir asignaciones de evaluación
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Formulario de edición */}
      <Row>
        <Col>
          <Card className="bg-dark text-white border-0">
            <Card.Header>
              <h5 className="mb-0">✏️ Actualizar Especialización</h5>
            </Card.Header>
            <Card.Body>
              {message && (
                <Alert variant={message.type === 'success' ? 'success' : 'danger'} className="mb-4">
                  {message.text}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                {/* Selección de especializaciones */}
                <Form.Group className="mb-4">
                  <Form.Label className="text-light">
                    <h6>Áreas de Especialización *</h6>
                    <small className="text-muted">Selecciona los tipos de medios que puedes evaluar profesionalmente</small>
                  </Form.Label>
                  <Row>
                    {tiposMedio.map(tipo => (
                      <Col key={tipo.value} md={6} className="mb-3">
                        <Card className="bg-secondary border-0 h-100">
                          <Card.Body>
                            <Form.Check
                              type="checkbox"
                              id={`especialization-${tipo.value}`}
                              checked={formData.especializaciones.includes(tipo.value as any)}
                              onChange={(e) => handleEspecializacionChange(tipo.value, e.target.checked)}
                              label={
                                <div>
                                  <div className="d-flex align-items-center mb-1">
                                    <span className="me-2" style={{ fontSize: '1.5rem' }}>
                                      {tipo.icon}
                                    </span>
                                    <strong className="text-white">{tipo.label}</strong>
                                  </div>
                                  <small className="text-light">{tipo.description}</small>
                                </div>
                              }
                              className="text-white"
                            />
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Form.Group>

                {/* Años de experiencia */}
                <Form.Group className="mb-4">
                  <Form.Label className="text-light">
                    <h6>Años de Experiencia</h6>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    max="50"
                    value={formData.experiencia_años}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      experiencia_años: parseInt(e.target.value) || 0 
                    }))}
                    className="bg-secondary text-white border-secondary"
                    placeholder="Años de experiencia profesional"
                  />
                </Form.Group>

                {/* URL del portfolio */}
                <Form.Group className="mb-4">
                  <Form.Label className="text-light">
                    <h6>URL del Portfolio (opcional)</h6>
                  </Form.Label>
                  <Form.Control
                    type="url"
                    value={formData.portfolio_url}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      portfolio_url: e.target.value 
                    }))}
                    className="bg-secondary text-white border-secondary"
                    placeholder="https://mi-portfolio.com"
                  />
                  <Form.Text className="text-muted">
                    Enlace a tu portfolio profesional para validar tu experiencia
                  </Form.Text>
                </Form.Group>

                {/* Certificaciones */}
                <Form.Group className="mb-4">
                  <Form.Label className="text-light">
                    <h6>Certificaciones y Títulos</h6>
                  </Form.Label>
                  
                  {/* Lista de certificaciones existentes */}
                  {formData.certificaciones.length > 0 && (
                    <div className="mb-3">
                      {formData.certificaciones.map((cert, index) => (
                        <div key={index} className="d-flex align-items-center mb-2">
                          <Badge bg="info" className="flex-grow-1 text-start p-2">
                            {cert}
                          </Badge>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="ms-2"
                            onClick={() => handleRemoveCertificacion(index)}
                          >
                            ✕
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Agregar nueva certificación */}
                  <div className="d-flex gap-2">
                    <Form.Control
                      type="text"
                      value={newCertificacion}
                      onChange={(e) => setNewCertificacion(e.target.value)}
                      className="bg-secondary text-white border-secondary"
                      placeholder="Ej: Licenciatura en Artes Visuales"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCertificacion())}
                    />
                    <Button 
                      variant="outline-success" 
                      onClick={handleAddCertificacion}
                      disabled={!newCertificacion.trim()}
                    >
                      Agregar
                    </Button>
                  </div>
                  <Form.Text className="text-muted">
                    Agrega títulos, certificaciones o cursos relevantes
                  </Form.Text>
                </Form.Group>

                {/* Botones de acción */}
                <div className="d-flex gap-2">
                  <Button 
                    variant="success" 
                    type="submit"
                    disabled={submitting || loading || formData.especializaciones.length === 0}
                    className="flex-fill"
                  >
                    {submitting ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Actualizando...
                      </>
                    ) : (
                      '✅ Actualizar Especialización'
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SpecializationManager;