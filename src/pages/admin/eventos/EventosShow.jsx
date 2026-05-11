// src/pages/admin/eventos/EventosShow.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, MapPin, Calendar, FileText, Clock, Heart, Users, Edit, Trash2, Loader, Mail, Phone, Tag, DollarSign } from 'lucide-react';
import api from '../../../services/api';
import './EventosShow.css';

const AdminEventosShow = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation('eventos');
    const [evento, setEvento] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const getImageUrl = useCallback((url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        const baseUrl = import.meta.env.VITE_STORAGE_URL || 'https://rescatando-mascotas-backend-final-production.up.railway.app';
        return url.startsWith('/storage') ? `${baseUrl}${url}` : `${baseUrl}/storage/${url}`;
    }, []);

    useEffect(() => {
        const loadEvento = async () => {
            try {
                const response = await api.get(`/admin/eventos/${id}`);
                const data = response.data.data || response.data;
                setEvento(data);
            } catch (error) {
                console.error('Error:', error);
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
            <div className="admin-eventos-show-loading">
                <Loader size={40} className="spinner" />
                <p>{t("loading") || "Cargando evento..."}</p>
            </div>
        );
    }

    if (error || !evento) {
        return (
            <div className="admin-eventos-show-container">
                <div className="error-container">
                    <Calendar size={48} />
                    <h4>{t("error_title") || "Error al cargar el evento"}</h4>
                    <p>{error || 'Evento no encontrado'}</p>
                    <Link to="/admin/eventos" className="btn-back">{t("back_to_events") || "Volver a eventos"}</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-eventos-show-container">
            <div className="eventos-show-actions-bar">
                <Link to="/admin/eventos" className="btn-back">
                    <ArrowLeft size={18} />
                    {t("back_to_events") || "Volver a eventos"}
                </Link>
                <div className="show-actions">
                    <Link to={`/admin/eventos/${id}/editar`} className="btn-edit">
                        <Edit size={18} />
                        {t("edit") || "Editar"}
                    </Link>
                    <button onClick={handleDelete} className="btn-delete" disabled={deleting}>
                        {deleting ? <Loader size={18} className="spinner-small" /> : <Trash2 size={18} />}
                        {t("delete") || "Eliminar"}
                    </button>
                </div>
            </div>

            <div className="eventos-show-card">
                {evento.imagen_url && (
                    <div className="show-image">
                        <img src={getImageUrl(evento.imagen_url)} alt={evento.nombre_evento} />
                    </div>
                )}

                <div className="show-content">
                    <div className="show-header">
                        <h1>{evento.nombre_evento}</h1>
                        <div className="evento-stats">
                            <span className="stat">
                                <Heart size={16} />
                                {evento.likes || 0} {t("likes") || "likes"}
                            </span>
                            <span className="stat">
                                <Users size={16} />
                                {evento.total_asistentes || 0} {t("attendees") || "asistentes"}
                            </span>
                        </div>
                    </div>

                    <div className="evento-badge">
                        {evento.tipo === 'admin' ? (
                            <span className="badge-admin">🌍 {t("global_event") || "Evento Global"}</span>
                        ) : (
                            <span className="badge-fundacion">🏠 {t("foundation_event") || "Evento de Fundación"}</span>
                        )}
                    </div>

                    <div className="info-grid">
                        <div className="info-item">
                            <MapPin size={18} className="info-icon" />
                            <div>
                                <strong>{t("location") || "Lugar"}</strong>
                                <p>{evento.lugar_evento}</p>
                            </div>
                        </div>
                        <div className="info-item">
                            <Calendar size={18} className="info-icon" />
                            <div>
                                <strong>{t("date") || "Fecha y hora"}</strong>
                                <p>{new Date(evento.fecha_evento).toLocaleString('es-ES')}</p>
                            </div>
                        </div>
                        {evento.fecha_fin && (
                            <div className="info-item">
                                <Clock size={18} className="info-icon" />
                                <div>
                                    <strong>{t("end_date") || "Fecha de fin"}</strong>
                                    <p>{new Date(evento.fecha_fin).toLocaleString('es-ES')}</p>
                                </div>
                            </div>
                        )}
                        {evento.costo && (
                            <div className="info-item">
                                <DollarSign size={18} className="info-icon" />
                                <div>
                                    <strong>{t("cost") || "Costo"}</strong>
                                    <p>{evento.costo}</p>
                                </div>
                            </div>
                        )}
                        {evento.capacidad_maxima && (
                            <div className="info-item">
                                <Users size={18} className="info-icon" />
                                <div>
                                    <strong>{t("capacity") || "Capacidad máxima"}</strong>
                                    <p>{evento.capacidad_maxima} {t("people") || "personas"}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {evento.descripcion && (
                        <div className="description-section">
                            <h3>
                                <FileText size={18} />
                                {t("description") || "Descripción"}
                            </h3>
                            <p>{evento.descripcion}</p>
                        </div>
                    )}

                    {(evento.organizador || evento.telefono_contacto || evento.email_contacto) && (
                        <div className="contact-section">
                            <h3>
                                <Phone size={18} />
                                {t("contact") || "Contacto"}
                            </h3>
                            <div className="contact-info">
                                {evento.organizador && <p><strong>{t("organizer") || "Organizador"}:</strong> {evento.organizador}</p>}
                                {evento.telefono_contacto && <p><strong>{t("phone") || "Teléfono"}:</strong> {evento.telefono_contacto}</p>}
                                {evento.email_contacto && <p><strong>{t("email") || "Email"}:</strong> {evento.email_contacto}</p>}
                            </div>
                        </div>
                    )}

                    {evento.tags && evento.tags.length > 0 && (
                        <div className="tags-section">
                            <h3>
                                <Tag size={18} />
                                {t("tags") || "Etiquetas"}
                            </h3>
                            <div className="tags-list">
                                {(Array.isArray(evento.tags) ? evento.tags : JSON.parse(evento.tags)).map((tag, idx) => (
                                    <span key={idx} className="tag">#{tag}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="show-footer">
                        <small>
                            <Clock size={14} />
                            {t("created") || "Creado"}: {new Date(evento.created_at).toLocaleDateString()}
                        </small>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminEventosShow;