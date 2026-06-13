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
  
  const trackRef = useRef(null);
  const containerRef = useRef(null);
  const autoPlayRef = useRef(null);
  const transitionTimeoutRef = useRef(null);

  // 🔥 ANCHOS FIJOS - IGUALES QUE EL CSS
  const CARD_WIDTH = 340;  // ← Cambiado de 240 a 340 (coincide con CSS)
  const GAP = 24;
  const SLIDE_WIDTH = CARD_WIDTH + GAP;

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_STORAGE_URL || 'https://rescatando-mascotas-backend-final-production.up.railway.app';
    return path.startsWith('/storage') ? `${baseUrl}${path}` : `${baseUrl}/storage/${path}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return { day: '??', month: '???' };
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase(),
    };
  };

  useEffect(() => {
    const fetchEventos = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const params = {
          page: 1,
          per_page: 12,
          sort: 'fecha_evento'
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

  // Calcular offset para centrar la card actual
  const calculateOffset = useCallback(() => {
    if (!containerRef.current) return 0;
    
    const containerWidth = containerRef.current.offsetWidth;
    const centerOffset = (containerWidth / 2) - (CARD_WIDTH / 2);
    const scrollOffset = -(currentIndex * SLIDE_WIDTH) + centerOffset;
    
    return scrollOffset;
  }, [currentIndex]);

  // Mover el track
  const moveToIndex = useCallback((index, withTransition = true) => {
    if (!trackRef.current) return;
    
    setCurrentIndex(index);
    
    const offset = calculateOffset();
    
    if (withTransition) {
      trackRef.current.style.transition = 'transform 0.5s cubic-bezier(0.2, 0.9, 0.4, 1.1)';
    } else {
      trackRef.current.style.transition = 'none';
    }
    
    trackRef.current.style.transform = `translateX(${offset}px)`;
  }, [calculateOffset]);

  // Siguiente con loop infinito
  const next = useCallback(() => {
    if (isTransitioning || eventos.length === 0) return;
    
    setIsTransitioning(true);
    let newIndex = currentIndex + 1;
    if (newIndex >= eventos.length) {
      newIndex = 0;
    }
    
    moveToIndex(newIndex, true);
    
    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    transitionTimeoutRef.current = setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  }, [currentIndex, eventos.length, isTransitioning, moveToIndex]);

  // Anterior con loop infinito
  const prev = useCallback(() => {
    if (isTransitioning || eventos.length === 0) return;
    
    setIsTransitioning(true);
    let newIndex = currentIndex - 1;
    if (newIndex < 0) {
      newIndex = eventos.length - 1;
    }
    
    moveToIndex(newIndex, true);
    
    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    transitionTimeoutRef.current = setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  }, [currentIndex, eventos.length, isTransitioning, moveToIndex]);

  const goToIndex = useCallback((index) => {
    if (isTransitioning || index === currentIndex) return;
    
    setIsTransitioning(true);
    moveToIndex(index, true);
    
    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    transitionTimeoutRef.current = setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  }, [currentIndex, isTransitioning, moveToIndex]);

  // Recalcular posición al redimensionar
  useEffect(() => {
    const handleResize = () => {
      if (eventos.length > 0) {
        moveToIndex(currentIndex, false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [eventos.length, currentIndex, moveToIndex]);

  // Inicializar posición
  useEffect(() => {
    if (eventos.length > 0 && trackRef.current) {
      setTimeout(() => {
        moveToIndex(currentIndex, false);
      }, 100);
    }
  }, [eventos, currentIndex, moveToIndex]);

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

  if (loading) {
    return (
      <section className="te-timeline-section">
        <div className="te-container">
          <h2 className="te-title">
            {t('eventos.titulo') || 'Línea de Tiempo'}
          </h2>
          <p className="te-subtitle">
            {t('eventos.subtitulo') || 'Sigue nuestros eventos en el tiempo'}
          </p>
          <div className="te-skeleton-wrapper">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="te-skeleton-card">
                <div className="te-skeleton-image"></div>
                <div className="te-skeleton-content">
                  <div className="te-skeleton-title"></div>
                  <div className="te-skeleton-location"></div>
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
            {t('eventos.titulo') || 'Línea de Tiempo'}
          </h2>
          <p className="te-subtitle">
            {t('eventos.subtitulo') || 'Sigue nuestros eventos en el tiempo'}
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
            {t('eventos.titulo') || 'Línea de Tiempo'}
          </h2>
          <p className="te-subtitle">
            {t('eventos.subtitulo') || 'Sigue nuestros eventos en el tiempo'}
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
          {t('eventos.titulo') || 'Línea de Tiempo'}
        </h2>
        <p className="te-subtitle te-reveal te-delay-100">
          {t('eventos.subtitulo') || 'Sigue nuestros eventos en el tiempo'}
        </p>

        <div className="te-wrapper">
          <button 
            className="te-nav te-nav-prev" 
            onClick={prev}
            disabled={isTransitioning}
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          
          <div className="te-timeline-container" ref={containerRef}>
            <div className="te-timeline-track" ref={trackRef}>
              {eventos.map((evento, index) => {
                const fecha = formatDate(evento.fecha_evento);
                const isActive = index === currentIndex;
                const distance = Math.abs(index - currentIndex);
                
                let opacityClass = '';
                if (distance === 0) opacityClass = 'te-opacity-center';
                else if (distance === 1) opacityClass = 'te-opacity-near';
                else if (distance === 2) opacityClass = 'te-opacity-far';
                else opacityClass = 'te-opacity-away';
                
                return (
                  <div 
                    key={evento.id} 
                    className={`te-timeline-item ${opacityClass}`}
                    onClick={() => goToIndex(index)}
                  >
                    <div className="te-timeline-marker">
                      <div className={`te-timeline-dot ${isActive ? 'te-active' : ''}`}></div>
                      <div className="te-timeline-date">
                        <span className="te-date-day">{fecha.day}</span>
                        <span className="te-date-month">{fecha.month}</span>
                      </div>
                    </div>
                    
                    <EventoCard
                      evento={evento}
                      getImageUrl={getImageUrl}
                      variant={isActive ? 'featured' : 'default'}
                      isAuthenticated={isAuthenticated}
                      liked={likedEvents[evento.id]}
                      asistencia={asistenciaEvents[evento.id]}
                      onLike={handleLike}
                      onConfirmarAsistencia={handleConfirmarAsistencia}
                      onView={(e) => console.log('Ver evento:', e.id)}
                      showActions={true}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          
          <button 
            className="te-nav te-nav-next" 
            onClick={next}
            disabled={isTransitioning}
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>

        <div className="te-progress">
          <div className="te-progress-bar">
            <div 
              className="te-progress-fill" 
              style={{ width: `${((currentIndex + 1) / eventos.length) * 100}%` }}
            ></div>
          </div>
          <div className="te-progress-text">
            {currentIndex + 1} de {eventos.length} eventos
          </div>
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