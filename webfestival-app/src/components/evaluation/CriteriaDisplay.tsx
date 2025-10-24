import React from 'react';
import { Form, Row, Col, OverlayTrigger, Tooltip, ProgressBar } from 'react-bootstrap';
import type { Criterio, FormularioCalificacion } from '../../types';

interface CriteriaDisplayProps {
  criterios: Criterio[];
  calificacion: FormularioCalificacion;
  onCriterioChange: (criterioId: number, puntuacion: number) => void;
  readonly?: boolean;
}

/**
 * Componente para mostrar y gestionar criterios de evaluación dinámicos
 */
const CriteriaDisplay: React.FC<CriteriaDisplayProps> = ({ 
  criterios, 
  calificacion, 
  onCriterioChange, 
  readonly = false 
}) => {
  const getPuntuacionColor = (puntuacion: number): string => {
    if (puntuacion >= 8) return 'success';
    if (puntuacion >= 6) return 'warning';
    if (puntuacion >= 4) return 'info';
    return 'danger';
  };

  const getPuntuacionLabel = (puntuacion: number): string => {
    if (puntuacion >= 9) return 'Excelente';
    if (puntuacion >= 8) return 'Muy Bueno';
    if (puntuacion >= 7) return 'Bueno';
    if (puntuacion >= 6) return 'Satisfactorio';
    if (puntuacion >= 5) return 'Regular';
    if (puntuacion >= 4) return 'Deficiente';
    if (puntuacion >= 3) return 'Malo';
    if (puntuacion >= 2) return 'Muy Malo';
    return 'Pésimo';
  };

  const calcularPromedioTotal = (): number => {
    if (calificacion.criterios.length === 0) return 0;
    
    const totalPonderado = calificacion.criterios.reduce((sum, calif) => {
      const criterio = criterios.find(c => c.id === calif.criterio_id);
      return sum + (calif.puntuacion * (criterio?.peso || 1));
    }, 0);
    
    const pesoTotal = calificacion.criterios.reduce((sum, calif) => {
      const criterio = criterios.find(c => c.id === calif.criterio_id);
      return sum + (criterio?.peso || 1);
    }, 0);
    
    return pesoTotal > 0 ? totalPonderado / pesoTotal : 0;
  };

  const promedioTotal = calcularPromedioTotal();

  if (criterios.length === 0) {
    return (
      <div className="text-center py-4">
        <div style={{ fontSize: '3rem' }}>⚠️</div>
        <p className="text-light mt-2">No hay criterios configurados para este tipo de medio</p>
      </div>
    );
  }

  return (
    <div className="criteria-display">
      {/* Resumen del promedio total */}
      {!readonly && (
        <div className="mb-4 p-3 bg-dark rounded">
          <Row className="align-items-center">
            <Col md={8}>
              <h6 className="text-white mb-1">Calificación Total Ponderada</h6>
              <small className="text-light">
                Promedio calculado considerando el peso de cada criterio
              </small>
            </Col>
            <Col md={4} className="text-end">
              <div className="display-6 text-white mb-1">
                {promedioTotal.toFixed(1)}/10
              </div>
              <div className={`text-${getPuntuacionColor(promedioTotal)}`}>
                {getPuntuacionLabel(promedioTotal)}
              </div>
            </Col>
          </Row>
          <ProgressBar 
            now={promedioTotal * 10} 
            variant={getPuntuacionColor(promedioTotal)}
            className="mt-2"
          />
        </div>
      )}

      {/* Lista de criterios */}
      <div className="criteria-list">
        {criterios
          .sort((a, b) => a.orden - b.orden)
          .map((criterio) => {
            const calificacionCriterio = calificacion.criterios.find(c => c.criterio_id === criterio.id);
            const puntuacion = calificacionCriterio?.puntuacion || 5;

            return (
              <div key={criterio.id} className="mb-4 p-3 bg-dark rounded">
                <Row className="align-items-center">
                  <Col md={6}>
                    <div className="d-flex align-items-center mb-2">
                      <h6 className="text-white mb-0 me-2">{criterio.nombre}</h6>
                      {criterio.peso !== 1 && (
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip>
                              Este criterio tiene un peso de {criterio.peso}x en la calificación final
                            </Tooltip>
                          }
                        >
                          <span className="badge bg-info">
                            Peso: {criterio.peso}x
                          </span>
                        </OverlayTrigger>
                      )}
                    </div>
                    {criterio.descripcion && (
                      <small className="text-light d-block">
                        {criterio.descripcion}
                      </small>
                    )}
                  </Col>
                  <Col md={6}>
                    {readonly ? (
                      <div className="text-end">
                        <div className="display-6 text-white mb-1">
                          {puntuacion}/10
                        </div>
                        <div className={`text-${getPuntuacionColor(puntuacion)}`}>
                          {getPuntuacionLabel(puntuacion)}
                        </div>
                        <ProgressBar 
                          now={puntuacion * 10} 
                          variant={getPuntuacionColor(puntuacion)}
                          className="mt-2"
                        />
                      </div>
                    ) : (
                      <div>
                        <Form.Group>
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <Form.Label className="text-light mb-0">
                              Puntuación: {puntuacion}/10
                            </Form.Label>
                            <span className={`badge bg-${getPuntuacionColor(puntuacion)}`}>
                              {getPuntuacionLabel(puntuacion)}
                            </span>
                          </div>
                          <Form.Range
                            min={1}
                            max={10}
                            step={1}
                            value={puntuacion}
                            onChange={(e) => onCriterioChange(criterio.id, parseInt(e.target.value))}
                            className="custom-range"
                          />
                          <div className="d-flex justify-content-between text-muted small mt-1">
                            <span>1 (Muy deficiente)</span>
                            <span>10 (Excelente)</span>
                          </div>
                        </Form.Group>
                      </div>
                    )}
                  </Col>
                </Row>
              </div>
            );
          })}
      </div>

      {/* Información adicional sobre los criterios */}
      <div className="mt-4 p-3 bg-secondary rounded">
        <h6 className="text-white mb-2">ℹ️ Información sobre los Criterios</h6>
        <small className="text-light">
          <ul className="mb-0">
            <li>Cada criterio se evalúa en una escala del 1 al 10</li>
            <li>Los criterios pueden tener diferentes pesos en la calificación final</li>
            <li>La calificación total es el promedio ponderado de todos los criterios</li>
            <li>Tus evaluaciones ayudan a determinar los ganadores del concurso</li>
          </ul>
        </small>
      </div>


    </div>
  );
};

export default CriteriaDisplay;