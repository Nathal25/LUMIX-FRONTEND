import React from "react";
import "./HomePage.css";

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