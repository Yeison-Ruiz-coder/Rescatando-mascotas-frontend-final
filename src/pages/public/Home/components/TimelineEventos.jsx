// src/pages/public/Home/components/TimelineEventos.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../../contexts/AuthContext';
import api from '../../../../services/api';
import EventoCard from '../../../../components/common/EventoCard/EventoCard';
import './TimelineEventos.css';

const TimelineEventos = () => {
  const { t } = useTranslation('home');
  const { isAuthenticated } = useAuth();
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likedEvents, setLikedEvents] = useState({});
  const [asistenciaEvents, setAsistenciaEvents] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const autoPlayRef = useRef(null);

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_STORAGE_URL || 'https://rescatando-mascotas-backend-final-production.up.railway.app';
    return path.startsWith('/storage') ? `${baseUrl}${path}` : `${baseUrl}/storage/${path}`;
  };

  useEffect(() => {
    const fetchEventos = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const params = {
          page: 1,
          per_page: 10,
          sort: '-fecha_evento'
        };
        
        const response = await api.get('/eventos', { params });
        
        let eventosData = [];
        
        if (response.data?.data?.data) {
          eventosData = response.data.data.data;
        } else if (response.data?.data) {
          eventosData = response.data.data;
        } else if (Array.isArray(response.data)) {
          eventosData = response.data;
        }
        
        setEventos(eventosData);
        
        const likesMap = {};
        const asistenciaMap = {};
        eventosData.forEach((evento) => {
          if (evento.usuario_liked) likesMap[evento.id] = true;
          if (evento.usuario_confirmado) asistenciaMap[evento.id] = true;
        });
        setLikedEvents(likesMap);
        setAsistenciaEvents(asistenciaMap);
        
      } catch (error) {
        console.error('❌ Error fetching eventos:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEventos();
  }, []);

  // Obtener las 3 cards visibles
  const getVisibleCards = useCallback(() => {
    if (eventos.length === 0) return [];
    
    const prevIndex = currentIndex === 0 ? eventos.length - 1 : currentIndex - 1;
    const nextIndex = currentIndex === eventos.length - 1 ? 0 : currentIndex + 1;
    
    return [
      { evento: eventos[prevIndex], position: 'prev', index: prevIndex },
      { evento: eventos[currentIndex], position: 'center', index: currentIndex },
      { evento: eventos[nextIndex], position: 'next', index: nextIndex }
    ];
  }, [eventos, currentIndex]);

  const next = useCallback(() => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    let newIndex = currentIndex + 1;
    if (newIndex >= eventos.length) {
      newIndex = 0;
    }
    setCurrentIndex(newIndex);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  }, [currentIndex, eventos.length, isTransitioning]);

  const prev = useCallback(() => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    let newIndex = currentIndex - 1;
    if (newIndex < 0) {
      newIndex = eventos.length - 1;
    }
    setCurrentIndex(newIndex);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  }, [currentIndex, eventos.length, isTransitioning]);

  // Auto-play
  useEffect(() => {
    if (loading || eventos.length === 0) return;
    
    autoPlayRef.current = setInterval(() => {
      if (!isTransitioning) {
        next();
      }
    }, 5000);
    
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [loading, eventos.length, isTransitioning, next]);

  const handleMouseEnter = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
  };
  
  const handleMouseLeave = () => {
    if (!autoPlayRef.current && eventos.length > 0 && !isTransitioning) {
      autoPlayRef.current = setInterval(() => {
        if (!isTransitioning) {
          next();
        }
      }, 5000);
    }
  };

  const handleLike = async (id) => {
    if (!isAuthenticated) {
      alert(t('like.login_requerido') || 'Inicia sesión para dar like');
      return;
    }
    try {
      await api.post(`/eventos/${id}/like`);
      setLikedEvents(prev => ({ ...prev, [id]: !prev[id] }));
      setEventos(prev => prev.map(evento => 
        evento.id === id 
          ? { ...evento, likes: (evento.likes || 0) + (likedEvents[id] ? -1 : 1) }
          : evento
      ));
    } catch (error) {
      console.error('Error al dar like:', error);
    }
  };

  const handleConfirmarAsistencia = async (id) => {
    if (!isAuthenticated) {
      alert(t('asistencia.login_requerido') || 'Inicia sesión para confirmar asistencia');
      return;
    }
    try {
      if (asistenciaEvents[id]) {
        await api.delete(`/eventos/${id}/cancelar-asistencia`);
        setAsistenciaEvents(prev => ({ ...prev, [id]: false }));
        setEventos(prev => prev.map(evento => 
          evento.id === id 
            ? { ...evento, total_asistentes: Math.max(0, (evento.total_asistentes || 0) - 1) }
            : evento
        ));
      } else {
        await api.post(`/eventos/${id}/confirmar-asistencia`);
        setAsistenciaEvents(prev => ({ ...prev, [id]: true }));
        setEventos(prev => prev.map(evento => 
          evento.id === id 
            ? { ...evento, total_asistentes: (evento.total_asistentes || 0) + 1 }
            : evento
        ));
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.message || t('asistencia.error'));
    }
  };

  const visibleCards = getVisibleCards();

  // Render skeleton
  if (loading) {
    return (
      <section className="te-timeline-section">
        <div className="te-container">
          <h2 className="te-title">
            {t('eventos.titulo') || 'Próximos Eventos'}
          </h2>
          <p className="te-subtitle">
            {t('eventos.subtitulo') || 'Participa en nuestros eventos y sé parte del cambio'}
          </p>
          <div className="te-skeleton-wrapper">
            {[1, 2, 3].map((i) => (
              <div key={i} className="te-skeleton-card">
                <div className="te-skeleton-image"></div>
                <div className="te-skeleton-content">
                  <div className="te-skeleton-title"></div>
                  <div className="te-skeleton-location"></div>
                  <div className="te-skeleton-buttons">
                    <div className="te-skeleton-btn"></div>
                    <div className="te-skeleton-btn"></div>
                    <div className="te-skeleton-btn"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="te-timeline-section">
        <div className="te-container">
          <h2 className="te-title">
            {t('eventos.titulo') || 'Próximos Eventos'}
          </h2>
          <p className="te-subtitle">
            {t('eventos.subtitulo') || 'Participa en nuestros eventos y sé parte del cambio'}
          </p>
          <div className="te-timeline-error">
            <i className="fas fa-exclamation-triangle"></i>
            <p>{t('eventos.error') || 'No se pudieron cargar los eventos'}</p>
            <button onClick={() => window.location.reload()} className="te-timeline-retry-btn">
              {t('eventos.reintentar') || 'Reintentar'}
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (eventos.length === 0) {
    return (
      <section className="te-timeline-section">
        <div className="te-container">
          <h2 className="te-title">
            {t('eventos.titulo') || 'Próximos Eventos'}
          </h2>
          <p className="te-subtitle">
            {t('eventos.subtitulo') || 'Participa en nuestros eventos y sé parte del cambio'}
          </p>
          <div className="te-timeline-empty">
            <i className="fas fa-calendar-alt"></i>
            <p>{t('eventos.empty') || 'Próximamente tendremos nuevos eventos'}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      className="te-timeline-section"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="te-container">
        <h2 className="te-title te-reveal">
          {t('eventos.titulo') || 'Próximos Eventos'}
        </h2>
        <p className="te-subtitle te-reveal te-delay-100">
          {t('eventos.subtitulo') || 'Participa en nuestros eventos y sé parte del cambio'}
        </p>

        <div className="te-wrapper">
          <button 
            className="te-nav te-nav-prev" 
            onClick={prev}
            disabled={isTransitioning}
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          
          <div className="te-cards-container">
            {visibleCards.map(({ evento, position }) => (
              <div 
                key={`${evento.id}-${position}`} 
                className={`te-card-wrapper te-card-${position}`}
              >
                <EventoCard
                  evento={evento}
                  getImageUrl={getImageUrl}
                  variant={position === 'center' ? 'featured' : 'default'}
                  isAuthenticated={isAuthenticated}
                  liked={likedEvents[evento.id]}
                  asistencia={asistenciaEvents[evento.id]}
                  onLike={handleLike}
                  onConfirmarAsistencia={handleConfirmarAsistencia}
                  onView={(e) => console.log('Ver evento:', e.id)}
                  showActions={true}
                />
              </div>
            ))}
          </div>
          
          <button 
            className="te-nav te-nav-next" 
            onClick={next}
            disabled={isTransitioning}
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>

        <div className="te-footer">
          <Link to="/eventos" className="te-view-all">
            {t('eventos.ver_todos') || 'Ver todos los eventos'} <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TimelineEventos;