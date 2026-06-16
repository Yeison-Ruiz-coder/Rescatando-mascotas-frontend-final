// src/services/authService.js
import api from './api';

const API_URL = import.meta.env.VITE_API_URL || 'https://rescatando-mascotas-backend-final-production.up.railway.app';

const authService = {
  // Login
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      
      if (response.data.success && response.data.data.token) {
        const { token, user } = response.data.data;
        
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        return {
          success: true,
          user,
          token
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error al iniciar sesión'
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  },

  // 🔥 REGISTER CORREGIDO - Maneja fundaciones/veterinarias
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      
      if (response.data.success) {
        const data = response.data.data;
        const user = data.user;
        const token = data.token || null;
        const requiereAprobacion = data.requiere_aprobacion || 
                                   (user?.tipo === 'fundacion' || user?.tipo === 'veterinaria');
        
        // 🔥 SOLO guardar token si existe (usuarios normales)
        if (token) {
          localStorage.setItem('auth_token', token);
          localStorage.setItem('user', JSON.stringify(user));
        } else {
          // Para fundaciones/veterinarias, limpiar cualquier token previo
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
        }
        
        return {
          success: true,
          user: user,
          token: token,
          requiereAprobacion: requiereAprobacion,
          message: response.data.message
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error al registrar'
      };
    } catch (error) {
      console.error('Register error:', error);
      
      // Manejar errores de validación del backend
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const firstError = Object.values(errors).flat()[0];
        return {
          success: false,
          message: firstError || 'Error de validación'
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  },

  // Logout
  logout: async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  },

  // 🔥 RECUPERAR CONTRASEÑA
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/password/email', { email });
      return {
        success: response.data.success,
        message: response.data.message
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al enviar el enlace'
      };
    }
  },

  // 🔥 RESTABLECER CONTRASEÑA
  resetPassword: async (token, email, password, passwordConfirmation) => {
    try {
      const response = await api.post('/auth/password/reset', {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation
      });
      return {
        success: response.data.success,
        message: response.data.message
      };
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al restablecer la contraseña'
      };
    }
  },

  // Obtener el token actual
  getToken: () => {
    return localStorage.getItem('auth_token');
  },

  // Obtener usuario actual
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Verificar si está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem('auth_token');
  },

  // Verificar token con el backend
  verifyToken: async () => {
    const token = authService.getToken();
    if (!token) return false;
    
    try {
      const response = await api.get('/user/profile');
      return response.data.success;
    } catch (error) {
      console.error('Error verifying token:', error);
      // Si el token es inválido, limpiar
      if (error.response?.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      }
      return false;
    }
  }
};

export default authService;