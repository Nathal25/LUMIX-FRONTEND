import "../styles/HomePage.scss";

/**
 * HomePage Component
 * 
 * Landing page that welcomes users to the Lumix platform.
 * Displays a hero section with the main title, subtitle, and call-to-action button.
 * 
 * Features:
 * - Hero section with visual appeal
 * - Welcoming message
 * - Call-to-action button
 * 
 * @component
 * @returns {JSX.Element} The rendered home page with hero section
 */
export function HomePage() {
  return (
    <div className="home-container">
      <section className="home-hero">
        <h1 className="home-title">Bienvenido a Lumix</h1>
        <p className="home-subtitle">
          Explora un universo de películas con una experiencia visual única.
        </p>
        <button className="home-btn">Explorar ahora</button>
      </section>
    </div>
  );
}
export default HomePage;