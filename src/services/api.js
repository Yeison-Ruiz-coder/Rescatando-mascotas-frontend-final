// src/services/api.js
import axios from "axios";

// ✅ Definir API_URL aquí - NO importar de appConfig
const API_URL = import.meta.env.VITE_API_URL || "/api";

console.log("🔍 [INIT] API_URL =", API_URL);
console.log("🔍 [INIT] VITE_API_URL =", import.meta.env.VITE_API_URL);

// ============================================
// FUNCIÓN PARA NORMALIZAR HEADERS
// ============================================
const normalizeHeaders = (config) => {
  if (!config.headers) {
    config.headers = {};
  }

  const isFormData = config.data instanceof FormData;
  const isUrlEncoded = config.data instanceof URLSearchParams;
  const hasContentType =
    config.headers?.["Content-Type"] || config.headers?.["content-type"];

  if (isFormData || isUrlEncoded) {
    if (typeof config.headers?.delete === "function") {
      config.headers.delete("Content-Type");
      config.headers.delete("content-type");
    } else {
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    }
  } else if (
    config.data !== undefined &&
    config.data !== null &&
    typeof config.data === "object" &&
    !hasContentType
  ) {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
};

// ============================================
// INSTANCIA PÚBLICA (SIN AUTENTICACIÓN)
// ============================================
export const publicApi = axios.create({
  baseURL: API_URL,  // ✅ Ahora usa "/api"
  headers: {
    Accept: "application/json",
  },
  withCredentials: false,
});

publicApi.interceptors.request.use(
  (config) => normalizeHeaders(config),
  (error) => Promise.reject(error)
);

// ============================================
// INSTANCIA PRINCIPAL (CON AUTENTICACIÓN)
// ============================================
const api = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return normalizeHeaders(config);
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const reportarRescate = (data) =>
  publicApi.post("/rescates/reportar", data);

export default api;