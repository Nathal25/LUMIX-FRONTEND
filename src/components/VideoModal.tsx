// import React, { useRef, useState, useEffect } from 'react';
// import '../styles/VideoModal.scss';
// import { FaPlay, FaPause, FaForward, FaBackward, FaExpand, FaClosedCaptioning, FaHeart } from 'react-icons/fa';
// import apiClient from '../services/apiClient';
// import { useNavigate } from 'react-router';

// /**
//  * Properties for the VideoModal component.
//  * 
//  * @interface VideoModalProps
//  * @property {string} videoUrl - URL of the video file to play
//  * @property {string} title - Title of the video/movie
//  * @property {string} movieId - Unique identifier of the movie in the database
//  * @property {() => void} onClose - Callback function to close the modal
//  */
// interface VideoModalProps {
//   videoUrl: string;
//   title: string;
//   movieId: string;
//   onClose: () => void;
//   onFavoriteChange?: (movieId: string, isFavorite: boolean, favoriteId?: string) => void; // NEW optional callback
// }

// /**
//  * Represents a favorite movie entry in the database.
//  * 
//  * @interface Favorite
//  * @property {string} userId - ID of the user who favorited the movie
//  * @property {string} movieId - ID of the favorited movie
//  * @property {string} _id - Unique identifier for the favorite entry
//  * @property {string} createdAt - ISO timestamp when the favorite was created
//  * @property {string} updatedAt - ISO timestamp when the favorite was last updated
//  */
// interface Favorite {
//   userId: string;
//   movieId: string;
//   _id: string;
//   createdAt: string;
//   updatedAt: string;
// }

// /**
//  * Formats a time value in seconds to MM:SS format.
//  * 
//  * @param {number} s - Time in seconds to format
//  * @returns {string} Formatted time string in MM:SS format (e.g., "3:45")
//  * @example
//  * formatTime(125) // returns "2:05"
//  * formatTime(65) // returns "1:05"
//  */
// const formatTime = (s: number) => {
//   if (!isFinite(s)) return '0:00';
//   const minutes = Math.floor(s / 60);
//   const seconds = Math.floor(s % 60).toString().padStart(2, '0');
//   return `${minutes}:${seconds}`;
// };

// /**
//  * VideoModal Component
//  * 
//  * A full-featured video player modal with custom controls, keyboard shortcuts,
//  * and favorite functionality. Displays a video in an overlay with play/pause,
//  * seek, fullscreen, captions, and favorite controls.
//  * 
//  * Features:
//  * - Custom video controls (play/pause, forward/backward, fullscreen)
//  * - Keyboard shortcuts (Space/K: play/pause, F: favorite, arrows: seek, etc.)
//  * - Progress bar with click-to-seek functionality
//  * - Favorite toggle with backend synchronization
//  * - Request Animation Frame (RAF) for smooth progress updates
//  * - Loading state with spinner
//  * - Captions support
//  * - Link to detailed movie page
//  * 
//  * Keyboard Shortcuts:
//  * - Space/K: Play/Pause
//  * - F: Toggle Favorite
//  * - ←/→: Seek backward/forward 10 seconds
//  * - J/L: Seek backward/forward 10 seconds (YouTube-style)
//  * - I: Go to movie details page
//  * - C: Toggle captions
//  * - Esc: Close modal
//  * 
//  * @component
//  * @param {VideoModalProps} props - Component properties
//  * @returns {JSX.Element} The rendered video modal with controls
//  */
// const VideoModal: React.FC<VideoModalProps> = ({ videoUrl, title, movieId, onClose, onFavoriteChange }) => {
//   const videoRef = useRef<HTMLVideoElement | null>(null);
//   const progressRef = useRef<HTMLDivElement | null>(null);
//   const rafRef = useRef<number | null>(null);
//   const navigate = useNavigate();

//   const [isPlaying, setIsPlaying] = useState(true);
//   const [isFavorite, setIsFavorite] = useState(false);
//   const [favoriteId, setFavoriteId] = useState<string | null>(null);
//   const [current, setCurrent] = useState(0);
//   const [duration, setDuration] = useState<number>(0);
//   const [loadingPoster, setLoadingPoster] = useState(true);

