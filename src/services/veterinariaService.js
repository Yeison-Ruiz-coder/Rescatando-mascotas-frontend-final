import api from './api';

const normalizeResponse = (response) => {
  if (!response) return [];
  const data = response.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(response)) return response;
  return data?.data || data || [];
};

export const veterinariaService = {
  getPacientes: async (params = {}) => {
    const response = await api.get('/veterinaria/pacientes', { params });
    return normalizeResponse(response);
  },

  getCitas: async (params = {}) => {
    const response = await api.get('/veterinaria/citas', { params });
    return normalizeResponse(response);
  },

  getServicios: async (params = {}) => {
    const response = await api.get('/veterinaria/servicios', { params });
    return normalizeResponse(response);
  },
};

export default veterinariaService;