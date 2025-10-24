import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.scss';
import apiClient from '../services/apiClient';
import VideoModal from '../components/VideoModal';

/**
 * Represents a movie/video object with metadata.
 * 
 * @interface Movie
 * @property {string} _id - Unique database identifier
 * @property {number} pexelsId - Pexels API identifier for the video
 * @property {string} title - Title of the movie/video
 * @property {string} imageUrl - URL of the thumbnail image
 * @property {string} videoUrl - URL of the video file
 * @property {number} duration - Duration of the video in seconds
 * @property {string} author - Author or creator of the video
 * @property {string} [description] - Optional description of the video
 */
interface Movie {
  _id: string;
  pexelsId: number;
  title: string;
  imageUrl: string;
  videoUrl: string;
  duration: number;
  author: string;
  description?: string;
}

/**
 * Dashboard Component
 * 
 * Displays a grid of popular movies/videos with infinite scroll loading capability.
 * Allows users to view video details in a modal when clicking on a video thumbnail.
 * 
 * Features:
 * - Lazy loading with "Load more" button
 * - Video modal for playback
 * - Loading and error states
 * - Responsive grid layout
 * 
 * @component
 * @returns {JSX.Element} The rendered dashboard with video grid and modal
 */
export const Dashboard: React.FC = () => {
  /** Number of videos to load per page/request */
  const PAGE_STEP = 12;

  const [videos, setVideos] = useState<Movie[]>([]);
  const [limit, setLimit] = useState<number>(PAGE_STEP);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Movie | null>(null);
  const [hasMore, setHasMore] = useState(true);

  /**
   * Fetches popular movies from the API when the limit changes.
   * 
   * Handles initial loading and pagination. Updates the videos state
   * and determines if more content is available based on response length.
   * 
   * @effect
   * @listens limit - Triggers fetch when limit value changes
   */
  useEffect(() => {
    let mounted = true;

    const fetch = async () => {
      if (limit === PAGE_STEP) setLoading(true);
      else setLoadingMore(true);
      try {
        const response = await apiClient.get<Movie[]>(`/api/v1/movies/popular/${limit}`);
        if (!mounted) return;
        setVideos(response || []);
        // If response has fewer items than requested limit, no more content available
        setHasMore(!(response && response.length < limit));
        setError(null);
      } catch (err: any) {
        console.error('Error al obtener videos:', err);
        if (!mounted) return;
        setError('No se pudieron cargar los videos.');
      } finally {
        if (!mounted) return;
        setLoading(false);
        setLoadingMore(false);
      }
    };

    fetch();
    return () => {
      mounted = false;
    };
  }, [limit]);

  /**
   * Handles the "Load more" button click.
   * 
   * Increases the limit to fetch additional videos.
   * Prevents multiple simultaneous load requests.
   * 
   * @returns {void}
   */
  const handleLoadMore = () => {
    if (loadingMore) return;
    setLimit((prev) => prev + PAGE_STEP);
  };

  // Layout
  return (
    <main className="dashboard-page">
      <h1 className="dashboard-title">Películas populares</h1>

      {loading ? (
        <div className="loading-wrapper" role="status" aria-live="polite" aria-label="Cargando videos">
          <div className="spinner" aria-hidden="true" />
          <p className="loading-message">Cargando videos...</p>
        </div>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <>
          <section className="videos-grid">
            {videos.length > 0 ? (
              videos.map((video) => (
                // Use a semantic button so items are keyboard-focusable and activatable
                <button
                  key={video.pexelsId || video._id}
                  type="button"
                  className="video-item"
                  onClick={() => setSelectedVideo(video)}
                  aria-label={`Abrir reproductor para ${video.title}`}
                  title={`Abrir: ${video.title}`}
                >
                  <img className="video-thumbnail" src={video.imageUrl} alt={video.title} />
                  <h3 className="video-name">{video.title}</h3>
                </button>
              ))
            ) : (
              <p className="no-videos">No hay videos disponibles.</p>
            )}
          </section>

          {/* Load more */}
          <div className="load-more-wrap" aria-live="polite">
            {hasMore ? (
              <button
                className="btn-load-more"
                onClick={handleLoadMore}
                disabled={loadingMore}
                title="Cargar más películas"
              >
                {loadingMore ? 'Cargando...' : 'Cargar más'}
              </button>
            ) : (
              <p className="no-more">No hay más películas.</p>
            )}
          </div>
        </>
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

export default Dashboard;