// src/pages/fundacion/dashboard/FundacionDashboard.jsx
import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
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
  ClipboardList,
  ClipboardCheck,
  Users,
} from "lucide-react";
import ProfileBanner from "../../../components/common/ProfileBanner/index.js";
import { getImageUrl } from "../../../utils/imageUtils";
import "./FundacionDashboard.css";

// ✅ Lazy load de componentes pesados
const FundacionDashboardCharts = lazy(() => 
  import("../../../components/common/FundacionDashboardCharts/FundacionDashboardCharts")
);

// ⏱️ Configuración de optimización
const PER_PAGE = 20;
const MIN_LOADING_TIME = 300;
const CACHE_DURATION = 300000; // 5 minutos

const FundacionDashboard = () => {
  const { t, i18n } = useTranslation("fundacion");
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalMascotas: 0,
    enAdopcion: 0,
    adoptadas: 0,
    totalEventos: 0,
    eventosProximos: 0,
    totalSuscripciones: 0,
    montoMensual: 0,
    rescatesPendientes: 0,
    solicitudesPendientes: 0,
    totalSeguimientos: 0,
  });
  const [mascotasRecientes, setMascotasRecientes] = useState([]);
  const [eventosProximos, setEventosProximos] = useState([]);
  const [actividadReciente, setActividadReciente] = useState([]);
  const [rescatesPendientes, setRescatesPendientes] = useState([]);
  const [adopciones, setAdopciones] = useState([]);
  const [solicitudesPendientes, setSolicitudesPendientes] = useState([]);
  const [seguimientosRecientes, setSeguimientosRecientes] = useState([]);
  const [suscripciones, setSuscripciones] = useState([]);

  const formatDateByLocale = useCallback((date, options = {}) => {
    if (!date) return "";
    const locale = i18n.language === "en" ? "en-US" : "es-ES";
    const defaultOptions = { year: "numeric", month: "short", day: "numeric" };
    return new Date(date).toLocaleDateString(locale, { ...defaultOptions, ...options });
  }, [i18n.language]);

  const formatTimeByLocale = useCallback((date) => {
    if (!date) return "";
    const locale = i18n.language === "en" ? "en-US" : "es-ES";
    return new Date(date).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  }, [i18n.language]);

  const formatRelativeTime = useCallback((date) => {
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
  }, [t, formatDateByLocale]);

  const getEstadoText = useCallback((estado) => {
    if (estado === "En adopcion" || estado === "En adopción") {
      return t("estado_en_adopcion", "En adopción");
    }
    if (estado === "Adoptado") {
      return t("estado_adoptado", "Adoptado");
    }
    return t("estado_rescatada", "Rescatada");
  }, [t]);

  const getEstadoClass = useCallback((estado) => {
    if (estado === "En adopcion" || estado === "En adopción") return "fd-status-adopcion";
    if (estado === "Adoptado") return "fd-status-adoptado";
    return "fd-status-rescatada";
  }, []);

  const getEstadoRescateText = useCallback((estado) => {
    if (estado === "pendiente") return t("estado_pendiente", "Pendiente");
    return t("estado_en_proceso", "En proceso");
  }, [t]);

  const getEstadoRescateClass = useCallback((estado) => {
    return estado === "pendiente" ? "pendiente" : "en_proceso";
  }, []);

  const getTipoSeguimientoLabel = useCallback((tipo) => {
    const tipos = {
      virtual: t("tipo_virtual", "Virtual"),
      domiciliario: t("tipo_domiciliario", "Domiciliario"),
      telefonico: t("tipo_telefonico", "Telefónico"),
    };
    return tipos[tipo] || tipo;
  }, [t]);

  const getEstadoSeguimientoClass = useCallback((estado) => {
    const clases = {
      excelente: "seg-estado-excelente",
      bueno: "seg-estado-bueno",
      regular: "seg-estado-regular",
      preocupante: "seg-estado-preocupante",
    };
    return clases[estado] || "seg-estado-bueno";
  }, []);

  const getEstadoSeguimientoLabel = useCallback((estado) => {
    const labels = {
      excelente: t("estado_excelente", "Excelente"),
      bueno: t("estado_bueno", "Bueno"),
      regular: t("estado_regular", "Regular"),
      preocupante: t("estado_preocupante", "Preocupante"),
    };
    return labels[estado] || estado;
  }, [t]);

  // ✅ Cache helpers
  const guardarEnCache = useCallback((key, data) => {
    try {
      const cacheData = { data, timestamp: Date.now() };
      sessionStorage.setItem(`dashboard_${key}`, JSON.stringify(cacheData));
    } catch (e) {
      // Ignorar errores de storage
    }
  }, []);

  const obtenerDeCache = useCallback((key) => {
    try {
      const cached = sessionStorage.getItem(`dashboard_${key}`);
      if (!cached) return null;
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp > CACHE_DURATION) {
        sessionStorage.removeItem(`dashboard_${key}`);
        return null;
      }
      return data;
    } catch (e) {
      return null;
    }
  }, []);

  // ✅ Cargar datos optimizado
  const cargarDatosDashboard = useCallback(async () => {
    const startTime = Date.now();
    setLoading(true);
    setError(null);

    try {
      console.log("🚀 Cargando dashboard fundación (optimizado)...");

      // ✅ PRIMERO: Verificar caché
      const cachedMascotas = obtenerDeCache('mascotas');
      const cachedAdopciones = obtenerDeCache('adopciones');

      if (cachedMascotas && cachedAdopciones) {
        console.log("📦 Usando datos en caché");
        setMascotasRecientes(cachedMascotas.slice(0, 5));
        setAdopciones(cachedAdopciones);
      }

      const [
        mascotasRes,
        adopcionesRes,
        solicitudesRes,
        seguimientosRes,
        eventosRes,
        rescatesRes,
        suscripcionesRes,
      ] = await Promise.allSettled([
        api.get("/entity/mascotas", {
          params: {
            per_page: PER_PAGE,
            fields: 'id,nombre_mascota,especie,estado,created_at,foto_principal,edad_aprox',
          },
        }),
        api.get("/entity/adopciones", {
          params: {
            per_page: PER_PAGE,
            fields: 'id,estado,created_at,fecha_adopcion,mascota_id,adoptante_id',
            include: 'mascota',
            sort: 'created_at',
            order: 'desc',
          },
        }),
        api.get("/entity/solicitudes", {
          params: {
            per_page: 5,
            estado: 'pendiente',
            fields: 'id,estado,created_at,contenido,nombre_solicitante,email_solicitante,telefono_solicitante,solicitable_id,solicitable_type',
            include: 'solicitable',
            sort: 'created_at',
            order: 'desc',
          },
        }),
        api.get("/entity/adopciones/seguimientos/mis-seguimientos", {
          params: {
            per_page: 5,
            fields: 'id,adopcion_id,tipo_seguimiento,fecha_seguimiento,estado_mascota,resultado,observaciones',
            include: 'adopcion.mascota',
            sort: 'created_at',
            order: 'desc',
          },
        }),
        api.get("/entity/eventos"),
        rescateService.getMisRescates(),
        suscripcionService.getSuscripcionesEntity(),
      ]);

      const safeResponse = (result, fallback = { data: { data: [] } }) =>
        result.status === 'fulfilled' ? result.value : fallback;

      const safeArray = (response) => {
        if (!response) return [];
        if (Array.isArray(response)) return response;
        if (response.data?.success && Array.isArray(response.data.data)) return response.data.data;
        if (Array.isArray(response.data?.data)) return response.data.data;
        if (Array.isArray(response.data)) return response.data;
        return [];
      };

      const safeObjectData = (response) =>
        response?.data?.success ? response.data : response?.data || response || {};

      // ✅ Procesar mascotas
      const mascotasData = safeArray(safeResponse(mascotasRes));
      if (mascotasData.length > 0) {
        guardarEnCache('mascotas', mascotasData);
      }

      // ✅ Procesar adopciones
      const adopcionesData = safeArray(safeResponse(adopcionesRes));
      if (adopcionesData.length > 0) {
        guardarEnCache('adopciones', adopcionesData);
      }
      setAdopciones(adopcionesData);

      const enAdopcion = mascotasData.filter(
        (m) => m.estado === "En adopcion" || m.estado === "En adopción"
      ).length;
      const adoptadas = mascotasData.filter((m) => m.estado === "Adoptado").length;

      const recientes = [...mascotasData]
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
        .slice(0, 5);
      setMascotasRecientes(recientes);

      setStats(prev => ({
        ...prev,
        totalMascotas: mascotasData.length,
        enAdopcion,
        adoptadas,
      }));

      // ✅ Procesar solicitudes
      const solicitudesData = safeArray(safeResponse(solicitudesRes));
      setSolicitudesPendientes(solicitudesData.slice(0, 5));

      // ✅ Procesar seguimientos
      const seguimientosData = safeArray(safeResponse(seguimientosRes));
      setSeguimientosRecientes(seguimientosData.slice(0, 5));

      // ✅ Procesar eventos
      const eventosData = safeArray(safeResponse(eventosRes));
      const ahora = new Date();
      const proximos = eventosData
        .filter((e) => e.fecha_evento && new Date(e.fecha_evento) > ahora)
        .sort((a, b) => new Date(a.fecha_evento) - new Date(b.fecha_evento))
        .slice(0, 5);
      setEventosProximos(proximos);

      // ✅ Procesar rescates
      let rescatesData = [];
      const rescatesResponse = safeResponse(rescatesRes, { data: [] });
      if (Array.isArray(rescatesResponse)) {
        rescatesData = rescatesResponse;
      } else {
        rescatesData = safeArray(rescatesResponse);
      }
      const pendientes = rescatesData
        .filter((r) => r.estado === "pendiente" || r.estado === "en_proceso")
        .slice(0, 5);
      setRescatesPendientes(pendientes);

      // ✅ Procesar suscripciones
      const suscripcionesData = Array.isArray(suscripcionesRes)
        ? suscripcionesRes
        : safeArray(suscripcionesRes);
      setSuscripciones(suscripcionesData);
      const montoTotal = suscripcionesData
        .filter((s) => s.estado === "activo")
        .reduce((sum, s) => sum + (parseFloat(s.monto_mensual) || 0), 0);

      const actividades = [
        ...recientes.slice(0, 3).map((m) => ({
          id: m.id,
          tipo: "mascota",
          titulo: `${t("actividad_mascota_titulo", "Nueva mascota registrada")}: ${m.nombre_mascota}`,
          fecha: m.created_at || new Date(),
          icono: "fa-paw",
          color: "var(--color-primary)",
        })),
        ...eventosData.slice(0, 2).map((e) => ({
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
      setActividadReciente(actividades);

      setStats({
        totalMascotas: mascotasData.length,
        enAdopcion,
        adoptadas,
        totalEventos: eventosData.length,
        eventosProximos: proximos.length,
        totalSuscripciones: suscripcionesData.length,
        montoMensual: montoTotal,
        rescatesPendientes: pendientes.length,
        solicitudesPendientes: solicitudesData.length,
        totalSeguimientos: seguimientosData.length,
      });

    } catch (error) {
      console.error("❌ Error general:", error);
      setError(error.message || t("error_carga", "Error al cargar los datos"));
    } finally {
      // ✅ Tiempo mínimo de carga para evitar flashes
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, MIN_LOADING_TIME - elapsed);
      setTimeout(() => {
        setLoading(false);
      }, remaining);
    }
  }, [t, obtenerDeCache, guardarEnCache]);

  useEffect(() => {
    cargarDatosDashboard();
  }, [cargarDatosDashboard]);

  // ✅ Memoizar datos del banner
  const bannerData = useMemo(() => {
    const fundacionName = user?.name || user?.nombre || t("fundacion", "Fundación");
    const fundacionAvatar = user?.avatar || null;
    const totalMascotas = stats.totalMascotas;
    const tasaExito = stats.totalMascotas > 0 
      ? Math.round((stats.adoptadas / stats.totalMascotas) * 100) 
      : 0;
    return { fundacionName, fundacionAvatar, totalMascotas, tasaExito };
  }, [user, stats]);

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
              nombre: bannerData.fundacionName,
              avatar: bannerData.fundacionAvatar,
              titulo: t("banner.titulo", {
                defaultValue: "{{count}} mascotas · {{percent}}% de adopciones exitosas",
                count: bannerData.totalMascotas,
                percent: bannerData.tasaExito,
              }),
              solicitudes: stats.solicitudesPendientes,
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
              loading={loading}
            />
            <StatCardModern
              icon={<Heart size={24} />}
              label={t("en_adopcion", "En Adopción")}
              value={stats.enAdopcion}
              color="success"
              loading={loading}
            />
            <StatCardModern
              icon={<CheckCircle size={24} />}
              label={t("adoptadas", "Adoptadas")}
              value={stats.adoptadas}
              color="gradient"
              loading={loading}
            />
            <StatCardModern
              icon={<HandHeart size={24} />}
              label={t("suscripciones", "Suscripciones")}
              value={stats.totalSuscripciones}
              color="warning"
              loading={loading}
            />
          </div>
        </div>
      </section>

      {/* ===== STATS SECUNDARIAS ===== */}
      <section className="fd-stats-section">
        <div className="bento-container">
          <div className="fd-stats-grid">
            <StatCardModern
              icon={<Calendar size={24} />}
              label={t("eventos_proximos", "Eventos Próximos")}
              value={stats.eventosProximos}
              color="info"
            />
            <StatCardModern
              icon={<Activity size={24} />}
              label={t("rescates_pendientes", "Rescates Activos")}
              value={stats.rescatesPendientes}
              color="danger"
            />
            <StatCardModern
              icon={<ClipboardList size={24} />}
              label={t("solicitudes_pendientes", "Solicitudes")}
              value={stats.solicitudesPendientes}
              color="warning"
            />
            <StatCardModern
              icon={<ClipboardCheck size={24} />}
              label={t("seguimientos", "Seguimientos")}
              value={stats.totalSeguimientos}
              color="success"
            />
          </div>
        </div>
      </section>

      {/* ===== GRID PRINCIPAL ===== */}
      <section className="fd-main-grid-section">
        <div className="bento-container">
          <div className="fd-main-grid-three">
            {/* Mascotas Recientes */}
            <div className="card-modern">
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
            <div className="card-modern">
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

            {/* Solicitudes Pendientes */}
            <div className="card-modern">
              <div className="card-header-modern">
                <div className="card-header-left">
                  <ClipboardList size={20} className="card-icon" />
                  <h3>{t("solicitudes_pendientes", "Solicitudes Pendientes")}</h3>
                </div>
                <Link to="/fundacion/solicitudes" className="card-link-modern">
                  {t("ver_todas", "Ver todas")} <ArrowRight size={14} />
                </Link>
              </div>
              {solicitudesPendientes.length === 0 ? (
                <div className="empty-state-modern">
                  <p>{t("sin_solicitudes", "No hay solicitudes pendientes")}</p>
                </div>
              ) : (
                <ul className="fd-solicitudes-list">
                  {solicitudesPendientes.map((solicitud) => (
                    <li key={solicitud.id} className="fd-solicitud-item">
                      <div className="fd-solicitud-info">
                        <div className="fd-solicitud-avatar">
                          <Users size={18} />
                        </div>
                        <div>
                          <span className="fd-solicitud-nombre">
                            {solicitud.nombre_solicitante || solicitud.usuario?.nombre || t("anónimo", "Anónimo")}
                          </span>
                          <span className="fd-solicitud-detalles">
                            {solicitud.solicitable?.nombre_mascota || t("mascota_no_disponible", "Mascota no disponible")}
                          </span>
                        </div>
                      </div>
                      <span className="fd-solicitud-badge-pendiente">
                        {t("pendiente", "Pendiente")}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== GRID INFERIOR ===== */}
      <section className="fd-bottom-section">
        <div className="bento-container">
          <div className="fd-bottom-grid-three">
            {/* Rescates Pendientes */}
            <div className="card-modern">
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

            {/* Seguimientos Recientes */}
            <div className="card-modern">
              <div className="card-header-modern">
                <div className="card-header-left">
                  <ClipboardCheck size={20} className="card-icon" />
                  <h3>{t("seguimientos_recientes", "Seguimientos Recientes")}</h3>
                </div>
                <Link to="/fundacion/adopciones/seguimientos" className="card-link-modern">
                  {t("ver_todos", "Ver todos")} <ArrowRight size={14} />
                </Link>
              </div>
              {seguimientosRecientes.length === 0 ? (
                <div className="empty-state-modern">
                  <p>{t("sin_seguimientos", "No hay seguimientos recientes")}</p>
                </div>
              ) : (
                <ul className="fd-seguimientos-list">
                  {seguimientosRecientes.map((seg) => (
                    <li key={seg.id} className="fd-seguimiento-item">
                      <div className="fd-seguimiento-info">
                        <div className="fd-seguimiento-icon">
                          {seg.tipo_seguimiento === 'virtual' ? '📱' : 
                           seg.tipo_seguimiento === 'domiciliario' ? '🏠' : '📞'}
                        </div>
                        <div>
                          <span className="fd-seguimiento-mascota">
                            {seg.adopcion?.mascota?.nombre_mascota || t("mascota_no_disponible", "Mascota no disponible")}
                          </span>
                          <span className="fd-seguimiento-detalles">
                            {getTipoSeguimientoLabel(seg.tipo_seguimiento)} · {formatDateByLocale(seg.fecha_seguimiento)}
                          </span>
                        </div>
                      </div>
                      <span className={`fd-seguimiento-estado ${getEstadoSeguimientoClass(seg.estado_mascota)}`}>
                        {getEstadoSeguimientoLabel(seg.estado_mascota)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Actividad Reciente */}
            <div className="card-modern">
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

      {/* ===== GRÁFICOS ===== */}
      <section className="fd-charts-section">
        <div className="bento-container">
          <Suspense fallback={
            <div className="charts-loading-placeholder">
              <div className="spinner-small"></div>
              <span>{t("cargando_graficos", "Cargando gráficos...")}</span>
            </div>
          }>
            <FundacionDashboardCharts
              mascotas={mascotasRecientes}
              adopciones={adopciones}
              suscripciones={suscripciones}
              loading={loading}
            />
          </Suspense>
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
              <Link to="/fundacion/suscripciones" className="fd-action-btn">
                <div className="fd-action-icon" style={{ background: "rgba(255, 107, 157, 0.15)", color: "var(--color-heart)" }}>
                  <HandHeart size={22} />
                </div>
                <span>{t("ver_suscripciones", "Ver Suscripciones")}</span>
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
const StatCardModern = React.memo(({ icon, label, value, color, loading }) => {
  return (
    <div className={`stat-card-modern stat-${color} ${loading ? 'stat-loading' : ''}`}>
      <div className="stat-header-modern">
        <div className="stat-icon-modern">{icon}</div>
        <span className="stat-badge-modern">{label}</span>
      </div>
      <div className="stat-body-modern">
        {loading ? (
          <div className="stat-skeleton skeleton" style={{ width: '70%', height: '48px' }} />
        ) : (
          <span className="stat-value-modern">{value}</span>
        )}
      </div>
    </div>
  );
});

export default FundacionDashboard;