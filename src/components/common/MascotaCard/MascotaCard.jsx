// src/components/common/MascotaCard/MascotaCard.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './MascotaCard.css';

const MascotaCard = ({ 
  mascota, 
  getImageUrl, 
  variant = 'default',
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
      className={`mascard-card ${variant}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Imagen con lazy loading y manejo de error */}
      {imageUrl ? (
        <img 
          src={imageUrl}
          alt={nombre_mascota}
          className="mascard-image"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="mascard-placeholder">
          <span>🐾</span>
        </div>
      )}

      {/* Nombre de la mascota */}
      <div className="mascard-name">
        {nombre_mascota}
      </div>

      {/* Badges informativos */}
      <div className="mascard-badges">
        <span className="mascard-badge mascard-badge-specie">
          {especie || t('mascota', 'Mascota')}
        </span>
        <span className="mascard-badge mascard-badge-gender">
          {genero === 'Macho' ? t('macho', 'Macho') : genero === 'Hembra' ? t('hembra', 'Hembra') : '?'}
        </span>
        <span className="mascard-badge mascard-badge-age">
          {formatEdad(edad_aprox)}
        </span>
      </div>

      {/* Overlay al hover */}
      <div className={`mascard-overlay ${isHovered ? 'visible' : ''}`}>
        {descripcion && (
          <p className="mascard-overlay-desc">
            {descripcion.length > 100 ? descripcion.substring(0, 100) + '...' : descripcion}
          </p>
        )}
        
        {fundacion && (
          <div className="mascard-overlay-fundacion">
            <span>🏠</span>
            <span>{fundacion.Nombre_1 || t('fundacion', 'Fundación')}</span>
          </div>
        )}
        
        {lugar_rescate && (
          <div className="mascard-overlay-ubicacion">
            <span>📍</span>
            <span>{lugar_rescate}</span>
          </div>
        )}
        
        <button
          className="mascard-btn reveal-up delay-100"
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

export default MascotaCard;