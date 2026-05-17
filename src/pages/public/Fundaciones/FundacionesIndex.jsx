import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Heart, Filter, X, Building, MapPin } from 'lucide-react';
import api from '../../../services/api';
import FundacionCard from '../../../components/common/FundacionCard/FundacionCard';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import './FundacionesIndex.css';

const FundacionesIndex = () => {
  const { t } = useTranslation('fundaciones');
  const [fundaciones, setFundaciones] = useState([]);
  const [filteredFundaciones, setFilteredFundaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCiudad, setSelectedCiudad] = useState('');
  const [ciudades, setCiudades] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const getImageUrl = useCallback((url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/storage')) return `http://localhost:8000${url}`;
    return `http://localhost:8000/storage/${url}`;
  }, []);

  // Detectar móvil
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Función para extraer datos del ApiResponses
  const extractData = (response) => {
    // Formato ApiResponses: { success: true, data: {...}, message: "..." }
    if (response?.success === true && response?.data) {
      // Si data tiene paginación de Laravel
      if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      // Si data es un array directo
      if (Array.isArray(response.data)) {
        return response.data;
      }
      // Si data es un objeto único
      if (typeof response.data === 'object' && response.data.id) {
        return [response.data];
      }
    }
    
    // Array directo
    if (Array.isArray(response)) return response;
    
    // data directo como array
    if (response?.data && Array.isArray(response.data)) return response.data;
    
    // data.data array (paginación)
    if (response?.data?.data && Array.isArray(response.data.data)) return response.data.data;
    
    return [];
  };

  useEffect(() => {
    const abortController = new AbortController();
    let isMounted = true;
    
    const loadFundaciones = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await api.get('/fundaciones', {
          signal: abortController.signal
        });
        
        if (!isMounted) return;
        
        let fundacionesData = extractData(response.data);
        
        console.log('Fundaciones cargadas:', fundacionesData);
        
        if (!isMounted) return;
        
        // Cargar conteo de mascotas para cada fundación
        const fundacionesConMascotas = await Promise.all(
          fundacionesData.map(async (fundacion) => {
            try {
              const mascotasRes = await api.get(`/mascotas/fundacion/${fundacion.id}`, {
                signal: abortController.signal
              });
              let mascotasData = extractData(mascotasRes.data);
              return { ...fundacion, total_mascotas: mascotasData.length };
            } catch (error) {
              console.warn(`Error cargando mascotas para fundación ${fundacion.id}:`, error);
              return { ...fundacion, total_mascotas: 0 };
            }
          })
        );
        
        if (!isMounted) return;
        
        setFundaciones(fundacionesConMascotas);
        setFilteredFundaciones(fundacionesConMascotas);
        
        // Extraer ciudades únicas
        const uniqueCiudades = [...new Set(fundacionesConMascotas.map(f => f.ciudad).filter(Boolean))];
        setCiudades(uniqueCiudades);
        
      } catch (error) {
        if (error.name === 'CanceledError' || error.name === 'AbortError') {
          console.log('Petición cancelada');
          return;
        }
        
        console.error('Error al cargar fundaciones:', error);
        if (isMounted) {
          setError(error.message || t('error_carga'));
          setFundaciones([]);
          setFilteredFundaciones([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadFundaciones();
    
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [t]);

  // Filtrar fundaciones
  const filterFundaciones = useCallback(() => {
    let filtered = [...fundaciones];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(f => 
        f.Nombre_1?.toLowerCase().includes(term) ||
        f.Descripcion?.toLowerCase().includes(term) ||
        f.ciudad?.toLowerCase().includes(term)
      );
    }
    
    if (selectedCiudad) {
      filtered = filtered.filter(f => f.ciudad === selectedCiudad);
    }
    
    setFilteredFundaciones(filtered);
  }, [fundaciones, searchTerm, selectedCiudad]);

  useEffect(() => {
    filterFundaciones();
  }, [searchTerm, selectedCiudad, fundaciones, filterFundaciones]);

  const limpiarFiltros = useCallback(() => {
    setSearchTerm('');
    setSelectedCiudad('');
  }, []);

  if (loading) {
    return (
      <div className="fundaciones-page">
        <div className="loading-container">
          <LoadingSpinner text={t('cargando')} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fundaciones-page">
        <div className="container">
          <div className="error-container">
            <Building size={48} />
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
    <div className="fundaciones-page">
      {/* Header similar a Mascotas */}
      <div className="fundaciones-header">
        <div className="container">
          <h1>{t('titulo') || 'Fundaciones Protectoras'}</h1>
          <p className="subtitle">{t('subtitulo') || 'Conoce las fundaciones que trabajan por el bienestar animal'}</p>
          {fundaciones.length > 0 && (
            <p className="info">
              <Heart size={16} style={{ color: 'var(--color-heart)' }} />
              {' '}{t('mensaje_bienvenida', { total: fundaciones.length })}
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
              {ciudades.length > 0 && (
                <button 
                  className={`filter-toggle ${showFilters ? 'active' : ''}`}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter size={18} />
                  {t('filtros')}
                </button>
              )}
              
              {(searchTerm || selectedCiudad) && (
                <button className="clear-filters" onClick={limpiarFiltros}>
                  <X size={16} />
                  {t('limpiar_filtros')}
                </button>
              )}
            </div>
          </div>

          {showFilters && ciudades.length > 0 && (
            <div className="filters-panel">
              <div className="filter-group">
                <label>
                  <MapPin size={16} />
                  {t('ciudad')}
                </label>
                <select value={selectedCiudad} onChange={(e) => setSelectedCiudad(e.target.value)}>
                  <option value="">{t('todas_ciudades')}</option>
                  {ciudades.map(ciudad => (
                    <option key={ciudad} value={ciudad}>{ciudad}</option>
                  ))}
                </select>
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
              <Heart size={16} />
              <span>
                {t('mostrando')} <strong>{filteredFundaciones.length}</strong> {t('de')} <strong>{fundaciones.length}</strong> {t('fundaciones')}
              </span>
            </div>
          </div>

          {filteredFundaciones.length === 0 ? (
            <div className="empty-container">
              <Building size={48} />
              <h3>{t('sin_resultados.titulo')}</h3>
              <p>{t('sin_resultados.mensaje')}</p>
              <button onClick={limpiarFiltros} className="btn-outline-global">
                {t('limpiar_filtros')}
              </button>
            </div>
          ) : (
            <div className="fundaciones-grid">
              {filteredFundaciones.map((fundacion) => (
                <FundacionCard
                  key={fundacion.id}
                  fundacion={fundacion}
                  getImageUrl={getImageUrl}
                  variant="default"
                  showActions={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FundacionesIndex;