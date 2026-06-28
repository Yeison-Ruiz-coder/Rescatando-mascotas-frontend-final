// src/services/suscripcionService.js
import api from './api';

export const suscripcionService = {
  // ============================================
  // PÚBLICOS (sin autenticación)
  // ============================================
  
  /**
   * Obtener mascotas disponibles para apadrinar
   * GET /api/suscripciones/planes
   */
  getPlanes: async () => {
    try {
      const response = await api.get('/suscripciones/planes');
      return response.data.data || [];
    } catch (error) {
      console.error('Error getPlanes:', error);
      return [];
    }
  },

  /**
   * Obtener detalle de una mascota
   * GET /api/suscripciones/planes/{id}
   */
  getPlanDetalle: async (id) => {
    try {
      const response = await api.get(`/suscripciones/planes/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error getPlanDetalle:', error);
      throw error;
    }
  },

  // ============================================
  // USUARIO (requiere autenticación)
  // ============================================
  
  /**
   * Crear una suscripción (pendiente de pago)
   * POST /api/suscripciones/user/crear
   */
  crearSuscripcion: async (data) => {
    try {
      const response = await api.post('/suscripciones/user/crear', data);
      return response.data.data;
    } catch (error) {
      console.error('Error crearSuscripcion:', error);
      throw error;
    }
  },

  /**
   * Obtener mis suscripciones
   * GET /api/suscripciones/user/mis-suscripciones
   */
  getMisSuscripciones: async () => {
    try {
      const response = await api.get('/suscripciones/user/mis-suscripciones');
      return response.data.data || [];
    } catch (error) {
      console.error('Error getMisSuscripciones:', error);
      return [];
    }
  },

  /**
   * Obtener detalle de una suscripción
   * GET /api/suscripciones/user/{id}
   */
  getSuscripcion: async (id) => {
    try {
      const response = await api.get(`/suscripciones/user/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error getSuscripcion:', error);
      throw error;
    }
  },

  /**
   * Cancelar suscripción
   * PATCH /api/suscripciones/user/{id}/cancelar
   */
  cancelarSuscripcion: async (id) => {
    try {
      const response = await api.patch(`/suscripciones/user/${id}/cancelar`);
      return response.data.data;
    } catch (error) {
      console.error('Error cancelarSuscripcion:', error);
      throw error;
    }
  },

  /**
   * Pausar suscripción
   * PATCH /api/suscripciones/user/{id}/pausar
   */
  pausarSuscripcion: async (id) => {
    try {
      const response = await api.patch(`/suscripciones/user/${id}/pausar`);
      return response.data.data;
    } catch (error) {
      console.error('Error pausarSuscripcion:', error);
      throw error;
    }
  },

  /**
   * Reactivar suscripción
   * PATCH /api/suscripciones/user/{id}/reactivar
   */
  reactivarSuscripcion: async (id) => {
    try {
      const response = await api.patch(`/suscripciones/user/${id}/reactivar`);
      return response.data.data;
    } catch (error) {
      console.error('Error reactivarSuscripcion:', error);
      throw error;
    }
  },

  // ============================================
  // FUNDACIÓN/VETERINARIA (requiere autenticación)
  // ============================================
  
  /**
   * Obtener suscripciones de la entidad
   * GET /api/entity/suscripciones
   */
  getSuscripcionesEntity: async () => {
    try {
      const response = await api.get('/entity/suscripciones');
      return response.data.data || [];
    } catch (error) {
      console.error('Error getSuscripcionesEntity:', error);
      return [];
    }
  },

  /**
   * Obtener detalle de una suscripción (entity)
   * GET /api/entity/suscripciones/{id}
   */
  getSuscripcionEntity: async (id) => {
    try {
      const response = await api.get(`/entity/suscripciones/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error getSuscripcionEntity:', error);
      throw error;
    }
  },

  /**
   * Actualizar suscripción (entity)
   * PUT /api/entity/suscripciones/{id}
   */
  updateSuscripcionEntity: async (id, data) => {
    try {
      const response = await api.put(`/entity/suscripciones/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error updateSuscripcionEntity:', error);
      throw error;
    }
  },

  /**
   * Pausar suscripción (entity)
   * PATCH /api/entity/suscripciones/{id}/pausar
   */
  pausarSuscripcionEntity: async (id) => {
    try {
      const response = await api.patch(`/entity/suscripciones/${id}/pausar`);
      return response.data.data;
    } catch (error) {
      console.error('Error pausarSuscripcionEntity:', error);
      throw error;
    }
  },

  /**
   * Reactivar suscripción (entity)
   * PATCH /api/entity/suscripciones/{id}/reactivar
   */
  reactivarSuscripcionEntity: async (id) => {
    try {
      const response = await api.patch(`/entity/suscripciones/${id}/reactivar`);
      return response.data.data;
    } catch (error) {
      console.error('Error reactivarSuscripcionEntity:', error);
      throw error;
    }
  },

  /**
   * Cancelar suscripción (entity)
   * PATCH /api/entity/suscripciones/{id}/cancelar
   */
  cancelarSuscripcionEntity: async (id) => {
    try {
      const response = await api.patch(`/entity/suscripciones/${id}/cancelar`);
      return response.data.data;
    } catch (error) {
      console.error('Error cancelarSuscripcionEntity:', error);
      throw error;
    }
  },

  /**
   * Estadísticas de suscripciones (entity)
   * GET /api/entity/suscripciones-estadisticas
   */
  getEstadisticasEntity: async () => {
    try {
      const response = await api.get('/entity/suscripciones-estadisticas');
      return response.data.data;
    } catch (error) {
      console.error('Error getEstadisticasEntity:', error);
      return null;
    }
  },

  // ============================================
  // PAGOS (requiere autenticación)
  // ============================================
  
  /**
   * Iniciar pago (demo)
   * POST /api/payment/iniciar
   */
  iniciarPago: async (suscripcionId) => {
    try {
      const response = await api.post('/payment/iniciar', { 
        suscripcion_id: suscripcionId 
      });
      return response.data.data;
    } catch (error) {
      console.error('Error iniciarPago:', error);
      throw error;
    }
  },

  /**
   * Confirmar pago (demo)
   * POST /api/payment/confirmar
   */
  confirmarPago: async (suscripcionId, reference) => {
    try {
      const response = await api.post('/payment/confirmar', { 
        suscripcion_id: suscripcionId,
        reference: reference 
      });
      return response.data.data;
    } catch (error) {
      console.error('Error confirmarPago:', error);
      throw error;
    }
  },

  /**
   * Obtener modo de pago
   * GET /api/payment/mode
   */
  getPaymentMode: async () => {
    try {
      const response = await api.get('/payment/mode');
      return response.data.data;
    } catch (error) {
      console.error('Error getPaymentMode:', error);
      return { mode: 'demo', is_demo: true };
    }
  },
};