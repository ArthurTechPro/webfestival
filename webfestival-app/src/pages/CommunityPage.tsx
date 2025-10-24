import React, { useState } from 'react';
import { Container, Row, Col, Nav, Tab, Form, InputGroup, Button } from 'react-bootstrap';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import CardPremium from '../components/ui/CardPremium';
import { ProfileCard } from '../components/profile/ProfileCard';
import { ActivityFeed } from '../components/community/ActivityFeed';
import { useCommunity } from '../hooks/useCommunity';
import { useProfile } from '../hooks/useProfile';
import type { UserProfile } from '../types/community';

/**
 * Página de comunidad para descubrir y conectar con otros usuarios
 */
const CommunityPage: React.FC = () => {
  const { searchUsers, suggestedUsers, fetchSuggestedUsers, loading, error } = useCommunity();
  const { followUser, unfollowUser } = useProfile();
  const [activeTab, setActiveTab] = useState('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      const response = await searchUsers(searchQuery.trim());
      setSearchResults(response.data);
    } catch (err) {
      // Error ya manejado por el hook
    } finally {
      setSearching(false);
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      setActionLoading(userId);
      await followUser(userId);
      
      // Actualizar resultados de búsqueda
      setSearchResults(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, isFollowing: true, followersCount: (user.followersCount || 0) + 1 }
            : user
        )
      );
    } catch (err) {
      // Error ya manejado por el hook
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnfollow = async (userId: string) => {
    try {
      setActionLoading(userId);
      await unfollowUser(userId);
      
      // Actualizar resultados de búsqueda
      setSearchResults(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, isFollowing: false, followersCount: Math.max((user.followersCount || 0) - 1, 0) }
            : user
        )
      );
    } catch (err) {
      // Error ya manejado por el hook
    } finally {
      setActionLoading(null);
    }
  };

  React.useEffect(() => {
    if (activeTab === 'discover') {
      fetchSuggestedUsers();
    }
  }, [activeTab, fetchSuggestedUsers]);

  return (
    <ProtectedRoute>
      <Container className="py-4">
        <div className="mb-4">
          <h2>🌟 Comunidad WebFestival</h2>
          <p className="text-muted">
            Conecta con otros artistas creativos, descubre talento emergente y mantente al día 
            con las últimas actividades de la comunidad.
          </p>
        </div>

        <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'feed')}>
          <Nav variant="pills" className="mb-4">
            <Nav.Item>
              <Nav.Link eventKey="feed">
                📰 Feed de Actividades
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="search">
                🔍 Buscar Usuarios
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="discover">
                ✨ Descubrir
              </Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content>
            {/* Tab de feed de actividades */}
            <Tab.Pane eventKey="feed">
              <Row>
                <Col lg={8} className="mx-auto">
                  <ActivityFeed />
                </Col>
              </Row>
            </Tab.Pane>

            {/* Tab de búsqueda de usuarios */}
            <Tab.Pane eventKey="search">
              <Row>
                <Col lg={8} className="mx-auto">
                  <CardPremium variant="glass" className="mb-4">
                    <div className="card-header">
                      <h5>🔍 Buscar Usuarios</h5>
                    </div>
                    <div className="card-body">
                      <Form onSubmit={handleSearch}>
                        <InputGroup className="mb-3">
                          <Form.Control
                            type="text"
                            placeholder="Buscar por nombre de usuario..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            disabled={searching}
                          />
                          <Button 
                            type="submit" 
                            variant="primary"
                            disabled={searching || !searchQuery.trim()}
                          >
                            {searching ? 'Buscando...' : 'Buscar'}
                          </Button>
                        </InputGroup>
                      </Form>

                      {error && (
                        <div className="alert alert-danger">
                          {error}
                        </div>
                      )}

                      {searchResults.length > 0 && (
                        <div className="search-results">
                          <h6 className="mb-3">
                            Resultados de búsqueda ({searchResults.length})
                          </h6>
                          <Row className="g-3">
                            {searchResults.map((user) => (
                              <Col key={user.id} md={6} lg={4}>
                                <ProfileCard
                                  profile={user}
                                  onFollow={() => handleFollow(user.id)}
                                  onUnfollow={() => handleUnfollow(user.id)}
                                  loading={actionLoading === user.id}
                                />
                              </Col>
                            ))}
                          </Row>
                        </div>
                      )}

                      {searchQuery && searchResults.length === 0 && !searching && !error && (
                        <div className="text-center text-muted py-4">
                          <p>No se encontraron usuarios con ese nombre</p>
                          <small>Intenta con otros términos de búsqueda</small>
                        </div>
                      )}
                    </div>
                  </CardPremium>
                </Col>
              </Row>
            </Tab.Pane>

            {/* Tab de descubrir usuarios */}
            <Tab.Pane eventKey="discover">
              <Row>
                <Col lg={10} className="mx-auto">
                  <CardPremium variant="glass">
                    <div className="card-header">
                      <h5>✨ Usuarios Sugeridos</h5>
                      <small className="text-muted">
                        Descubre artistas creativos que podrían interesarte
                      </small>
                    </div>
                    <div className="card-body">
                      {loading && suggestedUsers.length === 0 ? (
                        <div className="text-center py-4">
                          <div className="spinner-border" role="status">
                            <span className="visually-hidden">Cargando...</span>
                          </div>
                          <p className="mt-2">Buscando usuarios sugeridos...</p>
                        </div>
                      ) : suggestedUsers.length > 0 ? (
                        <Row className="g-3">
                          {suggestedUsers.map((user) => (
                            <Col key={user.id} md={6} lg={4}>
                              <ProfileCard
                                profile={user}
                                onFollow={() => handleFollow(user.id)}
                                onUnfollow={() => handleUnfollow(user.id)}
                                loading={actionLoading === user.id}
                              />
                            </Col>
                          ))}
                        </Row>
                      ) : (
                        <div className="text-center text-muted py-4">
                          <p>No hay usuarios sugeridos disponibles</p>
                          <small>
                            Participa en más concursos para obtener mejores recomendaciones
                          </small>
                        </div>
                      )}

                      {error && (
                        <div className="alert alert-danger">
                          {error}
                        </div>
                      )}
                    </div>
                  </CardPremium>
                </Col>
              </Row>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Container>
    </ProtectedRoute>
  );
};

export default CommunityPage;