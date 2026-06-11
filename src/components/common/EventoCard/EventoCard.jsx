// src/components/common/EventoCard/EventoCard.jsx
import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
  onView,
  showActions = true
}) => {
  const { t } = useTranslation('eventos');

  const {
    id,
    nombre_evento,
    lugar_evento,
    fecha_evento,
    imagen_url
  } = evento;

  const fechaFormateada = useMemo(() => {
    if (!fecha_evento) return { dia: '?', mes: '?', hora: '?' };
    const fecha = new Date(fecha_evento);
    return {
      dia: fecha.getDate(),
      mes: fecha.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase(),
      hora: fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };
  }, [fecha_evento]);

  const imageUrl = useMemo(() => {
    if (!imagen_url) return null;
    try {
      return getImageUrl(imagen_url);
    } catch (error) {
      return null;
    }
  }, [imagen_url, getImageUrl]);

  const cardVariant = variant === 'featured' ? 'ec-featured' : '';

  return (
    <div className={`ec-card ${cardVariant}`}>
      <div className="ec-image">
        {imageUrl ? (
          <img src={imageUrl} alt={nombre_evento} loading="lazy" />
        ) : (
          <div className="ec-placeholder">
            <i className="fas fa-calendar-alt"></i>
          </div>
        )}
        
        <div className="ec-fecha-badge">
          <div className="ec-fecha-dia">{fechaFormateada.dia}</div>
          <div className="ec-fecha-mes">{fechaFormateada.mes}</div>
          <div className="ec-fecha-hora">{fechaFormateada.hora}</div>
        </div>
      </div>

      <div className="ec-content">
        <h3 className="ec-titulo">{nombre_evento}</h3>
        
        <div className="ec-lugar">
          <i className="fas fa-map-marker-alt"></i>
          <span>{lugar_evento || t('lugar_no_disponible')}</span>
        </div>
        
        {showActions && (
          <div className="ec-buttons">
            <button
              className="ec-btn ec-btn-outline"
              onClick={(e) => { e.stopPropagation(); onView?.(evento); }}
              type="button"
            >
              <i className="fas fa-eye"></i> <span>{t('ver_detalles')}</span>
            </button>
            
            <button
              onClick={(e) => { e.stopPropagation(); onLike?.(id); }}
              className={`ec-btn ec-btn-like ${liked ? 'ec-liked' : ''}`}
              type="button"
            >
              <i className="fas fa-heart"></i>
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); onConfirmarAsistencia?.(id); }}
              className={`ec-btn ec-btn-asistir ${asistencia ? 'ec-confirmed' : ''}`}
              disabled={!isAuthenticated}
              title={!isAuthenticated ? (t('login_requerido') || 'Inicia sesión') : ''}
              type="button"
            >
              <i className="fas fa-calendar-check"></i>
              <span>{asistencia ? t('confirmado') : t('asistire')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

EventoCard.displayName = 'EventoCard';

export default EventoCard;