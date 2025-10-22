import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Alert, Spinner, ProgressBar, Accordion, Table } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { mediaService, type MedioConResultados } from '../../../services/media.service';
import CardPremium from '../../ui/CardPremium';
import ButtonCinematic from '../../ui/ButtonCinematic';
import VideoPlayerPremium from '../../multimedia/VideoPlayerPremium';
import AudioPlayerPremium from '../../multimedia/AudioPlayerPremium';

export const ResultadosDetallados: React.FC = () => {
  const { medioId } = useParams<{ medioId: string }>();
  const [medio, setMedio] = useState<MedioConResultados | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (medioId) {
      loadMedioDetallado();
    }
  }, [medioId]);

  const loadMedioDetallado = async () => {
    try {
      setLoading(true);
      setError(null);
      const medioData = await mediaService.getMediaById(Number(medioId));
      setMedio(medioData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar resultados');
    } finally {
      setLoading(false);
    }
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

  const getPuntuacionColor = (puntuacion: number): string => {
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
      <Badge bg={variant} className="fs-6">
        {icon} Posición #{posicion}
      </Badge>
    );
  };

  const renderMediaPreview = () => {
    if (!medio) return null;

    switch (medio.tipo_medio) {
      case 'fotografia':
        return (
          <img 
            src={medio.preview_url || medio.medio_url} 
            alt={medio.titulo}
            className="img-fluid rounded"
            style={{ maxHeight: '400px', objectFit: 'contain', width: '100%' }}
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
            artist={medio.usuario.nombre}
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

  const renderMetadatos = () => {
    if (!medio?.metadatos || Object.keys(medio.metadatos).length === 0) {
      return (
        <div className="text-center py-4">
          <p className="text-muted">No hay metadatos disponibles</p>
        </div>
      );
    }

    return (
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>Propiedad</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(medio.metadatos).map(([key, value]) => (
            <tr key={key}>
              <td className="fw-bold">{key}</td>
              <td>{String(value)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  };

  const calcularPromedioCalificaciones = (): number => {
    if (!medio?.calificaciones || medio.calificaciones.length === 0) return 0;
    
    const totalPuntos = medio.calificaciones.reduce((acc, calificacion) => {
      const puntosCalificacion = calificacion.detalles.reduce((sum, detalle) => sum + detalle.puntuacion, 0);
      return acc + puntosCalificacion;
    }, 0);
    
    const totalCriterios = medio.calificaciones.reduce((acc, calificacion) => acc + calificacion.detalles.length, 0);
    
    return totalCriterios > 0 ? totalPuntos / totalCriterios : 0;
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

  if (error || !medio) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          {error || 'Medio no encontrado'}
          <hr />
          <div className="d-flex justify-content-end">
            <Link to="/participante/mis-envios">
              <ButtonCinematic variant="secondary">
                Volver a Mis Envíos
              </ButtonCinematic>
            </Link>
          </div>
        </Alert>
      </Container>
    );
  }

  const promedioCalificaciones = calcularPromedioCalificaciones();

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h2 mb-1">Resultados Detallados</h1>
              <p className="text-muted mb-0">
                Calificaciones y feedback de tu participación
              </p>
            </div>
            <Link to="/participante/mis-envios">
              <ButtonCinematic variant="outline" size="sm">
                Volver a Mis Envíos
              </ButtonCinematic>
            </Link>
          </div>
        </Col>
      </Row>

      <Row>
        {/* Información del Medio */}
        <Col lg={8}>
          <CardPremium className="mb-4">
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <span className="fs-4">{getMediaTypeIcon(medio.tipo_medio)}</span>
                  <div>
                    <h5 className="mb-0">{medio.titulo}</h5>
                    <small className="text-muted">
                      {medio.concurso.titulo} • {medio.tipo_medio.replace('_', ' ')}
                    </small>
                  </div>
                </div>
                {getPosicionBadge(medio.posicion)}
              </div>
            </Card.Header>
            <Card.Body>
              {/* Preview del medio */}
              <div className="mb-4">
                {renderMediaPreview()}
              </div>

              {/* Información básica */}
              <Row className="mb-4">
                <Col md={6}>
                  <h6>Información del Archivo</h6>
                  <small className="text-muted d-block">
                    <strong>Formato:</strong> {medio.formato}
                  </small>
                  <small className="text-muted d-block">
                    <strong>Tamaño:</strong> {mediaService.formatFileSize(medio.tamaño_archivo)}
                  </small>
                  {medio.duracion && (
                    <small className="text-muted d-block">
                      <strong>Duración:</strong> {mediaService.formatDuration(medio.duracion)}
                    </small>
                  )}
                  <small className="text-muted d-block">
                    <strong>Fecha de Subida:</strong> {new Date(medio.fecha_subida).toLocaleDateString()}
                  </small>
                </Col>
                <Col md={6}>
                  <h6>Participación</h6>
                  <small className="text-muted d-block">
                    <strong>Concurso:</strong> {medio.concurso.titulo}
                  </small>
                  <small className="text-muted d-block">
                    <strong>Participante:</strong> {medio.usuario.nombre}
                  </small>
                  {medio.posicion && (
                    <small className="text-muted d-block">
                      <strong>Posición Final:</strong> #{medio.posicion}
                    </small>
                  )}
                  {medio.puntaje_final && (
                    <small className="text-muted d-block">
                      <strong>Puntaje Final:</strong> {medio.puntaje_final}/100
                    </small>
                  )}
                </Col>
              </Row>

              {/* Metadatos Extraídos */}
              <div>
                <h6>Metadatos Extraídos Automáticamente</h6>
                <p className="text-muted small mb-3">
                  Información técnica extraída automáticamente del archivo
                </p>
                {renderMetadatos()}
              </div>
            </Card.Body>
          </CardPremium>
        </Col>

        {/* Panel de Calificaciones */}
        <Col lg={4}>
          <CardPremium className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Resumen de Calificaciones</h5>
            </Card.Header>
            <Card.Body>
              {medio.puntaje_final ? (
                <div className="text-center mb-4">
                  <div className="display-4 mb-2">
                    <Badge bg={getPuntuacionColor(medio.puntaje_final)} className="fs-1">
                      {medio.puntaje_final}
                    </Badge>
                  </div>
                  <p className="text-muted">Puntuación Final</p>
                  <ProgressBar 
                    now={medio.puntaje_final} 
                    variant={getPuntuacionColor(medio.puntaje_final)}
                    className="mb-2"
                  />
                  <small className="text-muted">de 100 puntos</small>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="display-4 mb-3 text-muted">⏳</div>
                  <h6>Calificación Pendiente</h6>
                  <p className="text-muted small">
                    Tu envío está siendo evaluado por el jurado
                  </p>
                </div>
              )}

              {promedioCalificaciones > 0 && (
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="small">Promedio por Criterio:</span>
                    <Badge bg={getPuntuacionColor(promedioCalificaciones)}>
                      {promedioCalificaciones.toFixed(1)}
                    </Badge>
                  </div>
                </div>
              )}

              {medio.calificaciones && medio.calificaciones.length > 0 && (
                <div>
                  <h6 className="mb-2">Estadísticas</h6>
                  <small className="text-muted d-block">
                    <strong>Jurados que evaluaron:</strong> {medio.calificaciones.length}
                  </small>
                  <small className="text-muted d-block">
                    <strong>Criterios evaluados:</strong> {
                      medio.calificaciones.reduce((acc, cal) => acc + cal.detalles.length, 0)
                    }
                  </small>
                </div>
              )}
            </Card.Body>
          </CardPremium>
        </Col>
      </Row>

      {/* Calificaciones Detalladas */}
      {medio.calificaciones && medio.calificaciones.length > 0 && (
        <Row>
          <Col>
            <CardPremium>
              <Card.Header>
                <h5 className="mb-0">Calificaciones Detalladas por Criterio</h5>
              </Card.Header>
              <Card.Body>
                <Accordion>
                  {medio.calificaciones.map((calificacion, index) => (
                    <Accordion.Item key={index} eventKey={index.toString()}>
                      <Accordion.Header>
                        <div className="d-flex justify-content-between align-items-center w-100 me-3">
                          <span>Evaluación #{index + 1}</span>
                          <div className="d-flex align-items-center gap-2">
                            <Badge bg="info">
                              {calificacion.detalles.length} criterios
                            </Badge>
                            <small className="text-muted">
                              {new Date(calificacion.fecha_calificacion).toLocaleDateString()}
                            </small>
                          </div>
                        </div>
                      </Accordion.Header>
                      <Accordion.Body>
                        {/* Comentarios generales */}
                        {calificacion.comentarios && (
                          <Alert variant="light" className="mb-3">
                            <h6>Comentarios del Jurado</h6>
                            <p className="mb-0">{calificacion.comentarios}</p>
                          </Alert>
                        )}

                        {/* Detalles por criterio */}
                        <h6 className="mb-3">Puntuación por Criterio</h6>
                        <Row>
                          {calificacion.detalles.map((detalle, detalleIndex) => (
                            <Col key={detalleIndex} md={6} className="mb-3">
                              <Card className="h-100">
                                <Card.Body>
                                  <div className="d-flex justify-content-between align-items-start mb-2">
                                    <div className="flex-grow-1">
                                      <h6 className="mb-1">{detalle.criterio.nombre}</h6>
                                      {detalle.criterio.descripcion && (
                                        <small className="text-muted">
                                          {detalle.criterio.descripcion}
                                        </small>
                                      )}
                                    </div>
                                    <Badge 
                                      bg={getPuntuacionColor(detalle.puntuacion)}
                                      className="ms-2"
                                    >
                                      {detalle.puntuacion}
                                    </Badge>
                                  </div>
                                  <ProgressBar 
                                    now={detalle.puntuacion} 
                                    variant={getPuntuacionColor(detalle.puntuacion)}
                                  />
                                </Card.Body>
                              </Card>
                            </Col>
                          ))}
                        </Row>

                        {/* Promedio de esta evaluación */}
                        <div className="mt-3 pt-3 border-top">
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="fw-bold">Promedio de esta evaluación:</span>
                            <Badge 
                              bg={getPuntuacionColor(
                                calificacion.detalles.reduce((sum, d) => sum + d.puntuacion, 0) / calificacion.detalles.length
                              )}
                              className="fs-6"
                            >
                              {(calificacion.detalles.reduce((sum, d) => sum + d.puntuacion, 0) / calificacion.detalles.length).toFixed(1)}
                            </Badge>
                          </div>
                        </div>
                      </Accordion.Body>
                    </Accordion.Item>
                  ))}
                </Accordion>
              </Card.Body>
            </CardPremium>
          </Col>
        </Row>
      )}

      {/* Mensaje si no hay calificaciones */}
      {(!medio.calificaciones || medio.calificaciones.length === 0) && (
        <Row>
          <Col>
            <CardPremium>
              <Card.Body className="text-center py-5">
                <div className="display-1 mb-3">⏳</div>
                <h4>Evaluación en Proceso</h4>
                <p className="text-muted mb-4">
                  Tu envío está siendo evaluado por nuestro jurado especializado. 
                  Las calificaciones detalladas aparecerán aquí una vez completada la evaluación.
                </p>
                <Link to="/participante/mis-envios">
                  <ButtonCinematic variant="primary">
                    Volver a Mis Envíos
                  </ButtonCinematic>
                </Link>
              </Card.Body>
            </CardPremium>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default ResultadosDetallados;