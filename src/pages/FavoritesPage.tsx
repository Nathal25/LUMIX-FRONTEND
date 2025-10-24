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
 * @property {number} [pexelsId] - Optional Pexels API identifier for the video
 * @property {string} title - Title of the movie/video
 * @property {string} imageUrl - URL of the thumbnail image
 * @property {string} videoUrl - URL of the video file
 * @property {number} [duration] - Optional duration of the video in seconds
 * @property {string} [author] - Optional author or creator of the video
 * @property {string} [description] - Optional description of the video
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
 * Represents a favorite relationship between a user and a movie.
 * 
 * @interface Favorite
 * @property {string} _id - Unique database identifier for the favorite entry
 * @property {number} userId - ID of the user who favorited the movie
 * @property {string} movieId - ID of the favorited movie
 */
interface Favorite {
  _id: string;
  userId: number;
  movieId: string;
}

/**
 * FavoritesPage Component
 * 
 * Displays the authenticated user's favorite movies in a list format.
 * Each favorite includes a thumbnail, metadata, description, and action buttons.
 * Users can preview videos in a modal or navigate to the full movie details page.
 * 
 * Features:
 * - Fetches user favorites on mount
 * - Displays movie cards with metadata
 * - Video preview modal
 * - Optimistic UI update for removing favorites
 * - Loading and error states
 * 
 * @component
 * @returns {JSX.Element} The rendered favorites page with movie list and modal
 */
export const FavoritesPage: React.FC = () => {
  const [videos, setVideos] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Movie | null>(null);

  /**
   * Fetches the user's favorite videos on component mount.
   * 
   * @effect
   */
  useEffect(() => {
    getFavoritesVideos();
  }, []);

  /**
   * Retrieves the user's favorite videos from the API.
   * 
   * Process:
   * 1. Gets user ID from localStorage
   * 2. Fetches user's favorite entries
   * 3. Fetches full movie details for each favorite
   * 4. Updates state with complete movie data
   * 
   * @async
   * @returns {Promise<void>}
   */
  async function getFavoritesVideos() {
    try {
      const userString = localStorage.getItem('user');
      const userId = userString ? JSON.parse(userString).id : null;
      if (!userId) {
        setError('Usuario no identificado.');
        setLoading(false);
        return;
      }

      // 1. Fetch user's favorites
      const favResponse = await apiClient.get<Favorite[]>(`/api/v1/favorites/user/${userId}`);
      const favorites = favResponse || [];

      if (!favorites.length) {
        setVideos([]);
        setLoading(false);
        return;
      }

      // 2. Fetch movie details for each favorite
      const movieRequests = favorites.map((fav) =>
        apiClient.get<Movie>(`/api/v1/movies/${fav.movieId}`)
      );

      // 3. Wait for all requests to complete
      const movieResponses = await Promise.all(movieRequests);

      // 4. Store movies in state
      const movies = movieResponses.map((res) => res);
      setVideos(movies);
    } catch (err: any) {
      console.error('Error al obtener videos favoritos:', err);
      setError('No se pudieron cargar los videos.');
    } finally {
      setLoading(false);
    }
  }

  /**
   * Handles the removal of a favorite video from the UI.
   * 
   * Performs an optimistic UI update by immediately removing the video
   * from the displayed list. Should be connected to an API call to persist
   * the removal on the backend.
   * 
   * @param {string} movieId - The ID of the movie to remove from favorites
   * @returns {void}
   */
  const handleRemoveFavorite = (movieId: string) => {
    // UI-only optimistic removal; adapt to API if you have favoriteId
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