//   // Control de subtítulos (visible u oculto)
//   const [captionsEnabled, setCaptionsEnabled] = useState(false);

//   // Estado para subtítulos generados dinámicamente
//   const [subtitleUrl, setSubtitleUrl] = useState<string | null>(null);

//   const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
//   const [selectedSubtitle, setSelectedSubtitle] = useState<string | null>(null); // "es", "en" o null
//   const [subtitleUrls, setSubtitleUrls] = useState<{ es?: string; en?: string }>({});

//   /**
//    * Fetches or generates subtitles for the current movie from the backend.
//    * Converts the text into a VTT blob and creates a temporary URL for the <track>.
//    */
//   useEffect(() => {
//     const fetchSubtitles = async () => {
//       try {
//         const response = await apiClient.get<{ subtitle: string }>(`/api/v1/sb/${movieId}/subtitles`);
//         const subtitleText = response.subtitle || "";

//         // Convertir texto a formato VTT temporal
//         const vttContent = `WEBVTT\n\n00:00:00.000 --> 00:00:10.000\n${subtitleText}`;
//         const blob = new Blob([vttContent], { type: "text/vtt" });
//         const vttUrl = URL.createObjectURL(blob);

//         setSubtitleUrl(vttUrl);
//       } catch (error) {
//         console.error("Error al obtener subtítulos:", error);
//         setSubtitleUrl(null);
//       }
//     };

//     if (movieId) fetchSubtitles();

//     return () => {
//       if (subtitleUrl) URL.revokeObjectURL(subtitleUrl);
//     };
//   }, [movieId]);


//   /**
//    * Fetches the favorite status of the movie for the current user.
//    * Checks if the movie is in the user's favorites list and updates state accordingly.
//    * 
//    * @effect
//    * @listens movieId - Runs when the movie ID changes
//    */
//   useEffect(() => {
//     const fetchFavoriteStatus = async () => {
//       const userString = localStorage.getItem('user');
//       const userId = userString ? JSON.parse(userString).id : null;

//       if (!userId || !movieId) return;

//       try {
//         const favorites = await apiClient.get<Favorite[]>(`/api/v1/favorites/user/${userId}`);
//         const existingFavorite = favorites.find((fav: Favorite) => fav.movieId === movieId);
//         if (existingFavorite) {
//           setIsFavorite(true);
//           setFavoriteId(existingFavorite._id);
//         } else {
//           setIsFavorite(false);
//           setFavoriteId(null);
//         }
//       } catch (error) {
//         console.error('Error al verificar favorito:', error);
//       }
//     };

//     fetchFavoriteStatus();
//   }, [movieId]);

//   /**
//    * Sets up keyboard shortcuts for video control.
//    * Handles various keyboard inputs for play/pause, seek, favorite, captions, and navigation.
//    * Prevents interference with input fields and text areas.
//    * 
//    * Keyboard mappings:
//    * - Escape: Close modal
//    * - Space/K: Play/Pause
//    * - F: Toggle favorite
//    * - Arrow Left/J: Seek backward 10 seconds
//    * - Arrow Right/L: Seek forward 10 seconds
//    * - I: Go to details page
//    * - C: Toggle captions
//    * 
//    * @effect
//    * @listens isPlaying - Re-registers handlers when play state changes
//    * @listens isFavorite - Re-registers handlers when favorite state changes
//    */
//   useEffect(() => {
//     const handleKey = (e: KeyboardEvent) => {
//       // Don't interfere with typing in input fields
//       const target = e.target as HTMLElement;
//       if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

//       switch (e.key) {
//         case 'Escape':
//           onClose();
//           break;

//         case ' ':
//           // Space to play/pause - prevent default scrolling
//           e.preventDefault();
//           togglePlay();
//           break;

//         case 'k':
//         case 'K':
//           // K to play/pause (YouTube-style)
//           e.preventDefault();
//           togglePlay();
//           break;

//         case 'f':
//         case 'F':
//           // F to toggle favorite
//           e.preventDefault();
//           toggleFavorite();
//           break;

//         case 'ArrowRight':
//           // Right arrow: forward 10 seconds
//           e.preventDefault();
//           handleForward();
//           break;

//         case 'ArrowLeft':
//           // Left arrow: backward 10 seconds
//           e.preventDefault();
//           handleBackward();
//           break;

