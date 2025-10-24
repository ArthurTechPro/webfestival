import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
import CardPremium from '../ui/CardPremium';
import { ProfileCard } from '../profile/ProfileCard';
import { useCommunity } from '../../hooks/useCommunity';
import { useProfile } from '../../hooks/useProfile';
import type { Following, Follower } from '../../types/community';

interface FollowListProps {
  userId?: string;
  type: 'following' | 'followers';
  title: string;
}

export const FollowList: React.FC<FollowListProps> = ({ userId, type, title }) => {
  const { following, followers, loading, error, fetchFollowing, fetchFollowers } = useCommunity();
  const { followUser, unfollowUser } = useProfile();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const data = type === 'following' ? following : followers;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = type === 'following' 
          ? await fetchFollowing(userId, 1)
          : await fetchFollowers(userId, 1);
        
        setHasMore(response.page < response.totalPages);
        setPage(1);
      } catch (err) {
        // Error ya manejado por el hook
      }
    };

    fetchData();
  }, [userId, type, fetchFollowing, fetchFollowers]);

  const loadMore = async () => {
    if (loading || !hasMore) return;

    try {
      const nextPage = page + 1;
      const response = type === 'following'
        ? await fetchFollowing(userId, nextPage)
        : await fetchFollowers(userId, nextPage);
      
      setPage(nextPage);
      setHasMore(nextPage < response.totalPages);
    } catch (err) {
      // Error ya manejado por el hook
    }
  };

  const handleFollow = async (targetUserId: string) => {
    try {
      setActionLoading(targetUserId);
      await followUser(targetUserId);
    } catch (err) {
      // Error ya manejado por el hook
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnfollow = async (targetUserId: string) => {
    try {
      setActionLoading(targetUserId);
      await unfollowUser(targetUserId);
    } catch (err) {
      // Error ya manejado por el hook
    } finally {
      setActionLoading(null);
    }
  };

  if (loading && data.length === 0) {
    return (
      <CardPremium variant="glass">
        <div className="text-center p-4">
          <Spinner animation="border" />
          <p className="mt-2">Cargando {title.toLowerCase()}...</p>
        </div>
      </CardPremium>
    );
  }

  return (
    <CardPremium variant="glass" className="follow-list">
      <div className="card-header">
        <h4>{title}</h4>
        <small className="text-muted">
          {data.length} {type === 'following' ? 'usuarios seguidos' : 'seguidores'}
        </small>
      </div>

      <div className="card-body">
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        {data.length === 0 ? (
          <div className="text-center text-muted py-4">
            <p>
              {type === 'following' 
                ? 'No sigues a ningún usuario aún' 
                : 'No tienes seguidores aún'
              }
            </p>
            <small>
              {type === 'following'
                ? 'Explora la comunidad y encuentra usuarios interesantes para seguir'
                : 'Comparte contenido increíble para atraer seguidores'
              }
            </small>
          </div>
        ) : (
          <>
            <Row className="g-3">
              {data.map((item) => {
                const user = type === 'following' 
                  ? (item as Following).seguido 
                  : (item as Follower).seguidor;
                
                return (
                  <Col key={user.id} md={6} lg={4}>
                    <ProfileCard
                      profile={user}
                      onFollow={() => handleFollow(user.id)}
                      onUnfollow={() => handleUnfollow(user.id)}
                      loading={actionLoading === user.id}
                    />
                  </Col>
                );
              })}
            </Row>

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
                    'Cargar más'
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