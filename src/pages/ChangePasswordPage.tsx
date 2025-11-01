import React, { useState } from 'react';
import '../styles/ChangePasswordPage.scss';
import authService from '../services/authService';
import { useNavigate } from 'react-router';
import { ToastContainer, toast, Bounce } from 'react-toastify';



/**
 * ChangePasswordPage Component
 * 
 * Provides a form interface for authenticated users to change their password.
 * Requires current password verification and validates new password confirmation.
 * 
 * @component
 * @returns {JSX.Element} The rendered change password page with form and validation
 */
export const ChangePasswordPage: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const notify = (m:string) => toast(m);
  const navigate = useNavigate();

  /**
   * Validates the password change form inputs.
   * 
   * Checks that:
   * - Current password is provided
   * - New password is provided and meets minimum length requirement (6 characters)
   * - Password confirmation is provided and matches the new password
   * 
   * @returns {string[]} Array of validation error messages. Empty if validation passes.
   */
  const validate = (): string[] => {
    const e: string[] = [];
    if (!currentPassword) e.push('La contraseña actual es requerida.');
    if (!newPassword) e.push('La nueva contraseña es requerida.');
    else if (newPassword.length < 6) e.push('La nueva contraseña debe tener al menos 6 caracteres.');
    if (!confirmPassword) e.push('Debes confirmar la nueva contraseña.');
    else if (newPassword !== confirmPassword) e.push('Las contraseñas no coinciden.');
    return e;
  };

  /**
   * Handles the password change form submission.
   * 
   * Validates input fields, calls the authentication service to change the password,
   * displays success message, clears form fields, and redirects to profile page after 2 seconds.
   * 
   * @async
   * @param {React.FormEvent} ev - The form submission event
   * @returns {Promise<void>}
   */
  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setErrors([]);
    setSuccess(false);
    
    const v = validate();
    if (v.length) {
      setErrors(v);
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword(currentPassword, newPassword, confirmPassword);
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      notify('Contraseña cambiada exitosamente.');
      // Redirect to profile page after 2 seconds
      setTimeout(() => {
        navigate('/profile');
      }, 3500);
    } catch (err: any) {
      setErrors([err.message || 'Error al cambiar la contraseña']);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-page">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Bounce}
      />
      <div className="change-password-card" role="region" aria-label="Cambiar contraseña">
        <h2 className="change-password-title">Cambiar contraseña</h2>

        <p className="change-password-info">
          Introduce tu contraseña actual y luego tu nueva contraseña.
          Asegúrate de que la nueva contraseña sea segura.
        </p>

        {errors.length > 0 && (
          <ul className="change-password-errors" aria-live="assertive">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        )}

        {success && (
          <div className="change-password-success" aria-live="polite">
            Contraseña cambiada exitosamente. Redirigiendo...
          </div>
        )}

        <form className="change-password-form" onSubmit={handleSubmit} noValidate>
          <label className="form-label" htmlFor="currentPassword">
            Contraseña actual
            <input
              id="currentPassword"
              className="form-input"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>

          <label className="form-label" htmlFor="newPassword">
            Nueva contraseña
            <input
              id="newPassword"
              className="form-input"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </label>

          <label className="form-label" htmlFor="confirmPassword">
            Repetir nueva contraseña
            <input
              id="confirmPassword"
              className="form-input"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </label>

          <button type="submit" className="btn-change-password" disabled={loading}>
            {loading ? 'Cambiando...' : 'Cambiar contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordPage;