// src/components/common/MascotaCard/MascotaCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './MascotaCard.css';

const MascotaCard = ({ 
  mascota, 
  getImageUrl, 
  showFundacion = true,
  variant = 'default' // 'default' | 'compact' | 'featured'
}) => {
  const { t } = useTranslation('mascotas');
  const { nombre_mascota, descripcion, especie, genero, edad_aprox, fundacion, id } = mascota;

  // Formatear edad con traducción
  const formatEdad = (edad) => {
    if (!edad) return '?';
    return t('edad_años', { edad }) || `${edad} años`;
  };

  return (
    <div className={`mascota-card ${variant}`}>
      <div className="card-image">
        {getImageUrl(mascota.foto_principal) ? (
          <img
            src={getImageUrl(mascota.foto_principal)}
            alt={nombre_mascota}
          />
        ) : (
          <div className="image-placeholder">
            <i className="fas fa-paw fa-3x"></i>
            <span>{t('sin_imagen')}</span>
          </div>
        )}
        <div className="card-badges">
          <span className="badge badge-primary">
            {especie || t('especie') || 'Mascota'}
          </span>
          <span className="badge badge-dark">
            {genero === 'Macho' ? t('macho') : genero === 'Hembra' ? t('hembra') : genero || 'N/A'}
          </span>
          <span className="badge badge-accent">
            {formatEdad(edad_aprox)}
          </span>
        </div>
      </div>
      
      <div className="card-content">
        <h3 className="card-title">{nombre_mascota}</h3>
        <p className="card-description">
          {descripcion
            ? descripcion.substring(0, 120)
            : t('sin_descripcion')}
          {descripcion?.length > 120 ? '...' : ''}
        </p>
        
        {showFundacion && fundacion && (
          <div className="card-fundacion">
            <i className="fas fa-home"></i>
            <span>{t('rescatado_por')}: {fundacion.Nombre_1 || 'Fundación'}</span>
          </div>
        )}
        
        <div className="card-buttons">
          <Link
            to={`/mascotas/${id}`}
            className="btn-card btn-card-outline"
          >
            <i className="fas fa-heart"></i> {t('conocer_mas')}
          </Link>
          <Link
            to={`/solicitar-adopcion/${id}`}
            className="btn-card btn-card-primary"
          >
            <i className="fas fa-home"></i> {t('adoptar')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MascotaCard;