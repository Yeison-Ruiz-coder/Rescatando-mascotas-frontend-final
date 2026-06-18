import api from './api';

export const veterinariaProfileService = {
  getProfile: async () => {
    const response = await api.get('/veterinaria/profile');
    return response.data.data;
  },

  updateGeneralInfo: async (data) => {
    const response = await api.put('/veterinaria/profile/general', data);
    return response.data.data;
  },

  updateServices: async (data) => {
    const response = await api.put('/veterinaria/profile/services', data);
    return response.data.data;
  },

  updateSchedule: async (horario_atencion, urgencias_24h) => {
    const response = await api.put('/veterinaria/profile/schedule', { 
      horario_atencion, 
      urgencias_24h 
    });
    return response.data.data;
  },

  uploadLogo: async (file) => {
    const formData = new FormData();
    formData.append('logo', file);
    const response = await api.post('/veterinaria/profile/logo', formData);
    return response.data.data;
  },

  deleteLogo: async () => {
    const response = await api.delete('/veterinaria/profile/logo');
    return response.data;
  },

  addGalleryPhotos: async (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('fotos[]', file);
    });
    const response = await api.post('/veterinaria/profile/gallery', formData);
    return response.data.data;
  },

  removeGalleryPhoto: async (photoUrl) => {
    const response = await api.delete('/veterinaria/profile/gallery', {
      data: { photo_url: photoUrl }
    });
    return response.data.data;
  }
};