//         case 'i':
//         case 'I':
//           // I to go to details page
//           e.preventDefault();
//           goToDetails();
//           break;

//         case 'c':
//         case 'C':
//           // C to toggle captions
//           e.preventDefault();
//           toggleCaptions();
//           break;

//         case 'l':
//         case 'L':
//           // L to forward 10 seconds (YouTube-style)
//           e.preventDefault();
//           handleForward();
//           break;

//         case 'j':
//         case 'J':
//           // J to backward 10 seconds (YouTube-style)
//           e.preventDefault();
//           handleBackward();
//           break;
//       }
//     };
//     window.addEventListener('keydown', handleKey);
//     return () => window.removeEventListener('keydown', handleKey);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [isPlaying, isFavorite]);

//   /**
//    * Sets up video event listeners for metadata loading, time updates, and video end.
//    * Handles initial video setup, duration detection, and loading state management.
//    * Includes a fallback timeout to hide the loading poster after 8 seconds.
//    * 
//    * @effect
//    * @listens video element events - loadedmetadata, timeupdate, ended
//    */
//   useEffect(() => {
//     const video = videoRef.current;
//     if (!video) return;

//     const onLoaded = () => {
//       setDuration(video.duration || 0);
//       setLoadingPoster(false);
//       if (video.paused && isPlaying) {
//         video.play().catch(() => { });
//       }
//     };
//     const onTime = () => {
//       // leave as a fallback; RAF loop will provide smooth updates while playing
//       setCurrent(video.currentTime || 0);
//     };
//     const onEnd = () => setIsPlaying(false);

//     video.addEventListener('loadedmetadata', onLoaded);
//     video.addEventListener('timeupdate', onTime);
//     video.addEventListener('ended', onEnd);

//     // poster fallback
//     const posterTimeout = setTimeout(() => {
//       if (loadingPoster) setLoadingPoster(false);
//     }, 8000);

//     return () => {
//       video.removeEventListener('loadedmetadata', onLoaded);
//       video.removeEventListener('timeupdate', onTime);
//       video.removeEventListener('ended', onEnd);
//       clearTimeout(posterTimeout);
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   /**
//    * Implements a Request Animation Frame (RAF) loop for smooth progress bar updates.
//    * Updates the current time state at ~60fps while the video is playing,
//    * providing smooth visual feedback in the progress bar.
//    * Automatically starts/stops based on play state.
//    * 
//    * @effect
//    * @listens isPlaying - Starts/stops RAF loop based on play state
//    * @listens duration - Reacts to duration changes
//    */
//   useEffect(() => {
//     const video = videoRef.current;
//     if (!video) return;

//     const tick = () => {
//       if (video) {
//         setCurrent(video.currentTime || 0);
//         rafRef.current = requestAnimationFrame(tick);
//       }
//     };

//     // start RAF when playing and video ready
//     if (!video.paused && isPlaying) {
//       rafRef.current = requestAnimationFrame(tick);
//     }

//     // ensure RAF restarts when isPlaying changes to true
//     if (isPlaying && video.paused) {
//       // try to play
//       video.play().catch(() => { });
//       rafRef.current = requestAnimationFrame(tick);
//     }

//     return () => {
//       if (rafRef.current) {
//         cancelAnimationFrame(rafRef.current);
//         rafRef.current = null;
//       }
//     };
//     // depend on isPlaying and videoRef.current
//   }, [isPlaying, duration]);

//   /**
//    * Toggles video playback between play and pause states.
//    * Updates the isPlaying state and calls the appropriate video element method.
//    * 
//    * @returns {void}
//    */
//   const togglePlay = () => {
//     const video = videoRef.current;
//     if (!video) return;
//     if (video.paused) {
//       video.play().catch(() => { });
//       setIsPlaying(true);
//     } else {
//       video.pause();
//       setIsPlaying(false);
//     }
//   };

//   /**
//    * Seeks the video forward by 10 seconds.
//    * Ensures the new time does not exceed the video duration.
//    * 
//    * @returns {void}
//    */
//   const handleForward = () => {
//     if (videoRef.current) videoRef.current.currentTime = Math.min((videoRef.current.currentTime || 0) + 10, duration);
//   };

