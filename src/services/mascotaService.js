// src/services/mascotaService.js
import api from "./api";

// ✅ Exportar como objeto nombrado
export const mascotaService = {
  // Obtener datos para el formulario (razas, vacunas)
  getFormData: async () => {
    const response = await api.get("/entity/mascotas-form-data");
    return response.data;
  },

  // Obtener todas las mascotas de la fundación (solo para entity)
  getMascotas: async () => {
    const response = await api.get("/entity/mascotas");
    return response.data;
  },

  // ✅ Obtener una mascota específica (público) - CON TIMEOUT
  getMascota: async (id, timeout = 8000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await api.get(`/mascotas/${id}`, {
        params: {
          fields:
            "id,nombre_mascota,especie,genero,edad_aprox,foto_principal,descripcion,lugar_rescate",
          include: "fundacion",
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response.data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === "AbortError") {
        throw new Error(`Timeout al cargar mascota ${id}`);
      }
      throw error;
    }
  },

  // ✅ NUEVO: Obtener múltiples mascotas en paralelo
  getMascotasEnParalelo: async (ids, timeout = 8000) => {
    if (!ids || ids.length === 0) return {};

    console.log(`🔄 Cargando ${ids.length} mascotas en paralelo...`);
    
    const promesas = ids.map(async (id) => {
      try {
        const response = await mascotaService.getMascota(id, timeout);
        const mascota = response.data || response;
        return { id, mascota, success: true };
      } catch (error) {
        console.warn(`⚠️ Error cargando mascota ${id}:`, error.message);
        return { 
          id, 
          mascota: null, 
          success: false,
          error: error.message 
        };
      }
    });

    const resultados = await Promise.all(promesas);
    
    // ✅ Crear mapa de mascotas
    const mascotasMap = {};
    resultados.forEach(({ id, mascota, success }) => {
      if (success && mascota) {
        mascotasMap[id] = mascota;
      } else {
        // ✅ Crear objeto por defecto si falló
        mascotasMap[id] = {
          id: id,
          nombre_mascota: `Mascota #${id}`,
          especie: 'No especificada',
          edad_aprox: null,
          foto_principal: null,
          imagen_url: null
        };
      }
    });

    return mascotasMap;
  },

  // Crear nueva mascota (solo entity)
  createMascota: async (formData) => {
    const response = await api.post("/entity/mascotas", formData);
    return response.data;
  },

  // Actualizar mascota (solo entity)
  updateMascota: async (id, formData) => {
    const response = await api.post(
      `/entity/mascotas/${id}?_method=PUT`,
      formData,
    );
    return response.data;
  },

  // Eliminar mascota (solo entity)
  deleteMascota: async (id) => {
    const response = await api.delete(`/entity/mascotas/${id}`);
    return response.data;
  },

  // Eliminar foto de galería (solo entity)
  deleteFotoGaleria: async (mascotaId, fotoUrl) => {
    const response = await api.delete(
      `/admin/mascotas/${mascotaId}/foto-galeria`,
      {
        data: { foto_url: fotoUrl },
      },
    );
    return response.data;
  },
};

export default mascotaService;