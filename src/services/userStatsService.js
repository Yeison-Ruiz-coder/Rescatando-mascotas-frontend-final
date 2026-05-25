// src/services/userStatsService.js
import api from './api';

const userStatsService = {
  // Obtener estadísticas del usuario autenticado
  getUserStats: async () => {
    try {
      const response = await api.get('/user/stats');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  },

  // Obtener historial de adopciones del usuario
  getUserAdoptions: async (page = 1) => {
    try {
      const response = await api.get('/user/adopciones', { params: { page } });
      return response.data;
    } catch (error) {
      console.error('Error fetching user adoptions:', error);
      throw error;
    }
  },

  // Obtener historial de donaciones del usuario
  getUserDonations: async (page = 1) => {
    try {
      const response = await api.get('/user/donaciones', { params: { page } });
      return response.data;
    } catch (error) {
      console.error('Error fetching user donations:', error);
      throw error;
    }
  },
};

export default userStatsService;