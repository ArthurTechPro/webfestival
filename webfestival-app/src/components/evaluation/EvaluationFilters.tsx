import React from 'react';
import { Card, Form, Button, Badge } from 'react-bootstrap';
import type { AsignacionJurado, FiltrosEvaluacion } from '../../types';

interface EvaluationFiltersProps {
  asignaciones: AsignacionJurado[];
  filtros: FiltrosEvaluacion;
  onFiltrosChange: (filtros: FiltrosEvaluacion) => void;
}

/**
 * Componente para filtrar medios en el panel de evaluación
 */
const EvaluationFilters: React.FC<EvaluationFiltersProps> = ({ 
  asignaciones, 
  filtros, 
  onFiltrosChange 
}) => {
  const handleFilterChange = (key: keyof FiltrosEvaluacion, value: any) => {
    onFiltrosChange({
      ...filtros,
      [key]: value === '' ? undefined : value
    });
  };

  const clearFilters = () => {
    onFiltrosChange({
      page: 1,
      limit: 12
    });
  };

  const getActiveFiltersCount = (): number => {
    let count = 0;
    if (filtros.categoria_id) count++;
    if (filtros.tipo_medio) count++;
    if (filtros.evaluado !== undefined) count++;
    if (filtros.concurso_id) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  // Obtener tipos de medio únicos de las asignaciones
  // const tiposMedio = Array.from(new Set(
  //   asignaciones.map(a => a.categoria.concurso.titulo) // Esto debería ser el tipo de medio, ajustar según la estructura real
  // ));

  // Obtener concursos únicos de las asignaciones
  const concursos = Array.from(new Set(
    asignaciones.map(a => ({
      id: a.categoria.concurso_id,
      titulo: a.categoria.concurso.titulo
    }))
  )).reduce((unique, item) => {
    return unique.find(u => u.id === item.id) ? unique : [...unique, item];
  }, [] as Array<{ id: number; titulo: string }>);

  return (
    <Card className="bg-dark text-white border-0 sticky-top" style={{ top: '20px' }}>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">🔍 Filtros</h5>
        {activeFiltersCount > 0 && (
          <Badge bg="primary">{activeFiltersCount}</Badge>
        )}
      </Card.Header>
      <Card.Body>
        {/* Filtro por estado de evaluación */}
        <Form.Group className="mb-3">
          <Form.Label className="text-light">Estado de Evaluación</Form.Label>
          <Form.Select
            value={filtros.evaluado === undefined ? '' : filtros.evaluado.toString()}
            onChange={(e) => handleFilterChange('evaluado', e.target.value === '' ? undefined : e.target.value === 'true')}
            className="bg-secondary text-white border-secondary"
          >
            <option value="">Todos los medios</option>
            <option value="false">📋 Pendientes de evaluar</option>
            <option value="true">✅ Ya evaluados</option>
          </Form.Select>
        </Form.Group>

        {/* Filtro por categoría */}
        <Form.Group className="mb-3">
          <Form.Label className="text-light">Categoría Asignada</Form.Label>
          <Form.Select
            value={filtros.categoria_id || ''}
            onChange={(e) => handleFilterChange('categoria_id', e.target.value ? parseInt(e.target.value) : undefined)}
            className="bg-secondary text-white border-secondary"
          >
            <option value="">Todas las categorías</option>
            {asignaciones.map(asignacion => (
              <option key={asignacion.categoria_id} value={asignacion.categoria_id}>
                {asignacion.categoria.nombre}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        {/* Filtro por tipo de medio */}
        <Form.Group className="mb-3">
          <Form.Label className="text-light">Tipo de Medio</Form.Label>
          <Form.Select
            value={filtros.tipo_medio || ''}
            onChange={(e) => handleFilterChange('tipo_medio', e.target.value || undefined)}
            className="bg-secondary text-white border-secondary"
          >
            <option value="">Todos los tipos</option>
            <option value="fotografia">📸 Fotografía</option>
            <option value="video">🎬 Video</option>
            <option value="audio">🎵 Audio</option>
            <option value="corto_cine">🎭 Corto de Cine</option>
          </Form.Select>
        </Form.Group>

        {/* Filtro por concurso */}
        {concursos.length > 1 && (
          <Form.Group className="mb-3">
            <Form.Label className="text-light">Concurso</Form.Label>
            <Form.Select
              value={filtros.concurso_id || ''}
              onChange={(e) => handleFilterChange('concurso_id', e.target.value ? parseInt(e.target.value) : undefined)}
              className="bg-secondary text-white border-secondary"
            >
              <option value="">Todos los concursos</option>
              {concursos.map(concurso => (
                <option key={concurso.id} value={concurso.id}>
                  {concurso.titulo}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        )}

        {/* Botón para limpiar filtros */}
        {activeFiltersCount > 0 && (
          <div className="d-grid">
            <Button 
              variant="outline-secondary" 
              onClick={clearFilters}
              size="sm"
            >
              🗑️ Limpiar Filtros
            </Button>
          </div>
        )}

        {/* Información de asignaciones */}
        <div className="mt-4 pt-3 border-top border-secondary">
          <h6 className="text-light mb-2">📋 Mis Asignaciones</h6>
          {asignaciones.length === 0 ? (
            <small className="text-muted">
              No tienes categorías asignadas actualmente.
            </small>
          ) : (
            <div>
              {asignaciones.map(asignacion => (
                <div key={asignacion.id} className="mb-2">
                  <Badge 
                    bg="outline-info" 
                    className="text-info border-info d-block text-start p-2"
                    style={{ fontSize: '0.75rem' }}
                  >
                    <div><strong>{asignacion.categoria.nombre}</strong></div>
                    <div className="text-muted small">
                      {asignacion.categoria.concurso.titulo}
                    </div>
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Leyenda de iconos */}
        <div className="mt-4 pt-3 border-top border-secondary">
          <h6 className="text-light mb-2">🏷️ Leyenda</h6>
          <div className="small text-light">
            <div className="mb-1">📸 Fotografía</div>
            <div className="mb-1">🎬 Video</div>
            <div className="mb-1">🎵 Audio</div>
            <div className="mb-1">🎭 Corto de Cine</div>
            <div className="mb-1">📋 Pendiente</div>
            <div className="mb-1">✅ Evaluado</div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default EvaluationFilters;