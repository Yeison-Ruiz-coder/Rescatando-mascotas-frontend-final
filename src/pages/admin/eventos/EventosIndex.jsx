import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2, MapPin, Calendar, AlertCircle } from 'lucide-react';
import api from '../../../services/api';
import './Eventos.css';

const AdminEventosIndex = () => {
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    // ✅ Función para obtener la URL completa de la imagen
    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `http://localhost:8000${url}`;
    };

    useEffect(() => {
        loadEventos();
    }, []);

    const loadEventos = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/eventos');
            setEventos(response.data.data || response.data);
        } catch (error) {
            console.error('Error:', error);
            setAlertMessage('Error al cargar los eventos');
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este evento global?')) {
            try {
                await api.delete(`/admin/eventos/${id}`);
                setAlertMessage('Evento eliminado correctamente');
                setShowAlert(true);
                loadEventos();
                setTimeout(() => setShowAlert(false), 3000);
            } catch (error) {
                console.error('Error:', error);
                alert('Error al eliminar el evento');
            }
        }
    };

    if (loading) {
        return (
            <div className="eventos-loading">
                <div className="spinner"></div>
                <p>Cargando eventos globales...</p>
            </div>
        );
    }

    return (
        <div className="eventos-container">
            {showAlert && (
                <div className="alert-success">
                    {alertMessage}
                    <button className="btn-close" onClick={() => setShowAlert(false)}>×</button>
                </div>
            )}

            <div className="eventos-header">
                <div>
                    <h1 className="eventos-title">Eventos Globales</h1>
                    <p className="eventos-subtitle">Administra todos los eventos del sistema</p>
                </div>
                <Link to="/admin/eventos/crear" className="btn-primary">
                    <Plus size={18} />
                    Crear Evento Global
                </Link>
            </div>

            {eventos.length > 0 ? (
                <div className="eventos-grid">
                    {eventos.map((evento) => (
                        <div key={evento.id} className="evento-card">
                            {/* ✅ IMAGEN CORREGIDA */}
                            {evento.imagen_url ? (
                                <img 
                                    src={getImageUrl(evento.imagen_url)} 
                                    alt={evento.nombre_evento} 
                                    className="evento-card-img"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                            ) : null}
                            {!evento.imagen_url && (
                                <div className="evento-card-placeholder admin-placeholder">
                                    <Calendar size={48} />
                                    <span>Evento Global</span>
                                </div>
                            )}

                            <div className="evento-card-body">
                                <h5 className="evento-card-title">{evento.nombre_evento}</h5>
                                <p className="evento-card-text">{evento.descripcion?.substring(0, 100)}...</p>

                                <div className="evento-card-info">
                                    <div className="info-item">
                                        <MapPin size={14} />
                                        <span>{evento.lugar_evento}</span>
                                    </div>
                                    <div className="info-item">
                                        <Calendar size={14} />
                                        <span className="evento-date">
                                            {new Date(evento.fecha_evento).toLocaleDateString('es-ES')}
                                        </span>
                                    </div>
                                </div>

                                <div className="evento-card-actions">
                                    <Link to={`/admin/eventos/${evento.id}`} className="btn-icon btn-view" title="Ver detalles">
                                        <Eye size={16} />
                                    </Link>
                                    <Link to={`/admin/eventos/${evento.id}/editar`} className="btn-icon btn-edit" title="Editar evento">
                                        <Edit size={16} />
                                    </Link>
                                    <button onClick={() => handleDelete(evento.id)} className="btn-icon btn-delete" title="Eliminar evento">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="eventos-empty">
                    <AlertCircle size={48} />
                    <h4>No hay eventos globales</h4>
                    <p>Crea el primer evento para todo el sistema</p>
                    <Link to="/admin/eventos/crear" className="btn-primary">Crear Evento Global</Link>
                </div>
            )}
        </div>
    );
};

export default AdminEventosIndex;