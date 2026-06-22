// src/pages/public/Fundaciones/FundacionesIndex.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import api from "../../../services/api";
import FundacionCard from "../../../components/common/FundacionCard/FundacionCard";
import SlideUpPanel from "../../../components/common/SlideUpPanel/SlideUpPanel";
import FiltrosFundaciones from "../../../components/common/FiltrosFundaciones/FiltrosFundaciones";
import LoadingSpinner from "../../../components/common/LoadingSpinner/LoadingSpinner";
import { getImageUrl as buildImageUrl } from "../../../utils/imageUtils";
import FundacionDetalle from "./FundacionDetalle";
import "./FundacionesIndex.css";

const FundacionesIndex = () => {
  const { t } = useTranslation("fundaciones");

  const [fundaciones, setFundaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });
  const [currentFilters, setCurrentFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [ciudades, setCiudades] = useState([]);

  // ✅ Estados para el panel
  const [selectedFundacion, setSelectedFundacion] = useState(null);
  const [currentFundacionId, setCurrentFundacionId] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const loadFundaciones = useCallback(async (filters = {}, page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: page,
        per_page: 12,
      };

      if (filters.buscar) params.buscar = filters.buscar;
      if (filters.ciudad) params.ciudad = filters.ciudad;

      console.log("📡 API Request Fundaciones:", params);

      const response = await api.get("/fundaciones", { params });

      let fundacionesData = [];
      let paginationData = { current_page: 1, last_page: 1, total: 0 };

      if (response.data?.data?.data) {
        fundacionesData = response.data.data.data;
        paginationData = {
          current_page: response.data.data.current_page,
          last_page: response.data.data.last_page,
          total: response.data.data.total,
        };
      } else if (response.data?.data) {
        fundacionesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        fundacionesData = response.data;
      }

      setFundaciones(fundacionesData);
      setPagination(paginationData);

      const uniqueCiudades = [
        ...new Set(fundacionesData.map((f) => f.ciudad).filter(Boolean)),
      ];
      setCiudades(uniqueCiudades);
    } catch (err) {
      console.error("❌ Error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Error al cargar fundaciones",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFundaciones({}, 1);
  }, []);

  const handleFilterChange = useCallback(
    (newFilters) => {
      console.log("📝 Filtros aplicados:", newFilters);
      setCurrentFilters(newFilters);
      setCurrentPage(1);
      loadFundaciones(newFilters, 1);
    },
    [loadFundaciones],
  );

  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage === currentPage) return;
      setCurrentPage(newPage);
      loadFundaciones(currentFilters, newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [currentPage, currentFilters, loadFundaciones],
  );

  // ✅ Abre el panel con una fundación
  const handleOpenPanel = useCallback((fundacion) => {
    setSelectedFundacion(fundacion);
    setCurrentFundacionId(fundacion.id);
    setIsPanelOpen(true);
  }, []);

  // ✅ Navega a otra fundación DENTRO del mismo panel
  const handleNavigateToFundacion = useCallback((nuevoId) => {
    console.log(`🔄 [Panel Fundaciones] Navegando a fundación ${nuevoId}`);
    setCurrentFundacionId(nuevoId);
    const fundacionEncontrada = fundaciones.find(f => f.id === nuevoId);
    if (fundacionEncontrada) {
      setSelectedFundacion(fundacionEncontrada);
    }
  }, [fundaciones]);

  // ✅ Cierra el panel
  const handleClosePanel = useCallback(() => {
    setIsPanelOpen(false);
    setTimeout(() => {
      setSelectedFundacion(null);
      setCurrentFundacionId(null);
    }, 300);
  }, []);

  const getImageUrl = useCallback((path) => buildImageUrl(path), []);

  if (loading && fundaciones.length === 0) {
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
            <i className="fas fa-building"></i>
            <h2>{t("error_carga")}</h2>
            <p>{error}</p>
            <button
              onClick={() => loadFundaciones(currentFilters, currentPage)}
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
      <div className="fundaciones-header reveal-up delay-100">
        <div className="fundaciones-hero">
          <img src="/img/hover/perro-fundacion.jpg" alt={t("titulo")} />
        </div>
        <div className="bento-container">
          <h1 className="reveal-up delay-200">{t("titulo")}</h1>
          {pagination.total > 0 && (
            <p className="info reveal-up delay-300">
              <i className="fas fa-heart"></i>{" "}
              {t("mensaje_bienvenida", { total: pagination.total })}
            </p>
          )}
        </div>
      </div>

      <div className="filtros-section reveal-up delay-100">
        <div className="bento-container">
          <FiltrosFundaciones
            onFilterChange={handleFilterChange}
            ciudades={ciudades}
            fundaciones={fundaciones}
            isLoading={loading}
          />
        </div>
      </div>

      <div className="resultados-section">
        <div className="bento-container">
          <div className="resultados-header reveal-up delay-200">
            <div className="resultados-count">
              <i className="fas fa-list"></i> Mostrando{" "}
              <strong>{fundaciones.length}</strong> de{" "}
              <strong>{pagination.total}</strong> fundaciones
            </div>
          </div>

          {fundaciones.length === 0 ? (
            <div className="empty-container reveal-up">
              <i className="fas fa-building"></i>
              <h3>{t("sin_resultados.titulo")}</h3>
              <p>{t("sin_resultados.mensaje")}</p>
            </div>
          ) : (
            <>
              <div className="fundaciones-grid stagger-children">
                {fundaciones.map((fundacion) => (
                  <FundacionCard
                    key={fundacion.id}
                    fundacion={fundacion}
                    getImageUrl={getImageUrl}
                    variant="default"
                    showActions={true}
                    onView={handleOpenPanel}
                  />
                ))}
              </div>

              {pagination.last_page > 1 && (
                <div className="pagination-container reveal-up delay-300">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                  >
                    <i className="fas fa-chevron-left"></i> Anterior
                  </button>
                  <span className="pagination-info">
                    Página {currentPage} de {pagination.last_page}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.last_page}
                    className="pagination-btn"
                  >
                    Siguiente <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="motivational-message reveal-up delay-400">
        <div className="bento-container">
          <div className="motivational-content">
            <i className="fas fa-paw motivational-icon"></i>
            <h3 className="motivational-title">
              {t("mensaje_motivacional_titulo")}
            </h3>
            <p className="motivational-text">
              {t("mensaje_motivacional_texto")}
            </p>
          </div>
        </div>
      </div>

      {/* ✅ SlideUpPanel actualizado */}
      <SlideUpPanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        title={selectedFundacion?.Nombre_1 || t("detalle_fundacion")}
      >
        {currentFundacionId && (
          <FundacionDetalle
            fundacionId={currentFundacionId}
            embed={true}
            onNavigateToFundacion={handleNavigateToFundacion}
          />
        )}
      </SlideUpPanel>
    </div>
  );
};

export default FundacionesIndex;