//   /**
//    * Seeks the video backward by 10 seconds.
//    * Ensures the new time does not go below 0.
//    * 
//    * @returns {void}
//    */
//   const handleBackward = () => {
//     if (videoRef.current) videoRef.current.currentTime = Math.max((videoRef.current.currentTime || 0) - 10, 0);
//   };

//   /**
//    * Toggles fullscreen mode for the video element.
//    * Enters fullscreen if not already in fullscreen, otherwise exits fullscreen.
//    * 
//    * @async
//    * @returns {Promise<void>}
//    */
//   const handleFullscreen = async () => {
//     const video = videoRef.current;
//     if (!video) return;
//     try {
//       if (document.fullscreenElement) {
//         await document.exitFullscreen();
//       } else {
//         await video.requestFullscreen();
//       }
//     } catch (err) {
//       console.warn('Fullscreen error', err);
//     }
//   };

//   /**
//    * Toggles the visibility of video captions/subtitles.
//    * Switches the first text track between 'showing' and 'hidden' modes.
//    * 
//    * @returns {void}
//    */
//   const toggleCaptions = () => {
//     const video = videoRef.current;
//     if (video && video.textTracks.length > 0) {
//       const track = video.textTracks[0];
//       const newState = track.mode === 'showing' ? 'hidden' : 'showing';
//       track.mode = newState;
//       setCaptionsEnabled(newState === 'showing');
//     }
//   };

//   /**
//    * Toggles the favorite status of the current movie.
//    * Adds or removes the movie from the user's favorites list via API.
//    * Updates local state to reflect the change.
//    * 
//    * @async
//    * @returns {Promise<void>}
//    * @throws {Error} When API request fails
//    */
//   const toggleFavorite = async () => {
//     const userString = localStorage.getItem('user');
//     const userId = userString ? JSON.parse(userString).id : null;

//     if (!userId) {
//       console.warn('No se encontró el usuario en localStorage');
//       return;
//     }

//     try {
//       if (isFavorite && favoriteId) {
//         await apiClient.delete(`/api/v1/favorites/movie/${favoriteId}`);
//         setIsFavorite(false);
//         // notify parent that favorite was removed
//         if (typeof onFavoriteChange === 'function') onFavoriteChange(movieId, false, favoriteId);
//         setFavoriteId(null);
//       } else {
//         const response = await apiClient.post<Favorite>('/api/v1/favorites', { userId, movieId });
//         setIsFavorite(true);
//         setFavoriteId(response._id);
//         // notify parent that favorite was added
//         if (typeof onFavoriteChange === 'function') onFavoriteChange(movieId, true, response._id);
//       }
//     } catch (error) {
//       console.error('Error al actualizar favorito:', error);
//     }
//   };

//   /**
//    * Handles clicks on the modal overlay (outside the content area).
//    * Closes the modal when the overlay is clicked.
//    * 
//    * @param {React.MouseEvent} e - The mouse click event
//    * @returns {void}
//    */
//   const handleOverlayClick = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     onClose();
//   };

//   /**
//    * Handles clicks on the modal content area.
//    * Prevents event propagation to avoid closing the modal.
//    * 
//    * @param {React.MouseEvent} e - The mouse click event
//    * @returns {void}
//    */
//   const handleContentClick = (e: React.MouseEvent) => {
//     e.stopPropagation();
//   };

//   /**
//    * Handles clicks on the progress bar to seek to a specific time.
//    * Calculates the clicked position as a percentage of the total duration
//    * and updates the video's current time accordingly.
//    * 
//    * @param {React.MouseEvent<HTMLDivElement>} e - The mouse click event on the progress bar
//    * @returns {void}
//    */
//   const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
//     const pr = progressRef.current;
//     const video = videoRef.current;
//     if (!pr || !video) return;
//     const rect = pr.getBoundingClientRect();
//     const x = e.clientX - rect.left;
//     const pct = Math.max(0, Math.min(1, x / rect.width));
//     video.currentTime = pct * duration;
//     setCurrent(pct * duration); // immediate UI update
//   };

//   /**
//    * Navigates to the detailed movie page.
//    * Closes the modal before navigation to ensure clean transition.
//    * 
//    * @returns {void}
//    */
//   const goToDetails = () => {
//     try {
//       onClose();
//     } catch (e) {
//       /* ignore */
//     }
//     // route for movie details - adjust if your route is different
//     navigate(`/movies/${movieId}`);
//   };

