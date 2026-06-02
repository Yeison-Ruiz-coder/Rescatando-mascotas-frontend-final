// src/pages/public/Fundaciones/FundacionesIndex.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import api from "../../../services/api";
import FundacionCard from "../../../components/common/FundacionCard/FundacionCard";
import SlideUpPanel from "../../../components/common/SlideUpPanel/SlideUpPanel";
import FundacionDetalle from "./FundacionDetalle";
import FiltrosFundaciones from "../../../components/common/FiltrosFundaciones/FiltrosFundaciones";
import LoadingSpinner from "../../../components/common/LoadingSpinner/LoadingSpinner";
import { useFiltrosFundaciones } from "../../../contexts/FiltrosContext";
import "./FundacionesIndex.css";

const FundacionesIndex = () => {
  const { t } = useTranslation("fundaciones");
  const { filtros } = useFiltrosFundaciones();
  const [fundaciones, setFundaciones] = useState([]);
  const [fundacionesFiltradas, setFundacionesFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ciudades, setCiudades] = useState([]);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Estado para el panel deslizable
  const [selectedFundacion, setSelectedFundacion] = useState(null);
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
    if (fundaciones.length > 0) {
      let resultado = [...fundaciones];

      if (filtros.busqueda && filtros.busqueda.trim()) {
        const busquedaLower = filtros.busqueda.toLowerCase().trim();
        resultado = resultado.filter(
          (f) =>
            f.Nombre_1?.toLowerCase().includes(busquedaLower) ||
            f.Descripcion?.toLowerCase().includes(busquedaLower) ||
            f.ciudad?.toLowerCase().includes(busquedaLower),
        );
      }

      if (filtros.ciudad && filtros.ciudad.trim()) {
        resultado = resultado.filter((f) => f.ciudad === filtros.ciudad);
      }

      setFundacionesFiltradas(resultado);
    }
  }, [filtros, fundaciones]);

  const handleOpenPanel = (fundacion) => {
    setSelectedFundacion(fundacion);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setSelectedFundacion(null);
  };

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
    if (response?.data?.data && Array.isArray(response.data.data))
      return response.data.data;
    return [];
  };

  const getImageUrl = useCallback((url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    const baseUrl =
      import.meta.env.VITE_STORAGE_URL ||
      "https://rescatando-mascotas-backend-final-production.up.railway.app";
    return url.startsWith("/storage")
      ? `${baseUrl}${url}`
      : `${baseUrl}/storage/${url}`;
  }, []);

  useEffect(() => {
    const abortController = new AbortController();
    let isMounted = true;

    const loadFundaciones = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get("/fundaciones", {
          signal: abortController.signal,
        });

        if (!isMounted) return;

        let fundacionesData = extractData(response.data);

        const fundacionesConMascotas = await Promise.all(
          fundacionesData.map(async (fundacion) => {
            try {
              const mascotasRes = await api.get(
                `/mascotas/fundacion/${fundacion.id}`,
                {
                  signal: abortController.signal,
                },
              );
              let mascotasData = extractData(mascotasRes.data);
              return { ...fundacion, total_mascotas: mascotasData.length };
            } catch (error) {
              return { ...fundacion, total_mascotas: 0 };
            }
          }),
        );

        if (!isMounted) return;

        setFundaciones(fundacionesConMascotas);
        setFundacionesFiltradas(fundacionesConMascotas);

        const uniqueCiudades = [
          ...new Set(
            fundacionesConMascotas.map((f) => f.ciudad).filter(Boolean),
          ),
        ];
        setCiudades(uniqueCiudades);
      } catch (error) {
        if (
          error.name !== "CanceledError" &&
          error.name !== "AbortError" &&
          isMounted
        ) {
          setError(error.message || t("error_carga"));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadFundaciones();
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [t]);

  if (loading) {
    return (
      <div className="fundaciones-page">
        <div className="loading-container">
          <LoadingSpinner text={t("cargando")} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fundaciones-page">
        <div className="bento-container">
          <div className="error-container">
            <i className="fas fa-building fa-3x"></i>
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
    <div className="fundaciones-page">
      {/* Header con imagen de fondo */}
      <div className="fundaciones-header">
        <div className="fundaciones-hero">
          <img src="/img/hover/perro-fundacion.jpg" alt={t("titulo")} />
        </div>
        <div className="bento-container">
          <h1>{t("titulo")}</h1>
          {fundaciones.length > 0 && (
            <p className="info">
              <i className="fas fa-heart"></i>{" "}
              {t("mensaje_bienvenida", { total: fundaciones.length })}
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
              <i className="fas fa-heart"></i>
              <span>
                {t("mostrando")} <strong>{fundacionesFiltradas.length}</strong>{" "}
                {t("de")} <strong>{fundaciones.length}</strong>{" "}
                {t("fundaciones")}
              </span>
            </div>
          </div>
          {fundacionesFiltradas.length === 0 ? (
            <div className="empty-container">
              <i className="fas fa-building"></i>
              <h3>{t("sin_resultados.titulo")}</h3>
              <p>{t("sin_resultados.mensaje")}</p>
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
                  onView={(fundacion) => handleOpenPanel(fundacion)} // ← Solo aquí
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
                "Apoya a las fundaciones que ayudan"}
            </h3>
            <p className="motivational-text">
              {t("mensaje_motivacional_texto") ||
                "Cada fundación trabaja incansablemente para rescatar y dar hogar a animales necesitados. Conoce su labor y súmate a su causa."}
            </p>
          </div>
        </div>
      </div>

      {/* Panel deslizable para detalle */}
      <SlideUpPanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        title={selectedFundacion?.Nombre_1 || t("detalle_fundacion")}
      >
        <FundacionDetalle fundacionId={selectedFundacion?.id} embed={true} />
      </SlideUpPanel>
    </div>
  );
};

export default FundacionesIndex;
