// src/pages/user/Dashboard/UserDashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import api from "../../../services/api";
import {
  Heart,
  PawPrint,
  CalendarCheck,
  Wallet,
  Mail,
  CheckCircle,
  ShieldCheck,
  AlertCircle,
  User,
  List,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import "./UserDashboard.css";

const UserDashboard = () => {
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

      // 🔹 1. Perfil del usuario
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
          avatar: user?.avatar || null,
        });
      }

      // 🔹 2. Solicitudes recientes
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

      // 🔹 3. Suscripciones activas
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

      // 🔹 4. Eventos próximos
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
      pendiente: { label: "Pendiente", className: "estado-pendiente", icon: "⏳" },
      en_revision: { label: "En revisión", className: "estado-revision", icon: "🔍" },
      aprobada: { label: "Aprobada", className: "estado-aprobada", icon: "✅" },
      rechazada: { label: "Rechazada", className: "estado-rechazada", icon: "❌" },
      completada: { label: "Completada", className: "estado-completada", icon: "🎉" },
    };
    return estados[estado] || { label: estado || "Desconocido", className: "", icon: "📌" };
  };

  const formatDate = (fecha) => {
    if (!fecha) return "";
    try {
      return new Date(fecha).toLocaleDateString("es-ES", {
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

  // Calcular estadísticas
  const totalSolicitudes = solicitudesRecientes.length;
  const pendientes = contarPorEstado("pendiente");
  const aprobadas = contarPorEstado("aprobada");
  const rechazadas = contarPorEstado("rechazada");
  const tasaAprobacion = totalSolicitudes > 0 
    ? Math.round((aprobadas / totalSolicitudes) * 100) 
    : 0;

  if (loading) {
    return (
      <div className="user-dashboard-modern">
        <div className="dashboard-loading-modern">
          <div className="spinner-modern"></div>
          <p>Cargando tu dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-dashboard-modern">
        <div className="bento-container">
          <div className="dashboard-error-modern">
            <AlertCircle size={48} className="error-icon-modern" />
            <h3>Error al cargar el dashboard</h3>
            <p>{error}</p>
            <button onClick={cargarDashboard} className="btn-retry-modern">
              <i className="fas fa-sync-alt"></i> Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const profile = userProfile || {};
  // Obtener la inicial del nombre para el avatar
  const avatarInitial = profile.nombre?.charAt(0) || user?.nombre?.charAt(0) || "U";

  return (
    <div className="user-dashboard-modern">
      {/* ===== HEADER CON EFECTO DE DESVANECIMIENTO ===== */}
      <header className="dashboard-header-modern">
        {/* Fondo del header */}
        <div className="header-bg-modern"></div>
        
        {/* Efecto de desvanecimiento - gradiente de desaparición */}
        <div className="header-fade-modern"></div>
        
        <div className="bento-container header-content-modern">
          <div className="header-left-modern">
            {/* Avatar con efecto de brillo */}
            <div className="header-avatar-modern">
              {profile.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="avatar-image" />
              ) : (
                <span>{avatarInitial}</span>
              )}
              <div className="avatar-glow"></div>
            </div>
            <div className="header-text-modern">
              <h1>
                ¡Hola, <span className="highlight-name">{profile.nombre || user?.nombre || "Usuario"}</span>!
              </h1>
              <p>
                <Sparkles size={16} /> Bienvenido a tu panel de control
              </p>
            </div>
          </div>
          <div className="header-stats-mini">
            <div className="mini-stat">
              <span className="mini-stat-value">{totalSolicitudes}</span>
              <span className="mini-stat-label">Solicitudes</span>
            </div>
            <div className="mini-stat">
              <span className="mini-stat-value">{tasaAprobacion}%</span>
              <span className="mini-stat-label">Éxito</span>
            </div>
          </div>
        </div>
      </header>

      {/* ===== STATS CARDS CON BARRAS DE PROGRESO ===== */}
      <section className="stats-section-modern">
        <div className="bento-container">
          <div className="stats-grid-modern stagger-children">
            <StatCardModern
              icon={<List size={24} />}
              label="Total Solicitudes"
              value={totalSolicitudes}
              maxValue={Math.max(totalSolicitudes, 10)}
              color="primary"
              progressLabel="Total"
            />
            <StatCardModern
              icon={<Heart size={24} />}
              label="Aprobadas"
              value={aprobadas}
              maxValue={totalSolicitudes || 10}
              color="success"
              progressLabel="Tasa de aprobación"
              percentage={tasaAprobacion}
            />
            <StatCardModern
              icon={<Clock size={24} />}
              label="Pendientes"
              value={pendientes}
              maxValue={totalSolicitudes || 10}
              color="warning"
              progressLabel="Por revisar"
              percentage={totalSolicitudes > 0 ? Math.round((pendientes / totalSolicitudes) * 100) : 0}
            />
            <StatCardModern
              icon={<TrendingUp size={24} />}
              label="Tasa de éxito"
              value={`${tasaAprobacion}%`}
              maxValue={100}
              color="gradient"
              progressLabel="Efectividad"
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
                  <span className="card-icon">📋</span>
                  <h3>Solicitudes recientes</h3>
                </div>
                <Link to="/user/mis-solicitudes" className="card-link-modern">
                  Ver todas <ArrowRight size={14} />
                </Link>
              </div>
              {solicitudesRecientes.length === 0 ? (
                <div className="empty-state-modern">
                  <p>No tienes solicitudes recientes</p>
                </div>
              ) : (
                <ul className="solicitudes-list-modern">
                  {solicitudesRecientes.slice(0, 5).map((sol) => {
                    const estado = getEstadoBadge(sol.estado);
                    const mascotaNombre = sol.solicitable?.nombre_mascota || 
                                          sol.mascota?.nombre_mascota || 
                                          "Mascota";
                    return (
                      <li key={sol.id} className="solicitud-item-modern">
                        <div className="solicitud-info-modern">
                          <span className="solicitud-mascota-modern">{mascotaNombre}</span>
                          <span className={`estado-badge-modern ${estado.className}`}>
                            {estado.icon} {estado.label}
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

            {/* Suscripciones */}
            <div className="card-modern card-suscripciones">
              <div className="card-header-modern">
                <div className="card-header-left">
                  <span className="card-icon">💝</span>
                  <h3>Suscripciones activas</h3>
                </div>
                <Link to="/user/mis-suscripciones" className="card-link-modern">
                  Gestionar <ArrowRight size={14} />
                </Link>
              </div>
              {suscripciones.length === 0 ? (
                <div className="empty-state-modern">
                  <p>No tienes suscripciones activas</p>
                </div>
              ) : (
                <ul className="suscripciones-list-modern">
                  {suscripciones.slice(0, 5).map((sub) => (
                    <li key={sub.id} className="suscripcion-item-modern">
                      <div className="suscripcion-info-modern">
                        <span className="suscripcion-plan-modern">
                          {sub.plan?.nombre || sub.nombre || "Plan"}
                        </span>
                        <span className="suscripcion-monto-modern">
                          ${sub.monto_mensual || sub.monto || 0}/mes
                        </span>
                      </div>
                      <span className={`suscripcion-estado-modern ${sub.estado === "activo" ? "activo" : "inactivo"}`}>
                        {sub.estado === "activo" ? "✅ Activo" : "⏸️ Pausado"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== EVENTOS + VERIFICACIONES ===== */}
      <section className="bottom-section-modern">
        <div className="bento-container">
          <div className="bottom-grid-modern">
            {/* Eventos próximos */}
            {eventosProximos.length > 0 && (
              <div className="card-modern card-eventos">
                <div className="card-header-modern">
                  <div className="card-header-left">
                    <span className="card-icon">📅</span>
                    <h3>Eventos próximos</h3>
                  </div>
                  <Link to="/eventos" className="card-link-modern">
                    Ver todos <ArrowRight size={14} />
                  </Link>
                </div>
                <div className="eventos-grid-modern">
                  {eventosProximos.slice(0, 3).map((evento) => (
                    <div key={evento.id} className="evento-card-modern">
                      <h4>{evento.nombre_evento}</h4>
                      <p className="evento-fecha-modern">📍 {evento.lugar_evento}</p>
                      <p className="evento-fecha-modern">📅 {formatDate(evento.fecha_evento)}</p>
                      <span className="evento-asistencia-modern">✅ Confirmado</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Verificaciones */}
            <div className="card-modern card-verificaciones">
              <div className="card-header-modern">
                <div className="card-header-left">
                  <span className="card-icon">🔐</span>
                  <h3>Verificaciones</h3>
                </div>
              </div>
              <div className="verificaciones-grid-modern">
                <VerificationItemModern
                  icon={<Mail size={18} />}
                  label="Email verificado"
                  verified={profile.email_verificado}
                />
                <VerificationItemModern
                  icon={<ShieldCheck size={18} />}
                  label="Teléfono verificado"
                  verified={!!profile.telefono_verificado}
                />
                <VerificationItemModern
                  icon={<CheckCircle size={18} />}
                  label="Documento verificado"
                  verified={!!profile.documento_verificado}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ACCIONES RÁPIDAS ===== */}
      <section className="quick-actions-section-modern">
        <div className="bento-container">
          <div className="quick-actions-modern">
            <h4>Acciones rápidas</h4>
            <div className="actions-grid-modern">
              <Link to="/mascotas" className="action-btn-modern">
                <div className="action-icon-modern" style={{ background: "rgba(102, 126, 234, 0.15)", color: "var(--color-primary)" }}>
                  <PawPrint size={22} />
                </div>
                <span>Ver mascotas</span>
              </Link>
              <Link to="/eventos" className="action-btn-modern">
                <div className="action-icon-modern" style={{ background: "rgba(255, 140, 66, 0.15)", color: "var(--color-accent)" }}>
                  <CalendarCheck size={22} />
                </div>
                <span>Ver eventos</span>
              </Link>
              <Link to="/user/mis-solicitudes" className="action-btn-modern">
                <div className="action-icon-modern" style={{ background: "rgba(255, 107, 157, 0.15)", color: "var(--color-heart)" }}>
                  <Heart size={22} />
                </div>
                <span>Mis solicitudes</span>
              </Link>
              <Link to="/user/perfil" className="action-btn-modern">
                <div className="action-icon-modern" style={{ background: "rgba(46, 204, 113, 0.15)", color: "var(--color-success)" }}>
                  <User size={22} />
                </div>
                <span>Mi perfil</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== MOTIVACIONAL ===== */}
      <section className="motivational-section-modern">
        <div className="bento-container">
          <div className="motivational-content-modern">
            <div className="motivational-icon-modern">🐾</div>
            <h3>¡Cada acción cuenta!</h3>
            <p>
              Tu participación en adopciones, apadrinamientos y eventos 
              hace la diferencia en la vida de estos animales. <strong>¡Sigue así!</strong>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

// ===== COMPONENTES MODERNOS CON BARRA DE PROGRESO =====

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
  // Calcular el porcentaje para la barra
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

const VerificationItemModern = ({ icon, label, verified }) => (
  <div className={`verification-item-modern ${verified ? "verified" : "unverified"}`}>
    <div className="verification-icon-modern">{icon}</div>
    <span className="verification-label-modern">{label}</span>
    <span className="verification-status-modern">
      {verified ? "✅ Verificado" : "⏳ Pendiente"}
    </span>
  </div>
);

export default UserDashboard;