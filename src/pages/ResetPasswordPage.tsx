import React, { useState, FormEvent } from 'react';
import authService from '../services/authService';
import "../styles/ResetPasswordPage.scss";
import { useNavigate } from "react-router-dom";

/**
 * Password reset page component.
 * 
 * Allows users to request a password reset by entering their email address.
 * Sends a request to the backend which will email password reset instructions
 * to the provided email address if it exists in the system.
 * 
 * Features:
 * - Email input validation
 * - Loading state during API request
 * - Success message display
 * - Error handling and display
 * - Navigation back to login page
 * 
 * @component
 * @example
 * ```tsx
 * <ResetPasswordPage />
 * ```
 * 
 * @returns {JSX.Element} The password reset page component.
 */
export const ResetPasswordPage: React.FC = () => {
  /**
   * State for the email address entered by the user.
   * @type {[string, Function]}
   */
  const [email, setEmail] = useState('');
  
  /**
   * State indicating if the reset request is in progress.
   * @type {[boolean, Function]}
   */
  const [loading, setLoading] = useState(false);
  
  /**
   * State for error messages.
   * @type {[string, Function]}
   */
  const [error, setError] = useState('');
  
  /**
   * State indicating if the reset email was sent successfully.
   * @type {[boolean, Function]}
   */
  const [success, setSuccess] = useState(false);

  /**
   * Navigation hook for programmatic routing.
   * @type {Function}
   */
  const navigate = useNavigate();

  /**
   * Handles the password reset form submission.
   * Sends the email to the authentication service and displays
   * success or error messages accordingly.
   * 
   * @async
   * @function handleSubmit
   * @param {FormEvent} e - Form submission event.
   * @returns {Promise<void>}
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const response = await authService.forgotPassword(email);
      console.log('Correo enviado:', response.message);
      setSuccess(true);
      setEmail(''); // Clear the field
    } catch (err: any) {
      setError(err.message || 'Error al enviar el correo de recuperación');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-page">
      <div className="reset-card" role="region" aria-label="Restablecer contraseña">
        <h2>Restablecer Contraseña</h2>

        {success && (
          <div className="success-message" style={{
            color: '#2e7d32',
            backgroundColor: '#e8f5e9',
            padding: '0.75rem',
            borderRadius: '4px',
            marginBottom: '1rem',
            borderLeft: '4px solid #2e7d32'
          }}>
            Correo enviado exitosamente. Revisa tu bandeja de entrada.
          </div>
        )}

        {error && (
          <div className="error-message" style={{
            color: '#d32f2f',
            backgroundColor: '#ffe6e6',
            padding: '0.75rem',
            borderRadius: '4px',
            marginBottom: '1rem',
            borderLeft: '4px solid #d32f2f'
          }}>
            {error}
          </div>
        )}

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
              disabled={loading}
              placeholder="tucorreo@ejemplo.com"
            />
          </label>

          <button 
            type="submit" 
            className="btn-reset"
            disabled={loading}
          >
            {loading ? 'Enviando...' : 'Enviar'}
          </button>

          <p className="reset-help">
            Recibirás un correo con instrucciones para restablecer tu contraseña.
          </p>

          <div className="reset-links" style={{ marginTop: '1rem', textAlign: 'center' }}>
            <a  className="link-back" onClick={() => navigate('/login')}>
              ← Volver al inicio de sesión
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;