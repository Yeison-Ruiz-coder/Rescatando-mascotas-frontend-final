// src/pages/public/Eventos/EventosPublicShow.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, MapPin, Calendar, FileText, Clock, Heart, Users, CalendarCheck, CheckCircle, Loader, Tag, DollarSign } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../services/api';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import './EventosPublicShow.css';

const EventosPublicShow = () => {
  const { id } = useParams();
  const { t } = useTranslation('eventos');
  const { isAuthenticated } = useAuth();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [asistencia, setAsistencia] = useState(false);
  const [error, setError] = useState(null);

  const getImageUrl = useCallback((url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const baseUrl = import.meta.env.VITE_STORAGE_URL || 'https://rescatando-mascotas-backend-final-production.up.railway.app';
    return url.startsWith('/storage') ? `${baseUrl}${url}` : `${baseUrl}/storage/${url}`;
  }, []);

  useEffect(() => {
    const loadEvento = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/eventos/${id}`);
        const data = response.data.data || response.data;
        setEvento(data);
        setAsistencia(data.usuario_confirmado || false);
      } catch (error) {
        console.error('Error:', error);
        setError(error.response?.data?.message || t('error_load'));
      } finally {
        setLoading(false);
      }
    };
    loadEvento();
  }, [id, t]);

  const handleLike = useCallback(async () => {
    if (!isAuthenticated) {
      alert(t('like.login_requerido'));
      return;
    }
    try {
      await api.post(`/eventos/${id}/like`);
      setLiked(!liked);
      setEvento(prev => ({ ...prev, likes: (prev?.likes || 0) + (liked ? -1 : 1) }));
    } catch (error) {
      console.error('Error al dar like:', error);
    }
  }, [id, liked, isAuthenticated, t]);

  const handleConfirmarAsistencia = useCallback(async () => {
    if (!isAuthenticated) {
      alert(t('asistencia.login_requerido'));
      return;
    }
    
    try {
      if (asistencia) {
        await api.delete(`/eventos/${id}/cancelar-asistencia`);
        setAsistencia(false);
        setEvento(prev => ({ ...prev, total_asistentes: Math.max(0, (prev?.total_asistentes || 0) - 1) }));
      } else {
        await api.post(`/eventos/${id}/confirmar-asistencia`);
        setAsistencia(true);
        setEvento(prev => ({ ...prev, total_asistentes: (prev?.total_asistentes || 0) + 1 }));
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.message || t('asistencia.error'));
    }
  }, [id, isAuthenticated, asistencia, t]);

  if (loading) {
    return (
      <div className="public-eventos-show-loading">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !evento) {
    return (
      <div className="public-eventos-show-container">
        <div className="error-container">
          <Calendar size={48} />
          <h4>{t('error_titulo')}</h4>
          <p>{error || t('evento_no_encontrado')}</p>
          <Link to="/eventos" className="public-btn-back">{t('volver')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="public-eventos-show-container">
      <div className="public-eventos-show-actions-bar">
        <Link to="/eventos" className="public-btn-back">
          <ArrowLeft size={18} />
          {t('volver')}
        </Link>
      </div>

      <div className="public-eventos-show-card">
        {evento.imagen_url && (
          <div className="public-show-image">
            <img src={getImageUrl(evento.imagen_url)} alt={evento.nombre_evento} />
          </div>
        )}

        <div className="public-show-content">
          <div className="public-show-header">
            <h1>{evento.nombre_evento}</h1>
            <div className="public-evento-stats">
              <button onClick={handleLike} className="public-stat" style={{ cursor: 'pointer', background: liked ? 'rgba(255,107,157,0.2)' : undefined }}>
                <Heart size={16} style={{ color: liked ? 'var(--color-heart)' : undefined }} />
                {evento.likes || 0} {t('likes')}
              </button>
              <span className="public-stat">
                <Users size={16} />
                {evento.total_asistentes || 0} {t('asistentes')}
              </span>
            </div>
          </div>

          <div className="public-evento-badge">
            {evento.tipo === 'admin' ? (
              <span className="public-badge-admin">🌟 {t('evento_global')}</span>
            ) : (
              <span className="public-badge-fundacion">🏠 {t('evento_fundacion')}</span>
            )}
          </div>

          <div className="public-asistencia-section">
            <button 
              onClick={handleConfirmarAsistencia} 
              className={`public-btn-asistir ${asistencia ? 'confirmed' : ''}`}
              disabled={!isAuthenticated}
            >
              <CalendarCheck size={24} />
              {asistencia ? (
                <>
                  <CheckCircle size={18} />
                  {t('asistencia.confirmada')}
                </>
              ) : (
                t('asistencia.confirmar')
              )}
            </button>
            {evento.total_asistentes > 0 && (
              <div className="public-total-asistentes">
                <Users size={16} />
                <span>{evento.total_asistentes} {t('asistencia.personas_asistiran')}</span>
              </div>
            )}
          </div>

          <div className="public-info-grid">
            <div className="public-info-item">
              <MapPin size={18} className="public-info-icon" />
              <div>
                <strong>{t('lugar')}</strong>
                <p>{evento.lugar_evento}</p>
              </div>
            </div>
            <div className="public-info-item">
              <Calendar size={18} className="public-info-icon" />
              <div>
                <strong>{t('fecha')}</strong>
                <p>{new Date(evento.fecha_evento).toLocaleString()}</p>
              </div>
            </div>
            {evento.fecha_fin && (
              <div className="public-info-item">
                <Clock size={18} className="public-info-icon" />
                <div>
                  <strong>{t('fecha_fin')}</strong>
                  <p>{new Date(evento.fecha_fin).toLocaleString()}</p>
                </div>
              </div>
            )}
            {evento.costo && (
              <div className="public-info-item">
                <DollarSign size={18} className="public-info-icon" />
                <div>
                  <strong>{t('costo')}</strong>
                  <p>{evento.costo}</p>
                </div>
              </div>
            )}
            {evento.capacidad_maxima && (
              <div className="public-info-item">
                <Users size={18} className="public-info-icon" />
                <div>
                  <strong>{t('capacidad_maxima')}</strong>
                  <p>{evento.capacidad_maxima} {t('personas')}</p>
                </div>
              </div>
            )}
          </div>

          {evento.descripcion && (
            <div className="public-description-section">
              <h3>
                <FileText size={18} />
                {t('descripcion')}
              </h3>
              <p>{evento.descripcion}</p>
            </div>
          )}

          {evento.tags && evento.tags.length > 0 && (
            <div className="tags-section">
              <h3>
                <Tag size={18} />
                {t('etiquetas')}
              </h3>
              <div className="tags-list">
                {(Array.isArray(evento.tags) ? evento.tags : JSON.parse(evento.tags)).map((tag, idx) => (
                  <span key={idx} className="tag">#{tag}</span>
                ))}
              </div>
            </div>
          )}

          <div className="public-show-footer">
            <small>
              <Clock size={14} />
              {t('publicado')}: {new Date(evento.created_at).toLocaleDateString()}
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventosPublicShow;