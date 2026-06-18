// src/pages/public/Mascotas/Mascotas.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import api from "../../../services/api";
import { getImageUrl as buildImageUrl } from "../../../utils/imageUtils";
import MascotaCard from "../../../components/common/MascotaCard/MascotaCard";
import SlideUpPanel from "../../../components/common/SlideUpPanel/SlideUpPanel";
import MascotaDetalle from "./MascotaDetalle";
import FiltrosMascotas from "../../../components/common/FiltrosMascotas/FiltrosMascotas";
import CustomSelect from "../../../components/common/CustomSelect/CustomSelect";
import LoadingSpinner from "../../../components/common/LoadingSpinner/LoadingSpinner";
import "./Mascotas.css";

const Mascotas = () => {
  const { t } = useTranslation(['mascotas', 'common']);
  
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [currentFilters, setCurrentFilters] = useState({});
  const [orden, setOrden] = useState("reciente");
  const [currentPage, setCurrentPage] = useState(1);
  const [especies, setEspecies] = useState([]);
  const [cargandoEspecies, setCargandoEspecies] = useState(true);
  
  const [selectedMascota, setSelectedMascota] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const opcionesOrden = [
    { value: "reciente", label: t('mas_recientes', 'Más recientes') },
    { value: "nombre", label: t('nombre_az', 'Nombre (A-Z)') },
    { value: "edad_asc", label: t('edad_menor', 'Edad (menor a mayor)') },
    { value: "edad_desc", label: t('edad_mayor', 'Edad (mayor a menor)') },
  ];

  // Función para cargar especies desde la API
  const loadEspecies = useCallback(async () => {
    try {
      const response = await api.get('/mascotas/especies', {
        params: { fields: 'especie' }
      });
      if (response.data?.success && response.data?.data) {
        setEspecies(response.data.data);
      } else {
        setEspecies([
          t('perro', 'Perro'),
          t('gato', 'Gato'),
          t('conejo', 'Conejo'),
          t('ave', 'Ave'),
          t('otro', 'Otro')
        ]);
      }
    } catch (error) {
      console.error("Error cargando especies:", error);
      setEspecies([
        t('perro', 'Perro'),
        t('gato', 'Gato'),
        t('conejo', 'Conejo'),
        t('ave', 'Ave'),
        t('otro', 'Otro')
      ]);
    } finally {
      setCargandoEspecies(false);
    }
  }, [t]);

  // Función para cargar mascotas - OPTIMIZADA
  const loadMascotas = useCallback(async (filters = {}, page = 1, sortOrder = "reciente") => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page: page,
        per_page: 12,
        fields: 'id,nombre_mascota,especie,genero,edad_aprox,foto_principal,descripcion,lugar_rescate',
        include: 'fundacion',
        sort: '',
      };
      
      if (filters.buscar) params.buscar = filters.buscar;
      if (filters.especie) params.especie = filters.especie;
      if (filters.genero) params.genero = filters.genero;
      if (filters.tamano) params.tamano = filters.tamano;
      
      switch (sortOrder) {
        case "nombre": params.sort = "nombre_mascota"; break;
        case "edad_asc": params.sort = "edad_aprox"; break;
        case "edad_desc": params.sort = "-edad_aprox"; break;
        default: params.sort = "-created_at";
      }
      
      const response = await api.get('/mascotas', { params });
      
      let mascotasData = [];
      let paginationData = { current_page: 1, last_page: 1, total: 0 };
      
      if (response.data?.data?.data) {
        mascotasData = response.data.data.data;
        paginationData = {
          current_page: response.data.data.current_page,
          last_page: response.data.data.last_page,
          total: response.data.data.total,
        };
      } else if (response.data?.data) {
        mascotasData = response.data.data;
      } else if (Array.isArray(response.data)) {
        mascotasData = response.data;
      }
      
      setMascotas(mascotasData);
      setPagination(paginationData);
      
    } catch (err) {
      console.error("❌ Error:", err);
      setError(err.response?.data?.message || err.message || t('error_carga', 'Error al cargar mascotas'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const getOptimizedImageUrl = useCallback((path) => buildImageUrl(path), []);

  useEffect(() => {
    loadEspecies();
    loadMascotas({}, 1, "reciente");
  }, [loadEspecies, loadMascotas]);

  const handleFilterChange = useCallback((newFilters) => {
    setCurrentFilters(newFilters);
    setCurrentPage(1);
    loadMascotas(newFilters, 1, orden);
  }, [loadMascotas, orden]);

  const handleOrdenChange = useCallback((newOrden) => {
    setOrden(newOrden);
    setCurrentPage(1);
    loadMascotas(currentFilters, 1, newOrden);
  }, [loadMascotas, currentFilters]);

  const handlePageChange = useCallback((newPage) => {
    if (newPage === currentPage) return;
    setCurrentPage(newPage);
    loadMascotas(currentFilters, newPage, orden);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, currentFilters, orden, loadMascotas]);

  const handleOpenPanel = useCallback((mascota) => {
    setSelectedMascota(mascota);
    setIsPanelOpen(true);
  }, []);

  const handleClosePanel = useCallback(() => {
    setIsPanelOpen(false);
    setSelectedMascota(null);
  }, []);

  if ((loading || cargandoEspecies) && mascotas.length === 0) {
    return (
      <div className="mascotas-page">
        <div className="loading-container">
          <LoadingSpinner text={t('cargando', 'Cargando...')} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mascotas-page">
        <div className="bento-container">
          <div className="error-container">
            <i className="fas fa-paw"></i>
            <h2>{t('error', 'Error')}</h2>
            <p>{error}</p>
            <button onClick={() => loadMascotas(currentFilters, currentPage, orden)} className="reload-btn">
              <i className="fas fa-sync-alt"></i> {t('reintentar', 'Reintentar')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mascotas-page">
      {/* Header con animación */}
      <div className="mascotas-header reveal-up">
        <div className="mascotas-hero">
          <img src="/img/hover/gato-negro.jpg" alt={t("titulo")} loading="eager" />
        </div>
        <div className="bento-container">
          <h1 className="reveal-up delay-200">{t("titulo")}</h1>
          {pagination.total > 0 && (
            <p className="info reveal-up delay-300">
              <i className="fas fa-heart"></i> {t("mensaje_bienvenida", { total: pagination.total })}
            </p>
          )}
        </div>
      </div>

      {/* Filtros - sticky sin animación */}
      <div className="filtros-section">
        <div className="bento-container">
          <FiltrosMascotas 
            onFilterChange={handleFilterChange} 
            especies={especies}
            mascotas={mascotas}
            isLoading={loading}
          />
        </div>
      </div>

      {/* Resultados */}
      <div className="resultados-section">
        <div className="bento-container">
          <div className="resultados-header reveal-up delay-100">
            <div className="resultados-count">
              <i className="fas fa-list"></i> {t('mostrando', 'Mostrando')} <strong>{mascotas.length}</strong> {t('de', 'de')} <strong>{pagination.total}</strong> {t('mascotas', 'mascotas')}
            </div>
            <div className="resultados-orden">
              <label><i className="fas fa-sort"></i> {t('ordenar_por', 'Ordenar por')}:</label>
              <CustomSelect
                options={opcionesOrden}
                value={orden}
                onChange={(e) => handleOrdenChange(e.target.value)}
                name="orden"
              />
            </div>
          </div>

          {mascotas.length === 0 ? (
            <div className="empty-container reveal-up">
              <i className="fas fa-search"></i>
              <h3>{t('no_resultados', 'No se encontraron mascotas')}</h3>
              <p>{t('intenta_otros_filtros', 'Intenta con otros filtros')}</p>
            </div>
          ) : (
            <>
              <div className="mascotas-grid stagger-children">
                {mascotas.map((mascota) => (
                  <MascotaCard
                    key={mascota.id}
                    mascota={mascota}
                    getImageUrl={getOptimizedImageUrl}
                    variant="default"
                    onView={handleOpenPanel}
                  />
                ))}
              </div>

              {pagination.last_page > 1 && (
                <div className="pagination-container reveal-up delay-200">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                  >
                    <i className="fas fa-chevron-left"></i> {t('anterior', 'Anterior')}
                  </button>
                  <span className="pagination-info">
                    {t('pagina', 'Página')} {currentPage} {t('de', 'de')} {pagination.last_page}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.last_page}
                    className="pagination-btn"
                  >
                    {t('siguiente', 'Siguiente')} <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mensaje motivacional */}
      <div className="motivational-message reveal-up delay-300">
        <div className="bento-container">
          <div className="motivational-content">
            <i className="fas fa-paw motivational-icon"></i>
            <h3 className="motivational-title">{t("mensaje_motivacional_titulo")}</h3>
            <p className="motivational-text">{t("mensaje_motivacional_texto")}</p>
          </div>
        </div>
      </div>

      {/* Panel deslizable */}
      <SlideUpPanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        title={selectedMascota?.nombre_mascota || t('detalle', 'Detalle')}
      >
        {selectedMascota && (
          <MascotaDetalle mascotaId={selectedMascota.id} embed={true} />
        )}
      </SlideUpPanel>
    </div>
  );
};

export default Mascotas;