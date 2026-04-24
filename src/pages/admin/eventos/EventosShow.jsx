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
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <div className="spinner mb-4"></div>
                    <p className="text-gray-600">{t('cargando_evento')}</p>
                </div>
            </div>
        );
    }

    if (!evento) return null;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Botón volver */}
            <div className="mb-6">
                <Link 
                    to="/admin/eventos" 
                    className="inline-flex items-center text-purple-600 hover:text-purple-800 transition-colors"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    {t('ver.volver')}
                </Link>
            </div>

            {/* Tarjeta principal */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                {/* Header con acciones */}
                <div className="flex justify-end gap-3 p-4 bg-gray-50 border-b border-gray-200">
                    <Link
                        to={`/admin/eventos/${id}/editar`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Edit size={18} />
                        {t('botones.editar')}
                    </Link>
                    <button
                        onClick={handleDelete}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        <Trash2 size={18} />
                        {t('botones.eliminar')}
                    </button>
                </div>

                {/* Imagen */}
                {evento.imagen_url && (
                    <div className="relative h-96 w-full overflow-hidden bg-gray-100">
                        <img
                            src={getImageUrl(evento.imagen_url)}
                            alt={evento.nombre_evento}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                {/* Contenido */}
                <div className="p-6 md:p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">
                        {evento.nombre_evento}
                    </h1>

                    {/* Información del evento */}
                    <div className="space-y-4 mb-8">
                        <div className="flex items-start gap-3 text-gray-700">
                            <MapPin size={20} className="text-purple-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <span className="font-semibold">{t('ver.lugar')}:</span>
                                <span className="ml-2">{evento.lugar_evento}</span>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 text-gray-700">
                            <Calendar size={20} className="text-purple-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <span className="font-semibold">{t('ver.fecha')}:</span>
                                <span className="ml-2">
                                    {new Date(evento.fecha_evento).toLocaleString('es-ES', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Descripción */}
                    {evento.descripcion && (
                        <div className="mb-8">
                            <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900 mb-3">
                                <FileText size={20} className="text-purple-600" />
                                {t('ver.descripcion')}
                            </h2>
                            <div className="prose max-w-none text-gray-700 leading-relaxed">
                                {evento.descripcion.split('\n').map((paragraph, idx) => (
                                    <p key={idx} className="mb-3">
                                        {paragraph}
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Footer con fecha de creación */}
                    {evento.created_at && (
                        <div className="pt-6 border-t border-gray-200">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Clock size={16} />
                                <span>
                                    {t('ver.creado')}: {new Date(evento.created_at).toLocaleDateString('es-ES', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminEventosShow;