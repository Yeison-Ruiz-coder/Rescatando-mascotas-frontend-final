// src/pages/public/Mascotas/components/MascotasRelacionadas.jsx
import React, { useCallback, useState, useEffect, useRef } from "react";
import api from "../../../../services/api";
import MascotaCard from "../../../../components/common/MascotaCard/MascotaCard";
import { getImageUrl as buildImageUrl } from "../../../../utils/imageUtils";

const MascotasRelacionadas = ({ 
  mascotaId, 
  especie, 
  t, 
  isEmbed = false,
  onNavigateToMascota
}) => {
  const [mascotasRelacionadas, setMascotasRelacionadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const isMounted = useRef(true);
  const timeoutRef = useRef(null);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (mascotaId && especie) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        fetchMascotasRelacionadas();
      }, 300);
    }
  }, [mascotaId, especie]);

  const fetchMascotasRelacionadas = async () => {
    if (!isMounted.current) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await api.get('/mascotas', {
        params: {
          especie: especie,
          estado: 'En adopcion',
          per_page: 4,
          exclude_id: mascotaId,
          sort: '-created_at',
          fields: 'id,nombre_mascota,especie,genero,edad_aprox,foto_principal,descripcion,lugar_rescate,fundacion_id',
          include: 'fundacion'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      if (!isMounted.current) return;

      let mascotasData = [];
      if (response.data?.data?.data) {
        mascotasData = response.data.data.data;
      } else if (response.data?.data) {
        mascotasData = response.data.data;
      } else if (Array.isArray(response.data)) {
        mascotasData = response.data;
      }
      
      mascotasData = mascotasData.filter(m => m.id !== mascotaId);
      
      setMascotasRelacionadas(mascotasData);
    } catch (err) {
      if (!isMounted.current) return;
      
      if (err.name === 'CanceledError' || err.name === 'AbortError') {
        console.log('⏹️ Petición de relacionadas cancelada');
        return;
      }
      
      console.error("Error cargando mascotas relacionadas:", err);
      setError(err.message);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const getImageUrl = useCallback((path) => buildImageUrl(path), []);

  // ✅ Maneja el clic en una mascota relacionada
  const handleMascotaClick = useCallback((mascota) => {
    console.log(`🔄 [Relacionadas] Clic en mascota ${mascota.id}, isEmbed: ${isEmbed}`);
    
    if (isEmbed && onNavigateToMascota) {
      // ✅ SIEMPRE usa el callback cuando está en modo embed
      console.log(`✅ [Relacionadas] Navegando a mascota ${mascota.id} dentro del panel`);
      onNavigateToMascota(mascota.id);
    } else if (isEmbed) {
      // ✅ Si está en embed pero no hay callback, mostramos error
      console.error('❌ [Relacionadas] Error: isEmbed=true pero no hay onNavigateToMascota');
    } else {
      // ✅ Solo cuando NO está en embed, redirige a la página
      console.log(`🔗 [Relacionadas] Redirigiendo a /mascotas/${mascota.id}`);
      window.location.href = `/mascotas/${mascota.id}`;
    }
  }, [isEmbed, onNavigateToMascota]);

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
    return (
      <section className="mrr-relacionadas">
        <div className="mrr-container">
          <h2 className="mrr-titulo">{t("mascotas_relacionadas")}</h2>
          <p className="mrr-placeholder" style={{ color: 'var(--color-danger)' }}>
            ⚠️ {t("error_cargar_relacionadas", "Error al cargar mascotas relacionadas")}
          </p>
        </div>
      </section>
    );
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
              onView={() => handleMascotaClick(mascota)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MascotasRelacionadas;