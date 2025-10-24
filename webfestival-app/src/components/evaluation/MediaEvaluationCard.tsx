import React, { useState } from 'react';
import { Card, Button, Badge, Modal } from 'react-bootstrap';
import { useEvaluation } from '../../hooks/useEvaluation';
import EvaluationForm from './EvaluationForm';
import MediaPlayer from './MediaPlayer';
import type { MedioParaEvaluacion } from '../../types';

interface MediaEvaluationCardProps {
  medio: MedioParaEvaluacion;
}

/**
 * Tarjeta para mostrar un medio multimedia listo para evaluación
 */
const MediaEvaluationCard: React.FC<MediaEvaluationCardProps> = ({ medio }) => {
  const { getMediaTypeIcon, getMediaTypeColor, getMetadatosRelevantes } = useEvaluation();
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const metadatos = getMetadatosRelevantes(medio);
  const typeIcon = getMediaTypeIcon(medio.tipo_medio);
  const typeColor = getMediaTypeColor(medio.tipo_medio);

  const handleEvaluationComplete = () => {
    setShowEvaluationModal(false);
    // El hook se encargará de recargar los datos automáticamente
  };

  return (
    <>
      <Card className="bg-dark text-white border-0 h-100 shadow-sm">
        {/* Imagen/Preview */}
        <div className="position-relative">
          {medio.thumbnail_url ? (
            <Card.Img 
              variant="top" 
              src={medio.thumbnail_url} 
              style={{ height: '200px', objectFit: 'cover' }}
              alt={medio.titulo}
            />
          ) : (
            <div 
              className="d-flex align-items-center justify-content-center"
              style={{ 
                height: '200px', 
                backgroundColor: typeColor + '20',
                border: `2px dashed ${typeColor}`
              }}
            >
              <div className="text-center">
                <div style={{ fontSize: '3rem' }}>{typeIcon}</div>
                <p className="text-light mt-2 mb-0">{medio.tipo_medio.toUpperCase()}</p>
              </div>
            </div>
          )}
          
          {/* Badge de estado */}
          <div className="position-absolute top-0 end-0 m-2">
            {medio.evaluado ? (
              <Badge bg="success">✅ Evaluado</Badge>
            ) : (
              <Badge bg="warning">📋 Pendiente</Badge>
            )}
          </div>

          {/* Badge de tipo de medio */}
          <div className="position-absolute top-0 start-0 m-2">
            <Badge style={{ backgroundColor: typeColor }}>
              {typeIcon} {medio.tipo_medio}
            </Badge>
          </div>
        </div>

        <Card.Body className="d-flex flex-column">
          {/* Título y autor */}
          <Card.Title className="text-white mb-2" title={medio.titulo}>
            {medio.titulo.length > 50 ? `${medio.titulo.substring(0, 50)}...` : medio.titulo}
          </Card.Title>
          
          <div className="text-light small mb-2">
            <div><strong>Autor:</strong> {medio.usuario.nombre}</div>
            <div><strong>Categoría:</strong> {medio.categoria.nombre}</div>
            <div><strong>Concurso:</strong> {medio.concurso.titulo}</div>
          </div>

          {/* Metadatos básicos */}
          <div className="text-light small mb-3">
            <div><strong>Formato:</strong> {medio.formato}</div>
            {medio.duracion && (
              <div><strong>Duración:</strong> {Math.floor(medio.duracion / 60)}:{(medio.duracion % 60).toString().padStart(2, '0')}</div>
            )}
            <div><strong>Subido:</strong> {new Date(medio.fecha_subida).toLocaleDateString()}</div>
          </div>

          {/* Botones de acción */}
          <div className="mt-auto">
            <div className="d-flex gap-2 mb-2">
              <Button 
                variant="outline-info" 
                size="sm" 
                onClick={() => setShowDetailsModal(true)}
                className="flex-fill"
              >
                👁️ Ver Detalles
              </Button>
              <Button 
                variant={medio.evaluado ? "outline-warning" : "warning"}
                size="sm" 
                onClick={() => setShowEvaluationModal(true)}
                className="flex-fill"
              >
                {medio.evaluado ? '✏️ Editar' : '📋 Evaluar'}
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Modal de Detalles */}
      <Modal 
        show={showDetailsModal} 
        onHide={() => setShowDetailsModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="bg-dark text-white border-secondary">
          <Modal.Title>
            {typeIcon} Detalles del Medio
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-white">
          <div className="row">
            <div className="col-md-6">
              <h5 className="text-primary mb-3">Información General</h5>
              <div className="mb-2"><strong>Título:</strong> {medio.titulo}</div>
              <div className="mb-2"><strong>Autor:</strong> {medio.usuario.nombre}</div>
              <div className="mb-2"><strong>Tipo:</strong> {medio.tipo_medio}</div>
              <div className="mb-2"><strong>Categoría:</strong> {medio.categoria.nombre}</div>
              <div className="mb-2"><strong>Concurso:</strong> {medio.concurso.titulo}</div>
              <div className="mb-2"><strong>Fecha de subida:</strong> {new Date(medio.fecha_subida).toLocaleString()}</div>
            </div>
            <div className="col-md-6">
              <h5 className="text-primary mb-3">Metadatos Técnicos</h5>
              {metadatos.map((meta, index) => (
                <div key={index} className="mb-2">
                  <strong>{meta.label}:</strong> {meta.value}
                </div>
              ))}
            </div>
          </div>

          {/* Reproductor de medios */}
          <div className="mt-4">
            <h5 className="text-primary mb-3">Vista Previa</h5>
            <MediaPlayer medio={medio} />
          </div>
        </Modal.Body>
        <Modal.Footer className="bg-dark border-secondary">
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Cerrar
          </Button>
          <Button 
            variant={medio.evaluado ? "warning" : "primary"}
            onClick={() => {
              setShowDetailsModal(false);
              setShowEvaluationModal(true);
            }}
          >
            {medio.evaluado ? 'Editar Evaluación' : 'Evaluar Ahora'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Evaluación */}
      <Modal 
        show={showEvaluationModal} 
        onHide={() => setShowEvaluationModal(false)}
        size="xl"
        centered
      >
        <Modal.Header closeButton className="bg-dark text-white border-secondary">
          <Modal.Title>
            {typeIcon} Evaluación: {medio.titulo}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-white p-0">
          <EvaluationForm 
            medio={medio} 
            onComplete={handleEvaluationComplete}
            onCancel={() => setShowEvaluationModal(false)}
          />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default MediaEvaluationCard;