import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Badge,
  Modal,
  Form,
  Alert,
  Spinner,
  ButtonGroup,
  Dropdown
} from 'react-bootstrap';
import { useAdmin } from '../../hooks/useAdmin';
import type { Concurso } from '../../types';
import type { CreateConcursoDto } from '../../services/admin.service';

/**
 * Componente para gestión completa de concursos
 */
const ConcursoManagement: React.FC = () => {
  const {
    concursos,
    loadConcursos,
    createConcurso,
    updateConcurso,
    deleteConcurso,
    cambiarEstadoConcurso,
    loading,
    error,
    setError
  } = useAdmin();

  // Estados locales
  const [showModal, setShowModal] = useState(false);
  const [editingConcurso, setEditingConcurso] = useState<Concurso | null>(null);
  const [formData, setFormData] = useState<CreateConcursoDto>({
    titulo: '',
    descripcion: '',
    reglas: '',
    fecha_inicio: new Date(),
    fecha_final: new Date(),
    max_envios: 3,
    tamaño_max_mb: 10,
    categorias: [{ nombre: '', tipo_medio: 'fotografia' }]
  });

  // Cargar concursos al montar
  useEffect(() => {
    loadConcursos();
  }, [loadConcursos]);

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingConcurso) {
        await updateConcurso(editingConcurso.id, formData);
      } else {
        await createConcurso(formData);
      }
      handleCloseModal();
    } catch (err) {
      // Error ya manejado en el hook
    }
  };

  // Cerrar modal y resetear formulario
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingConcurso(null);
    setFormData({
      titulo: '',
      descripcion: '',
      reglas: '',
      fecha_inicio: new Date(),
      fecha_final: new Date(),
      max_envios: 3,
      tamaño_max_mb: 10,
      categorias: [{ nombre: '', tipo_medio: 'fotografia' }]
    });
  };

  // Abrir modal para editar
  const handleEdit = (concurso: Concurso) => {
    setEditingConcurso(concurso);
    setFormData({
      titulo: concurso.titulo,
      descripcion: concurso.descripcion,
      reglas: concurso.reglas || '',
      fecha_inicio: new Date(concurso.fecha_inicio),
      fecha_final: new Date(concurso.fecha_final),
      max_envios: concurso.max_envios || 3,
      tamaño_max_mb: concurso.tamaño_max_mb || 10,
      categorias: concurso.categorias?.map(cat => ({
        nombre: cat.nombre,
        tipo_medio: cat.tipo_medio || 'fotografia'
      })) || [{ nombre: '', tipo_medio: 'fotografia' }]
    });
    setShowModal(true);
  };

  // Eliminar concurso con confirmación
  const handleDelete = async (id: number, titulo: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el concurso "${titulo}"?`)) {
      try {
        await deleteConcurso(id);
      } catch (err) {
        // Error ya manejado en el hook
      }
    }
  };

  // Cambiar estado del concurso
  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await cambiarEstadoConcurso(id, newStatus);
    } catch (err) {
      // Error ya manejado en el hook
    }
  };

  // Agregar nueva categoría
  const addCategoria = () => {
    setFormData(prev => ({
      ...prev,
      categorias: [...prev.categorias, { nombre: '', tipo_medio: 'fotografia' }]
    }));
  };

  // Remover categoría
  const removeCategoria = (index: number) => {
    setFormData(prev => ({
      ...prev,
      categorias: prev.categorias.filter((_, i) => i !== index)
    }));
  };

  // Actualizar categoría
  const updateCategoria = (index: number, field: 'nombre' | 'tipo_medio', value: string) => {
    setFormData(prev => ({
      ...prev,
      categorias: prev.categorias.map((cat, i) => 
        i === index ? { ...cat, [field]: value } : cat
      )
    }));
  };

  // Obtener color del badge según estado
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Activo': return 'success';
      case 'Próximamente': return 'primary';
      case 'Calificación': return 'warning';
      case 'Finalizado': return 'secondary';
      default: return 'light';
    }
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="text-white mb-1">Gestión de Concursos</h2>
              <p className="text-light mb-0">Administra todos los concursos multimedia</p>
            </div>
            <Button 
              variant="danger" 
              onClick={() => setShowModal(true)}
            >
              ➕ Nuevo Concurso
            </Button>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Tabla de Concursos */}
      <Row>
        <Col>
          <Card className="bg-dark text-white border-0">
            <Card.Header>
              <h5 className="mb-0">Lista de Concursos ({concursos.length})</h5>
            </Card.Header>
            <Card.Body className="p-0">
              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" variant="light" />
                  <p className="mt-2 text-light">Cargando concursos...</p>
                </div>
              ) : concursos.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-light">No hay concursos registrados</p>
                  <Button variant="outline-danger" onClick={() => setShowModal(true)}>
                    Crear Primer Concurso
                  </Button>
                </div>
              ) : (
                <Table variant="dark" className="mb-0">
                  <thead>
                    <tr>
                      <th>Título</th>
                      <th>Estado</th>
                      <th>Fecha Inicio</th>
                      <th>Fecha Final</th>
                      <th>Categorías</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {concursos.map((concurso) => (
                      <tr key={concurso.id}>
                        <td>
                          <div>
                            <strong>{concurso.titulo}</strong>
                            <br />
                            <small className="text-muted">
                              {concurso.descripcion.substring(0, 50)}...
                            </small>
                          </div>
                        </td>
                        <td>
                          <Badge bg={getStatusBadgeVariant(concurso.status)}>
                            {concurso.status}
                          </Badge>
                        </td>
                        <td>
                          {new Date(concurso.fecha_inicio).toLocaleDateString()}
                        </td>
                        <td>
                          {new Date(concurso.fecha_final).toLocaleDateString()}
                        </td>
                        <td>
                          <Badge bg="info" className="me-1">
                            {concurso.categorias?.length || 0} categorías
                          </Badge>
                        </td>
                        <td>
                          <ButtonGroup size="sm">
                            <Button
                              variant="outline-primary"
                              onClick={() => handleEdit(concurso)}
                            >
                              ✏️
                            </Button>
                            <Dropdown>
                              <Dropdown.Toggle 
                                variant="outline-warning" 
                                size="sm"
                                id={`dropdown-${concurso.id}`}
                              >
                                🔄
                              </Dropdown.Toggle>
                              <Dropdown.Menu variant="dark">
                                <Dropdown.Item 
                                  onClick={() => handleStatusChange(concurso.id, 'Próximamente')}
                                >
                                  Próximamente
                                </Dropdown.Item>
                                <Dropdown.Item 
                                  onClick={() => handleStatusChange(concurso.id, 'Activo')}
                                >
                                  Activo
                                </Dropdown.Item>
                                <Dropdown.Item 
                                  onClick={() => handleStatusChange(concurso.id, 'Calificación')}
                                >
                                  Calificación
                                </Dropdown.Item>
                                <Dropdown.Item 
                                  onClick={() => handleStatusChange(concurso.id, 'Finalizado')}
                                >
                                  Finalizado
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                            <Button
                              variant="outline-danger"
                              onClick={() => handleDelete(concurso.id, concurso.titulo)}
                            >
                              🗑️
                            </Button>
                          </ButtonGroup>
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

      {/* Modal de Crear/Editar Concurso */}
      <Modal 
        show={showModal} 
        onHide={handleCloseModal} 
        size="lg"
        backdrop="static"
      >
        <Modal.Header closeButton className="bg-dark text-white">
          <Modal.Title>
            {editingConcurso ? 'Editar Concurso' : 'Nuevo Concurso'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-white">
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Título del Concurso</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.titulo}
                    onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                    required
                    className="bg-secondary text-white border-0"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Máximo Envíos por Participante</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max="10"
                    value={formData.max_envios}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_envios: parseInt(e.target.value) }))}
                    required
                    className="bg-secondary text-white border-0"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.descripcion}
                onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                required
                className="bg-secondary text-white border-0"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Reglas del Concurso</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={formData.reglas}
                onChange={(e) => setFormData(prev => ({ ...prev, reglas: e.target.value }))}
                className="bg-secondary text-white border-0"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha de Inicio</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={formData.fecha_inicio.toISOString().slice(0, 16)}
                    onChange={(e) => setFormData(prev => ({ ...prev, fecha_inicio: new Date(e.target.value) }))}
                    required
                    className="bg-secondary text-white border-0"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha Final</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={formData.fecha_final.toISOString().slice(0, 16)}
                    onChange={(e) => setFormData(prev => ({ ...prev, fecha_final: new Date(e.target.value) }))}
                    required
                    className="bg-secondary text-white border-0"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Tamaño Máximo de Archivo (MB)</Form.Label>
              <Form.Control
                type="number"
                min="1"
                max="100"
                value={formData.tamaño_max_mb}
                onChange={(e) => setFormData(prev => ({ ...prev, tamaño_max_mb: parseInt(e.target.value) }))}
                required
                className="bg-secondary text-white border-0"
              />
            </Form.Group>

            {/* Gestión de Categorías */}
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Form.Label>Categorías del Concurso</Form.Label>
                <Button variant="outline-success" size="sm" onClick={addCategoria}>
                  ➕ Agregar Categoría
                </Button>
              </div>
              
              {formData.categorias.map((categoria, index) => (
                <Row key={index} className="mb-2">
                  <Col md={6}>
                    <Form.Control
                      type="text"
                      placeholder="Nombre de la categoría"
                      value={categoria.nombre}
                      onChange={(e) => updateCategoria(index, 'nombre', e.target.value)}
                      required
                      className="bg-secondary text-white border-0"
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Select
                      value={categoria.tipo_medio}
                      onChange={(e) => updateCategoria(index, 'tipo_medio', e.target.value)}
                      className="bg-secondary text-white border-0"
                    >
                      <option value="fotografia">Fotografía</option>
                      <option value="video">Video</option>
                      <option value="audio">Audio</option>
                      <option value="corto_cine">Corto de Cine</option>
                    </Form.Select>
                  </Col>
                  <Col md={2}>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeCategoria(index)}
                      disabled={formData.categorias.length === 1}
                    >
                      🗑️
                    </Button>
                  </Col>
                </Row>
              ))}
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer className="bg-dark">
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button 
            variant="danger" 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                {editingConcurso ? 'Actualizando...' : 'Creando...'}
              </>
            ) : (
              editingConcurso ? 'Actualizar Concurso' : 'Crear Concurso'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ConcursoManagement;