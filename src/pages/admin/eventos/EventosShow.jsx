// src/pages/admin/eventos/EventosShow.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import { ArrowLeft, MapPin, Calendar, FileText, Clock, Heart, Users, Edit, Trash2, Loader, Mail, Phone, Tag, DollarSign, ChevronLeft, AlertCircle } from 'lucide-react';
import api from '../../../services/api';
import ProfileBanner from '../../../components/common/ProfileBanner/ProfileBanner';
import { getImageUrl as buildImageUrl } from '../../../utils/imageUtils';
import './EventosShow.css';

const AdminEventosShow = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation('eventos');
    const { user } = useAuth();
    const [evento, setEvento] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const adminName = user?.name || user?.nombre || t('admin', 'Administrador');
    const adminAvatar = user?.avatar || null;

    const getImageUrl = useCallback((url) => buildImageUrl(url), []);

    const handleGoBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    useEffect(() => {
        const loadEvento = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await api.get(`/admin/eventos/${id}`);
                
                console.log('📦 Respuesta evento:', response.data);
                
                // ✅ Extraer datos correctamente
                let data = response.data.data || response.data;
                
                // ✅ Asegurar que tags sea un array
                if (data.tags) {
                    if (typeof data.tags === 'string') {
                        try {
                            data.tags = JSON.parse(data.tags);
                        } catch (e) {
                            data.tags = [];
                        }
                    }
                    if (!Array.isArray(data.tags)) {
                        data.tags = [];
                    }
                } else {
                    data.tags = [];
                }
                
                setEvento(data);
            } catch (error) {
                console.error('Error cargando evento:', error);
                setError(error.response?.data?.message || 'Error al cargar el evento');
            } finally {
                setLoading(false);
            }
        };
        loadEvento();
    }, [id]);

    const handleDelete = async () => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este evento? Esta acción no se puede deshacer.')) {
            return;
        }
        
        setDeleting(true);
        try {
            await api.delete(`/admin/eventos/${id}`);
            navigate('/admin/eventos');
        } catch (error) {
            console.error('Error:', error);
            alert(error.response?.data?.message || 'Error al eliminar el evento');
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="ev-container">
                <div className="ev-loading">
                    <div className="ev-spinner"></div>
                    <p>{t("loading") || "Cargando evento..."}</p>
                </div>
            </div>
        );
    }

    if (error || !evento) {
        return (
            <div className="ev-container">
                <div className="bento-container">
                    <div className="ev-error">
                        <AlertCircle size={48} className="ev-error-icon" />
                        <h3>{t("error_title") || "Error al cargar el evento"}</h3>
                        <p>{error || 'Evento no encontrado'}</p>
                        <button onClick={handleGoBack} className="ev-btn-retry">
                            <ArrowLeft size={18} /> {t("volver", "Volver")}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="ev-container">
            <div className="ev-banner-wrapper">
                <ProfileBanner
                    user={{
                        nombre: adminName,
                        avatar: adminAvatar,
                        titulo: t('banner.titulo_show', {
                            defaultValue: 'Evento: {{nombre}}',
                            nombre: evento.nombre_evento,
                        }),
                        solicitudes: evento.total_asistentes || 0,
                        adopciones: evento.likes || 0,
                        eventos: 1,
                    }}
                />
            </div>

            <div className="bento-container">
                <header className="ev-show-header">
                    <button onClick={handleGoBack} className="ev-btn-back">
                        <ChevronLeft size={18} />
                        {t('volver', 'Volver')}
                    </button>
                    <div className="ev-header-actions">
                        <Link to={`/admin/eventos/${id}/editar`} className="ev-btn-edit">
                            <Edit size={16} />
                            {t("btn_editar", "Editar")}
                        </Link>
                        <button onClick={handleDelete} className="ev-btn-delete" disabled={deleting}>
                            {deleting ? <div className="ev-spinner-small"></div> : <Trash2 size={16} />}
                            {t("eliminar", "Eliminar")}
                        </button>
                    </div>
                </header>

                <div className="ev-show-card">
                    {evento.imagen_url && (
                        <div className="ev-show-image">
                            <img 
                                src={getImageUrl(evento.imagen_url)} 
                                alt={evento.nombre_evento}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/placeholder-image.jpg';
                                }}
                            />
                        </div>
                    )}

                    <div className="ev-show-content">
                        <div className="ev-show-header-info">
                            <h1>{evento.nombre_evento}</h1>
                            <div className="ev-show-stats">
                                <span className="ev-stat">
                                    <Heart size={16} />
                                    {evento.likes || 0} {t("likes")}
                                </span>
                                <span className="ev-stat">
                                    <Users size={16} />
                                    {evento.total_asistentes || 0} {t("asistentes")}
                                </span>
                            </div>
                        </div>

                        <div className="ev-show-badge">
                            {evento.tipo === 'admin' ? (
                                <span className="ev-badge-admin">🌍 {t("global_event", "Evento Global")}</span>
                            ) : (
                                <span className="ev-badge-fundacion">🏠 {t("foundation_event", "Evento de Fundación")}</span>
                            )}
                        </div>

                        <div className="ev-info-grid">
                            <div className="ev-info-item">
                                <MapPin size={18} className="ev-info-icon" />
                                <div>
                                    <strong>{t("ubicacion", "Ubicación")}</strong>
                                    <p>{evento.lugar_evento || '-'}</p>
                                </div>
                            </div>
                            <div className="ev-info-item">
                                <Calendar size={18} className="ev-info-icon" />
                                <div>
                                    <strong>{t("fecha", "Fecha y hora")}</strong>
                                    <p>{evento.fecha_evento ? new Date(evento.fecha_evento).toLocaleString('es-CO') : '-'}</p>
                                </div>
                            </div>
                            {evento.fecha_fin && (
                                <div className="ev-info-item">
                                    <Clock size={18} className="ev-info-icon" />
                                    <div>
                                        <strong>{t("fecha_fin", "Fecha de fin")}</strong>
                                        <p>{new Date(evento.fecha_fin).toLocaleString('es-CO')}</p>
                                    </div>
                                </div>
                            )}
                            {evento.costo && (
                                <div className="ev-info-item">
                                    <DollarSign size={18} className="ev-info-icon" />
                                    <div>
                                        <strong>{t("costo", "Costo")}</strong>
                                        <p>{evento.costo}</p>
                                    </div>
                                </div>
                            )}
                            {evento.capacidad_maxima && (
                                <div className="ev-info-item">
                                    <Users size={18} className="ev-info-icon" />
                                    <div>
                                        <strong>{t("capacidad", "Capacidad máxima")}</strong>
                                        <p>{evento.capacidad_maxima} {t("personas", "personas")}</p>
                                    </div>
                                </div>
                            )}
                            {evento.categoria && (
                                <div className="ev-info-item">
                                    <Tag size={18} className="ev-info-icon" />
                                    <div>
                                        <strong>{t("categoria", "Categoría")}</strong>
                                        <p>{evento.categoria}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {evento.descripcion && (
                            <div className="ev-description-section">
                                <h3>
                                    <FileText size={18} />
                                    {t("descripcion", "Descripción")}
                                </h3>
                                <p>{evento.descripcion}</p>
                            </div>
                        )}

                        {(evento.organizador || evento.telefono_contacto || evento.email_contacto) && (
                            <div className="ev-contact-section">
                                <h3>
                                    <Phone size={18} />
                                    {t("contacto", "Contacto")}
                                </h3>
                                <div className="ev-contact-info">
                                    {evento.organizador && <p><strong>{t("organizador", "Organizador")}:</strong> {evento.organizador}</p>}
                                    {evento.telefono_contacto && <p><strong>{t("telefono", "Teléfono")}:</strong> {evento.telefono_contacto}</p>}
                                    {evento.email_contacto && <p><strong>{t("email", "Email")}:</strong> {evento.email_contacto}</p>}
                                </div>
                            </div>
                        )}

                        {/* ✅ TAGS - Ahora seguro */}
                        {evento.tags && evento.tags.length > 0 && (
                            <div className="ev-tags-section">
                                <h3>
                                    <Tag size={18} />
                                    {t("etiquetas", "Etiquetas")}
                                </h3>
                                <div className="ev-tags-list">
                                    {evento.tags.map((tag, idx) => (
                                        <span key={idx} className="ev-tag">#{tag}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="ev-show-footer">
                            <small>
                                <Clock size={14} />
                                {t("creado", "Creado")}: {new Date(evento.created_at).toLocaleDateString('es-CO')}
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminEventosShow;