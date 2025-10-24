import React, { useState, useEffect } from 'react';
import { Card, Button, Spinner, Alert, Image, Badge } from 'react-bootstrap';
import CardPremium from '../ui/CardPremium';
import { useCommunity } from '../../hooks/useCommunity';
import type { FeedItem } from '../../types/community';

export const ActivityFeed: React.FC = () => {
  const { feed, loading, error, fetchFeed } = useCommunity();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const loadInitialFeed = async () => {
      try {
        const response = await fetchFeed(1);
        setHasMore(response.page < response.totalPages);
        setPage(1);
      } catch (err) {
        // Error ya manejado por el hook
      }
    };

    loadInitialFeed();
  }, [fetchFeed]);

  const loadMore = async () => {
    if (loading || !hasMore) return;

    try {
      const nextPage = page + 1;
      const response = await fetchFeed(nextPage);
      setPage(nextPage);
      setHasMore(nextPage < response.totalPages);
    } catch (err) {
      // Error ya manejado por el hook
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Hace un momento';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} minutos`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays} días`;
    
    return new Date(date).toLocaleDateString();
  };

  const renderFeedItem = (item: FeedItem) => {
    const { user, content, type, timestamp } = item;

    const getActivityIcon = () => {
      switch (type) {
        case 'new_submission':
          return '📤';
        case 'contest_win':
          return '🏆';
        case 'new_follow':
          return '👥';
        case 'contest_participation':
          return '🎯';
        default:
          return '📝';
      }
    };

    const getActivityText = () => {
      switch (type) {
        case 'new_submission':
          return `subió un nuevo ${content.submission?.tipo_medio} "${content.submission?.titulo}"`;
        case 'contest_win':
          return `ganó el ${content.win?.posicion}° lugar en "${content.win?.concurso.titulo}"`;
        case 'new_follow':
          return `comenzó a seguir a ${content.followedUser?.nombre}`;
        case 'contest_participation':
          return `se inscribió en "${content.participation?.concurso.titulo}"`;
        default:
          return 'realizó una actividad';
      }
    };

    const getActivityColor = () => {
      switch (type) {
        case 'new_submission':
          return 'primary';
        case 'contest_win':
          return 'warning';
        case 'new_follow':
          return 'info';
        case 'contest_participation':
          return 'success';
        default:
          return 'secondary';
      }
    };

    return (
      <Card key={item.id} className="mb-3 border-0 shadow-sm">
        <Card.Body>
          <div className="d-flex align-items-start">
            {/* Avatar del usuario */}
            <Image
              src={user.picture_url || '/default-avatar.png'}
              alt={user.nombre}
              roundedCircle
              width={40}
              height={40}
              className="me-3"
            />

            <div className="flex-grow-1">
              {/* Encabezado de la actividad */}
              <div className="d-flex align-items-center mb-2">
                <span className="me-2">{getActivityIcon()}</span>
                <strong className="me-2">{user.nombre}</strong>
                <span className="text-muted">{getActivityText()}</span>
                <Badge bg={getActivityColor()} className="ms-2">
                  {type.replace('_', ' ')}
                </Badge>
              </div>

              {/* Contenido específico de la actividad */}
              {type === 'new_submission' && content.submission && (
                <div className="d-flex align-items-center mt-2 p-2 bg-light rounded">
                  {content.submission.thumbnail_url && (
                    <Image
                      src={content.submission.thumbnail_url}
                      alt={content.submission.titulo}
                      width={60}
                      height={60}
                      className="rounded me-3"
                    />
                  )}
                  <div>
                    <div className="fw-bold">{content.submission.titulo}</div>
                    <small className="text-muted">
                      Concurso: {content.submission.concurso.titulo}
                    </small>
                  </div>
                </div>
              )}

              {type === 'contest_win' && content.win && (
                <div className="mt-2 p-2 bg-warning bg-opacity-10 rounded">
                  <div className="fw-bold text-warning">
                    🏆 {content.win.posicion}° Lugar
                  </div>
                  <div>Concurso: {content.win.concurso.titulo}</div>
                  <small className="text-muted">Categoría: {content.win.categoria}</small>
                </div>
              )}

              {type === 'new_follow' && content.followedUser && (
                <div className="d-flex align-items-center mt-2 p-2 bg-info bg-opacity-10 rounded">
                  <Image
                    src={content.followedUser.picture_url || '/default-avatar.png'}
                    alt={content.followedUser.nombre}
                    roundedCircle
                    width={30}
                    height={30}
                    className="me-2"
                  />
                  <div>
                    <div className="fw-bold">{content.followedUser.nombre}</div>
                    <small className="text-muted">{content.followedUser.role}</small>
                  </div>
                </div>
              )}

              {/* Timestamp */}
              <small className="text-muted">
                {formatTimeAgo(timestamp)}
              </small>
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  };

  if (loading && feed.length === 0) {
    return (
      <CardPremium variant="glass">
        <div className="text-center p-4">
          <Spinner animation="border" />
          <p className="mt-2">Cargando actividades...</p>
        </div>
      </CardPremium>
    );
  }

  return (
    <CardPremium variant="glass" className="activity-feed">
      <div className="card-header">
        <h4>🌟 Feed de Actividades</h4>
        <small className="text-muted">
          Últimas actividades de usuarios que sigues
        </small>
      </div>

      <div className="card-body">
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        {feed.length === 0 ? (
          <div className="text-center text-muted py-4">
            <p>No hay actividades recientes</p>
            <small>
              Sigue a otros usuarios para ver sus actividades aquí
            </small>
          </div>
        ) : (
          <>
            {feed.map(renderFeedItem)}

            {hasMore && (
              <div className="text-center mt-4">
                <Button
                  variant="outline-primary"
                  onClick={loadMore}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Cargando...
                    </>
                  ) : (
                    'Ver más actividades'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </CardPremium>
  );
};