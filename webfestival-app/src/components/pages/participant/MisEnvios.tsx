import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Alert, Spinner, Modal, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { mediaService, type MedioConResultados } from '../../../services/media.service';
import { useAuth } from '../../../contexts/AuthContext';
import CardPremium from '../../ui/CardPremium';
import ButtonCinematic from '../../ui/ButtonCinematic';
import VideoPlayerPremium from '../../multimedia/VideoPlayerPremium';
import AudioPlayerPremium from '../../multimedia/AudioPlayerPremium';
import DashboardLayout from '../../layout/DashboardLayout';

interface EnviosPorConcurso {
  concurso: {
    id: number;
    titulo: string;
    status: string;
    fecha_final: Date;
    max_envios: number;
  };
  envios: MedioConResultados[];
}

export const MisEnvios: React.FC = () => {
  const { user } = useAuth();
  const [enviosPorConcurso, setEnviosPorConcurso] = useState<EnviosPorConcurso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<MedioConResultados | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  useEffect(() => {
    loadMisEnvios();
  }, [user]);

  const loadMisEnvios = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const medios = await mediaService.getMediaByUser(user.id);
      
      // Agrupar medios por concurso
      const enviosAgrupados = medios.reduce((acc, medio) => {
        const existing = acc.find(item => item.concurso.titulo === medio.concurso.titulo);
        
        if (existing) {
          existing.envios.push(medio);
        } else {
          acc.push({
            concurso: {
              id: medio.concurso_id,
              titulo: medio.concurso.titulo,
              status: 'Activo', // En una implementación real, esto vendría del backend
              fecha_final: new Date(), // En una implementación real, esto vendría del backend
              max_envios: 3 // Límite por defecto
            },
            envios: [medio]
          });
        }
        
        return acc;
      }, [] as EnviosPorConcurso[]);
      
      setEnviosPorConcurso(enviosAgrupados);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar envíos');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewMedia = (medio: MedioConResultados) => {
    setSelectedMedia(medio);
    setShowPreviewModal(true);
  };

  const handleClosePreview = () => {
    setSelectedMedia(null);
    setShowPreviewModal(false);
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

  const getStatusBadgeVariant = (status: string): string => {
    switch (status) {
      case 'Activo': return 'success';
      case 'Calificación': return 'warning';
      case 'Finalizado': return 'secondary';
      default: return 'primary';
    }
  };

  const formatFileSize = (bytes: number): string => {
    return mediaService.formatFileSize(bytes);
  };

  const formatDuration = (seconds?: number): string => {
    return mediaService.formatDuration(seconds);
  };

  const renderMediaPreview = (medio: MedioConResultados) => {
    switch (medio.tipo_medio) {
      case 'fotografia':
        return (
          <img 
            src={medio.preview_url || medio.medio_url} 
            alt={medio.titulo}
            className="img-fluid rounded"
            style={{ maxHeight: '400px', objectFit: 'contain' }}
          />
        );
      case 'video':
      case 'corto_cine':
        return (
          <VideoPlayerPremium
            src={medio.medio_url}
            poster={medio.thumbnail_url}
            title={medio.titulo}
          />
        );
      case 'audio':
        return (
          <AudioPlayerPremium
            src={medio.medio_url}
            title={medio.titulo}
            artist={user?.nombre || 'Desconocido'}
          />
        );
      default:
        return (
          <div className="text-center p-4">
            <div className="display-1 mb-3">{getMediaTypeIcon(medio.tipo_medio)}</div>
            <p>Vista previa no disponible para este tipo de archivo</p>
          </div>
        );
    }
  };

  const renderMetadatos = (metadatos: Record<string, unknown>) => {
    if (!metadatos || Object.keys(metadatos).length === 0) {
      return <p className="text-muted">No hay metadatos disponibles</p>;
    }

    return (
      <div className="row">
        {Object.entries(metadatos).map(([key, value]) => (
          <div key={key} className="col-md-6 mb-2">
            <small className="text-muted d-block">
              <strong>{key}:</strong> {String(value)}
            </small>
          </div>
        ))}
      </div>
    );
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
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="h2 mb-1 text-white">Mis Envíos</h1>
                <p className="text-light mb-0">Gestiona tus participaciones en concursos</p>
              </div>
              <Link to="/participante/dashboard">
                <ButtonCinematic variant="outline" size="sm">
                  Volver al Dashboard
                </ButtonCinematic>
              </Link>
            </div>
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

      {/* Envíos por Concurso */}
      {enviosPorConcurso.length === 0 ? (
        <Row>
          <Col>
            <CardPremium>
              <Card.Body className="text-center py-5">
                <div className="display-1 mb-3">📤</div>
                <h4>No tienes envíos aún</h4>
                <p className="text-muted mb-4">
                  Inscríbete en concursos y sube tus mejores trabajos creativos
                </p>
                <Link to="/participante/dashboard">
                  <ButtonCinematic variant="primary">
                    Explorar Concursos
                  </ButtonCinematic>
                </Link>
              </Card.Body>
            </CardPremium>
          </Col>
        </Row>
      ) : (
        enviosPorConcurso.map((grupo) => (
          <Row key={grupo.concurso.id} className="mb-5">
            <Col>
              <Card className="mb-3">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-1">{grupo.concurso.titulo}</h5>
                    <div className="d-flex align-items-center gap-2">
                      <Badge bg={getStatusBadgeVariant(grupo.concurso.status)}>
                        {grupo.concurso.status}
                      </Badge>
                      <small className="text-muted">
                        {grupo.envios.length} de {grupo.concurso.max_envios} envíos
                      </small>
                    </div>
                  </div>
                  <div>
                    <ProgressBar 
                      now={(grupo.envios.length / grupo.concurso.max_envios) * 100}
                      style={{ width: '100px', height: '8px' }}
                      variant={grupo.envios.length >= grupo.concurso.max_envios ? 'success' : 'primary'}
                    />
                  </div>
                </Card.Header>
              </Card>

              <Row>
                {grupo.envios.map((medio) => (
                  <Col key={medio.id} lg={6} xl={4} className="mb-4">
                    <CardPremium className="h-100">
                      <Card.Body>
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
                          {medio.posicion && (
                            <Badge bg="warning" text="dark">
                              #{medio.posicion}
                            </Badge>
                          )}
                        </div>

                        {/* Thumbnail/Preview */}
                        <div className="mb-3" style={{ height: '150px', overflow: 'hidden' }}>
                          {medio.tipo_medio === 'fotografia' ? (
                            <img 
                              src={medio.thumbnail_url || medio.preview_url || medio.medio_url}
                              alt={medio.titulo}
                              className="img-fluid w-100 h-100 rounded"
                              style={{ objectFit: 'cover', cursor: 'pointer' }}
                              onClick={() => handlePreviewMedia(medio)}
                            />
                          ) : (
                            <div 
                              className="d-flex align-items-center justify-content-center h-100 bg-light rounded cursor-pointer"
                              onClick={() => handlePreviewMedia(medio)}
                            >
                              <div className="text-center">
                                <div className="display-4 mb-2">{getMediaTypeIcon(medio.tipo_medio)}</div>
                                <small className="text-muted">Click para reproducir</small>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Información del archivo */}
                        <div className="mb-3">
                          <small className="text-muted d-block">
                            <strong>Formato:</strong> {medio.formato}
                          </small>
                          <small className="text-muted d-block">
                            <strong>Tamaño:</strong> {formatFileSize(medio.tamaño_archivo)}
                          </small>
                          {medio.duracion && (
                            <small className="text-muted d-block">
                              <strong>Duración:</strong> {formatDuration(medio.duracion)}
                            </small>
                          )}
                          <small className="text-muted d-block">
                            <strong>Subido:</strong> {new Date(medio.fecha_subida).toLocaleDateString()}
                          </small>
                        </div>

                        {/* Puntuación si está disponible */}
                        {medio.puntaje_final && (
                          <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="fw-bold">Puntuación Final:</span>
                              <Badge bg="success" className="fs-6">
                                {medio.puntaje_final}/100
                              </Badge>
                            </div>
                          </div>
                        )}

                        {/* Acciones */}
                        <div className="d-flex gap-2">
                          <ButtonCinematic
                            variant="outline"
                            size="sm"
                            onClick={() => handlePreviewMedia(medio)}
                            className="flex-grow-1"
                          >
                            Ver Detalles
                          </ButtonCinematic>
                          {medio.calificaciones && medio.calificaciones.length > 0 && (
                            <Link to={`/participante/resultados/${medio.id}`}>
                              <ButtonCinematic variant="outline" size="sm">
                                Calificaciones
                              </ButtonCinematic>
                            </Link>
                          )}
                        </div>
                      </Card.Body>
                    </CardPremium>
                  </Col>
                ))}

                {/* Botón para agregar más envíos si no se ha alcanzado el límite */}
                {grupo.envios.length < grupo.concurso.max_envios && grupo.concurso.status === 'Activo' && (
                  <Col lg={6} xl={4} className="mb-4">
                    <CardPremium className="h-100 border-dashed">
                      <Card.Body className="d-flex flex-column justify-content-center align-items-center text-center">
                        <div className="display-1 mb-3 text-muted">➕</div>
                        <h6 className="mb-2">Agregar Envío</h6>
                        <p className="text-muted mb-3 small">
                          Puedes subir {grupo.concurso.max_envios - grupo.envios.length} envío(s) más
                        </p>
                        <Link to={`/participante/concurso/${grupo.concurso.id}/subir`}>
                          <ButtonCinematic variant="primary" size="sm">
                            Subir Medio
                          </ButtonCinematic>
                        </Link>
                      </Card.Body>
                    </CardPremium>
                  </Col>
                )}
              </Row>
            </Col>
          </Row>
        ))
      )}

      {/* Modal de Preview */}
      <Modal 
        show={showPreviewModal} 
        onHide={handleClosePreview} 
        size="lg" 
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedMedia && (
              <div className="d-flex align-items-center gap-2">
                <span>{getMediaTypeIcon(selectedMedia.tipo_medio)}</span>
                {selectedMedia.titulo}
              </div>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedMedia && (
            <div>
              {/* Preview del medio */}
              <div className="mb-4">
                {renderMediaPreview(selectedMedia)}
              </div>

              {/* Metadatos */}
              <div className="mb-4">
                <h6>Metadatos Extraídos</h6>
                {renderMetadatos(selectedMedia.metadatos)}
              </div>

              {/* Información adicional */}
              <div className="row">
                <div className="col-md-6">
                  <h6>Información del Archivo</h6>
                  <small className="text-muted d-block">
                    <strong>Formato:</strong> {selectedMedia.formato}
                  </small>
                  <small className="text-muted d-block">
                    <strong>Tamaño:</strong> {formatFileSize(selectedMedia.tamaño_archivo)}
                  </small>
                  {selectedMedia.duracion && (
                    <small className="text-muted d-block">
                      <strong>Duración:</strong> {formatDuration(selectedMedia.duracion)}
                    </small>
                  )}
                </div>
                <div className="col-md-6">
                  <h6>Detalles de Participación</h6>
                  <small className="text-muted d-block">
                    <strong>Concurso:</strong> {selectedMedia.concurso.titulo}
                  </small>
                  <small className="text-muted d-block">
                    <strong>Fecha de Subida:</strong> {new Date(selectedMedia.fecha_subida).toLocaleDateString()}
                  </small>
                  {selectedMedia.puntaje_final && (
                    <small className="text-muted d-block">
                      <strong>Puntuación:</strong> {selectedMedia.puntaje_final}/100
                    </small>
                  )}
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <ButtonCinematic variant="secondary" onClick={handleClosePreview}>
            Cerrar
          </ButtonCinematic>
          {selectedMedia?.calificaciones && selectedMedia.calificaciones.length > 0 && (
            <Link to={`/participante/resultados/${selectedMedia.id}`}>
              <ButtonCinematic variant="primary" onClick={handleClosePreview}>
                Ver Calificaciones Detalladas
              </ButtonCinematic>
            </Link>
          )}
        </Modal.Footer>
      </Modal>
      </Container>
    </DashboardLayout>
  );
};

export default MisEnvios;