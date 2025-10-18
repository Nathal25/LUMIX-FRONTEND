import React, { useState } from 'react';
import '../styles/DeleteAccountPage.scss';
import authService from '../services/authService';
import { useNavigate } from 'react-router';

export const DeleteAccountPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  const validate = (): string[] => {
    const e: string[] = [];
    if (!password) e.push('La contraseña es requerida.');
    if (!confirmText) e.push('Debes escribir ELIMINAR para confirmar.');
    else if (confirmText.trim().toUpperCase() !== 'ELIMINAR')
      e.push('Texto de confirmación incorrecto. Escribe exactamente ELIMINAR.');
    return e;
  };

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
      const response = await authService.deleteUser(password);
      console.log('Cuenta eliminada:', response.message);
      setDone(true);
      navigate("/login");
    } catch (err: any) {
      setErrors([err.message || 'Error al eliminar la cuenta']);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

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