import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
    ArrowLeft, Building, MapPin, Phone, Mail, 
    Clock, Users, Heart, Calendar, FileText, 
    Share2, CheckCircle, Award, PawPrint, 
    ExternalLink, Info, HelpCircle
} from 'lucide-react';
import api from '../../../services/api';
import './Fundaciones.css';

// Componente de mapa simple
const MapaSimple = ({ direccion, nombre }) => {
    const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(direccion)}&output=embed`;
    
    return (
        <div className="mapa-container">
            <iframe
                title={`Mapa de ${nombre}`}
                src={mapUrl}
                width="100%"
                height="300"
                style={{ border: 0, borderRadius: '12px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
            />
        </div>
    );
};

const FundacionDetalle = () => {
    const { id } = useParams();
    const { t } = useTranslation('fundaciones');
    const [fundacion, setFundacion] = useState(null);
    const [mascotas, setMascotas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mostrarMapa, setMostrarMapa] = useState(true);

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `http://localhost:8000${url}`;
    };

    useEffect(() => {
        loadFundacion();
        loadMascotas();
    }, [id]);

    const loadFundacion = async () => {
        try {
            const response = await api.get(`/fundaciones/${id}`);
            setFundacion(response.data.data || response.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMascotas = async () => {
        try {
            const response = await api.get(`/mascotas/fundacion/${id}`);
            setMascotas(response.data.data || response.data);
        } catch (error) {
            console.error('Error al cargar mascotas:', error);
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: fundacion?.Nombre_1,
                text: fundacion?.Descripcion,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert(t('enlace_copiado'));
        }
    };

    if (loading) {
        return (
            <div className="fundaciones-page">
                <div className="fundaciones-loading">
                    <div className="spinner"></div>
                    <p>{t('cargando_detalle')}</p>
                </div>
            </div>
        );
    }

    if (!fundacion) {
        return (
            <div className="fundaciones-page">
                <div className="fundaciones-empty">
                    <Building size={48} />
                    <h4>{t('no_encontrada')}</h4>
                    <Link to="/fundaciones" className="btn-volver">
                        <ArrowLeft size={16} /> {t('volver_lista')}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="fundaciones-page">
            <div className="fundacion-detalle-container">
                <div className="detalle-header">
                    <Link to="/fundaciones" className="btn-volver">
                        <ArrowLeft size={16} /> {t('volver_lista')}
                    </Link>
                    <button onClick={handleShare} className="btn-compartir">
                        <Share2 size={16} /> {t('compartir')}
                    </button>
                </div>

                <div className="detalle-card">
                    {/* Portada */}
                    <div className="detalle-portada">
                        {fundacion.imagen_portada ? (
                            <img src={getImageUrl(fundacion.imagen_portada)} alt={fundacion.Nombre_1} />
                        ) : (
                            <div className="portada-placeholder">
                                <Building size={64} />
                            </div>
                        )}
                    </div>

                    <div className="detalle-contenido">
                        {/* Título y verificación */}
                        <div className="detalle-titulo">
                            <h1>{fundacion.Nombre_1}</h1>
                            {fundacion.verificado && (
                                <span className="verified-badge-large">
                                    <CheckCircle size={20} /> {t('fundacion_verificada')}
                                </span>
                            )}
                        </div>

                        {/* Grid de información */}
                        <div className="detalle-info-grid">
                            <div className="info-seccion">
                                <h3><Building size={18} /> {t('informacion_contacto')}</h3>
                                {fundacion.Direccion && (
                                    <div className="info-item">
                                        <MapPin size={16} />
                                        <div>
                                            <strong>{t('direccion')}:</strong>
                                            <p>{fundacion.Direccion}</p>
                                        </div>
                                    </div>
                                )}
                                {fundacion.Telefono && (
                                    <div className="info-item">
                                        <Phone size={16} />
                                        <div>
                                            <strong>{t('telefono')}:</strong>
                                            <p>{fundacion.Telefono}</p>
                                        </div>
                                    </div>
                                )}
                                {fundacion.Email && (
                                    <div className="info-item">
                                        <Mail size={16} />
                                        <div>
                                            <strong>{t('email')}:</strong>
                                            <p>{fundacion.Email}</p>
                                        </div>
                                    </div>
                                )}
                                {fundacion.horario_atencion && (
                                    <div className="info-item">
                                        <Clock size={16} />
                                        <div>
                                            <strong>{t('horario')}:</strong>
                                            <p>{fundacion.horario_atencion}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="info-seccion">
                                <h3><Heart size={18} /> {t('datos_fundacion')}</h3>
                                {fundacion.registro_sanitario && (
                                    <div className="info-item">
                                        <Award size={16} />
                                        <div>
                                            <strong>{t('registro_sanitario')}:</strong>
                                            <p>{fundacion.registro_sanitario}</p>
                                        </div>
                                    </div>
                                )}
                                {fundacion.capacidad_maxima && (
                                    <div className="info-item">
                                        <Users size={16} />
                                        <div>
                                            <strong>{t('capacidad_maxima')}:</strong>
                                            <p>{fundacion.capacidad_maxima} {t('animales')}</p>
                                        </div>
                                    </div>
                                )}
                                {fundacion.fecha_fundacion && (
                                    <div className="info-item">
                                        <Calendar size={16} />
                                        <div>
                                            <strong>{t('fundada')}:</strong>
                                            <p>{new Date(fundacion.fecha_fundacion).getFullYear()}</p>
                                        </div>
                                    </div>
                                )}
                                {fundacion.recibe_voluntarios !== undefined && (
                                    <div className="info-item">
                                        <HelpCircle size={16} />
                                        <div>
                                            <strong>{t('voluntarios')}:</strong>
                                            <p>{fundacion.recibe_voluntarios ? t('si_recibe') : t('no_recibe')}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Descripción */}
                        {fundacion.Descripcion && (
                            <div className="detalle-descripcion">
                                <h3><FileText size={18} /> {t('descripcion')}</h3>
                                <p>{fundacion.Descripcion}</p>
                            </div>
                        )}

                        {/* Necesidades actuales */}
                        {fundacion.necesidades_actuales && fundacion.necesidades_actuales.length > 0 && (
                            <div className="detalle-necesidades">
                                <h3><Heart size={18} /> {t('necesidades_actuales')}</h3>
                                <div className="necesidades-list">
                                    {fundacion.necesidades_actuales.map((necesidad, index) => (
                                        <span key={index} className="necesidad-tag">{necesidad}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Mapa de ubicación */}
                        {fundacion.Direccion && (
                            <div className="detalle-mapa">
                                <div className="mapa-header">
                                    <h3><MapPin size={18} /> {t('ubicacion')}</h3>
                                    <a 
                                        href={`https://maps.google.com/?q=${encodeURIComponent(fundacion.Direccion)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-mapa-externo"
                                    >
                                        {t('ver_en_maps')} <ExternalLink size={14} />
                                    </a>
                                </div>
                                <MapaSimple direccion={fundacion.Direccion} nombre={fundacion.Nombre_1} />
                            </div>
                        )}

                        {/* Mascotas en adopción */}
                        {mascotas.length > 0 && (
                            <div className="detalle-mascotas">
                                <h3><PawPrint size={18} /> {t('mascotas_en_adopcion')}</h3>
                                <div className="mascotas-preview">
                                    {mascotas.slice(0, 6).map((mascota) => (
                                        <Link key={mascota.id} to={`/mascota/${mascota.id}`} className="mascota-preview-card">
                                            {mascota.foto_principal ? (
                                                <img src={getImageUrl(mascota.foto_principal)} alt={mascota.nombre_mascota} />
                                            ) : (
                                                <div className="mascota-preview-placeholder">
                                                    <Heart size={24} />
                                                </div>
                                            )}
                                            <span>{mascota.nombre_mascota}</span>
                                            <small>{mascota.especie} • {mascota.genero === 'Macho' ? '♂' : '♀'}</small>
                                        </Link>
                                    ))}
                                </div>
                                {mascotas.length > 6 && (
                                    <Link to={`/mascotas?fundacion=${id}`} className="ver-todas-mascotas">
                                        {t('ver_todas_mascotas')} ({mascotas.length})
                                    </Link>
                                )}
                            </div>
                        )}

                        {/* Footer */}
                        <div className="detalle-footer">
                            <small>
                                {t('actualizado')}: {new Date(fundacion.updated_at).toLocaleDateString()}
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FundacionDetalle;