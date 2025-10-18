// src/services/apiClient.ts

/**
 * Representa un error de API con mensaje y código de estado HTTP.
 */
interface ApiError {
  /** Mensaje descriptivo del error. */
  message: string;
  /** Código de estado HTTP (0 si es error de red). */
  status: number;
}

/**
 * Cliente HTTP genérico para interactuar con el backend.
 *
 * Encapsula las peticiones `fetch` con configuración predeterminada:
 * - Base URL configurable.
 * - Inclusión automática de cookies (`credentials: 'include'`).
 * - Manejo centralizado de errores.
 * - Métodos genéricos (`get`, `post`, `put`, `delete`, `patch`).
 *
 * @example
 * ```ts
 * const users = await apiClient.get<User[]>("/users");
 * const newUser = await apiClient.post<User>("/users", { name: "Pablo" });
 * ```
 */
class ApiClient {
  private baseURL: string;

  /**
   * Crea una nueva instancia del cliente API.
   * @param baseURL - URL base del backend (por ejemplo: "https://api.miapp.com")
   */
  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Realiza una petición HTTP genérica usando `fetch`.
   *
   * Se encarga de:
   * - Construir la URL completa.
   * - Incluir cookies (para autenticación por `httpOnly`).
   * - Manejar errores de red o respuestas no exitosas.
   *
   * @template T Tipo esperado de la respuesta.
   * @param endpoint - Ruta del recurso (por ejemplo, "/users").
   * @param config - Configuración opcional del `RequestInit`.
   * @returns Promesa que resuelve con los datos de tipo `T`.
   * @throws {ApiError} Si ocurre un error HTTP o de red.
   */
  private async request<T>(endpoint: string, config: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...config.headers,
        },
        ...config,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Error ${response.status}` }));
        throw {
          message: errorData.message || `Error ${response.status}`,
          status: response.status,
        } as ApiError;
      }

      return await response.json();
    } catch (error: any) {
      if (error.status) throw error;

      throw {
        message: error.message || "Error de conexión",
        status: 0,
      } as ApiError;
    }
  }

  /**
   * Envía una petición GET.
   * @template T Tipo esperado de la respuesta.
   * @param endpoint - Ruta del recurso.
   * @returns Promesa con los datos de tipo `T`.
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  /**
   * Envía una petición POST.
   * @template T Tipo esperado de la respuesta.
   * @param endpoint - Ruta del recurso.
   * @param body - Cuerpo de la petición (opcional).
   * @returns Promesa con los datos de tipo `T`.
   */
  async post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  /**
   * Envía una petición PUT.
   * @template T Tipo esperado de la respuesta.
   * @param endpoint - Ruta del recurso.
   * @param body - Cuerpo de la petición (opcional).
   * @returns Promesa con los datos de tipo `T`.
   */
  async put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  /**
   * Envía una petición DELETE.
   * @template T Tipo esperado de la respuesta.
   * @param endpoint - Ruta del recurso.
   * @returns Promesa con los datos de tipo `T`.
   */
  async delete<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE", body: JSON.stringify(body) });
  }

  /**
   * Envía una petición PATCH.
   * @template T Tipo esperado de la respuesta.
   * @param endpoint - Ruta del recurso.
   * @param body - Cuerpo de la petición (opcional).
   * @returns Promesa con los datos de tipo `T`.
   */
  async patch<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }
}

const url = import.meta.env.VITE_API_LOCAL_URL || import.meta.env.VITE_API_PROD_URL;

const apiClient = new ApiClient(url);

export default apiClient;
export type { ApiError };
