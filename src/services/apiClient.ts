// src/services/apiClient.ts

/**
 * Represents an API error with message and HTTP status code.
 */
interface ApiError {
  /** Descriptive error message. */
  message: string;
  /** HTTP status code (0 if network error). */
  status: number;
}

/**
 * Generic HTTP client for interacting with the backend.
 *
 * Encapsulates `fetch` requests with default configuration:
 * - Configurable base URL.
 * - Automatic inclusion of cookies (`credentials: 'include'`).
 * - Centralized error handling.
 * - Generic methods (`get`, `post`, `put`, `delete`, `patch`).
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
   * Creates a new instance of the API client.
   * @param baseURL - Base URL of the backend (e.g., "https://api.myapp.com")
   */
  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Makes a generic HTTP request using `fetch`.
   *
   * Handles:
   * - Building the full URL.
   * - Including cookies (for `httpOnly` authentication).
   * - Handling network errors or unsuccessful responses.
   *
   * @template T Expected response type.
   * @param endpoint - Resource path (e.g., "/users").
   * @param config - Optional `RequestInit` configuration.
   * @returns Promise that resolves with data of type `T`.
   * @throws {ApiError} If an HTTP or network error occurs.
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
   * Sends a GET request.
   * @template T Expected response type.
   * @param endpoint - Resource path.
   * @returns Promise with data of type `T`.
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  /**
   * Sends a POST request.
   * @template T Expected response type.
   * @param endpoint - Resource path.
   * @param body - Request body (optional).
   * @returns Promise with data of type `T`.
   */
  async post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  /**
   * Sends a PUT request.
   * @template T Expected response type.
   * @param endpoint - Resource path.
   * @param body - Request body (optional).
   * @returns Promise with data of type `T`.
   */
  async put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  /**
   * Sends a DELETE request.
   * @template T Expected response type.
   * @param endpoint - Resource path.
   * @returns Promise with data of type `T`.
   */
  async delete<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE", body: JSON.stringify(body) });
  }

  /**
   * Sends a PATCH request.
   * @template T Expected response type.
   * @param endpoint - Resource path.
   * @param body - Request body (optional).
   * @returns Promise with data of type `T`.
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