// src/components/common/EventoCard/EventoCard.jsx
import React, { memo, useMemo, useState } from 'react';
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
  const [imgError, setImgError] = useState(false);

  const {
    id,
    nombre_evento,
    lugar_evento,
    fecha_evento,
    imagen_url,
    descripcion_corta = '',
    capacidad_total = 0,
    estado_evento = 'proximo',
    es_gratuito = false
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
    if (!imagen_url || imgError) return null;
    try {
      return getImageUrl(imagen_url);
    } catch (error) {
      return null;
    }
  }, [imagen_url, getImageUrl, imgError]);

  const cardVariant = variant === 'featured' ? 'ec-featured' : '';

  const getEstadoClase = () => {
    const estados = {
      proximo: 'ec-estado-proximo',
      hoy: 'ec-estado-hoy',
      finalizado: 'ec-estado-finalizado',
      agotado: 'ec-estado-agotado'
    };
    return estados[estado_evento] || 'ec-estado-proximo';
  };

  const getEstadoTexto = () => {
    const textos = {
      proximo: 'Próximo',
      hoy: 'Hoy',
      finalizado: 'Finalizado',
      agotado: 'Cupos agotados'
    };
    return textos[estado_evento] || 'Próximo';
  };

  const getEstadoIcono = () => {
    const iconos = {
      proximo: 'far fa-clock',
      hoy: 'fas fa-calendar-day',
      finalizado: 'fas fa-check-circle',
      agotado: 'fas fa-ticket-alt'
    };
    return iconos[estado_evento] || 'far fa-clock';
  };

  const botonDeshabilitado = estado_evento === 'finalizado' || estado_evento === 'agotado';
  
  const infoCapacidad = () => {
    if (!capacidad_total || capacidad_total === 0) return null;
    return `${capacidad_total} cupos`;
  };

  // Click en toda la card (fondo)
  const handleCardClick = () => {
    if (!botonDeshabilitado && onView) {
      onView(evento);
    }
  };

  // Click en el botón del overlay
  const handleOverlayClick = (e) => {
    e.stopPropagation();
    if (!botonDeshabilitado && onView) {
      onView(evento);
    }
  };

  const textoBoton = () => {
    if (estado_evento === 'finalizado') return 'Finalizado';
    if (estado_evento === 'agotado') return 'Sin cupos';
    return 'Ver detalles';
  };

  return (
    <div 
      className={`ec-card ${cardVariant}`} 
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
      <div className="ec-image">
        {imageUrl ? (
          <img src={imageUrl} alt={nombre_evento} loading="lazy" onError={() => setImgError(true)} />
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

      {/* Contenido normal (siempre visible) */}
      <div className="ec-content">
        <div className={`ec-estado-badge ${getEstadoClase()}`}>
          <i className={getEstadoIcono()}></i>
          <span>{getEstadoTexto()}</span>
          {es_gratuito && (
            <>
              <span>•</span>
              <i className="fas fa-gift"></i>
              <span>Gratis</span>
            </>
          )}
        </div>

        <h3 className="ec-titulo">{nombre_evento}</h3>

        {descripcion_corta && (
          <p className="ec-descripcion">{descripcion_corta}</p>
        )}

        <div className="ec-info-grid">
          {lugar_evento && (
            <div className="ec-info-item">
              <i className="fas fa-map-marker-alt"></i>
              <span>{lugar_evento}</span>
            </div>
          )}
          {infoCapacidad() && (
            <div className="ec-info-item">
              <i className="fas fa-users"></i>
              <span>{infoCapacidad()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Overlay hover (solo visible en desktop al pasar mouse) */}
      {showActions && (
        <div className="ec-overlay">
          <button
            className="ec-overlay-btn"
            onClick={handleOverlayClick}
            disabled={botonDeshabilitado}
            type="button"
          >
            <i className="fas fa-eye"></i>
            <span>{textoBoton()}</span>
          </button>
        </div>
      )}
    </div>
  );
});

EventoCard.displayName = 'EventoCard';

export default EventoCard;