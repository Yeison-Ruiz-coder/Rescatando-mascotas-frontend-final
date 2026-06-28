// src/components/common/EventoCard/EventoCardFundacion.jsx
import React, { memo, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Edit, Trash2, Eye } from 'lucide-react';
import './EventoCardFundacion.css';

const EventoCardFundacion = memo(({ 
  evento, 
  getImageUrl,
  onDelete,
  onEdit,
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
    es_gratuito = false,
    total_asistentes = 0,
    likes = 0
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

  const infoCapacidad = () => {
    if (!capacidad_total || capacidad_total === 0) return null;
    return `${capacidad_total} cupos`;
  };

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) onDelete(id);
  };

  const handleEditClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) onEdit(id);
  };

  return (
    <div className="ecf-card">
      <div className="ecf-image">
        {imageUrl ? (
          <img src={imageUrl} alt={nombre_evento} loading="lazy" onError={() => setImgError(true)} />
        ) : (
          <div className="ecf-placeholder">
            <i className="fas fa-calendar-alt"></i>
          </div>
        )}
        
        <div className="ecf-fecha-badge">
          <div className="ecf-fecha-dia">{fechaFormateada.dia}</div>
          <div className="ecf-fecha-mes">{fechaFormateada.mes}</div>
          <div className="ecf-fecha-hora">{fechaFormateada.hora}</div>
        </div>

        {/* Badge de estado */}
        <div className={`ecf-estado-badge ${getEstadoClase()}`}>
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
      </div>

      {/* Contenido */}
      <div className="ecf-content">
        <h3 className="ecf-titulo">{nombre_evento}</h3>

        {descripcion_corta && (
          <p className="ecf-descripcion">{descripcion_corta}</p>
        )}

        <div className="ecf-info-grid">
          {lugar_evento && (
            <div className="ecf-info-item">
              <i className="fas fa-map-marker-alt"></i>
              <span>{lugar_evento}</span>
            </div>
          )}
          {infoCapacidad() && (
            <div className="ecf-info-item">
              <i className="fas fa-users"></i>
              <span>{infoCapacidad()}</span>
            </div>
          )}
          {total_asistentes > 0 && (
            <div className="ecf-info-item">
              <i className="fas fa-user-check"></i>
              <span>{total_asistentes} asistentes</span>
            </div>
          )}
          {likes > 0 && (
            <div className="ecf-info-item">
              <i className="fas fa-heart" style={{ color: 'var(--color-heart)' }}></i>
              <span>{likes}</span>
            </div>
          )}
        </div>

        {/* Acciones - solo para fundación */}
        {showActions && (
          <div className="ecf-actions">
            <Link 
              to={`/fundacion/eventos/${id}`} 
              className="ecf-btn ecf-btn-ver"
              title={t('ver_detalle')}
            >
              <Eye size={16} />
              <span>{t('botones.ver')}</span>
            </Link>
            <Link 
              to={`/fundacion/eventos/${id}/editar`} 
              className="ecf-btn ecf-btn-editar"
              title={t('botones.editar')}
              onClick={(e) => {
                // Si hay onEdit, usarlo, sino navegar normal
                if (onEdit) {
                  e.preventDefault();
                  handleEditClick(e);
                }
              }}
            >
              <Edit size={16} />
              <span>{t('botones.editar')}</span>
            </Link>
            <button 
              className="ecf-btn ecf-btn-eliminar"
              onClick={handleDeleteClick}
              title={t('botones.eliminar')}
            >
              <Trash2 size={16} />
              <span>{t('eliminar')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

EventoCardFundacion.displayName = 'EventoCardFundacion';

export default EventoCardFundacion;