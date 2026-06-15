// src/utils/imageUtils.js
/**
 * Obtiene la URL completa de una imagen desde el backend
 * @param {string} path - Ruta relativa o absoluta
 * @returns {string|null} URL completa o null
 */
export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  
  const baseUrl = import.meta.env.VITE_STORAGE_URL || 
                  'https://rescatando-mascotas-backend-final-production.up.railway.app';
  const cleanPath = path.startsWith('/storage') ? path : `/storage/${path}`;
  return `${baseUrl}${cleanPath}`;
};

/**
 * Placeholder por defecto según tipo
 */
export const getPlaceholder = (type = 'mascota') => {
  const placeholders = {
    mascota: '/img/pet-placeholder.jpg',
    fundacion: '/img/fundacion-placeholder.jpg',
    veterinaria: '/img/vet-placeholder.jpg',
    evento: '/img/event-placeholder.jpg',
  };
  return placeholders[type] || '/img/placeholder.jpg';
};