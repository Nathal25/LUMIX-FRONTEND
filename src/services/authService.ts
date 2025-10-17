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
}

const authService = new AuthService();
export default authService;
export type { User, LoginCredentials, LoginResponse };
