// src/services/suscripcionService.js
import api from './api';

export const suscripcionService = {
  // ============ ADMIN ============
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

  // ============ FUNDACIÓN ============
  getFundacionSuscripciones: async () => {
    const response = await api.get('/v1/fundacion/suscripciones');
    return response.data;
  },
  
  getFundacionSuscripcionById: async (id) => {
    const response = await api.get(`/v1/fundacion/suscripciones/${id}`);
    return response.data;
  },
  
  createFundacionSuscripcion: async (data) => {
    const response = await api.post('/v1/fundacion/suscripciones', data);
    return response.data;
  },
  
  updateFundacionSuscripcion: async (id, data) => {
    const response = await api.put(`/v1/fundacion/suscripciones/${id}`, data);
    return response.data;
  },
  
  getMascotasFundacion: async () => {
    const response = await api.get('/v1/fundacion/mascotas');
    return response.data;
  },
  
  getHistorialPagos: async (suscripcionId) => {
    const response = await api.get(`/v1/fundacion/suscripciones/${suscripcionId}/pagos`);
    return response.data;
  },
  
  pausarSuscripcion: async (id) => {
    const response = await api.post(`/v1/fundacion/suscripciones/${id}/pausar`);
    return response.data;
  },
  
  reactivarSuscripcion: async (id) => {
    const response = await api.post(`/v1/fundacion/suscripciones/${id}/reactivar`);
    return response.data;
  },

  // ============ VETERINARIA ============
  getVeterinariaSuscripciones: async () => {
    const response = await api.get('/v1/veterinaria/suscripciones');
    return response.data;
  },
  
  getVeterinariaSuscripcionById: async (id) => {
    const response = await api.get(`/v1/veterinaria/suscripciones/${id}`);
    return response.data;
  },

  // ============ PÚBLICO ============
  getPlanesMembresia: async () => {
    const response = await api.get('/public/planes-membresia');
    return response.data;
  },
  
  getMascotasApadrinar: async () => {
    const response = await api.get('/public/mascotas-para-apadrinar');
    return response.data;
  },
  
  createPublicSuscripcion: async (data) => {
    const response = await api.post('/public/suscripciones', data);
    return response.data;
  },
  
  // ============ USUARIO AUTENTICADO ============
  getUserSuscripciones: async () => {
    const response = await api.get('/user/mis-suscripciones');
    return response.data;
  },
  
  cancelUserSuscripcion: async (id) => {
    const response = await api.post(`/user/suscripciones/${id}/cancelar`);
    return response.data;
  },
};

export default api;