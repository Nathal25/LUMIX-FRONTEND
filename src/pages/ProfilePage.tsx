import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import '../styles/ProfilePage.scss';

type User = {
  firstName: string;
  lastName: string;
  age: number;
  email: string;
};

const MOCK_USER: User = {
  firstName: 'Juan',
  lastName: 'Pérez',
  age: 30,
  email: 'juan.perez@example.com',
};

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [original] = useState<User>(MOCK_USER); // reemplaza con fetch real si hace falta
  const [user, setUser] = useState<User>({ ...original });
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  const validate = (): string[] => {
    const e: string[] = [];
    if (!user.firstName.trim()) e.push('El nombre es requerido.');
    if (!user.lastName.trim()) e.push('El apellido es requerido.');
    if (!Number.isFinite(user.age) || user.age <= 0) e.push('La edad debe ser un número mayor que 0.');
    return e;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const v = validate();
    setErrors(v);
    setSuccess(false);
    if (v.length === 0) {
      // aquí llamarías a la API para guardar los cambios
      console.log('Guardando usuario:', user);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const handleReset = () => {
    setUser({ ...original });
    setErrors([]);
    setSuccess(false);
  };

  const handleDelete = () => {
    // redirige a la vista de eliminación de cuenta
    navigate('/delete-account');
  };

  return (
    <div className="profile-page">
      <div className="profile-card" role="region" aria-label="Perfil de usuario">
        <h2 className="profile-title">Mi perfil</h2>

        {errors.length > 0 && (
          <ul className="profile-errors" aria-live="assertive">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        )}

        {success && <div className="profile-success">Datos actualizados correctamente.</div>}

        <form className="profile-form" onSubmit={handleSubmit} noValidate>
          <label className="form-label" htmlFor="firstName">
            Nombre
            <input
              id="firstName"
              className="form-input"
              value={user.firstName}
              onChange={(e) => setUser({ ...user, firstName: e.target.value })}
              required
              autoComplete="given-name"
            />
          </label>

          <label className="form-label" htmlFor="lastName">
            Apellidos
            <input
              id="lastName"
              className="form-input"
              value={user.lastName}
              onChange={(e) => setUser({ ...user, lastName: e.target.value })}
              required
              autoComplete="family-name"
            />
          </label>

          <label className="form-label" htmlFor="age">
            Edad
            <input
              id="age"
              className="form-input"
              type="number"
              min={1}
              value={String(user.age)}
              onChange={(e) => setUser({ ...user, age: Number(e.target.value) })}
              required
            />
          </label>

          <label className="form-label" htmlFor="email">
            Correo electrónico
            <input
              id="email"
              className="form-input"
              value={user.email}
              disabled
              aria-disabled="true"
            />
          </label>

          <div className="profile-actions">
            <button type="submit" className="btn-save">Guardar</button>
            <button type="button" className="btn-secondary" onClick={handleReset}>Restaurar</button>
          </div>
          <div>
            <button type="button" className="btn-delete" onClick={handleDelete} title="Eliminar cuenta">Eliminar cuenta</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;