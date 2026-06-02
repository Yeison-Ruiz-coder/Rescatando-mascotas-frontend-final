// src/pages/public/Eventos/EventosPublicIndex.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../contexts/AuthContext";
import { useFiltrosEventos } from "../../../contexts/FiltrosContext";
import api from "../../../services/api";
import EventoCard from "../../../components/common/EventoCard/EventoCard";
import SlideUpPanel from "../../../components/common/SlideUpPanel/SlideUpPanel";
import EventosPublicShow from "./EventosPublicShow";
import CustomSelect from "../../../components/common/CustomSelect/CustomSelect";
import FiltrosEventos from "../../../components/common/FiltrosEventos/FiltrosEventos";
import "./EventosPublicIndex.css";

const EventosPublicIndex = () => {
  const { t } = useTranslation("eventos");
  const { isAuthenticated } = useAuth();
  const { filtros, limpiarFiltros } = useFiltrosEventos();
  const [eventos, setEventos] = useState([]);
  const [eventosFiltrados, setEventosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orden, setOrden] = useState("reciente");
  const [isMobile, setIsMobile] = useState(false);
  const [likedEvents, setLikedEvents] = useState({});
  const [asistenciaEvents, setAsistenciaEvents] = useState({});

  // Estado para el panel deslizable
  const [selectedEvento, setSelectedEvento] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const opcionesOrden = useMemo(
    () => [
      { value: "reciente", label: t("mas_recientes") },
      { value: "antiguos", label: t("mas_antiguos") },
      { value: "nombre", label: t("nombre_az") },
      { value: "capacidad", label: t("mayor_capacidad") },
    ],
    [t],
  );

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

  const handleOpenPanel = (evento) => {
    setSelectedEvento(evento);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setSelectedEvento(null);
  };

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  const loadEventos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/eventos`);

      let eventosData = [];
      if (response.data && response.data.success !== undefined) {
        eventosData = response.data.data?.data || response.data.data || [];
      } else if (response.data && response.data.data) {
        eventosData = response.data.data.data || response.data.data;
      } else if (Array.isArray(response.data)) {
        eventosData = response.data;
      }

      setEventos(eventosData);
      setEventosFiltrados(eventosData);

      const asistenciaMap = {};
      eventosData.forEach((evento) => {
        if (evento.usuario_confirmado) {
          asistenciaMap[evento.id] = true;
        }
      });
      setAsistenciaEvents(asistenciaMap);
    } catch (error) {
      console.error("Error:", error);
      setError(error.response?.data?.message || t("error_carga"));
      setEventos([]);
      setEventosFiltrados([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadEventos();
  }, [loadEventos]);

  useEffect(() => {
    if (eventos.length > 0) {
      let resultado = [...eventos];

      if (filtros.busqueda && filtros.busqueda.trim()) {
        const busquedaLower = filtros.busqueda.toLowerCase().trim();
        resultado = resultado.filter(
          (e) =>
            e.nombre_evento?.toLowerCase().includes(busquedaLower) ||
            e.lugar_evento?.toLowerCase().includes(busquedaLower) ||
            e.categoria?.toLowerCase().includes(busquedaLower),
        );
      }

      if (filtros.categoria && filtros.categoria.trim()) {
        resultado = resultado.filter(
          (e) => e.categoria?.toLowerCase() === filtros.categoria.toLowerCase(),
        );
      }

      switch (orden) {
        case "nombre":
          resultado.sort((a, b) =>
            a.nombre_evento?.localeCompare(b.nombre_evento),
          );
          break;
        case "antiguos":
          resultado.sort(
            (a, b) => new Date(a.fecha_evento) - new Date(b.fecha_evento),
          );
          break;
        case "capacidad":
          resultado.sort(
            (a, b) => (b.capacidad_maxima || 0) - (a.capacidad_maxima || 0),
          );
          break;
        default:
          resultado.sort(
            (a, b) => new Date(b.fecha_evento) - new Date(a.fecha_evento),
          );
          break;
      }

      setEventosFiltrados(resultado);
    }
  }, [filtros, orden, eventos]);

  const handleLike = useCallback(
    async (id) => {
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
              ? {
                  ...evento,
                  likes: (evento.likes || 0) + (likedEvents[id] ? -1 : 1),
                }
              : evento,
          ),
        );
      } catch (error) {
        console.error("Error al dar like:", error);
      }
    },
    [isAuthenticated, likedEvents, t],
  );

  const handleConfirmarAsistencia = useCallback(
    async (id) => {
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
                ? {
                    ...evento,
                    total_asistentes: Math.max(
                      0,
                      (evento.total_asistentes || 0) - 1,
                    ),
                  }
                : evento,
            ),
          );
        } else {
          await api.post(`/eventos/${id}/confirmar-asistencia`);
          setAsistenciaEvents((prev) => ({ ...prev, [id]: true }));
          setEventos((prev) =>
            prev.map((evento) =>
              evento.id === id
                ? {
                    ...evento,
                    total_asistentes: (evento.total_asistentes || 0) + 1,
                  }
                : evento,
            ),
          );
        }
      } catch (error) {
        console.error("Error:", error);
        alert(error.response?.data?.message || t("asistencia.error"));
      }
    },
    [isAuthenticated, asistenciaEvents, t],
  );

  const handleClearFilters = () => {
    limpiarFiltros();
  };

  const hasActiveFilters = filtros.busqueda || filtros.categoria;

  if (loading) {
    return (
      <div className="public-eventos-page">
        <div className="public-eventos-loading">
          <div className="spinner"></div>
          <p>{t("cargando_eventos")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="public-eventos-page">
        <div className="bento-container">
          <div className="public-eventos-error">
            <i className="fas fa-calendar-alt fa-3x"></i>
            <h4>{t("error_titulo")}</h4>
            <p>{error}</p>
            <button onClick={loadEventos} className="public-btn-retry">
              <i className="fas fa-sync-alt"></i>
              {t("reintentar")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="public-eventos-page">
      {/* Header con imagen de fondo */}
      <div className="public-eventos-header">
        <div className="public-eventos-hero">
          <img src="/img/hover/eventos.jpg" alt={t("titulo")} />
        </div>
        <div className="bento-container">
          <h1>{t("titulo")}</h1>
          {eventos.length > 0 && (
            <p className="info">
              <i className="fas fa-heart"></i>{" "}
              {t("total_eventos", { total: eventos.length })}
            </p>
          )}
        </div>
      </div>

      {/* Filtros section */}
      <div className="public-eventos-filtros-section">
        <div className="bento-container">
          <FiltrosEventos variant={isMobile ? "modal" : "inline"} />
        </div>
      </div>

      {/* Resultados section */}
      <div className="public-eventos-resultados-section">
        <div className="bento-container">
          <div className="public-eventos-resultados-header">
            <div className="public-eventos-resultados-count">
              <i className="fas fa-list"></i>
              {t("mostrando")} <strong>{eventosFiltrados.length}</strong>{" "}
              {t("de")} <strong>{eventos.length}</strong> {t("eventos")}
            </div>
            <div className="public-eventos-resultados-orden">
              <label>
                <i className="fas fa-sort"></i> {t("ordenar_por")}:
              </label>
              <CustomSelect
                options={opcionesOrden}
                value={orden}
                onChange={(e) => setOrden(e.target.value)}
                name="orden"
              />
            </div>
          </div>
          {eventosFiltrados.length === 0 ? (
            <div className="public-eventos-empty">
              <i className="fas fa-calendar-alt"></i>
              <h3>{t("sin_resultados")}</h3>
              <p>{t("sin_resultados_desc")}</p>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="public-btn-limpiar-empty"
                >
                  <i className="fas fa-times"></i>
                  {t("limpiar_filtros")}
                </button>
              )}
            </div>
          ) : (
            <div className="public-eventos-grid">
              {eventosFiltrados.map((evento, index) => {
                let sizeVariant = "default";
                if (index === 0) {
                  sizeVariant = "featured";
                } else if (index % 5 === 0) {
                  sizeVariant = "compact";
                }

                return (
                  <div
                    key={evento.id}
                    className={`evento-grid-item ${sizeVariant}`}
                  >
                    <EventoCard
                      evento={evento}
                      getImageUrl={getImageUrl}
                      variant="default"
                      isAuthenticated={isAuthenticated}
                      liked={likedEvents[evento.id]}
                      asistencia={asistenciaEvents[evento.id]}
                      onLike={handleLike}
                      onConfirmarAsistencia={handleConfirmarAsistencia}
                      onView={(evento) => handleOpenPanel(evento)} // ← Solo aquí
                      showActions={true}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mensaje motivacional */}
      <div className="public-eventos-motivational">
        <div className="bento-container">
          <div className="motivational-content">
            <i className="fas fa-paw motivational-icon"></i>
            <h3 className="motivational-title">
              {t("mensaje_motivacional_titulo") ||
                "Participa y ayuda a cambiar vidas"}
            </h3>
            <p className="motivational-text">
              {t("mensaje_motivacional_texto") ||
                "Los eventos son una gran oportunidad para conocer, aprender y contribuir al bienestar de los animales. ¡No te los pierdas!"}
            </p>
          </div>
        </div>
      </div>

      {/* Panel deslizable para detalle del evento */}
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
