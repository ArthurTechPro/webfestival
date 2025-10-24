import React from 'react';
import { Row, Col, Button, Badge, ListGroup, Spinner } from 'react-bootstrap';
import CardPremium from '../ui/CardPremium';
import ButtonCinematic from '../ui/ButtonCinematic';
import { useSubscription } from '../../hooks/useSubscription';
// import type { SubscriptionPlan } from '../../types/community';

interface SubscriptionPlansProps {
  onSelectPlan?: (planId: string) => void;
  showCurrentPlan?: boolean;
}

export const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({
  onSelectPlan,
  showCurrentPlan = true
}) => {
  const { 
    plans, 
    currentSubscription, 
    loading, 
    error, 
    createCheckoutSession 
  } = useSubscription();

  const handleSelectPlan = async (planId: string) => {
    if (onSelectPlan) {
      onSelectPlan(planId);
    } else {
      try {
        await createCheckoutSession(planId);
      } catch (err) {
        // Error ya manejado por el hook
      }
    }
  };

  const isCurrentPlan = (planId: string) => {
    return currentSubscription?.planId === planId;
  };

  const getPlanBadgeVariant = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'básico':
        return 'secondary';
      case 'profesional':
        return 'primary';
      case 'premium':
        return 'warning';
      case 'organizador':
        return 'success';
      default:
        return 'info';
    }
  };

  const formatPrice = (price: number, currency: string, interval: string) => {
    const formattedPrice = new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(price);

    const intervalText = interval === 'monthly' ? 'mes' : 'año';
    return `${formattedPrice}/${intervalText}`;
  };

  if (loading && plans.length === 0) {
    return (
      <CardPremium variant="glass">
        <div className="text-center p-4">
          <Spinner animation="border" />
          <p className="mt-2">Cargando planes...</p>
        </div>
      </CardPremium>
    );
  }

  return (
    <div className="subscription-plans">
      {showCurrentPlan && currentSubscription && (
        <CardPremium variant="glass" className="mb-4">
          <div className="card-header">
            <h5>📋 Plan Actual</h5>
          </div>
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="mb-1">{currentSubscription.plan.name}</h6>
                <p className="text-muted mb-0">
                  {formatPrice(
                    currentSubscription.plan.price,
                    currentSubscription.plan.currency,
                    currentSubscription.plan.interval
                  )}
                </p>
              </div>
              <Badge bg={getPlanBadgeVariant(currentSubscription.plan.name)}>
                {currentSubscription.status === 'active' ? 'Activo' : currentSubscription.status}
              </Badge>
            </div>
            
            {currentSubscription.cancelAtPeriodEnd && (
              <div className="mt-2">
                <Badge bg="warning" text="dark">
                  Se cancelará el {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}
                </Badge>
              </div>
            )}
          </div>
        </CardPremium>
      )}

      <Row className="g-4">
        {plans.map((plan) => (
          <Col key={plan.id} md={6} lg={3}>
            <CardPremium 
              variant={isCurrentPlan(plan.id) ? "cinematic" : "glass"}
              className={`h-100 ${isCurrentPlan(plan.id) ? 'border-primary' : ''}`}
            >
              <div className="card-header text-center">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="mb-0">{plan.name}</h5>
                  {isCurrentPlan(plan.id) && (
                    <Badge bg="success">Actual</Badge>
                  )}
                </div>
                
                <div className="price-display">
                  <h3 className="text-primary mb-0">
                    {formatPrice(plan.price, plan.currency, plan.interval)}
                  </h3>
                  {plan.interval === 'yearly' && (
                    <small className="text-success">
                      ¡Ahorra 2 meses!
                    </small>
                  )}
                </div>
              </div>

              <div className="card-body d-flex flex-column">
                {/* Límites del plan */}
                <div className="mb-3">
                  <h6>Límites incluidos:</h6>
                  <ListGroup variant="flush" className="small">
                    <ListGroup.Item className="px-0 py-1 border-0">
                      📊 {plan.limits.maxConcursosPerMonth} concursos/mes
                    </ListGroup.Item>
                    <ListGroup.Item className="px-0 py-1 border-0">
                      📤 {plan.limits.maxUploadsPerMonth} subidas/mes
                    </ListGroup.Item>
                    <ListGroup.Item className="px-0 py-1 border-0">
                      🔒 {plan.limits.maxPrivateContests} concursos privados
                    </ListGroup.Item>
                    <ListGroup.Item className="px-0 py-1 border-0">
                      👥 {plan.limits.maxTeamMembers} miembros de equipo
                    </ListGroup.Item>
                  </ListGroup>
                </div>

                {/* Características del plan */}
                <div className="mb-4 flex-grow-1">
                  <h6>Características:</h6>
                  <ListGroup variant="flush" className="small">
                    {plan.features.map((feature) => (
                      <ListGroup.Item 
                        key={feature.key} 
                        className="px-0 py-1 border-0 d-flex align-items-center"
                      >
                        <span className="me-2">
                          {feature.enabled ? '✅' : '❌'}
                        </span>
                        <span className={feature.enabled ? '' : 'text-muted'}>
                          {feature.name}
                        </span>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </div>

                {/* Botón de acción */}
                <div className="mt-auto">
                  {isCurrentPlan(plan.id) ? (
                    <Button variant="outline-success" disabled className="w-100">
                      ✓ Plan Actual
                    </Button>
                  ) : (
                    <ButtonCinematic
                      variant="professional"
                      onClick={() => handleSelectPlan(plan.id)}
                      disabled={loading}
                      className="w-100"
                    >
                      {currentSubscription ? 'Cambiar Plan' : 'Seleccionar'}
                    </ButtonCinematic>
                  )}
                </div>
              </div>
            </CardPremium>
          </Col>
        ))}
      </Row>

      {error && (
        <div className="mt-3">
          <div className="alert alert-danger">
            {error}
          </div>
        </div>
      )}
    </div>
  );
};