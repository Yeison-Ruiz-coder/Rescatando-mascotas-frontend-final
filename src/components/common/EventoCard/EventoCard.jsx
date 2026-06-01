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
  onView, // callback para abrir panel
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

  // Formatear fecha
  const fechaFormateada = useMemo(() => {
    if (!fecha_evento) return { dia: '?', mes: '?', hora: '?' };
    const fecha = new Date(fecha_evento);
    return {
      dia: fecha.getDate(),
      mes: fecha.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase(),
      hora: fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };
  }, [fecha_evento]);

  // URL de imagen
  const imageUrl = useMemo(() => {
    if (!imagen_url) return null;
    try {
      return getImageUrl(imagen_url);
    } catch (error) {
      return null;
    }
  }, [imagen_url, getImageUrl]);

  return (
    <div className={`evento-card ${variant}`}>
      {/* Imagen */}
      <div className="card-image">
        {imageUrl ? (
          <img src={imageUrl} alt={nombre_evento} loading="lazy" />
        ) : (
          <div className="image-placeholder">
            <i className="fas fa-calendar-alt"></i>
          </div>
        )}
        
        {/* Badge de fecha sobre la imagen */}
        <div className="fecha-badge">
          <div className="fecha-dia">{fechaFormateada.dia}</div>
          <div className="fecha-mes">{fechaFormateada.mes}</div>
          <div className="fecha-hora">{fechaFormateada.hora}</div>
        </div>
      </div>

      {/* Contenido */}
      <div className="card-content">
        <h3 className="evento-titulo">{nombre_evento}</h3>
        
        <div className="evento-lugar">
          <i className="fas fa-map-marker-alt"></i>
          <span>{lugar_evento || t('lugar_no_disponible')}</span>
        </div>
        
        {showActions && (
          <div className="evento-buttons">
            <button
              className="btn-card btn-outline"
              onClick={(e) => { e.stopPropagation(); onView?.(evento); }}
              type="button"
            >
              <i className="fas fa-eye"></i> <span>{t('ver_detalles')}</span>
            </button>
            
            <button
              onClick={(e) => { e.stopPropagation(); onLike?.(id); }}
              className={`btn-card btn-like ${liked ? 'liked' : ''}`}
              type="button"
            >
              <i className="fas fa-heart"></i>
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); onConfirmarAsistencia?.(id); }}
              className={`btn-card btn-asistir ${asistencia ? 'confirmed' : ''}`}
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