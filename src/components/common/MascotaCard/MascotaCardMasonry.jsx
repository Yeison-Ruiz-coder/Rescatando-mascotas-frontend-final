// src/components/common/MascotaCard/MascotaCardMasonry.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './MascotaCardMasonry.css';

const MascotaCardMasonry = ({ 
  mascota, 
  getImageUrl, 
  onView 
}) => {
  const { t } = useTranslation(['mascotas', 'common']);
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  
  const { 
    nombre_mascota, 
    descripcion, 
    especie, 
    genero, 
    edad_aprox, 
    fundacion, 
    foto_principal,
    lugar_rescate 
  } = mascota;

  const formatEdad = (edad) => {
    if (!edad) return '?';
    if (edad < 1) return t('cachorro', 'Cachorro');
    if (edad === 1) return t('1_año', '1 año');
    return t('edad_años', { edad: Math.floor(edad) });
  };

  const getImage = () => {
    if (!foto_principal || imgError) return null;
    if (typeof getImageUrl === 'function') return getImageUrl(foto_principal);
    return foto_principal;
  };

  const imageUrl = getImage();

  return (
    <div 
      className="mcm-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Imagen - SIN altura fija, que fluya naturalmente */}
      <div className="mcm-image-container">
        {imageUrl ? (
          <img 
            src={imageUrl}
            alt={nombre_mascota}
            className="mcm-image"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="mcm-placeholder">
            <span>🐾</span>
          </div>
        )}
      </div>

      <div className="mcm-name">
        {nombre_mascota}
      </div>

      <div className="mcm-badges">
      </div>

      <div className={`mcm-overlay ${isHovered ? 'visible' : ''}`}>
        {descripcion && (
          <p className="mcm-overlay-desc">
            {descripcion.length > 100 ? descripcion.substring(0, 100) + '...' : descripcion}
          </p>
        )}
        
        {fundacion && (
          <div className="mcm-overlay-fundacion">
            <span>🏠</span>
            <span>{fundacion.Nombre_1 || t('fundacion', 'Fundación')}</span>
          </div>
        )}
        
        {lugar_rescate && (
          <div className="mcm-overlay-ubicacion">
            <span>📍</span>
            <span>{lugar_rescate}</span>
          </div>
        )}
        
        <button
          className="mcm-btn"
          onClick={(e) => {
            e.stopPropagation();
            onView?.(mascota);
          }}
        >
          {t('conocer_mas', 'Conocer más')}
          <span>→</span>
        </button>
      </div>
    </div>
  );
};

export default MascotaCardMasonry;