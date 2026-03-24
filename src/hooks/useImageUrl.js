const useImageUrl = () => {
    const storageUrl = import.meta.env.VITE_STORAGE_URL || 'http://rescatando-mascotas-forever.test/storage';
    
    const getImageUrl = (path) => {
        if (!path) return 'https://via.placeholder.com/300x200?text=Sin+Imagen';
        
        if (path.startsWith('http')) return path;
        
        return `${storageUrl}/${path}`;
    };

    return { getImageUrl };
};

export default useImageUrl;