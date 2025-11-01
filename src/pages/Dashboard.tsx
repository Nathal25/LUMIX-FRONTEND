import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.scss';
import apiClient from '../services/apiClient';
import VideoModal from '../components/VideoModal';
import { useSpeech } from '../contexts/SpeechContext';

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
 * - Skeleton loader for better UX
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

  // Accessibility: Speech Synthesis (from global context)
  const { handleSpeak } = useSpeech();

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

  /**
   * Renders skeleton loader placeholders while content is loading
   */
  const renderSkeletons = () => {
    return Array.from({ length: PAGE_STEP }).map((_, index) => (
      <div key={`skeleton-${index}`} className="video-item skeleton">
        <div className="skeleton-thumbnail"></div>
        <div className="skeleton-title"></div>
      </div>
    ));
  };

  // Layout
  return (
    <main className="dashboard-page">
      <h1 className="dashboard-title">Películas populares</h1>

      {loading ? (
        <section className="videos-grid" aria-busy="true" aria-label="Cargando videos">
          {renderSkeletons()}
        </section>
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
                  onMouseEnter={() => handleSpeak(`${video.title}. Por ${video.author}`)}
                  onFocus={() => handleSpeak(`${video.title}. Por ${video.author}`)}
                  aria-label={`Abrir reproductor para ${video.title}`}
                  title={`Abrir: ${video.title}`}
                >
                  <div className="video-thumbnail-wrapper">
                    <img className="video-thumbnail" src={video.imageUrl} alt={video.title} />
                    <div className="video-overlay">
                      <span className="play-icon">▶</span>
                    </div>
                  </div>
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
                onMouseEnter={() => handleSpeak('Cargar más películas')}
                onFocus={() => handleSpeak('Cargar más películas')}
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