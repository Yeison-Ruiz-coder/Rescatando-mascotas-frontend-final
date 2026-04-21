import React, { useState, useEffect } from 'react';
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
    try {
      const response = await api.get('/fundaciones');
      const data = response.data?.data || response.data || [];
      
      const fundacionesConMascotas = await Promise.all(
        data.map(async (fundacion) => {
          try {
            const mascotasRes = await api.get(`/mascotas/fundacion/${fundacion.id}`);
            const mascotas = mascotasRes.data?.data || mascotasRes.data || [];
            return { ...fundacion, total_mascotas: mascotas.length };
          } catch {
            return { ...fundacion, total_mascotas: 0 };
          }
        })
      );
      
      setFundaciones(fundacionesConMascotas);
      setFilteredFundaciones(fundacionesConMascotas);
      
      const uniqueCiudades = [...new Set(fundacionesConMascotas.map(f => f.ciudad).filter(Boolean))];
      setCiudades(uniqueCiudades);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterFundaciones = () => {
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
  };

  const limpiarFiltros = () => {
    setSearchTerm('');
    setSelectedCiudad('');
  };

  if (loading) {
    return (
      <div className="fundaciones-container">
        <div className="loading-skeleton">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-image"></div>
              <div className="skeleton-content">
                <div className="skeleton-title"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-text short"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="fundaciones-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-badge">Ayuda y Protección Animal</span>
          <h1>{t('titulo') || 'Fundaciones Protectoras'}</h1>
          <p>{t('subtitulo') || 'Conoce las fundaciones que trabajan por el bienestar animal'}</p>
        </div>
      </section>

      {/* Search and Filters */}
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

      {/* Results Count */}
      <div className="results-header">
        <div className="results-count">
          <Heart size={16} />
          <span>{filteredFundaciones.length} {t('fundaciones_encontradas') || 'fundaciones encontradas'}</span>
        </div>
      </div>

      {/* Fundaciones Grid */}
      {filteredFundaciones.length > 0 ? (
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