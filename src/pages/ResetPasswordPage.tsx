import React, { useState } from 'react';
import "../styles/ResetPasswordPage.scss";

export const ResetPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí puedes manejar el envío del correo
    console.log('Correo enviado a:', email);
  };

  return (
    <div className="reset-password-page">
      <div className="reset-card" role="region" aria-label="Restablecer contraseña">
        <h2>Restablecer Contraseña</h2>

        <form className="reset-form" onSubmit={handleSubmit}>
          <label className="reset-label" htmlFor="email">
            Correo Electrónico
            <input
              id="email"
              className="reset-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <button type="submit" className="btn-reset">
            Enviar
          </button>

          <p className="reset-help">Recibirás un correo con instrucciones para restablecer tu contraseña.</p>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;