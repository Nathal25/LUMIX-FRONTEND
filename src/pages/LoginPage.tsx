import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import "../styles/LoginPage.scss";

/**
 * Página de inicio de sesión de usuarios.
 *
 * Este componente renderiza un formulario que permite a los usuarios autenticarse
 * con su correo electrónico y contraseña. Al iniciar sesión exitosamente, redirige
 * al usuario al panel principal (`/dashboard`).
 *
 * Se comunica con `authService` para:
 * - Enviar las credenciales al backend (`login`)
 * - Verificar si el usuario está autenticado (`checkAuth`)
 *
 * También maneja los errores de autenticación y muestra mensajes en pantalla.
 *
 * @component
 * @example
 * ```tsx
 * <LoginPage />
 * ```
 *
 * @returns {JSX.Element} El componente de la página de inicio de sesión.
 */
export const LoginPage: React.FC = () => {
  /** Estado del correo electrónico ingresado por el usuario */
  const [email, setEmail] = useState("");

  /** Estado de la contraseña ingresada por el usuario */
  const [password, setPassword] = useState("");

  /** Estado del mensaje de error mostrado en caso de fallo de autenticación */
  const [error, setError] = useState("");

  /** Estado que indica si la petición de login está en curso */
  const [loading, setLoading] = useState(false);

  /** Hook de navegación para redirigir al dashboard tras el login */
  const navigate = useNavigate();

  /**
   * Maneja el envío del formulario de inicio de sesión.
   *
   * Envía las credenciales al servicio de autenticación (`authService.login`),
   * verifica si el usuario fue autenticado (`authService.checkAuth`) y redirige
   * al panel principal. En caso de error, muestra un mensaje descriptivo.
   *
   * @param {FormEvent} e - Evento del formulario.
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
            <label className="form-label">
              Email:
              <input
                className="form-input"
                type="email"
                placeholder="Ingresa tu correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </label>

            <label className="form-label">
              Contraseña:
              <input
                className="form-input"
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </label>

            <button className="btn-login" type="submit" disabled={loading}>
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          <div className="login-links">
            <p>
              ¿No tienes una cuenta?{" "}
              <a href="/register" className="link-register">
                Regístrate aquí
              </a>
            </p>
            <a href="#" className="link-forgot">
              ¿Tienes problemas para iniciar sesión? Haz click aquí
            </a>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LoginPage;
