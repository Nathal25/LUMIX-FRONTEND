import React, { useState } from 'react';
import '../styles/DeleteAccountPage.scss';
import authService from '../services/authService';
import { useNavigate } from 'react-router';

/**
 * DeleteAccountPage Component
 * 
 * Provides a secure interface for users to permanently delete their account.
 * Requires both password verification and explicit confirmation text ("ELIMINAR")
 * to prevent accidental deletions. This action is irreversible.
 * 
 * Features:
 * - Double confirmation (password + confirmation text)
 * - Form validation
 * - Loading states
 * - Success state with redirect to login
 * - Global auth state update
 * 
 * @component
 * @returns {JSX.Element} The rendered delete account page with confirmation form or success message
 */
export const DeleteAccountPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  /**
   * Validates the account deletion form inputs.
   * 
   * Checks that:
   * - Password is provided
   * - Confirmation text is provided
   * - Confirmation text exactly matches "ELIMINAR" (case-insensitive)
   * 
   * @returns {string[]} Array of validation error messages. Empty if validation passes.
   */
  const validate = (): string[] => {
    const e: string[] = [];
    if (!password) e.push('La contraseña es requerida.');
    if (!confirmText) e.push('Debes escribir ELIMINAR para confirmar.');
    else if (confirmText.trim().toUpperCase() !== 'ELIMINAR')
      e.push('Texto de confirmación incorrecto. Escribe exactamente ELIMINAR.');
    return e;
  };

  /**
   * Handles the account deletion form submission.
   * 
   * Validates inputs, calls the authentication service to delete the user account,
   * logs out the user, updates global auth state, displays success message,
   * and redirects to the login page.
   * 
   * @async
   * @param {React.FormEvent} ev - The form submission event
   * @returns {Promise<void>}
   */
  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setErrors([]);
    const v = validate();
    if (v.length) {
      setErrors(v);
      return;
    }

    setLoading(true);
    try {
      await authService.deleteUser(password);
      await authService.logout();
      window.dispatchEvent(new Event('authChanged')) // Change auth state globally
      setDone(true);
      navigate("/login");
    } catch (err: any) {
      setErrors([err.message || 'Error al eliminar la cuenta']);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Success state: show confirmation message
  if (done) {
    return (
      <div className="delete-page">
        <div className="delete-card" role="region" aria-label="Cuenta eliminada">
          <h2 className="delete-title">Cuenta eliminada</h2>
          <p className="delete-message">Tu cuenta ha sido eliminada correctamente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="delete-page">
      <div className="delete-card" role="region" aria-label="Eliminar cuenta">
        <h2 className="delete-title">Eliminar cuenta</h2>

        <p className="delete-warning">
          Atención: esta acción es irreversible. Se eliminarán todos tus datos.
          Escribe <strong>ELIMINAR</strong> y proporciona tu contraseña para confirmar.
        </p>

        {errors.length > 0 && (
          <ul className="delete-errors" aria-live="assertive">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        )}

        <form className="delete-form" onSubmit={handleSubmit} noValidate>

          <label className="form-label" htmlFor="confirm">
            ¿Estas seguro de que deseas eliminar tu cuenta?
            <input
              id="confirm"
              className="form-input"
              placeholder='ELIMINAR'
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              required
              aria-describedby="confirmHelp"
            />
          </label>
          <p id="confirmHelp" className="confirm-help">
            Para confirmar, escribe ELIMINAR (no sensible a mayúsculas/minúsculas).
          </p>
          <label className="form-label" htmlFor="password">
            Contraseña
            <input
              id="password"
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>

          <button type="submit" className="btn-delete" disabled={loading}>
            {loading ? 'Eliminando...' : 'Eliminar cuenta'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DeleteAccountPage;