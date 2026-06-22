// src/services/suscripcionService.js

import api from './api';

export const suscripcionService = {
  /**
   * Obtener planes de apadrinamiento (mascotas disponibles)
   * GET /api/suscripciones/planes
   */
  getPlanesMembresia: async () => {
    try {
      console.log('🔄 Obteniendo planes desde /api/suscripciones/planes');
      const response = await api.get('/suscripciones/planes');
      console.log('📊 Planes obtenidos:', response.data);
      return response.data.data || response.data;
    } catch (error) {
      console.error('❌ Error getPlanesMembresia:', error);
      return getPlanesPrueba();
    }
  },

  /**
   * Obtener detalle de un plan específico
   * GET /api/suscripciones/planes/{id}
   */
  getPlanDetalle: async (id) => {
    try {
      const response = await api.get(`/suscripciones/planes/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error getPlanDetalle:', error);
      throw error;
    }
  },

  /**
   * ✅ CREAR SUSCRIPCIÓN (Usuario autenticado)
   * POST /api/suscripciones/user/crear
   * 
   * ¡IMPORTANTE! Esta ruta es para usuarios autenticados
   */
  createPublicSuscripcion: async (data) => {
    try {
      console.log('📝 Creando suscripción...');
      console.log('📝 Datos:', data);
      
      // Datos para el método store() del controlador
      const payload = {
        mascota_id: data.mascota_id || null,
        monto_mensual: data.monto_mensual || 10000,
        frecuencia: data.frecuencia || 'mensual',
        mensaje_apoyo: data.mensaje_apoyo || ''
      };
      
      // ✅ RUTA CORRECTA
      const response = await api.post('/suscripciones/user/crear', payload);
      console.log('✅ Suscripción creada:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error createPublicSuscripcion:', error);
      console.error('❌ Detalles:', error.response?.data);
      throw error;
    }
  },

  /**
   * ✅ OBTENER SUSCRIPCIONES DEL USUARIO
   * GET /api/suscripciones/user/mis-suscripciones
   */
  getUserSuscripciones: async () => {
    try {
      console.log('🔄 Obteniendo suscripciones desde /api/suscripciones/user/mis-suscripciones');
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('⚠️ No hay token de autenticación');
        return [];
      }
      
      // ✅ RUTA CORRECTA
      const response = await api.get('/suscripciones/user/mis-suscripciones');
      console.log('📊 Respuesta:', response.data);
      
      if (response.data?.data) {
        return response.data.data;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return response.data || [];
      
    } catch (error) {
      console.error('❌ Error getUserSuscripciones:', error);
      console.error('❌ Detalles:', error.response?.data);
      
      if (error.response?.status === 401) {
        console.log('🔒 Usuario no autenticado');
        return [];
      }
      
      return [];
    }
  },

  /**
   * ✅ CANCELAR UNA SUSCRIPCIÓN
   * PATCH /api/suscripciones/user/{id}/cancelar
   */
  cancelUserSuscripcion: async (id) => {
    try {
      console.log(`🗑️ Cancelando suscripción ${id} desde /api/suscripciones/user/${id}/cancelar`);
      
      // ✅ RUTA CORRECTA
      const response = await api.patch(`/suscripciones/user/${id}/cancelar`);
      
      console.log('✅ Suscripción cancelada:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error cancelUserSuscripcion:', error);
      console.error('❌ Detalles:', error.response?.data);
      throw error;
    }
  },

  /**
   * ✅ PAUSAR UNA SUSCRIPCIÓN
   * PATCH /api/suscripciones/user/{id}/pausar
   */
  pausarSuscripcion: async (id) => {
    try {
      console.log(`⏸️ Pausando suscripción ${id} desde /api/suscripciones/user/${id}/pausar`);
      const response = await api.patch(`/suscripciones/user/${id}/pausar`);
      return response.data;
    } catch (error) {
      console.error('Error pausarSuscripcion:', error);
      throw error;
    }
  },

  /**
   * ✅ REACTIVAR UNA SUSCRIPCIÓN
   * PATCH /api/suscripciones/user/{id}/reactivar
   */
  reactivarSuscripcion: async (id) => {
    try {
      console.log(`🔄 Reactivando suscripción ${id} desde /api/suscripciones/user/${id}/reactivar`);
      const response = await api.patch(`/suscripciones/user/${id}/reactivar`);
      return response.data;
    } catch (error) {
      console.error('Error reactivarSuscripcion:', error);
      throw error;
    }
  },

  /**
   * ✅ VER DETALLE DE UNA SUSCRIPCIÓN
   * GET /api/suscripciones/user/{id}
   */
  getSuscripcion: async (id) => {
    try {
      console.log(`🔍 Obteniendo suscripción ${id} desde /api/suscripciones/user/${id}`);
      const response = await api.get(`/suscripciones/user/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error getSuscripcion:', error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas de suscripciones
   */
  getEstadisticas: async () => {
    try {
      const response = await api.get('/suscripciones/estadisticas');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error getEstadisticas:', error);
      return null;
    }
  },

  // ============ ADMIN ============
  
  getAll: async () => {
    const response = await api.get('/admin/suscripciones');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/admin/suscripciones/${id}`);
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/admin/suscripciones', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/admin/suscripciones/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/admin/suscripciones/${id}`);
    return response.data;
  },
};

// Datos de prueba
function getPlanesPrueba() {
  return [
    {
      id: 1,
      nombre: 'Plan Básico',
      monto: 10000,
      frecuencia: 'mensual',
      destacado: false,
      descripcion: 'Ideal para empezar a ayudar',
      beneficios: ['Certificado digital', 'Actualización mensual', 'Calcomanía']
    },
    {
      id: 2,
      nombre: 'Plan Premium',
      monto: 25000,
      frecuencia: 'mensual',
      destacado: true,
      descripcion: 'Para quienes quieren marcar la diferencia',
      beneficios: ['Certificado premium', 'Actualización semanal', 'Fotos exclusivas', 'Descuento en tienda']
    },
    {
      id: 3,
      nombre: 'Plan Vitalicio',
      monto: 50000,
      frecuencia: 'mensual',
      destacado: false,
      descripcion: 'Para los súper patrocinadores',
      beneficios: ['Certificado especial', 'Visitas mensuales', 'Nombre en placa', 'Descuento 20%']
    }
  ];
}

export default api;