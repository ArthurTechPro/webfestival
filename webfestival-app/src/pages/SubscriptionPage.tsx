import React, { useState } from 'react';
import { Container, Row, Col, Nav, Tab, Alert } from 'react-bootstrap';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { SubscriptionPlans } from '../components/subscription/SubscriptionPlans';
import { UsageDashboard } from '../components/subscription/UsageDashboard';
import { useSubscription } from '../hooks/useSubscription';

/**
 * Página de gestión de suscripciones y planes
 */
const SubscriptionPage: React.FC = () => {
  const { currentSubscription, error } = useSubscription();
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <ProtectedRoute>
      <Container className="py-4">
        <div className="mb-4">
          <h2>💳 Gestión de Suscripción</h2>
          <p className="text-muted">
            Administra tu plan de suscripción, revisa tu uso actual y explora las opciones disponibles.
          </p>
        </div>

        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'dashboard')}>
          <Nav variant="pills" className="mb-4">
            <Nav.Item>
              <Nav.Link eventKey="dashboard">
                📊 Dashboard
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="plans">
                📋 Planes Disponibles
              </Nav.Link>
            </Nav.Item>
            {currentSubscription && (
              <Nav.Item>
                <Nav.Link eventKey="billing">
                  🧾 Facturación
                </Nav.Link>
              </Nav.Item>
            )}
          </Nav>

          <Tab.Content>
            {/* Tab de dashboard */}
            <Tab.Pane eventKey="dashboard">
              <UsageDashboard />
            </Tab.Pane>

            {/* Tab de planes */}
            <Tab.Pane eventKey="plans">
              <div className="mb-4">
                <h4>📋 Planes de Suscripción</h4>
                <p className="text-muted">
                  Elige el plan que mejor se adapte a tus necesidades como artista creativo.
                </p>
              </div>
              
              <SubscriptionPlans />
              
              <div className="mt-5">
                <h5>❓ Preguntas Frecuentes</h5>
                <div className="accordion" id="faqAccordion">
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button 
                        className="accordion-button collapsed" 
                        type="button" 
                        data-bs-toggle="collapse" 
                        data-bs-target="#faq1"
                      >
                        ¿Puedo cambiar de plan en cualquier momento?
                      </button>
                    </h2>
                    <div id="faq1" className="accordion-collapse collapse">
                      <div className="accordion-body">
                        Sí, puedes actualizar o degradar tu plan en cualquier momento. 
                        Los cambios se aplicarán inmediatamente y se prorrateará la facturación.
                      </div>
                    </div>
                  </div>
                  
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button 
                        className="accordion-button collapsed" 
                        type="button" 
                        data-bs-toggle="collapse" 
                        data-bs-target="#faq2"
                      >
                        ¿Qué sucede si excedo mis límites?
                      </button>
                    </h2>
                    <div id="faq2" className="accordion-collapse collapse">
                      <div className="accordion-body">
                        Si alcanzas los límites de tu plan, te sugeriremos actualizar a un plan superior. 
                        No se aplicarán cargos adicionales sin tu consentimiento.
                      </div>
                    </div>
                  </div>
                  
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button 
                        className="accordion-button collapsed" 
                        type="button" 
                        data-bs-toggle="collapse" 
                        data-bs-target="#faq3"
                      >
                        ¿Puedo cancelar mi suscripción?
                      </button>
                    </h2>
                    <div id="faq3" className="accordion-collapse collapse">
                      <div className="accordion-body">
                        Sí, puedes cancelar tu suscripción en cualquier momento. 
                        Mantendrás acceso a las funciones premium hasta el final de tu período de facturación actual.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Tab.Pane>

            {/* Tab de facturación */}
            {currentSubscription && (
              <Tab.Pane eventKey="billing">
                <div className="billing-section">
                  <h4 className="mb-4">🧾 Información de Facturación</h4>
                  
                  <Row>
                    <Col lg={8}>
                      <div className="card">
                        <div className="card-body">
                          <h5 className="card-title">Próxima Facturación</h5>
                          <p className="card-text">
                            Tu próxima facturación será el{' '}
                            <strong>
                              {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString('es-ES')}
                            </strong>
                            {' '}por un monto de{' '}
                            <strong>
                              {new Intl.NumberFormat('es-ES', {
                                style: 'currency',
                                currency: currentSubscription.plan.currency.toUpperCase()
                              }).format(currentSubscription.plan.price)}
                            </strong>
                          </p>
                          
                          {currentSubscription.cancelAtPeriodEnd && (
                            <Alert variant="warning">
                              ⚠️ Tu suscripción se cancelará automáticamente el{' '}
                              {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString('es-ES')}
                            </Alert>
                          )}
                          
                          <div className="mt-3">
                            <button 
                              className="btn btn-outline-primary me-2"
                              onClick={() => {
                                // Implementar apertura del portal de facturación
                                alert('Redirigiendo al portal de facturación...');
                              }}
                            >
                              Gestionar Facturación
                            </button>
                            
                            <button 
                              className="btn btn-outline-secondary"
                              onClick={() => {
                                // Implementar descarga de facturas
                                alert('Función de descarga próximamente...');
                              }}
                            >
                              Descargar Facturas
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="card mt-4">
                        <div className="card-body">
                          <h5 className="card-title">Historial de Pagos</h5>
                          <p className="text-muted">
                            Próximamente: historial completo de tus pagos y facturas
                          </p>
                        </div>
                      </div>
                    </Col>
                    
                    <Col lg={4}>
                      <div className="card">
                        <div className="card-body">
                          <h6 className="card-title">Información de Pago</h6>
                          <p className="text-muted small">
                            Los pagos se procesan de forma segura a través de Stripe.
                          </p>
                          
                          <div className="mt-3">
                            <small className="text-muted">
                              <strong>Método de pago:</strong><br />
                              •••• •••• •••• 4242<br />
                              Visa terminada en 4242
                            </small>
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Tab.Pane>
            )}
          </Tab.Content>
        </Tab.Container>
      </Container>
    </ProtectedRoute>
  );
};

export default SubscriptionPage;