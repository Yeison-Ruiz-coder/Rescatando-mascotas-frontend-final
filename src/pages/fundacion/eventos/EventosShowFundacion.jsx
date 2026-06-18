// src/pages/fundacion/eventos/EventosShowFundacion.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, MapPin, Calendar, FileText, Clock, Heart, Users, Edit, Trash2, Loader, Mail, Phone, Tag, DollarSign } from 'lucide-react';
import api from '../../../services/api';
import { getImageUrl as buildImageUrl } from '../../../utils/imageUtils';
import './EventosShowFundacion.css';

const FundacionEventosShow = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation('eventos');
    const [evento, setEvento] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const getImageUrl = useCallback((url) => buildImageUrl(url), []);

    useEffect(() => {
        const loadEvento = async () => {
            try {
                const response = await api.get(`/entity/eventos/${id}`);
                const data = response.data.data || response.data;
                setEvento(data);
            } catch (error) {
                console.error('Error:', error);
                setError(error.response?.data?.message || t('error_load'));
            } finally {
                setLoading(false);
            }
        };
        loadEvento();
    }, [id, t]);

    const handleDelete = async () => {
        if (!window.confirm(t('mensajes.confirmar_eliminar'))) {
            return;
        }
        
        setDeleting(true);
        try {
            await api.delete(`/entity/eventos/${id}`);
            navigate('/fundacion/eventos');
        } catch (error) {
            console.error('Error:', error);
            alert(error.response?.data?.message || t('mensajes.error_eliminar'));
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="rmf-eventos-show-loading">
                <Loader size={40} className="rmf-spinner" />
                <p>{t('cargando_evento')}</p>
            </div>
        );
    }

    if (error || !evento) {
        return (
            <div className="rmf-eventos-show-container">
                <div className="rmf-error-container">
                    <Calendar size={48} />
                    <h4>{t('error_titulo')}</h4>
                    <p>{error || t('evento_no_encontrado')}</p>
                    <Link to="/fundacion/eventos" className="rmf-btn-back">{t('btn_volver')}</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="rmf-eventos-show-container">
            <div className="rmf-actions-bar">
                <Link to="/fundacion/eventos" className="rmf-btn-back">
                    <ArrowLeft size={18} />
                    {t('btn_volver')}
                </Link>
                <div className="rmf-show-actions">
                    <Link to={`/fundacion/eventos/${id}/editar`} className="rmf-btn-edit">
                        <Edit size={18} />
                        {t('botones.editar')}
                    </Link>
                    <button onClick={handleDelete} className="rmf-btn-delete" disabled={deleting}>
                        {deleting ? <Loader size={18} className="rmf-spinner-small" /> : <Trash2 size={18} />}
                        {deleting ? t('eliminando') : t('botones.eliminar')}
                    </button>
                </div>
            </div>

            <div className="rmf-eventos-card">
                {evento.imagen_url && (
                    <div className="rmf-show-image">
                        <img src={getImageUrl(evento.imagen_url)} alt={evento.nombre_evento} />
                    </div>
                )}

                <div className="rmf-show-content">
                    <div className="rmf-show-header">
                        <h1>{evento.nombre_evento}</h1>
                        <div className="rmf-evento-stats">
                            <span className="rmf-stat">
                                <Heart size={16} />
                                {t('likes_contador', { count: evento.likes || 0 })}
                            </span>
                            <span className="rmf-stat">
                                <Users size={16} />
                                {t('asistentes_contador', { count: evento.total_asistentes || 0 })}
                            </span>
                        </div>
                    </div>

                    <div className="rmf-evento-badge">
                        {evento.tipo === 'admin' ? (
                            <span className="rmf-badge-admin">{t('evento_global_badge')}</span>
                        ) : (
                            <span className="rmf-badge-fundacion">{t('evento_fundacion_badge')}</span>
                        )}
                    </div>

                    <div className="rmf-info-grid">
                        <div className="rmf-info-item">
                            <MapPin size={18} className="rmf-info-icon" />
                            <div>
                                <strong>{t('lugar')}</strong>
                                <p>{evento.lugar_evento}</p>
                            </div>
                        </div>
                        <div className="rmf-info-item">
                            <Calendar size={18} className="rmf-info-icon" />
                            <div>
                                <strong>{t('fecha_y_hora')}</strong>
                                <p>{new Date(evento.fecha_evento).toLocaleString()}</p>
                            </div>
                        </div>
                        {evento.fecha_fin && (
                            <div className="rmf-info-item">
                                <Clock size={18} className="rmf-info-icon" />
                                <div>
                                    <strong>{t('fecha_fin')}</strong>
                                    <p>{new Date(evento.fecha_fin).toLocaleString()}</p>
                                </div>
                            </div>
                        )}
                        {evento.costo && (
                            <div className="rmf-info-item">
                                <DollarSign size={18} className="rmf-info-icon" />
                                <div>
                                    <strong>{t('costo')}</strong>
                                    <p>{evento.costo}</p>
                                </div>
                            </div>
                        )}
                        {evento.capacidad_maxima && (
                            <div className="rmf-info-item">
                                <Users size={18} className="rmf-info-icon" />
                                <div>
                                    <strong>{t('capacidad_maxima')}</strong>
                                    <p>{evento.capacidad_maxima} {t('personas')}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {evento.descripcion && (
                        <div className="rmf-description-section">
                            <h3>
                                <FileText size={18} />
                                {t('descripcion')}
                            </h3>
                            <p>{evento.descripcion}</p>
                        </div>
                    )}

                    {(evento.organizador || evento.telefono_contacto || evento.email_contacto) && (
                        <div className="rmf-contact-section">
                            <h3>
                                <Phone size={18} />
                                {t('contacto_seccion')}
                            </h3>
                            <div className="rmf-contact-info">
                                {evento.organizador && <p><strong>{t('organizador')}:</strong> {evento.organizador}</p>}
                                {evento.telefono_contacto && <p><strong>{t('telefono')}:</strong> {evento.telefono_contacto}</p>}
                                {evento.email_contacto && <p><strong>{t('email')}:</strong> {evento.email_contacto}</p>}
                            </div>
                        </div>
                    )}

                    {evento.tags && evento.tags.length > 0 && (
                        <div className="rmf-tags-section">
                            <h3>
                                <Tag size={18} />
                                {t('etiquetas')}
                            </h3>
                            <div className="rmf-tags-list">
                                {(Array.isArray(evento.tags) ? evento.tags : JSON.parse(evento.tags)).map((tag, idx) => (
                                    <span key={idx} className="rmf-tag">#{tag}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="rmf-show-footer">
                        <small>
                            <Clock size={14} />
                            {t('creado_el')}: {new Date(evento.created_at).toLocaleDateString()}
                        </small>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FundacionEventosShow;