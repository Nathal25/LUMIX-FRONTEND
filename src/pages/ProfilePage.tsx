import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import "../styles/ProfilePage.scss";
import authService from "../services/authService";
import { ToastContainer, toast, Bounce } from 'react-toastify';

/**
 * User data type definition for the system.
 * 
 * @typedef {Object} User
 * @property {string} firstName - User's first name.
 * @property {string} lastName - User's last name(s).
 * @property {number} age - User's age.
 * @property {string} email - User's email address.
 */
type User = {
  firstName: string;
  lastName: string;
  age: number;
  email: string;
};

/**
 * User profile page component.
 * 
 * Allows viewing and editing the authenticated user's personal information.
 * Data is loaded from `localStorage` on component mount and synchronized
 * with the backend when saving changes.
 * 
 * Features:
 * - Load user data from localStorage
 * - Edit first name, last name, and age
 * - Form validation
 * - Save changes to backend and localStorage
 * - Reset form to original values
 * - Navigate to delete account page
 * - Navigate to change password page
 * - Toast notifications for success/error feedback
 * 
 * @component
 * @example
 * ```tsx
 * <ProfilePage />
 * ```
 * 
 * @returns {JSX.Element} Profile page with edit form.
 */
export const ProfilePage: React.FC = () => {
  /**
   * Navigation hook for programmatic routing.
   * @type {Function}
   */
  const navigate = useNavigate();
  
  /**
   * Toast notification function.
   * @function notify
   * @param {string} m - Message to display in toast.
   */
  const notify = (m:string) => toast(m);
  
  /**
   * State that maintains the original user data for restoration.
   * Used to reset the form to initial values.
   * @type {[User | null, Function]}
   */
  const [original, setOriginal] = useState<User | null>(null);
  
  /**
   * State with current user data (editable).
   * @type {[User | null, Function]}
   */
  const [user, setUser] = useState<User | null>(null);
  
  /**
   * List of validation errors.
   * @type {[string[], Function]}
   */
  const [errors, setErrors] = useState<string[]>([]);
  
  /**
   * Indicates if the save operation was successful.
   * @type {[boolean, Function]}
   */
  const [success, setSuccess] = useState(false);
  
  /**
   * Indicates if there is a save operation in progress.
   * @type {[boolean, Function]}
   */
  const [loading, setLoading] = useState(false);
  
  /**
   * Indicates if user information is being loaded from localStorage.
   * @type {[boolean, Function]}
   */
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  /**
   * Effect hook that runs when the component mounts.
   * Loads user data from localStorage and redirects to login if data doesn't exist.
   */
  useEffect(() => {
    /**
     * Loads and parses user data from localStorage.
     * If no data exists or an error occurs, redirects user to login page.
     * 
     * @function loadUserFromStorage
     * @throws {Error} If an error occurs while parsing JSON data.
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
   * Validates the user form data.
   * 
   * Checks for:
   * - Non-empty first name
   * - Non-empty last name
   * - Valid age (positive number)
   * 
   * @function validate
   * @returns {string[]} Array of error messages. Empty array if no errors.
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
   * Handles the profile update form submission.
   * Validates data, sends request to backend, and updates localStorage.
   * 
   * @async
   * @function handleSubmit
   * @param {React.FormEvent} ev - Form submission event.
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
        notify('Perfil actualizado exitosamente.');
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
   * Restores user data to its original state.
   * Clears errors and success messages.
   * 
   * @function handleReset
   * @returns {void}
   */
  const handleReset = (): void => {
    if (original) {
      setUser({ ...original });
      setErrors([]);
      setSuccess(false);
    }
  };

  /**
   * Navigates to the delete account page.
   * 
   * @function handleDelete
   * @returns {void}
   */
  const handleDelete = (): void => {
    navigate("/delete-account");
  };

  /**
   * Navigates to the change password page.
   * 
   * @function handleChangePassword
   * @returns {void}
   */
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