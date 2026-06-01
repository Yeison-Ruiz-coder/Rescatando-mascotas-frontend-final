// src/components/common/VeterinariaCard/VeterinariaCard.jsx
import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Building, MapPin, Phone, Clock, Shield, Ambulance, ChevronRight } from 'lucide-react';
import './VeterinariaCard.css';

const VeterinariaCard = memo(({
  veterinaria,
  getImageUrl,
  variant = 'default',
  showActions = true,
  onView // callback para abrir panel
}) => {
  const { t } = useTranslation('veterinarias');

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
    imagen_portada
  } = veterinaria;

  const getServiciosList = () => {
    if (!servicios) return [];
    if (typeof servicios === 'string') {
      try { return JSON.parse(servicios); } catch { return []; }
    }
    if (Array.isArray(servicios)) return servicios;
    return [];
  };

  const serviciosList = getServiciosList();
  const serviciosMostrar = serviciosList.slice(0, 3);
  const imageUrl = useMemo(() => getImageUrl?.(imagen_portada), [imagen_portada, getImageUrl]);

  return (
    <div className="veterinaria-card">
      {/* Imagen izquierda */}
      <div className="card-image">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={Nombre_vet}
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              const placeholder = e.target.parentElement?.querySelector('.image-placeholder');
              if (placeholder) placeholder.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="image-placeholder" style={{ display: imagen_portada ? 'none' : 'flex' }}>
          <Building />
          <span>{t('veterinaria', 'Veterinaria')}</span>
        </div>

        <div className="image-badges">
          {verificado && (
            <span className="badge-verificado" title={t('verificado', 'Verificada')}>
              <Shield size={12} />
            </span>
          )}
          {urgencias_24h && (
            <span className="badge-urgencia" title={t('urgencias_24h', 'Urgencias 24h')}>
              <Ambulance size={12} />
            </span>
          )}
        </div>
      </div>

      {/* Contenido central */}
      <div className="card-main">
        <div className="card-header">
          <h3 className="card-title">{Nombre_vet}</h3>
          {ciudad && (
            <span className="card-ciudad">
              <MapPin />
              {ciudad}
            </span>
          )}
        </div>

        <div className="contact-info">
          {Telefono && (
            <div className="contact-item">
              <Phone />
              <span>{Telefono}</span>
            </div>
          )}
          {Direccion && (
            <div className="contact-item">
              <MapPin />
              <span>{Direccion}</span>
            </div>
          )}
          {horario_atencion && (
            <div className="contact-item">
              <Clock />
              <span>{horario_atencion}</span>
            </div>
          )}
        </div>

        {serviciosMostrar.length > 0 && (
          <div className="servicios">
            {serviciosMostrar.map((servicio, idx) => (
              <span key={idx} className="servicio-tag">{servicio}</span>
            ))}
            {serviciosList.length > 3 && (
              <span className="servicio-mas">+{serviciosList.length - 3}</span>
            )}
          </div>
        )}
      </div>

      {/* Botón a la derecha */}
      {showActions && (
        <div className="card-actions">
          <button 
            className="btn-detalle"
            onClick={(e) => { e.stopPropagation(); onView?.(veterinaria); }}
            type="button"
          >
            {t('ver_detalles', 'Ver detalles')} <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
});

VeterinariaCard.displayName = 'VeterinariaCard';

export default VeterinariaCard;