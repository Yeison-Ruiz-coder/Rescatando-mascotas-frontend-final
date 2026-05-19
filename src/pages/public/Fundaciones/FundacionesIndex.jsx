// src/pages/public/Fundaciones/FundacionesIndex.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Building } from 'lucide-react';
import api from '../../../services/api';
import FundacionCard from '../../../components/common/FundacionCard/FundacionCard';
import FiltrosFundaciones from '../../../components/common/FiltrosFundaciones/FiltrosFundaciones';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import { useFiltrosFundaciones } from '../../../contexts/FiltrosContext';
import './FundacionesIndex.css';

const FundacionesIndex = () => {
  const { t } = useTranslation('fundaciones');
  const { filtros } = useFiltrosFundaciones();
  const [fundaciones, setFundaciones] = useState([]);
  const [fundacionesFiltradas, setFundacionesFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ciudades, setCiudades] = useState([]);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  useEffect(() => {
    if (fundaciones.length > 0) {
      let resultado = [...fundaciones];

      if (filtros.busqueda && filtros.busqueda.trim()) {
        const busquedaLower = filtros.busqueda.toLowerCase().trim();
        resultado = resultado.filter(f => 
          f.Nombre_1?.toLowerCase().includes(busquedaLower) ||
          f.Descripcion?.toLowerCase().includes(busquedaLower) ||
          f.ciudad?.toLowerCase().includes(busquedaLower)
        );
      }

      if (filtros.ciudad && filtros.ciudad.trim()) {
        resultado = resultado.filter(f => f.ciudad === filtros.ciudad);
      }

      setFundacionesFiltradas(resultado);
    }
  }, [filtros, fundaciones]);

  const extractData = (response) => {
    if (response?.success === true && response?.data) {
      if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
    }
    if (Array.isArray(response)) return response;
    if (response?.data && Array.isArray(response.data)) return response.data;
    if (response?.data?.data && Array.isArray(response.data.data)) return response.data.data;
    return [];
  };

  const getImageUrl = useCallback((url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const baseUrl = import.meta.env.VITE_STORAGE_URL || 'https://rescatando-mascotas-backend-final-production.up.railway.app';
    return url.startsWith('/storage') ? `${baseUrl}${url}` : `${baseUrl}/storage/${url}`;
  }, []);

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
        
        const fundacionesConMascotas = await Promise.all(
          fundacionesData.map(async (fundacion) => {
            try {
              const mascotasRes = await api.get(`/mascotas/fundacion/${fundacion.id}`, {
                signal: abortController.signal
              });
              let mascotasData = extractData(mascotasRes.data);
              return { ...fundacion, total_mascotas: mascotasData.length };
            } catch (error) {
              return { ...fundacion, total_mascotas: 0 };
            }
          })
        );
        
        if (!isMounted) return;
        
        setFundaciones(fundacionesConMascotas);
        setFundacionesFiltradas(fundacionesConMascotas);
        
        const uniqueCiudades = [...new Set(fundacionesConMascotas.map(f => f.ciudad).filter(Boolean))];
        setCiudades(uniqueCiudades);
        
      } catch (error) {
        if (error.name !== 'CanceledError' && error.name !== 'AbortError' && isMounted) {
          setError(error.message || t('error_carga'));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadFundaciones();
    return () => { isMounted = false; abortController.abort(); };
  }, [t]);

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
      <div className="fundaciones-header">
        <div className="container">
          <h1>{t('titulo')}</h1>
          <p className="subtitle">{t('subtitulo')}</p>
          {fundaciones.length > 0 && (
            <p className="info">
              <Heart size={16} style={{ color: 'var(--color-heart)' }} />
              {' '}{t('mensaje_bienvenida', { total: fundaciones.length })}
            </p>
          )}
        </div>
      </div>

      <div className="filtros-section sticky-glass glass-auto shadow-sticky">
        <div className="container">
          <FiltrosFundaciones
            ciudades={ciudades}
            variant={isMobile ? "modal" : "inline"}
          />
        </div>
      </div>

      <div className="resultados-section">
        <div className="container">
          <div className="resultados-header">
            <div className="resultados-count">
              <Heart size={16} />
              <span>
                {t('mostrando')} <strong>{fundacionesFiltradas.length}</strong> {t('de')} <strong>{fundaciones.length}</strong> {t('fundaciones')}
              </span>
            </div>
          </div>

          {fundacionesFiltradas.length === 0 ? (
            <div className="empty-container">
              <Building size={48} />
              <h3>{t('sin_resultados.titulo')}</h3>
              <p>{t('sin_resultados.mensaje')}</p>
            </div>
          ) : (
            <div className="fundaciones-grid">
              {fundacionesFiltradas.map((fundacion) => (
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