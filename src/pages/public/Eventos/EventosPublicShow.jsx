// src/pages/public/Eventos/EventosPublicShow.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, MapPin, Calendar, Clock, Heart, Users, CalendarCheck, DollarSign } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../services/api';
import { SimpleLoadingBar } from '../../../components/common/ProgressBar/ProgressBar';
import './EventosPublicShow.css';

const EventosPublicShow = ({ eventoId, embed = false }) => {
  const { id: urlId } = useParams();
  const id = eventoId || urlId;
  const { t } = useTranslation('eventos');
  const { isAuthenticated } = useAuth();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [asistencia, setAsistencia] = useState(false);
  const [error, setError] = useState(null);
  const [loadProgress, setLoadProgress] = useState(0);

  const getImageUrl = useCallback((url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const baseUrl = import.meta.env.VITE_STORAGE_URL || 'https://rescatando-mascotas-backend-final-production.up.railway.app';
    return url.startsWith('/storage') ? `${baseUrl}${url}` : `${baseUrl}/storage/${url}`;
  }, []);

  useEffect(() => {
    const loadEvento = async () => {
      if (!id) return;
      
      setLoading(true);
      setLoadProgress(0);
      setError(null);
      
      const progressInterval = setInterval(() => {
        setLoadProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 15;
        });
      }, 100);
      
      try {
        const response = await api.get(`/eventos/${id}`);
        const data = response.data.data || response.data;
        
        setLoadProgress(100);
        setTimeout(() => {
          setEvento(data);
          setLiked(data.usuario_liked || false);
          setAsistencia(data.usuario_confirmado || false);
          setLoading(false);
        }, 300);
        
      } catch (error) {
        console.error('Error:', error);
        setLoadProgress(100);
        setTimeout(() => {
          setError(error.response?.data?.message || t('error_load'));
          setLoading(false);
        }, 300);
      } finally {
        clearInterval(progressInterval);
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

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ✅ Mostrar ProgressBar mientras carga
  if (loading) {
    return (
      <div style={{ width: '100%', padding: '20px 0' }}>
        <SimpleLoadingBar 
          progress={loadProgress}
          height="12px"
          variant="gradient"
        />
      </div>
    );
  }

  if (error || !evento) {
    return (
      <div className="eventos-show-container">
        {!embed && (
          <div className="eventos-show-actions-bar">
            <Link to="/eventos" className="eventos-show-btn-back">
              <ArrowLeft size={18} /> {t('volver')}
            </Link>
          </div>
        )}
        <div className="eventos-show-error">
          <Calendar size={48} />
          <h4>{t('error_titulo')}</h4>
          <p>{error || t('evento_no_encontrado')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="eventos-show-container">
      {!embed && (
        <div className="eventos-show-actions-bar">
          <Link to="/eventos" className="eventos-show-btn-back">
            <ArrowLeft size={18} /> {t('volver')}
          </Link>
        </div>
      )}

      <div className="eventos-show-bento-grid">
        {evento.imagen_url && (
          <div className="eventos-show-imagen-wrapper">
            <img 
              src={getImageUrl(evento.imagen_url)} 
              alt={evento.nombre_evento} 
              className="eventos-show-imagen"
            />
          </div>
        )}

        <div className="eventos-show-sidebar">
          <div className="eventos-show-info-card">
            <div className="eventos-show-badge">
              {evento.tipo === 'admin' ? (
                <span className="eventos-show-badge-admin">
                  {t('evento_global_badge') || '🌍 Evento Global'}
                </span>
              ) : (
                <span className="eventos-show-badge-fundacion">
                  {t('evento_fundacion_badge') || '🏢 Evento de Fundación'}
                </span>
              )}
            </div>
          </div>

          <div className="eventos-show-info-card">
            <div className="eventos-show-info-card-title">
              <Calendar size={16} />
              {t('fecha_lugar') || 'FECHA Y LUGAR'}
            </div>
            <div className="eventos-show-info-row">
              <MapPin size={18} />
              <div>
                <strong>{t('lugar')}</strong>
                <p>{evento.lugar_evento}</p>
              </div>
            </div>
            <div className="eventos-show-info-row">
              <Calendar size={18} />
              <div>
                <strong>{t('fecha')}</strong>
                <p>{formatDate(evento.fecha_evento)}</p>
              </div>
            </div>
            <div className="eventos-show-info-row">
              <Clock size={18} />
              <div>
                <strong>{t('hora')}</strong>
                <p>{formatTime(evento.fecha_evento)}</p>
              </div>
            </div>
            {evento.costo && (
              <div className="eventos-show-info-row">
                <DollarSign size={18} />
                <div>
                  <strong>{t('costo')}</strong>
                  <p>{evento.costo}</p>
                </div>
              </div>
            )}
            {evento.capacidad_maxima && (
              <div className="eventos-show-info-row">
                <Users size={18} />
                <div>
                  <strong>{t('capacidad_maxima')}</strong>
                  <p>{evento.capacidad_maxima} {t('personas')}</p>
                </div>
              </div>
            )}
          </div>

          <div className="eventos-show-info-card">
            <div className="eventos-show-info-card-title">
              <Heart size={16} />
              {t('estadisticas') || 'ESTADÍSTICAS'}
            </div>
            <div className="eventos-show-stats-row">
              <button 
                onClick={handleLike} 
                className={`eventos-show-stat-btn ${liked ? 'eventos-show-liked' : ''}`}
              >
                <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
                <span>{evento.likes || 0} {t('likes')}</span>
              </button>
              <div className="eventos-show-stat-item">
                <Users size={16} />
                <span>{evento.total_asistentes || 0} {t('asistentes')}</span>
              </div>
            </div>
          </div>

          <div className="eventos-show-info-card">
            <div className="eventos-show-info-card-title">
              <CalendarCheck size={16} />
              {t('asistencia_titulo') || 'ASISTENCIA'}
            </div>
            <button 
              onClick={handleConfirmarAsistencia} 
              className={`eventos-show-asistencia-btn ${asistencia ? 'eventos-show-confirmed' : ''}`}
              disabled={!isAuthenticated}
            >
              <CalendarCheck size={18} />
              {asistencia ? t('asistencia.confirmada') : t('asistencia.confirmar')}
            </button>
            {evento.total_asistentes > 0 && (
              <div className="eventos-show-total-asistentes">
                <Users size={14} /> {evento.total_asistentes} {t('asistencia.personas_asistiran')}
              </div>
            )}
          </div>
        </div>

        <div className="eventos-show-main">
          <h1 className="eventos-show-titulo">{evento.nombre_evento}</h1>
          
          {evento.descripcion && (
            <div className="eventos-show-descripcion">
              {evento.descripcion}
            </div>
          )}

          {evento.tags && evento.tags.length > 0 && (
            <div className="eventos-show-tags">
              {(Array.isArray(evento.tags) ? evento.tags : JSON.parse(evento.tags)).map((tag, idx) => (
                <span key={idx} className="eventos-show-tag">#{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="eventos-show-footer">
        <Clock size={14} />
        <small>{t('publicado')}: {new Date(evento.created_at).toLocaleDateString()}</small>
      </div>
    </div>
  );
};

export default EventosPublicShow;