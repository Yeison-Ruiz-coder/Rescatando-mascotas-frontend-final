const DEFAULT_API_BASE = 'https://rescatando-mascotas-backend-final-production.up.railway.app';

export const API_BASE_URL = import.meta.env.VITE_API_URL || DEFAULT_API_BASE;
const normalizedApiBase = API_BASE_URL.replace(/\/$/, '');

export const API_URL = import.meta.env.DEV
  ? '/api'
  : (normalizedApiBase.endsWith('/api')
      ? normalizedApiBase
      : `${normalizedApiBase}/api`);

const storageEnv = import.meta.env.VITE_STORAGE_URL?.trim();
export const STORAGE_URL = storageEnv
  ? (storageEnv.endsWith('/storage')
      ? storageEnv.replace(/\/$/, '')
      : `${storageEnv.replace(/\/$/, '')}/storage`)
  : `${normalizedApiBase}/storage`;
