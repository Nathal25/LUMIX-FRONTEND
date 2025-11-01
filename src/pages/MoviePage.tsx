import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import apiClient from '../services/apiClient';
import VideoModal from '../components/VideoModal';
import '../styles/MoviePage.scss';
import { useSpeech } from '../contexts/SpeechContext';
import { ToastContainer, toast, Bounce } from 'react-toastify';

/**
 * Movie entity type definition.
 * @typedef {Object} Movie
 * @property {string} _id - Unique identifier for the movie.
 * @property {string} title - Title of the movie.
 * @property {string} imageUrl - URL of the movie poster image.
 * @property {string} videoUrl - URL of the movie video file.
 * @property {string} [author] - Author or director of the movie.
 * @property {number} [duration] - Duration of the movie in seconds.
 * @property {string} [description] - Brief description of the movie.
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
 * User data type definition.
 * @typedef {Object} UserData
 * @property {string} _id - Unique identifier for the user.
 * @property {string} [firstName] - First name of the user.
 * @property {string} [lastName] - Last name of the user.
 * @property {string} email - Email address of the user.
 */
type UserData = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
};

/**
 * Review entity type definition.
 * @typedef {Object} Review
 * @property {string} _id - Unique identifier for the review.
 * @property {string | UserData} userId - User ID or populated user object.
 * @property {string} [userName] - Display name of the user who wrote the review.
 * @property {string} movieId - ID of the movie being reviewed.
 * @property {string} comment - Text content of the review.
 * @property {number} rating - Star rating from 1 to 5.
 * @property {string} [createdAt] - ISO timestamp of review creation.
 * @property {string} [updatedAt] - ISO timestamp of last review update.
 */
type Review = {
  _id: string;
  userId: string | UserData; 
  userName?: string; 
  movieId: string;   
  comment: string;
  rating: number;
  createdAt?: string;
  updatedAt?: string;
};

/**
 * Movie detail page component.
 * 
 * Displays comprehensive information about a specific movie including:
 * - Movie poster, title, author, duration, and description
 * - Average rating and review count
 * - Full video player via modal
 * - User reviews section with CRUD operations
 * - Accessibility features via speech synthesis
 * 
 * Users can:
 * - View the complete movie in a video modal
 * - Add a review with rating (if not already reviewed)
 * - Edit or delete their own review
 * - View all reviews from other users
 * 
 * @component
 * @example
 * ```tsx
 * // Accessed via route: /movies/:id
 * <MoviePage />
 * ```
 * 
 * @returns {JSX.Element} The movie detail page component.
 */
