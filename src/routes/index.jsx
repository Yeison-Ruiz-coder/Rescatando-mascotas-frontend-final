// src/routes/index.js
import React, { lazy } from "react";
import { createBrowserRouter, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// Layouts
import PublicLayout from "../layouts/PublicLayout";
import VeterinariaLayout from "../layouts/VeterinariaLayout";
import FundacionLayout from "../layouts/FundacionLayout";
import AdminLayout from "../layouts/AdminLayout";

// Route Guards
import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";
import VeterinariaRoute from "./VeterinariaRoute";
import FundacionRoute from "./FundacionRoute";

const ForgotPassword = lazy(() => import("../pages/public/ForgotPassword/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/public/ResetPassword/ResetPassword"));

// =============================================================
// PÁGINAS PÚBLICAS
// =============================================================
const Home = lazy(() => import("../pages/public/Home/Home"));
const Login = lazy(() => import("../pages/public/Login/Login"));
const MascotaDetalle = lazy(() => import("../pages/public/Mascotas/MascotaDetalle"));
const Register = lazy(() => import("../pages/public/Register/Register"));
const Mascotas = lazy(() => import("../pages/public/Mascotas/Mascotas"));
const Donaciones = lazy(() => import("../pages/public/Donaciones/Donaciones"));
const Tienda = lazy(() => import("../pages/public/Tienda/Tienda"));
const SolicitarAdopcion = lazy(() => import("../pages/public/SolicitarAdopcion/SolicitarAdopcion"));
const SolicitudExitosa = lazy(() => import("../pages/public/SolicitarAdopcion/SolicitudExitosa"));
const Veterinarias = lazy(() => import("../pages/public/Veterinarias/Veterinarias"));
const VeterinariaDetalle = lazy(() => import("../pages/public/Veterinarias/VeterinariaDetalle"));
const ReportarRescate = lazy(() => import("../pages/public/ReportarRescate/ReportarRescate"));
const FundacionesIndex = lazy(() => import("../pages/public/Fundaciones/FundacionesIndex"));
const FundacionDetalle = lazy(() => import("../pages/public/Fundaciones/FundacionDetalle"));
const PublicEventosIndex = lazy(() => import("../pages/public/Eventos/EventosPublicIndex"));
const PublicEventosShow = lazy(() => import("../pages/public/Eventos/EventosPublicShow"));
const SuscripcionesPublicIndex = lazy(() => import("../pages/public/Suscripciones/SuscripcionesPublicIndex"));

// =============================================================
// PÁGINAS DE USUARIO
// =============================================================
const Solicitudes = lazy(() => import("../pages/user/Solicitudes/Solicitudes"));
const UserProfile = lazy(() => import("../pages/user/perfil/UserProfile"));
const UserSuscripciones = lazy(() => import("../pages/user/MisSuscripciones"));
const UserDashboard = lazy(() => import("../pages/user/PanelUsuario/PanelUsuario"));

// =============================================================
// PÁGINAS ADMIN
// =============================================================
const Dashboard = lazy(() => import("../pages/admin/Dashboard/Dashboard"));
const UsuariosPendientes = lazy(() => import("../pages/admin/Usuarios/UsuariosPendientes"));
const UsuariosList = lazy(() => import("../pages/admin/Usuarios/UsuariosList"));
const UsuariosFundaciones = lazy(() => import("../pages/admin/Usuarios/UsuariosFundaciones"));
const UsuariosVeterinarias = lazy(() => import("../pages/admin/Usuarios/UsuariosVeterinarias"));
const UsuarioForm = lazy(() => import("../pages/admin/Usuarios/UsuarioForm"));
const UsuarioDetail = lazy(() => import("../pages/admin/Usuarios/UsuarioDetail"));
const Contacto = lazy(() => import("../pages/public/Contacto/Contacto"));
const AdminEventosIndex = lazy(() => import("../pages/admin/eventos/EventosIndex"));
const AdminEventosCreate = lazy(() => import("../pages/admin/eventos/EventosCreate"));
const AdminEventosEdit = lazy(() => import("../pages/admin/eventos/EventosEdit"));
const AdminEventosShow = lazy(() => import("../pages/admin/eventos/EventosShow"));
const AdminSuscripcionesIndex = lazy(() => import("../pages/admin/suscripciones/SuscripcionesIndex"));
const AdminSuscripcionesCreate = lazy(() => import("../pages/admin/suscripciones/SuscripcionesCreate"));
const AdminSuscripcionesEdit = lazy(() => import("../pages/admin/suscripciones/SuscripcionesEdit"));
const AdminSuscripcionesShow = lazy(() => import("../pages/admin/suscripciones/SuscripcionesShow"));
const AdminSuscripcionesEstado = lazy(() => import("../pages/admin/suscripciones/SuscripcionesEstado"));
const AdminSuscripcionesReportes = lazy(() => import("../pages/admin/suscripciones/SuscripcionesReportes"));
const AdminAdopciones = lazy(() => import("../pages/admin/adopciones/AdopcionesIndex"));
const AdminAdopcionesSolicitudes = lazy(() => import("../pages/admin/adopciones/AdopcionesSolicitudes"));
const AdminAdopcionesSeguimientos = lazy(() => import("../pages/admin/adopciones/AdopcionesSeguimientos"));
const AdminDonaciones = lazy(() => import("../pages/admin/donaciones/AdminDonaciones"));
const AdminRescatesIndex = lazy(() => import("../pages/admin/rescates/RescatesIndex"));
const AdminRescatesPendientes = lazy(() => import("../pages/admin/rescates/RescatesPendientes"));
const AdminRescatesMapa = lazy(() => import("../pages/admin/rescates/RescatesMapa"));
const AdminRescatesShow = lazy(() => import("../pages/admin/rescates/RescatesShow"));
const AdminProfile = lazy(() => import("../pages/admin/perfil/AdminProfile"));

// =============================================================
// PÁGINAS DE FUNDACIÓN
// =============================================================
const FundDashboard = lazy(() => import("../pages/fundacion/dashboard/FundacionDashboard"));
const FundMascotas = lazy(() => import("../pages/fundacion/mascotas/Mascotas"));
const CrearMascota = lazy(() => import("../pages/fundacion/mascotas/CrearMascota"));
const EditarMascota = lazy(() => import("../pages/fundacion/mascotas/EditarMascota"));
const MascotaDetalleFundacion = lazy(() => import("../pages/fundacion/mascotas/MascotaDetalle"));
const EventosIndex = lazy(() => import("../pages/fundacion/eventos/EventosIndex"));
const EventosCreate = lazy(() => import("../pages/fundacion/eventos/EventosCreate"));
const EventosShow = lazy(() => import("../pages/fundacion/eventos/EventosShowFundacion"));
const EventosEdit = lazy(() => import("../pages/fundacion/eventos/EventosEdit"));
const SuscripcionesIndex = lazy(() => import("../pages/fundacion/suscripciones/SuscripcionesIndex"));
const SuscripcionesCreate = lazy(() => import("../pages/fundacion/suscripciones/SuscripcionesCreate"));
const SuscripcionesEdit = lazy(() => import("../pages/fundacion/suscripciones/SuscripcionesEdit"));
const SuscripcionesShow = lazy(() => import("../pages/fundacion/suscripciones/SuscripcionesShow"));
const FundacionSolicitudesRecibidas = lazy(() => import("../pages/fundacion/adopciones/FundacionSolicitudesRecibidas"));
const RescatesDisponiblesFundacion = lazy(() => import("../pages/fundacion/rescates/RescatesDisponibles"));
const MisRescatesFundacion = lazy(() => import("../pages/fundacion/rescates/MisRescates"));
const RescateDetalleFundacion = lazy(() => import("../pages/fundacion/rescates/RescateDetalle"));
const FundacionProfile = lazy(() => import("../pages/fundacion/perfil/FundacionProfile"));

// =============================================================
// PÁGINAS DE VETERINARIA
// =============================================================
const DashboardVeterinaria = lazy(() => import("../pages/veterinaria/dashboard/DashboardVeterinaria"));
const Citas = lazy(() => import("../pages/veterinaria/citas/Citas"));
const CitaForm = lazy(() => import("../pages/veterinaria/citas/CitaForm"));
const Pacientes = lazy(() => import("../pages/veterinaria/pacientes/Pacientes"));
const PacienteForm = lazy(() => import("../pages/veterinaria/pacientes/PacienteForm"));
const HistorialMedico = lazy(() => import("../pages/veterinaria/historial/HistorialMedico"));
const VeterinariaSuscripcionesIndex = lazy(() => import("../pages/veterinaria/suscripciones/SuscripcionesIndex"));
const VeterinariaSuscripcionesShow = lazy(() => import("../pages/veterinaria/suscripciones/SuscripcionesShow"));
const RescatesDisponiblesVet = lazy(() => import("../pages/veterinaria/rescates/RescatesDisponibles"));
const MisRescatesVet = lazy(() => import("../pages/veterinaria/rescates/MisRescates"));
const RescateDetalleVet = lazy(() => import("../pages/veterinaria/rescates/RescateDetalle"));
const VeterinariaProfile = lazy(() => import("../pages/veterinaria/perfil/VeterinariaProfile"));

// =============================================================
// PLACEHOLDERS PARA PÁGINAS QUE NO TIENEN AÚN
// =============================================================

// Admin placeholders
const AdminMascotas = () => (
  <div
    style={{
      color: "#333",
      padding: "2rem",
      background: "white",
      borderRadius: "1rem",
    }}
  >
    <h1>Gestión de Mascotas</h1>
    <p>Próximamente - Página en construcción</p>
  </div>
);

const AdminMascotasNueva = () => (
  <div
    style={{
      color: "#333",
      padding: "2rem",
      background: "white",
      borderRadius: "1rem",
    }}
  >
    <h1>Registrar Nueva Mascota</h1>
    <p>Próximamente - Página en construcción</p>
  </div>
);

const PagePlaceholder = ({
  title,
  description = "Próximamente - Página en construcción",
}) => (
  <div
    style={{
      minHeight: "70vh",
      padding: "4rem 1.5rem",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#f8fafc",
      color: "#1f2937",
    }}
  >
    <div style={{ maxWidth: "860px", textAlign: "center", width: "100%" }}>
      <h1 style={{ fontSize: "2.75rem", marginBottom: "1rem" }}>{title}</h1>
      <p style={{ fontSize: "1.15rem", lineHeight: "1.75", color: "#475569" }}>
        {description}
      </p>
    </div>
  </div>
);

const AdminFundaciones = () => <PagePlaceholder title="Fundaciones" />;
const AdminVeterinarias = () => <PagePlaceholder title="Veterinarias" />;
const AdminProductos = () => <PagePlaceholder title="Productos" />;
const AdminComentarios = () => <PagePlaceholder title="Comentarios" />;
const AdminNotificaciones = () => <PagePlaceholder title="Notificaciones" />;
const AdminReportes = () => <PagePlaceholder title="Reportes" />;
const AdminConfiguracion = () => <PagePlaceholder title="Configuración" />;
const AdminRazas = () => <PagePlaceholder title="Catálogo de Razas" />;
const AdminVacunas = () => <PagePlaceholder title="Tipos de Vacunas" />;
const AdminCategorias = () => <PagePlaceholder title="Categorías" />;

// ✅ Usuario placeholders (NOMBRES DIFERENTES para evitar conflicto)
const UserCarrito = () => <PagePlaceholder title="Mi Carrito" />;
const UserPedidos = () => <PagePlaceholder title="Mis Pedidos" />;
const UserDonaciones = () => <PagePlaceholder title="Mis Donaciones" />;

// Veterinaria placeholders
const VetAtenciones = () => <PagePlaceholder title="Atenciones Médicas" />;
const VetHistoriales = () => <PagePlaceholder title="Historiales" />;
const VetVacunas = () => <PagePlaceholder title="Vacunas" />;
const VetProductos = () => <PagePlaceholder title="Productos" />;
const VetPedidos = () => <PagePlaceholder title="Pedidos" />;
const VetReportes = () => <PagePlaceholder title="Reportes" />;

// Fundación placeholders
const FundacionAdopciones = () => <PagePlaceholder title="Adopciones" />;
const FundDonaciones = () => <PagePlaceholder title="Donaciones" />;
const FundVoluntarios = () => <PagePlaceholder title="Voluntarios" />;
const FundReportes = () => <PagePlaceholder title="Reportes" />;

// =============================================================
// COMPONENTE 404
// =============================================================
const NotFound = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, getDashboardPath } = useAuth();

  const goBack = () => navigate(-1);
  const goHome = () => {
    if (
      isAuthenticated &&
      (user?.tipo === "admin" ||
        user?.tipo === "veterinaria" ||
        user?.tipo === "fundacion")
    ) {
      navigate(getDashboardPath());
    } else {
      navigate("/");
    }
  };

  const getButtonText = () => {
    if (!isAuthenticated) return "Volver al inicio";
    if (user?.tipo === "admin") return "Ir al Panel Admin";
    if (user?.tipo === "veterinaria") return "Ir a mi Clínica";
    if (user?.tipo === "fundacion") return "Ir a mi Fundación";
    return "Volver al inicio";
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        textAlign: "center",
        background: "linear-gradient(135deg, #1a1f2e 0%, #0f1119 100%)",
        color: "white",
      }}
    >
      <h1 style={{ fontSize: "6rem", margin: 0 }}>404</h1>
      <h2>Página no encontrada</h2>
      <p style={{ color: "rgba(255,255,255,0.7)" }}>
        Lo sentimos, la página que buscas no existe.
      </p>
      <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
        <button
          onClick={goBack}
          style={{
            padding: "12px 30px",
            background: "rgba(255,255,255,0.1)",
            color: "white",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "50px",
            cursor: "pointer",
          }}
        >
          ← Volver atrás
        </button>
        <button
          onClick={goHome}
          style={{
            padding: "12px 30px",
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            color: "white",
            border: "none",
            borderRadius: "50px",
            cursor: "pointer",
          }}
        >
          {getButtonText()} →
        </button>
      </div>
    </div>
  );
};

