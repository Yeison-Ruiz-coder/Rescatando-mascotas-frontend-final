// src/services/fundacionProfileService.js
import api from './api';

export const fundacionProfileService = {
  getProfile: async () => {
    const response = await api.get('/fundacion/profile');
    return response.data.data;
  },

  updateGeneralInfo: async (data) => {
    const response = await api.put('/fundacion/profile/general', data);
    return response.data.data;
  },

  updateNeeds: async (needs) => {
    const response = await api.put('/fundacion/profile/needs', { necesidades_actuales: needs });
    return response.data.data;
  },

  updateSchedule: async (horario_atencion, recibe_voluntarios) => {
    const response = await api.put('/fundacion/profile/schedule', { horario_atencion, recibe_voluntarios });
    return response.data.data;
  },

  uploadCoverImage: async (file) => {
    const formData = new FormData();
    formData.append('imagen_portada', file);
    const response = await api.post('/fundacion/profile/cover', formData);
    return response.data.data;
  },

  deleteCoverImage: async () => {
    const response = await api.delete('/fundacion/profile/cover');
    return response.data;
  }
};