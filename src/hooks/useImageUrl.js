import { getImageUrl as resolveImageUrl } from '../utils/imageUtils';

const useImageUrl = () => {
  const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/300x200?text=Sin+Imagen';
    return resolveImageUrl(path);
  };

  return { getImageUrl };
};

export default useImageUrl;