//   return (
//     <div className="video-modal-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-label={`Reproductor: ${title}`}>
//       <div className="video-modal-content" onClick={handleContentClick}>
//         <button className="close-button" aria-label="Cerrar" onClick={onClose}>×</button>

//         <div className="video-area">
//           {/* Loading poster overlay */}
//           {loadingPoster && (
//             <div className="loading-poster" aria-hidden="true">
//               <div className="vm-spinner" />
//               <div className="loading-text">Cargando video…</div>
//             </div>
//           )}

//           <video
//             ref={videoRef}
//             autoPlay
//             className={`video-player ${loadingPoster ? 'hidden' : ''}`}
//             controls={false}
//             preload="metadata"
//           >
//             <source src={videoUrl} type="video/mp4" />
//             {subtitleUrl && (
//               <track
//                 kind="subtitles"
//                 srcLang="es"
//                 label="Español (IA)"
//                 src={subtitleUrl}
//               />
//             )}
//             Tu navegador no soporta la reproducción de video.
//           </video>

//           <div className="media-overlay" aria-hidden={loadingPoster}>
//             <div className="progress" ref={progressRef} onClick={handleProgressClick}>
//               <div className="progress-bar" style={{ width: `${duration ? (current / duration) * 100 : 0}%` }} />
//             </div>

//             <div className="controls-row">
//               <div className="left-controls">
//                 <button className="ctrl" onClick={handleBackward} aria-label="Retroceder 10 segundos"><FaBackward /></button>
//                 <button className="ctrl play" onClick={togglePlay} aria-label={isPlaying ? 'Pausar' : 'Reproducir'}>
//                   {isPlaying ? <FaPause /> : <FaPlay />}
//                 </button>
//                 <button className="ctrl" onClick={handleForward} aria-label="Adelantar 10 segundos"><FaForward /></button>
//               </div>

//               <div className="center-info">
//                 <span className="time">{formatTime(current)} / {formatTime(duration)}</span>
//                 {/* <h3 className="video-title-inline" title={title}>{title}</h3> */}
//               </div>

//               <div className="right-controls">
//                 <button className="ctrl" onClick={handleFullscreen} aria-label="Pantalla completa"><FaExpand /></button>
//                 <button
//                   className={`ctrl captions ${captionsEnabled ? 'active' : ''}`}
//                   onClick={toggleCaptions}
//                   aria-pressed={captionsEnabled}
//                   aria-label={captionsEnabled ? 'Desactivar subtítulos' : 'Activar subtítulos'}
//                 >
//                   <FaClosedCaptioning />
//                 </button>
//                 <button className={`ctrl favorite ${isFavorite ? 'active' : ''}`} onClick={toggleFavorite} aria-pressed={isFavorite} aria-label={isFavorite ? 'Quitar favorito' : 'Añadir favorito'}>
//                   <FaHeart />
//                 </button>
//               </div>
//             </div>

//             {/* NEW: preview footer with link to dedicated page */}

//           </div>
//         </div>

//         <div className="meta-row">
//           <h2 className="video-title">{title}</h2>
//           <div className="preview-actions">
//             <button className="more-details" onClick={goToDetails} aria-label={`Ver ficha completa`}>
//               Ver ficha completa
//             </button>
//           </div>
//           <p className="video-actions-hint">
//             <strong>Atajos de teclado:</strong> Espacio/K: Reproducir/Pausar · F: Favorito · ←/→: Retroceder/Adelantar · I: Ver ficha · C: Subtítulos · Esc: Cerrar
//           </p>
//         </div>


//       </div>
//     </div>
//   );
// };

// export default VideoModal;

import React, { useRef, useState, useEffect } from 'react';
import '../styles/VideoModal.scss';
import { FaPlay, FaPause, FaForward, FaBackward, FaExpand, FaClosedCaptioning, FaHeart } from 'react-icons/fa';
import apiClient from '../services/apiClient';
import { useNavigate } from 'react-router';

interface VideoModalProps {
  videoUrl: string;
  title: string;
  movieId: string;
  onClose: () => void;
  onFavoriteChange?: (movieId: string, isFavorite: boolean, favoriteId?: string) => void;
}

