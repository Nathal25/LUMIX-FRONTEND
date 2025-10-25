import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import '../styles/Navbar.scss';
import authService from '../services/authService';

/**
 * Props for the Navbar component.
 * 
 * @interface Props
 * @property {boolean} [isAuthenticated] - Optional override for authentication status
 * @property {() => void} [onLogout] - Optional callback executed after logout
 */
type Props = {
  isAuthenticated?: boolean;
  onLogout?: () => void;
};

/**
 * Retrieves a cookie value by name from the document cookies.
 * 
 * @param {string} name - The name of the cookie to retrieve
 * @returns {string | null} The decoded cookie value or null if not found
 */
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.split('; ').find((row) => row.startsWith(name + '='));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
};

/**
 * Deletes a cookie by setting its Max-Age to 0.
 * 
 * @param {string} name - The name of the cookie to delete
 * @returns {void}
 */
const deleteCookie = (name: string) => {
  document.cookie = `${name}=; Path=/; Max-Age=0;`;
};

/**
 * Navbar Component
 * 
 * Main navigation bar with authentication-aware menu, mobile toggle,
 * search functionality, and favorites access.
 * 
 * Features:
 * - Responsive mobile menu with hamburger toggle
 * - Authentication state detection (cookie + backend verification)
 * - Different navigation links for authenticated/unauthenticated users
 * - Search functionality (provisional)
 * - Favorites quick access
 * - Logout functionality with state cleanup
 * - Listens to global auth state changes
 * - Cross-tab synchronization via storage events
 * 
 * Authentication Flow:
 * 1. Checks for cookie-based auth token
 * 2. Falls back to backend verification for HttpOnly cookies
 * 3. Listens to authChanged events for immediate updates
 * 4. Syncs across browser tabs
 * 
 * @component
 * @param {Props} props - Component properties
 * @returns {JSX.Element} The rendered navigation bar
 */
