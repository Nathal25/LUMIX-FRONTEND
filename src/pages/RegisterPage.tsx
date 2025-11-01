import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import "../styles/RegisterPage.scss";
import { useSpeech } from "../contexts/SpeechContext";

/**
 * RegisterPage Component
 * 
 * Provides a registration form for new users to create an account.
 * Collects user information including name, email, age, and password,
 * validates the inputs, and creates a new user account via the authentication service.
 * 
 * Features:
 * - Comprehensive form validation (email format, age range, password strength)
 * - Password confirmation matching
 * - Password requirements: minimum 8 characters, uppercase letter, number, and special character
 * - Age restriction (minimum 13 years old)
 * - Loading states during submission
 * - Error display for validation and API errors
 * - Redirect to login page after successful registration
 * 
 * @component
 * @returns {JSX.Element} The rendered registration page with form
 */
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

  /** Speech synthesis context for accessibility */
  const { handleSpeak } = useSpeech();

  /**
   * Validates all registration form inputs.
   * 
   * Validation rules:
   * - First name and last name are required
   * - Email is required and must match valid email format
   * - Age is required, must be a valid number between 13 and 120
   * - Password is required, minimum 8 characters
   * - Password must contain at least one uppercase letter, one number, and one special character
   * - Password and confirmation password must match
   * 
   * @returns {string[]} Array of validation error messages. Empty if validation passes.
   */
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
    
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/;
    if (password && !passwordRegex.test(password)) {
      errs.push("La contraseña debe contener al menos una mayúscula, un número y un carácter especial.");
    }
    
    if (password !== confirmPassword) errs.push("Las contraseñas no coinciden.");

    return errs;
  };

  /**
   * Handles the registration form submission.
   * 
   * Validates all inputs, calls the authentication service to create a new user account,
   * and redirects to the login page upon successful registration.
   * Displays error messages if validation fails or registration encounters an error.
   * 
   * @async
   * @param {FormEvent} e - The form submission event
   * @returns {Promise<void>}
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate fields
    const errs = validate();
    setErrors(errs);
    
    if (errs.length > 0) {
      return;
    }

    setLoading(true);

    try {
      // Call registration service
      const response = await authService.register({
        firstName,
        lastName,
        email,
        age: Number(age),
        password,
        confirmPassword,
      });

      console.log("Registro exitoso:", response);
      
      // Redirect to login or dashboard
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
            <label 
              className="form-label"
              onMouseEnter={() => handleSpeak('Campo de nombre')}
              onFocus={() => handleSpeak('Campo de nombre')}
            >
              Nombre:
              <input
                className="form-input"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                onFocus={() => handleSpeak('Ingresa tu nombre')}
                disabled={loading}
                aria-label="Campo de nombre"
              />
            </label>

            <label 
              className="form-label"
              onMouseEnter={() => handleSpeak('Campo de apellidos')}
              onFocus={() => handleSpeak('Campo de apellidos')}
            >
              Apellidos:
              <input
                className="form-input"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                onFocus={() => handleSpeak('Ingresa tus apellidos')}
                disabled={loading}
                aria-label="Campo de apellidos"
              />
            </label>

            <label 
              className="form-label"
              onMouseEnter={() => handleSpeak('Campo de edad, mínimo 13 años')}
              onFocus={() => handleSpeak('Campo de edad, mínimo 13 años')}
            >
              Edad:
              <input
                className="form-input"
                type="number"
                min={13}
                max={120}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                onFocus={() => handleSpeak('Ingresa tu edad, debes tener al menos 13 años')}
                disabled={loading}
                aria-label="Campo de edad"
              />
            </label>

            <label 
              className="form-label"
              onMouseEnter={() => handleSpeak('Campo de correo electrónico')}
              onFocus={() => handleSpeak('Campo de correo electrónico')}
            >
              Correo:
              <input
                className="form-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => handleSpeak('Ingresa tu correo electrónico')}
                disabled={loading}
                aria-label="Campo de correo electrónico"
              />
            </label>

            <label 
              className="form-label"
              onMouseEnter={() => handleSpeak('Campo de contraseña, mínimo 8 caracteres, debe incluir mayúscula, número y carácter especial')}
              onFocus={() => handleSpeak('Campo de contraseña')}
            >
              Contraseña:
              <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => handleSpeak('Ingresa tu contraseña, mínimo 8 caracteres con mayúscula, número y carácter especial')}
                disabled={loading}
                aria-label="Campo de contraseña"
              />
            </label>

            <label 
              className="form-label"
              onMouseEnter={() => handleSpeak('Campo de confirmación de contraseña')}
              onFocus={() => handleSpeak('Campo de confirmación de contraseña')}
            >
              Confirmar contraseña:
              <input
                className="form-input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => handleSpeak('Confirma tu contraseña')}
                disabled={loading}
                aria-label="Campo de confirmación de contraseña"
              />
            </label>

            {errors.length > 0 && (
              <ul className="form-errors">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            )}

            <button 
              className="cta" 
              type="submit" 
              disabled={loading}
              onMouseEnter={() => handleSpeak(loading ? 'Creando cuenta, por favor espera' : 'Botón crear cuenta')}
              onFocus={() => handleSpeak(loading ? 'Creando cuenta, por favor espera' : 'Botón crear cuenta')}
            >
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          <div className="register-links" style={{ marginTop: '1rem', textAlign: 'center' }}>
            <p>
              ¿Ya tienes una cuenta?{" "}
              <a 
                href="/login" 
                className="link-login"
                onMouseEnter={() => handleSpeak('Ir a iniciar sesión')}
                onFocus={() => handleSpeak('Ir a iniciar sesión')}
              >
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