// src/pages/fundacion/dashboard/FundacionDashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../contexts/AuthContext";
import api from "../../../services/api";
import { rescateService } from "../../../services/rescateService";
import { suscripcionService } from "../../../services/suscripcionService";
import {
  PawPrint,
  Heart,
  CheckCircle,
  Calendar,
  TrendingUp,
  Users,
  Activity,
  Clock,
  AlertCircle,
  PlusCircle,
  CalendarPlus,
  HandHeart,
  ArrowRight,
  Home,
  MapPin,
  Calendar as CalendarIcon,
  UserCheck,
} from "lucide-react";
import ProfileBanner from "../../../components/common/ProfileBanner/index.js";
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

  const formatDateByLocale = (date, options = {}) => {
    if (!date) return "";
    const locale = i18n.language === "en" ? "en-US" : "es-ES";
    const defaultOptions = { year: "numeric", month: "short", day: "numeric" };
    return new Date(date).toLocaleDateString(locale, { ...defaultOptions, ...options });
  };

  const formatTimeByLocale = (date) => {
    if (!date) return "";
    const locale = i18n.language === "en" ? "en-US" : "es-ES";
    return new Date(date).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  };

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
      console.log("🚀 Cargando dashboard fundación...");

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

  const getEstadoRescateText = (estado) => {
    if (estado === "pendiente") return t("estado_pendiente", "Pendiente");
    return t("estado_en_proceso", "En proceso");
  };

  const getEstadoRescateClass = (estado) => {
    return estado === "pendiente" ? "pendiente" : "en_proceso";
  };

  // ===== DATOS PARA EL BANNER =====
  const fundacionName = user?.name || user?.nombre || t("fundacion", "Fundación");
  const fundacionAvatar = user?.avatar || null;
  const totalMascotas = stats.totalMascotas;
  const tasaExito = stats.totalMascotas > 0 
    ? Math.round((stats.adoptadas / stats.totalMascotas) * 100) 
    : 0;

  if (loading) {
    return (
      <div className="fd-dashboard-container">
        <div className="panel-loading-modern">
          <div className="spinner-modern"></div>
          <p>{t("cargando_dashboard", "Cargando dashboard...")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fd-dashboard-container">
        <div className="bento-container">
          <div className="panel-error-modern">
            <AlertCircle size={48} className="error-icon-modern" />
            <h3>{t("error_titulo", "Error al cargar el dashboard")}</h3>
            <p>{error}</p>
            <button onClick={cargarDatosDashboard} className="btn-retry-modern">
              {t("reintentar", "Reintentar")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fd-dashboard-container">
      {/* ===== BANNER DE PERFIL ===== */}
      <div className="fd-banner-wrapper">
        <div className="bento-container">
          <ProfileBanner
            user={{
              nombre: fundacionName,
              avatar: fundacionAvatar,
              titulo: t("banner.titulo", {
                defaultValue: "{{count}} mascotas · {{percent}}% de adopciones exitosas",
                count: totalMascotas,
                percent: tasaExito,
              }),
              solicitudes: stats.totalMascotas,
              adopciones: stats.adoptadas,
              eventos: stats.eventosProximos,
            }}
          />
        </div>
      </div>

      {/* ===== STATS CARDS ===== */}
      <section className="fd-stats-section">
        <div className="bento-container">
          <div className="fd-stats-grid">
            <StatCardModern
              icon={<PawPrint size={24} />}
              label={t("total_mascotas", "Total Mascotas")}
              value={stats.totalMascotas}
              color="primary"
              progressLabel={t("total", "Total")}
            />
            <StatCardModern
              icon={<Heart size={24} />}
              label={t("en_adopcion", "En Adopción")}
              value={stats.enAdopcion}
              color="success"
              progressLabel={t("disponibles", "Disponibles")}
            />
            <StatCardModern
              icon={<CheckCircle size={24} />}
              label={t("adoptadas", "Adoptadas")}
              value={stats.adoptadas}
              color="gradient"
              progressLabel={t("exitos", "Éxitos")}
            />
            <StatCardModern
              icon={<Calendar size={24} />}
              label={t("eventos_proximos", "Eventos Próximos")}
              value={stats.eventosProximos}
              color="warning"
              progressLabel={t("programados", "Programados")}
            />
          </div>
        </div>
      </section>

      {/* ===== GRID PRINCIPAL ===== */}
      <section className="fd-main-grid-section">
        <div className="bento-container">
          <div className="fd-main-grid">
            {/* Mascotas Recientes */}
            <div className="card-modern fd-card-solicitudes">
              <div className="card-header-modern">
                <div className="card-header-left">
                  <PawPrint size={20} className="card-icon" />
                  <h3>{t("mascotas_recientes", "Mascotas Recientes")}</h3>
                </div>
                <Link to="/fundacion/mascotas" className="card-link-modern">
                  {t("ver_todas", "Ver todas")} <ArrowRight size={14} />
                </Link>
              </div>
              {mascotasRecientes.length === 0 ? (
                <div className="empty-state-modern">
                  <p>{t("sin_mascotas", "No hay mascotas registradas")}</p>
                </div>
              ) : (
                <ul className="fd-mascotas-list">
                  {mascotasRecientes.map((mascota) => (
                    <li key={mascota.id} className="fd-mascota-item">
                      <div className="fd-mascota-info">
                        <img
                          src={getImageUrl(mascota.foto_principal)}
                          alt={mascota.nombre_mascota}
                          className="fd-mascota-avatar"
                          onError={(e) => {
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='%23667eea' stroke-width='2'%3E%3Cpath d='M12 2L2 7l10 5 10-5-10-5z'/%3E%3Cpath d='M2 17l10 5 10-5'/%3E%3Cpath d='M2 12l10 5 10-5'/%3E%3C/svg%3E";
                          }}
                        />
                        <div>
                          <span className="fd-mascota-nombre">{mascota.nombre_mascota}</span>
                          <span className="fd-mascota-detalles">
                            {mascota.especie || "?"} · {mascota.edad_aprox || "?"} años
                          </span>
                        </div>
                      </div>
                      <span className={`fd-pet-status ${getEstadoClass(mascota.estado)}`}>
                        {getEstadoText(mascota.estado)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Eventos Próximos */}
            <div className="card-modern fd-card-eventos">
              <div className="card-header-modern">
                <div className="card-header-left">
                  <Calendar size={20} className="card-icon" />
                  <h3>{t("eventos_proximos", "Eventos Próximos")}</h3>
                </div>
                <Link to="/fundacion/eventos" className="card-link-modern">
                  {t("ver_todos", "Ver todos")} <ArrowRight size={14} />
                </Link>
              </div>
              {eventosProximos.length === 0 ? (
                <div className="empty-state-modern">
                  <p>{t("sin_eventos", "No hay eventos programados")}</p>
                </div>
              ) : (
                <ul className="fd-eventos-list">
                  {eventosProximos.slice(0, 5).map((evento) => (
                    <li key={evento.id} className="fd-evento-item">
                      <div className="fd-evento-fecha">
                        <span className="fd-evento-dia">
                          {formatDateByLocale(evento.fecha_evento, { day: "numeric" })}
                        </span>
                        <span className="fd-evento-mes">
                          {formatDateByLocale(evento.fecha_evento, { month: "short" })}
                        </span>
                      </div>
                      <div className="fd-evento-info">
                        <span className="fd-evento-nombre">{evento.nombre_evento}</span>
                        <span className="fd-evento-lugar">
                          <MapPin size={12} /> {evento.lugar_evento}
                        </span>
                        <span className="fd-evento-hora">
                          <Clock size={12} /> {formatTimeByLocale(evento.fecha_evento)}
                        </span>
                      </div>
                      <div className="fd-evento-asistentes">
                        <UserCheck size={14} />
                        <span>{evento.total_asistentes || 0}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== RESCATES Y ACTIVIDAD ===== */}
      <section className="fd-bottom-section">
        <div className="bento-container">
          <div className="fd-bottom-grid">
            {/* Rescates Pendientes */}
            <div className="card-modern fd-card-rescates">
              <div className="card-header-modern">
                <div className="card-header-left">
                  <Activity size={20} className="card-icon" />
                  <h3>{t("rescates_pendientes", "Rescates Activos")}</h3>
                </div>
                <Link to="/fundacion/rescates/mis-rescates" className="card-link-modern">
                  {t("ver_todos", "Ver todos")} <ArrowRight size={14} />
                </Link>
              </div>
              {rescatesPendientes.length === 0 ? (
                <div className="empty-state-modern">
                  <p>{t("sin_rescates", "No hay rescates activos")}</p>
                </div>
              ) : (
                <ul className="fd-rescates-list">
                  {rescatesPendientes.map((rescate) => (
                    <li key={rescate.id} className="fd-rescate-item">
                      <div className="fd-rescate-info">
                        <span className="fd-rescate-lugar">
                          {rescate.lugar_rescate || t("lugar_no_especificado", "Lugar no especificado")}
                        </span>
                        <span className="fd-rescate-fecha">
                          <CalendarIcon size={12} /> {formatDateByLocale(rescate.fecha_rescate)}
                        </span>
                      </div>
                      <span className={`fd-rescate-estado ${getEstadoRescateClass(rescate.estado)}`}>
                        {getEstadoRescateText(rescate.estado)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Actividad Reciente */}
            <div className="card-modern fd-card-actividad">
              <div className="card-header-modern">
                <div className="card-header-left">
                  <TrendingUp size={20} className="card-icon" />
                  <h3>{t("actividad_reciente", "Actividad Reciente")}</h3>
                </div>
              </div>
              {actividadReciente.length === 0 ? (
                <div className="empty-state-modern">
                  <p>{t("sin_actividad", "No hay actividad reciente")}</p>
                </div>
              ) : (
                <ul className="fd-actividad-list">
                  {actividadReciente.map((actividad, idx) => (
                    <li key={idx} className="fd-actividad-item">
                      <div className="fd-actividad-icon" style={{ background: `${actividad.color}15`, color: actividad.color }}>
                        <i className={`fas ${actividad.icono}`}></i>
                      </div>
                      <div className="fd-actividad-content">
                        <span className="fd-actividad-titulo">{actividad.titulo}</span>
                        <span className="fd-actividad-tiempo">
                          <Clock size={12} /> {formatRelativeTime(actividad.fecha)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== ACCIONES RÁPIDAS ===== */}
      <section className="fd-quick-actions-section">
        <div className="bento-container">
          <div className="fd-quick-actions">
            <h4>{t("acciones_rapidas", "Acciones Rápidas")}</h4>
            <div className="fd-actions-grid">
              <Link to="/fundacion/mascotas/nueva" className="fd-action-btn">
                <div className="fd-action-icon" style={{ background: "rgba(102, 126, 234, 0.15)", color: "var(--color-primary)" }}>
                  <PlusCircle size={22} />
                </div>
                <span>{t("registrar_mascota", "Registrar Mascota")}</span>
              </Link>
              <Link to="/fundacion/eventos/crear" className="fd-action-btn">
                <div className="fd-action-icon" style={{ background: "rgba(255, 140, 66, 0.15)", color: "var(--color-accent)" }}>
                  <CalendarPlus size={22} />
                </div>
                <span>{t("crear_evento", "Crear Evento")}</span>
              </Link>
              <Link to="/fundacion/suscripciones/crear" className="fd-action-btn">
                <div className="fd-action-icon" style={{ background: "rgba(255, 107, 157, 0.15)", color: "var(--color-heart)" }}>
                  <HandHeart size={22} />
                </div>
                <span>{t("crear_suscripcion", "Crear Suscripción")}</span>
              </Link>
              <Link to="/fundacion/rescates/disponibles" className="fd-action-btn">
                <div className="fd-action-icon" style={{ background: "rgba(46, 204, 113, 0.15)", color: "var(--color-success)" }}>
                  <Home size={22} />
                </div>
                <span>{t("ver_rescates", "Ver Rescates")}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// ===== STAT CARD =====
const StatCardModern = ({ 
  icon, 
  label, 
  value, 
  color, 
  percentage = 0,
  progressLabel = "",
}) => {
  const progressPercentage = Math.min(percentage || 0, 100);

  const getProgressGradient = () => {
    if (color === "gradient") {
      return "linear-gradient(90deg, var(--color-primary), var(--color-secondary))";
    }
    if (color === "success") return "linear-gradient(90deg, #2ecc71, #27ae60)";
    if (color === "warning") return "linear-gradient(90deg, #f59e0b, #d97706)";
    return "linear-gradient(90deg, var(--color-primary), var(--color-primary-light))";
  };

  return (
    <div className={`stat-card-modern stat-${color}`}>
      <div className="stat-header-modern">
        <div className="stat-icon-modern">{icon}</div>
        <span className="stat-badge-modern">{label}</span>
      </div>
      <div className="stat-body-modern">
        <span className="stat-value-modern">{value}</span>
        <span className="stat-label-modern">{progressLabel || label}</span>
      </div>
    </div>
  );
};

export default FundacionDashboard;