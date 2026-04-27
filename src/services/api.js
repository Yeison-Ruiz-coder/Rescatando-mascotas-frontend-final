// src/services/api.js
import axios from 'axios';

const API_URL = import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_URL || 'http://rescatando-mascotas-forever.test/api');

export const publicApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// NUEVA FUNCIÓN PARA REPORTAR RESCATE (usa publicApi, no requiere autenticación)
export const reportarRescate = (data) => publicApi.post('/rescates/reportar', data);

export default api;