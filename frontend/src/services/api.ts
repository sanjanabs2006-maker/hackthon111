import axios from 'axios';

// Environment-aware API base URL:
// In production or when deployed, reads VITE_API_BASE_URL from environment variables,
// otherwise defaults to relative /api/v1 (for same-origin/proxy) or local Flask port 5000.
const ENV_API_URL = import.meta.env.VITE_API_BASE_URL;

export const API_BASE_URL = 
  ENV_API_URL || 
  (import.meta.env.PROD ? '/api/v1' : 'http://localhost:5000/api/v1');

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('krishi_access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      // localStorage.removeItem('krishi_access_token');
    }
    return Promise.reject(error);
  }
);

