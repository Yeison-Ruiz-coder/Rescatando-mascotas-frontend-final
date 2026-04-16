import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../services/api';
import EventoCard from '../../../components/common/EventoCard/EventoCard';
import './Eventos.css';

const PublicEventosIndex = () => {
    const { t } = useTranslation('eventos');
    const { isAuthenticated } = useAuth();
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [likedEvents, setLikedEvents] = useState({});
    const [asistenciaEvents, setAsistenciaEvents] = useState({});

    // ✅ Función para obtener la URL completa de la imagen
    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `http://localhost:8000${url}`;
    };

    useEffect(() => {
        loadEventos();
    }, []);

    const loadEventos = async () => {
        setLoading(true);
        try {
            const response = await api.get('/eventos');
            const data = response.data.data || response.data;
            setEventos(data);
            
            // Inicializar estados de asistencia
            const asistenciaMap = {};
            data.forEach(evento => {
                if (evento.usuario_confirmado) {
                    asistenciaMap[evento.id] = true;
                }
            });
            setAsistenciaEvents(asistenciaMap);
        } catch (error) {
            console.error('Error al cargar eventos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async (id) => {
        try {
            await api.post(`/eventos/${id}/like`);
            setLikedEvents(prev => ({ ...prev, [id]: !prev[id] }));
            // Actualizar el contador de likes en el evento
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
            alert(t('login_requerido') || 'Debes iniciar sesión para confirmar asistencia');
            return;
        }
        
        try {
            if (asistenciaEvents[id]) {
                await api.delete(`/eventos/${id}/cancelar-asistencia`);
                setAsistenciaEvents(prev => ({ ...prev, [id]: false }));
                // Actualizar contador de asistentes
                setEventos(prev => prev.map(evento => 
                    evento.id === id 
                        ? { ...evento, total_asistentes: Math.max(0, (evento.total_asistentes || 0) - 1) }
                        : evento
                ));
            } else {
                await api.post(`/eventos/${id}/confirmar-asistencia`);
                setAsistenciaEvents(prev => ({ ...prev, [id]: true }));
                // Actualizar contador de asistentes
                setEventos(prev => prev.map(evento => 
                    evento.id === id 
                        ? { ...evento, total_asistentes: (evento.total_asistentes || 0) + 1 }
                        : evento
                ));
            }
        } catch (error) {
            console.error('Error:', error);
            alert(error.response?.data?.message || t('error_asistencia') || 'Error al procesar la solicitud');
        }
    };

    if (loading) {
        return (
            <div className="public-eventos-loading">
                <div className="spinner"></div>
                <p>{t('cargando')}</p>
            </div>
        );
    }

    return (
        <div className="public-eventos-container">
            <div className="public-eventos-header">
                <h1>🐾 {t('titulo')}</h1>
                <p>{t('subtitulo')}</p>
            </div>

            {eventos.length > 0 ? (
                <div className="public-eventos-grid">
                    {eventos.map((evento) => (
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
                    ))}
                </div>
            ) : (
                <div className="public-eventos-empty">
                    <Calendar size={48} />
                    <h4>{t('sin_eventos.titulo')}</h4>
                    <p>{t('sin_eventos.mensaje')}</p>
                </div>
            )}
        </div>
    );
};

export default PublicEventosIndex;