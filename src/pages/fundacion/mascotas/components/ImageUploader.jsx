// src/pages/fundacion/mascotas/components/ImageUploader.jsx
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import './ImageUploader.css';

const ImageUploader = ({ images, onAdd, onRemove, maxFiles = 5, multiple = true }) => {
  const { t } = useTranslation('nuevaMascota');

  const handleFileChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = maxFiles - images.length;
    const filesToAdd = files.slice(0, remainingSlots);
    
    const newImages = [...images];
    let processedCount = 0;
    
    if (filesToAdd.length === 0) {
      if (files.length > 0) {
        alert(t('mensajes.max_imagenes', { max: maxFiles }));
      }
      e.target.value = '';
      return;
    }
    
    filesToAdd.forEach(file => {
      if (file.type.startsWith('image/') && file.size <= 2 * 1024 * 1024) {
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages.push({ file, preview: reader.result });
          processedCount++;
          if (processedCount === filesToAdd.length) {
            onAdd(newImages);
          }
        };
        reader.readAsDataURL(file);
      } else {
        alert(t('mensajes.imagen_invalida'));
        processedCount++;
        if (processedCount === filesToAdd.length && newImages.length > images.length) {
          onAdd(newImages);
        }
      }
    });
    
    e.target.value = '';
  }, [images, onAdd, maxFiles, t]);

  return (
    <div className="image-uploader">
      <label className="image-uploader-label">
        <i className="fas fa-cloud-upload-alt"></i>
        <span>{multiple ? t('seleccionar_imagenes') : t('seleccionar_imagen')}</span>
        <input
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </label>
      
      {images.length > 0 && (
        <div className="image-uploader-preview">
          {images.map((img, idx) => (
            <div key={idx} className="image-preview-item">
              <img src={img.preview} alt={`Preview ${idx}`} />
              <button 
                type="button" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Botón de eliminar clicado para índice:', idx);
                  onRemove(idx);
                }}
                title="Eliminar imagen"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;