interface Favorite {
  userId: string;
  movieId: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
}

const formatTime = (s: number) => {
  if (!isFinite(s)) return '0:00';
  const minutes = Math.floor(s / 60);
  const seconds = Math.floor(s % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

const VideoModal: React.FC<VideoModalProps> = ({ videoUrl, title, movieId, onClose, onFavoriteChange }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const navigate = useNavigate();

  const [isPlaying, setIsPlaying] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState<number>(0);
  const [loadingPoster, setLoadingPoster] = useState(true);

  // States for subtitles
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [selectedSubtitle, setSelectedSubtitle] = useState<string | null>(null); // "es", "en" or null
  const [subtitleUrls, setSubtitleUrls] = useState<{ es?: string; en?: string }>({});
  const [loadingSubtitles, setLoadingSubtitles] = useState(false);

  /**
   * Fetches subtitles in both languages from the backend.
   * Creates VTT blob URLs for each language.
   */
  useEffect(() => {
    const fetchSubtitles = async () => {
      setLoadingSubtitles(true);
      try {
        // Fetch English subtitles
        const responseEn = await apiClient.get<{ subtitle: string; language: string }>(
          `/api/v1/sb/${movieId}/subtitles/en`
        );
        
        // Fetch Spanish subtitles
        const responseEs = await apiClient.get<{ subtitle: string; language: string }>(
          `/api/v1/sb/${movieId}/subtitles/es`
        );

        const urls: { es?: string; en?: string } = {};

        // Create VTT for English
        if (responseEn.subtitle) {
          const vttContentEn = `WEBVTT\n\n00:00:00.000 --> 00:00:10.000\n${responseEn.subtitle}`;
          const blobEn = new Blob([vttContentEn], { type: "text/vtt" });
          urls.en = URL.createObjectURL(blobEn);
        }

        // Create VTT for Spanish
        if (responseEs.subtitle) {
          const vttContentEs = `WEBVTT\n\n00:00:00.000 --> 00:00:10.000\n${responseEs.subtitle}`;
          const blobEs = new Blob([vttContentEs], { type: "text/vtt" });
          urls.es = URL.createObjectURL(blobEs);
        }

        setSubtitleUrls(urls);
      } catch (error) {
        console.error("Error al obtener subtítulos:", error);
        setSubtitleUrls({});
      } finally {
        setLoadingSubtitles(false);
      }
    };

    if (movieId) fetchSubtitles();

    return () => {
      // Clean up blob URLs
      if (subtitleUrls.en) URL.revokeObjectURL(subtitleUrls.en);
      if (subtitleUrls.es) URL.revokeObjectURL(subtitleUrls.es);
    };
  }, [movieId]);

  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      const userString = localStorage.getItem('user');
      const userId = userString ? JSON.parse(userString).id : null;

      if (!userId || !movieId) return;

      try {
        const favorites = await apiClient.get<Favorite[]>(`/api/v1/favorites/user/${userId}`);
        const existingFavorite = favorites.find((fav: Favorite) => fav.movieId === movieId);
        if (existingFavorite) {
          setIsFavorite(true);
          setFavoriteId(existingFavorite._id);
        } else {
          setIsFavorite(false);
          setFavoriteId(null);
        }
      } catch (error) {
        console.error('Error al verificar favorito:', error);
      }
    };

    fetchFavoriteStatus();
  }, [movieId]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      switch (e.key) {
        case 'Escape':
          if (showSubtitleMenu) {
            setShowSubtitleMenu(false);
          } else {
            onClose();
          }
          break;
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'k':
        case 'K':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFavorite();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleForward();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleBackward();
          break;
        case 'i':
        case 'I':
          e.preventDefault();
          goToDetails();
          break;
        case 'c':
        case 'C':
          e.preventDefault();
          setShowSubtitleMenu(!showSubtitleMenu);
          break;
        case 's':
        case 'S':
          e.preventDefault();
          selectSubtitle(captionsEnabled ? null : 'es');
          break;
        case 'd':
        case 'D':
          e.preventDefault();
          selectSubtitle(captionsEnabled ? null : 'en');
          break;
        case 'l':
        case 'L':
          e.preventDefault();
          handleForward();
          break;
        case 'n':
        case 'N':
          e.preventDefault();
          selectSubtitle(null);
          break;   
        case 'j':
        case 'J':
          e.preventDefault();
          handleBackward();
          break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isPlaying, isFavorite, showSubtitleMenu]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoaded = () => {
      setDuration(video.duration || 0);
      setLoadingPoster(false);
      if (video.paused && isPlaying) {
        video.play().catch(() => { });
      }
    };
    const onTime = () => {
      setCurrent(video.currentTime || 0);
    };
    const onEnd = () => setIsPlaying(false);

    video.addEventListener('loadedmetadata', onLoaded);
    video.addEventListener('timeupdate', onTime);
    video.addEventListener('ended', onEnd);

    const posterTimeout = setTimeout(() => {
      if (loadingPoster) setLoadingPoster(false);
    }, 8000);

    return () => {
      video.removeEventListener('loadedmetadata', onLoaded);
      video.removeEventListener('timeupdate', onTime);
      video.removeEventListener('ended', onEnd);
      clearTimeout(posterTimeout);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const tick = () => {
      if (video) {
        setCurrent(video.currentTime || 0);
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    if (!video.paused && isPlaying) {
      rafRef.current = requestAnimationFrame(tick);
    }

    if (isPlaying && video.paused) {
      video.play().catch(() => { });
      rafRef.current = requestAnimationFrame(tick);
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isPlaying, duration]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => { });
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleForward = () => {
    if (videoRef.current) videoRef.current.currentTime = Math.min((videoRef.current.currentTime || 0) + 10, duration);
  };

  const handleBackward = () => {
    if (videoRef.current) videoRef.current.currentTime = Math.max((videoRef.current.currentTime || 0) - 10, 0);
  };

  const handleFullscreen = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await video.requestFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen error', err);
    }
  };

  /**
   * Selects a subtitle language and activates the corresponding track
   */
  const selectSubtitle = (lang: string | null) => {
    const video = videoRef.current;
    if (!video) return;

    setSelectedSubtitle(lang);
    setShowSubtitleMenu(false);

    // Disable all tracks first
    for (let i = 0; i < video.textTracks.length; i++) {
      video.textTracks[i].mode = 'hidden';
    }

    // Enable selected track
    if (lang && video.textTracks.length > 0) {
      const trackIndex = lang === 'es' ? 0 : 1; // Based on order in <video>
      if (video.textTracks[trackIndex]) {
        video.textTracks[trackIndex].mode = 'showing';
        setCaptionsEnabled(true);
      }
    } else {
      setCaptionsEnabled(false);
    }
  };

  const toggleFavorite = async () => {
    const userString = localStorage.getItem('user');
    const userId = userString ? JSON.parse(userString).id : null;

    if (!userId) {
      console.warn('No se encontró el usuario en localStorage');
      return;
    }

    try {
      if (isFavorite && favoriteId) {
        await apiClient.delete(`/api/v1/favorites/movie/${favoriteId}`);
        setIsFavorite(false);
        if (typeof onFavoriteChange === 'function') onFavoriteChange(movieId, false, favoriteId);
        setFavoriteId(null);
      } else {
        const response = await apiClient.post<Favorite>('/api/v1/favorites', { userId, movieId });
        setIsFavorite(true);
        setFavoriteId(response._id);
        if (typeof onFavoriteChange === 'function') onFavoriteChange(movieId, true, response._id);
      }
    } catch (error) {
      console.error('Error al actualizar favorito:', error);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (showSubtitleMenu) {
      setShowSubtitleMenu(false);
      return;
    }
    e.stopPropagation();
    onClose();
  };

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const pr = progressRef.current;
    const video = videoRef.current;
    if (!pr || !video) return;
    const rect = pr.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    video.currentTime = pct * duration;
    setCurrent(pct * duration);
  };

  const goToDetails = () => {
    try {
      onClose();
    } catch (e) {
      /* ignore */
    }
    navigate(`/movies/${movieId}`);
  };

  return (
    <div className="video-modal-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-label={`Reproductor: ${title}`}>
      <div className="video-modal-content" onClick={handleContentClick}>
        <button className="close-button" aria-label="Cerrar" onClick={onClose}>×</button>

        <div className="video-area">
          {loadingPoster && (
            <div className="loading-poster" aria-hidden="true">
              <div className="vm-spinner" />
              <div className="loading-text">Cargando video…</div>
            </div>
          )}

          <video
            ref={videoRef}
            autoPlay
            className={`video-player ${loadingPoster ? 'hidden' : ''}`}
            controls={false}
            preload="metadata"
          >
            <source src={videoUrl} type="video/mp4" />
            {subtitleUrls.es && (
              <track
                kind="subtitles"
                srcLang="es"
                label="Español"
                src={subtitleUrls.es}
              />
            )}
            {subtitleUrls.en && (
              <track
                kind="subtitles"
                srcLang="en"
                label="English"
                src={subtitleUrls.en}
              />
            )}
            Tu navegador no soporta la reproducción de video.
          </video>

          <div className="media-overlay" aria-hidden={loadingPoster}>
            <div className="progress" ref={progressRef} onClick={handleProgressClick}>
              <div className="progress-bar" style={{ width: `${duration ? (current / duration) * 100 : 0}%` }} />
            </div>

            <div className="controls-row">
              <div className="left-controls">
                <button className="ctrl" onClick={handleBackward} aria-label="Retroceder 10 segundos"><FaBackward /></button>
                <button className="ctrl play" onClick={togglePlay} aria-label={isPlaying ? 'Pausar' : 'Reproducir'}>
                  {isPlaying ? <FaPause /> : <FaPlay />}
                </button>
                <button className="ctrl" onClick={handleForward} aria-label="Adelantar 10 segundos"><FaForward /></button>
              </div>

              <div className="center-info">
                <span className="time">{formatTime(current)} / {formatTime(duration)}</span>
              </div>

              <div className="right-controls">
                <button className="ctrl" onClick={handleFullscreen} aria-label="Pantalla completa"><FaExpand /></button>
                
                {/* Subtitles button with menu */}
                <div className="subtitle-menu-container">
                  <button
                    className={`ctrl captions ${captionsEnabled ? 'active' : ''}`}
                    onClick={() => setShowSubtitleMenu(!showSubtitleMenu)}
                    aria-pressed={captionsEnabled}
                    aria-label="Menú de subtítulos"
                  >
                    <FaClosedCaptioning />
                  </button>
                  
                  {showSubtitleMenu && (
                    <div className="subtitle-menu" onClick={(e) => e.stopPropagation()}>
                      <div className="subtitle-menu-header">Subtítulos</div>
                      <button 
                        className={`subtitle-option ${selectedSubtitle === null ? 'selected' : ''}`}
                        onClick={() => selectSubtitle(null)}
                      >
                        Desactivado
                      </button>
                      {subtitleUrls.es && (
                        <button 
                          className={`subtitle-option ${selectedSubtitle === 'es' ? 'selected' : ''}`}
                          onClick={() => selectSubtitle('es')}
                          disabled={loadingSubtitles}
                        >
                          ESP Español {loadingSubtitles && '(cargando...)'}
                        </button>
                      )}
                      {subtitleUrls.en && (
                        <button 
                          className={`subtitle-option ${selectedSubtitle === 'en' ? 'selected' : ''}`}
                          onClick={() => selectSubtitle('en')}
                          disabled={loadingSubtitles}
                        >
                          ENG English {loadingSubtitles && '(cargando...)'}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <button className={`ctrl favorite ${isFavorite ? 'active' : ''}`} onClick={toggleFavorite} aria-pressed={isFavorite} aria-label={isFavorite ? 'Quitar favorito' : 'Añadir favorito'}>
                  <FaHeart />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="meta-row">
          <h2 className="video-title">{title}</h2>
          <div className="preview-actions">
            <button className="more-details" onClick={goToDetails} aria-label={`Ver ficha completa`}>
              Ver ficha completa
            </button>
          </div>
          <p className="video-actions-hint">
            <strong>Atajos de teclado:</strong> Espacio/K: Reproducir/Pausar · F: Favorito · ←/→: Retroceder/Adelantar · I: Ver ficha · C: Abrir subtítulos · Esc: Cerrar · S: Subtítulos en Español · D: Subtítulos en Inglés · N: Desactivar subtítulos
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;