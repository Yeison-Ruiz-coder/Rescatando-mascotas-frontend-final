import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Filter, X, MapPin, Phone, Star, Clock, Shield, Ambulance } from 'lucide-react';
import api from '../../../services/api';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import './Veterinarias.css';

const Veterinarias = () => {
  const { t } = useTranslation('veterinarias');
  const [veterinarias, setVeterinarias] = useState([]);
  const [filteredVeterinarias, setFilteredVeterinarias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    urgencias: false,
    verificado: false
  });

  // Función para extraer datos de la respuesta
  const extractData = (response) => {
    if (response?.success === true && response?.data) {
      if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      if (typeof response.data === 'object' && response.data.id) {
        return [response.data];
      }
    }
    if (Array.isArray(response)) return response;
    if (response?.data && Array.isArray(response.data)) return response.data;
    if (response?.data?.data && Array.isArray(response.data.data)) return response.data.data;
    return [];
  };

  useEffect(() => {
    const loadVeterinarias = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const params = {};
        if (filters.urgencias) params.urgencias = true;
        if (filters.verificado) params.verificado = true;
        
        const response = await api.get('/veterinarias', { params });
        
        let data = extractData(response.data);
        
        setVeterinarias(data);
        setFilteredVeterinarias(data);
      } catch (err) {
        console.error('Error cargando veterinarias:', err);
        setError(err.response?.data?.message || t('error_carga'));
        setVeterinarias([]);
        setFilteredVeterinarias([]);
      } finally {
        setLoading(false);
      }
    };

    loadVeterinarias();
  }, [filters, t]);

  // Filtrar por búsqueda
  useEffect(() => {
    let filtered = [...veterinarias];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.Nombre_vet?.toLowerCase().includes(term) ||
        item.ciudad?.toLowerCase().includes(term) ||
        item.Direccion?.toLowerCase().includes(term) ||
        item.descripcion?.toLowerCase().includes(term)
      );
    }
    
    setFilteredVeterinarias(filtered);
  }, [searchTerm, veterinarias]);

  const limpiarFiltros = () => {
    setSearchTerm('');
    setFilters({ urgencias: false, verificado: false });
    setShowFilters(false);
  };

  const getServiciosList = (veterinaria) => {
    if (veterinaria.servicios) {
      if (typeof veterinaria.servicios === 'string') {
        try {
          return JSON.parse(veterinaria.servicios);
        } catch {
          return [];
        }
      }
      if (Array.isArray(veterinaria.servicios)) {
        return veterinaria.servicios;
      }
    }
    return [];
  };

  if (loading) {
    return (
      <div className="veterinarias-page">
        <div className="loading-container">
          <LoadingSpinner text={t('cargando')} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="veterinarias-page">
        <div className="container">
          <div className="error-container">
            <MapPin size={48} />
            <h2>{t('error_carga')}</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="reload-btn">
              {t('reintentar')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="veterinarias-page">
      {/* Header */}
      <div className="veterinarias-header">
        <div className="container">
          <h1>{t('titulo') || 'Veterinarias Confiables'}</h1>
          <p className="subtitle">{t('subtitulo') || 'Encuentra la clínica ideal para el cuidado de tu mascota'}</p>
          {veterinarias.length > 0 && (
            <p className="info">
              <Star size={16} style={{ color: '#fbbf24' }} />
              {' '}{t('mensaje_bienvenida', { total: veterinarias.length })}
            </p>
          )}
        </div>
      </div>

      {/* Filtros section */}
      <div className="filtros-section sticky-glass glass-auto shadow-sticky">
        <div className="container">
          <div className="filtros-wrapper">
            <div className="search-input-wrapper">
              <Search size={20} />
              <input
                type="text"
                placeholder={t('buscar_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="filter-actions">
              <button 
                className={`filter-toggle ${showFilters ? 'active' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={18} />
                {t('filtros')}
              </button>
              
              {(searchTerm || filters.urgencias || filters.verificado) && (
                <button className="clear-filters" onClick={limpiarFiltros}>
                  <X size={16} />
                  {t('limpiar_filtros')}
                </button>
              )}
            </div>
          </div>

          {showFilters && (
            <div className="filters-panel">
              <div className="filter-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={filters.urgencias}
                    onChange={(e) => setFilters(prev => ({ ...prev, urgencias: e.target.checked }))}
                  />
                  <Ambulance size={16} />
                  <span>{t('solo_urgencias')}</span>
                </label>
              </div>
              <div className="filter-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={filters.verificado}
                    onChange={(e) => setFilters(prev => ({ ...prev, verificado: e.target.checked }))}
                  />
                  <Shield size={16} />
                  <span>{t('solo_verificadas')}</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Resultados section */}
      <div className="resultados-section">
        <div className="container">
          <div className="resultados-header">
            <div className="resultados-count">
              <Star size={16} />
              <span>
                {t('mostrando')} <strong>{filteredVeterinarias.length}</strong> {t('de')} <strong>{veterinarias.length}</strong> {t('veterinarias')}
              </span>
            </div>
          </div>

          {filteredVeterinarias.length === 0 ? (
            <div className="empty-container">
              <MapPin size={48} />
              <h3>{t('sin_resultados.titulo')}</h3>
              <p>{t('sin_resultados.mensaje')}</p>
              <button onClick={limpiarFiltros} className="btn-outline-global">
                {t('limpiar_filtros')}
              </button>
            </div>
          ) : (
            <div className="veterinarias-grid">
              {filteredVeterinarias.map((veterinaria) => {
                const servicios = getServiciosList(veterinaria);
                const serviciosMostrar = servicios.slice(0, 3);
                
                return (
                  <article key={veterinaria.id} className="veterinaria-card">
                    <div className="card-header">
                      <div>
                        <h2>{veterinaria.Nombre_vet}</h2>
                        <span className="ciudad">
                          <MapPin size={14} />
                          {veterinaria.ciudad || veterinaria.Direccion?.split(',')[0] || t('ubicacion_no_especificada')}
                        </span>
                      </div>
                      <div className="card-badges">
                        {veterinaria.verificado && (
                          <span className="verified-badge" title={t('verificado')}>
                            <Shield size={16} />
                          </span>
                        )}
                        {veterinaria.urgencias_24h && (
                          <span className="urgencia-badge" title={t('urgencias_24h')}>
                            <Ambulance size={16} />
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="descripcion">{veterinaria.descripcion || t('sin_descripcion')}</p>
                    
                    {serviciosMostrar.length > 0 && (
                      <div className="servicios">
                        {serviciosMostrar.map((servicio, idx) => (
                          <span key={idx} className="servicio-tag">{servicio}</span>
                        ))}
                        {servicios.length > 3 && (
                          <span className="servicio-mas">+{servicios.length - 3}</span>
                        )}
                      </div>
                    )}
                    
                    <div className="card-footer">
                      <div className="footer-item">
                        <Phone size={14} />
                        <span>{veterinaria.Telefono || t('no_disponible')}</span>
                      </div>
                      <div className="footer-item">
                        <MapPin size={14} />
                        <span>{veterinaria.Direccion || t('no_disponible')}</span>
                      </div>
                      {veterinaria.horario_atencion && (
                        <div className="footer-item">
                          <Clock size={14} />
                          <span>{veterinaria.horario_atencion}</span>
                        </div>
                      )}
                    </div>
                    
                    <Link to={`/veterinarias/${veterinaria.id}`} className="card-detail-link">
                      {t('ver_detalles')} →
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Veterinarias;