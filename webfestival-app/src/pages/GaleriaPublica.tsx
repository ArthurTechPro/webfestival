import React, { useState } from 'react';
import { Button } from '../components/ui';

/**
 * Página de galería pública con banner cinematográfico
 */
const GaleriaPublica: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState('todos');

  const mediaTypes = [
    { id: 'todos', name: 'Todos', icon: '🎭', count: '2.5K+' },
    { id: 'fotografia', name: 'Fotografía', icon: '📸', count: '1.2K+' },
    { id: 'video', name: 'Video', icon: '🎬', count: '800+' },
    { id: 'audio', name: 'Audio', icon: '🎵', count: '400+' },
    { id: 'cine', name: 'Cortos', icon: '🎭', count: '300+' }
  ];

  const featuredWorks = [
    {
      id: 1,
      title: 'Atardecer Urbano',
      artist: 'María González',
      type: 'Fotografía',
      contest: 'Concurso Nacional 2024',
      position: '1er Lugar',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      likes: 245,
      views: 1200
    },
    {
      id: 2,
      title: 'Melodía Nocturna',
      artist: 'Carlos Ruiz',
      type: 'Audio',
      contest: 'Festival de Música 2024',
      position: '2do Lugar',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
      likes: 189,
      views: 890
    },
    {
      id: 3,
      title: 'Reflexiones',
      artist: 'Ana Martínez',
      type: 'Video',
      contest: 'Concurso Internacional',
      position: '1er Lugar',
      image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=300&fit=crop',
      likes: 312,
      views: 1500
    }
  ];

  return (
    <div className="wf-min-h-screen" style={{ paddingTop: '80px' }}>
      {/* Banner Hero */}
      <section className="wf-relative wf-py-20 wf-px-6 wf-overflow-hidden">
        {/* Fondo con gradiente */}
        <div 
          className="wf-absolute wf-inset-0 wf-z-0"
          style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 50%, rgba(51, 65, 85, 0.95) 100%)',
          }}
        />
        
        {/* Efectos de fondo */}
        <div 
          className="wf-absolute wf-inset-0 wf-z-0"
          style={{
            background: `
              radial-gradient(circle at 20% 80%, rgba(52, 108, 176, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(90, 159, 212, 0.15) 0%, transparent 50%)
            `
          }}
        />
        
        {/* Contenido del banner */}
        <div className="wf-relative wf-z-10 wf-max-w-6xl wf-mx-auto wf-text-center">
          <div className="wf-mb-6">
            <div className="wf-text-6xl wf-mb-4" style={{ filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))' }}>
              🖼️
            </div>
            <h1 
              className="wf-text-5xl wf-md:text-6xl wf-font-bold wf-mb-4"
              style={{ 
                color: 'white',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                lineHeight: '1.1'
              }}
            >
              Galería de Obras Ganadoras
            </h1>
            <p 
              className="wf-text-xl wf-md:text-2xl wf-mb-8"
              style={{ 
                color: 'rgba(255, 255, 255, 0.9)',
                maxWidth: '800px',
                margin: '0 auto 2rem auto',
                lineHeight: '1.4'
              }}
            >
              Descubre los mejores trabajos creativos de nuestra comunidad global. 
              Fotografía, video, audio y cortometrajes premiados.
            </p>
          </div>
          
          {/* Estadísticas */}
          <div className="wf-grid wf-grid-cols-2 wf-md:grid-cols-4 wf-gap-6 wf-mb-8">
            <div className="wf-text-center">
              <div 
                className="wf-text-3xl wf-font-bold wf-mb-1"
                style={{ color: 'var(--theme-primary, #346CB0)' }}
              >
                2.5K+
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem' }}>
                Obras Destacadas
              </div>
            </div>
            <div className="wf-text-center">
              <div 
                className="wf-text-3xl wf-font-bold wf-mb-1"
                style={{ color: 'var(--theme-primary, #346CB0)' }}
              >
                150+
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem' }}>
                Concursos
              </div>
            </div>
            <div className="wf-text-center">
              <div 
                className="wf-text-3xl wf-font-bold wf-mb-1"
                style={{ color: 'var(--theme-primary, #346CB0)' }}
              >
                50+
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem' }}>
                Países
              </div>
            </div>
            <div className="wf-text-center">
              <div 
                className="wf-text-3xl wf-font-bold wf-mb-1"
                style={{ color: 'var(--theme-primary, #346CB0)' }}
              >
                10K+
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem' }}>
                Artistas
              </div>
            </div>
          </div>
          
          {/* Call to Action */}
          <div className="wf-flex wf-flex-col wf-sm:flex-row wf-gap-4 wf-justify-center">
            <Button variant="primary" size="lg">
              🏆 Ver Ganadores Recientes
            </Button>
            <Button variant="outline" size="lg">
              🎯 Participar en Concursos
            </Button>
          </div>
        </div>
      </section>

      {/* Filtros por tipo de medio */}
      <section className="wf-py-12 wf-px-6" style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
        <div className="wf-max-w-6xl wf-mx-auto">
          <h2 
            className="wf-text-3xl wf-font-bold wf-text-center wf-mb-8"
            style={{ color: 'white' }}
          >
            Explorar por Categoría
          </h2>
          
          <div className="wf-grid wf-grid-cols-2 wf-md:grid-cols-5 wf-gap-4">
            {mediaTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedFilter(type.id)}
                className={`
                  wf-p-6 wf-rounded-xl wf-text-center wf-transition-all wf-duration-300
                  wf-border wf-cursor-pointer
                  ${selectedFilter === type.id 
                    ? 'wf-bg-primary wf-border-primary wf-text-white' 
                    : 'wf-bg-white wf-bg-opacity-5 wf-border-white wf-border-opacity-20 wf-text-white wf-hover:bg-opacity-10'
                  }
                `}
                style={{
                  backdropFilter: 'blur(10px)',
                  transform: selectedFilter === type.id ? 'translateY(-2px)' : 'none',
                  boxShadow: selectedFilter === type.id ? '0 8px 25px rgba(52, 108, 176, 0.3)' : 'none'
                }}
              >
                <div className="wf-text-3xl wf-mb-2">{type.icon}</div>
                <div className="wf-font-semibold wf-mb-1">{type.name}</div>
                <div className="wf-text-sm wf-opacity-80">{type.count}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Obras destacadas */}
      <section className="wf-py-12 wf-px-6">
        <div className="wf-max-w-6xl wf-mx-auto">
          <h2 
            className="wf-text-3xl wf-font-bold wf-text-center wf-mb-8"
            style={{ color: 'white' }}
          >
            Obras Destacadas
          </h2>
          
          <div className="wf-grid wf-grid-cols-1 wf-md:grid-cols-2 wf-lg:grid-cols-3 wf-gap-8">
            {featuredWorks.map((work) => (
              <div
                key={work.id}
                className="wf-rounded-xl wf-overflow-hidden wf-transition-all wf-duration-300 wf-cursor-pointer"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  transform: 'translateY(0)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div className="wf-relative wf-h-48 wf-overflow-hidden">
                  <img
                    src={work.image}
                    alt={work.title}
                    className="wf-w-full wf-h-full wf-object-cover"
                    style={{ transition: 'transform 0.3s ease' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  />
                  <div 
                    className="wf-absolute wf-top-4 wf-right-4 wf-px-3 wf-py-1 wf-rounded-full wf-text-xs wf-font-semibold"
                    style={{ 
                      background: 'rgba(52, 108, 176, 0.9)',
                      color: 'white',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    {work.position}
                  </div>
                </div>
                
                <div className="wf-p-6">
                  <h3 
                    className="wf-text-xl wf-font-bold wf-mb-2"
                    style={{ color: 'white' }}
                  >
                    {work.title}
                  </h3>
                  <p 
                    className="wf-text-sm wf-mb-2"
                    style={{ color: 'rgba(255, 255, 255, 0.8)' }}
                  >
                    por <strong>{work.artist}</strong>
                  </p>
                  <p 
                    className="wf-text-sm wf-mb-4"
                    style={{ color: 'rgba(255, 255, 255, 0.6)' }}
                  >
                    {work.contest} • {work.type}
                  </p>
                  
                  <div className="wf-flex wf-justify-between wf-items-center">
                    <div className="wf-flex wf-space-x-4">
                      <span 
                        className="wf-text-sm"
                        style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                      >
                        ❤️ {work.likes}
                      </span>
                      <span 
                        className="wf-text-sm"
                        style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                      >
                        👁️ {work.views}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm">
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Botón para ver más */}
          <div className="wf-text-center wf-mt-12">
            <Button variant="outline" size="lg">
              Ver Todas las Obras
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action final */}
      <section 
        className="wf-py-20 wf-px-6 wf-text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(52, 108, 176, 0.1) 0%, rgba(90, 159, 212, 0.1) 100%)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <div className="wf-max-w-4xl wf-mx-auto">
          <h2 
            className="wf-text-4xl wf-font-bold wf-mb-4"
            style={{ color: 'white' }}
          >
            ¿Listo para Mostrar tu Talento?
          </h2>
          <p 
            className="wf-text-xl wf-mb-8"
            style={{ color: 'rgba(255, 255, 255, 0.8)' }}
          >
            Únete a miles de artistas creativos y participa en nuestros concursos profesionales.
          </p>
          <div className="wf-flex wf-flex-col wf-sm:flex-row wf-gap-4 wf-justify-center">
            <Button variant="primary" size="lg">
              🚀 Registrarse Ahora
            </Button>
            <Button variant="outline" size="lg">
              📚 Ver Concursos Activos
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GaleriaPublica;