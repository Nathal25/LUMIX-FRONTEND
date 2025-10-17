import React from 'react';
import '../styles/Dashboard.scss';

export const Dashboard: React.FC = () => {
  return (
    <main className="dashboard-page">
      <div className="dashboard-card" role="region" aria-label="Dashboard - Próximamente">
        <h1 className="coming-title">Próximamente</h1>
        <p className="coming-subtitle">
          Estamos preparando el dashboard. ¡Vuelve pronto para descubrir nuevas funcionalidades!
        </p>
      </div>
    </main>
  );
};

export default Dashboard;