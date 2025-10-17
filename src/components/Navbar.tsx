import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import '../styles/Navbar.scss';

type Props = {
  isAuthenticated?: boolean;
  onLogout?: () => void;
};

export const Navbar: React.FC<Props> = ({ isAuthenticated: isAuthProp, onLogout }) => {
  const [open, setOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(Boolean(isAuthProp));

  useEffect(() => {
    if (typeof isAuthProp === 'boolean') {
      setIsAuthenticated(isAuthProp);
      return;
    }
    // Fallback: detect token in localStorage (ajusta clave a tu implementación)
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(Boolean(token));
  }, [isAuthProp]);

  const toggle = () => setOpen((v) => !v);
  const close = () => setOpen(false);

  const handleLogout = () => {
    // comportamiento por defecto: eliminar token y ejecutar callback si existe
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    if (onLogout) onLogout();
    close();
    // opcional: redirigir a la página de inicio

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
        <Link to="/" className="navbar-link" onClick={close}>
          Inicio
        </Link>
        <Link to="/register" className="navbar-link" onClick={close}>
          Registrarse
        </Link>

        {isAuthenticated ? (
          <button type="button" className="navbar-button" onClick={handleLogout}>
            Cerrar sesión
          </button>
        ) : (
          <Link to="/login" className="navbar-button" onClick={close}>
            Iniciar sesión
          </Link>
        )}
      </nav>
    </header>
  );
};
export default Navbar;