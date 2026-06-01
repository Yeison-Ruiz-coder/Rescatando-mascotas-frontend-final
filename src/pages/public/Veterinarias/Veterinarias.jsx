// src/pages/public/Veterinarias/Veterinarias.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useFiltrosVeterinarias } from "../../../contexts/FiltrosContext";
import api from "../../../services/api";
import LoadingSpinner from "../../../components/common/LoadingSpinner/LoadingSpinner";
import SlideUpPanel from "../../../components/common/SlideUpPanel/SlideUpPanel";
import VeterinariaDetalle from "./VeterinariaDetalle";
import FiltrosFundaciones from "../../../components/common/FiltrosFundaciones/FiltrosFundaciones";
import VeterinariaCard from "../../../components/common/VeterinariaCard/VeterinariaCard";
import "./Veterinarias.css";

const Veterinarias = () => {
  const { t } = useTranslation("veterinarias");
  const { filtros } = useFiltrosVeterinarias();
  const [veterinarias, setVeterinarias] = useState([]);
  const [filteredVeterinarias, setFilteredVeterinarias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ciudades, setCiudades] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  // Estado para el panel deslizable
  const [selectedVeterinaria, setSelectedVeterinaria] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  useEffect(() => {
    if (veterinarias.length > 0) {
      let resultado = [...veterinarias];

      if (filtros.busqueda && filtros.busqueda.trim()) {
        const busquedaLower = filtros.busqueda.toLowerCase().trim();
        resultado = resultado.filter(
          (v) =>
            v.Nombre_vet?.toLowerCase().includes(busquedaLower) ||
            v.ciudad?.toLowerCase().includes(busquedaLower),
        );
      }

      if (filtros.ciudad && filtros.ciudad.trim()) {
        resultado = resultado.filter((v) => v.ciudad === filtros.ciudad);
      }

      setFilteredVeterinarias(resultado);
    }
  }, [filtros, veterinarias]);

  useEffect(() => {
    if (veterinarias.length > 0) {
      const uniqueCiudades = [
        ...new Set(veterinarias.map((v) => v.ciudad).filter(Boolean)),
      ];
      setCiudades(uniqueCiudades);
    }
  }, [veterinarias]);

  const handleOpenPanel = (veterinaria) => {
    setSelectedVeterinaria(veterinaria);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setSelectedVeterinaria(null);
  };

  const extractData = (response) => {
    if (response?.success === true && response?.data) {
      if (response.data.data && Array.isArray(response.data.data))
        return response.data.data;
      if (Array.isArray(response.data)) return response.data;
    }
    if (Array.isArray(response)) return response;
    if (response?.data && Array.isArray(response.data)) return response.data;
    if (response?.data?.data && Array.isArray(response.data.data))
      return response.data.data;
    return [];
  };

  useEffect(() => {
    const loadVeterinarias = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get("/veterinarias");
        let data = extractData(response.data);
        setVeterinarias(data);
        setFilteredVeterinarias(data);
      } catch (err) {
        console.error("Error cargando veterinarias:", err);
        setError(err.response?.data?.message || t("error_carga"));
      } finally {
        setLoading(false);
      }
    };

    loadVeterinarias();
  }, [t]);

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const baseUrl =
      import.meta.env.VITE_STORAGE_URL ||
      "https://rescatando-mascotas-backend-final-production.up.railway.app";
    return path.startsWith("/storage")
      ? `${baseUrl}${path}`
      : `${baseUrl}/storage/${path}`;
  };

  if (loading) {
    return (
      <div className="veterinarias-page">
        <div className="loading-container">
          <LoadingSpinner text={t("cargando")} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="veterinarias-page">
        <div className="bento-container">
          <div className="error-container">
            <i className="fas fa-map-pin fa-3x"></i>
            <h2>{t("error_carga")}</h2>
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="reload-btn"
            >
              <i className="fas fa-sync-alt"></i> {t("reintentar")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="veterinarias-page">
      {/* Header con imagen de fondo */}
      <div className="veterinarias-header">
        <div className="veterinarias-hero">
          <img src="/img/hover/perro-veterinaria.jpg" alt={t("titulo")} />
        </div>
        <div className="bento-container">
          <h1>{t("titulo")}</h1>
          {veterinarias.length > 0 && (
            <p className="info">
              <i className="fas fa-star "></i>{" "}
              {t("mensaje_bienvenida", { total: veterinarias.length })}
            </p>
          )}
        </div>
      </div>

      {/* Filtros section */}
      <div className="filtros-section">
        <div className="bento-container">
          <FiltrosFundaciones
            ciudades={ciudades}
            variant={isMobile ? "modal" : "inline"}
          />
        </div>
      </div>

      {/* Resultados section */}
      <div className="resultados-section">
        <div className="bento-container">
          <div className="resultados-header">
            <div className="resultados-count">
              <i className="fas fa-list"></i>
              <span>
                {t("mostrando")} <strong>{filteredVeterinarias.length}</strong>{" "}
                {t("de")} <strong>{veterinarias.length}</strong>{" "}
                {t("veterinarias")}
              </span>
            </div>
          </div>
          // Resultados section
          {filteredVeterinarias.length === 0 ? (
            <div className="empty-container">
              <i className="fas fa-building"></i>
              <h3>{t("sin_resultados.titulo")}</h3>
              <p>{t("sin_resultados.mensaje")}</p>
            </div>
          ) : (
            <div className="veterinarias-grid">
              {filteredVeterinarias.map((veterinaria) => (
                <VeterinariaCard
                  key={veterinaria.id}
                  veterinaria={veterinaria}
                  getImageUrl={getImageUrl}
                  showActions={true}
                  onView={(veterinaria) => handleOpenPanel(veterinaria)} // ← Solo aquí
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mensaje motivacional */}
      <div className="motivational-message">
        <div className="bento-container">
          <div className="motivational-content">
            <i className="fas fa-paw motivational-icon"></i>
            <h3 className="motivational-title">
              {t("mensaje_motivacional_titulo") ||
                "Tu mascota merece el mejor cuidado"}
            </h3>
            <p className="motivational-text">
              {t("mensaje_motivacional_texto") ||
                "Encuentra las mejores veterinarias cerca de ti. Profesionales comprometidos con la salud y bienestar de tu mejor amigo."}
            </p>
          </div>
        </div>
      </div>

      {/* Panel deslizable para detalle */}
      <SlideUpPanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        title={selectedVeterinaria?.Nombre_vet || t("detalle_veterinaria")}
      >
        <VeterinariaDetalle
          veterinariaId={selectedVeterinaria?.id}
          embed={true}
        />
      </SlideUpPanel>
    </div>
  );
};

export default Veterinarias;
