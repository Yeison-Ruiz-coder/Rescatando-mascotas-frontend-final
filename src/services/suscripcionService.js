// src/services/suscripcionService.js
import api from "./api";

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
      const response = await api.get("/suscripciones/planes");
      return response.data.data || [];
    } catch (error) {
      console.error("Error getPlanes:", error);
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
      console.error("Error getPlanDetalle:", error);
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
      const response = await api.post("/suscripciones/user/crear", data);
      return response.data.data;
    } catch (error) {
      console.error("Error crearSuscripcion:", error);
      throw error;
    }
  },

  /**
   * Obtener mis suscripciones
   * GET /api/suscripciones/user/mis-suscripciones
   */
  getMisSuscripciones: async () => {
    try {
      const response = await api.get("/suscripciones/user/mis-suscripciones");
      return response.data.data || [];
    } catch (error) {
      console.error("Error getMisSuscripciones:", error);
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
      console.error("Error getSuscripcion:", error);
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
      console.error("Error cancelarSuscripcion:", error);
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
      console.error("Error pausarSuscripcion:", error);
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
      console.error("Error reactivarSuscripcion:", error);
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
      const response = await api.get("/entity/suscripciones");
      return response.data.data || [];
    } catch (error) {
      console.error("Error getSuscripcionesEntity:", error);
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
      console.error("Error getSuscripcionEntity:", error);
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
      console.error("Error updateSuscripcionEntity:", error);
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
      console.error("Error pausarSuscripcionEntity:", error);
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
      console.error("Error reactivarSuscripcionEntity:", error);
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
      console.error("Error cancelarSuscripcionEntity:", error);
      throw error;
    }
  },

  /**
   * Estadísticas de suscripciones (entity)
   * GET /api/entity/suscripciones-estadisticas
   */
  getEstadisticasEntity: async () => {
    try {
      const response = await api.get("/entity/suscripciones-estadisticas");
      return response.data.data;
    } catch (error) {
      console.error("Error getEstadisticasEntity:", error);
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
      const response = await api.post("/payment/iniciar", {
        suscripcion_id: suscripcionId,
      });
      return response.data.data;
    } catch (error) {
      console.error("Error iniciarPago:", error);
      throw error;
    }
  },

  /**
   * Confirmar pago (demo)
   * POST /api/payment/confirmar
   */
  confirmarPago: async (suscripcionId, reference) => {
    try {
      const response = await api.post("/payment/confirmar", {
        suscripcion_id: suscripcionId,
        reference: reference,
      });
      return response.data.data;
    } catch (error) {
      console.error("Error confirmarPago:", error);
      throw error;
    }
  },

  /**
   * Obtener modo de pago
   * GET /api/payment/mode
   */
  getPaymentMode: async () => {
    try {
      const response = await api.get("/payment/mode");
      return response.data.data;
    } catch (error) {
      console.error("Error getPaymentMode:", error);
      return { mode: "demo", is_demo: true };
    }
  },

  // src/services/suscripcionService.js

  // ============================================
  // ADMIN (requiere autenticación de admin)
  // ============================================

  /**
   * Obtener todas las suscripciones (admin)
   * GET /api/admin/suscripciones
   */
  getAll: async (params = {}) => {
    try {
      const response = await api.get("/admin/suscripciones", { params });
      return response.data;
    } catch (error) {
      console.error("Error getAll:", error);
      throw error;
    }
  },

  /**
   * Cancelar suscripción desde admin
   * PATCH /api/admin/suscripciones/{id}/cancelar
   */
  cancelarSuscripcionAdmin: async (id) => {
    try {
      const response = await api.patch(`/admin/suscripciones/${id}/cancelar`);
      return response.data;
    } catch (error) {
      console.error("Error cancelarSuscripcionAdmin:", error);
      throw error;
    }
  },

  /**
   * Actualizar suscripción desde admin (estado)
   * PATCH /api/admin/suscripciones/{id}/actualizar
   */
  actualizarSuscripcionAdmin: async (id, data) => {
    try {
      const response = await api.patch(
        `/admin/suscripciones/${id}/actualizar`,
        data,
      );
      return response.data;
    } catch (error) {
      console.error("Error actualizarSuscripcionAdmin:", error);
      throw error;
    }
  },

  /**
   * Estadísticas completas para dashboard admin
   * GET /api/admin/suscripciones/estadisticas
   */
  getEstadisticasCompletas: async () => {
    try {
      const response = await api.get("/admin/suscripciones/estadisticas");
      return response.data;
    } catch (error) {
      console.error("Error getEstadisticasCompletas:", error);
      throw error;
    }
  },

  /**
   * Obtener detalle de una suscripción (admin)
   * GET /api/admin/suscripciones/{id}
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/admin/suscripciones/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error("Error getById:", error);
      throw error;
    }
  },

  /* Simular pago en modo demo
   * POST /api/suscripciones/user/{id}/simular-pago
   */
  
  simularPago: async (id) => {
    try {
      const response = await api.post(`/suscripciones/user/${id}/simular-pago`);
      return response.data.data;
    } catch (error) {
      console.error("Error simularPago:", error);
      throw error;
    }
  },
};
