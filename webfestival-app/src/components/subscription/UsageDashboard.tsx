import React from 'react';
import { Row, Col, ProgressBar, Alert, Button } from 'react-bootstrap';
import CardPremium from '../ui/CardPremium';
import ButtonCinematic from '../ui/ButtonCinematic';
import { useSubscription } from '../../hooks/useSubscription';

export const UsageDashboard: React.FC = () => {
  const { 
    currentSubscription, 
    // usageLimits, 
    loading, 
    error, 
    getUsagePercentage,
    canPerformAction,
    createBillingPortalSession
  } = useSubscription();

  if (!currentSubscription) {
    return (
      <CardPremium variant="glass">
        <div className="card-body text-center py-4">
          <h5>No tienes una suscripción activa</h5>
          <p className="text-muted">
            Suscríbete a un plan para acceder a todas las funcionalidades
          </p>
          <ButtonCinematic variant="professional">
            Ver Planes
          </ButtonCinematic>
        </div>
      </CardPremium>
    );
  }

  const { plan, usage, status, currentPeriodEnd, cancelAtPeriodEnd } = currentSubscription;

  const getProgressVariant = (percentage: number) => {
    if (percentage >= 90) return 'danger';
    if (percentage >= 75) return 'warning';
    return 'success';
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const usageItems = [
    {
      key: 'contests',
      label: 'Concursos participados',
      current: usage.concursosThisMonth,
      limit: plan.limits.maxConcursosPerMonth,
      icon: '🏆'
    },
    {
      key: 'uploads',
      label: 'Archivos subidos',
      current: usage.uploadsThisMonth,
      limit: plan.limits.maxUploadsPerMonth,
      icon: '📤'
    },
    {
      key: 'private_contests',
      label: 'Concursos privados',
      current: usage.privateContestsUsed,
      limit: plan.limits.maxPrivateContests,
      icon: '🔒'
    },
    {
      key: 'team_members',
      label: 'Miembros de equipo',
      current: usage.teamMembersUsed,
      limit: plan.limits.maxTeamMembers,
      icon: '👥'
    }
  ];

  return (
    <div className="usage-dashboard">
      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}

      {/* Información de la suscripción */}
      <CardPremium variant="glass" className="mb-4">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <h5>📊 Resumen de Suscripción</h5>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={createBillingPortalSession}
              disabled={loading}
            >
              Gestionar Facturación
            </Button>
          </div>
        </div>

        <div className="card-body">
          <Row>
            <Col md={6}>
              <div className="mb-3">
                <strong>Plan:</strong> {plan.name}
              </div>
              <div className="mb-3">
                <strong>Estado:</strong>{' '}
                <span className={`badge bg-${status === 'active' ? 'success' : 'warning'}`}>
                  {status === 'active' ? 'Activo' : status}
                </span>
              </div>
              <div className="mb-3">
                <strong>Próxima renovación:</strong> {formatDate(currentPeriodEnd)}
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-3">
                <strong>Precio:</strong> {new Intl.NumberFormat('es-ES', {
                  style: 'currency',
                  currency: plan.currency.toUpperCase()
                }).format(plan.price)}/{plan.interval === 'monthly' ? 'mes' : 'año'}
              </div>
              
              {cancelAtPeriodEnd && (
                <Alert variant="warning" className="mb-0">
                  <small>
                    ⚠️ Tu suscripción se cancelará el {formatDate(currentPeriodEnd)}
                  </small>
                </Alert>
              )}
            </Col>
          </Row>
        </div>
      </CardPremium>

      {/* Uso de límites */}
      <CardPremium variant="glass" className="mb-4">
        <div className="card-header">
          <h5>📈 Uso de Límites</h5>
          <small className="text-muted">
            Período actual: {formatDate(new Date())} - {formatDate(currentPeriodEnd)}
          </small>
        </div>

        <div className="card-body">
          <Row className="g-3">
            {usageItems.map((item) => {
              const percentage = getUsagePercentage(item.key);
              const isNearLimit = percentage >= 80;
              
              return (
                <Col key={item.key} md={6}>
                  <div className="usage-item p-3 border rounded">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="d-flex align-items-center">
                        <span className="me-2">{item.icon}</span>
                        <strong>{item.label}</strong>
                      </div>
                      <span className={`badge ${isNearLimit ? 'bg-warning text-dark' : 'bg-light text-dark'}`}>
                        {item.current}/{item.limit}
                      </span>
                    </div>
                    
                    <ProgressBar
                      now={percentage}
                      variant={getProgressVariant(percentage)}
                      className="mb-2"
                      style={{ height: '8px' }}
                    />
                    
                    <div className="d-flex justify-content-between">
                      <small className="text-muted">
                        {percentage.toFixed(1)}% utilizado
                      </small>
                      {isNearLimit && (
                        <small className="text-warning">
                          ⚠️ Cerca del límite
                        </small>
                      )}
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
        </div>
      </CardPremium>

      {/* Características del plan */}
      <CardPremium variant="glass">
        <div className="card-header">
          <h5>✨ Características de tu Plan</h5>
        </div>

        <div className="card-body">
          <Row className="g-3">
            {plan.features.map((feature) => (
              <Col key={feature.key} md={6}>
                <div className="d-flex align-items-center">
                  <span className="me-2">
                    {feature.enabled ? '✅' : '❌'}
                  </span>
                  <div>
                    <div className={feature.enabled ? '' : 'text-muted'}>
                      {feature.name}
                    </div>
                    {feature.description && (
                      <small className="text-muted">
                        {feature.description}
                      </small>
                    )}
                  </div>
                </div>
              </Col>
            ))}
          </Row>

          {/* Acciones rápidas */}
          <div className="mt-4 pt-3 border-top">
            <h6>Acciones disponibles:</h6>
            <div className="d-flex flex-wrap gap-2">
              <Button
                variant={canPerformAction('participate_contest') ? 'success' : 'outline-secondary'}
                size="sm"
                disabled={!canPerformAction('participate_contest')}
              >
                🏆 Participar en concurso
              </Button>
              
              <Button
                variant={canPerformAction('upload_media') ? 'success' : 'outline-secondary'}
                size="sm"
                disabled={!canPerformAction('upload_media')}
              >
                📤 Subir archivo
              </Button>
              
              <Button
                variant={canPerformAction('create_private_contest') ? 'success' : 'outline-secondary'}
                size="sm"
                disabled={!canPerformAction('create_private_contest')}
              >
                🔒 Crear concurso privado
              </Button>
              
              <Button
                variant={canPerformAction('access_analytics') ? 'success' : 'outline-secondary'}
                size="sm"
                disabled={!canPerformAction('access_analytics')}
              >
                📊 Ver analytics
              </Button>
            </div>
          </div>
        </div>
      </CardPremium>
    </div>
  );
};