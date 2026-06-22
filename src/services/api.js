// src/services/api.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api";

console.log("🔍 [INIT] API_URL =", API_URL);
console.log("🔍 [INIT] VITE_API_URL =", import.meta.env.VITE_API_URL);

// ============================================
// CONTROLADOR GLOBAL DE PETICIONES
// ============================================
class RequestManager {
  constructor() {
    this.abortControllers = new Map();
    this.pendingRequests = new Set();
  }

  registerRequest(url, controller) {
    const key = this.getRequestKey(url);
    if (this.abortControllers.has(key)) {
      const oldController = this.abortControllers.get(key);
      oldController.abort();
      this.abortControllers.delete(key);
      this.pendingRequests.delete(key);
    }
    this.abortControllers.set(key, controller);
    this.pendingRequests.add(key);
    return key;
  }

  completeRequest(url) {
    const key = this.getRequestKey(url);
    this.abortControllers.delete(key);
    this.pendingRequests.delete(key);
  }

  cancelAllRequests() {
    if (this.pendingRequests.size === 0) return;
    
    console.log(`🛑 [GLOBAL] Cancelando ${this.pendingRequests.size} peticiones activas...`);
    
    for (const [key, controller] of this.abortControllers) {
      controller.abort();
      console.log(`   ⏹️ Cancelada: ${key}`);
    }
    
    this.abortControllers.clear();
    this.pendingRequests.clear();
  }

  getRequestKey(url) {
    return url?.split('?')[0] || url;
  }

  hasPendingRequests() {
    return this.pendingRequests.size > 0;
  }
}

export const requestManager = new RequestManager();

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
  baseURL: API_URL,
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
    
    // ✅ Agrega AbortController para cancelación global
    const controller = new AbortController();
    config.signal = controller.signal;
    
    // Registra la petición en el manager global
    const requestKey = requestManager.registerRequest(config.url, controller);
    config._requestKey = requestKey;
    
    return normalizeHeaders(config);
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    // Limpia la petición completada
    requestManager.completeRequest(response.config.url);
    return response;
  },
  (error) => {
    // Si fue cancelada, no hacer nada
    if (axios.isCancel(error) || error.name === 'CanceledError' || error.name === 'AbortError') {
      return Promise.reject(error);
    }
    
    // Limpia la petición si falló
    if (error.config) {
      requestManager.completeRequest(error.config.url);
    }
    
    // Manejo de 401 (lo que ya tenías)
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