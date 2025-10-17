import React from 'react';
import { Link } from 'react-router';
import '../styles/Footer.scss';

export const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="footer-container container">
        <nav className="footer-sitemap" aria-label="Mapa del sitio">
          <div className="sitemap-section">
            <h3 className="sitemap-title">Páginas</h3>
            <ul className="sitemap-list">
              <li><Link to="/">Inicio</Link></li>
              <li><Link to="/about">Sobre nosotros</Link></li>
              <li><Link to="/dashboard">Dashboard</Link></li>
            </ul>
          </div>

          <div className="sitemap-section">
            <h3 className="sitemap-title">Cuenta</h3>
            <ul className="sitemap-list">
              <li><Link to="/login">Iniciar sesión</Link></li>
              <li><Link to="/register">Registrarse</Link></li>
              <li><Link to="/profile">Perfil</Link></li>
              <li><Link to="/delete-account">Eliminar cuenta</Link></li>
            </ul>
          </div>

          <div className="sitemap-section">
            <h3 className="sitemap-title">Soporte</h3>
            <ul className="sitemap-list">
              <li><Link to="/reset-password">Restablecer contraseña</Link></li>
              <li><a href="mailto:soporte@lumix.app">Contacto</a></li>
              {/* <li><a href="/terms">Términos</a></li> */}
            </ul>
          </div>
        </nav>

        <div className="footer-brand">
          <img src="/lumix.svg" alt="Lumix" className="footer-logo" />
          <p className="footer-desc">Lumix — descubre y gestiona tu contenido con estilo.</p>
          <small className="footer-copy">© {year} Lumix. Todos los derechos reservados.</small>
        </div>
      </div>
    </footer>
  );
};

export default Footer;