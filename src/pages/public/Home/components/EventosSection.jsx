// src/pages/public/Home/components/EventosSection.jsx
import React, { useState, useEffect, useCallback, memo } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../../../services/api';
import EventoCard from '../../../../components/common/EventoCard/EventoCard';
import SlideUpPanel from '../../../../components/common/SlideUpPanel/SlideUpPanel';
import EventosPublicShow from '../../Eventos/EventosPublicShow';
import './EventosSection.css';

const EventosSection = memo(({ isAuthenticated = false }) => {
  const { t } = useTranslation('home');
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEventoId, setSelectedEventoId] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [likedEvents, setLikedEvents] = useState({});
  const [attendingEvents, setAttendingEvents] = useState({});

  const getImageUrl = useCallback((imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = import.meta.env.VITE_STORAGE_URL || 
      'https://rescatando-mascotas-backend-final-production.up.railway.app';
    return imagePath.startsWith('/storage') 
      ? `${baseUrl}${imagePath}` 
      : `${baseUrl}/storage/${imagePath}`;
  }, []);

  const normalizeEvento = (evento) => {
    return {
      id: evento.id,
      nombre_evento: evento.nombre_evento,
      lugar_evento: evento.lugar_evento,
      fecha_evento: evento.fecha_evento,
      imagen_url: evento.imagen_url,
      descripcion_corta: evento.descripcion?.substring(0, 100),
      capacidad_total: evento.capacidad_maxima || 0,
      estado_evento: 'proximo',
      es_gratuito: !evento.costo || evento.costo === '0'
    };
  };

  const fetchEventos = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/eventos', {
        params: {
          per_page: 6,
          sort: 'fecha_evento',
          proximos: true
        }
      });
      
      let eventosData = [];
      
      if (response.data?.data?.data) {
        eventosData = response.data.data.data;
      } else if (response.data?.data) {
        eventosData = response.data.data;
      } else if (Array.isArray(response.data)) {
        eventosData = response.data;
      }
      
      setEventos(eventosData.slice(0, 6));
    } catch (err) {
      console.error('Error fetching eventos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEventos();
  }, [fetchEventos]);

  const handleLike = async (eventoId) => {
    if (!isAuthenticated) return;
    setLikedEvents(prev => ({ ...prev, [eventoId]: !prev[eventoId] }));
  };

  const handleConfirmarAsistencia = async (eventoId) => {
    if (!isAuthenticated) return;
    setAttendingEvents(prev => ({ ...prev, [eventoId]: !prev[eventoId] }));
  };

  const handleViewEvent = (evento) => {
    setSelectedEventoId(evento.id);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setSelectedEventoId(null);
  };

  if (loading) {
    return (
      <section className="es-section">
        <div className="es-container">
          <h2 className="es-title">
            {t('eventos.titulo') || 'Próximos eventos'}
          </h2>
          <div className="es-skeleton">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="es-skeleton-item">
                <div className="es-skeleton-card"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || eventos.length === 0) {
    return null;
  }

  return (
    <section className="es-section">
      <div className="es-container">
        <h2 className="es-title reveal-up">
          {t('eventos.titulo') || 'Próximos eventos'}
        </h2>
        
        <div className="es-timeline">
          {eventos.map((evento, index) => {
            const normalizedEvento = normalizeEvento(evento);
            const isLeft = index % 2 === 0;
            const delay = Math.min(index * 100, 500);
            
            return (
              <div 
                key={evento.id} 
                className={`es-timeline-item ${isLeft ? 'es-timeline-left' : 'es-timeline-right'} reveal-${isLeft ? 'left' : 'right'} delay-${delay}`}
              >
                <div className="es-timeline-card-wrapper">
                  <EventoCard
                    evento={normalizedEvento}
                    getImageUrl={getImageUrl}
                    isAuthenticated={isAuthenticated}
                    liked={likedEvents[evento.id] || false}
                    asistencia={attendingEvents[evento.id] || false}
                    onLike={handleLike}
                    onConfirmarAsistencia={handleConfirmarAsistencia}
                    onView={handleViewEvent}
                    showActions={true}
                  />
                </div>
                <div className="es-timeline-dot"></div>
              </div>
            );
          })}
        </div>
      </div>

      <SlideUpPanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        title="Detalle del evento"
      >
        {selectedEventoId && (
          <EventosPublicShow eventoId={selectedEventoId} embed={true} />
        )}
      </SlideUpPanel>
    </section>
  );
});

EventosSection.displayName = 'EventosSection';
export default EventosSection;