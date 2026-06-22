// src/pages/public/Veterinarias/Veterinarias.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import api from "../../../services/api";
import VeterinariaCard from "../../../components/common/VeterinariaCard/VeterinariaCard";
import SlideUpPanel from "../../../components/common/SlideUpPanel/SlideUpPanel";
import FiltrosVeterinarias from "../../../components/common/FiltrosVeterinarias/FiltrosVeterinarias";
import LoadingSpinner from "../../../components/common/LoadingSpinner/LoadingSpinner";
import { getImageUrl as buildImageUrl } from "../../../utils/imageUtils";
import VeterinariaDetalle from "./VeterinariaDetalle";
import "./Veterinarias.css";

const Veterinarias = () => {
  const { t } = useTranslation("veterinarias");

  // ✅ Estado
  const [veterinarias, setVeterinarias] = useState([]);
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
  const [selectedVeterinaria, setSelectedVeterinaria] = useState(null);
  const [currentVeterinariaId, setCurrentVeterinariaId] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // ✅ Ref para evitar llamadas duplicadas
  const isMounted = useRef(true);
  const loadingRef = useRef(false);

  // ✅ Memoizar la función getImageUrl
  const getImageUrl = useCallback((path) => buildImageUrl(path), []);

  // ✅ Función loadVeterinarias optimizada
  const loadVeterinarias = useCallback(async (filters = {}, page = 1) => {
    // Evitar llamadas concurrentes
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: page,
        per_page: 12,
      };

      if (filters.buscar) params.buscar = filters.buscar;
      if (filters.ciudad) params.ciudad = filters.ciudad;
      if (filters.urgencias) params.urgencias = filters.urgencias;
      if (filters.verificado) params.verificado = filters.verificado;

      const response = await api.get("/veterinarias", { params });

      if (!isMounted.current) return;

      let veterinariasData = [];
      let paginationData = { current_page: 1, last_page: 1, total: 0 };

      if (response.data?.data?.data) {
        veterinariasData = response.data.data.data;
        paginationData = {
          current_page: response.data.data.current_page,
          last_page: response.data.data.last_page,
          total: response.data.data.total,
        };
      } else if (response.data?.data) {
        veterinariasData = response.data.data;
      } else if (Array.isArray(response.data)) {
        veterinariasData = response.data;
      }

      setVeterinarias(veterinariasData);
      setPagination(paginationData);

      // ✅ Extraer ciudades de forma eficiente
      const uniqueCiudades = [...new Set(
        veterinariasData.map((v) => v.ciudad).filter(Boolean)
      )];
      setCiudades(uniqueCiudades);
      
    } catch (err) {
      console.error("❌ Error:", err);
      if (isMounted.current) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Error al cargar veterinarias"
        );
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
        loadingRef.current = false;
      }
    }
  }, []);

  // ✅ Carga inicial
  useEffect(() => {
    isMounted.current = true;
    loadVeterinarias({}, 1);
    
    return () => {
      isMounted.current = false;
    };
  }, [loadVeterinarias]);

  // ✅ Handlers con useCallback
  const handleFilterChange = useCallback(
    (newFilters) => {
      setCurrentFilters(newFilters);
      setCurrentPage(1);
      loadVeterinarias(newFilters, 1);
    },
    [loadVeterinarias]
  );

  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage === currentPage || loading) return;
      setCurrentPage(newPage);
      loadVeterinarias(currentFilters, newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [currentPage, currentFilters, loadVeterinarias, loading]
  );

  // ✅ Panel handlers
  const handleOpenPanel = useCallback((veterinaria) => {
    setSelectedVeterinaria(veterinaria);
    setCurrentVeterinariaId(veterinaria.id);
    setIsPanelOpen(true);
  }, []);

  const handleNavigateToVeterinaria = useCallback((nuevoId) => {
    setCurrentVeterinariaId(nuevoId);
    const veterinariaEncontrada = veterinarias.find(v => v.id === nuevoId);
    if (veterinariaEncontrada) {
      setSelectedVeterinaria(veterinariaEncontrada);
    }
  }, [veterinarias]);

  const handleClosePanel = useCallback(() => {
    setIsPanelOpen(false);
    setTimeout(() => {
      setSelectedVeterinaria(null);
      setCurrentVeterinariaId(null);
    }, 300);
  }, []);

  // ✅ Memoizar el título del panel
  const panelTitle = useMemo(() => {
    return selectedVeterinaria?.Nombre_vet || t("detalle_veterinaria");
  }, [selectedVeterinaria, t]);

  // ✅ Memoizar el conteo de resultados
  const resultadosCount = useMemo(() => {
    return (
      <div className="veterinarias-resultados-count">
        <i className="fas fa-list"></i> Mostrando{" "}
        <strong>{veterinarias.length}</strong> de{" "}
        <strong>{pagination.total}</strong> veterinarias
      </div>
    );
  }, [veterinarias.length, pagination.total]);

  // ✅ Renderizado condicional memoizado
  if (loading && veterinarias.length === 0) {
    return (
      <div className="veterinarias-page">
        <div className="veterinarias-loading">
          <LoadingSpinner text={t("cargando")} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="veterinarias-page">
        <div className="bento-container">
          <div className="veterinarias-error">
            <i className="fas fa-map-pin"></i>
            <h4>{t("error_carga")}</h4>
            <p>{error}</p>
            <button
              onClick={() => loadVeterinarias(currentFilters, currentPage)}
              className="veterinarias-reload-btn"
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
      {/* Header - memoizado */}
      <HeaderSection t={t} pagination={pagination} />

      {/* Filtros */}
      <div className="veterinarias-filtros-section reveal-up delay-100">
        <div className="bento-container">
          <FiltrosVeterinarias
            onFilterChange={handleFilterChange}
            ciudades={ciudades}
            veterinarias={veterinarias}
            isLoading={loading}
          />
        </div>
      </div>

      {/* Resultados */}
      <div className="veterinarias-resultados-section">
        <div className="bento-container">
          <div className="veterinarias-resultados-header reveal-up delay-200">
            {resultadosCount}
          </div>

          {veterinarias.length === 0 ? (
            <div className="veterinarias-empty reveal-up">
              <i className="fas fa-building"></i>
              <h3>{t("sin_resultados.titulo")}</h3>
              <p>{t("sin_resultados.mensaje")}</p>
            </div>
          ) : (
            <>
              <div className="veterinarias-grid stagger-children">
                {veterinarias.map((veterinaria) => (
                  <VeterinariaCard
                    key={veterinaria.id}
                    veterinaria={veterinaria}
                    getImageUrl={getImageUrl}
                    showActions={true}
                    onView={handleOpenPanel}
                  />
                ))}
              </div>

              {pagination.last_page > 1 && (
                <div className="veterinarias-pagination-container reveal-up delay-300">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    className="veterinarias-pagination-btn"
                  >
                    <i className="fas fa-chevron-left"></i> Anterior
                  </button>
                  <span className="veterinarias-pagination-info">
                    Página {currentPage} de {pagination.last_page}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.last_page || loading}
                    className="veterinarias-pagination-btn"
                  >
                    Siguiente <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Motivacional */}
      <MotivationalSection t={t} />

      {/* Panel */}
      <SlideUpPanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        title={panelTitle}
      >
        {currentVeterinariaId && (
          <VeterinariaDetalle
            veterinariaId={currentVeterinariaId}
            embed={true}
            onNavigateToVeterinaria={handleNavigateToVeterinaria}
          />
        )}
      </SlideUpPanel>
    </div>
  );
};

// ✅ Componentes separados para evitar re-renderizados innecesarios
const HeaderSection = React.memo(({ t, pagination }) => (
  <div className="veterinarias-header reveal-up delay-100">
    <div className="veterinarias-hero">
      <img src="/img/hover/perro-veterinaria.jpg" alt={t("titulo")} />
    </div>
    <div className="bento-container">
      <h1 className="reveal-up delay-200">{t("titulo")}</h1>
      {pagination.total > 0 && (
        <p className="veterinarias-info reveal-up delay-300">
          <i className="fas fa-star"></i>{" "}
          {t("mensaje_bienvenida", { total: pagination.total })}
        </p>
      )}
    </div>
  </div>
));

const MotivationalSection = React.memo(({ t }) => (
  <div className="veterinarias-motivational reveal-up delay-400">
    <div className="bento-container">
      <div className="veterinarias-motivational-content">
        <i className="fas fa-paw veterinarias-motivational-icon"></i>
        <h3 className="veterinarias-motivational-title">
          {t("mensaje_motivacional_titulo")}
        </h3>
        <p className="veterinarias-motivational-text">
          {t("mensaje_motivacional_texto")}
        </p>
      </div>
    </div>
  </div>
));

export default Veterinarias;