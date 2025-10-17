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
import { Dashboard } from './pages/Dashboard';

const App: React.FC = () => {
return (
<BrowserRouter>
	<Navbar />
	<main className="pt-16"> 
<Routes>
<Route path="/" element={<HomePage />} />
	<Route path="/about" element={<AboutPage />} />
	<Route path="/login" element={<LoginPage />} />
	<Route path="/register" element={<RegisterPage />} />
	<Route path="/reset-password" element={<ResetPasswordPage />} />
	<Route path="/reset-password/new" element={<NewPasswordPage />} />
	<Route path="/profile" element={<ProfilePage />} />
	<Route path="/delete-account" element={<DeleteAccountPage />} />
	<Route path="/dashboard" element={<Dashboard />} />
</Routes>
</main>
</BrowserRouter>
);
};
export default App;