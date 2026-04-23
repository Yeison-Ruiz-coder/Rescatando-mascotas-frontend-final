import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../services/api';
import EventoCard from '../../../components/common/EventoCard/EventoCard';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import './Eventos.css';

const PublicEventosIndex = () => {
    const { t } = useTranslation('eventos');
    const { isAuthenticated } = useAuth();
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [likedEvents, setLikedEvents] = useState({});
    const [asistenciaEvents, setAsistenciaEvents] = useState({});
    const [error, setError] = useState(null);

    const getImageUrl = useCallback((url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `http://localhost:8000${url}`;
    }, []);

    useEffect(() => {
        const abortController = new AbortController();
        let isMounted = true;

        const loadEventos = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const response = await api.get('/eventos', {
                    signal: abortController.signal
                });
                
                if (!isMounted) return;
                
                const data = response.data.data || response.data;
                
                setEventos(data);
                
                const asistenciaMap = {};
                for (let i = 0; i < data.length; i++) {
                    const evento = data[i];
                    if (evento.usuario_confirmado) {
                        asistenciaMap[evento.id] = true;
                    }
                }
                setAsistenciaEvents(asistenciaMap);
                
            } catch (error) {
                if (error.name === 'CanceledError' || error.name === 'AbortError') {
                    console.log('Petición cancelada (navegación rápida)');
                    return;
                }
                console.error('Error al cargar eventos:', error);
                if (isMounted) {
                    setError(error.message || 'Error al cargar los eventos');
                    setEventos([]);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadEventos();
        
        return () => {
            isMounted = false;
            abortController.abort();
        };
    }, []);

    const handleLike = useCallback(async (id) => {
        try {
            await api.post(`/eventos/${id}/like`);
            setLikedEvents(prev => ({ ...prev, [id]: !prev[id] }));
            setEventos(prev => prev.map(evento => 
                evento.id === id 
                    ? { ...evento, likes: (evento.likes || 0) + (prev.find(e => e.id === id)?.likes ? 1 : -1) }
                    : evento
            ));
        } catch (error) {
            console.error('Error al dar like:', error);
        }
    }, []);

    const handleConfirmarAsistencia = useCallback(async (id) => {
        if (!isAuthenticated) {
            alert(t('asistencia.login_requerido') || 'Debes iniciar sesión para confirmar asistencia');
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
            alert(error.response?.data?.message || t('asistencia.error') || 'Error al procesar la solicitud');
        }
    }, [isAuthenticated, asistenciaEvents, t]);

    const eventosGrid = useMemo(() => {
        if (eventos.length === 0) return null;
        
        return eventos.map((evento) => (
            <EventoCard
                key={evento.id}
                evento={evento}
                getImageUrl={getImageUrl}
                variant="default"
                isAuthenticated={isAuthenticated}
                liked={likedEvents[evento.id]}
                asistencia={asistenciaEvents[evento.id]}
                onLike={handleLike}
                onConfirmarAsistencia={handleConfirmarAsistencia}
                showActions={true}
            />
        ));
    }, [eventos, likedEvents, asistenciaEvents, isAuthenticated, getImageUrl, handleLike, handleConfirmarAsistencia]);

    // ✅ Solo el LoadingSpinner, sin texto
    if (loading) {
        return (
            <div className="public-eventos-loading">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="public-eventos-container">
                <div className="public-eventos-empty">
                    <Calendar size={48} />
                    <h4>Error al cargar eventos</h4>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()} className="btn-outline">
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="public-eventos-container">
            <div className="public-eventos-header">
                <h1>🐾 {t('titulo') || 'Eventos para Mascotas'}</h1>
                <p>{t('subtitulo') || 'Descubre los próximos eventos y actividades para ti y tu mascota'}</p>
            </div>

            {eventos.length > 0 ? (
                <div className="public-eventos-grid">
                    {eventosGrid}
                </div>
            ) : (
                <div className="public-eventos-empty">
                    <Calendar size={48} />
                    <h4>{t('sin_eventos.titulo') || 'No hay eventos programados'}</h4>
                    <p>{t('sin_eventos.mensaje') || 'Próximamente tendremos eventos para mascotas. ¡Mantente atento!'}</p>
                </div>
            )}
        </div>
    );
};

export default PublicEventosIndex;