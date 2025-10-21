// -----------------------------------
// -----------------------------------
// -----------------------------------
// -----------------------------------
// New page para la pagina de favoritos (provisional)
// -----------------------------------
// -----------------------------------
// -----------------------------------
// -----------------------------------
// -----------------------------------
// -----------------------------------

import React, { useState, useEffect } from 'react';
import '../styles/FavoritesPage.scss';
import apiClient from '../services/apiClient';
import VideoModal from '../components/VideoModal';
import { FaHeart, FaPlay } from 'react-icons/fa';

// Tipo de dato para película/video
interface Movie {
  _id: string;
  pexelsId?: number;
  title: string;
  imageUrl: string;
  videoUrl: string;
  duration?: number;
  author?: string;
  description?: string;
}

interface Favorite {
  _id: string;
  userId: number;
  movieId: string;
}

export const FavoritesPage: React.FC = () => {
  const [videos, setVideos] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Movie | null>(null);

  useEffect(() => {
    getFavoritesVideos();
  }, []);

  async function getFavoritesVideos() {
    try {
      const userString = localStorage.getItem('user');
      const userId = userString ? JSON.parse(userString).id : null;
      if (!userId) {
        setError('Usuario no identificado.');
        setLoading(false);
        return;
      }

      // 1. Traer los favoritos del usuario
      const favResponse = await apiClient.get<Favorite[]>(`/api/v1/favorites/user/${userId}`);
      const favorites = favResponse || [];

      if (!favorites.length) {
        setVideos([]);
        setLoading(false);
        return;
      }

      // 2. Traer las películas asociadas a cada favorito
      const movieRequests = favorites.map((fav) =>
        apiClient.get<Movie>(`/api/v1/movies/${fav.movieId}`)
      );

      // 3. Esperar a que todas las peticiones terminen
      const movieResponses = await Promise.all(movieRequests);

      // 4. Guardar las películas en el estado
      const movies = movieResponses.map((res) => res);
      setVideos(movies);
    } catch (err: any) {
      console.error('Error al obtener videos favoritos:', err);
      setError('No se pudieron cargar los videos.');
    } finally {
      setLoading(false);
    }
  }

  const handleRemoveFavorite = (movieId: string) => {
    // UI-only optimistic removal; adaptar a API si tienes favoritoId
    setVideos((prev) => prev.filter((v) => v._id !== movieId));
  };

  return (
    <main className="favorites-page">
      <h1 className="favorites-title">
        Mis favoritos
        <img src="/icons/love.svg" alt="Love" className="favorites-icon" />
      </h1>

      {loading ? (
        <div className="loading-wrapper" role="status" aria-live="polite">
          <div className="spinner" />
          <p className="loading-message">Cargando tus favoritos...</p>
        </div>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : videos.length === 0 ? (
        <p className="no-videos">Aún no tienes videos favoritos.</p>
      ) : (
        <section className="favorite-rows" aria-label="Favoritos">
          {videos.map((video) => (
            <article key={video._id} className="favorite-row">
              <div className="row-thumb">
                <img src={video.imageUrl} alt={video.title} />
              </div>

              <div className="row-card">
                <div className="card-head">
                  <h3 className="card-title">{video.title}</h3>
                  <button className="heart-btn" onClick={() => handleRemoveFavorite(video._id)} aria-label="Quitar favorito">
                    <FaHeart />
                  </button>
                </div>

                <p className="card-meta">{video.author ?? ''} · {video.duration ? `${Math.floor(video.duration/60)}m` : ''}</p>

                <p className="card-desc">{video.description ?? 'Sin descripción disponible.'}</p>

                <div className="card-actions">
                  <button className="btn-preview" onClick={() => setSelectedVideo(video)} aria-label={`Vista previa de ${video.title}`}>
                    <FaPlay /> Ver preview
                  </button>

                  <a className="btn-details" href={`/movies/${video._id}`}>Ver ficha completa</a>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      {selectedVideo && (
        <VideoModal
          videoUrl={selectedVideo.videoUrl}
          title={selectedVideo.title}
          movieId={selectedVideo._id}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </main>
  );
};

export default FavoritesPage;
