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

// Tipo de dato para película/video
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

interface Favorite {
    _id: string;
    userId: number;
    movieId: string;
}

// 🔹 No necesitas MoviesResponse[], el endpoint devuelve un array de Movie
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

            // 🔹 1. Traer los favoritos del usuario
            const favResponse = await apiClient.get<Favorite[]>(`/api/v1/favorites/user/${userId}`);
            const favorites = favResponse;

            if (!favorites.length) {
                setVideos([]);
                setLoading(false);
                return;
            }

            // 🔹 2. Traer las películas asociadas a cada favorito
            const movieRequests = favorites.map((fav) =>
                apiClient.get<Movie>(`/api/v1/movies/${fav.movieId}`)
            );

            // 🔹 3. Esperar a que todas las peticiones terminen
            const movieResponses = await Promise.all(movieRequests);

            // 🔹 4. Guardar las películas en el estado
            const movies = movieResponses.map((res) => res);
            setVideos(movies);
        } catch (err: any) {
            console.error('Error al obtener videos favoritos:', err.message);
            setError('No se pudieron cargar los videos.');
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <p className="loading-message">Cargando tus favoritos...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <main className="favorites-page">
            <h1 className="favorites-title">Tus videos favoritos 💜</h1>

            <section className="videos-grid">
                {videos.length > 0 ? (
                    videos.map((video) => (
                        <div
                            key={video._id}
                            className="video-card"
                            onClick={() => setSelectedVideo(video)}
                        >
                            <img
                                src={video.imageUrl}
                                alt={video.title}
                                className="video-thumbnail"
                            />
                            <div className="video-info">
                                <h3>{video.title}</h3>
                                <p>{video.author}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="no-videos">Aún no tienes videos favoritos.</p>
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

export default FavoritesPage;
