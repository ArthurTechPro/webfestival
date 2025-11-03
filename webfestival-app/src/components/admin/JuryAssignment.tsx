import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Badge,
  Form,
  Alert,
  Spinner,
  Modal,
  ListGroup
} from 'react-bootstrap';
import { useAdmin } from '../../hooks/useAdmin';
import type { Categoria } from '../../types';

/**
 * Componente para asignación inteligente de jurados especializados
 */
const JuryAssignment: React.FC = () => {
  const {
    jurados,
    asignaciones,
    concursos,
    loadJurados,
    loadAsignaciones,
    loadConcursos,
    asignarJurado,
    removerAsignacion,
    loading,
    error,
    setError
  } = useAdmin();

  // Estados locales
  const [selectedConcurso, setSelectedConcurso] = useState<number | null>(null);
  const [selectedEspecialidad, setSelectedEspecialidad] = useState<string>('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    loadConcursos();
    loadJurados();
    loadAsignaciones();
  }, [loadConcursos, loadJurados, loadAsignaciones]);

  // Filtrar jurados cuando cambie la especialidad
  useEffect(() => {
    if (selectedEspecialidad) {
      loadJurados(selectedEspecialidad);
    } else {
      loadJurados();
    }
  }, [selectedEspecialidad, loadJurados]);

  // Filtrar asignaciones cuando cambie el concurso
  useEffect(() => {
    if (selectedConcurso) {
      loadAsignaciones(selectedConcurso);
    } else {
      loadAsignaciones();
    }
  }, [selectedConcurso, loadAsignaciones]);

  // Obtener concurso seleccionado
  const concursoSeleccionado = concursos.find(c => c.id === selectedConcurso);

  // Obtener categorías del concurso seleccionado
  const categorias = concursoSeleccionado?.categorias || [];

  // Obtener asignaciones por categoría
  const getAsignacionesPorCategoria = (categoriaId: number) => {
    return asignaciones.filter(a => a.categoria_id === categoriaId);
  };

  // Verificar si un jurado ya está asignado a una categoría
  const isJuradoAsignado = (juradoId: string, categoriaId: number) => {
    return asignaciones.some(a => a.usuario_id === juradoId && a.categoria_id === categoriaId);
  };

  // Manejar asignación de jurado
  const handleAsignarJurado = async (juradoId: string) => {
    if (!selectedCategoria) return;
    
    try {
      await asignarJurado(juradoId, selectedCategoria.id);
      setShowAssignModal(false);
      setSelectedCategoria(null);
    } catch (err) {
      // Error ya manejado en el hook
    }
  };

  // Manejar remoción de asignación
  const handleRemoverAsignacion = async (asignacionId: string) => {
    if (window.confirm('¿Estás seguro de remover esta asignación?')) {
      try {
        await removerAsignacion(asignacionId);
      } catch (err) {
        // Error ya manejado en el hook
      }
    }
  };

  // Abrir modal de asignación
  const openAssignModal = (categoria: Categoria) => {
    setSelectedCategoria(categoria);
    setSelectedEspecialidad(categoria.tipo_medio || '');
    setShowAssignModal(true);
  };

  // Obtener color del badge según especialidad
  const getEspecialidadBadgeVariant = (especialidad: string) => {
    switch (especialidad) {
      case 'fotografia': return 'primary';
      case 'video': return 'success';
      case 'audio': return 'warning';
      case 'corto_cine': return 'danger';
      default: return 'secondary';
    }
  };

  // Obtener texto de especialidad
  const getEspecialidadText = (especialidad: string) => {
    switch (especialidad) {
      case 'fotografia': return 'Fotografía';
      case 'video': return 'Video';
      case 'audio': return 'Audio';
      case 'corto_cine': return 'Corto de Cine';
      default: return especialidad;
    }
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="text-white mb-1">Asignación de Jurados</h2>
              <p className="text-light mb-0">Asigna jurados especializados a categorías de concursos</p>
            </div>
            <Badge bg="warning" className="fs-6">
              {asignaciones.length} asignaciones activas
            </Badge>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filtros */}
      <Row className="mb-4">
        <Col>
          <Card className="bg-dark text-white border-0">
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Seleccionar Concurso</Form.Label>
                    <Form.Select
                      value={selectedConcurso || ''}
                      onChange={(e) => setSelectedConcurso(e.target.value ? parseInt(e.target.value) : null)}
                      className="bg-secondary text-white border-0"
                    >
                      <option value="">Todos los concursos</option>
                      {concursos.map(concurso => (
                        <option key={concurso.id} value={concurso.id}>
                          {concurso.titulo} ({concurso.status})
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Filtrar por Especialidad</Form.Label>
                    <Form.Select
                      value={selectedEspecialidad}
                      onChange={(e) => setSelectedEspecialidad(e.target.value)}
                      className="bg-secondary text-white border-0"
                    >
                      <option value="">Todas las especialidades</option>
                      <option value="fotografia">Fotografía</option>
                      <option value="video">Video</option>
                      <option value="audio">Audio</option>
                      <option value="corto_cine">Corto de Cine</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Vista de Categorías y Asignaciones */}
      {selectedConcurso && concursoSeleccionado ? (
        <Row>
          <Col>
            <Card className="bg-dark text-white border-0">
              <Card.Header>
                <h5 className="mb-0">
                  Categorías del Concurso: {concursoSeleccionado.titulo}
                </h5>
              </Card.Header>
              <Card.Body>
                {categorias.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-light">Este concurso no tiene categorías configuradas</p>
                  </div>
                ) : (
                  <Row>
                    {categorias.map(categoria => {
                      const asignacionesCategoria = getAsignacionesPorCategoria(categoria.id);
                      return (
                        <Col md={6} lg={4} key={categoria.id} className="mb-4">
                          <Card className="bg-secondary text-white border-0 h-100">
                            <Card.Header>
                              <div className="d-flex justify-content-between align-items-center">
                                <strong>{categoria.nombre}</strong>
                                <Badge bg={getEspecialidadBadgeVariant(categoria.tipo_medio || '')}>
                                  {getEspecialidadText(categoria.tipo_medio || '')}
                                </Badge>
                              </div>
                            </Card.Header>
                            <Card.Body>
                              <div className="mb-3">
                                <small className="text-muted">
                                  Jurados asignados: {asignacionesCategoria.length}
                                </small>
                              </div>
                              
                              {asignacionesCategoria.length === 0 ? (
                                <p className="text-light mb-3">No hay jurados asignados</p>
                              ) : (
                                <ListGroup variant="flush" className="mb-3">
                                  {asignacionesCategoria.map(asignacion => (
                                    <ListGroup.Item 
                                      key={asignacion.id}
                                      className="bg-dark text-white border-secondary d-flex justify-content-between align-items-center"
                                    >
                                      <div>
                                        <strong>{asignacion.usuario.nombre}</strong>
                                        <br />
                                        <small className="text-muted">{asignacion.usuario.email}</small>
                                      </div>
                                      <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => handleRemoverAsignacion(asignacion.id)}
                                      >
                                        🗑️
                                      </Button>
                                    </ListGroup.Item>
                                  ))}
                                </ListGroup>
                              )}
                              
                              <Button
                                variant="outline-success"
                                className="w-100"
                                onClick={() => openAssignModal(categoria)}
                              >
                                ➕ Asignar Jurado
                              </Button>
                            </Card.Body>
                          </Card>
                        </Col>
                      );
                    })}
                  </Row>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : (
        /* Vista General de Asignaciones */
        <Row>
          <Col>
            <Card className="bg-dark text-white border-0">
              <Card.Header>
                <h5 className="mb-0">Todas las Asignaciones</h5>
              </Card.Header>
              <Card.Body className="p-0">
                {loading ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" variant="light" />
                    <p className="mt-2 text-light">Cargando asignaciones...</p>
                  </div>
                ) : asignaciones.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-light">No hay asignaciones registradas</p>
                    <p className="text-muted">Selecciona un concurso para comenzar a asignar jurados</p>
                  </div>
                ) : (
                  <Table variant="dark" className="mb-0">
                    <thead>
                      <tr>
                        <th>Jurado</th>
                        <th>Concurso</th>
                        <th>Categoría</th>
                        <th>Especialidad</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {asignaciones.map(asignacion => (
                        <tr key={asignacion.id}>
                          <td>
                            <div>
                              <strong>{asignacion.usuario.nombre}</strong>
                              <br />
                              <small className="text-muted">{asignacion.usuario.email}</small>
                            </div>
                          </td>
                          <td>
                            {concursos.find(c => 
                              c.categorias?.some(cat => cat.id === asignacion.categoria_id)
                            )?.titulo || 'N/A'}
                          </td>
                          <td>{asignacion.categoria.nombre}</td>
                          <td>
                            <Badge bg={getEspecialidadBadgeVariant(asignacion.especialidad)}>
                              {getEspecialidadText(asignacion.especialidad)}
                            </Badge>
                          </td>
                          <td>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleRemoverAsignacion(asignacion.id)}
                            >
                              🗑️ Remover
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Modal de Asignación de Jurado */}
      <Modal 
        show={showAssignModal} 
        onHide={() => setShowAssignModal(false)}
        size="lg"
      >
        <Modal.Header closeButton className="bg-dark text-white">
          <Modal.Title>
            Asignar Jurado a: {selectedCategoria?.nombre}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-white">
          {selectedCategoria && (
            <div className="mb-3">
              <Badge bg={getEspecialidadBadgeVariant(selectedCategoria.tipo_medio || '')}>
                Especialidad requerida: {getEspecialidadText(selectedCategoria.tipo_medio || '')}
              </Badge>
            </div>
          )}
          
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="light" />
              <p className="mt-2 text-light">Cargando jurados especializados...</p>
            </div>
          ) : jurados.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-light">No hay jurados disponibles para esta especialidad</p>
            </div>
          ) : (
            <ListGroup variant="flush">
              {jurados
                .filter(jurado => !isJuradoAsignado(jurado.id, selectedCategoria?.id || 0))
                .map(jurado => (
                <ListGroup.Item 
                  key={jurado.id}
                  className="bg-secondary text-white border-dark d-flex justify-content-between align-items-center"
                >
                  <div>
                    <div className="d-flex align-items-center">
                      {jurado.picture_url ? (
                        <img
                          src={jurado.picture_url}
                          alt={jurado.nombre}
                          className="rounded-circle me-2"
                          width="40"
                          height="40"
                        />
                      ) : (
                        <div className="bg-dark rounded-circle me-2 d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                          👤
                        </div>
                      )}
                      <div>
                        <strong>{jurado.nombre}</strong>
                        <br />
                        <small className="text-muted">{jurado.email}</small>
                        {jurado.bio && (
                          <>
                            <br />
                            <small className="text-light">{jurado.bio.substring(0, 50)}...</small>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleAsignarJurado(jurado.id)}
                  >
                    ✅ Asignar
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-dark">
          <Button variant="secondary" onClick={() => setShowAssignModal(false)}>
            Cancelar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default JuryAssignment;