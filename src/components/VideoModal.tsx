import React, { useRef, useState, useEffect } from 'react';
import '../styles/VideoModal.scss';
import { FaPlay, FaPause, FaForward, FaBackward, FaExpand, FaClosedCaptioning, FaHeart } from 'react-icons/fa';
import apiClient from '../services/apiClient';
import { useNavigate } from 'react-router'; // added

interface VideoModalProps {
  videoUrl: string;
  title: string;
  movieId: string;
  onClose: () => void;
}

interface Favorite {
  userId: string;
  movieId: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
}

const formatTime = (s: number) => {
  if (!isFinite(s)) return '0:00';
  const minutes = Math.floor(s / 60);
  const seconds = Math.floor(s % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

const VideoModal: React.FC<VideoModalProps> = ({ videoUrl, title, movieId, onClose }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const navigate = useNavigate(); // added

  const [isPlaying, setIsPlaying] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState<number>(0);
  const [loadingPoster, setLoadingPoster] = useState(true);

  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      const userString = localStorage.getItem('user');
      const userId = userString ? JSON.parse(userString).id : null;

      if (!userId || !movieId) return;

      try {
        const favorites = await apiClient.get<Favorite[]>(`/api/v1/favorites/user/${userId}`);
        const existingFavorite = favorites.find((fav: Favorite) => fav.movieId === movieId);
        if (existingFavorite) {
          setIsFavorite(true);
          setFavoriteId(existingFavorite._id);
        } else {
          setIsFavorite(false);
          setFavoriteId(null);
        }
      } catch (error) {
        console.error('Error al verificar favorito:', error);
      }
    };

    fetchFavoriteStatus();
  }, [movieId]);

  // keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === ' ' && document.activeElement !== (document.querySelector('.custom-controls button') as HTMLElement)) {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  // set up loaded / timeupdate handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoaded = () => {
      setDuration(video.duration || 0);
      setLoadingPoster(false);
      if (video.paused && isPlaying) {
        video.play().catch(() => {});
      }
    };
    const onTime = () => {
      // leave as a fallback; RAF loop will provide smooth updates while playing
      setCurrent(video.currentTime || 0);
    };
    const onEnd = () => setIsPlaying(false);

    video.addEventListener('loadedmetadata', onLoaded);
    video.addEventListener('timeupdate', onTime);
    video.addEventListener('ended', onEnd);

    // poster fallback
    const posterTimeout = setTimeout(() => {
      if (loadingPoster) setLoadingPoster(false);
    }, 8000);

    return () => {
      video.removeEventListener('loadedmetadata', onLoaded);
      video.removeEventListener('timeupdate', onTime);
      video.removeEventListener('ended', onEnd);
      clearTimeout(posterTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // RAF loop for smooth progress updates while playing
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const tick = () => {
      if (video) {
        setCurrent(video.currentTime || 0);
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    // start RAF when playing and video ready
    if (!video.paused && isPlaying) {
      rafRef.current = requestAnimationFrame(tick);
    }

    // ensure RAF restarts when isPlaying changes to true
    if (isPlaying && video.paused) {
      // try to play
      video.play().catch(() => {});
      rafRef.current = requestAnimationFrame(tick);
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
    // depend on isPlaying and videoRef.current
  }, [isPlaying, duration]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleForward = () => {
    if (videoRef.current) videoRef.current.currentTime = Math.min((videoRef.current.currentTime || 0) + 10, duration);
  };

  const handleBackward = () => {
    if (videoRef.current) videoRef.current.currentTime = Math.max((videoRef.current.currentTime || 0) - 10, 0);
  };

  const handleFullscreen = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await video.requestFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen error', err);
    }
  };

  const toggleCaptions = () => {
    const video = videoRef.current;
    if (video && video.textTracks.length > 0) {
      const track = video.textTracks[0];
      track.mode = track.mode === 'showing' ? 'hidden' : 'showing';
    }
  };

  const toggleFavorite = async () => {
    const userString = localStorage.getItem('user');
    const userId = userString ? JSON.parse(userString).id : null;

    if (!userId) {
      console.warn('No se encontró el usuario en localStorage');
      return;
    }

    try {
      if (isFavorite && favoriteId) {
        await apiClient.delete(`/api/v1/favorites/movie/${favoriteId}`);
        setIsFavorite(false);
        setFavoriteId(null);
      } else {
        const response = await apiClient.post<Favorite>('/api/v1/favorites', { userId, movieId });
        setIsFavorite(true);
        setFavoriteId(response._id);
      }
    } catch (error) {
      console.error('Error al actualizar favorito:', error);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const pr = progressRef.current;
    const video = videoRef.current;
    if (!pr || !video) return;
    const rect = pr.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    video.currentTime = pct * duration;
    setCurrent(pct * duration); // immediate UI update
  };

  // navigate to a dedicated movie page (close modal first)
  const goToDetails = () => {
    try {
      onClose();
    } catch (e) {
      /* ignore */
    }
    // route for movie details - adjust if your route is different
    navigate(`/movies/${movieId}`);
  };

  return (
    <div className="video-modal-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-label={`Reproductor: ${title}`}>
      <div className="video-modal-content" onClick={handleContentClick}>
        <button className="close-button" aria-label="Cerrar" onClick={onClose}>×</button>

        <div className="video-area">
          {/* Loading poster overlay */}
          {loadingPoster && (
            <div className="loading-poster" aria-hidden="true">
              <div className="vm-spinner" />
              <div className="loading-text">Cargando video…</div>
            </div>
          )}

          <video
            ref={videoRef}
            autoPlay
            className={`video-player ${loadingPoster ? 'hidden' : ''}`}
            controls={false}
            preload="metadata"
          >
            <source src={videoUrl} type="video/mp4" />
            <track
              kind="subtitles"
              srcLang="es"
              label="Español"
              src="/subtitulos.vtt"
            />
            Tu navegador no soporta la reproducción de video.
          </video>

          <div className="media-overlay" aria-hidden={loadingPoster}>
            <div className="progress" ref={progressRef} onClick={handleProgressClick}>
              <div className="progress-bar" style={{ width: `${duration ? (current / duration) * 100 : 0}%` }} />
            </div>

            <div className="controls-row">
              <div className="left-controls">
                <button className="ctrl" onClick={handleBackward} aria-label="Retroceder 10 segundos"><FaBackward /></button>
                <button className="ctrl play" onClick={togglePlay} aria-label={isPlaying ? 'Pausar' : 'Reproducir'}>
                  {isPlaying ? <FaPause /> : <FaPlay />}
                </button>
                <button className="ctrl" onClick={handleForward} aria-label="Adelantar 10 segundos"><FaForward /></button>
              </div>

              <div className="center-info">
                <span className="time">{formatTime(current)} / {formatTime(duration)}</span>
                {/* <h3 className="video-title-inline" title={title}>{title}</h3> */}
              </div>

              <div className="right-controls">
                <button className="ctrl" onClick={handleFullscreen} aria-label="Pantalla completa"><FaExpand /></button>
                <button className="ctrl" onClick={toggleCaptions} aria-label="Subtítulos"><FaClosedCaptioning /></button>
                <button className={`ctrl favorite ${isFavorite ? 'active' : ''}`} onClick={toggleFavorite} aria-pressed={isFavorite} aria-label={isFavorite ? 'Quitar favorito' : 'Añadir favorito'}>
                  <FaHeart />
                </button>
              </div>
            </div>

            {/* NEW: preview footer with link to dedicated page */}
           
          </div>
        </div>

        <div className="meta-row">
          <h2 className="video-title">{title}</h2>
           <div className="preview-actions">
            <button className="more-details" onClick={goToDetails} aria-label={`Ver ficha completa`}>
            Ver ficha completa
            </button>
        </div>
          <p className="video-actions-hint">Presiona espacio para reproducir/pausar — Esc para cerrar</p>
        </div>

        
      </div>
    </div>
  );
};

export default VideoModal;