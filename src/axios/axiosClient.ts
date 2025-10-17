// src/axios/axiosClient.ts
import axios from "axios";
import "dotenv/config";


const axiosClient = axios.create({
  baseURL: process.env.VITE_API_LOCAL_URL || process.env.VITE_API_PROD_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosClient;