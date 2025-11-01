import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { Navbar } from './components/Navbar';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { NewPasswordPage } from './pages/NewPasswordPage';
import { ProfilePage } from './pages/ProfilePage';
import { DeleteAccountPage } from './pages/DeleteAccountPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { Dashboard } from './pages/Dashboard';
import {ChangePasswordPage} from './pages/ChangePasswordPage';
import { Footer } from './components/Footer';
import MoviePage from './pages/MoviePage';
import { SpeechProvider } from './contexts/SpeechContext';

/**
 * Main Application Component
 * 
 * Root component that sets up routing for the entire application.
 * Includes a global navigation bar, main content area with routes,
 * and footer that appear on all pages.
 * 
 * Features:
 * - Client-side routing using React Router
 * - Persistent navigation and footer
 * - Public routes (home, about, login, register)
 * - Protected routes (dashboard, profile, favorites)
 * - Password management routes
 * 
 * @component
 * @returns {JSX.Element} The main application with routing structure
 */
const App: React.FC = () => {
	return (
		<BrowserRouter>
			<SpeechProvider>
				<Navbar />
				<main className="pt-16">
					<Routes>
						<Route path="/" element={<HomePage />} />
						<Route path="/about" element={<AboutPage />} />
						<Route path="/login" element={<LoginPage />} />
						<Route path="/register" element={<RegisterPage />} />
						<Route path="/reset-password" element={<ResetPasswordPage />} />
						<Route path="/recover-password" element={<NewPasswordPage />} />
						<Route path="/profile" element={<ProfilePage />} />
						<Route path="/delete-account" element={<DeleteAccountPage />} />
						<Route path="/dashboard" element={<Dashboard />} />
						<Route path="/favorites" element={<FavoritesPage />} /> {/* --Provisional route-- */}
						<Route path="/movies/:id" element={<MoviePage />} />
						<Route path="/changePassword" element={<ChangePasswordPage />} />
					</Routes>
				</main>
				<Footer />
			</SpeechProvider>
		</BrowserRouter>
	);
};
export default App;