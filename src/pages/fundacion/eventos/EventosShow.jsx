import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, FileText, Clock, Edit, Trash2 } from 'lucide-react';
import api from '../../../services/api';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import './Eventos.css';

const EventosShow = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [evento, setEvento] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ✅ Función para obtener la URL completa de la imagen
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
                const response = await api.get(`/entity/eventos/${id}`, {
                    signal: abortController.signal
                });
                
                if (!isMounted) return;
                
                const data = response.data.data || response.data;
                setEvento(data);
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

    const handleDelete = async () => {
        if (window.confirm('¿Estás seguro de eliminar este evento?')) {
            try {
                await api.delete(`/entity/eventos/${id}`);
                navigate('/fundacion/eventos');
            } catch (error) {
                console.error('Error:', error);
                alert('Error al eliminar el evento');
            }
        }
    };

    // ✅ Usar LoadingSpinner
    if (loading) {
        return (
            <div className="eventos-loading">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="eventos-show-container">
                <div className="show-card">
                    <div className="show-content">
                        <div className="eventos-empty">
                            <FileText size={48} />
                            <h4>Error al cargar el evento</h4>
                            <p>{error}</p>
                            <Link to="/fundacion/eventos" className="btn-primary">Volver a eventos</Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!evento) return null;

    return (
        <div className="eventos-show-container">
            <div className="show-card">
                <div className="show-header">
                    <Link to="/fundacion/eventos" className="back-button">
                        <ArrowLeft size={20} /> Volver a eventos
                    </Link>
                    <div className="show-actions">
                        <Link to={`/fundacion/eventos/${id}/editar`} className="btn-edit-show">
                            <Edit size={18} /> Editar
                        </Link>
                        <button onClick={handleDelete} className="btn-delete-show">
                            <Trash2 size={18} /> Eliminar
                        </button>
                    </div>
                </div>

                {/* ✅ IMAGEN CORREGIDA */}
                {evento.imagen_url && (
                    <img 
                        src={getImageUrl(evento.imagen_url)} 
                        alt={evento.nombre_evento} 
                        className="show-image"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/800x400/667eea/FFFFFF?text=Evento';
                        }}
                    />
                )}

                <div className="show-content">
                    <h1 className="show-title">{evento.nombre_evento}</h1>
                    
                    <div className="show-info">
                        <div className="info-item">
                            <MapPin size={18} />
                            <strong>Lugar:</strong>
                            <span>{evento.lugar_evento}</span>
                        </div>
                        <div className="info-item">
                            <Calendar size={18} />
                            <strong>Fecha:</strong>
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

                    <div className="show-description">
                        <h5><FileText size={18} /> Descripción:</h5>
                        <p>{evento.descripcion}</p>
                    </div>

                    <div className="show-footer">
                        <small><Clock size={14} /> Creado: {new Date(evento.created_at).toLocaleDateString()}</small>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventosShow;