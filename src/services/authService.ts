// src/services/authService.ts
import apiClient, { ApiError } from './apiClient';

/**
 * Credenciales necesarias para iniciar sesión.
 * @interface
 */
interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Respuesta esperada al iniciar sesión.
 * @interface
 */
interface LoginResponse {
  message: string;
  id: string;
  email: string;
}

/**
 * Representa un usuario autenticado en el sistema.
 * @interface
 */
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  age: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Servicio de autenticación encargado de manejar el inicio, cierre y verificación de sesión de usuario.
 * Proporciona métodos para comunicarse con el backend mediante `apiClient`.
 * @class
 */
class AuthService {
  /**
   * Inicia sesión de usuario con las credenciales proporcionadas.
   * @async
   * @param {LoginCredentials} credentials - Objeto con el correo y la contraseña del usuario.
   * @returns {Promise<LoginResponse>} Respuesta con información básica del usuario autenticado.
   * @throws {Error} Si ocurre un error en el proceso de autenticación.
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>(
        '/api/v1/users/login',
        credentials,
      );
      // Notificar al resto de la app que cambió el estado de auth
      try {
        window.dispatchEvent(new Event('authChanged'));
      } catch (e) {
        /* no bloquear en entornos no DOM */
      }

      return response;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Error al iniciar sesión');
    }
  }

  /**
   * Cierra la sesión del usuario actual.
   * @async
   * @returns {Promise<void>} No retorna valor.
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/api/v1/users/logout', {});
      if (localStorage.getItem("user")) { localStorage.removeItem("user"); } // Clean up localStorage
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  /**
   * Verifica si el usuario actual está autenticado.
   * @async
   * @returns {Promise<User | null>} El objeto `User` si el usuario está autenticado, o `null` si no lo está.
   * @throws {ApiError} Si ocurre un error distinto de autenticación (401).
   */
  async checkAuth(): Promise<User | null> {
    try {
      const response = await apiClient.get<{ user: User }>('/api/v1/users/me');
      return response.user;
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.status === 401) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Registra un nuevo usuario en el sistema.
   * @async
   * @param {Object} userData - Datos del nuevo usuario.
   * @param {string} userData.firstName - Nombre del usuario.
   * @param {string} userData.lastName - Apellido del usuario.
   * @param {number} userData.age - Edad del usuario.
   * @param {string} userData.email - Correo electrónico del usuario.
   * @param {string} userData.password - Contraseña del usuario.
   * @param {string} userData.confirmPassword - Confirmación de la contraseña.
   * @returns {Promise<{ id: string }>} Objeto con el ID del nuevo usuario registrado.
   * @throws {Error} Si ocurre un error al registrar el usuario.
   */
  async register(userData: {
    firstName: string;
    lastName: string;
    age: number;
    email: string;
    password: string;
    confirmPassword: string;
  }): Promise<{ id: string }> {
    try {
      const response = await apiClient.post<{ id: string }>(
        '/api/v1/users/',
        userData
      );
      return response;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Error al registrar usuario');
    }
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>(
        '/api/v1/users/forgot-password',
        { email }
      );
      return response;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Error al solicitar recuperación de contraseña');
    }
  }

  /**
   * Actualiza la información del usuario autenticado.
   * 
   * Permite modificar los campos: `firstName`, `lastName`, `age` y `email`.
   * Esta operación requiere un token JWT válido (manejado automáticamente por cookies httpOnly).
   * 
   * @async
   * @param {Partial<User>} updates - Objeto con los campos a actualizar. 
   * Solo los campos definidos serán enviados al backend.
   * @returns {Promise<{ message: string }>} Mensaje de éxito del servidor.
   * @throws {Error} Si ocurre un error durante la actualización o el usuario no está autenticado.
   */
  async updateUser(updates: Partial<User>): Promise<{ message: string }> {
    try {
      const response = await apiClient.put<{ message: string }>(
        '/api/v1/users/edit-me',
        updates
      );
      return response;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Error al actualizar la información del usuario');
    }
  }

  async deleteUser(password: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(
        '/api/v1/users/me',
        { password }
      );
      return response;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Error al eliminar la cuenta del usuario');
    }
  }

  async resetPassword(token: string, email: string, password: string, confirmPassword: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>(
        '/api/v1/users/reset-password',
        { token, email, password, confirmPassword }
      );
      return response;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Error al restablecer la contraseña');
    }
  }

  /**
 * Cambia la contraseña del usuario autenticado.
 * 
 * Requiere la contraseña actual para verificación y la nueva contraseña con su confirmación.
 * Esta operación requiere un token JWT válido (manejado automáticamente por cookies httpOnly).
 * 
 * @async
 * @param {string} currentPassword - Contraseña actual del usuario para verificación.
 * @param {string} newPassword - Nueva contraseña que se desea establecer.
 * @param {string} confirmPassword - Confirmación de la nueva contraseña (debe coincidir con newPassword).
 * @returns {Promise<{ message: string }>} Mensaje de éxito del servidor.
 * @throws {Error} Si la contraseña actual es incorrecta, las contraseñas no coinciden, 
 * no cumplen con los requisitos de seguridad, o el usuario no está autenticado.
 */
  async changePassword(
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<{ message: string }> {
    try {
      const response = await apiClient.patch<{ message: string }>(
        '/api/v1/users/change-password',
        {
          currentPassword,
          password: newPassword,
          confirmPassword
        }
      );
      return response;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Error al cambiar la contraseña');
    }
  }


}

const authService = new AuthService();
export default authService;
export type { User, LoginCredentials, LoginResponse };