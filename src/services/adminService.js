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

  createMascota: async (formData) => {
    try {
      const response = await api.post('/admin/mascotas', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('Error en createMascota:', error);
      throw error;
    }
  },

  updateMascota: async (id, formData) => {
    try {
      formData.append('_method', 'PUT');
      const response = await api.post(`/admin/mascotas/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('Error en updateMascota:', error);
      throw error;
    }
  },

  deleteMascota: async (id) => {
    try {
      const response = await api.delete(`/admin/mascotas/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error en deleteMascota:', error);
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

  getUsuario: async (id) => {
    try {
      const response = await api.get(`/admin/usuarios/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error en getUsuario:', error);
      throw error;
    }
  },

  createUsuario: async (data) => {
    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
          formData.append(key, data[key]);
        }
      });
      const response = await api.post('/admin/usuarios', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('Error en createUsuario:', error);
      throw error;
    }
  },

  updateUsuario: async (id, data) => {
    try {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
          formData.append(key, data[key]);
        }
      });
      const response = await api.post(`/admin/usuarios/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
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

  cambiarEstadoUsuario: async (id, estado) => {
    try {
      const response = await api.patch(`/admin/usuarios/${id}/estado`, { estado });
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

  // ========== DATOS PARA SELECTS ==========
  getFundaciones: async () => {
    try {
      const response = await api.get('/admin/fundaciones');
      return response.data;
    } catch (error) {
      console.error('Error en getFundaciones:', error);
      throw error;
    }
  },

  getRazas: async () => {
    try {
      const response = await api.get('/admin/razas');
      return response.data;
    } catch (error) {
      console.error('Error en getRazas:', error);
      throw error;
    }
  },

  getVacunas: async () => {
    try {
      const response = await api.get('/admin/tipos-vacunas');
      return response.data;
    } catch (error) {
      console.error('Error en getVacunas:', error);
      throw error;
    }
  }
};

getUsuariosPendientesCount: async () => {
  try {
    const response = await api.get('/admin/usuarios/pendientes/count');
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    return { success: false, count: 0 };
  }
}

export default adminService;