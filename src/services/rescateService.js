// src/services/rescateService.js
import api, { publicApi } from "./api";

export const rescateService = {
  // ========== LADO PÚBLICO ==========
  
  /**
   * Crear un nuevo reporte de rescate
   * @param {FormData} formData - Datos del rescate incluyendo fotos
   */
  createRescate: (formData) => {
    if (!(formData instanceof FormData)) {
      console.error("Error: se esperaba FormData para crear rescate");
      return Promise.reject(new Error("Formato de datos incorrecto"));
    }
    return publicApi.post("/rescates/reportar", formData);
  },

  getRescatePublico: (id) => publicApi.get(`/rescates/${id}`),

  // ========== LADO ENTIDAD (Fundaciones y Veterinarias) ==========

  /**
   * Obtener rescates disponibles para fundaciones y veterinarias
   * Estos rescates se ven INMEDIATAMENTE al ser reportados
   */
  getDisponibles: () => api.get("/entity/rescates/disponibles"),
  
  /**
   * Obtener rescates que esta entidad ha aceptado o gestionado
   */
  getMisRescates: () => api.get("/entity/rescates/mis-rescates"),
  
  /**
   * Obtener detalle de un rescate específico por ID
   */
  getRescateById: (id) => api.get(`/entity/rescates/${id}`),
  
  /**
   * Aceptar un rescate (la entidad se compromete a ayudar)
   */
  aceptarRescate: (id) => api.put(`/entity/rescates/${id}/aceptar`),
  
  /**
   * Rechazar un rescate
   */
  rechazarRescate: (id) => api.put(`/entity/rescates/${id}/rechazar`),
  
  /**
   * Completar un rescate (marcar como finalizado)
   */
  completarRescate: (id, data) => api.put(`/entity/rescates/${id}/completar`, data),
  
  /**
   * Registrar una mascota asociada a este rescate
   */
  registrarMascota: (id, formData) => {
    if (!(formData instanceof FormData)) {
      console.error("Error: formData no es una instancia de FormData");
      return Promise.reject(new Error("Formato de datos incorrecto"));
    }
    return api.post(`/entity/rescates/${id}/registrar-mascota`, formData);
  },

  // ========== LADO ADMINISTRADOR ==========

  /**
   * Marcar un rescate como disponible para administradores
   * Esto se ejecuta automáticamente después de 30 minutos sin respuesta
   */
  marcarDisponibleParaAdmin: (id) => api.put(`/admin/rescates/${id}/disponible-admin`),
  
  /**
   * Obtener rescates disponibles para administradores
   * (solo los que llevan más de 30 minutos sin respuesta)
   */
  getDisponiblesParaAdmin: () => api.get("/admin/rescates/disponibles"),
  
  /**
   * Obtener todos los rescates (para administradores)
   */
  getAllRescates: (params) => api.get("/admin/rescates", { params }),
  
  /**
   * Asignar un rescate a una entidad específica (admin)
   */
  asignarRescate: (id, entidadId) => api.post(`/admin/rescates/${id}/asignar`, { entidad_id: entidadId }),
  
  /**
   * Eliminar un rescate (solo admin)
   */
  eliminarRescate: (id) => api.delete(`/admin/rescates/${id}`),
};