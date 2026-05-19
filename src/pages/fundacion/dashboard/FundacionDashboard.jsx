// src/pages/fundacion/dashboard/FundacionDashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../contexts/AuthContext";
import api from "../../../services/api";
import { rescateService } from "../../../services/rescateService";
import { suscripcionService } from "../../../services/suscripcionService";
import LoadingSpinner from "../../../components/common/LoadingSpinner/LoadingSpinner";
import { getImageUrl } from "../../../utils/imageUtils";
import "./FundacionDashboard.css";

const FundacionDashboard = () => {
  const { t, i18n } = useTranslation("fundacion");
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalMascotas: 0,
    enAdopcion: 0,
    adoptadas: 0,
    rescatadas: 0,
    totalEventos: 0,
    eventosProximos: 0,
    totalSuscripciones: 0,
    montoMensual: 0,
    rescatesPendientes: 0,
  });
  const [mascotasRecientes, setMascotasRecientes] = useState([]);
  const [eventosProximos, setEventosProximos] = useState([]);
  const [actividadReciente, setActividadReciente] = useState([]);
  const [rescatesPendientes, setRescatesPendientes] = useState([]);

  // Función para formatear fechas según el idioma
  const formatDateByLocale = (date, options = {}) => {
    if (!date) return "";
    const locale = i18n.language === "en" ? "en-US" : "es-ES";
    const defaultOptions = { year: "numeric", month: "long", day: "numeric" };
    return new Date(date).toLocaleDateString(locale, { ...defaultOptions, ...options });
  };

  const formatTimeByLocale = (date) => {
    if (!date) return "";
    const locale = i18n.language === "en" ? "en-US" : "es-ES";
    return new Date(date).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  };

  // Función para extraer datos de respuesta API
  const extractData = (response) => {
    if (response.data?.success && response.data.data) {
      return response.data.data;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (response.data?.data?.data && Array.isArray(response.data.data.data)) {
      return response.data.data.data;
    }
    return [];
  };

  const cargarDatosDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("🚀 Cargando dashboard...");

      // ============================================
      // 1. Cargar mascotas
      // ============================================
      let mascotas = [];
      try {
        const mascotasRes = await api.get("/entity/mascotas");
        if (mascotasRes.data?.success && Array.isArray(mascotasRes.data.data)) {
          mascotas = mascotasRes.data.data;
        }
      } catch (err) {
        console.error("❌ Error cargando mascotas:", err);
      }

      const enAdopcion = mascotas.filter(
        (m) => m.estado === "En adopcion" || m.estado === "En adopción"
      ).length;
      const adoptadas = mascotas.filter((m) => m.estado === "Adoptado").length;

      const recientes = [...mascotas]
        .sort(
          (a, b) =>
            new Date(b.created_at || b.fecha_ingreso || 0) -
            new Date(a.created_at || a.fecha_ingreso || 0)
        )
        .slice(0, 5);

      // ============================================
      // 2. Cargar eventos
      // ============================================
      let eventos = [];
      try {
        const eventosRes = await api.get("/entity/eventos");
        if (eventosRes.data?.success && Array.isArray(eventosRes.data.data)) {
          eventos = eventosRes.data.data;
        }
      } catch (err) {
        console.error("❌ Error cargando eventos:", err);
      }

      const ahora = new Date();
      const proximos = eventos
        .filter((e) => {
          if (!e.fecha_evento) return false;
          try {
            return new Date(e.fecha_evento) > ahora;
          } catch {
            return false;
          }
        })
        .sort((a, b) => {
          try {
            return new Date(a.fecha_evento) - new Date(b.fecha_evento);
          } catch {
            return 0;
          }
        })
        .slice(0, 5);

      // ============================================
      // 3. Cargar rescates
      // ============================================
      let rescates = [];
      let pendientes = [];
      try {
        const rescatesRes = await rescateService.getMisRescates();
        if (rescatesRes?.data?.success) {
          if (Array.isArray(rescatesRes.data.data?.data)) {
            rescates = rescatesRes.data.data.data;
          } else if (Array.isArray(rescatesRes.data.data)) {
            rescates = rescatesRes.data.data;
          }
        }
        pendientes = rescates
          .filter((r) => r.estado === "pendiente" || r.estado === "en_proceso")
          .slice(0, 5);
      } catch (err) {
        console.error("❌ Error cargando rescates:", err);
      }

      // ============================================
      // 4. Cargar suscripciones
      // ============================================
      let suscripciones = [];
      let montoTotal = 0;
      try {
        const suscripcionesRes = await suscripcionService.getFundacionSuscripciones();
        if (Array.isArray(suscripcionesRes)) {
          suscripciones = suscripcionesRes;
        } else if (suscripcionesRes?.data) {
          suscripciones = Array.isArray(suscripcionesRes.data) ? suscripcionesRes.data : [];
        }
        montoTotal = suscripciones
          .filter((s) => s.estado === "activo")
          .reduce((sum, s) => sum + (parseFloat(s.monto_mensual) || 0), 0);
      } catch (err) {
        console.log("ℹ️ No hay suscripciones disponibles");
      }

      // ============================================
      // 5. Actividad reciente
      // ============================================
      const actividades = [
        ...mascotas.slice(0, 3).map((m) => ({
          id: m.id,
          tipo: "mascota",
          titulo: `${t("actividad_mascota_titulo", "Nueva mascota registrada")}: ${m.nombre_mascota}`,
          fecha: m.created_at || m.fecha_ingreso || new Date(),
          icono: "fa-paw",
          color: "var(--color-primary)",
        })),
        ...eventos.slice(0, 2).map((e) => ({
          id: e.id,
          tipo: "evento",
          titulo: `${t("actividad_evento_titulo", "Evento creado")}: ${e.nombre_evento}`,
          fecha: e.created_at || new Date(),
          icono: "fa-calendar",
          color: "var(--color-accent)",
        })),
      ]
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .slice(0, 5);

      setStats({
        totalMascotas: mascotas.length,
        enAdopcion,
        adoptadas,
        totalEventos: eventos.length,
        eventosProximos: proximos.length,
        totalSuscripciones: suscripciones.length,
        montoMensual: montoTotal,
        rescatesPendientes: pendientes.length,
      });

      setMascotasRecientes(recientes);
      setEventosProximos(proximos);
      setActividadReciente(actividades);
      setRescatesPendientes(pendientes);
    } catch (error) {
      console.error("❌ Error general:", error);
      setError(error.message || t("error_carga", "Error al cargar los datos"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    cargarDatosDashboard();
  }, [cargarDatosDashboard]);

  const formatRelativeTime = (date) => {
    if (!date) return t("recientemente", "Recientemente");
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return t("justo_ahora", "Justo ahora");
    if (minutes < 60) return t("hace_minutos", "Hace {{count}} minutos", { count: minutes });
    if (hours < 24) return t("hace_horas", "Hace {{count}} horas", { count: hours });
    if (days < 7) return t("hace_dias", "Hace {{count}} días", { count: days });
    return formatDateByLocale(date);
  };

  const getEstadoText = (estado) => {
    if (estado === "En adopcion" || estado === "En adopción") {
      return t("estado_en_adopcion", "En adopción");
    }
    if (estado === "Adoptado") {
      return t("estado_adoptado", "Adoptado");
    }
    return t("estado_rescatada", "Rescatada");
  };

  const getEstadoClass = (estado) => {
    if (estado === "En adopcion" || estado === "En adopción") return "fd-status-adopcion";
    if (estado === "Adoptado") return "fd-status-adoptado";
    return "fd-status-rescatada";
  };

  const getPrioridadText = (prioridad) => {
    if (prioridad === "alta") return t("alta", "Alta");
    if (prioridad === "media") return t("media", "Media");
    return t("baja", "Baja");
  };

  const getPrioridadClass = (prioridad) => {
    if (prioridad === "alta") return "prioridad-alta";
    if (prioridad === "media") return "prioridad-media";
    return "prioridad-baja";
  };

  const getPrioridadIcon = (prioridad) => {
    if (prioridad === "alta") return "fa-exclamation-triangle";
    if (prioridad === "media") return "fa-exclamation-circle";
    return "fa-info-circle";
  };

  const getPrioridadLabel = (prioridad) => {
    if (prioridad === "alta") return t("urgente", "Urgente");
    if (prioridad === "media") return t("normal", "Normal");
    return t("leve", "Leve");
  };

  const getEstadoRescateText = (estado) => {
    if (estado === "pendiente") return t("estado_pendiente", "Pendiente");
    return t("estado_en_proceso", "En proceso");
  };

  const getEstadoRescateClass = (estado) => {
    return estado === "pendiente" ? "pendiente" : "en_proceso";
  };

  if (loading) {
    return (
      <div className="fd-dashboard-container">
        <LoadingSpinner text={t("cargando_dashboard", "Cargando dashboard...")} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="fd-dashboard-container">
        <div className="fd-error-state">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>{t("error_titulo", "Error al cargar el dashboard")}</h3>
          <p>{error}</p>
          <button onClick={cargarDatosDashboard} className="fd-retry-btn">
            <i className="fas fa-sync-alt"></i> {t("reintentar", "Reintentar")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fd-dashboard-container">
      <div className="fd-container">
        {/* Header */}
        <div className="fd-header">
          <h1>
            <i className="fas fa-chart-line"></i>
            {t("dashboard_titulo", "Panel de Control")}
          </h1>
          <p>
            {t("dashboard_bienvenida", "Bienvenido de vuelta")}, {user?.name || t("fundacion", "Fundación")}!
            {" "}{t("dashboard_desc", "Aquí tienes un resumen de tu actividad")}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="fd-stats-grid">
          <div className="fd-stat-card">
            <div className="fd-stat-icon">
              <i className="fas fa-paw"></i>
            </div>
            <div className="fd-stat-value">{stats.totalMascotas}</div>
            <div className="fd-stat-label">{t("total_mascotas", "Total Mascotas")}</div>
          </div>

          <div className="fd-stat-card">
            <div className="fd-stat-icon">
              <i className="fas fa-heart"></i>
            </div>
            <div className="fd-stat-value">{stats.enAdopcion}</div>
            <div className="fd-stat-label">{t("en_adopcion", "En Adopción")}</div>
          </div>

          <div className="fd-stat-card">
            <div className="fd-stat-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="fd-stat-value">{stats.adoptadas}</div>
            <div className="fd-stat-label">{t("adoptadas", "Adoptadas")}</div>
          </div>

          <div className="fd-stat-card">
            <div className="fd-stat-icon">
              <i className="fas fa-calendar"></i>
            </div>
            <div className="fd-stat-value">{stats.eventosProximos}</div>
            <div className="fd-stat-label">{t("eventos_proximos", "Eventos Próximos")}</div>
          </div>
        </div>

        {/* Grid Principal - Mascotas Recientes y Eventos Próximos */}
        <div className="fd-grid-2">
          {/* Mascotas Recientes */}
          <div className="fd-section">
            <div className="fd-section-header">
              <h2>
                <i className="fas fa-paw"></i>
                {t("mascotas_recientes", "Mascotas Recientes")}
              </h2>
              <Link to="/fundacion/mascotas" className="fd-section-link">
                {t("ver_todas", "Ver todas")} <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
            <div className="fd-content-card">
              <div className="fd-card-body">
                {mascotasRecientes.length === 0 ? (
                  <div className="fd-empty-state">
                    <i className="fas fa-paw"></i>
                    <p>{t("sin_mascotas", "No hay mascotas registradas")}</p>
                    <Link to="/fundacion/mascotas/nueva" className="fd-empty-link">
                      <i className="fas fa-plus-circle"></i>
                      {t("registrar_primera", "Registrar primera mascota")}
                    </Link>
                  </div>
                ) : (
                  mascotasRecientes.map((mascota) => (
                    <div key={mascota.id} className="fd-pet-card">
                      <img
                        src={getImageUrl(mascota.foto_principal)}
                        alt={mascota.nombre_mascota}
                        className="fd-pet-image"
                        onError={(e) => {
                          e.target.src = "https://placehold.co/60x60?text=🐾";
                        }}
                      />
                      <div className="fd-pet-info">
                        <div className="fd-pet-name">{mascota.nombre_mascota}</div>
                        <div className="fd-pet-details">
                          <span>
                            <i className="fas fa-tag"></i> {mascota.especie || t("no_especificada", "?")}
                          </span>
                          <span>•</span>
                          <span>
                            <i className="fas fa-calendar"></i> {mascota.edad_aprox || "?"}{" "}
                            {t("años", "años")}
                          </span>
                        </div>
                      </div>
                      <span className={`fd-pet-status ${getEstadoClass(mascota.estado)}`}>
                        <i className={`fas ${mascota.estado === "Adoptado" ? "fa-check-circle" : "fa-heart"}`}></i>
                        {getEstadoText(mascota.estado)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Eventos Próximos */}
          <div className="fd-section">
            <div className="fd-section-header">
              <h2>
                <i className="fas fa-calendar-alt"></i>
                {t("eventos_proximos", "Eventos Próximos")}
              </h2>
              <Link to="/fundacion/eventos" className="fd-section-link">
                {t("ver_todos", "Ver todos")} <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
            <div className="fd-content-card">
              <div className="fd-card-body">
                {eventosProximos.length === 0 ? (
                  <div className="fd-empty-state">
                    <i className="fas fa-calendar"></i>
                    <p>{t("sin_eventos", "No hay eventos programados")}</p>
                    <Link to="/fundacion/eventos/crear" className="fd-empty-link">
                      <i className="fas fa-plus-circle"></i>
                      {t("crear_primero", "Crear primer evento")}
                    </Link>
                  </div>
                ) : (
                  eventosProximos.map((evento) => {
                    const imageUrl = evento.imagen_url ? getImageUrl(evento.imagen_url) : null;
                    return (
                      <div key={evento.id} className="fd-event-card">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={evento.nombre_evento}
                            className="fd-event-image"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="fd-event-date-badge">
                            <div className="fd-event-day">{formatDateByLocale(evento.fecha_evento, { day: "numeric" })}</div>
                            <div className="fd-event-month">
                              {formatDateByLocale(evento.fecha_evento, { month: "short" })}
                            </div>
                          </div>
                        )}

                        <div className="fd-event-info">
                          <div className="fd-event-title">
                            {evento.nombre_evento}
                            {evento.categoria && (
                              <span className="fd-event-category">
                                <i className="fas fa-tag"></i> {evento.categoria}
                              </span>
                            )}
                          </div>

                          <div className="fd-event-details">
                            <span className="fd-event-location">
                              <i className="fas fa-map-marker-alt"></i>
                              {evento.lugar_evento}
                            </span>
                            <span className="fd-event-time">
                              <i className="fas fa-clock"></i>
                              {formatTimeByLocale(evento.fecha_evento)}
                            </span>
                            {evento.capacidad_maxima && (
                              <span className="fd-event-capacity">
                                <i className="fas fa-users"></i>
                                {t("capacidad", "Cap")}: {evento.capacidad_maxima}
                              </span>
                            )}
                          </div>

                          <div className="fd-event-stats">
                            <span className="fd-event-stat heart">
                              <i className="fas fa-heart"></i>
                              {evento.likes || 0}
                            </span>
                            <span className="fd-event-stat users">
                              <i className="fas fa-user-check"></i>
                              {evento.total_asistentes || 0} {t("asistentes", "asistentes")}
                            </span>
                          </div>
                          
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Segunda fila - Actividad Reciente y Rescates */}
        <div className="fd-grid-2">
          {/* Actividad Reciente */}
          <div className="fd-section">
            <div className="fd-section-header">
              <h2>
                <i className="fas fa-history"></i>
                {t("actividad_reciente", "Actividad Reciente")}
              </h2>
            </div>
            <div className="fd-content-card">
              <div className="fd-card-body">
                {actividadReciente.length === 0 ? (
                  <div className="fd-empty-state">
                    <i className="fas fa-history"></i>
                    <p>{t("sin_actividad", "No hay actividad reciente")}</p>
                  </div>
                ) : (
                  <ul className="fd-activity-list">
                    {actividadReciente.map((actividad, idx) => (
                      <li key={idx} className="fd-activity-item">
                        <div className="fd-activity-icon" style={{ background: `${actividad.color}15` }}>
                          <i className={`fas ${actividad.icono}`} style={{ color: actividad.color }}></i>
                        </div>
                        <div className="fd-activity-content">
                          <div className="fd-activity-title">{actividad.titulo}</div>
                          <div className="fd-activity-time">
                            <i className="fas fa-clock"></i> {formatRelativeTime(actividad.fecha)}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Rescates Pendientes / En Proceso */}
          <div className="fd-section">
            <div className="fd-section-header">
              <h2>
                <i className="fas fa-ambulance"></i>
                {t("rescates_pendientes", "Rescates Activos")}
              </h2>
              <Link to="/fundacion/rescates/mis-rescates" className="fd-section-link">
                {t("ver_todos", "Ver todos")} <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
            <div className="fd-content-card">
              <div className="fd-card-body">
                {rescatesPendientes.length === 0 ? (
                  <div className="fd-empty-state">
                    <i className="fas fa-check-circle"></i>
                    <p>{t("sin_rescates", "No hay rescates activos")}</p>
                    <Link to="/fundacion/rescates/disponibles" className="fd-empty-link">
                      <i className="fas fa-search"></i>
                      {t("ver_disponibles", "Ver rescates disponibles")}
                    </Link>
                  </div>
                ) : (
                  rescatesPendientes.map((rescate) => (
                    <div key={rescate.id} className="fd-rescue-card">
                      <div className={`fd-rescue-icon ${getPrioridadClass(rescate.prioridad)}`}>
                        <i className={`fas ${getPrioridadIcon(rescate.prioridad)}`}></i>
                        <span>{getPrioridadLabel(rescate.prioridad)}</span>
                      </div>

                      <div className="fd-rescue-info">
                        <div className="fd-rescue-title">
                          {rescate.lugar_rescate || t("lugar_no_especificado", "Lugar no especificado")}
                          <span className={`fd-rescue-badge ${getEstadoRescateClass(rescate.estado)}`}>
                            <i className="fas fa-circle"></i>
                            {getEstadoRescateText(rescate.estado)}
                          </span>
                        </div>

                        <div className="fd-rescue-details">
                          {rescate.fecha_rescate && (
                            <span className="fd-rescue-date">
                              <i className="fas fa-calendar"></i>
                              {formatDateByLocale(rescate.fecha_rescate)}
                            </span>
                          )}
                        </div>

                        <div className={`fd-rescue-priority ${getPrioridadClass(rescate.prioridad)}`}>
                          <i className={`fas ${getPrioridadIcon(rescate.prioridad)}`}></i>
                          {t("prioridad", "Prioridad")}: {getPrioridadText(rescate.prioridad)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="fd-section">
          <div className="fd-section-header">
            <h2>
              <i className="fas fa-bolt"></i>
              {t("acciones_rapidas", "Acciones Rápidas")}
            </h2>
          </div>
          <div className="fd-grid-3">
            <Link to="/fundacion/mascotas/nueva" className="fd-quick-action-card">
              <div className="fd-quick-action">
                <i className="fas fa-plus-circle"></i>
                <h3>{t("registrar_mascota", "Registrar Mascota")}</h3>
              </div>
            </Link>
            <Link to="/fundacion/eventos/crear" className="fd-quick-action-card">
              <div className="fd-quick-action">
                <i className="fas fa-calendar-plus"></i>
                <h3>{t("crear_evento", "Crear Evento")}</h3>
              </div>
            </Link>
            <Link to="/fundacion/suscripciones/crear" className="fd-quick-action-card">
              <div className="fd-quick-action">
                <i className="fas fa-hand-holding-heart"></i>
                <h3>{t("crear_suscripcion", "Crear Suscripción")}</h3>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundacionDashboard;