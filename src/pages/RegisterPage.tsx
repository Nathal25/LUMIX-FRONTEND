import React, { useState } from "react";
import "../styles/RegisterPage.scss";

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const errs: string[] = [];

    if (!name.trim()) errs.push("El nombre es requerido.");
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
    if (password && password.length < 6)
      errs.push("La contraseña debe tener al menos 6 caracteres.");
    if (password !== confirm) errs.push("Las contraseñas no coinciden.");

    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (errs.length === 0) {
      setSubmitted(true);
    } else setSubmitted(false);
  };

  return (
    <div className="register-page">

      <main className="register-main">
        <section className="register-card">
          <h2 className="card-title">Crear cuenta</h2>

          {submitted ? (
            <div className="success">
              ✅ Cuenta creada correctamente (simulado).
            </div>
          ) : (
            <form className="register-form" onSubmit={handleSubmit}>
              <label className="form-label">
                Nombre:
                <input
                  className="form-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>

              <label className="form-label">
                Apellidos:
                <input
                  className="form-input"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
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
                />
              </label>

              <label className="form-label">
                Correo:
                <input
                  className="form-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>

              <label className="form-label">
                Contraseña:
                <input
                  className="form-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>

              <label className="form-label">
                Confirmar contraseña:
                <input
                  className="form-input"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </label>

              {errors.length > 0 && (
                <ul className="form-errors">
                  {errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )}

              <button className="cta" type="submit">
                Crear cuenta
              </button>
            </form>
          )}
        </section>
      </main>
    </div>
  );
};

export default RegisterPage;
