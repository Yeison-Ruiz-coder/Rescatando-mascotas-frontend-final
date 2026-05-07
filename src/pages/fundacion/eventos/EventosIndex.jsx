// src/pages/fundacion/eventos/EventosIndex.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Calendar, Edit, Trash2, Eye, Loader } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../services/api';
import './EventosIndex.css';

const FundacionEventosIndex = () => {
    const { t } = useTranslation('eventos');
    const { user } = useAuth();
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const getImageUrl = useCallback((url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        const baseUrl = import.meta.env.VITE_STORAGE_URL || 'https://rescatando-mascotas-backend-final-production.up.railway.app';
        return url.startsWith('/storage') ? `${baseUrl}${url}` : `${baseUrl}/storage/${url}`;
    }, []);

    const loadEventos = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/entity/eventos');
            const data = response.data.data || response.data;
            setEventos(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error al cargar eventos:', error);
            setError(error.response?.data?.message || 'Error al cargar los eventos');
            setEventos([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadEventos();
    }, [loadEventos]);

    const handleDelete = async (id) => {
        if (!window.confirm(t('confirmar_eliminar') || '¿Estás seguro de eliminar este evento?')) {
            return;
        }

        setDeletingId(id);
        try {
            await api.delete(`/entity/eventos/${id}`);
            setEventos(prev => prev.filter(evento => evento.id !== id));
        } catch (error) {
            console.error('Error al eliminar:', error);
            alert(error.response?.data?.message || 'Error al eliminar el evento');
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div className="fundacion-eventos-loading">
                <Loader className="spinner" size={40} />
                <p>Cargando eventos...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fundacion-eventos-container">
                <div className="fundacion-eventos-error">
                    <Calendar size={48} />
                    <h4>Error al cargar eventos</h4>
                    <p>{error}</p>
                    <button onClick={loadEventos} className="btn-retry">Reintentar</button>
                </div>
            </div>
        );
    }

    return (
        <div className="fundacion-eventos-container">
            <div className="fundacion-eventos-header">
                <div>
                    <h1>📅 {t('mis_eventos') || 'Mis Eventos'}</h1>
                    <p>{t('gestiona_eventos') || 'Gestiona los eventos de tu fundación'}</p>
                </div>
                <Link to="/fundacion/eventos/crear" className="btn-create-evento">
                    <Plus size={20} />
                    {t('crear_evento') || 'Crear Evento'}
                </Link>
            </div>

            {eventos.length === 0 ? (
                <div className="fundacion-eventos-empty">
                    <Calendar size={64} />
                    <h4>{t('sin_eventos') || 'No tienes eventos creados'}</h4>
                    <p>{t('crea_primer_evento') || 'Crea tu primer evento para compartir con la comunidad'}</p>
                    <Link to="/fundacion/eventos/crear" className="btn-create-first">
                        <Plus size={20} />
                        {t('crear_primer_evento') || 'Crear mi primer evento'}
                    </Link>
                </div>
            ) : (
                <div className="fundacion-eventos-table-container">
                    <table className="fundacion-eventos-table">
                        <thead>
                            <tr>
                                <th>{t('imagen') || 'Imagen'}</th>
                                <th>{t('nombre') || 'Nombre'}</th>
                                <th>{t('lugar') || 'Lugar'}</th>
                                <th>{t('fecha') || 'Fecha'}</th>
                                <th>{t('asistentes') || 'Asistentes'}</th>
                                <th>{t('likes') || 'Likes'}</th>
                                <th>{t('acciones') || 'Acciones'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {eventos.map(evento => (
                                <tr key={evento.id}>
                                    <td className="table-image-cell">
                                        {evento.imagen_url ? (
                                            <img 
                                                src={getImageUrl(evento.imagen_url)} 
                                                alt={evento.nombre_evento}
                                                onError={(e) => { e.target.src = '/placeholder-event.png'; }}
                                            />
                                        ) : (
                                            <div className="table-image-placeholder">
                                                <Calendar size={24} />
                                            </div>
                                        )}
                                    </td>
                                    <td className="table-title-cell">
                                        <strong>{evento.nombre_evento}</strong>
                                        <span className="evento-desc-preview">
                                            {evento.descripcion?.substring(0, 50)}...
                                        </span>
                                    </td>
                                    <td>{evento.lugar_evento}</td>
                                    <td>
                                        {new Date(evento.fecha_evento).toLocaleDateString('es-ES', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </td>
                                    <td className="table-stats-cell">
                                        <span className="stat-badge asistentes">
                                            👥 {evento.total_asistentes || 0}
                                        </span>
                                    </td>
                                    <td className="table-stats-cell">
                                        <span className="stat-badge likes">
                                            ❤️ {evento.likes || 0}
                                        </span>
                                    </td>
                                    <td className="table-actions-cell">
                                        <Link 
                                            to={`/fundacion/eventos/${evento.id}`} 
                                            className="action-btn view-btn"
                                            title="Ver detalles"
                                        >
                                            <Eye size={18} />
                                        </Link>
                                        <Link 
                                            to={`/fundacion/eventos/${evento.id}/editar`} 
                                            className="action-btn edit-btn"
                                            title="Editar"
                                        >
                                            <Edit size={18} />
                                        </Link>
                                        <button 
                                            onClick={() => handleDelete(evento.id)} 
                                            className="action-btn delete-btn"
                                            disabled={deletingId === evento.id}
                                            title="Eliminar"
                                        >
                                            {deletingId === evento.id ? (
                                                <Loader size={18} className="spinner-small" />
                                            ) : (
                                                <Trash2 size={18} />
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default FundacionEventosIndex;