export const Navbar: React.FC<Props> = ({ isAuthenticated: isAuthProp, onLogout }) => {
  const [open, setOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(Boolean(isAuthProp));
  // Provisional: search (refactor needed)
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement | null>(null); // ref to detect outside clicks

  /**
   * Initializes and manages authentication state on component mount.
   * 
   * Authentication Strategy:
   * 1. If isAuthProp is explicitly provided, uses that value directly
   * 2. Otherwise, attempts to read auth token from cookies (authToken or token)
   * 3. If cookie token exists, sets authenticated and verifies with backend
   * 4. If no cookie, falls back to backend verification (for HttpOnly cookies)
   * 
   * This effect only runs once on mount or when isAuthProp changes.
   * Uses a mounted flag to prevent state updates after component unmount.
   * 
   * @effect
   * @listens isAuthProp - Re-runs when authentication prop changes
   */
  useEffect(() => {
    let mounted = true;

    if (typeof isAuthProp === 'boolean') {
      setIsAuthenticated(isAuthProp);
      return;
    }

    // First try to read token from cookie (not HttpOnly)
    const cookieToken = getCookie('authToken') ?? getCookie('token');
    if (cookieToken) {
      setIsAuthenticated(true);
      // Background verification (if cookie expired/invalid, update state)
      authService
        .checkAuth()
        .then((user) => {
          if (!mounted) return;
          setIsAuthenticated(Boolean(user));
        })
        .catch(() => {
          if (!mounted) return;
          setIsAuthenticated(false);
        });
      return;
    }

    // If no readable cookie, ask the backend (useful when cookie is HttpOnly)
    authService
      .checkAuth()
      .then((user) => {
        if (!mounted) return;
        setIsAuthenticated(Boolean(user));
      })
      .catch(() => {
        if (!mounted) return;
        setIsAuthenticated(false);
      });

    return () => {
      mounted = false;
    };
  }, [isAuthProp]);

  /**
   * Listens to global authentication state changes and storage events.
   * Refreshes authentication status when auth changes occur in this tab
   * or other tabs (via storage event).
   * 
   * @effect
   * @listens authChanged - Custom event dispatched when auth state changes
   * @listens storage - Browser storage event for cross-tab synchronization
   */
  useEffect(() => {
    const refreshAuthState = () => {
      const token = getCookie('authToken') ?? getCookie('token') ?? localStorage.getItem('authToken');
      if (token) {
        // opcional: verificar con backend si quieres mayor seguridad
        setIsAuthenticated(true);
      } else {
        // intenta validar con backend (cookie HttpOnly)
        authService
          .checkAuth()
          .then((user) => setIsAuthenticated(Boolean(user)))
          .catch(() => setIsAuthenticated(false));
      }
    };

    window.addEventListener('authChanged', refreshAuthState);
    window.addEventListener('storage', refreshAuthState); // changes from other tabs
    return () => {
      window.removeEventListener('authChanged', refreshAuthState);
      window.removeEventListener('storage', refreshAuthState);
    };
  }, []);

  /**
   * Toggles the mobile navigation menu visibility.
   * 
   * @returns {void}
   */
  const toggle = () => setOpen((v) => !v);
  
  /**
   * Closes the mobile navigation menu.
   * 
   * @returns {void}
   */
  const close = () => setOpen(false);

  /**
   * Handles user logout process.
   * Performs the following steps:
   * 1. Calls backend logout endpoint to invalidate HttpOnly cookies
   * 2. Removes client-side cookies and localStorage tokens
   * 3. Dispatches authChanged event to notify the application
   * 4. Updates local authentication state
   * 5. Closes mobile menu
   * 6. Redirects to home page
   * 
   * @async
   * @returns {Promise<void>}
   */
  const handleLogout = async () => {
    try {
      // llamar endpoint de logout para invalidar cookie HttpOnly en servidor
      await authService.logout();
    } catch (e) {
      console.error('logout error', e);
    }

    // Remove readable cookies by JS (if they exist)
    try {
      deleteCookie('authToken');
      deleteCookie('token');
    } catch (e) { }

    // Fallback localStorage
    localStorage.removeItem('authToken');

    // Notify the rest of the app that the session was closed
    window.dispatchEvent(new Event('authChanged'));

    setIsAuthenticated(false);
    if (onLogout) onLogout();
    close();

    window.location.href = '/';
  };

  // -----------------------------------
  // Provisional search helpers are implemented inline where used to avoid unused lint errors

  /**
   * Sets up click-outside detection and keyboard shortcuts for the search panel.
   * Closes the search panel when:
   * - User clicks outside the search component
   * - User presses the Escape key
   * 
   * @effect
   * @listens isSearchOpen - Re-registers listeners when search state changes
   */
  useEffect(() => {
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (!isSearchOpen) return;
      const target = e.target as Node | null;
      if (!searchRef.current || !target) return;
      if (!searchRef.current.contains(target)) {
        setIsSearchOpen(false);
      }
    };

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSearchOpen(false);
    };

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isSearchOpen]);

  return (
    <header className="navbar">
      <Link to="/" onClick={close}>
        <img src="/lumix.svg" alt="Lumix logo" className="navbar-logo" />
      </Link>

      <button
        className={`navbar-toggle ${open ? 'is-open' : ''}`}
        aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={open}
        onClick={toggle}
        type="button"
      >
        <img
          src={open ? '/icons/close.svg' : '/icons/menu.svg'}
          alt={open ? 'Cerrar' : 'Abrir menú'}
          className="navbar-toggle-icon"
          aria-hidden="true"
        />
      </button>

      <nav className={`navbar-links ${open ? 'open' : ''}`} role="navigation">
        {!isAuthenticated && (
          <>
            <Link to="/" className="navbar-link" onClick={close}>
              Inicio
            </Link>
            <Link to="/register" className="navbar-link" onClick={close}>
              Registrarse
            </Link>
            <Link to="/login" className="navbar-button" onClick={close}>
              Iniciar sesión
            </Link>
          </>
        )}

        {isAuthenticated && (
          <>
            <Link to="/dashboard" className="navbar-link" onClick={close}>
              Películas
            </Link>
            <Link to="/profile" className="navbar-link" onClick={close}>
              Perfil
            </Link>
            {/* Provisional */}
            {/*  ----------------------------------- */}
            {/*  ----------------------------------- */}
            {/*  ----------------------------------- */}
            {/*  ----------------------------------- */}
            {/*  ----------------------------------- */}
            {/* Search button */}
            <div className="navbar-search" ref={searchRef}>
              <button
                type="button"
                className={`search-toggle ${isSearchOpen ? 'active' : ''}`}
                aria-expanded={isSearchOpen}
                aria-label={isSearchOpen ? 'Cerrar búsqueda' : 'Abrir búsqueda'}
                onClick={() => setIsSearchOpen((v) => !v)}
              >
                <img src="/icons/busqueda.svg" alt="Buscar" />
              </button>

              {isSearchOpen && (
                <div className="search-panel" role="dialog" aria-label="Búsqueda">
                  <form onSubmit={(e) => { e.preventDefault(); /* execute search */ }}>
                    <input
                      className="search-input"
                      placeholder="Buscar..."
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </form>
                  {/* optional: results */}
                </div>
              )}
            </div>

            <div className="navbar-favorites">
                <Link
                to="/favorites"
                className="favorite-button"
                aria-label="Favoritos"
                >
                <img src="/icons/love.svg" alt="Favoritos" />
                </Link>
            </div>
            {/*  ----------------------------------- */}
            {/*  ----------------------------------- */}
            {/*  ----------------------------------- */}
            {/*  ----------------------------------- */}
            <button type="button" className="navbar-button" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </>
        )}
      </nav>
    </header>
  );
};
export default Navbar;