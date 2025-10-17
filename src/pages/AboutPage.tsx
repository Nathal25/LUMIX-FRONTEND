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
            <div className="avatar" aria-hidden="true">JR</div>
            <div className="team-info">
              <strong className="team-name">Johan Riveros</strong>
              <span className="team-role">Frontend Engineer</span>
              <p className="team-bio">Construye interfaces rápidas y accesibles.</p>
            </div>
          </li>

          <li className="team-card">
            <div className="avatar" aria-hidden="true">PB</div>
            <div className="team-info">
              <strong className="team-name">Pablo Becerra</strong>
              <span className="team-role">Backend Engineer</span>
              <p className="team-bio">Diseña APIs seguras y escalables.</p>
            </div>
          </li>

          <li className="team-card">
            <div className="avatar" aria-hidden="true">NO</div>
            <div className="team-info">
              <strong className="team-name">Nathalia Ortiz</strong>
              <span className="team-role">Product</span>
              <p className="team-bio">Define la visión del producto y mejora la experiencia.</p>
            </div>
          </li>

          <li className="team-card">
            <div className="avatar" aria-hidden="true">FC</div>
            <div className="team-info">
              <strong className="team-name">Francisco Cardona</strong>
              <span className="team-role">Database</span>
              <p className="team-bio">Define la estructura de datos y optimiza consultas.</p>
            </div>
          </li>

          <li className="team-card">
            <div className="avatar" aria-hidden="true">DA</div>
            <div className="team-info">
              <strong className="team-name">Daniel Arias</strong>
              <span className="team-role">Testing</span>
              <p className="team-bio">Pruebas y aseguramiento de calidad.</p>
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