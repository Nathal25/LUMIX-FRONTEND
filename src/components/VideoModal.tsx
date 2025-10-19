// -----------------------------------
// -----------------------------------
// -----------------------------------
// -----------------------------------
// Modal para el video (provisional)
// -----------------------------------
// -----------------------------------
// -----------------------------------
// -----------------------------------
// -----------------------------------
// -----------------------------------

// src/components/VideoModal.tsx
import React, { useRef, useState, useEffect } from 'react';
import '../styles/VideoModal.scss';
import { FaPlay, FaPause, FaForward, FaBackward, FaExpand, FaClosedCaptioning, FaHeart } from 'react-icons/fa';
import apiClient from '../services/apiClient';

interface VideoModalProps {
  videoUrl: string;
  title: string;
  movieId: string;
  onClose: () => void;
}

// Type of data for a movie/video
interface Favorite {
  userId: string,
  movieId: string,
  _id: string,
  createdAt: string,
  updatedAt: string,
}

const VideoModal: React.FC<VideoModalProps> = ({ videoUrl, title, movieId, onClose }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);

  // 🧩 Cargar el estado inicial del favorito
  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      const userString = localStorage.getItem('user');
      const userId = userString ? JSON.parse(userString).id : null;

      if (!userId || !movieId) return;

      try {
        // Llamar al backend para obtener los favoritos de ese usuario
        const favorites = await apiClient.get<Favorite[]>(`/api/v1/favorites/user/${userId}`);

        console.log('User ID:', userId);
        console.log('Favoritos obtenidos:', favorites);
        console.log('Movie ID actual:', movieId);

        // Verificar si esta película ya está entre sus favoritos
        const existingFavorite = favorites.find((fav: Favorite) => fav.movieId === movieId);

        if (existingFavorite) {
          setIsFavorite(true);
          setFavoriteId(existingFavorite._id);
        } else {
          setIsFavorite(false);
          setFavoriteId(null);
        }
      } catch (error) {
        console.error('Error al verificar el estado del favorito:', error);
      }
    };

    fetchFavoriteStatus();
  }, [movieId]);

  // ▶️ Reproducir / Pausar
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  // ⏩ Adelantar 10s
  const handleForward = () => {
    if (videoRef.current) videoRef.current.currentTime += 10;
  };

  // ⏪ Retroceder 10s
  const handleBackward = () => {
    if (videoRef.current) videoRef.current.currentTime -= 10;
  };

  // 🔲 Pantalla completa
  const handleFullscreen = () => {
    const video = videoRef.current;
    if (video) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        video.requestFullscreen();
      }
    }
  };

  // 💬 Subtítulos (si existen)
  const toggleCaptions = () => {
    const video = videoRef.current;
    if (video && video.textTracks.length > 0) {
      const track = video.textTracks[0];
      track.mode = track.mode === 'showing' ? 'hidden' : 'showing';
    }
  };

  // ❤️ Agregar o quitar de favoritos
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



  return (
    <div className="video-modal-overlay" onClick={onClose}>
      <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>

        <video ref={videoRef} autoPlay className="video-player">
          <source src={videoUrl} type="video/mp4" />
          <track
            kind="subtitles"
            srcLang="es"
            label="Español"
            src="/subtitulos.vtt"
            default
          />
          Tu navegador no soporta la reproducción de video.
        </video>

        {/* 🎮 Controles personalizados */}
        <div className="custom-controls">
          <button onClick={handleBackward}><FaBackward /></button>
          <button onClick={togglePlay}>{isPlaying ? <FaPause /> : <FaPlay />}</button>
          <button onClick={handleForward}><FaForward /></button>
          <button onClick={handleFullscreen}><FaExpand /></button>
          <button onClick={toggleCaptions}><FaClosedCaptioning /></button>
          <button className={isFavorite ? 'favorite active' : 'favorite'} onClick={toggleFavorite}><FaHeart /></button>
        </div>

        <h2 className="video-title">{title}</h2>
      </div>
    </div>
  );
};

export default VideoModal;
