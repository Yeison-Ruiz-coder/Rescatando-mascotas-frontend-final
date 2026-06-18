// src/utils/imageUtils.js
import { STORAGE_URL } from '../config/appConfig';

const isAbsoluteUrl = (value) => /^https?:\/\//i.test(value);

const isCloudinaryUrl = (url) =>
  typeof url === 'string' &&
  url.includes('cloudinary.com') &&
  url.includes('/upload/');

const hasCloudinaryTransforms = (url) =>
  /(?:^|\/)upload\/(?:.*?)(?:f_auto|q_auto|w_\d+|h_\d+|c_[a-z]+)/i.test(url);

const normalizeCloudinaryUrl = (url, width = 400) => {
  if (!isCloudinaryUrl(url) || hasCloudinaryTransforms(url)) return url;

  return url.replace(
    '/upload/',
    `/upload/f_auto,q_auto,w_${width},c_fill/`
  );
};

/**
 * Obtiene la URL completa de una imagen desde el backend o desde un URL remoto ya válido.
 * @param {string} path - Ruta relativa, absoluta o Cloudinary
 * @returns {string|null} URL completa o null
 */
export const getImageUrl = (path) => {
  if (!path) return null;

  const trimmedPath = String(path).trim();

  if (isAbsoluteUrl(trimmedPath)) {
    return isCloudinaryUrl(trimmedPath)
      ? normalizeCloudinaryUrl(trimmedPath)
      : trimmedPath;
  }

  const normalizedStoragePath = trimmedPath
    .replace(/^\/+/, '')
    .replace(/^storage\/?/, '');

  const baseStorageUrl = STORAGE_URL.replace(/\/$/, '');
  const finalStorageUrl = baseStorageUrl.endsWith('/storage')
    ? baseStorageUrl
    : `${baseStorageUrl}/storage`;

  return `${finalStorageUrl}/${normalizedStoragePath}`;
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