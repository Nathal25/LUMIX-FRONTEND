import React from 'react';
import { Link } from 'react-router';
import './navbar.css';

export const Navbar: React.FC = () => {
	return (
		<header className="navbar">
            <Link to="/">
              <img src="/lumix.svg" alt="Lumix logo" className="navbar-logo" />
            </Link>
			<nav className="navbar-links">
				<Link to="/" className="navbar-link">Inicio</Link>
				<Link to="/register" className="navbar-link">Registrarse</Link>
				<Link to="/login" className="navbar-button">Iniciar sesión</Link>
			</nav>
		</header>
	);
};
export default Navbar;