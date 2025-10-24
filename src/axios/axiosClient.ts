// src/axios/axiosClient.ts
import axios from "axios";
import "dotenv/config";

/**
 * Pre-configured Axios instance for HTTP requests.
 * 
 * Configuration:
 * - Base URL determined from environment variables (local or production)
 * - Credentials included in requests (cookies)
 * - Default Content-Type header set to application/json
 * 
 * Usage:
 * This client can be used as an alternative to the custom apiClient
 * for making HTTP requests with axios-specific features.
 * 
 * @constant
 * @type {AxiosInstance}
 * @example
 * import axiosClient from './axios/axiosClient';
 * const response = await axiosClient.get('/api/users');
 */
const axiosClient = axios.create({
  baseURL: process.env.VITE_API_LOCAL_URL || process.env.VITE_API_PROD_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosClient;