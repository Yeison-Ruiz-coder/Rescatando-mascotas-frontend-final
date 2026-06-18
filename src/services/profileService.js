// src/services/profileService.js
import api from './api'; // Tu instancia de axios

export const profileService = {
  // Obtener perfil
  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data.data;
  },

  // Actualizar perfil completo
  updateProfile: async (data) => {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        if (typeof data[key] === 'object') {
          formData.append(key, JSON.stringify(data[key]));
        } else {
          formData.append(key, data[key]);
        }
      }
    });
    
    const response = await api.put('/user/profile', formData);
    return response.data.data;
  },

  // Subir avatar
  updateAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post('/user/profile/avatar', formData);
    return response.data.data;
  },

  // Eliminar avatar
  deleteAvatar: async () => {
    const response = await api.delete('/user/profile/avatar');
    return response.data;
  },

  // Actualizar ubicación
  updateLocation: async (location) => {
    const response = await api.put('/user/profile/location', location);
    return response.data.data;
  },

  // Actualizar redes sociales
  updateSocialNetworks: async (networks) => {
    const response = await api.put('/user/profile/social', networks);
    return response.data.data;
  },

  // Cambiar contraseña
  changePassword: async (data) => {
    const response = await api.post('/user/profile/change-password', data);
    return response.data;
  },

  // Obtener estado de completado
  getCompletionStatus: async () => {
    const response = await api.get('/user/profile/completion-status');
    return response.data.data;
  },

  // Enviar código verificación teléfono
  sendPhoneVerification: async () => {
    const response = await api.post('/user/profile/verify-phone');
    return response.data.data;
  },

  // Confirmar código verificación teléfono
  confirmPhoneVerification: async (code) => {
    const response = await api.post('/user/profile/verify-phone/confirm', { code });
    return response.data.data;
  }
};