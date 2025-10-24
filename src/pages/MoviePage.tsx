import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import apiClient from '../services/apiClient';
import '../styles/MoviePage.scss';

/**
 * Represents a movie/video object with metadata.
 * 
 * @interface Movie
 * @property {string} _id - Unique database identifier
 * @property {string} title - Title of the movie
 * @property {string} imageUrl - URL of the movie poster/thumbnail
 * @property {string} videoUrl - URL of the video file
 * @property {string} [author] - Optional author or creator of the movie
 * @property {number} [duration] - Optional duration of the movie in seconds
 * @property {string} [description] - Optional description of the movie
 */
type Movie = {
  _id: string;
  title: string;
  imageUrl: string;
  videoUrl: string;
  author?: string;
  duration?: number;
  description?: string;
};

/**
 * Represents a user comment on a movie.
 * 
 * @interface Comment
 * @property {string} _id - Unique database identifier for the comment
 * @property {string} userId - ID of the user who created the comment
 * @property {string} [userName] - Optional display name of the commenter
 * @property {string} text - Content of the comment
 * @property {string} createdAt - ISO timestamp of when the comment was created
 */
type Comment = {
  _id: string;
  userId: string;
  userName?: string;
  text: string;
  createdAt: string;
};

/**
 * MoviePage Component
 * 
 * Displays detailed information about a specific movie including:
 * - Movie poster, title, author, duration, and description
 * - Star rating system (1-5 stars) with average rating display
 * - Comments section where users can read and add comments
 * - Navigation controls to return to previous page
 * 
 * Features:
 * - Fetches movie details, comments, and ratings on mount
 * - Interactive star rating with hover effects
 * - Real-time comment submission
 * - Optimistic UI updates for ratings
 * - Loading and error states
 * 
 * @component
 * @returns {JSX.Element} The rendered movie details page
 */
const MoviePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Rating state
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [ratingsCount, setRatingsCount] = useState<number>(0);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  /**
   * Fetches movie details, comments, and rating information on component mount.
   * 
   * Makes three parallel API calls:
   * 1. Fetches movie metadata
   * 2. Fetches movie comments
   * 3. Fetches rating statistics (average, count, user's rating)
   * 
   * @effect
   * @listens id - Triggers refetch when movie ID changes
   */
  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setLoading(true);
    setError(null);

    const fetchMovie = async () => {
      try {
        const res = await apiClient.get<Movie>(`/api/v1/movies/${id}`);
        if (!mounted) return;
        setMovie(res);
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setError('No se pudo cargar la película.');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    const fetchComments = async () => {
      try {
        const res = await apiClient.get<Comment[]>(`/api/v1/movies/${id}/comments`);
        if (!mounted) return;
        setComments(res || []);
      } catch (err) {
        console.warn('no comments', err);
      }
    };

    const fetchRating = async () => {
      try {
        const r = await apiClient.get<{ average: number; count: number; userRating?: number }>(
          `/api/v1/movies/${id}/rating`
        );
        if (!mounted) return;
        setAvgRating(r.average ?? null);
        setRatingsCount(r.count ?? 0);
        setUserRating(typeof r.userRating === 'number' ? r.userRating : null);
      } catch (err) {
        // no-op: rating optional
      }
    };

    fetchMovie();
    fetchComments();
    fetchRating();

    return () => {
      mounted = false;
    };
  }, [id]);

  /**
   * Handles the submission of a new comment.
   * 
   * Validates comment text, retrieves user info from localStorage,
   * posts the comment to the API, and updates the comments list
   * with the newly created comment.
   * 
   * @async
   * @param {React.FormEvent} e - The form submission event
   * @returns {Promise<void>}
   */
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !id) return;
    setSubmitting(true);
    try {
      const userString = localStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : null;
      const payload = { text: newComment, userId: user?.id };
      const created = await apiClient.post<Comment>(`/api/v1/movies/${id}/comments`, payload);
      setComments((s) => [created, ...s]);
      setNewComment('');
    } catch (err) {
      console.error('comment error', err);
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Submits a user rating (1-5 stars) for the movie.
   * 
   * Validates user authentication, posts the rating to the API,
   * and updates the local state with the new average rating,
   * rating count, and user's rating. Uses optimistic UI updates.
   * 
   * @async
   * @param {number} value - The rating value (1-5 stars)
   * @returns {Promise<void>}
   */
  const submitRating = async (value: number) => {
    if (!id) return;
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    if (!user?.id) {
      // Optionally redirect to login
      window.alert('Debes iniciar sesión para calificar.');
      return;
    }

    setRatingSubmitting(true);
    try {
      const res = await apiClient.post<{ average: number; count: number; userRating?: number }>(
        `/api/v1/movies/${id}/rating`,
        { userId: user.id, rating: value }
      );
      // Update local state from response (optimistic)
      setAvgRating(res.average ?? null);
      setRatingsCount(res.count ?? ratingsCount);
      setUserRating(typeof res.userRating === 'number' ? res.userRating : value);
    } catch (err) {
      console.error('rating error', err);
    } finally {
      setRatingSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <main className="movie-page">
        <div className="loading-wrapper">
          <div className="spinner" />
          <p className="loading-message">Cargando película…</p>
        </div>
      </main>
    );
  }

  // Error state
  if (error || !movie) {
    return (
      <main className="movie-page">
        <div className="movie-error">
          <p>{error ?? 'Película no encontrada.'}</p>
          <button className="btn-back" onClick={() => navigate(-1)}>Volver</button>
        </div>
      </main>
    );
  }

  return (
    <main className="movie-page">
      <div className="movie-hero">
        <img className="movie-poster" src={movie.imageUrl} alt={movie.title} />
        <div className="movie-meta">
          <h1 className="movie-title">{movie.title}</h1>
          <p className="movie-author">{movie.author}</p>
          <p className="movie-duration">{movie.duration ? `${Math.floor(movie.duration/60)}m ${movie.duration%60}s` : ''}</p>
          <p className="movie-desc">{movie.description}</p>

          <div className="movie-actions">
            {/*<a className="btn-primary" href={movie.videoUrl} target="_blank" rel="noreferrer">Ver completa</a>*/}
            <a className="btn-primary">Ver completa</a>
            <button className="btn-secondary" onClick={() => navigate(-1)}>Volver</button>
          </div>

          {/* Rating UI */}
          <div className="movie-rating" aria-label="Calificación de la película">
            <div className="stars" role="radiogroup" aria-label="Calificar de 1 a 5 estrellas">
              {[1,2,3,4,5].map((n) => {
                const filled = hoverRating ? n <= hoverRating : userRating ? n <= userRating : avgRating ? n <= Math.round(avgRating) : false;
                return (
                  <button
                    key={n}
                    type="button"
                    className={`star ${filled ? 'filled' : ''}`}
                    onMouseEnter={() => setHoverRating(n)}
                    onMouseLeave={() => setHoverRating(null)}
                    onFocus={() => setHoverRating(n)}
                    onBlur={() => setHoverRating(null)}
                    onClick={() => submitRating(n)}
                    disabled={ratingSubmitting}
                    aria-label={`${n} estrella${n>1?'s':''}`}
                    aria-checked={userRating === n}
                    role="radio"
                    title={`${n} ${n===1?'estrella':'estrellas'}`}
                  >
                    ★
                  </button>
                );
              })}
            </div>

            <div className="rating-meta">
              {avgRating !== null ? (
                <span className="avg-text">{avgRating.toFixed(1)} / 5 · {ratingsCount} voto{ratingsCount === 1 ? '' : 's'}</span>
              ) : (
                <span className="avg-text">Sin calificaciones</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <section className="movie-comments">
        <h2>Comentarios</h2>

        <form className="comment-form" onSubmit={handleAddComment}>
          <textarea
            placeholder="Escribe tu comentario..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            required
          />
          <div className="comment-actions">
            <button type="submit" className="btn-comment" disabled={submitting}>
              {submitting ? 'Enviando…' : 'Agregar comentario'}
            </button>
          </div>
        </form>

        <ul className="comments-list">
          {comments.length === 0 && <li className="no-comments">Sé el primero en comentar.</li>}
          {comments.map((c) => (
            <li key={c._id} className="comment-item">
              <div className="comment-head">
                <strong className="comment-author">{c.userName ?? 'Usuario'}</strong>
                <time className="comment-time">{new Date(c.createdAt).toLocaleString()}</time>
              </div>
              <p className="comment-text">{c.text}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
};

export default MoviePage;