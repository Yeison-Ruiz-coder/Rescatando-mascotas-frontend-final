// src/pages/fundacion/eventos/EventosShow.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, MapPin, Calendar, FileText, Clock, Heart, Users, Edit, Trash2, Loader, Mail, Phone, Tag, DollarSign } from 'lucide-react';
import api from '../../../services/api';
import './EventosShow.css';


const FundacionEventosShow = () => {
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
                const response = await api.get(`/entity/eventos/${id}`);
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
            await api.delete(`/entity/eventos/${id}`);
            navigate('/fundacion/eventos');
        } catch (error) {
            console.error('Error:', error);
            alert(error.response?.data?.message || 'Error al eliminar el evento');
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="fundacion-eventos-show-loading">
                <Loader size={40} className="spinner" />
                <p>Cargando evento...</p>
            </div>
        );
    }

    if (error || !evento) {
        return (
            <div className="fundacion-eventos-show-container">
                <div className="error-container">
                    <Calendar size={48} />
                    <h4>Error al cargar el evento</h4>
                    <p>{error || 'Evento no encontrado'}</p>
                    <Link to="/fundacion/eventos" className="btn-back">Volver a mis eventos</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="fundacion-eventos-show-container">
            <div className="eventos-show-actions-bar">
                <Link to="/fundacion/eventos" className="btn-back">
                    <ArrowLeft size={18} />
                    Volver a mis eventos
                </Link>
                <div className="show-actions">
                    <Link to={`/fundacion/eventos/${id}/editar`} className="btn-edit">
                        <Edit size={18} />
                        Editar
                    </Link>
                    <button onClick={handleDelete} className="btn-delete" disabled={deleting}>
                        {deleting ? <Loader size={18} className="spinner-small" /> : <Trash2 size={18} />}
                        Eliminar
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
                                {evento.likes || 0} likes
                            </span>
                            <span className="stat">
                                <Users size={16} />
                                {evento.total_asistentes || 0} asistentes
                            </span>
                        </div>
                    </div>

                    <div className="evento-badge">
                        {evento.tipo === 'admin' ? (
                            <span className="badge-admin">🌍 Evento Global</span>
                        ) : (
                            <span className="badge-fundacion">🏠 Evento de Fundación</span>
                        )}
                    </div>

                    <div className="info-grid">
                        <div className="info-item">
                            <MapPin size={18} className="info-icon" />
                            <div>
                                <strong>Lugar</strong>
                                <p>{evento.lugar_evento}</p>
                            </div>
                        </div>
                        <div className="info-item">
                            <Calendar size={18} className="info-icon" />
                            <div>
                                <strong>Fecha y hora</strong>
                                <p>{new Date(evento.fecha_evento).toLocaleString('es-ES')}</p>
                            </div>
                        </div>
                        {evento.fecha_fin && (
                            <div className="info-item">
                                <Clock size={18} className="info-icon" />
                                <div>
                                    <strong>Fecha de fin</strong>
                                    <p>{new Date(evento.fecha_fin).toLocaleString('es-ES')}</p>
                                </div>
                            </div>
                        )}
                        {evento.costo && (
                            <div className="info-item">
                                <DollarSign size={18} className="info-icon" />
                                <div>
                                    <strong>Costo</strong>
                                    <p>{evento.costo}</p>
                                </div>
                            </div>
                        )}
                        {evento.capacidad_maxima && (
                            <div className="info-item">
                                <Users size={18} className="info-icon" />
                                <div>
                                    <strong>Capacidad máxima</strong>
                                    <p>{evento.capacidad_maxima} personas</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {evento.descripcion && (
                        <div className="description-section">
                            <h3>
                                <FileText size={18} />
                                Descripción
                            </h3>
                            <p>{evento.descripcion}</p>
                        </div>
                    )}

                    {(evento.organizador || evento.telefono_contacto || evento.email_contacto) && (
                        <div className="contact-section">
                            <h3>
                                <Phone size={18} />
                                Contacto
                            </h3>
                            <div className="contact-info">
                                {evento.organizador && <p><strong>Organizador:</strong> {evento.organizador}</p>}
                                {evento.telefono_contacto && <p><strong>Teléfono:</strong> {evento.telefono_contacto}</p>}
                                {evento.email_contacto && <p><strong>Email:</strong> {evento.email_contacto}</p>}
                            </div>
                        </div>
                    )}

                    {evento.tags && evento.tags.length > 0 && (
                        <div className="tags-section">
                            <h3>
                                <Tag size={18} />
                                Etiquetas
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
                            Creado: {new Date(evento.created_at).toLocaleDateString()}
                        </small>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FundacionEventosShow;