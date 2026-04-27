// src/services/suscripcionService.js
import api from './api';

export const suscripcionService = {
  // ============ PÚBLICO ============
  
  /**
   * Obtener planes de membresía
   * GET /api/public/planes-membresia
   */
  getPlanesMembresia: async () => {
    try {
      const response = await api.get('/public/planes-membresia');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error getPlanesMembresia:', error);
      return getPlanesPrueba();
    }
  },
  
  /**
   * Obtener mascotas disponibles para apadrinar
   * GET /api/public/mascotas-para-apadrinar
   */
  getMascotasApadrinar: async () => {
    try {
      const response = await api.get('/public/mascotas-para-apadrinar');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error getMascotasApadrinar:', error);
      return getMascotasPrueba();
    }
  },
  
  /**
   * Crear una nueva suscripción
   * POST /api/public/suscripciones-crear
   */
  createPublicSuscripcion: async (data) => {
    try {
      const response = await api.post('/public/suscripciones-crear', data);
      return response.data;
    } catch (error) {
      console.error('Error createPublicSuscripcion:', error);
      throw error;
    }
  },
  
  /**
   * Obtener suscripciones del usuario autenticado
   * GET /api/user/mis-suscripciones
   */
  getUserSuscripciones: async () => {
    try {
      const response = await api.get('/user/mis-suscripciones');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error getUserSuscripciones:', error);
      return [];
    }
  },
  
  /**
   * Cancelar una suscripción
   * POST /api/user/suscripciones/{id}/cancelar
   */
  cancelUserSuscripcion: async (id) => {
    try {
      const response = await api.post(`/user/suscripciones/${id}/cancelar`);
      return response.data;
    } catch (error) {
      console.error('Error cancelUserSuscripcion:', error);
      throw error;
    }
  },
  
  /**
   * Obtener estadísticas de suscripciones
   * GET /api/public/suscripciones-estadisticas
   */
  getEstadisticas: async () => {
    try {
      const response = await api.get('/public/suscripciones-estadisticas');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error getEstadisticas:', error);
      return null;
    }
  },

  // ============ ADMIN (requieren autenticación) ============
  
  getAll: async () => {
    const response = await api.get('/v1/admin/suscripciones');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/v1/admin/suscripciones/${id}`);
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/v1/admin/suscripciones', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/v1/admin/suscripciones/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/v1/admin/suscripciones/${id}`);
    return response.data;
  },
};

// Datos de prueba por si el backend no está disponible
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

function getMascotasPrueba() {
  return [
    {
      id: 1,
      nombre: 'Max',
      especie: 'Perro',
      raza: 'Golden Retriever',
      edad: 3,
      historia_corta: 'Max fue rescatado de la calle y necesita cuidados especiales.',
      monto_sugerido: 15000,
      apadrinamientos: 2,
      foto_url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=300&h=250&fit=crop',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      nombre: 'Luna',
      especie: 'Gato',
      raza: 'Siamés',
      edad: 2,
      historia_corta: 'Luna es muy cariñosa y busca un hogar temporal.',
      monto_sugerido: 12000,
      apadrinamientos: 1,
      foto_url: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=300&h=250&fit=crop',
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      nombre: 'Toby',
      especie: 'Perro',
      raza: 'Labrador',
      edad: 4,
      historia_corta: 'Toby necesita una operación y tu ayuda es vital.',
      monto_sugerido: 20000,
      apadrinamientos: 0,
      foto_url: 'https://images.unsplash.com/photo-1587301091292-9d12c5e3c1b6?w=300&h=250&fit=crop',
      created_at: new Date().toISOString()
    }
  ];
}

export default api;