import React, { useState, useEffect } from 'react';
import '../styles/FavoritesPage.scss';
import apiClient from '../services/apiClient';
import VideoModal from '../components/VideoModal';
import { FaHeart, FaPlay } from 'react-icons/fa';

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

interface MovieWithFavorite extends Movie {
  favoriteId?: string;
}

export const FavoritesPage: React.FC = () => {
  const [videos, setVideos] = useState<MovieWithFavorite[]>([]);
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

      // 1️⃣ Obtener los favoritos del usuario
      const favResponse = await apiClient.get<Favorite[]>(`/api/v1/favorites/user/${userId}`);
      const favorites = favResponse || [];

      if (!favorites.length) {
        setVideos([]);
        setLoading(false);
        return;
      }

      // 2️⃣ Obtener detalles de las películas asociadas
      const movieRequests = favorites.map((fav) =>
        apiClient.get<Movie>(`/api/v1/movies/${fav.movieId}`).then((movie) => ({
          ...movie,
          favoriteId: fav._id, // Asociamos el ID del favorito
        }))
      );

      // 3️⃣ Esperar todas las respuestas
      const movies = await Promise.all(movieRequests);

      // 4️⃣ Guardar en el estado
      setVideos(movies);
    } catch (err: any) {
      console.error('Error al obtener videos favoritos:', err);
      setError('No se pudieron cargar los videos.');
    } finally {
      setLoading(false);
    }
  }

  /** 🗑️ Elimina un favorito tanto del estado como de la base de datos */
  const handleRemoveFavorite = async (favoriteId?: string, movieId?: string) => {
    if (!favoriteId) {
      console.warn('No se encontró el ID del favorito.');
      return;
    }

    try {
      // 1️⃣ Eliminamos de la BD
      await apiClient.delete(`/api/v1/favorites/movie/${favoriteId}`);

      // 2️⃣ Eliminamos de la UI (optimista)
      setVideos((prev) => prev.filter((v) => v.favoriteId !== favoriteId && v._id !== movieId));
    } catch (error) {
      console.error('Error al eliminar favorito:', error);
      alert('No se pudo eliminar el favorito.');
    }
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
                  <button
                    className="heart-btn"
                    onClick={() => handleRemoveFavorite(video.favoriteId, video._id)}
                    aria-label="Quitar favorito"
                  >
                    <FaHeart />
                  </button>
                </div>

                <p className="card-meta">
                  {video.author ?? ''} · {video.duration ? `${Math.floor(video.duration / 60)}m` : ''}
                </p>
                <p className="card-desc">{video.description ?? 'Sin descripción disponible.'}</p>

                <div className="card-actions">
                  <button
                    className="btn-preview"
                    onClick={() => setSelectedVideo(video)}
                    aria-label={`Vista previa de ${video.title}`}
                  >
                    <FaPlay /> Ver preview
                  </button>
                  <a className="btn-details" href={`/movies/${video._id}`}>
                    Ver ficha completa
                  </a>
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
