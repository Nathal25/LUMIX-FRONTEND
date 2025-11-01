import React, { useState, useEffect } from 'react';
import '../styles/FavoritesPage.scss';
import apiClient from '../services/apiClient';
import VideoModal from '../components/VideoModal';
import { FaHeart, FaPlay } from 'react-icons/fa';

/**
 * Represents a movie/video object with metadata.
 * 
 * @interface Movie
 * @property {string} _id - Unique database identifier
 * @property {number} [pexelsId] - Optional Pexels API identifier
 * @property {string} title - Movie title
 * @property {string} imageUrl - Thumbnail image URL
 * @property {string} videoUrl - Video file URL
 * @property {number} [duration] - Video duration in seconds
 * @property {string} [author] - Video author/creator
 * @property {string} [description] - Video description
 */
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

/**
 * Represents a favorite entry linking a user to a movie.
 * 
 * @interface Favorite
 * @property {string} _id - Unique favorite entry ID
 * @property {number} userId - ID of the user who favorited the movie
 * @property {string} movieId - ID of the favorited movie
 */
interface Favorite {
  _id: string;
  userId: number;
  movieId: string;
}

/**
 * Movie object extended with favorite information.
 * 
 * @interface MovieWithFavorite
 * @extends {Movie}
 * @property {string} [favoriteId] - ID of the favorite entry for quick removal
 */
interface MovieWithFavorite extends Movie {
  favoriteId?: string;
}

/**
 * FavoritesPage Component
 * 
 * Displays the user's favorite movies in a grid layout with video playback
 * and favorite removal capabilities.
 * 
 * Features:
 * - Fetches user's favorite movies from the backend
 * - Grid display with movie thumbnails
 * - Video playback via VideoModal
 * - Remove from favorites functionality
 * - Loading and error states
 * - Keyboard-accessible cards with hover effects
 * 
 * Flow:
 * 1. Loads user ID from localStorage
 * 2. Fetches user's favorites list
 * 3. Fetches full movie details for each favorite
 * 4. Displays movies with play and remove options
 * 
 * @component
 * @returns {JSX.Element} The rendered favorites page with movie grid
 */
export const FavoritesPage: React.FC = () => {
  const [videos, setVideos] = useState<MovieWithFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Movie | null>(null);
  const [removedDuringModal, setRemovedDuringModal] = useState<string | null>(null);

  useEffect(() => {
    getFavoritesVideos();
  }, []);

  const handleFavoriteChange = (movieId: string, isFavorite: boolean, _favoriteId?: string) => {
    if (!isFavorite) {
      // mark to remove on modal close (do not remove immediately while modal open)
      setRemovedDuringModal(movieId);
    } else {
      // if user added favorite inside modal, clear any pending removal
      setRemovedDuringModal((prev) => (prev === movieId ? null : prev));
    }
  };

  
  const handleModalClose = () => {
    if (removedDuringModal) {
      setVideos((prev) => prev.filter((v) => v._id !== removedDuringModal));
      setRemovedDuringModal(null);
    }
    setSelectedVideo(null);
  };

  async function getFavoritesVideos() {
    try {
      const userString = localStorage.getItem('user');
      const userId = userString ? JSON.parse(userString).id : null;
      if (!userId) {
        setError('Usuario no identificado.');
        setLoading(false);
        return;
      }

      
      const favResponse = await apiClient.get<Favorite[]>(`/api/v1/favorites/user/${userId}`);
      const favorites = favResponse || [];

      if (!favorites.length) {
        setVideos([]);
        setLoading(false);
        return;
      }

      
      const movieRequests = favorites.map((fav) =>
        apiClient.get<Movie>(`/api/v1/movies/${fav.movieId}`).then((movie) => ({
          ...movie,
          favoriteId: fav._id, 
        }))
      );

      
      const movies = await Promise.all(movieRequests);

      // Save to state
      setVideos(movies);
    } catch (err: any) {
      console.error('Error al obtener videos favoritos:', err);
      setError('No se pudieron cargar los videos.');
    } finally {
      setLoading(false);
    }
  }

  /**
   * Removes a favorite from both the state and the database
   * 
   * @param {string} [favoriteId] - The ID of the favorite entry to remove
   * @param {string} [movieId] - The ID of the movie (used as fallback filter)
   * @returns {Promise<void>}
   */
  const handleRemoveFavorite = async (favoriteId?: string, movieId?: string) => {
    if (!favoriteId) {
      console.warn('No se encontró el ID del favorito.');
      return;
    }

    try {
      // Remove from database
      await apiClient.delete(`/api/v1/favorites/movie/${favoriteId}`);

      // Remove from UI (optimistic)
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
          onClose={handleModalClose}              
          onFavoriteChange={handleFavoriteChange} 
        />
      )}
    </main>
  );
};

export default FavoritesPage;
