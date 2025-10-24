import React, { useState } from 'react';
import { Container, Row, Col, Nav, Tab } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { ProfileCard } from '../components/profile/ProfileCard';
import { ProfileEditor } from '../components/profile/ProfileEditor';
import { FollowList } from '../components/community/FollowList';
import { ActivityFeed } from '../components/community/ActivityFeed';
import { SubscriptionPlans } from '../components/subscription/SubscriptionPlans';
import { UsageDashboard } from '../components/subscription/UsageDashboard';
import { useProfile } from '../hooks/useProfile';

/**
 * Página completa de perfil de usuario con gestión de comunidad y suscripciones
 */
const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { profile, followUser, unfollowUser } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleFollow = async () => {
    if (profile) {
      try {
        await followUser(profile.id);
      } catch (err) {
        // Error ya manejado por el hook
      }
    }
  };

  const handleUnfollow = async () => {
    if (profile) {
      try {
        await unfollowUser(profile.id);
      } catch (err) {
        // Error ya manejado por el hook
      }
    }
  };

  return (
    <ProtectedRoute>
      <Container className="py-4">
        <Row>
          {/* Sidebar con información del perfil */}
          <Col lg={4} className="mb-4">
            {isEditing ? (
              <ProfileEditor
                onSave={handleSaveProfile}
                onCancel={handleCancelEdit}
              />
            ) : (
              <ProfileCard
                profile={profile || user!}
                isOwnProfile={true}
                onEdit={handleEditProfile}
                onFollow={handleFollow}
                onUnfollow={handleUnfollow}
              />
            )}
          </Col>

          {/* Contenido principal con tabs */}
          <Col lg={8}>
            <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'profile')}>
              <Nav variant="pills" className="mb-4">
                <Nav.Item>
                  <Nav.Link eventKey="profile">
                    👤 Mi Perfil
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="community">
                    👥 Comunidad
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="following">
                    🔗 Siguiendo
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="followers">
                    👥 Seguidores
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="subscription">
                    💳 Suscripción
                  </Nav.Link>
                </Nav.Item>
              </Nav>

              <Tab.Content>
                {/* Tab de perfil - Feed de actividades */}
                <Tab.Pane eventKey="profile">
                  <ActivityFeed />
                </Tab.Pane>

                {/* Tab de comunidad - Usuarios sugeridos y búsqueda */}
                <Tab.Pane eventKey="community">
                  <div className="community-section">
                    <h4 className="mb-3">🌟 Descubre la Comunidad</h4>
                    <p className="text-muted mb-4">
                      Conecta con otros artistas creativos, sigue sus trabajos y mantente al día 
                      con las últimas actividades de la comunidad WebFestival.
                    </p>
                    
                    {/* Aquí se podría agregar un componente de búsqueda de usuarios */}
                    <div className="search-users mb-4">
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Buscar usuarios por nombre..." 
                        disabled
                      />
                      <small className="text-muted">
                        Función de búsqueda próximamente disponible
                      </small>
                    </div>

                    {/* Usuarios sugeridos */}
                    <div className="suggested-users">
                      <h5>👥 Usuarios Sugeridos</h5>
                      <p className="text-muted">
                        Próximamente: usuarios recomendados basados en tus intereses
                      </p>
                    </div>
                  </div>
                </Tab.Pane>

                {/* Tab de siguiendo */}
                <Tab.Pane eventKey="following">
                  <FollowList
                    type="following"
                    title="Usuarios que Sigues"
                  />
                </Tab.Pane>

                {/* Tab de seguidores */}
                <Tab.Pane eventKey="followers">
                  <FollowList
                    type="followers"
                    title="Tus Seguidores"
                  />
                </Tab.Pane>

                {/* Tab de suscripción */}
                <Tab.Pane eventKey="subscription">
                  <div className="subscription-section">
                    <h4 className="mb-3">💳 Gestión de Suscripción</h4>
                    
                    {/* Dashboard de uso */}
                    <div className="mb-4">
                      <UsageDashboard />
                    </div>

                    {/* Planes disponibles */}
                    <div className="mb-4">
                      <h5 className="mb-3">📋 Planes Disponibles</h5>
                      <SubscriptionPlans showCurrentPlan={false} />
                    </div>
                  </div>
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          </Col>
        </Row>
      </Container>
    </ProtectedRoute>
  );
};

export default ProfilePage;