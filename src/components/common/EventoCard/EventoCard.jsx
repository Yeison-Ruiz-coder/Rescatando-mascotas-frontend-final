// src/components/common/EventoCard/EventoCard.jsx
import React, { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Calendar, Eye, Heart, CalendarCheck, Users, Clock, Edit, Trash2, Globe, Home, DollarSign, User, Phone, Mail } from 'lucide-react';
import './EventoCard.css';

const EventoCard = memo(({ 
  evento, 
  getImageUrl, 
  variant = 'default', // default, compact, featured
  rol = 'public', // public, fundacion, admin
  isAuthenticated = false,
  liked = false,
  asistencia = false,
  onLike,
  onConfirmarAsistencia,
  onEdit,
  onDelete,
  showActions = true,
  showFullInfo = false
}) => {
  const { t } = useTranslation('eventos');

  const {
    id,
    nombre_evento,
    descripcion,
    lugar_evento,
    fecha_evento,
    fecha_fin,
    imagen_url,
    tipo,
    total_asistentes = 0,
    likes = 0,
    costo,
    organizador,
    telefono_contacto,
    email_contacto,
    categoria,
    tags,
    capacidad_maxima,
    fundacion
  } = evento;

  // Formatear fecha
  const formatFecha = useMemo(() => {
    if (!fecha_evento) return '';
    return new Date(fecha_evento).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }, [fecha_evento]);

  const formatHora = useMemo(() => {
    if (!fecha_evento) return '';
    return new Date(fecha_evento).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }, [fecha_evento]);

  // URL de imagen
  const imageUrl = useMemo(() => {
    if (!imagen_url) return null;
    try {
      return getImageUrl(imagen_url);
    } catch (error) {
      console.error('Error al generar URL de imagen:', error);
      return null;
    }
  }, [imagen_url, getImageUrl]);

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.style.display = 'none';
    const placeholder = e.target.parentElement?.querySelector('.image-placeholder');
    if (placeholder) {
      placeholder.style.display = 'flex';
    }
  };

  // Render badges según tipo
  const renderBadges = () => {
    const badges = [];
    
    // Badge de tipo
    badges.push(
      <span key="tipo" className={`badge badge-${tipo === 'admin' ? 'primary' : 'accent'}`}>
        {tipo === 'admin' ? <Globe size={12} /> : <Home size={12} />}
        <span>{tipo === 'admin' ? (t('global') || 'Global') : (t('fundacion') || 'Fundación')}</span>
      </span>
    );
    
    // Badge de asistentes
    if (total_asistentes > 0) {
      badges.push(
        <span key="asistentes" className="badge badge-dark">
          <Users size={12} />
          <span>{total_asistentes} {t('asistentes') || 'asistentes'}</span>
        </span>
      );
    }
    
    // Badge de capacidad (si existe)
    if (capacidad_maxima && rol !== 'public') {
      badges.push(
        <span key="capacidad" className="badge badge-info">
          <span>👥</span>
          <span>Cap: {capacidad_maxima}</span>
        </span>
      );
    }
    
    return badges;
  };

  // Render información adicional (para vista completa)
  const renderFullInfo = () => {
    if (!showFullInfo) return null;
    
    return (
      <div className="card-full-info">
        {costo && (
          <div className="info-row">
            <DollarSign size={14} className="info-icon" />
            <strong>{t('costo') || 'Costo'}:</strong>
            <span>{costo}</span>
          </div>
        )}
        
        {categoria && (
          <div className="info-row">
            <span>📁</span>
            <strong>{t('categoria') || 'Categoría'}:</strong>
            <span>{categoria}</span>
          </div>
        )}
        
        {organizador && (
          <div className="info-row">
            <User size={14} className="info-icon" />
            <strong>{t('organizador') || 'Organizador'}:</strong>
            <span>{organizador}</span>
          </div>
        )}
        
        {telefono_contacto && (
          <div className="info-row">
            <Phone size={14} className="info-icon" />
            <strong>{t('telefono') || 'Teléfono'}:</strong>
            <span>{telefono_contacto}</span>
          </div>
        )}
        
        {email_contacto && (
          <div className="info-row">
            <Mail size={14} className="info-icon" />
            <strong>{t('email') || 'Email'}:</strong>
            <span>{email_contacto}</span>
          </div>
        )}
        
        {tags && tags.length > 0 && (
          <div className="info-tags">
            <strong>{t('tags') || 'Etiquetas'}:</strong>
            <div className="tags-list">
              {(Array.isArray(tags) ? tags : JSON.parse(tags)).slice(0, 3).map((tag, idx) => (
                <span key={idx} className="tag">#{tag}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render acciones según rol
  const renderActions = () => {
    if (!showActions) return null;
    
    // Rol Admin
    if (rol === 'admin') {
      return (
        <div className="card-buttons admin-buttons">
          <Link to={`/admin/eventos/${id}`} className="btn-card btn-card-outline">
            <Eye size={16} />
            <span>{t('ver') || 'Ver'}</span>
          </Link>
          <button onClick={() => onEdit?.(id)} className="btn-card btn-card-edit">
            <Edit size={16} />
            <span>{t('editar') || 'Editar'}</span>
          </button>
          <button onClick={() => onDelete?.(id)} className="btn-card btn-card-delete">
            <Trash2 size={16} />
            <span>{t('eliminar') || 'Eliminar'}</span>
          </button>
        </div>
      );
    }
    
    // Rol Fundación
    if (rol === 'fundacion') {
      return (
        <div className="card-buttons fundacion-buttons">
          <Link to={`/fundacion/eventos/${id}`} className="btn-card btn-card-outline">
            <Eye size={16} />
            <span>{t('ver') || 'Ver'}</span>
          </Link>
          <Link to={`/fundacion/eventos/${id}/editar`} className="btn-card btn-card-edit">
            <Edit size={16} />
            <span>{t('editar') || 'Editar'}</span>
          </Link>
          <button onClick={() => onDelete?.(id)} className="btn-card btn-card-delete">
            <Trash2 size={16} />
            <span>{t('eliminar') || 'Eliminar'}</span>
          </button>
        </div>
      );
    }
    
    // Rol Public
    return (
      <div className="card-buttons public-buttons">
        <Link to={`/eventos/${id}`} className="btn-card btn-card-outline">
          <Eye size={16} />
          <span>{t('ver_detalles') || 'Ver Detalles'}</span>
        </Link>
        
        <button
          onClick={() => onLike?.(id)}
          className={`btn-card btn-card-like ${liked ? 'liked' : ''}`}
        >
          <Heart size={16} /> 
          <span>{liked ? (t('me_gusta') || 'Me gusta') : (t('dar_like') || 'Dar like')}</span>
        </button>

        <button
          onClick={() => onConfirmarAsistencia?.(id)}
          className={`btn-card btn-card-asistir ${asistencia ? 'confirmed' : ''}`}
          disabled={!isAuthenticated}
          title={!isAuthenticated ? (t('login_requerido') || 'Inicia sesión') : ''}
        >
          <CalendarCheck size={16} /> 
          <span>{asistencia ? (t('confirmado') || 'Confirmado') : (t('asistire') || 'Asistiré')}</span>
        </button>
      </div>
    );
  };

  return (
    <div className={`evento-card ${variant} rol-${rol}`}>
      <div className="card-image">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={nombre_evento}
            loading="lazy"
            onError={handleImageError}
          />
        ) : (
          <div className="image-placeholder">
            <Calendar size={32} />
            <span>{t('sin_imagen') || 'Evento'}</span>
          </div>
        )}
        
        <div className="card-badges">
          {renderBadges()}
        </div>
        
        {rol !== 'public' && (
          <div className="card-stats-badge">
            <div className="stats-item">
              <Heart size={12} />
              <span>{likes || 0}</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="card-content">
        <h3 className="card-title">{nombre_evento}</h3>
        
        <div className="card-info">
          <div className="info-item">
            <MapPin size={14} />
            <span>{lugar_evento}</span>
          </div>
          <div className="info-item">
            <Calendar size={14} />
            <span>{formatFecha}</span>
          </div>
          <div className="info-item">
            <Clock size={14} />
            <span>{formatHora}</span>
          </div>
        </div>
        
        <p className="card-description">
          {descripcion
            ? descripcion.substring(0, showFullInfo ? 200 : 100)
            : t('sin_descripcion') || 'Sin descripción'}
          {descripcion?.length > (showFullInfo ? 200 : 100) ? '...' : ''}
        </p>
        
        {renderFullInfo()}
        
        {renderActions()}
      </div>
    </div>
  );
});

EventoCard.displayName = 'EventoCard';

export default EventoCard;