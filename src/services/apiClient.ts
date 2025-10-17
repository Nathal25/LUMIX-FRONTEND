// src/services/apiClient.ts

interface ApiError {
  message: string;
  status: number;
}


class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Método principal para realizar peticiones
   */
  private async request<T>(endpoint: string, config: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        credentials: 'include', // Incluye cookies en cada petición
        headers: {
          'Content-Type': 'application/json',
          ...config.headers,
        },
        ...config,
      });

      // Manejar respuestas no exitosas
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Error ${response.status}` }));
        throw {
          message: errorData.message || `Error ${response.status}`,
          status: response.status,
        } as ApiError;
      }

      // Parsear respuesta JSON
      return await response.json();
    } catch (error: any) {
      // Si es un ApiError, lo lanzamos tal cual
      if (error.status) {
        throw error;
      }

      // Error de red u otros
      throw {
        message: error.message || 'Error de conexión',
        status: 0,
      } as ApiError;
    }
  }

  /**
   * Métodos HTTP
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async patch<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }
}

// Instancia singleton
const url = import.meta.env.VITE_API_LOCAL_URL || import.meta.env.VITE_API_PROD_URL

const apiClient = new ApiClient(
  url
);

export default apiClient;
export type { ApiError };