// src/components/common/VeterinariaCard/VeterinariaCard.jsx
import React, { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Building, MapPin, Phone, Clock, Shield, Ambulance, ChevronRight } from 'lucide-react';
import './VeterinariaCard.css';

const VeterinariaCard = memo(({
  veterinaria,
  getImageUrl,
  variant = 'default',
  onView
}) => {
  const { t } = useTranslation('veterinarias');
  const [imgError, setImgError] = useState(false);

  const {
    id,
    Nombre_vet,
    Direccion,
    Telefono,
    ciudad,
    verificado = false,
    urgencias_24h = false,
    horario_atencion,
    servicios,
    logo
  } = veterinaria;

  const getServiciosList = () => {
    if (!servicios) return [];
    
    let parsedServicios = [];
    if (typeof servicios === 'string') {
      try {
        parsedServicios = JSON.parse(servicios);
      } catch {
        return [];
      }
    } else if (Array.isArray(servicios)) {
      parsedServicios = servicios;
    } else {
      return [];
    }
    
    // ✅ CORRECCIÓN: Si es array de objetos, extraer el nombre
    if (parsedServicios.length > 0 && typeof parsedServicios[0] === 'object') {
      return parsedServicios.map(s => s.nombre || s.name || s.servicio || String(s));
    }
    
    return parsedServicios;
  };

  const serviciosList = getServiciosList();
  const serviciosMostrar = serviciosList.slice(0, 2);

  const imageUrl = useMemo(() => {
    if (!logo || imgError) return null;
    try {
      return getImageUrl(logo);
    } catch (error) {
      return null;
    }
  }, [logo, getImageUrl, imgError]);

  const handleCardClick = () => {
    onView?.(veterinaria);
  };

  const handleOverlayClick = (e) => {
    e.stopPropagation();
    onView?.(veterinaria);
  };

  return (
    <div 
      className="vc-card" 
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
      <div className="vc-image">
        {imageUrl ? (
          <img src={imageUrl} alt={Nombre_vet} loading="lazy" onError={() => setImgError(true)} />
        ) : (
          <div className="vc-placeholder">
            <Building />
          </div>
        )}
        
        <div className="vc-badges">
          {verificado && (
            <span className="vc-badge-verificado" title={t('verificado', 'Verificada')}>
              <Shield />
              <span>{t('verificado', 'Verif')}</span>
            </span>
          )}
          {urgencias_24h && (
            <span className="vc-badge-urgencia" title={t('urgencias_24h', 'Urgencias 24h')}>
              <Ambulance />
              <span>24h</span>
            </span>
          )}
        </div>
      </div>

      <div className="vc-content">
        <h3 className="vc-titulo">{Nombre_vet}</h3>
        
        {ciudad && (
          <div className="vc-ciudad">
            <MapPin />
            <span>{ciudad}</span>
          </div>
        )}

        {serviciosMostrar.length > 0 && (
          <div className="vc-servicios">
            {serviciosMostrar.map((servicio, idx) => (
              <span key={idx} className="vc-servicio-tag">
                {typeof servicio === 'string' 
                  ? (servicio.length > 20 ? servicio.substring(0, 20) + '...' : servicio)
                  : (servicio?.nombre || servicio?.name || servicio?.servicio || 'Servicio')}
              </span>
            ))}
            {serviciosList.length > 2 && (
              <span className="vc-servicio-tag vc-servicio-mas">
                +{serviciosList.length - 2} más
              </span>
            )}
          </div>
        )}

        <div className="vc-contacto">
          {Telefono && (
            <div className="vc-contact-item">
              <Phone />
              <span>{Telefono}</span>
            </div>
          )}
          {horario_atencion && (
            <div className="vc-contact-item">
              <Clock />
              <span>{horario_atencion}</span>
            </div>
          )}
        </div>
      </div>

      <div className="vc-overlay">
        <button
          className="vc-overlay-btn"
          onClick={handleOverlayClick}
          type="button"
        >
          <span>{t('conocer', 'Conocer veterinaria')}</span>
          <ChevronRight />
        </button>
      </div>
    </div>
  );
});

VeterinariaCard.displayName = 'VeterinariaCard';

export default VeterinariaCard;