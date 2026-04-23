import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Heart, Filter, X, Building, MapPin } from 'lucide-react';
import api from '../../../services/api';
import FundacionCard from '../../../components/common/FundacionCard/FundacionCard';
import './Fundaciones.css';

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

  const getImageUrl = useCallback((url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:8000${url}`;
  }, []);

  useEffect(() => {
    const abortController = new AbortController();
    let isMounted = true;
    
    const loadFundaciones = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // ✅ Sin timeout - que cargue lo que el servidor tarde
        const response = await api.get('/fundaciones', {
          signal: abortController.signal
        });
        
        if (!isMounted) return;
        
        const data = response.data?.data || response.data || [];
        
        // ✅ Cargar mascotas sin timeout
        const fundacionesConMascotas = await Promise.all(
          data.map(async (fundacion) => {
            try {
              const mascotasRes = await api.get(`/mascotas/fundacion/${fundacion.id}`, {
                signal: abortController.signal
              });
              const mascotas = mascotasRes.data?.data || mascotasRes.data || [];
              return { ...fundacion, total_mascotas: mascotas.length };
            } catch {
              return { ...fundacion, total_mascotas: 0 };
            }
          })
        );
        
        if (!isMounted) return;
        
        // ✅ Actualizar estados inmediatamente
        setFundaciones(fundacionesConMascotas);
        setFilteredFundaciones(fundacionesConMascotas);
        
        const uniqueCiudades = [...new Set(fundacionesConMascotas.map(f => f.ciudad).filter(Boolean))];
        setCiudades(uniqueCiudades);
        
      } catch (error) {
        if (error.name === 'CanceledError' || error.name === 'AbortError') {
          return;
        }
        
        console.error('Error:', error);
        if (isMounted) {
          setError(error.message || 'Error al cargar las fundaciones');
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
  }, []);

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

  const fundacionesGrid = useMemo(() => {
    if (filteredFundaciones.length === 0) return null;
    
    return filteredFundaciones.map((fundacion) => (
      <FundacionCard
        key={fundacion.id}
        fundacion={fundacion}
        getImageUrl={getImageUrl}
        variant="default"
        showActions={true}
      />
    ));
  }, [filteredFundaciones, getImageUrl]);

  if (loading) {
    return (
      <div className="fundaciones-loading">
        <div className="spinner"></div>
        <p>Cargando fundaciones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fundaciones-container">
        <div className="empty-state">
          <Building size={48} />
          <h4>Error al cargar fundaciones</h4>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn-outline">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fundaciones-container">
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-badge">Ayuda y Protección Animal</span>
          <h1>{t('titulo') || 'Fundaciones Protectoras'}</h1>
          <p>{t('subtitulo') || 'Conoce las fundaciones que trabajan por el bienestar animal'}</p>
        </div>
      </section>

      <section className="search-section">
        <div className="search-card">
          <div className="search-input-wrapper">
            <Search size={20} />
            <input
              type="text"
              placeholder={t('buscar_placeholder') || 'Buscar por nombre, ciudad o descripción...'}
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
              {t('filtros') || 'Filtros'}
            </button>
            
            {(searchTerm || selectedCiudad) && (
              <button className="clear-filters" onClick={limpiarFiltros}>
                <X size={16} />
                {t('limpiar_filtros') || 'Limpiar filtros'}
              </button>
            )}
          </div>
        </div>

        {showFilters && ciudades.length > 0 && (
          <div className="filters-panel">
            <div className="filter-group">
              <label>
                <MapPin size={16} />
                {t('ciudad') || 'Ciudad'}
              </label>
              <select value={selectedCiudad} onChange={(e) => setSelectedCiudad(e.target.value)}>
                <option value="">{t('todas_ciudades') || 'Todas las ciudades'}</option>
                {ciudades.map(ciudad => (
                  <option key={ciudad} value={ciudad}>{ciudad}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </section>

      <div className="results-header">
        <div className="results-count">
          <Heart size={16} />
          <span>{filteredFundaciones.length} {t('fundaciones_encontradas') || 'fundaciones encontradas'}</span>
        </div>
      </div>

      {filteredFundaciones.length > 0 ? (
        <div className="fundaciones-grid">
          {fundacionesGrid}
        </div>
      ) : (
        <div className="empty-state">
          <Building size={48} />
          <h4>{t('sin_resultados.titulo') || 'No se encontraron fundaciones'}</h4>
          <p>{t('sin_resultados.mensaje') || 'Intenta con otros términos de búsqueda'}</p>
          <button onClick={limpiarFiltros} className="btn-outline">
            {t('limpiar_filtros') || 'Limpiar filtros'}
          </button>
        </div>
      )}
    </div>
  );
};

export default FundacionesIndex;