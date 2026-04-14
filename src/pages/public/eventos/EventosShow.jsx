import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, FileText, Clock, Heart, Share2 } from 'lucide-react';
import api from '../../../services/api';
import './Eventos.css';

const PublicEventosShow = () => {
    const { id } = useParams();
    const [evento, setEvento] = useState(null);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);

    useEffect(() => {
        loadEvento();
    }, [id]);

    const loadEvento = async () => {
        try {
            const response = await api.get(`/eventos/${id}`);
            setEvento(response.data.data || response.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async () => {
        try {
            await api.post(`/eventos/${id}/like`);
            setLiked(!liked);
        } catch (error) {
            console.error('Error al dar like:', error);
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: evento?.nombre_evento,
                text: evento?.descripcion,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('¡Enlace copiado al portapapeles!');
        }
    };

    if (loading) {
        return (
            <div className="public-eventos-loading">
                <div className="spinner"></div>
                <p>Cargando evento...</p>
            </div>
        );
    }

    if (!evento) return null;

    return (
        <div className="public-detail-container">
            <div className="public-detail-card">
                <div className="public-detail-body">
                    {evento.imagen_url && <img src={evento.imagen_url} alt={evento.nombre_evento} className="public-detail-image" />}

                    <div className="public-detail-header">
                        <h1 className="public-detail-title">{evento.nombre_evento}</h1>
                        <div className="public-detail-actions-header">
                            <button onClick={handleLike} className={`public-btn-like-detail ${liked ? 'liked' : ''}`}>
                                <Heart size={20} /> {liked ? 'Te gusta' : 'Me gusta'}
                            </button>
                            <button onClick={handleShare} className="public-btn-share"><Share2 size={20} /> Compartir</button>
                        </div>
                    </div>

                    <div className="public-info-section">
                        <div className="public-info-item"><MapPin size={18} className="public-info-icon" /><strong>Lugar:</strong><span>{evento.lugar_evento}</span></div>
                        <div className="public-info-item"><Calendar size={18} className="public-info-icon" /><strong>Fecha:</strong><span>{new Date(evento.fecha_evento).toLocaleString('es-ES')}</span></div>
                    </div>

                    <div className="public-description">
                        <h5><FileText size={18} /> Descripción del Evento:</h5>
                        <p>{evento.descripcion}</p>
                    </div>

                    <div className="public-detail-footer">
                        <Link to="/eventos" className="public-btn-secondary"><ArrowLeft size={18} /> Volver a Eventos</Link>
                        <small className="public-publish-date"><Clock size={14} /> Publicado: {new Date(evento.created_at).toLocaleDateString()}</small>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicEventosShow;