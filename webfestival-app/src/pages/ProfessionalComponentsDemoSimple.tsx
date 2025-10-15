import React from 'react';
import { Button, Card, CardHeader, CardTitle, CardBody, ThemeSelector } from '../components/ui';
import { useTheme } from '../hooks/useTheme';

const ProfessionalComponentsDemoSimple: React.FC = () => {
  const { themeName } = useTheme();

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold mb-3">
          Demo Profesional Simplificado
        </h1>
        <p className="lead text-muted mb-4">
          Demostración de componentes profesionales con el nuevo sistema
        </p>
        <ThemeSelector showLabel={true} />
        <div className="mt-3">
          <span className="badge bg-primary">
            Tema Actual: {themeName}
          </span>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-4">
          <Card variant="professional">
            <CardHeader>
              <CardTitle>Tema Professional</CardTitle>
            </CardHeader>
            <CardBody>
              <p>Diseño inspirado en Looper con colores corporativos.</p>
              <Button variant="professional" size="sm">
                Botón Professional
              </Button>
            </CardBody>
          </Card>
        </div>
        
        <div className="col-md-4">
          <Card variant="corporate">
            <CardHeader>
              <CardTitle>Tema Corporate</CardTitle>
            </CardHeader>
            <CardBody>
              <p>Estilo corporativo minimalista y elegante.</p>
              <Button variant="corporate" size="sm">
                Botón Corporate
              </Button>
            </CardBody>
          </Card>
        </div>
        
        <div className="col-md-4">
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Tema Glass</CardTitle>
            </CardHeader>
            <CardBody>
              <p>Efecto glassmorphism para temas cinematográficos.</p>
              <Button variant="glass" size="sm">
                Botón Glass
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>

      <div className="text-center mt-5">
        <Button 
          variant="primary" 
          size="lg"
          onClick={() => window.location.href = '/modern-demo'}
        >
          Ver Demo Completo del Sistema Moderno
        </Button>
      </div>
    </div>
  );
};

export default ProfessionalComponentsDemoSimple;