import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, ProgressBar, Modal, Badge } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useConcursos, type ConcursoConCategorias } from '../../../hooks/useConcursos';
import { useMediaUpload } from '../../../hooks/useMediaUpload';
import CardPremium from '../../ui/CardPremium';
import ButtonCinematic from '../../ui/ButtonCinematic';
import VideoPlayerPremium from '../../multimedia/VideoPlayerPremium';
import AudioPlayerPremium from '../../multimedia/AudioPlayerPremium';

interface FormData {
  titulo: string;
  tipo_medio: 'fotografia' | 'video' | 'audio' | 'corto_cine';
  categoria_id: number;
  archivo: File | null;
}

export const SubirMedio: React.FC = () => {
  const { concursoId } = useParams<{ concursoId: string }>();
  const navigate = useNavigate();
  const { getConcursoById } = useConcursos();
  const { 
    uploadState, 
    validationConfig, 
    loadValidationConfig, 
    validateFile, 
    uploadMedia, 
    resetUploadState,
    getFilePreview,
    getFileInfo
  } = useMediaUpload();

  const [concurso, setConcurso] = useState<ConcursoConCategorias | null>(null);
  const [formData, setFormData] = useState<FormData>({
    titulo: '',
    tipo_medio: 'fotografia',
    categoria_id: 0,
    archivo: null
  });
  const [preview, setPreview] = useState<string>('');
  const [fileInfo, setFileInfo] = useState<any>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (concursoId) {
      loadConcursoData();
      loadValidationConfig();
    }
  }, [concursoId]);

  const loadConcursoData = async () => {
    try {
      setLoading(true);
      const concursoData = await getConcursoById(Number(concursoId));
      if (!concursoData) {
        setError('Concurso no encontrado');
        return;
      }
      if (!concursoData.inscrito) {
        setError('Debes estar inscrito en este concurso para subir medios');
        return;
      }
      setConcurso(concursoData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar concurso');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset categoria_id when tipo_medio changes
      ...(name === 'tipo_medio' ? { categoria_id: 0 } : {})
    }));
  };

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setFormData(prev => ({ ...prev, archivo: null }));
      setPreview('');
      setFileInfo(null);
      return;
    }

    // Validar archivo si tenemos configuración
    if (validationConfig) {
      const validation = validateFile(file, formData.tipo_medio);
      if (!validation.valid) {
        setError(validation.error || 'Archivo no válido');
        e.target.value = '';
        return;
      }
    }

    setFormData(prev => ({ ...prev, archivo: file }));
    setError(null);

    // Obtener información del archivo
    const info = getFileInfo(file);
    setFileInfo(info);

    // Generar preview
    try {
      const previewUrl = await getFilePreview(file);
      setPreview(previewUrl);
    } catch (err) {
      console.error('Error al generar preview:', err);
    }
  }, [formData.tipo_medio, validationConfig, validateFile, getFileInfo, getFilePreview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.archivo || !concurso) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (formData.categoria_id === 0) {
      setError('Por favor selecciona una categoría');
      return;
    }

    try {
      const uploadRequest = {
        titulo: formData.titulo,
        tipo_medio: formData.tipo_medio,
        categoria_id: formData.categoria_id,
        formato: formData.archivo.type,
        tamaño_archivo: formData.archivo.size
      };

      const result = await uploadMedia(formData.archivo, concurso.id, uploadRequest);
      
      if (result) {
        // Redirigir a mis envíos con mensaje de éxito
        navigate('/participante/mis-envios', { 
          state: { message: 'Medio subido exitosamente' }
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir archivo');
    }
  };

  const getCategoriasPorTipo = () => {
    if (!concurso?.categorias) return [];
    
    // En una implementación real, las categorías estarían filtradas por tipo de medio
    // Por ahora mostramos todas las categorías
    return concurso.categorias;
  };

  const getAcceptedFormats = (tipo: string): string => {
    if (!validationConfig) return '*';
    
    const formats = validationConfig.allowedFormats[tipo as keyof typeof validationConfig.allowedFormats];
    return formats?.join(',') || '*';
  };

  const renderPreview = () => {
    if (!formData.archivo || !preview) return null;

    switch (formData.tipo_medio) {
      case 'fotografia':
        return (
          <img 
            src={preview} 
            alt="Preview"
            className="img-fluid rounded cursor-pointer"
            style={{ maxHeight: '300px', objectFit: 'contain' }}
            onClick={() => setShowPreviewModal(true)}
          />
        );
      case 'video':
      case 'corto_cine':
        return (
          <div className="position-relative">
            <video 
              src={preview}
              className="img-fluid rounded"
              style={{ maxHeight: '300px', width: '100%' }}
              controls
              preload="metadata"
            />
            <Button
              variant="outline-light"
              size="sm"
              className="position-absolute top-0 end-0 m-2"
              onClick={() => setShowPreviewModal(true)}
            >
              🔍 Pantalla Completa
            </Button>
          </div>
        );
      case 'audio':
        return (
          <div className="text-center p-4 bg-light rounded">
            <div className="display-1 mb-3">🎵</div>
            <audio 
              src={preview}
              controls
              className="w-100"
              style={{ maxWidth: '400px' }}
            />
            <ButtonCinematic
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => setShowPreviewModal(true)}
            >
              🔍 Reproductor Avanzado
            </ButtonCinematic>
          </div>
        );
      default:
        return null;
    }
  };

  const renderFullPreview = () => {
    if (!formData.archivo || !preview) return null;

    switch (formData.tipo_medio) {
      case 'fotografia':
        return (
          <img 
            src={preview} 
            alt={formData.titulo || 'Preview'}
            className="img-fluid rounded"
            style={{ maxHeight: '80vh', objectFit: 'contain' }}
          />
        );
      case 'video':
      case 'corto_cine':
        return (
          <VideoPlayerPremium
            src={preview}
            title={formData.titulo || 'Preview'}
          />
        );
      case 'audio':
        return (
          <AudioPlayerPremium
            src={preview}
            title={formData.titulo || 'Preview'}
            artist="Preview"
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </Container>
    );
  }

  if (error && !concurso) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          {error}
          <hr />
          <div className="d-flex justify-content-end">
            <Link to="/participante/dashboard">
              <ButtonCinematic variant="secondary">
                Volver al Dashboard
              </ButtonCinematic>
            </Link>
          </div>
        </Alert>
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
              <h1 className="h2 mb-1">Subir Medio</h1>
              <p className="text-muted mb-0">
                {concurso?.titulo} - Sube tu trabajo creativo
              </p>
            </div>
            <Link to={`/participante/concurso/${concursoId}`}>
              <ButtonCinematic variant="outline" size="sm">
                Volver al Concurso
              </ButtonCinematic>
            </Link>
          </div>
        </Col>
      </Row>

      {/* Información del Concurso */}
      {concurso && (
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-1">{concurso.titulo}</h5>
                    <p className="text-muted mb-0">
                      Máximo {concurso.max_envios} envíos • 
                      Tamaño máximo: {concurso.tamaño_max_mb}MB •
                      Finaliza: {new Date(concurso.fecha_final).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge bg="success">Inscrito</Badge>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Row>
        {/* Formulario */}
        <Col lg={6}>
          <CardPremium>
            <Card.Header>
              <h5 className="mb-0">Información del Medio</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                {/* Título */}
                <Form.Group className="mb-3">
                  <Form.Label>Título *</Form.Label>
                  <Form.Control
                    type="text"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleInputChange}
                    placeholder="Ingresa un título descriptivo"
                    required
                  />
                </Form.Group>

                {/* Tipo de Medio */}
                <Form.Group className="mb-3">
                  <Form.Label>Tipo de Medio *</Form.Label>
                  <Form.Select
                    name="tipo_medio"
                    value={formData.tipo_medio}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="fotografia">📸 Fotografía</option>
                    <option value="video">🎬 Video</option>
                    <option value="audio">🎵 Audio</option>
                    <option value="corto_cine">🎭 Corto de Cine</option>
                  </Form.Select>
                </Form.Group>

                {/* Categoría */}
                <Form.Group className="mb-3">
                  <Form.Label>Categoría *</Form.Label>
                  <Form.Select
                    name="categoria_id"
                    value={formData.categoria_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value={0}>Selecciona una categoría</option>
                    {getCategoriasPorTipo().map((categoria) => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.nombre}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {/* Archivo */}
                <Form.Group className="mb-4">
                  <Form.Label>Archivo *</Form.Label>
                  <Form.Control
                    type="file"
                    onChange={handleFileChange}
                    accept={getAcceptedFormats(formData.tipo_medio)}
                    required
                  />
                  {validationConfig && (
                    <Form.Text className="text-muted">
                      Formatos permitidos: {validationConfig.allowedFormats[formData.tipo_medio]?.join(', ')} • 
                      Tamaño máximo: {(validationConfig.maxFileSize / 1024 / 1024).toFixed(1)}MB
                    </Form.Text>
                  )}
                </Form.Group>

                {/* Información del archivo seleccionado */}
                {fileInfo && (
                  <Card className="mb-4 bg-light">
                    <Card.Body className="py-2">
                      <h6 className="mb-2">Información del Archivo</h6>
                      <Row>
                        <Col sm={6}>
                          <small className="text-muted d-block">
                            <strong>Nombre:</strong> {fileInfo.name}
                          </small>
                          <small className="text-muted d-block">
                            <strong>Tamaño:</strong> {fileInfo.formattedSize}
                          </small>
                        </Col>
                        <Col sm={6}>
                          <small className="text-muted d-block">
                            <strong>Tipo:</strong> {fileInfo.type}
                          </small>
                          <small className="text-muted d-block">
                            <strong>Modificado:</strong> {fileInfo.lastModified.toLocaleDateString()}
                          </small>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                )}

                {/* Mensajes de Error */}
                {error && (
                  <Alert variant="danger" className="mb-4">
                    {error}
                  </Alert>
                )}

                {/* Progress Bar durante subida */}
                {uploadState.isUploading && (
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span>Subiendo archivo...</span>
                      <span>{uploadState.progress.percentage}%</span>
                    </div>
                    <ProgressBar 
                      now={uploadState.progress.percentage} 
                      animated 
                      striped 
                    />
                  </div>
                )}

                {/* Botones */}
                <div className="d-flex gap-2">
                  <ButtonCinematic
                    type="submit"
                    variant="primary"
                    disabled={uploadState.isUploading || !formData.archivo}
                    className="flex-grow-1"
                  >
                    {uploadState.isUploading ? 'Subiendo...' : 'Subir Medio'}
                  </ButtonCinematic>
                  <ButtonCinematic
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      resetUploadState();
                      setFormData({
                        titulo: '',
                        tipo_medio: 'fotografia',
                        categoria_id: 0,
                        archivo: null
                      });
                      setPreview('');
                      setFileInfo(null);
                      setError(null);
                    }}
                    disabled={uploadState.isUploading}
                  >
                    Limpiar
                  </ButtonCinematic>
                </div>
              </Form>
            </Card.Body>
          </CardPremium>
        </Col>

        {/* Preview */}
        <Col lg={6}>
          <CardPremium>
            <Card.Header>
              <h5 className="mb-0">Vista Previa</h5>
            </Card.Header>
            <Card.Body>
              {formData.archivo && preview ? (
                <div className="text-center">
                  {renderPreview()}
                  <div className="mt-3">
                    <small className="text-muted">
                      Click en la imagen o usa el botón para ver en pantalla completa
                    </small>
                  </div>
                </div>
              ) : (
                <div className="text-center py-5">
                  <div className="display-1 mb-3 text-muted">📁</div>
                  <h6 className="text-muted">Selecciona un archivo para ver la vista previa</h6>
                </div>
              )}
            </Card.Body>
          </CardPremium>
        </Col>
      </Row>

      {/* Modal de Preview en Pantalla Completa */}
      <Modal 
        show={showPreviewModal} 
        onHide={() => setShowPreviewModal(false)} 
        size="xl" 
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {formData.titulo || 'Vista Previa'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {renderFullPreview()}
        </Modal.Body>
        <Modal.Footer>
          <ButtonCinematic 
            variant="secondary" 
            onClick={() => setShowPreviewModal(false)}
          >
            Cerrar
          </ButtonCinematic>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SubirMedio;