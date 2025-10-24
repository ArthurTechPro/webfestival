import React from 'react';
import { Alert } from 'react-bootstrap';
import { VideoPlayerPremium } from '../multimedia/VideoPlayerPremium';
import { AudioPlayerPremium } from '../multimedia/AudioPlayerPremium';
import type { MedioParaEvaluacion } from '../../types';

interface MediaPlayerProps {
  medio: MedioParaEvaluacion;
  className?: string;
}

/**
 * Reproductor universal para diferentes tipos de medios multimedia
 */
const MediaPlayer: React.FC<MediaPlayerProps> = ({ medio, className = '' }) => {
  const renderPlayer = () => {
    switch (medio.tipo_medio) {
      case 'fotografia':
        return (
          <div className={`text-center ${className}`}>
            {medio.preview_url || medio.medio_url ? (
              <img
                src={medio.preview_url || medio.medio_url}
                alt={medio.titulo}
                className="img-fluid rounded"
                style={{ maxHeight: '400px', width: 'auto' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('d-none');
                }}
              />
            ) : (
              <div className="d-flex align-items-center justify-content-center bg-secondary rounded" style={{ height: '300px' }}>
                <div className="text-center">
                  <div style={{ fontSize: '4rem' }}>📸</div>
                  <p className="text-light mt-2">Imagen no disponible</p>
                </div>
              </div>
            )}
            <div className="d-none">
              <Alert variant="warning" className="mt-2">
                Error al cargar la imagen. Verifica la URL: {medio.medio_url}
              </Alert>
            </div>
          </div>
        );

      case 'video':
      case 'corto_cine':
        return (
          <div className={className}>
            {medio.medio_url ? (
              <VideoPlayerPremium
                src={medio.medio_url}
                poster={medio.thumbnail_url}
                title={medio.titulo}
                className="w-100"
                controls
                style={{ maxHeight: '400px' }}
              />
            ) : (
              <div className="d-flex align-items-center justify-content-center bg-secondary rounded" style={{ height: '300px' }}>
                <div className="text-center">
                  <div style={{ fontSize: '4rem' }}>🎬</div>
                  <p className="text-light mt-2">Video no disponible</p>
                </div>
              </div>
            )}
          </div>
        );

      case 'audio':
        return (
          <div className={className}>
            {medio.medio_url ? (
              <div>
                {/* Imagen de portada si está disponible */}
                {medio.thumbnail_url && (
                  <div className="text-center mb-3">
                    <img
                      src={medio.thumbnail_url}
                      alt={`Portada de ${medio.titulo}`}
                      className="rounded"
                      style={{ maxHeight: '200px', width: 'auto' }}
                    />
                  </div>
                )}
                
                <AudioPlayerPremium
                  src={medio.medio_url}
                  title={medio.titulo}
                  artist={medio.usuario.nombre}
                  className="w-100"
                />
              </div>
            ) : (
              <div className="d-flex align-items-center justify-content-center bg-secondary rounded" style={{ height: '200px' }}>
                <div className="text-center">
                  <div style={{ fontSize: '4rem' }}>🎵</div>
                  <p className="text-light mt-2">Audio no disponible</p>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className={`d-flex align-items-center justify-content-center bg-secondary rounded ${className}`} style={{ height: '300px' }}>
            <div className="text-center">
              <div style={{ fontSize: '4rem' }}>📄</div>
              <p className="text-light mt-2">Tipo de medio no soportado</p>
              <small className="text-muted">Tipo: {medio.tipo_medio}</small>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="media-player-container">
      {renderPlayer()}
      
      {/* Información adicional del medio */}
      <div className="mt-3 text-center">
        <small className="text-light">
          <strong>{medio.titulo}</strong> por {medio.usuario.nombre}
        </small>
        {medio.duracion && (
          <div className="text-muted small">
            Duración: {Math.floor(medio.duracion / 60)}:{(medio.duracion % 60).toString().padStart(2, '0')}
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaPlayer;