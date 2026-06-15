// src/pages/public/Mascotas/components/MascotasRelacionadas.jsx
import React, { useState, useEffect } from "react";
import api from "../../../../services/api";
import MascotaCard from "../../../../components/common/MascotaCard/MascotaCard";
import SlideUpPanel from "../../../../components/common/SlideUpPanel/SlideUpPanel";
import MascotaDetalle from "../MascotaDetalle";

const MascotasRelacionadas = ({ mascotaId, especie, mascotaActual, t, isEmbed = false }) => {
  const [mascotasRelacionadas, setMascotasRelacionadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMascota, setSelectedMascota] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    if (mascotaId && especie) {
      fetchMascotasRelacionadas();
    }
  }, [mascotaId, especie]);

  const fetchMascotasRelacionadas = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/mascotas', {
        params: {
          especie: especie,
          estado: 'En adopcion',
          per_page: 4,
          exclude_id: mascotaId,
          sort: '-created_at',
          fields: 'id,nombre_mascota,especie,genero,edad_aprox,foto_principal,descripcion,lugar_rescate,fundacion_id',
          include: 'fundacion'
        }
      });
      
      let mascotasData = [];
      if (response.data?.data?.data) {
        mascotasData = response.data.data.data;
      } else if (response.data?.data) {
        mascotasData = response.data.data;
      } else if (Array.isArray(response.data)) {
        mascotasData = response.data;
      }
      
      setMascotasRelacionadas(mascotasData);
    } catch (err) {
      console.error("Error cargando mascotas relacionadas:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) {
      if (path.includes('cloudinary.com') && path.includes('/upload/')) {
        return path.replace('/upload/', '/upload/f_auto,q_auto,w_400,c_fill/');
      }
      return path;
    }
    const baseUrl = import.meta.env.VITE_STORAGE_URL || "https://rescatando-mascotas-backend-final-production.up.railway.app";
    return path.startsWith("/storage") ? `${baseUrl}${path}` : `${baseUrl}/storage/${path}`;
  };

  const handleOpenMascota = (mascota) => {
    if (isEmbed) {
      // ✅ Cuando estamos en embed (dentro de un panel), cerramos el panel actual
      // y abrimos el nuevo en el mismo panel (recargando el contenido)
      // Para evitar redirección, forzamos la apertura del nuevo panel
      setSelectedMascota(mascota);
      setIsPanelOpen(true);
    } else {
      setSelectedMascota(mascota);
      setIsPanelOpen(true);
    }
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setSelectedMascota(null);
  };

  if (loading) {
    return (
      <section className="mrr-relacionadas">
        <div className="mrr-container">
          <h2 className="mrr-titulo">{t("mascotas_relacionadas")}</h2>
          <div className="mascotas-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton-card" style={{ height: '300px', background: 'var(--color-hover)', borderRadius: 'var(--radius-md)', animation: 'pulse 1.5s ease-in-out infinite' }}></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return null;
  }

  if (mascotasRelacionadas.length === 0) {
    return (
      <section className="mrr-relacionadas">
        <div className="mrr-container">
          <h2 className="mrr-titulo">{t("mascotas_relacionadas")}</h2>
          <p className="mrr-placeholder">{t("no_hay_mascotas_relacionadas")}</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="mrr-relacionadas">
        <div className="mrr-container">
          <h2 className="mrr-titulo">{t("mascotas_relacionadas")}</h2>
          <div className="mascotas-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.8rem' }}>
            {mascotasRelacionadas.map((mascota) => (
              <MascotaCard
                key={mascota.id}
                mascota={mascota}
                getImageUrl={getImageUrl}
                variant="default"
                onView={handleOpenMascota}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Panel deslizable - siempre se muestra sin restricciones */}
      <SlideUpPanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        title={selectedMascota?.nombre_mascota || t('detalle', 'Detalle de mascota')}
      >
        {selectedMascota && (
          <MascotaDetalle mascotaId={selectedMascota.id} embed={true} />
        )}
      </SlideUpPanel>
    </>
  );
};

export default MascotasRelacionadas;