// src/components/common/FundacionCard/FundacionCard.jsx
import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Building, MapPin, Users, Heart, Award, ChevronRight } from 'lucide-react';
import './FundacionCard.css';

const FundacionCard = memo(({
  fundacion,
  getImageUrl,
  variant = 'default',
  onView
}) => {
  const { t } = useTranslation('fundaciones');

  const {
    id,
    Nombre_1,
    Descripcion,
    ciudad,
    total_mascotas = 0,
    verificado = false,
    imagen_portada
  } = fundacion;

  const imageUrl = useMemo(() => {
    if (!imagen_portada) return null;
    try {
      return getImageUrl(imagen_portada);
    } catch (error) {
      return null;
    }
  }, [imagen_portada, getImageUrl]);

  const handleCardClick = () => {
    onView?.(fundacion);
  };

  const handleOverlayClick = (e) => {
    e.stopPropagation();
    onView?.(fundacion);
  };

  return (
    <div 
      className="fc-card" 
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      <div className="fc-image">
        {imageUrl ? (
          <img src={imageUrl} alt={Nombre_1} loading="lazy" />
        ) : (
          <div className="fc-placeholder">
            <Building />
          </div>
        )}
        
        {verificado && (
          <div className="fc-verified-badge">
            <Award />
            <span>{t('verificado', 'Verificada')}</span>
          </div>
        )}
      </div>

      {/* Contenido normal (siempre visible) */}
      <div className="fc-content">
        <h3 className="fc-titulo">{Nombre_1}</h3>
        
        {ciudad && (
          <div className="fc-ciudad">
            <MapPin />
            <span>{ciudad}</span>
          </div>
        )}

        {Descripcion && (
          <p className="fc-descripcion">
            {Descripcion.length > 100 ? Descripcion.substring(0, 100) + '...' : Descripcion}
          </p>
        )}

        <div className="fc-stats">
          <div className="fc-stat">
            <Users />
            <span>{total_mascotas} {t('mascotas', 'mascotas')}</span>
          </div>
          <div className="fc-stat">
            <Heart />
            <span>{t('rescatadas', 'rescatadas')}</span>
          </div>
        </div>
      </div>

      {/* Overlay hover */}
      <div className="fc-overlay">
        <button
          className="fc-overlay-btn"
          onClick={handleOverlayClick}
          type="button"
        >
          <span>{t('conocer', 'Conocer fundación')}</span>
          <ChevronRight />
        </button>
      </div>
    </div>
  );
});

FundacionCard.displayName = 'FundacionCard';

export default FundacionCard;