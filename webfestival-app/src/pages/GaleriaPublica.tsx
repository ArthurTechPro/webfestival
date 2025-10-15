import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

/**
 * Página de galería pública (temporal)
 */
const GaleriaPublica: React.FC = () => {
  return (
    <Container className="py-5">
      <Row>
        <Col>
          <h1 className="text-center mb-5">Galería Pública</h1>
          
          <Card>
            <Card.Body className="text-center">
              <Card.Title>Galería de Medios Ganadores</Card.Title>
              <Card.Text>
                Aquí se mostrarán los mejores trabajos creativos de todos los concursos finalizados.
                Incluirá fotografías, videos, audios y cortos de cine con reproductores integrados.
              </Card.Text>
              <p className="text-muted">
                <strong>Próximamente:</strong> Filtros por tipo de medio, categoría, concurso y año
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default GaleriaPublica;