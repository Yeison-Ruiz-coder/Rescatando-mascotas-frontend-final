// src/pages/public/Home/components/MasonryMascotas.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Masonry from 'react-masonry-css';
import api from '../../../../services/api';
import MascotaCardMasonry from '../../../../components/common/MascotaCard/MascotaCardMasonry';
import SlideUpPanel from '../../../../components/common/SlideUpPanel/SlideUpPanel';
import MascotaDetalle from '../../Mascotas/MascotaDetalle';
import './MasonryMascotas.css';

const breakpointColumns = {
  default: 4,
  1100: 3,
  700: 2,
  500: 1
};

const MasonryMascotas = () => {
  const { t } = useTranslation('home');
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMascota, setSelectedMascota] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_STORAGE_URL;
    return path.startsWith('/storage') ? `${baseUrl}${path}` : `${baseUrl}/storage/${path}`;
  };

  const handleOpenPanel = (mascota) => {
    setSelectedMascota(mascota);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setSelectedMascota(null);
  };

  useEffect(() => {
    const fetchMascotas = async () => {
      try {
        const response = await api.get('/mascotas', {
          params: {
            per_page: 20,
            estado: 'En adopcion'
          }
        });
        
        let mascotasData = [];
        if (response.data?.data?.data) {
          mascotasData = response.data.data.data;
        } else if (response.data?.data) {
          mascotasData = response.data.data;
        }
        
        console.log('Mascotas cargadas:', mascotasData.length);
        setMascotas(mascotasData);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMascotas();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div className="mm-spinner"></div>
      </div>
    );
  }

  if (mascotas.length === 0) {
    return null;
  }

  console.log('Renderizando masonry con', mascotas.length, 'mascotas');

  return (
    <section className="mm-masonry-section">
      {/* Degradados */}
      <div className="mm-fade-top"></div>
      <div className="mm-fade-bottom"></div>
      
      {/* HEADER - Títulos (z-index alto) */}
      <div className="mm-header">
        <h2 className="mm-title">
          {t('mascotas_disponibles') || 'Mascotas disponibles para adopción'}
        </h2>
        <p className="mm-subtitle">
          {t('mascotas_subtitle') || 'Ellos esperan un hogar lleno de amor'}
        </p>
      </div>

      {/* GRID - Wrapper (z-index bajo) */}
      <div className="mm-grid-wrapper">
        <Masonry
          breakpointCols={breakpointColumns}
          className="mm-masonry-grid"
          columnClassName="mm-masonry-column"
        >
          {mascotas.map((mascota, index) => (
            <div key={mascota.id} className="mm-item">
              <MascotaCardMasonry
                mascota={mascota}
                getImageUrl={getImageUrl}
                onView={handleOpenPanel}
              />
            </div>
          ))}
        </Masonry>
      </div>

      {/* FOOTER - Botón (z-index alto) */}
      <div className="mm-footer">
        <Link to="/mascotas" className="mm-view-all">
          {t('ver_todas') || 'Ver todas las mascotas'} 
          <i className="fas fa-arrow-right"></i>
        </Link>
      </div>

      <SlideUpPanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        title={selectedMascota?.nombre_mascota || "Detalle"}
      >
        {selectedMascota && (
          <MascotaDetalle mascotaId={selectedMascota.id} embed={true} />
        )}
      </SlideUpPanel>
    </section>
  );
};

export default MasonryMascotas;