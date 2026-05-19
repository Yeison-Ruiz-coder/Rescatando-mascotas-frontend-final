// src/pages/public/Eventos/EventosPublicIndex.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, List, Heart, Loader, X } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { useFiltrosEventos } from "../../../contexts/FiltrosContext";
import api from "../../../services/api";
import EventoCard from "../../../components/common/EventoCard/EventoCard";
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

  const opcionesOrden = useMemo(() => [
    { value: "reciente", label: t("mas_recientes") },
    { value: "antiguos", label: t("mas_antiguos") },
    { value: "nombre", label: t("nombre_az") },
    { value: "capacidad", label: t("mayor_capacidad") },
  ], [t]);

  const getImageUrl = useCallback((url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    const baseUrl = import.meta.env.VITE_STORAGE_URL || 
      "https://rescatando-mascotas-backend-final-production.up.railway.app";
    return url.startsWith("/storage")
      ? `${baseUrl}${url}`
      : `${baseUrl}/storage/${url}`;
  }, []);

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
      eventosData.forEach(evento => {
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
            e.categoria?.toLowerCase().includes(busquedaLower)
        );
      }

      if (filtros.categoria && filtros.categoria.trim()) {
        resultado = resultado.filter(
          (e) => e.categoria?.toLowerCase() === filtros.categoria.toLowerCase()
        );
      }

      switch (orden) {
        case "nombre":
          resultado.sort((a, b) => a.nombre_evento?.localeCompare(b.nombre_evento));
          break;
        case "antiguos":
          resultado.sort((a, b) => new Date(a.fecha_evento) - new Date(b.fecha_evento));
          break;
        case "capacidad":
          resultado.sort((a, b) => (b.capacidad_maxima || 0) - (a.capacidad_maxima || 0));
          break;
        default:
          resultado.sort((a, b) => new Date(b.fecha_evento) - new Date(a.fecha_evento));
          break;
      }

      setEventosFiltrados(resultado);
    }
  }, [filtros, orden, eventos]);

  const handleLike = useCallback(async (id) => {
    if (!isAuthenticated) {
      alert(t("like.login_requerido"));
      return;
    }
    try {
      await api.post(`/eventos/${id}/like`);
      setLikedEvents(prev => ({ ...prev, [id]: !prev[id] }));
      setEventos(prev => prev.map(evento => 
        evento.id === id 
          ? { ...evento, likes: (evento.likes || 0) + (likedEvents[id] ? -1 : 1) }
          : evento
      ));
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
        setAsistenciaEvents(prev => ({ ...prev, [id]: false }));
        setEventos(prev => prev.map(evento => 
          evento.id === id 
            ? { ...evento, total_asistentes: Math.max(0, (evento.total_asistentes || 0) - 1) }
            : evento
        ));
      } else {
        await api.post(`/eventos/${id}/confirmar-asistencia`);
        setAsistenciaEvents(prev => ({ ...prev, [id]: true }));
        setEventos(prev => prev.map(evento => 
          evento.id === id 
            ? { ...evento, total_asistentes: (evento.total_asistentes || 0) + 1 }
            : evento
        ));
      }
    } catch (error) {
      console.error("Error:", error);
      alert(error.response?.data?.message || t("asistencia.error"));
    }
  }, [isAuthenticated, asistenciaEvents, t]);

  const handleClearFilters = () => {
    limpiarFiltros();
  };

  const hasActiveFilters = filtros.busqueda || filtros.categoria;

  if (loading) {
    return (
      <div className="public-eventos-page">
        <div className="public-eventos-loading">
          <Loader size={40} className="spinner" />
          <p>{t("cargando_eventos")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="public-eventos-page">
        <div className="container">
          <div className="public-eventos-error">
            <Calendar size={48} />
            <h4>{t("error_titulo")}</h4>
            <p>{error}</p>
            <button onClick={loadEventos} className="public-btn-retry">
              <Loader size={16} />
              {t("reintentar")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="public-eventos-page">
      <div className="public-eventos-header">
        <div className="container">
          <h1>
            <Calendar size={28} />
            {t("titulo")}
          </h1>
          <p className="subtitle">{t("subtitulo")}</p>
          {eventos.length > 0 && (
            <p className="info">
              <Heart size={14} style={{ color: "var(--color-heart)" }} />{" "}
              {t("total_eventos", { total: eventos.length })}
            </p>
          )}
        </div>
      </div>

      <div className="public-eventos-filtros-section sticky-glass glass-auto shadow-sticky">
        <div className="container">
          <FiltrosEventos variant={isMobile ? "modal" : "inline"} />
        </div>
      </div>

      <div className="public-eventos-resultados-section">
        <div className="container">
          <div className="public-eventos-resultados-header">
            <div className="public-eventos-resultados-count">
              <List size={16} />
              {t("mostrando")} <strong>{eventosFiltrados.length}</strong>{" "}
              {t("de")} <strong>{eventos.length}</strong> {t("eventos")}
            </div>
            <div className="public-eventos-resultados-orden">
              <label>{t("ordenar_por")}:</label>
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
              <Calendar size={64} />
              <h3>{t("sin_resultados")}</h3>
              <p>{t("sin_resultados_desc")}</p>
              {hasActiveFilters && (
                <button onClick={handleClearFilters} className="public-btn-limpiar-empty">
                  <X size={16} />
                  {t("limpiar_filtros")}
                </button>
              )}
            </div>
          ) : (
            <div className="public-eventos-grid">
              {eventosFiltrados.map((evento) => (
                <EventoCard
                  key={evento.id}
                  evento={evento}
                  getImageUrl={getImageUrl}
                  variant="default"
                  isAuthenticated={isAuthenticated}
                  liked={likedEvents[evento.id]}
                  asistencia={asistenciaEvents[evento.id]}
                  onLike={handleLike}
                  onConfirmarAsistencia={handleConfirmarAsistencia}
                  showActions={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventosPublicIndex;