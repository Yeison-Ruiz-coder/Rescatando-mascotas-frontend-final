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
  const [eventosOrganizados, setEventosOrganizados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });
  const [currentFilters, setCurrentFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [likedEvents, setLikedEvents] = useState({});
  const [asistenciaEvents, setAsistenciaEvents] = useState({});

  const [selectedEvento, setSelectedEvento] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Función para calcular nivel de importancia del evento
  const calcularNivelImportancia = useCallback((evento, todosEventos) => {
    let puntos = 0;
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaEvento = new Date(evento.fecha_evento);
    fechaEvento.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((fechaEvento - hoy) / (1000 * 60 * 60 * 24));
    
    if (diffDays >= 0 && diffDays <= 1) puntos += 50;
    else if (diffDays >= 2 && diffDays <= 3) puntos += 30;
    else if (diffDays >= 4 && diffDays <= 7) puntos += 15;
    
    const maxAsistentes = Math.max(...todosEventos.map(e => e.total_asistentes || 0), 1);
    const porcentajeAsistentes = (evento.total_asistentes || 0) / maxAsistentes;
    if (porcentajeAsistentes >= 0.8) puntos += 40;
    else if (porcentajeAsistentes >= 0.5) puntos += 20;
    else if (porcentajeAsistentes >= 0.3) puntos += 10;
    
    const maxLikes = Math.max(...todosEventos.map(e => e.likes || 0), 1);
    const porcentajeLikes = (evento.likes || 0) / maxLikes;
    if (porcentajeLikes >= 0.8) puntos += 30;
    else if (porcentajeLikes >= 0.5) puntos += 15;
    else if (porcentajeLikes >= 0.3) puntos += 8;
    
    if (evento.imagen) puntos += 10;
    if (evento.es_gratuito) puntos += 15;
    if (evento.capacidad_total && evento.capacidad_total > 100) puntos += 10;
    else if (evento.capacidad_total && evento.capacidad_total > 50) puntos += 5;
    
    if (puntos >= 80) return 'muy-importante';
    if (puntos >= 50) return 'importante';
    return 'normal';
  }, []);

  const organizarEventosPorImportancia = useCallback((eventosList) => {
    if (!eventosList || eventosList.length === 0) return [];
    
    const eventosConImportancia = eventosList.map(evento => ({
      ...evento,
      nivelImportancia: calcularNivelImportancia(evento, eventosList),
      puntuacion: (() => {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const fechaEvento = new Date(evento.fecha_evento);
        fechaEvento.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((fechaEvento - hoy) / (1000 * 60 * 60 * 24));
        
        let puntos = 0;
        if (diffDays >= 0 && diffDays <= 1) puntos = 1000;
        else if (diffDays >= 2 && diffDays <= 3) puntos = 900;
        else if (diffDays >= 4 && diffDays <= 7) puntos = 800;
        else if (diffDays < 0) puntos = 100;
        else puntos = 700;
        
        const maxAsistentes = Math.max(...eventosList.map(e => e.total_asistentes || 0), 1);
        puntos += ((evento.total_asistentes || 0) / maxAsistentes) * 100;
        
        return puntos;
      })()
    }));
    
    const nivelOrden = { 'muy-importante': 3, 'importante': 2, 'normal': 1 };
    return eventosConImportancia.sort((a, b) => {
      if (nivelOrden[b.nivelImportancia] !== nivelOrden[a.nivelImportancia]) {
        return nivelOrden[b.nivelImportancia] - nivelOrden[a.nivelImportancia];
      }
      return b.puntuacion - a.puntuacion;
    });
  }, [calcularNivelImportancia]);

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

    params.sort = "-fecha_evento";

    console.log("📡 API Request Eventos:", params);

    const response = await api.get("/eventos", { params });

    // 🔍 LOG PARA VER LA ESTRUCTURA REAL
    console.log("📦 Respuesta completa:", JSON.stringify(response.data, null, 2));

    let eventosData = [];
    let paginationData = { current_page: 1, last_page: 1, total: 0 };

    // ✅ La respuesta correcta debería ser response.data.data (el paginador)
    if (response.data?.data && typeof response.data.data === 'object') {
      // Caso: { success: true, data: { data: [...], current_page, last_page, total } }
      if (Array.isArray(response.data.data.data)) {
        eventosData = response.data.data.data;
        paginationData = {
          current_page: response.data.data.current_page || page,
          last_page: response.data.data.last_page || 1,
          total: response.data.data.total || 0,
        };
      } 
      // Caso: response.data.data es directamente el array
      else if (Array.isArray(response.data.data)) {
        eventosData = response.data.data;
        paginationData = {
          current_page: page,
          last_page: 1,
          total: eventosData.length,
        };
      }
    } 
    // Caso: response.data es el paginador directamente
    else if (response.data && typeof response.data === 'object' && Array.isArray(response.data.data)) {
      eventosData = response.data.data;
      paginationData = {
        current_page: response.data.current_page || page,
        last_page: response.data.last_page || 1,
        total: response.data.total || 0,
      };
    }
    // Caso: response.data es un array directo
    else if (Array.isArray(response.data)) {
      eventosData = response.data;
      paginationData = {
        current_page: page,
        last_page: 1,
        total: eventosData.length,
      };
    }

    console.log("📊 Eventos cargados:", eventosData.length);
    console.log("📄 Paginación:", paginationData);

    setEventos(eventosData);
    setPagination(paginationData);

    const organizados = organizarEventosPorImportancia(eventosData);
    setEventosOrganizados(organizados);

    const asistenciaMap = {};
    eventosData.forEach((evento) => {
      if (evento.usuario_confirmado) {
        asistenciaMap[evento.id] = true;
      }
    });
    setAsistenciaEvents(asistenciaMap);
  } catch (err) {
    console.error("❌ Error:", err);
    setError(
      err.response?.data?.message || err.message || t("error_carga"),
    );
  } finally {
    setLoading(false);
  }
}, [t, organizarEventosPorImportancia]);

  useEffect(() => {
    loadEventos({}, 1);
  }, []);

  const handleFilterChange = useCallback(
    (newFilters) => {
      setCurrentFilters(newFilters);
      setCurrentPage(1);
      loadEventos(newFilters, 1);
    },
    [loadEventos],
  );

  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage === currentPage) return;
      setCurrentPage(newPage);
      loadEventos(currentFilters, newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [currentPage, currentFilters, loadEventos],
  );

  const handleLike = useCallback(
    async (id) => {
      if (!isAuthenticated) {
        alert(t("like.login_requerido"));
        return;
      }
      try {
        await api.post(`/eventos/${id}/like`);
        const newLikedState = !likedEvents[id];
        setLikedEvents((prev) => ({ ...prev, [id]: newLikedState }));
        
        const updateEventos = (prev) =>
          prev.map((evento) =>
            evento.id === id
              ? {
                  ...evento,
                  likes: (evento.likes || 0) + (newLikedState ? 1 : -1),
                }
              : evento,
          );
        
        setEventos(updateEventos);
        setEventosOrganizados(prev => organizarEventosPorImportancia(updateEventos(prev)));
      } catch (error) {
        console.error("Error al dar like:", error);
      }
    },
    [isAuthenticated, likedEvents, t, organizarEventosPorImportancia],
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
          const newAsistenciaState = false;
          setAsistenciaEvents((prev) => ({ ...prev, [id]: newAsistenciaState }));
          
          const updateEventos = (prev) =>
            prev.map((evento) =>
              evento.id === id
                ? {
                    ...evento,
                    total_asistentes: Math.max(0, (evento.total_asistentes || 0) - 1),
                  }
                : evento,
            );
          
          setEventos(updateEventos);
          setEventosOrganizados(prev => organizarEventosPorImportancia(updateEventos(prev)));
        } else {
          await api.post(`/eventos/${id}/confirmar-asistencia`);
          const newAsistenciaState = true;
          setAsistenciaEvents((prev) => ({ ...prev, [id]: newAsistenciaState }));
          
          const updateEventos = (prev) =>
            prev.map((evento) =>
              evento.id === id
                ? {
                    ...evento,
                    total_asistentes: (evento.total_asistentes || 0) + 1,
                  }
                : evento,
            );
          
          setEventos(updateEventos);
          setEventosOrganizados(prev => organizarEventosPorImportancia(updateEventos(prev)));
        }
      } catch (error) {
        console.error("Error:", error);
        alert(error.response?.data?.message || t("asistencia.error"));
      }
    },
    [isAuthenticated, asistenciaEvents, t, organizarEventosPorImportancia],
  );

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
    const baseUrl =
      import.meta.env.VITE_STORAGE_URL ||
      "https://rescatando-mascotas-backend-final-production.up.railway.app";
    return url.startsWith("/storage")
      ? `${baseUrl}${url}`
      : `${baseUrl}/storage/${url}`;
  };

  if (loading && eventos.length === 0) {
    return (
      <div className="eventos-page">
        <div className="eventos-loading">
          <LoadingSpinner text={t("cargando_eventos")} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="eventos-page">
        <div className="bento-container">
          <div className="eventos-error">
            <i className="fas fa-calendar-alt"></i>
            <h4>{t("error_titulo")}</h4>
            <p>{error}</p>
            <button
              onClick={() => loadEventos(currentFilters, currentPage)}
              className="eventos-reload-btn"
            >
              <i className="fas fa-sync-alt"></i> {t("reintentar")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const eventosAMostrar = eventosOrganizados.length > 0 ? eventosOrganizados : eventos;

  return (
    <div className="eventos-page">
      <div className="eventos-header reveal-up">
        <div className="eventos-hero">
          <img src="/img/hover/eventos.jpg" alt={t("titulo")} />
        </div>
        <div className="bento-container">
          <h1 className="reveal-up delay-200">{t("titulo")}</h1>
          {pagination.total > 0 && (
            <p className="eventos-info reveal-up delay-300">
              <i className="fas fa-heart"></i>{" "}
              {t("total_eventos", { total: pagination.total })}
            </p>
          )}
        </div>
      </div>

      <div className="eventos-filtros-section reveal-up delay-100">
        <div className="bento-container">
          <FiltrosEventos
            onFilterChange={handleFilterChange}
            eventos={eventos}
            isLoading={loading}
          />
        </div>
      </div>

      <div className="eventos-resultados-section">
        <div className="bento-container">
          <div className="eventos-resultados-header reveal-up delay-200">
            <div className="eventos-resultados-count">
              <i className="fas fa-list"></i> {t("mostrando")}{" "}
              <strong>{eventosAMostrar.length}</strong> {t("de")}{" "}
              <strong>{pagination.total}</strong> {t("eventos")}
            </div>
          </div>

          {eventosAMostrar.length === 0 ? (
            <div className="eventos-empty reveal-up">
              <i className="fas fa-calendar-alt"></i>
              <h3>{t("sin_resultados")}</h3>
              <p>{t("sin_resultados_desc")}</p>
            </div>
          ) : (
            <>
              <div className="eventos-grid stagger-children">
                {eventosAMostrar.map((evento) => {
                  let tamañoCard = 'evento-card-normal';
                  let badgeImportancia = null;
                  
                  if (evento.nivelImportancia === 'muy-importante') {
                    tamañoCard = 'evento-card-muy-importante';
                    badgeImportancia = (
                      <div className="importancia-badge muy-importante">
                        <i className="fas fa-crown"></i>
                        <span>¡Evento Estelar!</span>
                      </div>
                    );
                  } else if (evento.nivelImportancia === 'importante') {
                    tamañoCard = 'evento-card-importante';
                    badgeImportancia = (
                      <div className="importancia-badge">
                        <i className="fas fa-star"></i>
                        <span>Evento Destacado</span>
                      </div>
                    );
                  }
                  
                  return (
                    <div key={evento.id} className={tamañoCard} style={{ position: 'relative' }}>
                      {badgeImportancia}
                      <EventoCard
                        evento={evento}
                        getImageUrl={getImageUrl}
                        variant={evento.nivelImportancia !== 'normal' ? 'featured' : 'default'}
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

              {/* ✅ PAGINACIÓN - IGUAL QUE FUNDACIONES */}
              {pagination.last_page > 1 && (
                <div className="eventos-pagination-container reveal-up delay-300">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="eventos-pagination-btn"
                  >
                    <i className="fas fa-chevron-left"></i> Anterior
                  </button>
                  <span className="eventos-pagination-info">
                    Página {currentPage} de {pagination.last_page}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.last_page}
                    className="eventos-pagination-btn"
                  >
                    Siguiente <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="eventos-motivational reveal-up delay-400">
        <div className="bento-container">
          <div className="eventos-motivational-content">
            <i className="fas fa-paw eventos-motivational-icon"></i>
            <h3 className="eventos-motivational-title">
              {t("mensaje_motivacional_titulo")}
            </h3>
            <p className="eventos-motivational-text">
              {t("mensaje_motivacional_texto")}
            </p>
          </div>
        </div>
      </div>

      <SlideUpPanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        title={selectedEvento?.nombre_evento || t("detalle_evento")}
      >
        <EventosPublicShow eventoId={selectedEvento?.id} embed={true} />
      </SlideUpPanel>
    </div>
  );
};

export default EventosPublicIndex;