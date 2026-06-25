// src/pages/user/PanelUsuario/PanelUsuario.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../contexts/AuthContext";
import api from "../../../services/api";
import {
  Heart,
  PawPrint,
  CalendarCheck,
  Mail,
  CheckCircle,
  ShieldCheck,
  AlertCircle,
  User,
  List,
  TrendingUp,
  Clock,
  ArrowRight,
  FileText,      // ← NUEVO: para solicitudes
  Building2,     // ← NUEVO: para verificaciones
  CalendarDays,  // ← NUEVO: para eventos
} from "lucide-react";
import ProfileBanner from "../../../components/common/ProfileBanner/index.js";
import "./PanelUsuario.css";

const PanelUsuario = () => {
  const { t } = useTranslation('dashboard');
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [solicitudesRecientes, setSolicitudesRecientes] = useState([]);
  const [suscripciones, setSuscripciones] = useState([]);
  const [eventosProximos, setEventosProximos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      try {
        const profileRes = await api.get("/user/profile");
        if (profileRes.data?.success) {
          setUserProfile(profileRes.data.data || profileRes.data);
        } else if (profileRes.data?.data) {
          setUserProfile(profileRes.data.data);
        }
      } catch (e) {
        console.log("👤 Usando datos del contexto para perfil");
        setUserProfile({
          nombre: user?.nombre || "Usuario",
          apellidos: user?.apellidos || "",
          email: user?.email || "",
          telefono: user?.telefono || "",
          email_verificado: !!user?.email_verified_at,
          telefono_verificado: !!user?.telefono_verificado,
          documento_verificado: !!user?.documento_verificado,
          avatar: user?.avatar || null,
        });
      }

      try {
        const solicitudesRes = await api.get("/user/solicitudes", {
          params: { perPage: 5, sort: "created_at", order: "desc" },
        });
        if (solicitudesRes.data?.success) {
          const data = solicitudesRes.data.data;
          setSolicitudesRecientes(Array.isArray(data) ? data : data.data || []);
        }
      } catch (e) {
        console.log("📋 No hay solicitudes");
        setSolicitudesRecientes([]);
      }

      try {
        const suscripcionesRes = await api.get(
          "/user/suscripciones/mis-suscripciones"
        );
        if (suscripcionesRes.data?.success) {
          setSuscripciones(suscripcionesRes.data.data || []);
        }
      } catch (e) {
        console.log("💝 No hay suscripciones");
        setSuscripciones([]);
      }

      try {
        const eventosRes = await api.get("/eventos", {
          params: { per_page: 3, proximos: true },
        });
        if (eventosRes.data?.data?.data) {
          const eventos = eventosRes.data.data.data;
          setEventosProximos(eventos.filter((e) => e.usuario_confirmado));
        } else if (Array.isArray(eventosRes.data)) {
          setEventosProximos(eventosRes.data.filter((e) => e.usuario_confirmado));
        }
      } catch (e) {
        console.log("📅 No hay eventos");
        setEventosProximos([]);
      }
    } catch (error) {
      console.error("❌ Error:", error);
      setError(error.response?.data?.message || "Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    cargarDashboard();
  }, [cargarDashboard]);

  const getEstadoBadge = (estado) => {
    const estados = {
      pendiente: { label: t("estados.pendiente", "Pendiente"), className: "estado-pendiente" },
      en_revision: { label: t("estados.en_revision", "En revisión"), className: "estado-revision" },
      aprobada: { label: t("estados.aprobada", "Aprobada"), className: "estado-aprobada" },
      rechazada: { label: t("estados.rechazada", "Rechazada"), className: "estado-rechazada" },
      completada: { label: t("estados.completada", "Completada"), className: "estado-completada" },
    };
    return estados[estado] || { label: estado || t("estados.desconocido", "Desconocido"), className: "" };
  };

  const formatDate = (fecha) => {
    if (!fecha) return "";
    try {
      return new Date(fecha).toLocaleDateString(t("locale", "es-ES"), {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return fecha;
    }
  };

  const contarPorEstado = (estadoBuscado) => {
    return solicitudesRecientes.filter((s) => s.estado === estadoBuscado).length;
  };

  const totalSolicitudes = solicitudesRecientes.length;
  const pendientes = contarPorEstado("pendiente");
  const aprobadas = contarPorEstado("aprobada");
  const tasaAprobacion = totalSolicitudes > 0 
    ? Math.round((aprobadas / totalSolicitudes) * 100) 
    : 0;

  const profile = userProfile || {};
  const avatarInitial = profile.nombre?.charAt(0) || user?.nombre?.charAt(0) || "U";

  if (loading) {
    return (
      <div className="panel-usuario-modern">
        <div className="panel-loading-modern">
          <div className="spinner-modern"></div>
          <p>{t("panel.loading", "Cargando tu panel...")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel-usuario-modern">
        <div className="bento-container">
          <div className="panel-error-modern">
            <AlertCircle size={48} className="error-icon-modern" />
            <h3>{t("panel.error.title", "Error al cargar el panel")}</h3>
            <p>{error}</p>
            <button onClick={cargarDashboard} className="btn-retry-modern">
              {t("panel.error.retry", "Reintentar")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="panel-usuario-modern">
      {/* ===== BANNER DE PERFIL ===== */}
      <div className="banner-wrapper">
        <div className="bento-container">
          <ProfileBanner
            user={{
              nombre: profile.nombre || user?.nombre || t("panel.defaultUser", "Usuario"),
              avatar: profile.avatar || user?.avatar || null,
              titulo: t("panel.userTitle", {
                defaultValue: "{{count}} solicitudes gestionadas · {{percent}}% de éxito",
                count: totalSolicitudes,
                percent: tasaAprobacion,
              }),
              solicitudes: totalSolicitudes,
              adopciones: aprobadas,
              eventos: eventosProximos.length,
            }}
          />
        </div>
      </div>

      {/* ===== STATS CARDS ===== */}
      <section className="stats-section-modern">
        <div className="bento-container">
          <div className="stats-grid-modern">
            <StatCardModern
              icon={<List size={24} />}
              label={t("panel.stats.total", "Total Solicitudes")}
              value={totalSolicitudes}
              maxValue={Math.max(totalSolicitudes, 10)}
              color="primary"
              progressLabel={t("panel.stats.totalLabel", "Total")}
            />
            <StatCardModern
              icon={<Heart size={24} />}
              label={t("panel.stats.aprobadas", "Aprobadas")}
              value={aprobadas}
              maxValue={totalSolicitudes || 10}
              color="success"
              progressLabel={t("panel.stats.aprobadasLabel", "Tasa de aprobación")}
              percentage={tasaAprobacion}
            />
            <StatCardModern
              icon={<Clock size={24} />}
              label={t("panel.stats.pendientes", "Pendientes")}
              value={pendientes}
              maxValue={totalSolicitudes || 10}
              color="warning"
              progressLabel={t("panel.stats.pendientesLabel", "Por revisar")}
              percentage={totalSolicitudes > 0 ? Math.round((pendientes / totalSolicitudes) * 100) : 0}
            />
            <StatCardModern
              icon={<TrendingUp size={24} />}
              label={t("panel.stats.exito", "Tasa de éxito")}
              value={`${tasaAprobacion}%`}
              maxValue={100}
              color="gradient"
              progressLabel={t("panel.stats.exitoLabel", "Efectividad")}
              percentage={tasaAprobacion}
              isPercentage
            />
          </div>
        </div>
      </section>

      {/* ===== GRID PRINCIPAL ===== */}
      <section className="main-grid-section-modern">
        <div className="bento-container">
          <div className="main-grid-modern">
            {/* Solicitudes recientes */}
            <div className="card-modern card-solicitudes">
              <div className="card-header-modern">
                <div className="card-header-left">
                  <FileText size={20} className="card-icon" /> {/* ← ICONO EN VEZ DE EMOJI */}
                  <h3>{t("panel.solicitudes.title", "Solicitudes recientes")}</h3>
                </div>
                <Link to="/user/mis-solicitudes" className="card-link-modern">
                  {t("panel.solicitudes.verTodas", "Ver todas")} <ArrowRight size={14} />
                </Link>
              </div>
              {solicitudesRecientes.length === 0 ? (
                <div className="empty-state-modern">
                  <p>{t("panel.solicitudes.empty", "No tienes solicitudes recientes")}</p>
                </div>
              ) : (
                <ul className="solicitudes-list-modern">
                  {solicitudesRecientes.slice(0, 5).map((sol) => {
                    const estado = getEstadoBadge(sol.estado);
                    const mascotaNombre = sol.solicitable?.nombre_mascota || 
                                          sol.mascota?.nombre_mascota || 
                                          t("panel.mascota.default", "Mascota");
                    return (
                      <li key={sol.id} className="solicitud-item-modern">
                        <div className="solicitud-info-modern">
                          <span className="solicitud-mascota-modern">{mascotaNombre}</span>
                          <span className={`estado-badge-modern ${estado.className}`}>
                            {estado.label}
                          </span>
                        </div>
                        <span className="solicitud-fecha-modern">
                          {formatDate(sol.created_at)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Suscripciones - MANTIENE EL EMOJI 💝 */}
            <div className="card-modern card-suscripciones">
              <div className="card-header-modern">
                <div className="card-header-left">
                  <span className="card-icon">💝</span> {/* ← SE MANTIENE */}
                  <h3>{t("panel.suscripciones.title", "Suscripciones activas")}</h3>
                </div>
                <Link to="/user/mis-suscripciones" className="card-link-modern">
                  {t("panel.suscripciones.gestionar", "Gestionar")} <ArrowRight size={14} />
                </Link>
              </div>
              {suscripciones.length === 0 ? (
                <div className="empty-state-modern">
                  <p>{t("panel.suscripciones.empty", "No tienes suscripciones activas")}</p>
                </div>
              ) : (
                <ul className="suscripciones-list-modern">
                  {suscripciones.slice(0, 5).map((sub) => (
                    <li key={sub.id} className="suscripcion-item-modern">
                      <div className="suscripcion-info-modern">
                        <span className="suscripcion-plan-modern">
                          {sub.plan?.nombre || sub.nombre || t("panel.plan.default", "Plan")}
                        </span>
                        <span className="suscripcion-monto-modern">
                          ${sub.monto_mensual || sub.monto || 0}/mes
                        </span>
                      </div>
                      <span className={`suscripcion-estado-modern ${sub.estado === "activo" ? "activo" : "inactivo"}`}>
                        {sub.estado === "activo" 
                          ? t("panel.suscripciones.activo", "Activo") 
                          : t("panel.suscripciones.pausado", "Pausado")}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== VERIFICACIONES ===== */}
      <section className="bottom-section-modern">
        <div className="bento-container">
          <div className="bottom-grid-modern">
            {/* Verificaciones */}
            <div className="card-modern card-verificaciones">
              <div className="card-header-modern">
                <div className="card-header-left">
                  <ShieldCheck size={20} className="card-icon" /> {/* ← ICONO EN VEZ DE EMOJI */}
                  <h3>{t("panel.verificaciones.title", "Verificaciones")}</h3>
                </div>
              </div>
              <div className="verificaciones-grid-modern">
                <VerificationItemModern
                  icon={<Mail size={18} />}
                  label={t("panel.verificaciones.email", "Email verificado")}
                  verified={profile.email_verificado}
                />
                <VerificationItemModern
                  icon={<ShieldCheck size={18} />}
                  label={t("panel.verificaciones.telefono", "Teléfono verificado")}
                  verified={!!profile.telefono_verificado}
                />
                <VerificationItemModern
                  icon={<CheckCircle size={18} />}
                  label={t("panel.verificaciones.documento", "Documento verificado")}
                  verified={!!profile.documento_verificado}
                />
              </div>
            </div>

            {/* Eventos próximos */}
            {eventosProximos.length > 0 && (
              <div className="card-modern card-eventos">
                <div className="card-header-modern">
                  <div className="card-header-left">
                    <CalendarDays size={20} className="card-icon" /> {/* ← ICONO EN VEZ DE EMOJI */}
                    <h3>{t("panel.eventos.title", "Eventos próximos")}</h3>
                  </div>
                  <Link to="/eventos" className="card-link-modern">
                    {t("panel.eventos.verTodos", "Ver todos")} <ArrowRight size={14} />
                  </Link>
                </div>
                <div className="eventos-grid-modern">
                  {eventosProximos.slice(0, 3).map((evento) => (
                    <div key={evento.id} className="evento-card-modern">
                      <h4>{evento.nombre_evento}</h4>
                      <p className="evento-fecha-modern">📍 {evento.lugar_evento}</p>
                      <p className="evento-fecha-modern">📅 {formatDate(evento.fecha_evento)}</p>
                      <span className="evento-asistencia-modern">{t("panel.eventos.confirmado", "Confirmado")}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== ACCIONES RÁPIDAS ===== */}
      <section className="quick-actions-section-modern">
        <div className="bento-container">
          <div className="quick-actions-modern">
            <h4>{t("panel.acciones.titulo", "Acciones rápidas")}</h4>
            <div className="actions-grid-modern">
              <Link to="/mascotas" className="action-btn-modern">
                <div className="action-icon-modern" style={{ background: "rgba(102, 126, 234, 0.15)", color: "var(--color-primary)" }}>
                  <PawPrint size={22} />
                </div>
                <span>{t("panel.acciones.mascotas", "Ver mascotas")}</span>
              </Link>
              <Link to="/eventos" className="action-btn-modern">
                <div className="action-icon-modern" style={{ background: "rgba(255, 140, 66, 0.15)", color: "var(--color-accent)" }}>
                  <CalendarCheck size={22} />
                </div>
                <span>{t("panel.acciones.eventos", "Ver eventos")}</span>
              </Link>
              <Link to="/user/mis-solicitudes" className="action-btn-modern">
                <div className="action-icon-modern" style={{ background: "rgba(255, 107, 157, 0.15)", color: "var(--color-heart)" }}>
                  <Heart size={22} />
                </div>
                <span>{t("panel.acciones.solicitudes", "Mis solicitudes")}</span>
              </Link>
              <Link to="/user/perfil" className="action-btn-modern">
                <div className="action-icon-modern" style={{ background: "rgba(46, 204, 113, 0.15)", color: "var(--color-success)" }}>
                  <User size={22} />
                </div>
                <span>{t("panel.acciones.perfil", "Mi perfil")}</span>
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
  maxValue = 100, 
  percentage = 0,
  progressLabel = "",
  isPercentage = false
}) => {
  const progressPercentage = isPercentage 
    ? Math.min(parseInt(value) || 0, 100)
    : Math.min(Math.round((Number(value) / maxValue) * 100), 100);

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
      <div className="stat-progress-modern">
        <div className="stat-progress-bar-modern">
          <div 
            className="stat-progress-fill-modern" 
            style={{ 
              width: `${Math.min(progressPercentage, 100)}%`,
              background: getProgressGradient(),
            }}
          />
        </div>
        <span className="stat-progress-percent-modern">{Math.min(progressPercentage, 100)}%</span>
      </div>
    </div>
  );
};

// ===== VERIFICATION ITEM =====
const VerificationItemModern = ({ icon, label, verified }) => {
  const { t } = useTranslation('dashboard');
  
  return (
    <div className={`verification-item-modern ${verified ? "verified" : "unverified"}`}>
      <div className="verification-icon-modern">{icon}</div>
      <span className="verification-label-modern">{label}</span>
      <span className="verification-status-modern">
        {verified 
          ? t("panel.verificaciones.verificado", "Verificado") 
          : t("panel.verificaciones.pendiente", "Pendiente")}
      </span>
    </div>
  );
};

export default PanelUsuario;