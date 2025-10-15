import React from 'react';
import { Button, Card, CardHeader, CardTitle, CardBody, ThemeSelector } from '../components/ui';

const StyleShowcaseSimple: React.FC = () => {
  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold mb-3">
          Demo de Componentes Legacy
        </h1>
        <p className="lead text-muted mb-4">
          Esta página muestra los componentes anteriores (temporalmente deshabilitados)
        </p>
        <ThemeSelector showLabel={true} />
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <Card variant="professional">
            <CardHeader>
              <CardTitle>Componentes Migrados</CardTitle>
            </CardHeader>
            <CardBody>
              <p>Los componentes han sido migrados al nuevo sistema CSS Modules + SCSS.</p>
              <div className="d-flex gap-2 flex-wrap">
                <Button variant="primary" size="sm">Nuevo Button</Button>
                <Button variant="professional" size="sm">Professional</Button>
                <Button variant="glass" size="sm">Glass</Button>
              </div>
            </CardBody>
          </Card>
        </div>
        
        <div className="col-md-6">
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Nueva Demostración</CardTitle>
            </CardHeader>
            <CardBody>
              <p>Visita la nueva demostración del sistema modular:</p>
              <Button 
                variant="primary" 
                onClick={() => window.location.href = '/modern-demo'}
              >
                Ver Demo Moderno
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>

      <div className="text-center mt-5">
        <div className="alert alert-info">
          <strong>Nota:</strong> Los componentes cinematográficos anteriores están siendo migrados 
          al nuevo sistema CSS Modules + SCSS. Mientras tanto, puedes ver la nueva implementación 
          en <a href="/modern-demo">Demo Moderno</a>.
        </div>
      </div>
    </div>
  );
};

export default StyleShowcaseSimple;