// src/services/profileService.js
import api from "./api"; // Tu instancia de axios

export const profileService = {
  // ===== PERFIL DE USUARIO =====

  // Obtener perfil
  getProfile: async () => {
    const response = await api.get("/user/profile");
    return response.data.data;
  },

  // Actualizar perfil completo
  updateProfile: async (data) => {
    const formData = new FormData();

    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        if (typeof data[key] === "object") {
          formData.append(key, JSON.stringify(data[key]));
        } else {
          formData.append(key, data[key]);
        }
      }
    });

    const response = await api.put("/user/profile", formData);
    return response.data.data;
  },

  // Subir avatar
  updateAvatar: async (file) => {
    const formData = new FormData();
    formData.append("avatar", file);
    const response = await api.post("/user/profile/avatar", formData);
    return response.data.data;
  },

  // Eliminar avatar
  deleteAvatar: async () => {
    const response = await api.delete("/user/profile/avatar");
    return response.data;
  },

  // Actualizar ubicación
  updateLocation: async (location) => {
    const response = await api.put("/user/profile/location", location);
    return response.data.data;
  },

  // Actualizar redes sociales
  updateSocialNetworks: async (networks) => {
    const response = await api.put("/user/profile/social", networks);
    return response.data.data;
  },

  // Cambiar contraseña
  changePassword: async (data) => {
    const response = await api.post("/user/profile/change-password", data);
    return response.data;
  },

  // Obtener estado de completado
  getCompletionStatus: async () => {
    const response = await api.get("/user/profile/completion-status");
    return response.data.data;
  },

  // Enviar código verificación teléfono
  sendPhoneVerification: async () => {
    const response = await api.post("/user/profile/verify-phone");
    return response.data.data;
  },

  // Confirmar código verificación teléfono
  confirmPhoneVerification: async (code) => {
    const response = await api.post("/user/profile/verify-phone/confirm", {
      code,
    });
    return response.data.data;
  },

  // ============================================
  // 🔥 NUEVOS MÉTODOS PARA FUNDACIÓN
  // ============================================

  /**
   * Obtener perfil de fundación
   * @param {number} id - ID del usuario o fundación
   */
  getFundacionProfile: async () => {
    const response = await api.get("/fundacion/profile");
    return response.data.data;
  },

  /**
   * Actualizar perfil de fundación
   * @param {Object} data - Datos de la fundación
   */
  updateFundacionProfile: async (data) => {
    const response = await api.put("/fundacion/profile", data);
    return response.data.data;
  },

  /**
   * Actualizar necesidades de la fundación
   * @param {Object} needs - Necesidades actuales
   */
  updateFundacionNeeds: async (needs) => {
    const response = await api.put("/fundacion/profile/needs", {
      necesidades_actuales: needs,
    });
    return response.data.data;
  },

  /**
   * Actualizar horario y disponibilidad de voluntarios
   * @param {Object} data - { horario, recibeVoluntarios }
   */
  updateFundacionSchedule: async (data) => {
    const response = await api.put("/fundacion/profile/schedule", data);
    return response.data.data;
  },

  /**
   * Subir imagen de portada
   * @param {File} file - Archivo de imagen
   */
  uploadFundacionCover: async (file) => {
    const formData = new FormData();
    formData.append("cover_image", file);
    const response = await api.post("/fundacion/profile/cover", formData);
    return response.data.data;
  },

  /**
   * Eliminar imagen de portada
   */
  deleteFundacionCover: async () => {
    const response = await api.delete("/fundacion/profile/cover");
    return response.data;
  },

  /**
   * Actualizar información general de la fundación (alias para updateFundacionProfile)
   */
  updateFundacionGeneral: async (data) => {
    return await profileService.updateFundacionProfile(data);
  },
};
