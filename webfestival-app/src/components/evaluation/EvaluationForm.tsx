import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Button, Alert, Spinner, Card } from 'react-bootstrap';
import { useEvaluation } from '../../hooks/useEvaluation';
import MediaPlayer from './MediaPlayer';
import CriteriaDisplay from './CriteriaDisplay';
import type { MedioParaEvaluacion, Criterio, FormularioCalificacion } from '../../types';

interface EvaluationFormProps {
  medio: MedioParaEvaluacion;
  onComplete: () => void;
  onCancel: () => void;
}

/**
 * Formulario para evaluar un medio multimedia con criterios dinámicos
 */
const EvaluationForm: React.FC<EvaluationFormProps> = ({ medio, onComplete, onCancel }) => {
  const { 
    enviarCalificacion, 
    actualizarCalificacion, 
    getCriteriosPorTipoMedio,
    getMetadatosRelevantes,
    validateCalificacion,
    loading 
  } = useEvaluation();

  const [criterios, setCriterios] = useState<Criterio[]>([]);
  const [calificacion, setCalificacion] = useState<FormularioCalificacion>({
    medio_id: medio.id,
    comentarios: '',
    criterios: []
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingCriterios, setLoadingCriterios] = useState(true);

  const metadatos = getMetadatosRelevantes(medio);
  const isEditing = medio.evaluado && medio.calificacion_existente;

  // Cargar criterios para el tipo de medio
  useEffect(() => {
    const loadCriterios = async () => {
      try {
        setLoadingCriterios(true);
        const criteriosData = await getCriteriosPorTipoMedio(medio.tipo_medio);
        setCriterios(criteriosData);

        // Si estamos editando, cargar los valores existentes
        if (isEditing && medio.calificacion_existente) {
          setCalificacion({
            medio_id: medio.id,
            comentarios: medio.calificacion_existente.comentarios || '',
            criterios: medio.calificacion_existente.detalles?.map(detalle => ({
              criterio_id: detalle.criterio_id,
              puntuacion: detalle.puntuacion
            })) || []
          });
        } else {
          // Inicializar con valores por defecto
          setCalificacion(prev => ({
            ...prev,
            criterios: criteriosData.map(criterio => ({
              criterio_id: criterio.id,
              puntuacion: 5 // Valor por defecto
            }))
          }));
        }
      } catch (error) {
        console.error('Error al cargar criterios:', error);
        setErrors(['Error al cargar los criterios de evaluación']);
      } finally {
        setLoadingCriterios(false);
      }
    };

    loadCriterios();
  }, [medio.tipo_medio, medio.id, isEditing, medio.calificacion_existente, getCriteriosPorTipoMedio]);

  const handleCriterioChange = (criterioId: number, puntuacion: number) => {
    setCalificacion(prev => ({
      ...prev,
      criterios: prev.criterios.map(c => 
        c.criterio_id === criterioId 
          ? { ...c, puntuacion }
          : c
      )
    }));
    setErrors([]); // Limpiar errores al cambiar valores
  };

  const handleComentariosChange = (comentarios: string) => {
    setCalificacion(prev => ({ ...prev, comentarios }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar calificación
    const validation = validateCalificacion(calificacion, criterios);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    try {
      setSubmitting(true);
      setErrors([]);

      if (isEditing && medio.calificacion_existente) {
        await actualizarCalificacion(medio.calificacion_existente.id, calificacion);
      } else {
        await enviarCalificacion(calificacion);
      }

      onComplete();
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Error al enviar la calificación']);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingCriterios) {
    return (
      <div className="p-4 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-light">Cargando criterios de evaluación...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Row>
        {/* Columna izquierda: Reproductor y metadatos */}
        <Col lg={6}>
          <Card className="bg-secondary text-white border-0 mb-4">
            <Card.Header>
              <h5 className="mb-0">📱 Vista Previa del Medio</h5>
            </Card.Header>
            <Card.Body>
              <MediaPlayer medio={medio} />
            </Card.Body>
          </Card>

          <Card className="bg-secondary text-white border-0">
            <Card.Header>
              <h5 className="mb-0">📊 Metadatos Técnicos</h5>
            </Card.Header>
            <Card.Body>
              <div className="row">
                {metadatos.map((meta, index) => (
                  <div key={index} className="col-md-6 mb-2">
                    <small className="text-light">
                      <strong>{meta.label}:</strong> {meta.value}
                    </small>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Columna derecha: Formulario de evaluación */}
        <Col lg={6}>
          <Form onSubmit={handleSubmit}>
            {/* Información del medio */}
            <Card className="bg-secondary text-white border-0 mb-4">
              <Card.Header>
                <h5 className="mb-0">📋 Información del Medio</h5>
              </Card.Header>
              <Card.Body>
                <div className="mb-2"><strong>Título:</strong> {medio.titulo}</div>
                <div className="mb-2"><strong>Autor:</strong> {medio.usuario.nombre}</div>
                <div className="mb-2"><strong>Categoría:</strong> {medio.categoria.nombre}</div>
                <div className="mb-2"><strong>Concurso:</strong> {medio.concurso.titulo}</div>
              </Card.Body>
            </Card>

            {/* Criterios de evaluación */}
            <Card className="bg-secondary text-white border-0 mb-4">
              <Card.Header>
                <h5 className="mb-0">⭐ Criterios de Evaluación</h5>
                <small className="text-light">
                  Califica cada criterio del 1 al 10 (1 = Muy deficiente, 10 = Excelente)
                </small>
              </Card.Header>
              <Card.Body>
                <CriteriaDisplay 
                  criterios={criterios}
                  calificacion={calificacion}
                  onCriterioChange={handleCriterioChange}
                />
              </Card.Body>
            </Card>

            {/* Comentarios */}
            <Card className="bg-secondary text-white border-0 mb-4">
              <Card.Header>
                <h5 className="mb-0">💬 Comentarios Especializados</h5>
              </Card.Header>
              <Card.Body>
                <Form.Group>
                  <Form.Label className="text-light">
                    Feedback constructivo para el participante (opcional)
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={calificacion.comentarios}
                    onChange={(e) => handleComentariosChange(e.target.value)}
                    placeholder="Proporciona feedback constructivo sobre las fortalezas y áreas de mejora del trabajo..."
                    className="bg-dark text-white border-secondary"
                  />
                  <Form.Text className="text-light">
                    Tus comentarios ayudarán al participante a mejorar en futuras participaciones.
                  </Form.Text>
                </Form.Group>
              </Card.Body>
            </Card>

            {/* Errores */}
            {errors.length > 0 && (
              <Alert variant="danger" className="mb-4">
                <ul className="mb-0">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </Alert>
            )}

            {/* Botones de acción */}
            <div className="d-flex gap-2">
              <Button 
                variant="secondary" 
                onClick={onCancel}
                disabled={submitting}
                className="flex-fill"
              >
                Cancelar
              </Button>
              <Button 
                variant={isEditing ? "warning" : "success"}
                type="submit"
                disabled={submitting || loading}
                className="flex-fill"
              >
                {submitting ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    {isEditing ? 'Actualizando...' : 'Enviando...'}
                  </>
                ) : (
                  <>
                    {isEditing ? '✏️ Actualizar Evaluación' : '✅ Enviar Evaluación'}
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
    </div>
  );
};

export default EvaluationForm;