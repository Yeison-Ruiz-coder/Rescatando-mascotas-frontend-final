import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, MapPin, Calendar, FileText, Clock, Edit, Trash2 } from 'lucide-react';
import api from '../../../services/api';
import './Eventos.css';

const AdminEventosShow = () => {
    const { t } = useTranslation('eventos');
    const { id } = useParams();
    const navigate = useNavigate();
    const [evento, setEvento] = useState(null);
    const [loading, setLoading] = useState(true);

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `http://localhost:8000${url}`;
    };

    useEffect(() => {
        loadEvento();
    }, [id]);

    const loadEvento = async () => {
        try {
            const response = await api.get(`/admin/eventos/${id}`);
            setEvento(response.data.data || response.data);
        } catch (error) {
            console.error('Error:', error);
            navigate('/admin/eventos');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm(t('mensajes.confirmar_eliminar'))) {
            try {
                await api.delete(`/admin/eventos/${id}`);
                navigate('/admin/eventos');
            } catch (error) {
                console.error('Error:', error);
                alert(t('mensajes.error_eliminar'));
            }
        }
    };

    if (loading) {
        return (
            <div className="eventos-loading">
                <div className="spinner"></div>
                <p>{t('cargando_evento')}</p>
            </div>
        );
    }

    if (!evento) return null;

    return (
        <div className="eventos-show-container">
            <div className="show-card">
                <div className="show-header">
                    <Link to="/admin/eventos" className="back-button">
                        <ArrowLeft size={20} /> {t('ver.volver')}
                    </Link>
                    <div className="show-actions">
                        <Link to={`/admin/eventos/${id}/editar`} className="btn-edit-show">
                            <Edit size={18} /> {t('botones.editar')}
                        </Link>
                        <button onClick={handleDelete} className="btn-delete-show">
                            <Trash2 size={18} /> {t('botones.eliminar')}
                        </button>
                    </div>
                </div>

                {evento.imagen_url && (
                    <img 
                        src={getImageUrl(evento.imagen_url)} 
                        alt={evento.nombre_evento} 
                        className="show-image" 
                    />
                )}

                <div className="show-content">
                    <h1 className="show-title">{evento.nombre_evento}</h1>
                    <div className="show-info">
                        <div className="info-item">
                            <MapPin size={18} />
                            <strong>{t('ver.lugar')}:</strong>
                            <span>{evento.lugar_evento}</span>
                        </div>
                        <div className="info-item">
                            <Calendar size={18} />
                            <strong>{t('ver.fecha')}:</strong>
                            <span>{new Date(evento.fecha_evento).toLocaleString('es-ES')}</span>
                        </div>
                    </div>
                    <div className="show-description">
                        <h5><FileText size={18} /> {t('ver.descripcion')}:</h5>
                        <p>{evento.descripcion}</p>
                    </div>
                    <div className="show-footer">
                        <small>
                            <Clock size={14} /> {t('ver.creado')}: {new Date(evento.created_at).toLocaleDateString()}
                        </small>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminEventosShow;