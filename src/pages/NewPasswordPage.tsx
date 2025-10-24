import React, { useState } from 'react';
import { Link, useLocation } from 'react-router'; 
import authService from '../services/authService';
import '../styles/NewPasswordPage.scss';

/**
 * NewPasswordPage Component
 * 
 * Provides an interface for users to create a new password after requesting
 * a password reset. This page is accessed via a unique token and email 
 * combination sent to the user's email address.
 * 
 * Features:
 * - Token and email validation from URL query parameters
 * - Password confirmation matching
 * - Password visibility toggle
 * - Form validation with error display
 * - Success state with redirect to login
 * - Loading states during submission
 * 
 * @component
 * @returns {JSX.Element} The rendered new password page with form or success message
 */
export const NewPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const token = query.get('token');
  const email = query.get('email');

  /**
   * Validates the new password form inputs.
   * 
   * Checks that:
   * - Password is provided
   * - Password meets minimum length requirement (6 characters)
   * - Password and confirmation match
   * 
   * @returns {string[]} Array of validation error messages. Empty if validation passes.
   */
  const validate = () => {
    const errs: string[] = [];
    if (!password) errs.push('La contraseña es requerida.');
    if (password && password.length < 6) errs.push('La contraseña debe tener al menos 6 caracteres.');
    if (password !== confirm) errs.push('Las contraseñas no coinciden.');
    return errs;
  };

  /**
   * Handles the new password form submission.
   * 
   * Validates inputs, calls the authentication service to reset the password
   * using the token and email from URL parameters, displays success message,
   * and clears the form fields.
   * 
   * @async
   * @param {React.FormEvent} e - The form submission event
   * @returns {Promise<void>}
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (errs.length > 0) return;

    setLoading(true);
    try {
      const response = await authService.resetPassword(token!, email!, password, confirm);
      console.log('Contraseña cambiada:', response.message);
      setSuccess(true);
      setPassword('');
      setConfirm('');
    } catch (error: any) {
      setErrors([error.message || 'Error al actualizar la contraseña']);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="newpass-page">
      <div className="newpass-card" role="region" aria-label="Crear nueva contraseña">
        <h2 className="newpass-title">Crear nueva contraseña</h2>

        {success ? (
          <div className="newpass-success" role="status">
            <p>Tu contraseña se actualizó correctamente.</p>
            <Link to="/login" className="newpass-cta">Ir a iniciar sesión</Link>
          </div>
        ) : (
          <form className="newpass-form" onSubmit={handleSubmit} noValidate>
            {errors.length > 0 && (
              <ul className="newpass-errors" aria-live="assertive">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            )}

            <label className="form-label" htmlFor="password">
              Nueva contraseña
              <input
                id="password"
                className="form-input"
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </label>

            <label className="form-label" htmlFor="confirm">
              Confirmar contraseña
              <input
                id="confirm"
                className="form-input"
                type={show ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
              />
            </label>

            <div className="show-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={show}
                  onChange={() => setShow((v) => !v)}
                /> Mostrar contraseña
              </label>
            </div>

            <button type="submit" className="newpass-btn" disabled={loading}>
              {loading ? 'Actualizando...' : 'Guardar contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default NewPasswordPage;