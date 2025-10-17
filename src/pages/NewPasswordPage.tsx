import React, { useState } from 'react';
import { Link, useLocation } from 'react-router'; // asegúrate de importar useLocation
import authService from '../services/authService';
import '../styles/NewPasswordPage.scss';

export const NewPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  // 👇 Aquí leemos los parámetros token y email
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const token = query.get('token');
  const email = query.get('email');

  const validate = () => {
    const errs: string[] = [];
    if (!password) errs.push('La contraseña es requerida.');
    if (password && password.length < 6) errs.push('La contraseña debe tener al menos 6 caracteres.');
    if (password !== confirm) errs.push('Las contraseñas no coinciden.');
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (errs.length > 0) return;

    setLoading(true);
    try {
      const response = await authService.resetPassword(
        token!,
        email!,
        password,
        confirm
      );
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
