import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import "../styles/ProfilePage.scss";
import authService from "../services/authService";

/**
 * Representa los datos de un usuario en el sistema.
 * @interface
 */
type User = {
  /** User's first name */
  firstName: string;
  /** User's last name(s) */
  lastName: string;
  /** User's age */
  age: number;
  /** User's email address */
  email: string;
};

/**
 * Componente de página de perfil de usuario.
 * 
 * Permite visualizar y editar la información personal del usuario autenticado.
 * Los datos se cargan desde `localStorage` al montar el componente y se sincronizan
 * con el backend al guardar cambios.
 * 
 * @component
 * @returns {JSX.Element} Página de perfil con formulario de edición
 * 
 * @example
 * ```tsx
 * <ProfilePage />
 * ```
 */
export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  
  /** State that maintains the original user data for restoration */
  const [original, setOriginal] = useState<User | null>(null);
  
  /** Estado con los datos actuales del usuario (editables) */
  const [user, setUser] = useState<User | null>(null);
  
  /** List of validation errors */
  const [errors, setErrors] = useState<string[]>([]);
  
  /** Indicates if the save operation was successful */
  const [success, setSuccess] = useState(false);
  
  /** Indicates if there is a save operation in progress */
  const [loading, setLoading] = useState(false);
  
  /** Indicates if user information is being loaded from localStorage */
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  /**
   * Efecto que se ejecuta al montar el componente.
   * Carga los datos del usuario desde localStorage y redirige al login si no existen.
   */
  useEffect(() => {
    /**
     * Carga y parsea los datos del usuario desde localStorage.
     * Si no hay datos o ocurre un error, redirige al usuario a la página de login.
     * 
     * @throws {Error} Si ocurre un error al parsear los datos JSON
     */
    const loadUserFromStorage = () => {
      try {
        const userString = localStorage.getItem("user");
        if (userString) {
          const userData = JSON.parse(userString);
          const userProfile: User = {
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            age: userData.age || 0,
            email: userData.email || "",
          };
          setOriginal(userProfile);
          setUser(userProfile);
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Error al cargar usuario:", error);
        navigate("/login");
      } finally {
        setIsLoadingUser(false);
      }
    };

    loadUserFromStorage();
  }, [navigate]);

  /**
   * Valida los datos del formulario del usuario.
   * 
   * @returns {string[]} Array de mensajes de error. Array vacío si no hay errores.
   */
  const validate = (): string[] => {
    if (!user) return ["Usuario no cargado"];
    const e: string[] = [];
    if (!user.firstName.trim()) e.push("El nombre es requerido.");
    if (!user.lastName.trim()) e.push("El apellido es requerido.");
    if (!Number.isFinite(user.age) || user.age <= 0)
      e.push("La edad debe ser un número mayor que 0.");
    return e;
  };

  /**
   * Maneja el envío del formulario de actualización de perfil.
   * Valida los datos, envía la petición al backend y actualiza localStorage.
   * 
   * @async
   * @param {React.FormEvent} ev - Evento del formulario
   * @returns {Promise<void>}
   */
  const handleSubmit = async (ev: React.FormEvent): Promise<void> => {
    ev.preventDefault();
    if (!user) return;

    const v = validate();
    setErrors(v);
    setSuccess(false);

    if (v.length === 0) {
      setLoading(true);
      try {
        const res = await authService.updateUser({
          firstName: user.firstName,
          lastName: user.lastName,
          age: user.age,
          email: user.email,
        });

        console.log(res.message);
        
        const userString = localStorage.getItem("user");
        if (userString) {
          const userData = JSON.parse(userString);
          const updatedUser = {
            ...userData,
            firstName: user.firstName,
            lastName: user.lastName,
            age: user.age,
            email: user.email,
          };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          setOriginal(user);
        }

        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } catch (err) {
        console.error("Error al guardar:", err);
        setErrors(["No se pudo actualizar la información del usuario."]);
      } finally {
        setLoading(false);
      }
    }
  };

  /**
   * Restaura los datos del usuario a su estado original.
   * Limpia errores y mensajes de éxito.
   */
  const handleReset = (): void => {
    if (original) {
      setUser({ ...original });
      setErrors([]);
      setSuccess(false);
    }
  };

  /**
   * Redirige a la página de eliminación de cuenta.
   */
  const handleDelete = (): void => {
    navigate("/delete-account");
  };

  const handleChangePassword = (): void => {
    navigate("/changePassword");
  };


  if (isLoadingUser || !user) {
    return (
      <div className="profile-page">
        <div className="profile-card">
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }

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

        {success && (
          <div className="profile-success">Datos actualizados correctamente.</div>
        )}

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
              onChange={(e) =>
                setUser({ ...user, age: Number(e.target.value) })
              }
              required
            />
          </label>

          <label className="form-label" htmlFor="email">
            Correo electrónico
            <input id="email" className="form-input" value={user.email} disabled />
          </label>

          <div className="profile-actions">
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? "Guardando..." : "Guardar"}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleReset}
              disabled={loading}
            >
              Restaurar
            </button>
          </div>

          <button
            type="button"
            className="btn-changePassword"
            onClick={handleChangePassword}
            title="Cambiar contraseña"
          >
            Cambiar contraseña
          </button>

          <button
            type="button"
            className="btn-delete"
            onClick={handleDelete}
            title="Eliminar cuenta"
          >
            Eliminar cuenta
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;