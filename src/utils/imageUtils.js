// src/utils/imageUtils.js - Versión que funciona en público
export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  if (path.startsWith('data:')) return path;
  
  // Limpiar la ruta
  let cleanPath = path;
  cleanPath = cleanPath.replace(/^\/?(api\/)?(storage\/)?/, '');
  
  // Usar la misma URL que en la parte pública
  return `http://rescatando-mascotas-forever.test/storage/${cleanPath}`;
};