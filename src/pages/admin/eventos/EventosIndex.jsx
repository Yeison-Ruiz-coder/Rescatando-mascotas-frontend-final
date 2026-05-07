// src/pages/admin/eventos/EventosIndex.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Calendar, Eye, Edit, Trash2, Loader, Filter, X, Users, Heart, MapPin, CalendarDays, Building2, Globe, Home, Image, Tag } from 'lucide-react';
import api from '../../../services/api';
import './EventosIndex.css';

const AdminEventosIndex = () => {
    const { t } = useTranslation('eventos');
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [filters, setFilters] = useState({
        tipo: '',
        proximos: false,
        fundacion_id: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const [estadisticas, setEstadisticas] = useState(null);

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
            const params = new URLSearchParams();
            if (filters.tipo) params.append('tipo', filters.tipo);
            if (filters.proximos) params.append('proximos', 'true');
            if (filters.fundacion_id) params.append('fundacion_id', filters.fundacion_id);
            params.append('per_page', 100);

            const response = await api.get(`/admin/eventos?${params.toString()}`);
            
            let eventosData = [];
            let statsData = null;
            
            if (response.data && response.data.success !== undefined) {
                eventosData = response.data.data?.data || response.data.data || [];
                statsData = response.data.estadisticas || null;
            } else if (response.data && response.data.data) {
                eventosData = response.data.data.data || response.data.data;
            } else if (Array.isArray(response.data)) {
                eventosData = response.data;
            } else {
                eventosData = [];
            }
            
            const eventosArray = Array.isArray(eventosData) ? eventosData : 
                                (eventosData?.data ? eventosData.data : []);
            
            setEventos(eventosArray);
            setEstadisticas(statsData);
            
        } catch (error) {
            console.error('Error:', error);
            setError(error.response?.data?.message || 'Error al cargar los eventos');
            setEventos([]);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        loadEventos();
    }, [loadEventos]);

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este evento? Esta acción no se puede deshacer.')) return;

        setDeletingId(id);
        try {
            await api.delete(`/admin/eventos/${id}`);
            setEventos(prev => prev.filter(evento => evento.id !== id));
        } catch (error) {
            console.error('Error:', error);
            alert(error.response?.data?.message || 'Error al eliminar el evento');
        } finally {
            setDeletingId(null);
        }
    };

    const clearFilters = () => {
        setFilters({ tipo: '', proximos: false, fundacion_id: '' });
    };

    if (loading) {
        return (
            <div className="ryg-loading">
                <div className="ryg-spinner"></div>
                <p>Cargando eventos...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="ryg-admin-eventos-wrapper">
                <div className="ryg-vacio">
                    <Calendar size={48} />
                    <h4>Error al cargar eventos</h4>
                    <p>{error}</p>
                    <button onClick={loadEventos} className="ryg-btn-crear" style={{ marginTop: '1rem' }}>Reintentar</button>
                </div>
            </div>
        );
    }

    return (
        <div className="ryg-admin-eventos-wrapper">
            <div className="ryg-admin-header">
                <div>
                    <h1>Gestión de Eventos</h1>
                    <p>Administra todos los eventos del sistema</p>
                </div>
                <Link to="/admin/eventos/crear" className="ryg-btn-crear">
                    <Plus size={18} />
                    Crear Evento
                </Link>
            </div>

            {estadisticas && (
                <div className="ryg-stats-grid">
                    <div className="ryg-stat-card">
                        <div className="ryg-stat-value">{estadisticas.total || 0}</div>
                        <div className="ryg-stat-label">Total Eventos</div>
                    </div>
                    <div className="ryg-stat-card">
                        <div className="ryg-stat-value">{estadisticas.proximos || 0}</div>
                        <div className="ryg-stat-label">Próximos</div>
                    </div>
                    <div className="ryg-stat-card">
                        <div className="ryg-stat-value">{estadisticas.pasados || 0}</div>
                        <div className="ryg-stat-label">Pasados</div>
                    </div>
                    <div className="ryg-stat-card">
                        <div className="ryg-stat-value">{estadisticas.este_mes || 0}</div>
                        <div className="ryg-stat-label">Este Mes</div>
                    </div>
                </div>
            )}

            <div className="ryg-filters-bar">
                <button onClick={() => setShowFilters(!showFilters)} className="ryg-btn-filtros">
                    <Filter size={16} />
                    Filtros
                    {Object.values(filters).some(v => v) && <span className="ryg-filtro-activo" />}
                </button>
                {(filters.tipo || filters.proximos || filters.fundacion_id) && (
                    <button onClick={clearFilters} className="ryg-btn-limpiar">
                        <X size={14} />
                        Limpiar filtros
                    </button>
                )}
            </div>

            {showFilters && (
                <div className="ryg-panel-filtros">
                    <select 
                        value={filters.tipo} 
                        onChange={(e) => setFilters(prev => ({ ...prev, tipo: e.target.value }))}
                    >
                        <option value="">Todos los tipos</option>
                        <option value="admin">Globales</option>
                        <option value="fundacion">De Fundaciones</option>
                    </select>
                    <label className="ryg-checkbox-label">
                        <input 
                            type="checkbox" 
                            checked={filters.proximos} 
                            onChange={(e) => setFilters(prev => ({ ...prev, proximos: e.target.checked }))}
                        />
                        Solo próximos eventos
                    </label>
                </div>
            )}

            {eventos.length === 0 ? (
                <div className="ryg-vacio">
                    <Calendar size={64} />
                    <h4>No hay eventos registrados</h4>
                    <p>Crea el primer evento desde el botón superior</p>
                </div>
            ) : (
                <div className="ryg-tabla-contenedor">
                    <table className="ryg-tabla">
                        <thead>
                            <tr>
                                <th>Imagen</th>
                                <th>Nombre</th>
                                <th>Fundación</th>
                                <th>Tipo</th>
                                <th>Lugar</th>
                                <th>Fecha</th>
                                <th>Asistentes</th>
                                <th>Likes</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {eventos.map(evento => (
                                <tr key={evento.id}>
                                    <td className="ryg-col-imagen">
                                        {evento.imagen_url ? (
                                            <img 
                                                src={getImageUrl(evento.imagen_url)} 
                                                alt={evento.nombre_evento}
                                                onError={(e) => { e.target.src = '/placeholder-event.png'; }}
                                            />
                                        ) : (
                                            <div className="ryg-imagen-placeholder">
                                                <Image size={20} />
                                            </div>
                                        )}
                                    </td>
                                    <td className="ryg-titulo-evento">
                                        <strong>{evento.nombre_evento}</strong>
                                        <span className="ryg-descripcion-corta">
                                            {evento.descripcion?.substring(0, 50)}...
                                        </span>
                                    </td>
                                    <td>{evento.fundacion?.Nombre_1 || evento.fundacion?.nombre || '-'}</td>
                                    <td>
                                        <span className={`ryg-badge ${evento.tipo === 'admin' ? 'ryg-badge-admin' : 'ryg-badge-fundacion'}`}>
                                            {evento.tipo === 'admin' ? <Globe size={12} /> : <Home size={12} />}
                                            <span>{evento.tipo === 'admin' ? 'Global' : 'Fundación'}</span>
                                        </span>
                                    </td>
                                    <td>
                                        <div className="ryg-cell-with-icon">
                                            <MapPin size={14} />
                                            <span>{evento.lugar_evento}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="ryg-cell-with-icon">
                                            <CalendarDays size={14} />
                                            <span>{new Date(evento.fecha_evento).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="ryg-stat-asistentes">
                                            <Users size={12} />
                                            {evento.total_asistentes || 0}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="ryg-stat-likes">
                                            <Heart size={12} />
                                            {evento.likes || 0}
                                        </span>
                                    </td>
                                    <td className="ryg-acciones">
                                        <Link to={`/admin/eventos/${evento.id}`} className="ryg-btn-accion ryg-btn-ver" title="Ver detalles">
                                            <Eye size={16} />
                                        </Link>
                                        <Link to={`/admin/eventos/${evento.id}/editar`} className="ryg-btn-accion ryg-btn-editar" title="Editar evento">
                                            <Edit size={16} />
                                        </Link>
                                        <button onClick={() => handleDelete(evento.id)} className="ryg-btn-accion ryg-btn-eliminar" disabled={deletingId === evento.id} title="Eliminar evento">
                                            {deletingId === evento.id ? <div className="ryg-spinner-small"></div> : <Trash2 size={16} />}
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

export default AdminEventosIndex;