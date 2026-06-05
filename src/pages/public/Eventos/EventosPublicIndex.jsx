// src/pages/public/Eventos/EventosPublicIndex.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../contexts/AuthContext";
import api from "../../../services/api";
import EventoCard from "../../../components/common/EventoCard/EventoCard";
import SlideUpPanel from "../../../components/common/SlideUpPanel/SlideUpPanel";
import EventosPublicShow from "./EventosPublicShow";
import FiltrosEventos from "../../../components/common/FiltrosEventos/FiltrosEventos";
import LoadingSpinner from "../../../components/common/LoadingSpinner/LoadingSpinner";
import "./EventosPublicIndex.css";

const EventosPublicIndex = () => {
  const { t } = useTranslation("eventos");
  const { isAuthenticated } = useAuth();
  
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [currentFilters, setCurrentFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [likedEvents, setLikedEvents] = useState({});
  const [asistenciaEvents, setAsistenciaEvents] = useState({});
  
  const [selectedEvento, setSelectedEvento] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const loadEventos = useCallback(async (filters = {}, page = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page: page,
        per_page: 12,
      };
      
      if (filters.buscar) params.buscar = filters.buscar;
      if (filters.tipo) params.tipo = filters.tipo;
      if (filters.proximos) params.proximos = filters.proximos;
      
      params.sort = '-fecha_evento';
      
      console.log("📡 API Request Eventos:", params);
      
      const response = await api.get('/eventos', { params });
      
      let eventosData = [];
      let paginationData = { current_page: 1, last_page: 1, total: 0 };
      
      if (response.data?.data?.data) {
        eventosData = response.data.data.data;
        paginationData = {
          current_page: response.data.data.current_page,
          last_page: response.data.data.last_page,
          total: response.data.data.total,
        };
      } else if (response.data?.data) {
        eventosData = response.data.data;
      } else if (Array.isArray(response.data)) {
        eventosData = response.data;
      }
      
      setEventos(eventosData);
      setPagination(paginationData);
      
      const asistenciaMap = {};
      eventosData.forEach((evento) => {
        if (evento.usuario_confirmado) {
          asistenciaMap[evento.id] = true;
        }
      });
      setAsistenciaEvents(asistenciaMap);
      
    } catch (err) {
      console.error("❌ Error:", err);
      setError(err.response?.data?.message || err.message || "Error al cargar eventos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEventos({}, 1);
  }, []);

  const handleFilterChange = useCallback((newFilters) => {
    console.log("📝 Filtros aplicados:", newFilters);
    setCurrentFilters(newFilters);
    setCurrentPage(1);
    loadEventos(newFilters, 1);
  }, [loadEventos]);

  const handlePageChange = useCallback((newPage) => {
    if (newPage === currentPage) return;
    setCurrentPage(newPage);
    loadEventos(currentFilters, newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, currentFilters, loadEventos]);

  const handleLike = useCallback(async (id) => {
    if (!isAuthenticated) {
      alert(t("like.login_requerido"));
      return;
    }
    try {
      await api.post(`/eventos/${id}/like`);
      setLikedEvents((prev) => ({ ...prev, [id]: !prev[id] }));
      setEventos((prev) =>
        prev.map((evento) =>
          evento.id === id
            ? { ...evento, likes: (evento.likes || 0) + (likedEvents[id] ? -1 : 1) }
            : evento
        )
      );
    } catch (error) {
      console.error("Error al dar like:", error);
    }
  }, [isAuthenticated, likedEvents, t]);

  const handleConfirmarAsistencia = useCallback(async (id) => {
    if (!isAuthenticated) {
      alert(t("asistencia.login_requerido"));
      return;
    }
    try {
      if (asistenciaEvents[id]) {
        await api.delete(`/eventos/${id}/cancelar-asistencia`);
        setAsistenciaEvents((prev) => ({ ...prev, [id]: false }));
        setEventos((prev) =>
          prev.map((evento) =>
            evento.id === id
              ? { ...evento, total_asistentes: Math.max(0, (evento.total_asistentes || 0) - 1) }
              : evento
          )
        );
      } else {
        await api.post(`/eventos/${id}/confirmar-asistencia`);
        setAsistenciaEvents((prev) => ({ ...prev, [id]: true }));
        setEventos((prev) =>
          prev.map((evento) =>
            evento.id === id
              ? { ...evento, total_asistentes: (evento.total_asistentes || 0) + 1 }
              : evento
          )
        );
      }
    } catch (error) {
      console.error("Error:", error);
      alert(error.response?.data?.message || t("asistencia.error"));
    }
  }, [isAuthenticated, asistenciaEvents, t]);

  const handleOpenPanel = (evento) => {
    setSelectedEvento(evento);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setSelectedEvento(null);
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    const baseUrl = import.meta.env.VITE_STORAGE_URL || "https://rescatando-mascotas-backend-final-production.up.railway.app";
    return url.startsWith("/storage") ? `${baseUrl}${url}` : `${baseUrl}/storage/${url}`;
  };

  if (loading && eventos.length === 0) {
    return (
      <div className="public-eventos-page">
        <div className="public-eventos-loading">
          <LoadingSpinner text={t("cargando_eventos")} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="public-eventos-page">
        <div className="bento-container">
          <div className="public-eventos-error">
            <i className="fas fa-calendar-alt"></i>
            <h4>{t("error_titulo")}</h4>
            <p>{error}</p>
            <button onClick={() => loadEventos(currentFilters, currentPage)} className="public-btn-retry">
              <i className="fas fa-sync-alt"></i> {t("reintentar")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="public-eventos-page">
      <div className="public-eventos-header">
        <div className="public-eventos-hero">
          <img src="/img/hover/eventos.jpg" alt={t("titulo")} />
        </div>
        <div className="bento-container">
          <h1>{t("titulo")}</h1>
          {pagination.total > 0 && (
            <p className="info">
              <i className="fas fa-heart"></i> {t("total_eventos", { total: pagination.total })}
            </p>
          )}
        </div>
      </div>

      <div className="public-eventos-filtros-section">
        <div className="bento-container">
          <FiltrosEventos onFilterChange={handleFilterChange} />
        </div>
      </div>

      <div className="public-eventos-resultados-section">
        <div className="bento-container">
          <div className="public-eventos-resultados-header">
            <div className="public-eventos-resultados-count">
              <i className="fas fa-list"></i> Mostrando <strong>{eventos.length}</strong> de <strong>{pagination.total}</strong> eventos
            </div>
          </div>

          {eventos.length === 0 ? (
            <div className="public-eventos-empty">
              <i className="fas fa-calendar-alt"></i>
              <h3>{t("sin_resultados")}</h3>
              <p>{t("sin_resultados_desc")}</p>
            </div>
          ) : (
            <>
              <div className="public-eventos-grid">
                {eventos.map((evento, index) => {
                  let sizeVariant = "default";
                  if (index === 0) sizeVariant = "featured";
                  else if (index % 5 === 0) sizeVariant = "compact";
                  
                  return (
                    <div key={evento.id} className={`evento-grid-item ${sizeVariant}`}>
                      <EventoCard
                        evento={evento}
                        getImageUrl={getImageUrl}
                        variant="default"
                        isAuthenticated={isAuthenticated}
                        liked={likedEvents[evento.id]}
                        asistencia={asistenciaEvents[evento.id]}
                        onLike={handleLike}
                        onConfirmarAsistencia={handleConfirmarAsistencia}
                        onView={handleOpenPanel}
                        showActions={true}
                      />
                    </div>
                  );
                })}
              </div>

              {pagination.last_page > 1 && (
                <div className="pagination-container">
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

      <div className="public-eventos-motivational">
        <div className="bento-container">
          <div className="motivational-content">
            <i className="fas fa-paw motivational-icon"></i>
            <h3 className="motivational-title">{t("mensaje_motivacional_titulo")}</h3>
            <p className="motivational-text">{t("mensaje_motivacional_texto")}</p>
          </div>
        </div>
      </div>

      <SlideUpPanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        title={selectedEvento?.nombre_evento || t("detalle_evento")}
      >
        <EventosPublicShow eventoId={selectedEvento?.id} />
      </SlideUpPanel>
    </div>
  );
};

export default EventosPublicIndex;