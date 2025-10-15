import React, { useState } from 'react';

interface GalleryItem {
  id: string;
  src: string;
  title: string;
  author?: string;
  category?: string;
  type: 'photo' | 'video' | 'audio' | 'cinema';
  aspectRatio?: number;
}

interface MasonryGalleryProps {
  items: GalleryItem[];
  onItemClick?: (item: GalleryItem) => void;
  className?: string;
}

const MasonryGallery: React.FC<MasonryGalleryProps> = ({
  items,
  onItemClick,
  className = ''
}) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const getTypeIcon = (type: string) => {
    const icons = {
      photo: '📸',
      video: '🎬',
      audio: '🎵',
      cinema: '🎭'
    };
    return icons[type as keyof typeof icons] || '🎨';
  };

  const getTypeBadge = (type: string) => {
    const badges = {
      photo: 'wf-badge-photo',
      video: 'wf-badge-video',
      audio: 'wf-badge-audio',
      cinema: 'wf-badge-cinema'
    };
    return badges[type as keyof typeof badges] || 'wf-badge-primary';
  };

  return (
    <div className={`wf-masonry-grid wf-stagger-children ${className}`}>
      {items.map((item, index) => (
        <div
          key={item.id}
          className="wf-masonry-item wf-hover-cinematic wf-animate-cinematic-entrance"
          style={{ 
            animationDelay: `${index * 0.1}s`,
            height: item.aspectRatio ? `${300 * item.aspectRatio}px` : 'auto'
          }}
          onMouseEnter={() => setHoveredItem(item.id)}
          onMouseLeave={() => setHoveredItem(null)}
          onClick={() => onItemClick?.(item)}
        >
          {/* Imagen/Video */}
          <div className="wf-relative wf-overflow-hidden">
            {item.type === 'video' ? (
              <video
                src={item.src}
                className="wf-w-full wf-h-full wf-object-cover"
                muted
                loop
                autoPlay={hoveredItem === item.id}
              />
            ) : item.type === 'audio' ? (
              <div className="wf-w-full wf-h-48 wf-flex wf-items-center wf-justify-center wf-bg-gradient-to-br wf-from-orange-400 wf-to-red-500">
                <div className="wf-text-6xl wf-text-white">
                  {getTypeIcon(item.type)}
                </div>
              </div>
            ) : (
              <img
                src={item.src}
                alt={item.title}
                className="wf-w-full wf-h-full wf-object-cover wf-transition-transform wf-duration-500"
                style={{
                  transform: hoveredItem === item.id ? 'scale(1.1)' : 'scale(1)'
                }}
              />
            )}

            {/* Overlay con información */}
            <div 
              className={`
                wf-absolute wf-inset-0 wf-bg-gradient-to-t wf-from-black wf-via-transparent wf-to-transparent
                wf-flex wf-flex-col wf-justify-between wf-p-4 wf-text-white
                wf-transition-opacity wf-duration-300
                ${hoveredItem === item.id ? 'wf-opacity-100' : 'wf-opacity-0'}
              `}
            >
              {/* Badge de tipo */}
              <div className="wf-flex wf-justify-end">
                <span className={`wf-badge ${getTypeBadge(item.type)} wf-animate-bounce`}>
                  {getTypeIcon(item.type)} {item.type}
                </span>
              </div>

              {/* Información del item */}
              <div>
                <h3 className="wf-text-lg wf-font-semibold wf-mb-1 wf-text-shimmer">
                  {item.title}
                </h3>
                {item.author && (
                  <p className="wf-text-sm wf-opacity-90">
                    Por: {item.author}
                  </p>
                )}
                {item.category && (
                  <p className="wf-text-xs wf-opacity-75 wf-mt-1">
                    {item.category}
                  </p>
                )}
              </div>
            </div>

            {/* Efecto de brillo */}
            {hoveredItem === item.id && (
              <div className="wf-absolute wf-inset-0 wf-pointer-events-none">
                <div className="wf-w-full wf-h-full wf-bg-gradient-to-r wf-from-transparent wf-via-white wf-to-transparent wf-opacity-20 wf-animate-pulse" />
              </div>
            )}
          </div>

          {/* Contenido adicional para audio */}
          {item.type === 'audio' && (
            <div className="wf-p-4 wf-bg-gradient-to-r wf-from-orange-500 wf-to-red-600 wf-text-white">
              <h4 className="wf-font-semibold wf-text-shimmer">{item.title}</h4>
              {item.author && (
                <p className="wf-text-sm wf-opacity-90">{item.author}</p>
              )}
              
              {/* Visualizador de audio simulado */}
              <div className="wf-audio-visualizer wf-mt-3">
                {Array.from({ length: 7 }, (_, i) => (
                  <div
                    key={i}
                    className="wf-audio-bar"
                    style={{
                      height: `${Math.random() * 30 + 10}px`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MasonryGallery;