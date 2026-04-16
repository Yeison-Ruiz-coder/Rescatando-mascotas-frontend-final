import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Building, MapPin, Phone, Mail, Users, Heart, Search, Filter, Award } from 'lucide-react';
import api from '../../../services/api';
import './Fundaciones.css';

const FundacionesIndex = () => {
    const { t } = useTranslation('fundaciones');
    const [fundaciones, setFundaciones] = useState([]);
    const [filteredFundaciones, setFilteredFundaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCiudad, setSelectedCiudad] = useState('');
    const [ciudades, setCiudades] = useState([]);
    const [error, setError] = useState(null);

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `http://localhost:8000${url}`;
    };

    useEffect(() => {
        loadFundaciones();
    }, []);

    useEffect(() => {
        filterFundaciones();
    }, [searchTerm, selectedCiudad, fundaciones]);

    const loadFundaciones = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('Cargando fundaciones...');
            const response = await api.get('/fundaciones');
            console.log('Respuesta completa:', response);
            console.log('Response data:', response.data);
            
            // ✅ Extraer datos correctamente
            const data = response.data?.data || response.data || [];
            console.log('Datos extraídos:', data);
            
            setFundaciones(data);
            setFilteredFundaciones(data);
            
            // Extraer ciudades únicas para el filtro
            const uniqueCiudades = [...new Set(data.map(f => f.ciudad).filter(Boolean))];
            setCiudades(uniqueCiudades);
            console.log('Ciudades encontradas:', uniqueCiudades);
        } catch (error) {
            console.error('Error al cargar fundaciones:', error);
            setError(error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    const filterFundaciones = () => {
        let filtered = [...fundaciones];
        
        // Filtro por búsqueda (nombre o descripción)
        if (searchTerm) {
            filtered = filtered.filter(f => 
                f.Nombre_1?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                f.Descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        // Filtro por ciudad
        if (selectedCiudad) {
            filtered = filtered.filter(f => f.ciudad === selectedCiudad);
        }
        
        setFilteredFundaciones(filtered);
    };

    const limpiarFiltros = () => {
        setSearchTerm('');
        setSelectedCiudad('');
    };

    if (loading) {
        return (
            <div className="fundaciones-page">
                <div className="fundaciones-loading">
                    <div className="spinner"></div>
                    <p>{t('cargando')}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fundaciones-page">
                <div className="fundaciones-empty">
                    <Building size={48} />
                    <h4>Error al cargar fundaciones</h4>
                    <p>{error}</p>
                    <button onClick={loadFundaciones} className="btn-limpiar-empty">
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fundaciones-page">
            <div className="fundaciones-container">
                <div className="fundaciones-header">
                    <h1>🐾 {t('titulo')}</h1>
                    <p>{t('subtitulo')}</p>
                </div>

                {/* Filtros */}
                <div className="fundaciones-filtros">
                    <div className="search-box">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder={t('buscar_placeholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    {ciudades.length > 0 && (
                        <div className="filter-box">
                            <Filter size={18} />
                            <select value={selectedCiudad} onChange={(e) => setSelectedCiudad(e.target.value)}>
                                <option value="">{t('todas_ciudades')}</option>
                                {ciudades.map(ciudad => (
                                    <option key={ciudad} value={ciudad}>{ciudad}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    
                    {(searchTerm || selectedCiudad) && (
                        <button className="btn-limpiar" onClick={limpiarFiltros}>
                            {t('limpiar_filtros')}
                        </button>
                    )}
                </div>

                {/* Resultados */}
                {filteredFundaciones.length > 0 ? (
                    <>
                        <div className="resultados-count">
                            {t('mostrando')} {filteredFundaciones.length} {t('fundaciones_encontradas')}
                        </div>
                        
                        <div className="fundaciones-grid">
                            {filteredFundaciones.map((fundacion) => (
                                <div key={fundacion.id} className="fundacion-card">
                                    <div className="fundacion-card-header">
                                        <div className="fundacion-icon">
                                            <Building size={32} />
                                        </div>
                                        <h3>{fundacion.Nombre_1}</h3>
                                        {fundacion.verificado && (
                                            <span className="verified-badge">
                                                <Award size={12} /> {t('verificado')}
                                            </span>
                                        )}
                                    </div>

                                    <div className="fundacion-card-body">
                                        <p className="fundacion-descripcion">
                                            {fundacion.Descripcion?.substring(0, 100)}
                                            {fundacion.Descripcion?.length > 100 ? '...' : ''}
                                        </p>

                                        <div className="fundacion-info">
                                            {fundacion.Direccion && (
                                                <div className="info-item">
                                                    <MapPin size={14} />
                                                    <span>{fundacion.Direccion}</span>
                                                </div>
                                            )}
                                            {fundacion.Telefono && (
                                                <div className="info-item">
                                                    <Phone size={14} />
                                                    <span>{fundacion.Telefono}</span>
                                                </div>
                                            )}
                                            {fundacion.Email && (
                                                <div className="info-item">
                                                    <Mail size={14} />
                                                    <span>{fundacion.Email}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="fundacion-stats">
                                            {fundacion.capacidad_maxima && (
                                                <div className="stat">
                                                    <Users size={14} />
                                                    <span>{t('capacidad')}: {fundacion.capacidad_maxima}</span>
                                                </div>
                                            )}
                                            {fundacion.total_mascotas !== undefined && (
                                                <div className="stat">
                                                    <Heart size={14} />
                                                    <span>{t('mascotas_rescatadas')}: {fundacion.total_mascotas}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="fundacion-card-footer">
                                        <Link to={`/fundaciones/${fundacion.id}`} className="btn-ver-fundacion">
                                            {t('ver_mas')} →
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="fundaciones-empty">
                        <Building size={48} />
                        <h4>{t('sin_resultados.titulo')}</h4>
                        <p>{t('sin_resultados.mensaje')}</p>
                        <button onClick={limpiarFiltros} className="btn-limpiar-empty">
                            {t('limpiar_filtros')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FundacionesIndex;