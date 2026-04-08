import api from './api';

const mascotaService = {
  // Obtener datos para el formulario (razas, vacunas)
  getFormData: async () => {
    const response = await api.get('/entity/mascotas-form-data');
    return response.data;
  },

  // Obtener todas las mascotas de la fundación
  getMascotas: async () => {
    const response = await api.get('/entity/mascotas');
    return response.data;
  },

  // Obtener una mascota específica
  getMascota: async (id) => {
    const response = await api.get(`/entity/mascotas/${id}`);
    return response.data;
  },

  // Crear nueva mascota
  createMascota: async (formData) => {
    const response = await api.post('/entity/mascotas', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Actualizar mascota
  updateMascota: async (id, formData) => {
    const response = await api.post(`/entity/mascotas/${id}?_method=PUT`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Eliminar mascota
  deleteMascota: async (id) => {
    const response = await api.delete(`/entity/mascotas/${id}`);
    return response.data;
  },

  // Eliminar foto de galería
  deleteFotoGaleria: async (mascotaId, fotoUrl) => {
    const response = await api.delete(`/admin/mascotas/${mascotaId}/foto-galeria`, {
      data: { foto_url: fotoUrl }
    });
    return response.data;
  }
};

export default mascotaService;