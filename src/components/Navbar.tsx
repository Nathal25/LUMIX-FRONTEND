import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import '../styles/Navbar.scss';
import authService from '../services/authService';

type Props = {
  isAuthenticated?: boolean;
  onLogout?: () => void;
};

const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.split('; ').find((row) => row.startsWith(name + '='));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=; Path=/; Max-Age=0;`;
};

export const Navbar: React.FC<Props> = ({ isAuthenticated: isAuthProp, onLogout }) => {
  const [open, setOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(Boolean(isAuthProp));

  useEffect(() => {
    let mounted = true;

    if (typeof isAuthProp === 'boolean') {
      setIsAuthenticated(isAuthProp);
      return;
    }

    // Primero intenta leer token desde cookie (no HttpOnly)
    const cookieToken = getCookie('authToken') ?? getCookie('token');
    if (cookieToken) {
      setIsAuthenticated(true);
      // Verificación en background (si cookie expirada/invalid, actualizar estado)
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

    // Si no hay cookie legible, preguntar al backend (útil cuando cookie es HttpOnly)
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

  // nuevo: escuchar notificaciones globales de cambio de auth
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
    window.addEventListener('storage', refreshAuthState); // cambios desde otras pestañas
    return () => {
      window.removeEventListener('authChanged', refreshAuthState);
      window.removeEventListener('storage', refreshAuthState);
    };
  }, []);

  const toggle = () => setOpen((v) => !v);
  const close = () => setOpen(false);

  const handleLogout = async () => {
    try {
      // llamar endpoint de logout para invalidar cookie HttpOnly en servidor
      await authService.logout();
    } catch (e) {
      console.error('logout error', e);
    }

    // eliminar cookies legibles por JS (si existen)
    try {
      deleteCookie('authToken');
      deleteCookie('token');
    } catch (e) {}

    // fallback localStorage
    localStorage.removeItem('authToken');

    // notificar al resto de la app que se cerró sesión
    window.dispatchEvent(new Event('authChanged'));

    setIsAuthenticated(false);
    if (onLogout) onLogout();
    close();

    window.location.href = '/';
  };

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
              Dashboard
            </Link>
            <Link to="/profile" className="navbar-link" onClick={close}>
              Perfil
            </Link>
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