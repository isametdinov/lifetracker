/*
  Axios API service used across the frontend.
  - Configures shared base URL and JSON headers
  - Automatically attaches auth token from localStorage
*/
import axios from 'axios';

// Shared Axios instance for all backend API requests from the frontend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach the JWT token to API calls when present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lifetracker_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
