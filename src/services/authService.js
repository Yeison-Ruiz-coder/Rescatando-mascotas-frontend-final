import api from './api';

const authService = {
  // Login (sin CSRF)
  login: async (credentials) => {
    try {
      // Comenta o elimina esta línea si no tienes la ruta
      // await api.get('/sanctum/csrf-cookie');
      
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

  // Register (sin CSRF)
  register: async (userData) => {
    try {
      // Comenta o elimina esta línea si no tienes la ruta
      // await api.get('/sanctum/csrf-cookie');
      
      const response = await api.post('/auth/register', userData);
      
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
        message: response.data.message || 'Error al registrar'
      };
    } catch (error) {
      console.error('Register error:', error);
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

  // Obtener usuario actual
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Verificar si está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem('auth_token');
  }
};

export default authService;