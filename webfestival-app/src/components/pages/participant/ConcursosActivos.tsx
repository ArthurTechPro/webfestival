import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useConcursos } from '../../../hooks/useConcursos';
import CardPremium from '../../ui/CardPremium';
import ButtonCinematic from '../../ui/ButtonCinematic';

export const ConcursosActivos: React.FC = () => {
  const { 
    concursosActivos, 
    loading, 
    error, 
    inscribirseAConcurso,
    verificarInscripcion 
  } = useConcursos();
  
  const [procesandoInscripcion, setProcesandoInscripcion] = useState<number | null>(null);
  const [inscripciones, setInscripciones] = useState<Record<number, boolean>>({});

  useEffect(() => {
    // Verificar inscripciones para todos los concursos
    const verificarTodasInscripciones = async () => {
      const inscripcionesMap: Record<number, boolean> = {};
      
      for (const concurso of concursosActivos) {
        try {
          const { inscrito } = await verificarInscripcion(concurso.id);
          inscripcionesMap[concurso.id] = inscrito;
        } catch (error) {
          inscripcionesMap[concurso.id] = false;
        }
      }
      
      setInscripciones(inscripcionesMap);
    };

    if (concursosActivos.length > 0) {
      verificarTodasInscripciones();
    }
  }, [concursosActivos, verificarInscripcion]);

  const handleInscripcion = async (concursoId: number) => {
    setProcesandoInscripcion(concursoId);
    try {
      const success = await inscribirseAConcurso(concursoId);
      if (success) {
        setInscripciones(prev => ({ ...prev, [concursoId]: true }));
      }
    } finally {
      setProcesandoInscripcion(null);
    }
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
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="h2 mb-1">Concursos Activos</h1>
          <p className="text-muted mb-0">Descubre y participa en concursos multimedia</p>
        </Col>
      </Row>

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

      {concursosActivos.length === 0 ? (
        <Row>
          <Col>
            <CardPremium>
              <Card.Body className="text-center py-5">
                <div className="display-1 mb-3">🎨</div>
                <h4>No hay concursos activos</h4>
                <p className="text-muted">
                  No hay concursos activos en este momento. Vuelve pronto para nuevas oportunidades.
                </p>
              </Card.Body>
            </CardPremium>
          </Col>
        </Row>
      ) : (
        <Row>
          {concursosActivos.map((concurso) => {
            const diasRestantes = getDiasRestantes(concurso.fecha_final);
            const inscrito = inscripciones[concurso.id] || false;
            
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
    </Container>
  );
};

export default ConcursosActivos;