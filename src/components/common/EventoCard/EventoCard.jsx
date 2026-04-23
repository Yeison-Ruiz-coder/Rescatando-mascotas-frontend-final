// src/components/common/EventoCard/EventoCard.jsx
import React, { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Calendar, Eye, Heart, CalendarCheck, Users } from 'lucide-react';
import './EventoCard.css';

const EventoCard = memo(({ 
  evento, 
  getImageUrl, 
  variant = 'default',
  isAuthenticated = false,
  liked = false,
  asistencia = false,
  onLike,
  onConfirmarAsistencia,
  showActions = true
}) => {
  const { t } = useTranslation('eventos');

  const {
    id,
    nombre_evento,
    descripcion,
    lugar_evento,
    fecha_evento,
    imagen_url,
    tipo,
    total_asistentes = 0
  } = evento;

  // ✅ Memoizar fecha formateada
  const formatFecha = useMemo(() => {
    if (!fecha_evento) return '';
    return new Date(fecha_evento).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }, [fecha_evento]);

  // ✅ Memoizar URL de imagen
  const imageUrl = useMemo(() => getImageUrl(imagen_url), [imagen_url, getImageUrl]);

  return (
    <div className={`evento-card ${variant}`}>
      <div className="card-image">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={nombre_evento}
            loading="lazy"
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
        <div className="image-placeholder" style={{ display: imagen_url ? 'none' : 'flex' }}>
          <i className="fas fa-calendar-alt fa-3x"></i>
          <span>{t('sin_imagen') || 'Evento'}</span>
        </div>
        
        <div className="card-badges">
          <span className={`badge badge-${tipo === 'admin' ? 'primary' : 'accent'}`}>
            {tipo === 'admin' ? (
              <><i className="fas fa-globe"></i> {t('global') || 'Global'}</>
            ) : (
              <><i className="fas fa-home"></i> {t('fundacion') || 'Fundación'}</>
            )}
          </span>
          {total_asistentes > 0 && (
            <span className="badge badge-dark">
              <Users size={12} /> {total_asistentes} {t('asistentes') || 'asistentes'}
            </span>
          )}
        </div>
      </div>
      
      <div className="card-content">
        <h3 className="card-title">{nombre_evento}</h3>
        <p className="card-description">
          {descripcion
            ? descripcion.substring(0, 100)
            : t('sin_descripcion')}
          {descripcion?.length > 100 ? '...' : ''}
        </p>
        
        <div className="card-info">
          <div className="info-item">
            <MapPin size={14} />
            <span>{lugar_evento}</span>
          </div>
          <div className="info-item">
            <Calendar size={14} />
            <span>{formatFecha}</span>
          </div>
        </div>
        
        {showActions && (
          <div className="card-buttons">
            <Link
              to={`/eventos/${id}`}
              className="btn-card btn-card-outline"
            >
              <Eye size={16} /> {t('ver_detalles') || 'Ver Detalles'}
            </Link>
            
            <button
              onClick={() => onLike?.(id)}
              className={`btn-card btn-card-like ${liked ? 'liked' : ''}`}
            >
              <Heart size={16} /> 
              {liked ? (t('me_gusta') || 'Me gusta') : (t('dar_like') || 'Dar like')}
            </button>

            <button
              onClick={() => onConfirmarAsistencia?.(id)}
              className={`btn-card btn-card-asistir ${asistencia ? 'confirmed' : ''}`}
              disabled={!isAuthenticated}
              title={!isAuthenticated ? (t('login_requerido') || 'Inicia sesión para confirmar asistencia') : ''}
            >
              <CalendarCheck size={16} /> 
              {asistencia ? (t('confirmado') || '✅ Confirmado') : (t('asistire') || 'Asistiré')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

EventoCard.displayName = 'EventoCard';

export default EventoCard;