import api from './api';

const adminService = {

  // ========== MASCOTAS ==========
  getMascotas: async (params = {}) => {
    try {
      const cleanParams = {};
      Object.keys(params).forEach(key => {
        if (params[key] !== '' && params[key] !== null && params[key] !== undefined) {
          cleanParams[key] = params[key];
        }
      });

      const response = await api.get('/admin/mascotas', { params: cleanParams });
      return response.data;

    } catch (error) {
      console.error('Error en getMascotas:', error);
      throw error;
    }
  },

  getMascota: async (id) => {
    try {
      const response = await api.get(`/admin/mascotas/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error en getMascota:', error);
      throw error;
    }
  },

  // ========== USUARIOS ==========
  getUsuarios: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append('page', params.page);
      if (params.search) queryParams.append('search', params.search);
      if (params.tipo) queryParams.append('tipo', params.tipo);
      if (params.estado) queryParams.append('estado', params.estado);

      const response = await api.get(`/admin/usuarios?${queryParams.toString()}`);
      return response.data;

    } catch (error) {
      console.error('Error en getUsuarios:', error);
      throw error;
    }
  },

  // ========== DASHBOARD ==========
  getDashboard: async () => {
    try {
      const response = await api.get('/admin/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error en getDashboard:', error);
      throw error;
    }
  },

  getEstadisticasGenerales: async () => {
    try {
      const response = await api.get('/admin/reportes/generales');
      return response.data;
    } catch (error) {
      console.error('Error en getEstadisticasGenerales:', error);
      throw error;
    }
  },

  getReporteDonaciones: async () => {
    try {
      const response = await api.get('/admin/donaciones-reportes/generales');
      return response.data;
    } catch (error) {
      console.error('Error en getReporteDonaciones:', error);
      throw error;
    }
  },

  // ========== SUSCRIPCIONES (TU MÓDULO) ==========
  getSuscripciones: async (params = {}) => {
    try {
      const cleanParams = {};

      Object.keys(params).forEach(key => {
        if (
          params[key] !== '' &&
          params[key] !== null &&
          params[key] !== undefined
        ) {
          cleanParams[key] = params[key];
        }
      });

      const response = await api.get('/admin/suscripciones', {
        params: cleanParams
      });

      return response.data;

    } catch (error) {
      console.error('Error en getSuscripciones:', error);
      throw error;
    }
  },

  getUsuariosPendientesCount: async () => {
    try {
      const response = await api.get('/admin/usuarios/pendientes/count');
      return response.data;
    } catch (error) {
      console.error('Error:', error);
      return { success: false, count: 0 };
    }
  }

};
export default adminService;