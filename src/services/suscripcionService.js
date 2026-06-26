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
   */
  createPublicSuscripcion: async (data) => {
    try {
      console.log('📝 Creando suscripción...');
      console.log('📝 Datos:', data);
      
      const token = localStorage.getItem("auth_token") || localStorage.getItem("token");
      if (!token) {
        throw new Error('Debes iniciar sesión para crear una suscripción');
      }
      
      const payload = {
        mascota_id: data.mascota_id || null,
        monto_mensual: data.monto_mensual || 10000,
        frecuencia: data.frecuencia || 'mensual',
        mensaje_apoyo: data.mensaje_apoyo || '',
        plan_id: data.plan_id || null
      };
      
      const response = await api.post('/suscripciones/user/crear', payload);
      console.log('✅ Suscripción creada:', response.data);
      
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Suscripción creada exitosamente'
      };
      
    } catch (error) {
      console.error('❌ Error createPublicSuscripcion:', error);
      console.error('❌ Detalles:', error.response?.data);
      
      if (error.response?.status === 401) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      }
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Error al crear la suscripción';
      
      throw new Error(errorMessage);
    }
  },

  /**
   * ✅ OBTENER SUSCRIPCIONES DEL USUARIO
   * GET /api/suscripciones/user/mis-suscripciones
   */
  getUserSuscripciones: async () => {
    try {
      console.log('🔄 Obteniendo suscripciones desde /api/suscripciones/user/mis-suscripciones');
      
      const token = localStorage.getItem("auth_token") || localStorage.getItem("token");
      console.log('🔑 Token presente:', !!token);
      
      if (!token) {
        console.warn('⚠️ No hay token de autenticación');
        return { 
          data: [],
          error: 'No autenticado',
          needsAuth: true 
        };
      }
      
      const response = await api.get('/suscripciones/user/mis-suscripciones');
      console.log('📊 Respuesta:', response.data);
      
      if (response.data?.data) {
        return { data: response.data.data };
      }
      if (Array.isArray(response.data)) {
        return { data: response.data };
      }
      return { data: response.data || [] };
      
    } catch (error) {
      console.error('❌ Error getUserSuscripciones:', error);
      console.error('❌ Detalles:', error.response?.data);
      
      if (error.response?.status === 401) {
        console.log('🔒 Token inválido o expirado');
        localStorage.removeItem("auth_token");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return { 
          data: [],
          error: 'Sesión expirada',
          needsAuth: true 
        };
      }
      
      return { data: [] };
    }
  },

  /**
   * ✅ CANCELAR UNA SUSCRIPCIÓN
   * PATCH /api/suscripciones/user/{id}/cancelar
   */
  cancelUserSuscripcion: async (id) => {
    try {
      console.log(`🗑️ Cancelando suscripción ${id} desde /api/suscripciones/user/${id}/cancelar`);
      
      const response = await api.patch(`/suscripciones/user/${id}/cancelar`);
      
      console.log('✅ Suscripción cancelada:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error cancelUserSuscripcion:', error);
      console.error('❌ Detalles:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Error al cancelar la suscripción');
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
      throw new Error(error.response?.data?.message || 'Error al pausar la suscripción');
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
      console.log('✅ Suscripción reactivada:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error reactivarSuscripcion:', error);
      throw new Error(error.response?.data?.message || 'Error al reactivar la suscripción');
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
      throw new Error(error.response?.data?.message || 'Error al obtener la suscripción');
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
  
  /**
   * ✅ OBTENER TODAS LAS SUSCRIPCIONES (ADMIN)
   * GET /api/admin/suscripciones
   */
  getAll: async () => {
    try {
      console.log('🔄 Obteniendo todas las suscripciones (admin)');
      
      const token = localStorage.getItem("auth_token") || localStorage.getItem("token");
      if (!token) {
        console.warn('⚠️ No hay token de autenticación');
        return { data: [], error: 'No autenticado' };
      }
      
      const response = await api.get('/admin/suscripciones');
      console.log('📊 Respuesta completa:', response);
      
      // ✅ La estructura es: { success, message, data: { current_page, data: [], ... } }
      const responseData = response.data;
      
      // ✅ Extraer las suscripciones del array 'data' dentro de 'data.data'
      let suscripcionesArray = [];
      
      // Si la respuesta tiene la estructura de Laravel con paginación
      if (responseData?.data?.data && Array.isArray(responseData.data.data)) {
        suscripcionesArray = responseData.data.data;
        console.log('✅ Suscripciones encontradas en data.data.data');
      } 
      // Si responseData.data es un array directamente
      else if (Array.isArray(responseData?.data)) {
        suscripcionesArray = responseData.data;
      }
      // Si la respuesta directa es un array
      else if (Array.isArray(responseData)) {
        suscripcionesArray = responseData;
      }
      // Buscar en otras propiedades
      else if (responseData?.data && typeof responseData.data === 'object') {
        for (const key in responseData.data) {
          if (Array.isArray(responseData.data[key]) && key !== 'links') {
            suscripcionesArray = responseData.data[key];
            console.log(`✅ Encontrado array en "data.${key}"`);
            break;
          }
        }
      }
      
      console.log('📊 Suscripciones extraídas:', suscripcionesArray.length);
      if (suscripcionesArray.length > 0) {
        console.log('📊 Primera suscripción:', suscripcionesArray[0]);
      }
      
      return { 
        data: suscripcionesArray,
        pagination: {
          current_page: responseData?.data?.current_page,
          total: responseData?.data?.total,
          per_page: responseData?.data?.per_page,
          last_page: responseData?.data?.last_page
        },
        success: responseData?.success || true,
        message: responseData?.message || 'Suscripciones obtenidas'
      };
      
    } catch (error) {
      console.error('❌ Error getAll:', error);
      console.error('❌ Detalles:', error.response?.data);
      throw error;
    }
  },
  
  /**
   * ✅ OBTENER SUSCRIPCIÓN POR ID (ADMIN)
   * GET /api/admin/suscripciones/{id}
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/admin/suscripciones/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error getById:', error);
      throw error;
    }
  },
  
  /**
   * ✅ CREAR SUSCRIPCIÓN (ADMIN)
   * POST /api/admin/suscripciones
   */
  create: async (data) => {
    try {
      const response = await api.post('/admin/suscripciones', data);
      return response.data;
    } catch (error) {
      console.error('Error create:', error);
      throw error;
    }
  },
  
  /**
   * ✅ ACTUALIZAR SUSCRIPCIÓN (ADMIN)
   * PUT /api/admin/suscripciones/{id}
   */
  update: async (id, data) => {
    try {
      const response = await api.put(`/admin/suscripciones/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error update:', error);
      throw error;
    }
  },
  
  /**
   * ✅ ELIMINAR SUSCRIPCIÓN (ADMIN)
   * DELETE /api/admin/suscripciones/{id}
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/admin/suscripciones/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error delete:', error);
      throw error;
    }
  },
};

// Datos de prueba (solo para desarrollo)
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

// ✅ Exportación correcta
export default api;