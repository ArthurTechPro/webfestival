import React from 'react';
import { Button, ButtonGroup } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardSubtitle, CardBody, CardFooter, CardActions, MediaCard, CardGrid } from '../components/ui/Card';
import { ThemeSelector } from '../components/ui';
import { useTheme } from '../hooks/useTheme';

const ModernComponentsDemo: React.FC = () => {
  const { currentThemeConfig, themeName } = useTheme();

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold mb-3">
          Sistema CSS Modules + SCSS
        </h1>
        <p className="lead text-muted mb-4">
          Nueva arquitectura modular con {Object.keys(require('../hooks/useTheme').THEMES).length} temas adaptativos
        </p>
        <div className="d-flex justify-content-center mb-4">
          <ThemeSelector showLabel={true} />
        </div>
        <div className="alert alert-info">
          <strong>Tema Actual:</strong> {themeName} 
          <span className="ms-2 badge" style={{ backgroundColor: currentThemeConfig.primaryColor }}>
            {currentThemeConfig.category}
          </span>
        </div>
      </div>

      {/* Buttons Section */}
      <section className="mb-5">
        <h2 className="h3 mb-4">Componente Button</h2>
        <div className="row g-4">
          <div className="col-md-6">
            <Card>
              <CardHeader>
                <CardTitle>Variantes de Botón</CardTitle>
                <CardSubtitle>Adaptación automática según tema</CardSubtitle>
              </CardHeader>
              <CardBody>
                <div className="d-flex flex-wrap gap-2 mb-3">
                  <Button variant="primary">Primary</Button>
                  <Button variant="professional">Professional</Button>
                  <Button variant="corporate">Corporate</Button>
                  <Button variant="glass">Glass</Button>
                  <Button variant="minimal">Minimal</Button>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="danger">Danger</Button>
                </div>
              </CardBody>
            </Card>
          </div>
          
          <div className="col-md-6">
            <Card>
              <CardHeader>
                <CardTitle>Tamaños y Estados</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                  <Button size="xl">Extra Large</Button>
                </div>
                <div className="d-flex flex-wrap gap-2 mb-3">
                  <Button loading>Loading</Button>
                  <Button disabled>Disabled</Button>
                  <Button icon="🚀">With Icon</Button>
                </div>
                <ButtonGroup>
                  <Button variant="outline">Grupo</Button>
                  <Button variant="outline">De</Button>
                  <Button variant="outline">Botones</Button>
                </ButtonGroup>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* Cards Section */}
      <section className="mb-5">
        <h2 className="h3 mb-4">Componente Card</h2>
        <CardGrid>
          <Card variant="default">
            <CardHeader>
              <CardTitle>Card Default</CardTitle>
              <CardSubtitle>Adaptación automática</CardSubtitle>
            </CardHeader>
            <CardBody>
              <p>Esta card se adapta automáticamente al tema seleccionado.</p>
            </CardBody>
            <CardFooter>
              <CardActions>
                <Button size="sm">Acción</Button>
              </CardActions>
            </CardFooter>
          </Card>

          <Card variant="clean">
            <CardHeader>
              <CardTitle>Card Clean</CardTitle>
            </CardHeader>
            <CardBody>
              <p>Diseño limpio y profesional para interfaces corporativas.</p>
            </CardBody>
          </Card>

          <Card variant="professional">
            <CardHeader>
              <CardTitle>Card Professional</CardTitle>
            </CardHeader>
            <CardBody>
              <p>Estilo Looper professional con sombras sutiles.</p>
            </CardBody>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle>Card Glass</CardTitle>
            </CardHeader>
            <CardBody>
              <p>Efecto glassmorphism para temas cinematográficos.</p>
            </CardBody>
          </Card>

          <Card variant="elevated" interactive>
            <CardHeader>
              <CardTitle>Card Interactiva</CardTitle>
            </CardHeader>
            <CardBody>
              <p>Haz clic para ver el efecto de interacción.</p>
            </CardBody>
          </Card>

          <MediaCard
            src="https://picsum.photos/400/200?random=1"
            alt="Demo image"
            variant="outlined"
          >
            <CardTitle>Media Card</CardTitle>
            <CardBody>
              <p>Card con imagen integrada y diseño responsive.</p>
            </CardBody>
            <CardActions align="between">
              <Button size="sm" variant="ghost">Ver más</Button>
              <Button size="sm">Acción</Button>
            </CardActions>
          </MediaCard>
        </CardGrid>
      </section>

      {/* Features Section */}
      <section className="mb-5">
        <h2 className="h3 mb-4">Características del Sistema</h2>
        <div className="row g-4">
          <div className="col-md-4">
            <Card variant="clean" className="h-100">
              <CardBody className="text-center">
                <div className="display-6 mb-3">🎨</div>
                <CardTitle>CSS Modules</CardTitle>
                <p>Encapsulación automática de estilos sin conflictos de clases.</p>
              </CardBody>
            </Card>
          </div>
          
          <div className="col-md-4">
            <Card variant="clean" className="h-100">
              <CardBody className="text-center">
                <div className="display-6 mb-3">⚡</div>
                <CardTitle>SCSS Avanzado</CardTitle>
                <p>Variables, mixins y funciones para desarrollo eficiente.</p>
              </CardBody>
            </Card>
          </div>
          
          <div className="col-md-4">
            <Card variant="clean" className="h-100">
              <CardBody className="text-center">
                <div className="display-6 mb-3">🔄</div>
                <CardTitle>Adaptación Automática</CardTitle>
                <p>Componentes que se adaptan automáticamente al tema seleccionado.</p>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* Code Example */}
      <section className="mb-5">
        <Card variant="minimal">
          <CardHeader>
            <CardTitle>Ejemplo de Uso</CardTitle>
            <CardSubtitle>Código TypeScript con CSS Modules</CardSubtitle>
          </CardHeader>
          <CardBody>
            <pre className="bg-light p-3 rounded">
              <code>{`import { Button, Card } from './components/ui';

// Uso básico con adaptación automática
<Button variant="primary">Mi Botón</Button>

// Card con componentes internos
<Card variant="professional">
  <CardHeader>
    <CardTitle>Mi Título</CardTitle>
  </CardHeader>
  <CardBody>
    Contenido de la card
  </CardBody>
</Card>`}</code>
            </pre>
          </CardBody>
        </Card>
      </section>

      {/* Navigation */}
      <div className="text-center">
        <ButtonGroup>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/'}
          >
            ← Volver al Inicio
          </Button>
          <Button 
            variant="primary"
            onClick={() => window.location.href = '/showcase'}
          >
            Ver Demo Anterior
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
};

export default ModernComponentsDemo;