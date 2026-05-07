// src/services/rescateService.js
import api from "./api";

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
    // Para FormData, no establecer Content-Type para que axios lo maneje automáticamente
    return api.post("/rescates/reportar", formData, {
      headers: {
        'Content-Type': undefined, // Permite que axios establezca multipart/form-data automáticamente
      },
    });
  },

  getRescatePublico: (id) => api.get(`/rescates/${id}`),

  // ========== LADO ENTIDAD ==========

  getDisponibles: () => api.get("/entity/rescates/disponibles"),
  getMisRescates: () => api.get("/entity/rescates/mis-rescates"),
  getRescateById: (id) => api.get(`/entity/rescates/${id}`),
  aceptarRescate: (id) => api.put(`/entity/rescates/${id}/aceptar`),
  rechazarRescate: (id) => api.put(`/entity/rescates/${id}/rechazar`),
  completarRescate: (id, data) => api.put(`/entity/rescates/${id}/completar`, data),
  
  registrarMascota: (id, formData) => {
    if (!(formData instanceof FormData)) {
      console.error("Error: formData no es una instancia de FormData");
      return Promise.reject(new Error("Formato de datos incorrecto"));
    }
    // Para FormData, no establecer Content-Type para que axios lo maneje automáticamente
    return api.post(`/entity/rescates/${id}/registrar-mascota`, formData, {
      headers: {
        'Content-Type': undefined, // Permite que axios establezca multipart/form-data automáticamente
      },
    });
  },
};