const MoviePage: React.FC = () => {
  /**
   * Movie ID from URL parameters.
   * @type {string | undefined}
   */
  const { id } = useParams<{ id: string }>();
  
  /**
   * Navigation hook for programmatic routing.
   * @type {Function}
   */
  const navigate = useNavigate();
  
  /**
   * Toast notification function.
   * @function notify
   * @param {string} m - Message to display in toast.
   */
  const notify = (m:string) => toast(m);
  
  /**
   * State for the current movie data.
   * @type {[Movie | null, Function]}
   */
  const [movie, setMovie] = useState<Movie | null>(null);
  
  /**
   * State for loading status.
   * @type {[boolean, Function]}
   */
  const [loading, setLoading] = useState(true);
  
  /**
   * State for video modal visibility.
   * @type {[boolean, Function]}
   */
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  
  /**
   * State for error messages.
   * @type {[string | null, Function]}
   */
  const [error, setError] = useState<string | null>(null);
  
  /**
   * State indicating if current user has already commented.
   * @type {[boolean, Function]}
   */
  const [userCommented, setUserCommented] = useState(false);

  /**
   * State for the list of all reviews.
   * @type {[Review[], Function]}
   */
  const [reviews, setReviews] = useState<Review[]>([]);
  
  /**
   * State for new comment text input.
   * @type {[string, Function]}
   */
  const [newComment, setNewComment] = useState('');
  
  /**
   * State for new review rating (1-5 stars).
   * @type {[number, Function]}
   */
  const [newRating, setNewRating] = useState<number>(0);
  
  /**
   * State for hover effect on rating stars.
   * @type {[number | null, Function]}
   */
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  
  /**
   * State indicating if a review submission is in progress.
   * @type {[boolean, Function]}
   */
  const [submitting, setSubmitting] = useState(false);

  /**
   * State for edit modal visibility.
   * @type {[boolean, Function]}
   */
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  /**
   * State for edit comment text.
   * @type {[string, Function]}
   */
  const [editComment, setEditComment] = useState('');
  
  /**
   * State for edit review rating.
   * @type {[number, Function]}
   */
  const [editRating, setEditRating] = useState<number>(0);
  
  /**
   * State for hover effect on edit rating stars.
   * @type {[number | null, Function]}
   */
  const [editHoverRating, setEditHoverRating] = useState<number | null>(null);
  
  /**
   * State indicating if a review update is in progress.
   * @type {[boolean, Function]}
   */
  const [updating, setUpdating] = useState(false);

  /**
   * State for delete confirmation modal visibility.
   * @type {[boolean, Function]}
   */
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  /**
   * State indicating if a review deletion is in progress.
   * @type {[boolean, Function]}
   */
  const [deleting, setDeleting] = useState(false);

  /**
   * Speech synthesis context for accessibility features.
   * @type {Object}
   */
  const { handleSpeak } = useSpeech();

  /**
   * Retrieves the current user's ID from localStorage.
   * 
   * @function getCurrentUserId
   * @returns {string | null} User ID or null if not logged in.
   */
  const getCurrentUserId = (): string | null => {
    const userString = localStorage.getItem('user');
    return userString ? JSON.parse(userString).id : null;
  };

  /**
   * Extracts the user ID from a review object.
   * Handles both string userId and populated UserData object.
   * 
   * @function getReviewUserId
   * @param {Review} review - The review object.
   * @returns {string} The user ID.
   */
  const getReviewUserId = (review: Review): string => {
    return typeof review.userId === 'string' 
      ? review.userId 
      : review.userId._id;
  };

  /**
   * Checks if a review belongs to the current user.
   * 
   * @function isUserReview
   * @param {Review} review - The review to check.
   * @returns {boolean} True if the review belongs to current user.
   */
  const isUserReview = (review: Review): boolean => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return false;
    return getReviewUserId(review) === currentUserId;
  };

  /**
   * Retrieves the current user's review if it exists.
   * 
   * @function getUserReview
   * @returns {Review | undefined} The user's review or undefined.
   */
  const getUserReview = (): Review | undefined => {
    return reviews.find((r) => isUserReview(r));
  };

  /**
   * Calculates the average rating from all reviews.
   * @type {number | null}
   */
  const avgRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : null;

  /**
   * Effect hook to fetch movie data and reviews on component mount.
   * Runs when the movie ID changes.
   */
  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setLoading(true);
    setError(null);

    /**
     * Fetches movie details from the API.
     * @async
     * @function fetchMovie
     */
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

    /**
     * Fetches all reviews for the current movie.
     * Also checks if current user has already reviewed.
     * @async
     * @function fetchReviews
     */
    const fetchReviews = async () => {
      try {
        const res = await apiClient.get<Review[]>(`/api/v1/reviews/movie/${id}/`);
        if (!mounted) return;
        setReviews(res || []);

        const currentUserId = getCurrentUserId();
        if (currentUserId && res.length > 0) {
          const hasReviewed = res.some((r) => getReviewUserId(r) === currentUserId);
          setUserCommented(hasReviewed);
        }
      } catch (err) {
        console.warn('no reviews', err);
      }
    };

    fetchMovie();
    fetchReviews();

    return () => {
      mounted = false;
    };
  }, [id]);

  /**
   * Handles the submission of a new review.
   * Validates user authentication, rating selection, and comment content.
   * 
   * @async
   * @function handleAddReview
   * @param {React.FormEvent} e - Form submission event.
   * @returns {Promise<void>}
   */
  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !id) return;

    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    
    if (!user?.id) {
      window.alert('Debes iniciar sesión para dejar una reseña.');
      return;
    }

    if (newRating === 0) {
      window.alert('Por favor selecciona una calificación (1-5 estrellas).');
      return;
    }

    setSubmitting(true);
    try {
      const payload = { 
        userId: user.id,
        movieId: id,
        comment: newComment,
        rating: newRating
      };

      const created = await apiClient.post<Review>(`/api/v1/reviews`, payload);
      
      setReviews((prev) => [created, ...prev]);
      setUserCommented(true);
      setNewComment('');
      setNewRating(0);
      notify('Review creado exitosamente.');
    } catch (err: any) {
      console.error('review error', err);
      if (err?.response?.status === 409) {
        window.alert('Ya has reseñado esta película.');
        setUserCommented(true);
      } else if (err?.response?.status === 400) {
        window.alert('Faltan campos obligatorios. Asegúrate de agregar un comentario y una calificación.');
      } else {
        window.alert('Error al crear la reseña. Inténtalo de nuevo.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Opens the edit modal and populates it with current review data.
   * @function openEditModal
   */
  const openEditModal = () => {
    const userReview = getUserReview();
    if (userReview) {
      setEditComment(userReview.comment);
      setEditRating(userReview.rating);
      setIsModalOpen(true);
    }
  };

  /**
   * Closes the edit modal and resets form fields.
   * @function closeEditModal
   */
  const closeEditModal = () => {
    setIsModalOpen(false);
    setEditComment('');
    setEditRating(0);
    setEditHoverRating(null);
  };

  /**
   * Opens the delete confirmation modal.
   * @function openDeleteModal
   */
  const openDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };

  /**
   * Closes the delete confirmation modal.
   * @function closeDeleteModal
   */
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  /**
   * Handles the deletion of the user's review.
   * Validates user authentication and sends delete request to API.
   * 
   * @async
   * @function handleDeleteReview
   * @returns {Promise<void>}
   */
  const handleDeleteReview = async () => {
    const userReview = getUserReview();
    if (!userReview) return;

    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    
    if (!user?.id) {
      window.alert('Debes iniciar sesión para eliminar una reseña.');
      return;
    }

    setDeleting(true);
    try {
      await apiClient.delete(`/api/v1/reviews/${userReview._id}`);
      
      setReviews((prev) => prev.filter((r) => r._id !== userReview._id));
      setUserCommented(false);
      closeDeleteModal();
      
      notify('Comentario eliminado exitosamente.');
    } catch (err: any) {
      console.error('delete review error', err);
      if (err?.response?.status === 404) {
        window.alert('No se encontró tu reseña.');
      } else {
        window.alert('Error al eliminar la reseña. Inténtalo de nuevo.');
      }
    } finally {
      setDeleting(false);
    }
  };

  /**
   * Handles the update of an existing review.
   * Validates user authentication, rating, and comment content.
   * 
   * @async
   * @function updateReview
   * @param {React.FormEvent} e - Form submission event.
   * @returns {Promise<void>}
   */
  const updateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editComment.trim() || !id) return;

    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    
    if (!user?.id) {
      window.alert('Debes iniciar sesión para editar una reseña.');
      return;
    }

    if (editRating === 0) {
      window.alert('Por favor selecciona una calificación (1-5 estrellas).');
      return;
    }

    setUpdating(true);
    try {
      const payload = { 
        userId: user.id,
        movieId: id,
        comment: editComment,
        rating: editRating
      };

      const updated = await apiClient.put<Review>(`/api/v1/reviews`, payload);

      notify('Comentario actualizado exitosamente.');

      setReviews((prev) => 
        prev.map((r) => 
          isUserReview(r) ? updated : r
        )
      );
      
      closeEditModal();
      
    } catch (err: any) {
      console.error('update review error', err);
      if (err?.response?.status === 404) {
        window.alert('No se encontró tu reseña.');
      } else if (err?.response?.status === 400) {
        window.alert('Faltan campos obligatorios.');
      } else {
        window.alert('Error al actualizar la reseña. Inténtalo de nuevo.');
      }
    } finally {
      setUpdating(false);
    }
  };

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

  if (error || !movie) {
    return (
      <main className="movie-page">
        <div className="movie-error">
          <p>{error ?? 'Película no encontrada.'}</p>
          <button className="btn-back" onClick={() => navigate('/')}>Volver</button>
        </div>
      </main>
    );
  }

  return (
    <main className="movie-page">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Bounce}
      />
      <div className="movie-hero">
        <img className="movie-poster" src={movie.imageUrl} alt={movie.title} />
        <div className="movie-meta">
          <h1 className="movie-title">{movie.title}</h1>
          <p className="movie-author">{movie.author}</p>
          <p className="movie-duration">{movie.duration ? `${Math.floor(movie.duration/60)}m ${movie.duration%60}s` : ''}</p>
          <p className="movie-desc">{movie.description}</p>

          <div className="movie-actions">
            <button 
              className="btn-primary"
              onClick={() => setIsVideoModalOpen(true)}
              onMouseEnter={() => handleSpeak('Ver película completa')}
              onFocus={() => handleSpeak('Ver película completa')}
            >
              Ver completa
            </button>
            <button 
              className="btn-secondary" 
              onClick={() => navigate(-1)}
              onMouseEnter={() => handleSpeak('Volver')}
              onFocus={() => handleSpeak('Volver')}
            >
              Volver
            </button>
            {isVideoModalOpen && (
              <VideoModal
                videoUrl={movie.videoUrl}
                title={movie.title}
                movieId={movie._id}
                onClose={() => setIsVideoModalOpen(false)}
              />
            )}
          </div>

          <div className="movie-rating" aria-label="Calificación promedio de la película">
            <div className="stars">
              {[1,2,3,4,5].map((n) => {
                const filled = avgRating ? n <= Math.round(avgRating) : false;
                return (
                  <span
                    key={n}
                    className={`star ${filled ? 'filled' : ''}`}
                    aria-hidden="true"
                  >
                    ★
                  </span>
                );
              })}
            </div>

            <div className="rating-meta">
              {avgRating !== null ? (
                <span className="avg-text">
                  {avgRating.toFixed(1)} / 5 · {reviews.length} reseña{reviews.length === 1 ? '' : 's'}
                </span>
              ) : (
                <span className="avg-text">Sin reseñas aún</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <section className="movie-comments">
        <h2>Reseñas y Comentarios</h2>

        {!userCommented ? (
          <form className="comment-form" onSubmit={handleAddReview}>
            <div className="rating-input">
              <label htmlFor="rating-stars">Tu calificación: {newRating > 0 ? `${newRating}/5` : '(selecciona una)'}</label>
              <div className="stars" role="radiogroup" aria-label="Calificar de 1 a 5 estrellas" id="rating-stars">
                {[1,2,3,4,5].map((n) => {
                  const filled = hoverRating ? n <= hoverRating : n <= newRating;
                  return (
                    <button
                      key={n}
                      type="button"
                      className={`star ${filled ? 'filled' : ''}`}
                      onMouseEnter={() => {
                        setHoverRating(n);
                        handleSpeak(`${n} ${n === 1 ? 'estrella' : 'estrellas'}`);
                      }}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setNewRating(n)}
                      onFocus={() => handleSpeak(`${n} ${n === 1 ? 'estrella' : 'estrellas'}`)}
                      aria-label={`${n} estrella${n>1?'s':''}`}
                      title={`${n} ${n===1?'estrella':'estrellas'}`}
                    >
                      ★
                    </button>
                  );
                })}
              </div>
            </div>

            <textarea
              placeholder="Escribe tu comentario..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              required
              minLength={3}
              maxLength={1000}
            />
            <div className="comment-actions">
              <button 
                type="submit" 
                className="btn-comment" 
                disabled={submitting}
                onMouseEnter={() => handleSpeak('Publicar reseña')}
                onFocus={() => handleSpeak('Publicar reseña')}
              >
                {submitting ? 'Enviando…' : 'Publicar reseña'}
              </button>
            </div>
          </form>
        ) : (
          <div className="already-reviewed-message">
            <p>Ya has dejado una reseña para esta película</p>
            <div className="button-group">
              <button 
                className="btn-edit" 
                onClick={openEditModal}
                onMouseEnter={() => handleSpeak('Editar mi reseña')}
                onFocus={() => handleSpeak('Editar mi reseña')}
              >
                Editar mi reseña
              </button>
              <button 
                className="btn-delete" 
                onClick={openDeleteModal}
                onMouseEnter={() => handleSpeak('Eliminar mi reseña')}
                onFocus={() => handleSpeak('Eliminar mi reseña')}
              >
                Eliminar mi reseña
              </button>
            </div>
          </div>
        )}

        <ul className="comments-list">
          {reviews.length === 0 && <li className="no-comments">Sé el primero en dejar una reseña.</li>}
          {reviews.map((review) => {
            const userName = typeof review.userId === 'string' 
              ? 'Usuario' 
              : `${review.userId.firstName || ''} ${review.userId.lastName || ''}`.trim() || review.userId.email;

            const isMyReview = isUserReview(review);

            return (
              <li key={review._id} className={`comment-item ${isMyReview ? 'my-review' : ''}`}>
                <div className="comment-head">
                  <strong className="comment-author">
                    {userName}
                    {isMyReview && <span className="badge-you"> (Tú)</span>}
                  </strong>
                  <div className="review-rating">
                    {[1,2,3,4,5].map((n) => (
                      <span key={n} className={`star-small ${n <= review.rating ? 'filled' : ''}`}>
                        ★
                      </span>
                    ))}
                    <span className="rating-number">{review.rating}/5</span>
                  </div>
                  <time className="comment-time">
                    {review.createdAt ? new Date(review.createdAt).toLocaleString() : ''}
                  </time>
                </div>
                <p className="comment-text">{review.comment}</p>
                {isMyReview && (
                  <div className="inline-buttons-group">
                    <button className="btn-edit-inline" onClick={openEditModal}>
                      Editar
                    </button>
                    <button className="btn-delete-inline" onClick={openDeleteModal}>
                      Eliminar
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* Edit modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar tu reseña</h3>
              <button className="btn-close" onClick={closeEditModal} aria-label="Cerrar modal">
                ✕
              </button>
            </div>
            
            <form className="modal-form" onSubmit={updateReview}>
              <div className="rating-input">
                <label htmlFor="edit-rating-stars">
                  Tu calificación: {editRating > 0 ? `${editRating}/5` : '(selecciona una)'}
                </label>
                <div className="stars" role="radiogroup" aria-label="Calificar de 1 a 5 estrellas" id="edit-rating-stars">
                  {[1,2,3,4,5].map((n) => {
                    const filled = editHoverRating ? n <= editHoverRating : n <= editRating;
                    return (
                      <button
                        key={n}
                        type="button"
                        className={`star ${filled ? 'filled' : ''}`}
                        onMouseEnter={() => setEditHoverRating(n)}
                        onMouseLeave={() => setEditHoverRating(null)}
                        onClick={() => setEditRating(n)}
                        aria-label={`${n} estrella${n>1?'s':''}`}
                        title={`${n} ${n===1?'estrella':'estrellas'}`}
                      >
                        ★
                      </button>
                    );
                  })}
                </div>
              </div>

              <textarea
                placeholder="Escribe tu comentario..."
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                rows={4}
                required
                minLength={3}
                maxLength={1000}
              />

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={closeEditModal}
                  disabled={updating}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-save" 
                  disabled={updating}
                >
                  {updating ? 'Guardando…' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {isDeleteModalOpen && (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div className="modal-content modal-delete" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Eliminar reseña</h3>
              <button className="btn-close" onClick={closeDeleteModal} aria-label="Cerrar modal">
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <p className="delete-warning">
                ¿Estás seguro de que deseas eliminar tu reseña? Esta acción no se puede deshacer.
              </p>
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                className="btn-cancel" 
                onClick={closeDeleteModal}
                disabled={deleting}
              >
                Cancelar
              </button>
              <button 
                type="button" 
                className="btn-delete-confirm" 
                onClick={handleDeleteReview}
                disabled={deleting}
              >
                {deleting ? 'Eliminando…' : 'Eliminar reseña'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default MoviePage;