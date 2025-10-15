import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardBody, Button } from '../components/ui';
import { VideoPlayerPremium, AudioPlayerPremium } from '../components/multimedia';
import { MasonryGallery } from '../components/gallery';

/**
 * Dashboard cinematográfico premium para participantes (artistas creativos)
 */
const ParticipanteDashboard: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  // Datos de ejemplo para la galería del participante
  const myWorks = [
    {
      id: '1',
      src: 'https://picsum.photos/400/600',
      title: 'Mi Obra Fotográfica',
      author: user?.nombre || 'Usuario',
      category: 'Paisaje',
      type: 'photo' as const,
      aspectRatio: 1.5
    },
    {
      id: '2',
      src: 'https://picsum.photos/400/300',
      title: 'Mi Cortometraje',
      author: user?.nombre || 'Usuario',
      category: 'Drama',
      type: 'video' as const,
      aspectRatio: 0.75
    }
  ];

  return (
    <div className="wf-min-h-screen wf-bg-primary wf-particles-bg wf-pt-20">
      {/* Hero personalizado para el participante */}
      <section className="wf-hero-section wf-spotlight wf-py-16">
        <div className="wf-container">
          <div className="wf-flex wf-items-center wf-justify-between wf-mb-8">
            <div>
              <h1 className="wf-text-4xl wf-text-cinematic wf-mb-2">
                ¡Bienvenido, {user?.nombre}! 🎨
              </h1>
              <div className="wf-flex wf-items-center wf-space-x-4">
                <span className="wf-badge wf-badge-primary wf-text-lg">
                  {user?.role}
                </span>
                <span className="wf-text-shimmer">
                  Dashboard de Participante
                </span>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              icon="🚪"
              onClick={handleLogout}
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </section>

      {/* Grid de funcionalidades principales */}
      <section className="wf-container wf-py-12">
        <div className="wf-grid wf-grid-cols-1 wf-md:grid-cols-2 wf-lg:grid-cols-4 wf-gap-8 wf-mb-16">
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Mis Concursos</CardTitle>
            </CardHeader>
            <CardBody>
              <p className="wf-mb-4 wf-text-sm">
                Gestiona tus participaciones en concursos multimedia de fotografía, video, audio y cine.
              </p>
              <Button variant="primary" size="sm" disabled>
                📸 Ver Concursos
              </Button>
              <p className="wf-text-xs wf-opacity-70 wf-mt-2">Próximamente</p>
            </CardBody>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle>Mis Envíos</CardTitle>
            </CardHeader>
            <CardBody>
              <p className="wf-mb-4 wf-text-sm">
                Revisa y gestiona tus obras multimedia enviadas a los diferentes concursos.
              </p>
              <Button variant="primary" size="sm" disabled>
                🎬 Ver Envíos
              </Button>
              <p className="wf-text-xs wf-opacity-70 wf-mt-2">Próximamente</p>
            </CardBody>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle>Mi Portfolio</CardTitle>
            </CardHeader>
            <CardBody>
              <p className="wf-mb-4 wf-text-sm">
                Actualiza tu información personal y muestra tu portfolio creativo al mundo.
              </p>
              <Button variant="primary" size="sm" disabled>
                🎵 Editar Perfil
              </Button>
              <p className="wf-text-xs wf-opacity-70 wf-mt-2">Próximamente</p>
            </CardBody>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle>Comunidad</CardTitle>
            </CardHeader>
            <CardBody>
              <p className="wf-mb-4 wf-text-sm">
                Conecta con otros artistas, sigue sus trabajos y forma parte de la comunidad.
              </p>
              <Button variant="primary" size="sm" disabled>
                🎭 Explorar
              </Button>
              <p className="wf-text-xs wf-opacity-70 wf-mt-2">Próximamente</p>
            </CardBody>
          </Card>
        </div>

        {/* Sección de obras recientes */}
        <div className="wf-mb-16">
          <h2 className="wf-text-3xl wf-text-festival wf-text-center wf-mb-8">
            Mis Obras Recientes
          </h2>
          <MasonryGallery
            items={myWorks}
            onItemClick={(item) => {
              console.log('Obra seleccionada:', item);
            }}
          />
        </div>

        {/* Reproductores de demostración */}
        <div className="wf-grid wf-grid-cols-1 wf-lg:grid-cols-2 wf-gap-8 wf-mb-16">
          <div>
            <h3 className="wf-text-2xl wf-text-cinematic wf-mb-6">
              🎬 Mi Último Video
            </h3>
            <VideoPlayerPremium
              src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
              poster="https://picsum.photos/800/450"
              title="Mi Cortometraje - Demo"
            />
          </div>

          <div>
            <h3 className="wf-text-2xl wf-text-cinematic wf-mb-6">
              🎵 Mi Última Composición
            </h3>
            <AudioPlayerPremium
              src="/audio-sample.mp3"
              title="Sinfonía Personal"
              artist={user?.nombre || 'Mi Composición'}
              artwork="https://picsum.photos/300/300"
            />
          </div>
        </div>

        {/* Información de la cuenta */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Información de tu Cuenta</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="wf-grid wf-grid-cols-1 wf-md:grid-cols-2 wf-gap-6">
              <div className="wf-space-y-3">
                <div className="wf-flex wf-justify-between">
                  <span className="wf-font-medium">Nombre:</span>
                  <span className="wf-text-shimmer">{user?.nombre}</span>
                </div>
                <div className="wf-flex wf-justify-between">
                  <span className="wf-font-medium">Email:</span>
                  <span className="wf-opacity-80">{user?.email}</span>
                </div>
                <div className="wf-flex wf-justify-between">
                  <span className="wf-font-medium">Rol:</span>
                  <span className="wf-badge wf-badge-primary">{user?.role}</span>
                </div>
              </div>
              
              <div className="wf-space-y-3">
                <div className="wf-flex wf-justify-between">
                  <span className="wf-font-medium">ID:</span>
                  <span className="wf-font-mono wf-text-sm wf-opacity-70">{user?.id}</span>
                </div>
                <div className="wf-flex wf-justify-between">
                  <span className="wf-font-medium">Registro:</span>
                  <span className="wf-opacity-80">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="wf-flex wf-justify-between">
                  <span className="wf-font-medium">Estado:</span>
                  <span className="wf-badge wf-badge-success">Activo</span>
                </div>
              </div>
            </div>
            
            <div className="wf-flex wf-justify-end wf-mt-6">
              <Button variant="outline" size="sm" disabled>
                ⚙️ Configurar Cuenta
              </Button>
            </div>
          </CardBody>
        </Card>
      </section>
    </div>
  );
};

export default ParticipanteDashboard;