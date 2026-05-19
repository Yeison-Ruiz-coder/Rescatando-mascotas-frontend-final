// src/pages/public/Veterinarias/Veterinarias.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, MapPin } from 'lucide-react';
import { useFiltrosVeterinarias } from '../../../contexts/FiltrosContext';
import api from '../../../services/api';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import FiltrosFundaciones from '../../../components/common/FiltrosFundaciones/FiltrosFundaciones';
import VeterinariaCard from '../../../components/common/VeterinariaCard/VeterinariaCard';
import './Veterinarias.css';

const Veterinarias = () => {
  const { t } = useTranslation('veterinarias');
  const { filtros } = useFiltrosVeterinarias();
  const [veterinarias, setVeterinarias] = useState([]);
  const [filteredVeterinarias, setFilteredVeterinarias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ciudades, setCiudades] = useState([]);
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
    if (veterinarias.length > 0) {
      let resultado = [...veterinarias];

      if (filtros.busqueda && filtros.busqueda.trim()) {
        const busquedaLower = filtros.busqueda.toLowerCase().trim();
        resultado = resultado.filter(v =>
          v.Nombre_vet?.toLowerCase().includes(busquedaLower) ||
          v.ciudad?.toLowerCase().includes(busquedaLower)
        );
      }

      if (filtros.ciudad && filtros.ciudad.trim()) {
        resultado = resultado.filter(v => v.ciudad === filtros.ciudad);
      }

      setFilteredVeterinarias(resultado);
    }
  }, [filtros, veterinarias]);

  useEffect(() => {
    if (veterinarias.length > 0) {
      const uniqueCiudades = [...new Set(veterinarias.map(v => v.ciudad).filter(Boolean))];
      setCiudades(uniqueCiudades);
    }
  }, [veterinarias]);

  const extractData = (response) => {
    if (response?.success === true && response?.data) {
      if (response.data.data && Array.isArray(response.data.data)) return response.data.data;
      if (Array.isArray(response.data)) return response.data;
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
        const response = await api.get('/veterinarias');
        let data = extractData(response.data);
        setVeterinarias(data);
        setFilteredVeterinarias(data);
      } catch (err) {
        console.error('Error cargando veterinarias:', err);
        setError(err.response?.data?.message || t('error_carga'));
      } finally {
        setLoading(false);
      }
    };

    loadVeterinarias();
  }, [t]);

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
      <div className="veterinarias-header">
        <div className="container">
          <h1>{t('titulo')}</h1>
          <p className="subtitle">{t('subtitulo')}</p>
          {veterinarias.length > 0 && (
            <p className="info">
              <Star size={16} style={{ color: '#fbbf24' }} />
              {' '}{t('mensaje_bienvenida', { total: veterinarias.length })}
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
            </div>
          ) : (
            <div className="veterinarias-grid">
              {filteredVeterinarias.map((veterinaria) => (
                <VeterinariaCard
                  key={veterinaria.id}
                  veterinaria={veterinaria}
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

export default Veterinarias;