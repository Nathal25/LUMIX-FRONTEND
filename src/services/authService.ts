// src/services/authService.ts
import apiClient, { ApiError } from './apiClient';

/**
 * Necessary credentials to log in.
 * @interface
 */
interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Expected response when logging in.
 * @interface
 */
interface LoginResponse {
  message: string;
  id: string;
  email: string;
}

/**
 * Represents a user in the system.
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
 * Authentication service responsible for handling user login, logout, and session verification.
 * Provides methods to communicate with the backend using `apiClient`.
 * @class
 */
class AuthService {
  /**
   * User login with email and password.
   * @async
   * @param {LoginCredentials} credentials - Object with the user's email and password.
   * @returns {Promise<LoginResponse>} Response with basic information of the authenticated user.
   * @throws {Error} If an error occurs during the authentication process.
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>(
        '/api/v1/users/login',
        credentials,
      );
      // Notify the rest of the app that the auth state has changed
      try {
        window.dispatchEvent(new Event('authChanged'));
      } catch (e) {
        /* don't block in non-DOM environments */
      }

      return response;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Error al iniciar sesión');
    }
  }

  /**
   * Logs out the current user.
   * @async
   * @returns {Promise<void>} No return value.
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
   * Verifies if the current user is authenticated.
   * @async
   * @returns {Promise<User | null>} The `User` object if the user is authenticated, or `null` if not.
   * @throws {ApiError} If an error occurs other than authentication (401).
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
   * Registers a new user in the system.
   * @async
   * @param {Object} userData - Data of the new user.
   * @param {string} userData.firstName - First name of the user.
   * @param {string} userData.lastName - Last name of the user.
   * @param {number} userData.age - Age of the user.
   * @param {string} userData.email - Email of the user.
   * @param {string} userData.password - Password of the user.
   * @param {string} userData.confirmPassword - Password confirmation.
   * @returns {Promise<{ id: string }>} Object with the ID of the newly registered user.
   * @throws {Error} If an error occurs while registering the user.
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
   * Updates the information of the authenticated user.
   *
   * Allows modifying the fields: `firstName`, `lastName`, `age`, and `email`.
   * This operation requires a valid JWT token (automatically handled by httpOnly cookies).
   *
   * @async
   * @param {Partial<User>} updates - Object with the fields to update.
   * Only the defined fields will be sent to the backend.
   * @returns {Promise<{ message: string }>} Success message from the server.
   * @throws {Error} If an error occurs during the update or the user is not authenticated.
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
 * Changes the password of the authenticated user.
 *
 * Requires the current password for verification and the new password with its confirmation.
 * This operation requires a valid JWT token (automatically handled by httpOnly cookies).
 *
 * @async
 * @param {string} currentPassword - Current password of the user for verification.
 * @param {string} newPassword - New password to be set.
 * @param {string} confirmPassword - Confirmation of the new password (must match newPassword).
 * @returns {Promise<{ message: string }>} Success message from the server.
 * @throws {Error} If the current password is incorrect, the passwords do not match,
 * do not meet security requirements, or the user is not authenticated.
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