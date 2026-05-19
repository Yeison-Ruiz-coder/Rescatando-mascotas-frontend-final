// src/components/common/VeterinariaCard/VeterinariaCard.jsx
import React, { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Building, MapPin, Phone, Clock, Shield, Ambulance, ChevronRight } from 'lucide-react';
import './VeterinariaCard.css';

const VeterinariaCard = memo(({
  veterinaria,
  getImageUrl,
  variant = 'default',
  showActions = true
}) => {
  const { t } = useTranslation('veterinarias');

  const {
    id,
    Nombre_vet,
    descripcion,
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
          <Building size={48} />
          <span>{t('veterinaria', 'Veterinaria')}</span>
        </div>

        <div className="image-badges">
          {verificado && (
            <span className="badge-verificado" title={t('verificado', 'Verificada')}>
              <Shield size={14} />
            </span>
          )}
          {urgencias_24h && (
            <span className="badge-urgencia" title={t('urgencias_24h', 'Urgencias 24h')}>
              <Ambulance size={14} />
            </span>
          )}
        </div>
      </div>

      <div className="card-header">
        <div>
          <h3 className="card-title">{Nombre_vet}</h3>
          {ciudad && (
            <span className="card-ciudad">
              <MapPin size={14} />
              {ciudad}
            </span>
          )}
        </div>
      </div>

      <p className="card-descripcion">
        {descripcion || t('sin_descripcion', 'Sin descripción disponible')}
      </p>

      {serviciosMostrar.length > 0 && (
        <div className="card-servicios">
          {serviciosMostrar.map((servicio, idx) => (
            <span key={idx} className="servicio-tag">{servicio}</span>
          ))}
          {serviciosList.length > 3 && (
            <span className="servicio-mas">+{serviciosList.length - 3}</span>
          )}
        </div>
      )}

      <div className="card-footer">
        {Telefono && (
          <div className="footer-item">
            <Phone size={14} />
            <span>{Telefono}</span>
          </div>
        )}
        {Direccion && (
          <div className="footer-item">
            <MapPin size={14} />
            <span>{Direccion}</span>
          </div>
        )}
        {horario_atencion && (
          <div className="footer-item">
            <Clock size={14} />
            <span>{horario_atencion}</span>
          </div>
        )}
      </div>

      {showActions && (
        <Link to={`/veterinarias/${id}`} className="btn-detalle">
          {t('ver_detalles', 'Ver detalles')} <ChevronRight size={16} />
        </Link>
      )}
    </div>
  );
});

VeterinariaCard.displayName = 'VeterinariaCard';

export default VeterinariaCard;