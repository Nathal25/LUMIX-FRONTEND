import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import apiClient from '../services/apiClient';
import VideoModal from '../components/VideoModal';
import '../styles/MoviePage.scss';
import { useSpeech } from '../contexts/SpeechContext';


type Movie = {
  _id: string;
  title: string;
  imageUrl: string;
  videoUrl: string;
  author?: string;
  duration?: number;
  description?: string;
};

type UserData = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
};

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

const MoviePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userCommented, setUserCommented] = useState(false);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editComment, setEditComment] = useState('');
  const [editRating, setEditRating] = useState<number>(0);
  const [editHoverRating, setEditHoverRating] = useState<number | null>(null);
  const [updating, setUpdating] = useState(false);

  // Delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Accessibility: Speech Synthesis (from global context)
  const { handleSpeak } = useSpeech();

  const getCurrentUserId = (): string | null => {
    const userString = localStorage.getItem('user');
    return userString ? JSON.parse(userString).id : null;
  };

  const getReviewUserId = (review: Review): string => {
    return typeof review.userId === 'string' 
      ? review.userId 
      : review.userId._id;
  };

  const isUserReview = (review: Review): boolean => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return false;
    return getReviewUserId(review) === currentUserId;
  };

  const getUserReview = (): Review | undefined => {
    return reviews.find((r) => isUserReview(r));
  };

  const avgRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : null;

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

  const openEditModal = () => {
    const userReview = getUserReview();
    if (userReview) {
      setEditComment(userReview.comment);
      setEditRating(userReview.rating);
      setIsModalOpen(true);
    }
  };

  const closeEditModal = () => {
    setIsModalOpen(false);
    setEditComment('');
    setEditRating(0);
    setEditHoverRating(null);
  };

  const openDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

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
      
      window.alert('Reseña eliminada exitosamente.');
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

      {/* Modal de edición */}
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

      

      {/* modal de confirmacion de eliminacion */}
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