// =============================================================
// CONFIGURACIÓN DE RUTAS COMBINADA
// =============================================================

const router = createBrowserRouter([
  // ================= RUTAS PÚBLICAS =================
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "reset-password", element: <ResetPassword /> },
      { path: "mascotas", element: <Mascotas /> },
      { path: "mascota/:id", element: <MascotaDetalle /> },
      { path: "fundaciones", element: <FundacionesIndex /> },
      { path: "fundaciones/:id", element: <FundacionDetalle /> },
      { path: "veterinarias", element: <Veterinarias /> },
      { path: "veterinarias/:id", element: <VeterinariaDetalle /> },
      { path: "solicitar-adopcion/:id", element: <SolicitarAdopcion /> },
      { path: "adopcion-exitosa/:id", element: <SolicitudExitosa /> },
      { path: "eventos", element: <PublicEventosIndex /> },
      { path: "eventos/:id", element: <PublicEventosShow /> },
      { path: "donaciones", element: <Donaciones /> },
      { path: "rescates/reportar", element: <ReportarRescate /> },
      { path: "suscripciones", element: <SuscripcionesPublicIndex /> },
      { path: "apadrinar", element: <SuscripcionesPublicIndex /> },
      { path: "contacto", element: <Contacto /> },
    ],
  },

  // ================= RUTAS DE USUARIO =================
  {
    path: "/user",
    element: <PrivateRoute />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          { index: true, element: <Navigate to="/user/PanelUsuario" replace /> },
          { path: "PanelUsuario", element: <UserDashboard /> },
          { path: "perfil", element: <UserProfile /> },
          { path: "mis-solicitudes", element: <Solicitudes /> },
          { path: "tienda", element: <Tienda /> },
          { path: "carrito", element: <UserCarrito /> },
          { path: "pedidos", element: <UserPedidos /> },
          { path: "donaciones", element: <UserDonaciones /> },
          { path: "mis-suscripciones", element: <UserSuscripciones /> },
        ],
      },
    ],
  },

  // ================= RUTAS DE VETERINARIA =================
  {
    path: "/veterinaria",
    element: <VeterinariaRoute />,
    children: [
      {
        element: <VeterinariaLayout />,
        children: [
          { index: true, element: <Navigate to="/veterinaria/dashboard" replace /> },
          { path: "dashboard", element: <DashboardVeterinaria /> },
          { path: "rescates", element: <RescatesDisponiblesVet tipoUsuario="veterinaria" /> },
          { path: "rescates/disponibles", element: <RescatesDisponiblesVet tipoUsuario="veterinaria" /> },
          { path: "rescates/mis-rescates", element: <MisRescatesVet tipoUsuario="veterinaria" /> },
          { path: "rescates/:id", element: <RescateDetalleVet /> },
          { path: "atenciones", element: <VetAtenciones /> },
          { path: "historiales", element: <VetHistoriales /> },
          { path: "citas", element: <Citas /> },
          { path: "citas/nueva", element: <CitaForm /> },
          { path: "citas/editar/:id", element: <CitaForm /> },
          { path: "mascotas", element: <Pacientes /> },
          { path: "pacientes/nuevo", element: <PacienteForm /> },
          { path: "pacientes/editar/:id", element: <PacienteForm /> },
          { path: "pacientes/:id/historial", element: <HistorialMedico /> },
          { path: "vacunas", element: <VetVacunas /> },
          { path: "productos", element: <VetProductos /> },
          { path: "pedidos", element: <VetPedidos /> },
          { path: "reportes", element: <VetReportes /> },
          { path: "perfil", element: <VeterinariaProfile /> },
          { path: "suscripciones", element: <VeterinariaSuscripcionesIndex /> },
          { path: "suscripciones/:id", element: <VeterinariaSuscripcionesShow /> },
        ],
      },
    ],
  },

  // ================= RUTAS DE FUNDACIÓN =================
  {
    path: "/fundacion",
    element: <FundacionRoute />,
    children: [
      {
        element: <FundacionLayout />,
        children: [
          { index: true, element: <Navigate to="/fundacion/dashboard" replace /> },
          { path: "dashboard", element: <FundDashboard /> },
          { path: "mascotas", element: <FundMascotas /> },
          { path: "mascotas/nueva", element: <CrearMascota /> },
          { path: "mascotas/:id", element: <MascotaDetalleFundacion /> },
          { path: "mascotas/editar/:id", element: <EditarMascota /> },
          { path: "rescates", element: <RescatesDisponiblesFundacion tipoUsuario="fundacion" /> },
          { path: "rescates/disponibles", element: <RescatesDisponiblesFundacion tipoUsuario="fundacion" /> },
          { path: "rescates/mis-rescates", element: <MisRescatesFundacion tipoUsuario="fundacion" /> },
          { path: "rescates/:id", element: <RescateDetalleFundacion /> },
          { path: "eventos", element: <EventosIndex /> },
          { path: "eventos/crear", element: <EventosCreate /> },
          { path: "eventos/:id", element: <EventosShow /> },
          { path: "eventos/:id/editar", element: <EventosEdit /> },
          { path: "suscripciones", element: <SuscripcionesIndex /> },
          { path: "suscripciones/crear", element: <SuscripcionesCreate /> },
          { path: "suscripciones/:id", element: <SuscripcionesShow /> },
          { path: "suscripciones/:id/editar", element: <SuscripcionesEdit /> },
          { path: "adopciones", element: <FundacionAdopciones /> },
          { path: "solicitudes", element: <FundacionSolicitudesRecibidas /> },
          { path: "donaciones", element: <FundDonaciones /> },
          { path: "voluntarios", element: <FundVoluntarios /> },
          { path: "reportes", element: <FundReportes /> },
          { path: "perfil", element: <FundacionProfile /> },
        ],
      },
    ],
  },

  // ================= RUTAS DE ADMIN =================
  {
    path: "/admin",
    element: <AdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="/admin/dashboard" replace /> },
          { path: "dashboard", element: <Dashboard /> },
          {
            path: "usuarios",
            children: [
              { index: true, element: <UsuariosList /> },
              { path: "pendientes", element: <UsuariosPendientes /> },
              { path: "fundaciones", element: <UsuariosFundaciones /> },
              { path: "veterinarias", element: <UsuariosVeterinarias /> },
              { path: "create", element: <UsuarioForm /> },
              { path: ":id", element: <UsuarioDetail /> },
              { path: ":id/edit", element: <UsuarioForm /> },
            ],
          },
          { path: "mascotas", element: <AdminMascotas /> },
          { path: "mascotas/nueva", element: <AdminMascotasNueva /> },
          { path: "rescates", element: <AdminRescatesIndex /> },
          { path: "rescates/pendientes", element: <AdminRescatesPendientes /> },
          { path: "rescates/mapa", element: <AdminRescatesMapa /> },
          { path: "rescates/:id", element: <AdminRescatesShow /> },
          { path: "eventos", element: <AdminEventosIndex /> },
          { path: "eventos/crear", element: <AdminEventosCreate /> },
          { path: "eventos/calendario", element: <PagePlaceholder title="Calendario" /> },
          { path: "eventos/:id", element: <AdminEventosShow /> },
          { path: "eventos/:id/editar", element: <AdminEventosEdit /> },
          { path: "suscripciones", element: <AdminSuscripcionesIndex /> },
          { path: "suscripciones/crear", element: <AdminSuscripcionesCreate /> },
          { path: "suscripciones/estado", element: <AdminSuscripcionesEstado /> },
          { path: "suscripciones/reportes", element: <AdminSuscripcionesReportes /> },
          { path: "suscripciones/:id", element: <AdminSuscripcionesShow /> },
          { path: "suscripciones/:id/editar", element: <AdminSuscripcionesEdit /> },
          {
            path: "adopciones",
            children: [
              { index: true, element: <AdminAdopciones /> },
              { path: "solicitudes", element: <AdminAdopcionesSolicitudes /> },
              { path: "seguimientos", element: <AdminAdopcionesSeguimientos /> },
            ],
          },
          { path: "donaciones", element: <AdminDonaciones /> },
          { path: "fundaciones", element: <AdminFundaciones /> },
          { path: "veterinarias", element: <AdminVeterinarias /> },
          { path: "productos", element: <AdminProductos /> },
          { path: "comentarios", element: <AdminComentarios /> },
          { path: "notificaciones", element: <AdminNotificaciones /> },
          { path: "reportes", element: <AdminReportes /> },
          { path: "configuracion", element: <AdminConfiguracion /> },
          { path: "razas", element: <AdminRazas /> },
          { path: "vacunas", element: <AdminVacunas /> },
          { path: "categorias", element: <AdminCategorias /> },
          { path: "perfil", element: <AdminProfile /> },
        ],
      },
    ],
  },

  // ================= 404 =================
  { path: "*", element: <NotFound /> },
]);

export default router;