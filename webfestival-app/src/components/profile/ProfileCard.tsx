import React from 'react';
import { Image, Button, Badge } from 'react-bootstrap';
import CardPremium from '../ui/CardPremium';
import ButtonCinematic from '../ui/ButtonCinematic';
import type { UserProfile } from '../../types/community';

interface ProfileCardProps {
  profile: UserProfile;
  isOwnProfile?: boolean;
  onEdit?: () => void;
  onFollow?: () => void;
  onUnfollow?: () => void;
  loading?: boolean;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  isOwnProfile = false,
  onEdit,
  onFollow,
  onUnfollow,
  loading = false
}) => {
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'danger';
      case 'JURADO':
        return 'warning';
      case 'CONTENT_ADMIN':
        return 'info';
      default:
        return 'primary';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrador';
      case 'JURADO':
        return 'Jurado';
      case 'CONTENT_ADMIN':
        return 'Editor de Contenido';
      default:
        return 'Participante';
    }
  };

  return (
    <CardPremium variant="glass" className="profile-card">
      <div className="card-body text-center">
        {/* Foto de perfil */}
        <div className="mb-3">
          <Image
            src={profile.picture_url || '/default-avatar.png'}
            alt={`Foto de ${profile.nombre}`}
            roundedCircle
            width={120}
            height={120}
            className="border border-3 border-light shadow"
          />
        </div>

        {/* Información básica */}
        <h4 className="mb-2">{profile.nombre}</h4>
        
        <Badge 
          bg={getRoleBadgeVariant(profile.role)} 
          className="mb-3"
        >
          {getRoleLabel(profile.role)}
        </Badge>

        {/* Biografía */}
        {profile.bio && (
          <p className="text-muted mb-3" style={{ fontSize: '0.9rem' }}>
            {profile.bio}
          </p>
        )}

        {/* Estadísticas de seguimiento */}
        <div className="d-flex justify-content-center gap-4 mb-3">
          <div className="text-center">
            <div className="fw-bold">{profile.followersCount || 0}</div>
            <small className="text-muted">Seguidores</small>
          </div>
          <div className="text-center">
            <div className="fw-bold">{profile.followingCount || 0}</div>
            <small className="text-muted">Siguiendo</small>
          </div>
          {profile.stats && (
            <div className="text-center">
              <div className="fw-bold">{profile.stats.totalSubmissions}</div>
              <small className="text-muted">Envíos</small>
            </div>
          )}
        </div>

        {/* Estadísticas adicionales */}
        {profile.stats && (
          <div className="d-flex justify-content-center gap-4 mb-3">
            <div className="text-center">
              <div className="fw-bold text-warning">{profile.stats.totalWins}</div>
              <small className="text-muted">Victorias</small>
            </div>
            <div className="text-center">
              <div className="fw-bold text-info">{profile.stats.totalParticipations}</div>
              <small className="text-muted">Participaciones</small>
            </div>
            {profile.stats.averageRating && (
              <div className="text-center">
                <div className="fw-bold text-success">
                  {profile.stats.averageRating.toFixed(1)}
                </div>
                <small className="text-muted">Rating</small>
              </div>
            )}
          </div>
        )}

        {/* Información adicional */}
        <div className="text-muted small mb-3">
          <div>Miembro desde {new Date(profile.createdAt).toLocaleDateString()}</div>
          {profile.stats?.favoriteCategory && (
            <div>Categoría favorita: {profile.stats.favoriteCategory}</div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="d-flex gap-2 justify-content-center">
          {isOwnProfile ? (
            <ButtonCinematic
              variant="professional"
              onClick={onEdit}
              disabled={loading}
            >
              ✏️ Editar Perfil
            </ButtonCinematic>
          ) : (
            <>
              {profile.isFollowing ? (
                <ButtonCinematic
                  variant="corporate"
                  onClick={onUnfollow}
                  disabled={loading}
                >
                  ✓ Siguiendo
                </ButtonCinematic>
              ) : (
                <ButtonCinematic
                  variant="professional"
                  onClick={onFollow}
                  disabled={loading}
                >
                  + Seguir
                </ButtonCinematic>
              )}
              
              <Button
                variant="outline-secondary"
                size="sm"
                disabled={loading}
              >
                💬 Mensaje
              </Button>
            </>
          )}
        </div>
      </div>
    </CardPremium>
  );
};