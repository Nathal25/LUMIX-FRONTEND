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

interface MoviesResponse {
  videos: Movie[];
}

export const Dashboard: React.FC = () => {
  const [videos, setVideos] = useState<MoviesResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Movie | null>(null);

  // Cargar los videos al montar el componente
  useEffect(() => {
    getVideos();
  }, []);

  // Función para traer los videos desde el backend
  async function getVideos() {
    try {
      // IMPORTANTE
      // IMPORTANTE
      // IMPORTANTE
      // IMPORTANTE
      // IMPORTANTE
      const pages: number = 3; // Se puede ajustar este número según las películas a traer
      // IMPORTANTE
      // IMPORTANTE
      // IMPORTANTE
      // IMPORTANTE  
      const response = await apiClient.get<MoviesResponse[]>(`/api/v1/movies/popular/${pages}`);
      setVideos(response);
      setLoading(false);
    } catch (err: any) {
      console.error('Error al obtener videos:', err.message);
      setError('No se pudieron cargar los videos.');
      setLoading(false);
    }
  }

  // Mostrar mensajes según el estado
  if (loading) {
    return <p className="loading-message">Cargando videos...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  // ESTO ES LO QUE HABIA ANTES
  // return (
  //   <main className="dashboard-page">
  //     <div className="dashboard-card" role="region" aria-label="Dashboard - Próximamente">
  //       <h1 className="coming-title">Próximamente</h1>
  //       <p className="coming-subtitle">
  //         Estamos preparando el dashboard. ¡Vuelve pronto para descubrir nuevas funcionalidades!
  //       </p>
  //     </div>
  //   </main>
  // );

  return (
    <main className="dashboard-page">
      <h1 className="dashboard-title">Películas populares</h1>

      <section className="videos-grid">
        {videos.length > 0 ? (
          videos && videos.map((video: any) =>
            <div key={video.pexelsId} className="video-item" onClick={() => setSelectedVideo(video)}>
              <img
                className="video-thumbnail"
                src={video.imageUrl}
                alt={video.title}
              />
              <h3 className="video-name">{video.title}</h3>
            </div>
          )
        ) : (
          <p className="no-videos">No hay videos disponibles.</p>
        )}
      </section>

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