import axios from 'axios';

// En desarrollo usar rutas relativas para que el proxy de Vite funcione
// En producción usar la URL completa
const API_URL = import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_URL || 'http://rescatando-mascotas-forever.test/api');

// Cliente para rutas que NO necesitan autenticación
export const publicApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// Cliente para rutas que SÍ necesitan autenticación
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Interceptor para agregar token
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

// Interceptor para manejar respuestas 401
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

export default api;