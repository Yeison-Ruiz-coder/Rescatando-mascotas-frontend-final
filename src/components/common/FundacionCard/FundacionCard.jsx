// src/components/common/FundacionCard/FundacionCard.jsx
import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Building, MapPin, Phone, Users, Heart, Award, ChevronRight } from 'lucide-react';
import './FundacionCard.css';

const FundacionCard = memo(({
  fundacion,
  getImageUrl,
  variant = 'default',
  showActions = true,
  onView
}) => {
  const { t } = useTranslation('fundaciones');

  const {
    id,
    Nombre_1,
    Descripcion,
    Direccion,
    Telefono,
    ciudad,
    total_mascotas = 0,
    verificado = false,
    imagen_portada
  } = fundacion;

  const imageUrl = useMemo(() => getImageUrl(imagen_portada), [imagen_portada, getImageUrl]);

  return (
    <div className={`fc-card ${variant}`}>
      <div className="fc-image">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={Nombre_1}
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              const placeholder = e.target.parentElement?.querySelector('.fc-placeholder');
              if (placeholder) placeholder.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="fc-placeholder" style={{ display: imagen_portada ? 'none' : 'flex' }}>
          <Building size={48} />
          <span>{t('fundacion') || 'Fundación'}</span>
        </div>

        {verificado && (
          <div className="fc-verified-badge">
            <Award size={14} />
            <span>{t('verificado') || 'Verificada'}</span>
          </div>
        )}
      </div>

      <div className="fc-content">
        <h3 className="fc-title">{Nombre_1}</h3>
        
        {ciudad && (
          <div className="fc-city">
            <MapPin size={14} />
            <span>{ciudad}</span>
          </div>
        )}
        
        <p className="fc-description">
          {Descripcion
            ? Descripcion.substring(0, 100)
            : t('sin_descripcion') || 'Sin descripción'}
          {Descripcion?.length > 100 ? '...' : ''}
        </p>

        <div className="fc-info">
          {Direccion && (
            <div className="fc-info-item">
              <MapPin size={14} />
              <span>{Direccion}</span>
            </div>
          )}
          {Telefono && (
            <div className="fc-info-item">
              <Phone size={14} />
              <span>{Telefono}</span>
            </div>
          )}
        </div>

        <div className="fc-stats">
          <div className="fc-stat">
            <Users size={14} />
            <span>{total_mascotas} {t('mascotas') || 'mascotas'}</span>
          </div>
          <div className="fc-stat">
            <Heart size={14} />
            <span>{t('rescatadas') || 'rescatadas'}</span>
          </div>
        </div>

        {showActions && (
          <div className="fc-footer">
            <button 
              className="fc-btn"
              onClick={(e) => { e.stopPropagation(); onView?.(fundacion); }}
              type="button"
            >
              {t('ver_mas') || 'Ver más'} <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

FundacionCard.displayName = 'FundacionCard';

export default FundacionCard;