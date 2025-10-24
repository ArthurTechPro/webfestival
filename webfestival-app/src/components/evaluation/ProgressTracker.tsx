import React from 'react';
import { Row, Col, Card, ProgressBar, Badge } from 'react-bootstrap';
import SimpleChart from '../ui/SimpleChart';
import type { ProgresoEvaluacion, EstadisticasJurado } from '../../types';

interface ProgressTrackerProps {
  progreso: ProgresoEvaluacion[];
  estadisticas: EstadisticasJurado | null;
}

/**
 * Componente para mostrar el progreso de evaluaciones con métricas por tipo de medio
 */
const ProgressTracker: React.FC<ProgressTrackerProps> = ({ progreso, estadisticas }) => {
  const getProgressColor = (porcentaje: number): string => {
    if (porcentaje >= 100) return 'success';
    if (porcentaje >= 75) return 'info';
    if (porcentaje >= 50) return 'warning';
    return 'danger';
  };

  const getTipoMedioIcon = (tipo: string): string => {
    const icons = {
      fotografia: '📸',
      video: '🎬',
      audio: '🎵',
      corto_cine: '🎭'
    };
    return icons[tipo as keyof typeof icons] || '📄';
  };

  const getTipoMedioColor = (tipo: string): string => {
    const colors = {
      fotografia: '#346CB0',
      video: '#2ed573',
      audio: '#ffa502',
      corto_cine: '#3742fa'
    };
    return colors[tipo as keyof typeof colors] || '#6c757d';
  };

  if (!estadisticas) {
    return (
      <div className="text-center py-5">
        <div style={{ fontSize: '3rem' }}>📊</div>
        <p className="text-light mt-2">Cargando estadísticas...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Resumen general */}
      <Row className="mb-4">
        <Col>
          <Card className="bg-dark text-white border-0">
            <Card.Header>
              <h5 className="mb-0">📊 Resumen de Progreso</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3} className="text-center mb-3">
                  <div className="display-6 text-primary mb-2">
                    {estadisticas.total_evaluaciones_completadas}
                  </div>
                  <p className="text-light mb-0">Evaluaciones Completadas</p>
                </Col>
                <Col md={3} className="text-center mb-3">
                  <div className="display-6 text-warning mb-2">
                    {estadisticas.total_evaluaciones_pendientes}
                  </div>
                  <p className="text-light mb-0">Evaluaciones Pendientes</p>
                </Col>
                <Col md={3} className="text-center mb-3">
                  <div className="display-6 text-info mb-2">
                    {estadisticas.total_asignaciones}
                  </div>
                  <p className="text-light mb-0">Categorías Asignadas</p>
                </Col>
                <Col md={3} className="text-center mb-3">
                  <div className="display-6 text-success mb-2">
                    {estadisticas.promedio_calificacion.toFixed(1)}
                  </div>
                  <p className="text-light mb-0">Promedio General</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Progreso por categoría */}
      <Row className="mb-4">
        <Col>
          <Card className="bg-dark text-white border-0">
            <Card.Header>
              <h5 className="mb-0">🎯 Progreso por Categoría</h5>
            </Card.Header>
            <Card.Body>
              {progreso.length === 0 ? (
                <div className="text-center py-4">
                  <div style={{ fontSize: '3rem' }}>📋</div>
                  <p className="text-light mt-2">No tienes categorías asignadas</p>
                </div>
              ) : (
                <div>
                  {progreso.map((item, index) => (
                    <div key={index} className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="d-flex align-items-center">
                          <span className="me-2" style={{ fontSize: '1.5rem' }}>
                            {getTipoMedioIcon(item.tipo_medio)}
                          </span>
                          <div>
                            <h6 className="text-white mb-0">{item.categoria_nombre}</h6>
                            <small className="text-light">
                              {item.medios_evaluados} de {item.total_medios} medios evaluados
                            </small>
                          </div>
                        </div>
                        <div className="text-end">
                          <Badge 
                            bg={getProgressColor(item.porcentaje_completado)}
                            className="fs-6"
                          >
                            {item.porcentaje_completado.toFixed(0)}%
                          </Badge>
                        </div>
                      </div>
                      <ProgressBar 
                        now={item.porcentaje_completado} 
                        variant={getProgressColor(item.porcentaje_completado)}
                        className="mb-2"
                        style={{ height: '8px' }}
                      />
                      {item.tiempo_promedio_evaluacion && (
                        <small className="text-muted">
                          Tiempo promedio por evaluación: {Math.round(item.tiempo_promedio_evaluacion)} minutos
                        </small>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Gráficos de estadísticas */}
      <Row className="mb-4">
        <Col lg={6} className="mb-4">
          <SimpleChart
            title="Evaluaciones por Mes"
            type="bar"
            height={300}
            data={estadisticas.evaluaciones_por_mes.map(item => ({
              label: item.mes,
              value: item.cantidad
            }))}
          />
        </Col>
        <Col lg={6} className="mb-4">
          <SimpleChart
            title="Distribución por Tipo de Medio"
            type="donut"
            height={300}
            data={estadisticas.distribucion_por_tipo.map(item => ({
              label: item.tipo_medio === 'fotografia' ? 'Fotografía' :
                     item.tipo_medio === 'video' ? 'Video' :
                     item.tipo_medio === 'audio' ? 'Audio' :
                     item.tipo_medio === 'corto_cine' ? 'Cine' : item.tipo_medio,
              value: item.cantidad,
              color: getTipoMedioColor(item.tipo_medio)
            }))}
          />
        </Col>
      </Row>

      {/* Especialización del jurado */}
      <Row>
        <Col>
          <Card className="bg-dark text-white border-0">
            <Card.Header>
              <h5 className="mb-0">🥇 Mi Especialización</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex flex-wrap gap-2 mb-3">
                {estadisticas.especializaciones.map(esp => (
                  <Badge 
                    key={esp} 
                    style={{ backgroundColor: getTipoMedioColor(esp) }}
                    className="fs-6 p-2"
                  >
                    {getTipoMedioIcon(esp)} {
                      esp === 'fotografia' ? 'Fotografía' :
                      esp === 'video' ? 'Video' :
                      esp === 'audio' ? 'Audio' :
                      esp === 'corto_cine' ? 'Cine' : esp
                    }
                  </Badge>
                ))}
              </div>
              <p className="text-light mb-0">
                Como jurado especializado, evalúas medios en {estadisticas.especializaciones.length} 
                {estadisticas.especializaciones.length === 1 ? ' disciplina' : ' disciplinas'} diferentes.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProgressTracker;