import React, { useState, useRef, useEffect } from 'react';

interface VideoPlayerPremiumProps {
  src: string;
  poster?: string;
  title?: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  controls?: boolean;
  style?: React.CSSProperties;
}

const VideoPlayerPremium: React.FC<VideoPlayerPremiumProps> = ({
  src,
  poster,
  title,
  className = '',
  autoPlay = false,
  muted = false,
  controls = true
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * duration;
    
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newVolume = Math.max(0, Math.min(1, clickX / width));
    
    video.volume = newVolume;
    setVolume(newVolume);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div 
      className={`wf-video-player wf-spotlight ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        muted={muted}
        className="wf-w-full wf-h-auto"
        onClick={togglePlay}
      />

      {/* Overlay de loading */}
      {isLoading && (
        <div className="wf-video-overlay wf-loading">
          <div className="wf-spinner wf-spinner-lg" />
        </div>
      )}

      {/* Botón de play central */}
      {!isPlaying && !isLoading && (
        <div className="wf-video-overlay">
          <button 
            className="wf-video-play-btn wf-hover-glow"
            onClick={togglePlay}
          >
            ▶️
          </button>
        </div>
      )}

      {/* Controles premium */}
      {controls && (
        <div className={`wf-video-controls ${showControls ? 'wf-opacity-100' : 'wf-opacity-0'}`}>
          {/* Barra de progreso */}
          <div className="wf-video-progress" onClick={handleProgressClick}>
            <div 
              className="wf-video-progress-bar"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <div className="wf-video-buttons">
            {/* Botón play/pause */}
            <button className="wf-video-btn wf-hover-glow" onClick={togglePlay}>
              {isPlaying ? '⏸️' : '▶️'}
            </button>

            {/* Control de volumen */}
            <div className="wf-flex wf-items-center wf-gap-2">
              <button className="wf-video-btn">
                {volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
              </button>
              <div 
                className="wf-w-16 wf-h-1 wf-bg-white wf-bg-opacity-30 wf-rounded-full wf-cursor-pointer"
                onClick={handleVolumeChange}
              >
                <div 
                  className="wf-h-full wf-bg-white wf-rounded-full wf-transition-all"
                  style={{ width: `${volume * 100}%` }}
                />
              </div>
            </div>

            {/* Tiempo */}
            <span className="wf-video-time wf-text-shimmer">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            {/* Pantalla completa */}
            <button 
              className="wf-video-btn wf-ml-auto"
              onClick={() => videoRef.current?.requestFullscreen()}
            >
              ⛶
            </button>
          </div>
        </div>
      )}

      {/* Título del video */}
      {title && (
        <div className="wf-absolute wf-top-4 wf-left-4 wf-right-4">
          <h3 className="wf-text-white wf-text-lg wf-font-semibold wf-text-shimmer">
            {title}
          </h3>
        </div>
      )}
    </div>
  );
};

export { VideoPlayerPremium };
export default VideoPlayerPremium;