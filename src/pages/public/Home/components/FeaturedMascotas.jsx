// src/pages/public/Home/components/FeaturedMascotas.jsx
import React, { useState, useEffect, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../../../services/api';
import { getImageUrl as buildImageUrl } from '../../../../utils/imageUtils';
import SlideUpPanel from '../../../../components/common/SlideUpPanel/SlideUpPanel';
import MascotaDetalle from '../../Mascotas/MascotaDetalle';
import MascotaCard from '../../../../components/common/MascotaCard/MascotaCard';
import './FeaturedMascotas.css';

const FeaturedMascotas = memo(() => {
  const { t } = useTranslation('home');
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMascota, setSelectedMascota] = useState(null);
  const [currentMascotaId, setCurrentMascotaId] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const getOptimizedImageUrl = useCallback((path) => buildImageUrl(path), []);

  // ✅ Abre el panel con una mascota
  const handleOpenPanel = useCallback((mascota) => {
    setSelectedMascota(mascota);
    setCurrentMascotaId(mascota.id);
    setIsPanelOpen(true);
  }, []);

  // ✅ Navega a otra mascota DENTRO del mismo panel
  const handleNavigateToMascota = useCallback((nuevoId) => {
    console.log(`🔄 [Home Panel] Navegando a mascota ${nuevoId}`);
    setCurrentMascotaId(nuevoId);
    // Opcional: actualiza el título si tienes el nombre
    const mascotaEncontrada = mascotas.find(m => m.id === nuevoId);
    if (mascotaEncontrada) {
      setSelectedMascota(mascotaEncontrada);
    }
  }, [mascotas]);

  // ✅ Cierra el panel
  const handleClosePanel = useCallback(() => {
    setIsPanelOpen(false);
    setTimeout(() => {
      setSelectedMascota(null);
      setCurrentMascotaId(null);
    }, 300);
  }, []);

  useEffect(() => {
    const abortController = new AbortController();
    
    const fetchMascotas = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('📡 [FeaturedMascotas] Cargando mascotas...');
        
        const response = await api.get('/mascotas', {
          params: { 
            per_page: 7,
            sort: '-created_at'
          },
          signal: abortController.signal
        });
        
        console.log('🐾 [FeaturedMascotas] Respuesta recibida:', response.data);
        
        let mascotasData = [];
        if (response.data?.data?.data) {
          mascotasData = response.data.data.data;
        } else if (response.data?.data) {
          mascotasData = response.data.data;
        } else if (Array.isArray(response.data)) {
          mascotasData = response.data;
        }
        
        console.log(`🐾 [FeaturedMascotas] ${mascotasData.length} mascotas cargadas`);
        
        const mappedMascotas = mascotasData.slice(0, 7).map(m => ({
          id: m.id,
          nombre_mascota: m.nombre_mascota,
          descripcion: m.descripcion,
          especie: m.especie,
          genero: m.genero,
          edad_aprox: m.edad_aprox,
          fundacion: m.fundacion,
          foto_principal: m.foto_principal,
          lugar_rescate: m.lugar_rescate,
          estado: m.estado
        }));
        
        setMascotas(mappedMascotas);
        setError(null);
        
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('❌ [FeaturedMascotas] Error:', err);
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMascotas();
    return () => abortController.abort();
  }, []);

  if (loading) {
    return (
      <section className="fm-section">
        <div className="fm-container">
          <div className="fm-header">
            <div className="fm-skeleton-title" />
            <div className="fm-skeleton-subtitle" />
          </div>
          <div className="fm-featured-skeleton" />
          <div className="fm-grid-skeleton">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="fm-card-skeleton" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || mascotas.length === 0) {
    return null;
  }

  const featuredMascota = mascotas[0];
  const secondaryMascotas = mascotas.slice(1, 7);

  const getEstadoText = (estado) => {
    const estados = {
      'En adopcion': 'En adopción',
      'Adoptado': 'Adoptado',
      'Rescatada': 'Rescatada',
      'En acogida': 'En acogida'
    };
    return estados[estado] || estado || 'En adopción';
  };

  const getSexoIcon = (genero) => {
    if (genero === 'Macho') return <i className="fas fa-mars" />;
    if (genero === 'Hembra') return <i className="fas fa-venus" />;
    return null;
  };

  const getEdadTexto = (edad) => {
    if (!edad) return '? años';
    return `${edad} años`;
  };

  return (
    <section className="fm-section">
      <div className="fm-container">
        <div className="fm-header reveal-up">
          <h2 className="fm-title">
            {t('mascotas_disponibles') || 'Mascotas disponibles para adopción'}
          </h2>
          <p className="fm-subtitle">
            {t('mascotas_subtitle') || 'Ellos esperan un hogar lleno de amor'}
          </p>
        </div>

        {featuredMascota && (
          <div className="fm-featured reveal-up delay-200">
            <div className="fm-featured-image">
              <img 
                src={getOptimizedImageUrl(featuredMascota.foto_principal)} 
                alt={featuredMascota.nombre_mascota}
                onError={(e) => { e.target.src = '/img/placeholder-mascota.jpg'; }}
                loading="lazy"
              />
              <div className="fm-featured-badge">
                <i className="fas fa-star" /> {t('destacada') || 'Destacada'}
              </div>
            </div>
            <div className="fm-featured-info">
              <h3 className="fm-featured-name">{featuredMascota.nombre_mascota}</h3>
              <div className="fm-featured-details">
                <span className="fm-age">
                  <i className="fas fa-calendar-alt" /> {getEdadTexto(featuredMascota.edad_aprox)}
                </span>
                <span className="fm-sex">
                  {getSexoIcon(featuredMascota.genero)} {featuredMascota.genero || ''}
                </span>
                <span className={`fm-status fm-status-${(featuredMascota.estado || 'En adopcion').toLowerCase().replace(/\s/g, '-')}`}>
                  {getEstadoText(featuredMascota.estado)}
                </span>
              </div>
              <p className="fm-featured-description">
                {featuredMascota.descripcion?.length > 120 
                  ? `${featuredMascota.descripcion.substring(0, 120)}...` 
                  : featuredMascota.descripcion || t('sin_descripcion') || 'Sin descripción disponible'}
              </p>
              <button 
                className="fm-featured-btn"
                onClick={() => handleOpenPanel(featuredMascota)}
              >
                <i className="fas fa-paw" /> {t('adoptar_ahora') || 'Adoptar ahora'}
              </button>
            </div>
          </div>
        )}

        <div className="fm-grid stagger-children">
          {secondaryMascotas.map((mascota) => (
            <MascotaCard
              key={mascota.id}
              mascota={mascota}
              variant="compact"
              getImageUrl={getOptimizedImageUrl}
              onView={handleOpenPanel}
            />
          ))}
          
          <div className="fm-card fm-view-all-card">
            <Link to="/mascotas" className="fm-view-all-link">
              <div className="fm-view-all-content">
                <i className="fas fa-arrow-right fm-view-all-icon" />
                <span className="fm-view-all-text">
                  {t('ver_todas') || 'Ver todas las mascotas'}
                </span>
                <span className="fm-view-all-sub">
                  {t('ver_todas_sub') || '+ de 100 esperando por ti'}
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* ✅ Panel deslizable con navegación interna */}
      <SlideUpPanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        title={selectedMascota?.nombre_mascota || 'Detalle de mascota'}
      >
        {currentMascotaId && (
          <MascotaDetalle 
            mascotaId={currentMascotaId} 
            embed={true}
            onNavigateToMascota={handleNavigateToMascota}
          />
        )}
      </SlideUpPanel>
    </section>
  );
});

FeaturedMascotas.displayName = 'FeaturedMascotas';
export default FeaturedMascotas;