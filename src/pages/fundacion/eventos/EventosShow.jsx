import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, FileText, Clock, Edit, Trash2 } from 'lucide-react';
import api from '../../../services/api';
import './Eventos.css';

const EventosShow = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [evento, setEvento] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEvento();
    }, [id]);

    const loadEvento = async () => {
        try {
            const response = await api.get(`/entity/eventos/${id}`);
            setEvento(response.data.data || response.data);
        } catch (error) {
            console.error('Error:', error);
            navigate('/fundacion/eventos');
        } finally {
            setLoading(false);
        }
    };

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

    if (loading) {
        return (
            <div className="eventos-loading">
                <div className="spinner"></div>
                <p>Cargando evento...</p>
            </div>
        );
    }

    if (!evento) return null;

    return (
        <div className="eventos-show-container">
            <div className="show-card">
                <div className="show-header">
                    <Link to="/fundacion/eventos" className="back-button"><ArrowLeft size={20} /> Volver a eventos</Link>
                    <div className="show-actions">
                        <Link to={`/fundacion/eventos/${id}/editar`} className="btn-edit-show"><Edit size={18} /> Editar</Link>
                        <button onClick={handleDelete} className="btn-delete-show"><Trash2 size={18} /> Eliminar</button>
                    </div>
                </div>

                {evento.imagen_url && <img src={evento.imagen_url} alt={evento.nombre_evento} className="show-image" />}

                <div className="show-content">
                    <h1 className="show-title">{evento.nombre_evento}</h1>
                    <div className="show-info">
                        <div className="info-item"><MapPin size={18} /><strong>Lugar:</strong><span>{evento.lugar_evento}</span></div>
                        <div className="info-item"><Calendar size={18} /><strong>Fecha:</strong><span>{new Date(evento.fecha_evento).toLocaleString('es-ES')}</span></div>
                    </div>
                    <div className="show-description"><h5><FileText size={18} /> Descripción:</h5><p>{evento.descripcion}</p></div>
                    <div className="show-footer"><small><Clock size={14} /> Creado: {new Date(evento.created_at).toLocaleDateString()}</small></div>
                </div>
            </div>
        </div>
    );
};

export default EventosShow;