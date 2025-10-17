import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { Navbar } from './components/Navbar';
const App: React.FC = () => {
return (
<BrowserRouter>
	<Navbar />
	<main className="pt-16"> {/* add top padding equal to navbar height */}
<Routes>
<Route path="/" element={<HomePage />} />
	<Route path="/about" element={<AboutPage />} />
	<Route path="/login" element={<LoginPage />} />
	<Route path="/register" element={<RegisterPage />} />
</Routes>
</main>
</BrowserRouter>
);
};
export default App;