// src/pages/admin/eventos/EventosShow.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, FileText, Clock, Heart, Users, Edit, Trash2, Loader, DollarSign, Building2 } from 'lucide-react';
import api from '../../../services/api';
import './EventosShow.css';

const AdminEventosShow = () => {
    const { id } = useParams();
    const navigate = useNavigate();
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
                setError(error.response?.data?.message || 'Error al cargar el evento');
            } finally {
                setLoading(false);
            }
        };
        loadEvento();
    }, [id]);

    const handleDelete = async () => {
        if (!window.confirm('¿Eliminar este evento permanentemente?')) return;
        setDeleting(true);
        try {
            await api.delete(`/admin/eventos/${id}`);
            navigate('/admin/eventos');
        } catch (error) {
            alert(error.response?.data?.message || 'Error al eliminar');
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-eventos-show-loading">
                <Loader size={40} className="spinner" />
                <p>Cargando...</p>
            </div>
        );
    }

    if (error || !evento) {
        return (
            <div className="admin-eventos-show-container">
                <div className="error-container">
                    <Calendar size={48} />
                    <h4>Error al cargar el evento</h4>
                    <p>{error}</p>
                    <Link to="/admin/eventos" className="btn-back">Volver</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-eventos-show-container">
            <div className="eventos-show-actions-bar">
                <Link to="/admin/eventos" className="btn-back">
                    <ArrowLeft size={18} /> Volver a eventos
                </Link>
                <div className="show-actions">
                    <Link to={`/admin/eventos/${id}/editar`} className="btn-edit">
                        <Edit size={18} /> Editar
                    </Link>
                    <button onClick={handleDelete} className="btn-delete" disabled={deleting}>
                        {deleting ? <Loader size={18} className="spinner-small" /> : <Trash2 size={18} />} Eliminar
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
                            <span className="stat"><Heart size={16} /> {evento.likes || 0}</span>
                            <span className="stat"><Users size={16} /> {evento.total_asistentes || 0}</span>
                        </div>
                    </div>

                    <div className="evento-badge">
                        {evento.tipo === 'admin' ? (
                            <span className="badge-admin">🌍 Evento Global</span>
                        ) : (
                            <span className="badge-fundacion">
                                <Building2 size={14} /> {evento.fundacion?.Nombre_1 || 'Fundación'}
                            </span>
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
                                <strong>Fecha</strong>
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
                                    <strong>Capacidad</strong>
                                    <p>{evento.capacidad_maxima} personas</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {evento.descripcion && (
                        <div className="description-section">
                            <h3><FileText size={18} /> Descripción</h3>
                            <p>{evento.descripcion}</p>
                        </div>
                    )}

                    {evento.organizador && (
                        <div className="contact-section">
                            <p><strong>Organizador:</strong> {evento.organizador}</p>
                            {evento.telefono_contacto && <p><strong>Teléfono:</strong> {evento.telefono_contacto}</p>}
                            {evento.email_contacto && <p><strong>Email:</strong> {evento.email_contacto}</p>}
                        </div>
                    )}

                    {evento.tags && evento.tags.length > 0 && (
                        <div className="tags-section">
                            <h3>🏷️ Etiquetas</h3>
                            <div className="tags-list">
                                {(Array.isArray(evento.tags) ? evento.tags : JSON.parse(evento.tags)).map((tag, idx) => (
                                    <span key={idx} className="tag">#{tag}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="show-footer">
                        <small><Clock size={14} /> Creado: {new Date(evento.created_at).toLocaleDateString()}</small>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminEventosShow;