import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Heart, Filter, X, Building, MapPin } from 'lucide-react';
import api from '../../../services/api';
import FundacionCard from '../../../components/common/FundacionCard/FundacionCard';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
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
    if (url.startsWith('/storage')) return `http://localhost:8000${url}`;
    return `http://localhost:8000/storage/${url}`;
  }, []);

  // Función para extraer datos de la respuesta del backend
  const extractData = useCallback((response) => {
    // Si es array directo
    if (Array.isArray(response)) return response;
    
    // Si tiene estructura de ApiResponses con data
    if (response?.data && Array.isArray(response.data)) return response.data;
    
    // Si tiene estructura de paginación de Laravel
    if (response?.data?.data && Array.isArray(response.data.data)) return response.data.data;
    
    // Si tiene estructura anidada
    if (response?.data?.data?.data && Array.isArray(response.data.data.data)) return response.data.data.data;
    
    // Si es un objeto vacío o no tiene array, retornar array vacío
    console.warn('Estructura de respuesta inesperada:', response);
    return [];
  }, []);

  useEffect(() => {
    const abortController = new AbortController();
    let isMounted = true;
    
    const loadFundaciones = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Cargar fundaciones
        const response = await api.get('/fundaciones', {
          signal: abortController.signal
        });
        
        if (!isMounted) return;
        
        // ✅ Extraer datos correctamente (maneja cualquier estructura)
        let fundacionesData = extractData(response.data);
        
        console.log('Fundaciones extraídas:', fundacionesData); // Debug
        
        // Si no hay datos, intentar con response.data directamente
        if (fundacionesData.length === 0 && response.data) {
          if (Array.isArray(response.data)) {
            fundacionesData = response.data;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            fundacionesData = response.data.data;
          } else if (response.data.fundaciones && Array.isArray(response.data.fundaciones)) {
            fundacionesData = response.data.fundaciones;
          }
        }
        
        if (!isMounted) return;
        
        // Cargar mascotas para cada fundación (sin errores)
        const fundacionesConMascotas = await Promise.all(
          fundacionesData.map(async (fundacion) => {
            try {
              const mascotasRes = await api.get(`/mascotas/fundacion/${fundacion.id}`, {
                signal: abortController.signal
              });
              // Extraer mascotas de la respuesta
              let mascotas = [];
              if (Array.isArray(mascotasRes.data)) {
                mascotas = mascotasRes.data;
              } else if (mascotasRes.data?.data && Array.isArray(mascotasRes.data.data)) {
                mascotas = mascotasRes.data.data;
              } else if (mascotasRes.data?.mascotas && Array.isArray(mascotasRes.data.mascotas)) {
                mascotas = mascotasRes.data.mascotas;
              }
              return { ...fundacion, total_mascotas: mascotas.length };
            } catch (error) {
              console.warn(`Error cargando mascotas para fundación ${fundacion.id}:`, error);
              return { ...fundacion, total_mascotas: 0 };
            }
          })
        );
        
        if (!isMounted) return;
        
        // Actualizar estados
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
  }, [extractData]);

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
        <LoadingSpinner />
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