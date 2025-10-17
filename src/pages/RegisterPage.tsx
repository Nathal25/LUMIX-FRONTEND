import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import "../styles/RegisterPage.scss";

export const RegisterPage: React.FC = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const errs: string[] = [];

    if (!firstName.trim()) errs.push("El nombre es requerido.");
    if (!lastName.trim()) errs.push("Los apellidos son requeridos.");

    if (!email.trim()) errs.push("El correo es requerido.");
    else {
      const re = /\S+@\S+\.\S+/;
      if (!re.test(email)) errs.push("El formato del correo no es válido.");
    }

    if (!age.trim()) errs.push("La edad es requerida.");
    else {
      const n = Number(age);
      if (Number.isNaN(n) || !Number.isFinite(n))
        errs.push("La edad debe ser un número válido.");
      else if (n < 13) errs.push("Debes tener al menos 13 años.");
      else if (n > 120) errs.push("Ingresa una edad válida.");
    }

    if (!password) errs.push("La contraseña es requerida.");
    if (password && password.length < 8)
      errs.push("La contraseña debe tener al menos 8 caracteres.");
    
    // Validar que tenga mayúscula, número y carácter especial
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/;
    if (password && !passwordRegex.test(password)) {
      errs.push("La contraseña debe contener al menos una mayúscula, un número y un carácter especial.");
    }
    
    if (password !== confirmPassword) errs.push("Las contraseñas no coinciden.");

    return errs;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validar campos
    const errs = validate();
    setErrors(errs);
    
    if (errs.length > 0) {
      return;
    }

    setLoading(true);

    try {
      // Llamar al servicio de registro
      const response = await authService.register({
        firstName,
        lastName,
        email,
        age: Number(age),
        password,
        confirmPassword,
      });

      console.log("Registro exitoso:", response);
      
      // Redirigir al login o dashboard
      navigate("/login");
      
    } catch (error: any) {
      setErrors([error.message || "Error al crear la cuenta"]);
      console.error("Error en registro:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <main className="register-main">
        <section className="register-card">
          <h2 className="card-title">Crear cuenta</h2>

          <form className="register-form" onSubmit={handleSubmit}>
            <label className="form-label">
              Nombre:
              <input
                className="form-input"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={loading}
              />
            </label>

            <label className="form-label">
              Apellidos:
              <input
                className="form-input"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={loading}
              />
            </label>

            <label className="form-label">
              Edad:
              <input
                className="form-input"
                type="number"
                min={13}
                max={120}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                disabled={loading}
              />
            </label>

            <label className="form-label">
              Correo:
              <input
                className="form-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </label>

            <label className="form-label">
              Contraseña:
              <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </label>

            <label className="form-label">
              Confirmar contraseña:
              <input
                className="form-input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </label>

            {errors.length > 0 && (
              <ul className="form-errors">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            )}

            <button className="cta" type="submit" disabled={loading}>
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          <div className="register-links" style={{ marginTop: '1rem', textAlign: 'center' }}>
            <p>
              ¿Ya tienes una cuenta?{" "}
              <a href="/login" className="link-login">
                Inicia sesión aquí
              </a>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default RegisterPage;