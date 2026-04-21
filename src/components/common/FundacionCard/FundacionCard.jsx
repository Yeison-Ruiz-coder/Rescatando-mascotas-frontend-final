import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Building, MapPin, Phone, Users, Heart, Award, ChevronRight } from 'lucide-react';
import './FundacionCard.css';

const FundacionCard = ({
  fundacion,
  getImageUrl,
  variant = 'default', // 'default' | 'compact' | 'featured'
  showActions = true
}) => {
  const { t } = useTranslation('fundaciones');

  const {
    id,
    Nombre_1,
    Descripcion,
    Direccion,
    Telefono,
    Email,
    ciudad,
    total_mascotas = 0,
    verificado = false,
    imagen_portada
  } = fundacion;

  return (
    <div className={`fundacion-card ${variant}`}>
      <div className="card-image">
        {getImageUrl(imagen_portada) ? (
          <img
            src={getImageUrl(imagen_portada)}
            alt={Nombre_1}
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              if (e.target.parentElement) {
                const placeholder = e.target.parentElement.querySelector('.image-placeholder');
                if (placeholder) placeholder.style.display = 'flex';
              }
            }}
          />
        ) : null}
        <div className="image-placeholder" style={{ display: imagen_portada ? 'none' : 'flex' }}>
          <Building size={48} />
          <span>{t('fundacion') || 'Fundación'}</span>
        </div>

        {verificado && (
          <div className="verified-badge">
            <Award size={14} />
            <span>{t('verificado') || 'Verificada'}</span>
          </div>
        )}
      </div>

      <div className="card-content">
        <h3 className="card-title">{Nombre_1}</h3>
        {ciudad && (
          <div className="card-city">
            <MapPin size={14} />
            <span>{ciudad}</span>
          </div>
        )}
        
        <p className="card-description">
          {Descripcion
            ? Descripcion.substring(0, 100)
            : t('sin_descripcion') || 'Sin descripción'}
          {Descripcion?.length > 100 ? '...' : ''}
        </p>

        <div className="card-info">
          {Direccion && (
            <div className="info-item">
              <MapPin size={14} />
              <span>{Direccion}</span>
            </div>
          )}
          {Telefono && (
            <div className="info-item">
              <Phone size={14} />
              <span>{Telefono}</span>
            </div>
          )}
        </div>

        <div className="card-stats">
          <div className="stat">
            <Users size={14} />
            <span>{total_mascotas} {t('mascotas') || 'mascotas'}</span>
          </div>
          <div className="stat">
            <Heart size={14} />
            <span>{t('rescatadas') || 'rescatadas'}</span>
          </div>
        </div>

        {showActions && (
          <div className="card-footer">
            <Link to={`/fundaciones/${id}`} className="btn-primary">
              {t('ver_mas') || 'Ver más'} <ChevronRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default FundacionCard;