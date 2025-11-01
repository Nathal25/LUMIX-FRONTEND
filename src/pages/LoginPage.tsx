import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import "../styles/LoginPage.scss";
import { useSpeech } from "../contexts/SpeechContext";

/**
 * Login page component for user authentication.
 *
 * This component renders a form that allows users to authenticate
 * with their email and password. Upon successful login, it redirects
 * the user to the main dashboard (`/dashboard`).
 *
 * It communicates with `authService` to:
 * - Send credentials to the backend (`login`)
 * - Verify if the user is authenticated (`checkAuth`)
 *
 * It also handles authentication errors and displays messages on screen.
 *
 * @component
 * @example
 * ```tsx
 * <LoginPage />
 * ```
 *
 * @returns {JSX.Element} The login page component.
 */
export const LoginPage: React.FC = () => {
  /**
   * State for the email entered by the user.
   * @type {string}
   */
  const [email, setEmail] = useState("");

  /**
   * State for the password entered by the user.
   * @type {string}
   */
  const [password, setPassword] = useState("");

  /**
   * State for the error message shown in case of authentication failure.
   * @type {string}
   */
  const [error, setError] = useState("");

  /**
   * State indicating if the login request is in progress.
   * @type {boolean}
   */
  const [loading, setLoading] = useState(false);

  /**
   * Navigation hook to redirect to dashboard after login.
   * @type {Function}
   */
  const navigate = useNavigate();

  /**
   * Speech synthesis context for accessibility features.
   * @type {Object}
   */
  const { handleSpeak } = useSpeech();

  /**
   * Handles the form submission.
   *
   * Sends the credentials to the authentication service (`authService.login`),
   * checks if the user was authenticated (`authService.checkAuth`) and redirects
   * to the main dashboard. In case of error, it displays a descriptive message.
   *
   * @async
   * @function handleSubmit
   * @param {FormEvent} e - The form event.
   * @returns {Promise<void>}
   */
  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      
      const loginResponse = await authService.login({ email, password });
      console.log("Login exitoso:", loginResponse);

      
      const userData = await authService.checkAuth();
      console.log("Datos del usuario:", userData);

      
      if (userData) {
        localStorage.setItem("user", JSON.stringify(userData));
      }

      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
      console.error("Error en login:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <main className="login-main">
        <section className="login-card">
          <h2 className="card-title">Iniciar sesión</h2>

          {error && (
            <div
              className="error-message"
              style={{
                color: "red",
                marginBottom: "1rem",
                padding: "0.5rem",
                backgroundColor: "#ffe6e6",
                borderRadius: "4px",
              }}
            >
              {error}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <label 
              className="form-label"
              onMouseEnter={() => handleSpeak('Campo de correo electrónico')}
              onFocus={() => handleSpeak('Campo de correo electrónico')}
            >
              Email:
              <input
                className="form-input"
                type="email"
                placeholder="Ingresa tu correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => handleSpeak('Ingresa tu correo electrónico')}
                required
                disabled={loading}
                aria-label="Campo de correo electrónico"
              />
            </label>

            <label 
              className="form-label"
              onMouseEnter={() => handleSpeak('Campo de contraseña')}
              onFocus={() => handleSpeak('Campo de contraseña')}
            >
              Contraseña:
              <input
                className="form-input"
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => handleSpeak('Ingresa tu contraseña')}
                required
                disabled={loading}
                aria-label="Campo de contraseña"
              />
            </label>

            <button 
              className="btn-login" 
              type="submit" 
              disabled={loading}
              onMouseEnter={() => handleSpeak(loading ? 'Ingresando, por favor espera' : 'Botón ingresar')}
              onFocus={() => handleSpeak(loading ? 'Ingresando, por favor espera' : 'Botón ingresar')}
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          <div className="login-links">
            <p>
              ¿No tienes una cuenta?{" "}
              <a 
                href="/register" 
                className="link-register"
                onMouseEnter={() => handleSpeak('Crear una cuenta nueva')}
                onFocus={() => handleSpeak('Crear una cuenta nueva')}
              >
                Regístrate aquí
              </a>
            </p>
            <a 
              className="link-forgot" 
              onClick={() => navigate('/reset-password')}
              onMouseEnter={() => handleSpeak('Recuperar contraseña olvidada')}
              onFocus={() => handleSpeak('Recuperar contraseña olvidada')}
              tabIndex={0}
              role="button"
              onKeyPress={(e) => e.key === 'Enter' && navigate('/reset-password')}
            >
              ¿Olvidaste tu contraseña? Haz click aquí
            </a>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LoginPage;