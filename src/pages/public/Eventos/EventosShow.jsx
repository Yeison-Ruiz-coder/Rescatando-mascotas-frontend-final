import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, MapPin, Calendar, FileText, Clock, Heart, Share2, CalendarCheck, Users, CheckCircle } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../services/api';
import './Eventos.css';

const PublicEventosShow = () => {
    const { id } = useParams();
    const { t } = useTranslation('eventos');
    const { isAuthenticated } = useAuth();
    const [evento, setEvento] = useState(null);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);
    const [asistencia, setAsistencia] = useState(false);

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        if (url.startsWith('/storage')) return `http://localhost:8000${url}`;
        return `http://localhost:8000/storage/${url}`;
    };

    useEffect(() => {
        loadEvento();
    }, [id]);

    const loadEvento = async () => {
        try {
            const response = await api.get(`/eventos/${id}`);
            const data = response.data.data || response.data;
            setEvento(data);
            setAsistencia(data.usuario_confirmado || false);
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

    const handleConfirmarAsistencia = async () => {
        if (!isAuthenticated) {
            alert(t('login_requerido') || 'Debes iniciar sesión para confirmar asistencia');
            return;
        }
        
        try {
            if (asistencia) {
                await api.delete(`/eventos/${id}/cancelar-asistencia`);
                setAsistencia(false);
            } else {
                await api.post(`/eventos/${id}/confirmar-asistencia`);
                setAsistencia(true);
            }
            loadEvento();
        } catch (error) {
            console.error('Error:', error);
            alert(error.response?.data?.message || t('error_asistencia') || 'Error al procesar la solicitud');
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
            alert(t('enlace_copiado') || '¡Enlace copiado al portapapeles!');
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

    if (!evento) return null;

    return (
        <div className="public-detail-container">
            <div className="public-detail-card">
                <div className="public-detail-body">
                    <div className="detail-badge">
                        {evento.tipo === 'admin' ? (
                            <span className="badge-admin-large">🌟 {t('evento_global') || 'Evento Global'}</span>
                        ) : (
                            <span className="badge-fundacion-large">🏠 {t('evento_fundacion') || 'Evento de Fundación'}</span>
                        )}
                    </div>

                    {evento.imagen_url ? (
                        <img 
                            src={getImageUrl(evento.imagen_url)} 
                            alt={evento.nombre_evento} 
                            className="public-detail-image"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/800x400/667eea/FFFFFF?text=Evento';
                            }}
                        />
                    ) : (
                        <div className="public-detail-placeholder">
                            <Calendar size={64} />
                            <span>{evento.nombre_evento}</span>
                        </div>
                    )}

                    <div className="public-detail-header">
                        <h1 className="public-detail-title">{evento.nombre_evento}</h1>
                        <div className="public-detail-actions-header">
                            <button onClick={handleLike} className={`public-btn-like-detail ${liked ? 'liked' : ''}`}>
                                <Heart size={20} /> {liked ? (t('me_gusta') || 'Me gusta') : (t('dar_like') || 'Dar like')}
                            </button>
                            <button onClick={handleShare} className="public-btn-share">
                                <Share2 size={20} /> {t('compartir') || 'Compartir'}
                            </button>
                        </div>
                    </div>

                    <div className="asistencia-section">
                        <button onClick={handleConfirmarAsistencia} className={`btn-asistir-principal ${asistencia ? 'confirmed' : ''}`}>
                            <CalendarCheck size={24} />
                            {asistencia ? (
                                <>
                                    <CheckCircle size={18} />
                                    {t('asistencia_confirmada') || '¡Asistencia confirmada!'}
                                </>
                            ) : (
                                t('confirmar_asistencia') || 'Confirmar mi asistencia'
                            )}
                        </button>
                        {evento.total_asistentes > 0 && (
                            <div className="total-asistentes">
                                <Users size={16} />
                                <span>{evento.total_asistentes} {t('personas_asistiran') || 'personas asistirán'}</span>
                            </div>
                        )}
                    </div>

                    <div className="public-info-section">
                        <div className="public-info-item">
                            <MapPin size={18} className="public-info-icon" />
                            <strong>{t('lugar') || 'Lugar'}:</strong>
                            <span>{evento.lugar_evento}</span>
                        </div>
                        <div className="public-info-item">
                            <Calendar size={18} className="public-info-icon" />
                            <strong>{t('fecha') || 'Fecha'}:</strong>
                            <span>
                                {new Date(evento.fecha_evento).toLocaleString('es-ES', {
                                    weekday: 'long',
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </span>
                        </div>
                    </div>

                    <div className="public-description">
                        <h5><FileText size={18} /> {t('descripcion') || 'Descripción'}:</h5>
                        <p>{evento.descripcion}</p>
                    </div>

                    <div className="public-detail-footer">
                        <Link to="/eventos" className="public-btn-secondary">
                            <ArrowLeft size={18} /> {t('volver') || 'Volver a Eventos'}
                        </Link>
                        <small className="public-publish-date">
                            <Clock size={14} /> {t('publicado') || 'Publicado'}: {new Date(evento.created_at).toLocaleDateString()}
                        </small>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicEventosShow;