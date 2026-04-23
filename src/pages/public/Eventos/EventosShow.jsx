import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, MapPin, Calendar, FileText, Clock, Heart, Share2, CalendarCheck, Users, CheckCircle } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../services/api';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import './Eventos.css';

const PublicEventosShow = () => {
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
        if (url.startsWith('/storage')) return `http://localhost:8000${url}`;
        return `http://localhost:8000/storage/${url}`;
    }, []);

    useEffect(() => {
        const abortController = new AbortController();
        let isMounted = true;

        const loadEvento = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await api.get(`/eventos/${id}`, {
                    signal: abortController.signal
                });
                
                if (!isMounted) return;
                
                const data = response.data.data || response.data;
                setEvento(data);
                setAsistencia(data.usuario_confirmado || false);
            } catch (error) {
                if (error.name === 'CanceledError' || error.name === 'AbortError') {
                    console.log('Petición cancelada (navegación rápida)');
                    return;
                }
                console.error('Error:', error);
                if (isMounted) {
                    setError(error.message || 'Error al cargar el evento');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadEvento();
        
        return () => {
            isMounted = false;
            abortController.abort();
        };
    }, [id]);

    const handleLike = useCallback(async () => {
        try {
            await api.post(`/eventos/${id}/like`);
            setLiked(!liked);
        } catch (error) {
            console.error('Error al dar like:', error);
        }
    }, [id, liked]);

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

    const handleShare = useCallback(() => {
        if (navigator.share) {
            navigator.share({
                title: evento?.nombre_evento,
                text: evento?.descripcion,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert(t('detalle.enlace_copiado'));
        }
    }, [evento, t]);

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
            <div className="public-detail-container">
                <div className="public-detail-card">
                    <div className="public-detail-body">
                        <div className="public-eventos-empty">
                            <Calendar size={48} />
                            <h4>Error al cargar el evento</h4>
                            <p>{error}</p>
                            <Link to="/eventos" className="public-btn-secondary">
                                Volver a Eventos
                            </Link>
                        </div>
                    </div>
                </div>
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
                            <span className="badge-admin-large">🌟 {t('detalle.evento_global')}</span>
                        ) : (
                            <span className="badge-fundacion-large">🏠 {t('detalle.evento_fundacion')}</span>
                        )}
                    </div>

                    {evento.imagen_url ? (
                        <img 
                            src={getImageUrl(evento.imagen_url)} 
                            alt={evento.nombre_evento} 
                            className="public-detail-image"
                            loading="lazy"
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
                                <Heart size={20} /> {liked ? t('botones.me_gusta') : t('botones.dar_like')}
                            </button>
                            <button onClick={handleShare} className="public-btn-share">
                                <Share2 size={20} /> {t('botones.compartir')}
                            </button>
                        </div>
                    </div>

                    <div className="asistencia-section">
                        <button onClick={handleConfirmarAsistencia} className={`btn-asistir-principal ${asistencia ? 'confirmed' : ''}`}>
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
                            <div className="total-asistentes">
                                <Users size={16} />
                                <span>{evento.total_asistentes} {t('asistencia.personas_asistiran')}</span>
                            </div>
                        )}
                    </div>

                    <div className="public-info-section">
                        <div className="public-info-item">
                            <MapPin size={18} className="public-info-icon" />
                            <strong>{t('evento.lugar')}:</strong>
                            <span>{evento.lugar_evento}</span>
                        </div>
                        <div className="public-info-item">
                            <Calendar size={18} className="public-info-icon" />
                            <strong>{t('evento.fecha')}:</strong>
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
                        <h5><FileText size={18} /> {t('evento.descripcion')}:</h5>
                        <p>{evento.descripcion}</p>
                    </div>

                    <div className="public-detail-footer">
                        <Link to="/eventos" className="public-btn-secondary">
                            <ArrowLeft size={18} /> {t('detalle.volver')}
                        </Link>
                        <small className="public-publish-date">
                            <Clock size={14} /> {t('detalle.publicado')}: {new Date(evento.created_at).toLocaleDateString()}
                        </small>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicEventosShow;