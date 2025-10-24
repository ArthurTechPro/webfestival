import React, { useState, useRef, useEffect } from 'react';

interface AudioPlayerPremiumProps {
  src: string;
  title: string;
  artist?: string;
  artwork?: string;
  className?: string;
}

const AudioPlayerPremium: React.FC<AudioPlayerPremiumProps> = ({
  src,
  title,
  artist,
  artwork,
  className = ''
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isLoading, setIsLoading] = useState(true);

  // Simulación de visualizador de ondas
  const [waveformBars] = useState(() => 
    Array.from({ length: 20 }, () => Math.random() * 100 + 20)
  );
  const [activeBar, setActiveBar] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      // Actualizar barra activa del visualizador
      const progress = audio.currentTime / audio.duration;
      setActiveBar(Math.floor(progress * waveformBars.length));
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [waveformBars.length]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newVolume = Math.max(0, Math.min(1, clickX / width));
    
    audio.volume = newVolume;
    setVolume(newVolume);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`wf-audio-player wf-particles-bg ${className}`}>
      <audio ref={audioRef} src={src} />

      {/* Artwork */}
      <div className="wf-audio-artwork wf-hover-glow">
        {artwork ? (
          <img 
            src={artwork} 
            alt={`${title} artwork`}
            className="wf-w-full wf-h-full wf-object-cover wf-rounded"
          />
        ) : (
          <span className="wf-text-2xl">🎵</span>
        )}
      </div>

      {/* Controles principales */}
      <div className="wf-audio-controls">
        <button 
          className="wf-audio-btn wf-hover-cinematic"
          onClick={togglePlay}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="wf-spinner" />
          ) : isPlaying ? (
            '⏸️'
          ) : (
            '▶️'
          )}
        </button>
      </div>

      {/* Información y progreso */}
      <div className="wf-audio-info wf-flex-1">
        <div className="wf-audio-title wf-text-shimmer">
          {title}
        </div>
        {artist && (
          <div className="wf-text-sm wf-opacity-80 wf-mb-2">
            {artist}
          </div>
        )}

        {/* Visualizador de ondas */}
        <div className="wf-audio-waveform wf-mb-3">
          {waveformBars.map((height, index) => (
            <div
              key={index}
              className={`wf-audio-wave-bar ${index <= activeBar && isPlaying ? 'active' : ''}`}
              style={{ 
                height: `${height}%`,
                animationDelay: `${index * 0.1}s`
              }}
            />
          ))}
        </div>

        {/* Barra de progreso */}
        <div className="wf-audio-progress-container">
          <span className="wf-audio-time">
            {formatTime(currentTime)}
          </span>
          <div className="wf-audio-progress wf-flex-1" onClick={handleProgressClick}>
            <div 
              className="wf-audio-progress-bar"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="wf-audio-time">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Control de volumen */}
      <div className="wf-audio-volume">
        <button className="wf-audio-volume-btn">
          {volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
        </button>
        <div className="wf-audio-volume-slider" onClick={handleVolumeChange}>
          <div 
            className="wf-audio-volume-bar"
            style={{ width: `${volume * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export { AudioPlayerPremium };
export default AudioPlayerPremium;