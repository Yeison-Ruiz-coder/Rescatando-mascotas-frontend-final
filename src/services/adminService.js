import api from './api';

const adminService = {

  // ========== USUARIOS ==========
  getUsuarios: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append('page', params.page);
      if (params.per_page) queryParams.append('per_page', params.per_page);
      if (params.search) queryParams.append('search', params.search);
      if (params.tipo) queryParams.append('tipo', params.tipo);
      if (params.estado) queryParams.append('estado', params.estado);

      const response = await api.get(`/admin/usuarios?${queryParams.toString()}`);
      const payload = response.data;

      let data = [];
      let meta = {
        current_page: params.page || 1,
        last_page: 1,
        per_page: params.per_page || 15,
        total: 0,
      };

      if (payload) {
        if (Array.isArray(payload)) {
          data = payload;
        } else if (Array.isArray(payload.data)) {
          data = payload.data;
          meta = payload.meta || meta;
        } else if (payload.data && Array.isArray(payload.data.data)) {
          data = payload.data.data;
          meta = payload.data.meta || payload.meta || meta;
        } else if (Array.isArray(payload.data?.data)) {
          data = payload.data.data;
          meta = payload.data.meta || meta;
        }
      }

      return { data, meta, raw: payload };
    } catch (error) {
      console.error('Error en getUsuarios:', error);
      throw error;
    }
  },

  getUsuario: async (id) => {
    try {
      const response = await api.get(`/admin/usuarios/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error en getUsuario:', error);
      throw error;
    }
  },

  createUsuario: async (payload) => {
    try {
      const response = await api.post('/admin/usuarios', payload);
      return response.data;
    } catch (error) {
      console.error('Error en createUsuario:', error);
      throw error;
    }
  },

  updateUsuario: async (id, payload) => {
    try {
      const response = await api.put(`/admin/usuarios/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error('Error en updateUsuario:', error);
      throw error;
    }
  },

  deleteUsuario: async (id) => {
    try {
      const response = await api.delete(`/admin/usuarios/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error en deleteUsuario:', error);
      throw error;
    }
  },

  // ✅ CORREGIDO: Ruta correcta con /estado
  cambiarEstadoUsuario: async (id, payload) => {
    try {
      const body = typeof payload === 'string' ? { estado: payload } : payload;
      const response = await api.patch(`/admin/usuarios/${id}/estado`, body);
      return response.data;
    } catch (error) {
      console.error('Error en cambiarEstadoUsuario:', error);
      throw error;
    }
  },

  verificarEmailUsuario: async (id) => {
    try {
      const response = await api.post(`/admin/usuarios/${id}/verificar-email`);
      return response.data;
    } catch (error) {
      console.error('Error en verificarEmailUsuario:', error);
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

  // ========== SUSCRIPCIONES ==========
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