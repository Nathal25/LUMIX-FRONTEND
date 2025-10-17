// src/services/authService.ts

import apiClient, { ApiError } from './apiClient';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  message: string;
  id: string;
  email: string;
}

interface User {
  id: string;
  email: string;
}

class AuthService {
  /**
   * Iniciar sesión
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
   * Cerrar sesión
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/api/v1/users/logout', {});
    } catch (error) {
      // Incluso si falla, limpiamos localmente
      console.error('Error al cerrar sesión:', error);
    }
  }

  /**
   * Verificar si el usuario está autenticado
   * Esta ruta debe estar protegida por el middleware authenticateToken
   */
  async checkAuth(): Promise<User | null> {
    try {
      const response = await apiClient.get<{ user: User }>('/api/v1/users/me');
      return response.user;
    } catch (error) {
      const apiError = error as ApiError;
      // Si es 401, el usuario no está autenticado
      if (apiError.status === 401) {
        return null;
      }
      throw error;
    }
  }

  /**
 * Registrar usuario
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