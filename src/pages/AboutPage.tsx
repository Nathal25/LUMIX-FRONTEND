import React from 'react';
import '../styles/AboutPage.scss';

export const AboutPage: React.FC = () => {
  return (
    <main className="about-page">
      <section className="about-hero">
        <h1 className="about-title">Sobre Lumix</h1>
        <p className="about-lead">
          Creamos una experiencia cuidada para que disfrutes y explores películas con la mejor calidad.
        </p>
      </section>

      <section className="about-content container">
        <h2 className="section-title">Nuestro equipo</h2>

        <ul className="team-list" aria-label="Equipo Lumix">
          <li className="team-card">
            <div className="avatar" aria-hidden="true">JP</div>
            <div className="team-info">
              <strong className="team-name">Joahn Riveros</strong>
              <span className="team-role">Frontend Engineer</span>
              <p className="team-bio">Construye interfaces rápidas y accesibles.</p>
            </div>
          </li>

          <li className="team-card">
            <div className="avatar" aria-hidden="true">MA</div>
            <div className="team-info">
              <strong className="team-name">María Álvarez</strong>
              <span className="team-role">Backend Engineer</span>
              <p className="team-bio">Diseña APIs seguras y escalables.</p>
            </div>
          </li>

          <li className="team-card">
            <div className="avatar" aria-hidden="true">RS</div>
            <div className="team-info">
              <strong className="team-name">Rosa Sánchez</strong>
              <span className="team-role">Product</span>
              <p className="team-bio">Define la visión del producto y mejora la experiencia.</p>
            </div>
          </li>
        </ul>

        <div className="about-cta">
          <p>¿Preguntas o sugerencias? Escríbenos a <a href="mailto:soporte@lumix.app">soporte@lumix.app</a>.</p>
        </div>
      </section>
    </main>
  );
};

export default AboutPage;