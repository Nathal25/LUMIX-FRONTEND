// -----------------------------------
// -----------------------------------
// -----------------------------------
// -----------------------------------
// All here is provisional, is an example of how to fetch and display videos from backend (The preview images)
// -----------------------------------
// -----------------------------------
// -----------------------------------
// -----------------------------------
// -----------------------------------
// -----------------------------------
// -----------------------------------

import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.scss';
import apiClient from '../services/apiClient';
import VideoModal from '../components/VideoModal';

// Type of data for a movie/video
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

export const Dashboard: React.FC = () => {
  const PAGE_STEP = 12;

  const [videos, setVideos] = useState<Movie[]>([]);
  const [limit, setLimit] = useState<number>(PAGE_STEP);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Movie | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Cargar los videos cuando cambia el límite
  useEffect(() => {
    let mounted = true;

    const fetch = async () => {
      if (limit === PAGE_STEP) setLoading(true);
      else setLoadingMore(true);
      try {
        const response = await apiClient.get<Movie[]>(`/api/v1/movies/popular/${limit}`);
        if (!mounted) return;
        setVideos(response || []);
        // Si la respuesta tiene menos items que el límite solicitado, no hay más
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
                <div key={video.pexelsId || video._id} className="video-item" onClick={() => setSelectedVideo(video)}>
                  <img className="video-thumbnail" src={video.imageUrl} alt={video.title} />
                  <h3 className="video-name">{video.title}</h3>
                </div>
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