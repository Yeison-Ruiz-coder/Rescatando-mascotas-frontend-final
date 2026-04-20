// src/services/rescateService.js
import api from "./api";

export const rescateService = {
  // Obtener rescates disponibles cerca de la entidad
  getDisponibles: () => api.get("/entity/rescates/disponibles"),

  // Obtener rescates que ha aceptado la entidad
  getMisRescates: () => api.get("/entity/rescates/mis-rescates"),

  // Obtener detalle de un rescate específico
  getRescateById: (id) => api.get(`/entity/rescates/${id}`),

  // Aceptar un rescate
  aceptarRescate: (id) => api.put(`/entity/rescates/${id}/aceptar`),

  // Rechazar un rescate
  rechazarRescate: (id) => api.put(`/entity/rescates/${id}/rechazar`),

  // Registrar mascota desde un rescate
  registrarMascota: (id, formData) => {
    // Asegurar que formData sea FormData
    if (!(formData instanceof FormData)) {
      console.error("Error: formData no es una instancia de FormData");
      return Promise.reject(new Error("Formato de datos incorrecto"));
    }

    return api.post(`/entity/rescates/${id}/registrar-mascota`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
