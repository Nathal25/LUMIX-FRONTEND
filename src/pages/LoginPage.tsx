import React from "react";
import "../styles/LoginPage.scss";

export const LoginPage: React.FC = () => {
  return (
    <div className="login-page">

      <main className="login-main">
        <section className="login-card">
          <h2 className="card-title">Iniciar sesión</h2>

          <form className="login-form">
            <label className="form-label">
              Email:
              <input className="form-input" type="email" placeholder="Ingresa tu correo" />
            </label>

            <label className="form-label">
              Contraseña:
              <input
                className="form-input"
                type="password"
                placeholder="Ingresa tu contraseña"
              />
            </label>

            <button className="btn-login" type="submit">
              Ingresar
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
