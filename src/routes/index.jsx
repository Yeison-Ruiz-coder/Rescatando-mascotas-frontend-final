import React from 'react';
import { createBrowserRouter, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import VeterinariaLayout from '../layouts/VeterinariaLayout';
import FundacionLayout from '../layouts/FundacionLayout';
import AdminLayout from '../layouts/AdminLayout';

// Route Guards
import PrivateRoute from './PrivateRoute';
import AdminRoute from './AdminRoute';
import VeterinariaRoute from './VeterinariaRoute';
import FundacionRoute from './FundacionRoute';

// =============================================================
// PÁGINAS PÚBLICAS
// =============================================================
import Home from '../pages/public/Home/Home';
import Login from '../pages/public/Login/Login';
import MascotaDetalle from '../pages/public/MascotaDetalle/MascotaDetalle';
import Register from '../pages/public/Register/Register';
import Mascotas from '../pages/public/Mascotas/Mascotas';
import Adopciones from '../pages/public/Adopciones/Adopciones';
import Eventos from '../pages/public/Eventos/Eventos';
import Donaciones from '../pages/public/Donaciones/Donaciones';
import Tienda from '../pages/public/Tienda/Tienda';
import SolicitarAdopcion from '../pages/public/SolicitarAdopcion/SolicitarAdopcion';
import SolicitudExitosa from '../pages/public/SolicitarAdopcion/SolicitudExitosa';
import Veterinarias from '../pages/public/Veterinarias/Veterinarias';
import VeterinariaDetalle from '../pages/public/Veterinarias/VeterinariaDetalle';
import Fundaciones from '../pages/public/Fundaciones/Fundaciones';
import FundacionDetalle from '../pages/public/Fundaciones/FundacionDetalle';
import ReportarRescate from '../pages/public/ReportarRescate/ReportarRescate';

// Eventos Público
import PublicEventosIndex from '../pages/public/eventos/EventosIndex';
import PublicEventosShow from '../pages/public/eventos/EventosShow';

// =============================================================
// PÁGINAS DE USUARIO
// =============================================================
import Solicitudes from '../pages/user/Solicitudes/Solicitudes';

// =============================================================
// PÁGINAS ADMIN
// =============================================================
import Dashboard from '../pages/admin/Dashboard/Dashboard';
import UsuariosPendientes from '../pages/admin/Usuarios/UsuariosPendientes';

// Eventos Admin
import AdminEventosIndex from '../pages/admin/eventos/EventosIndex';
import AdminEventosCreate from '../pages/admin/eventos/EventosCreate';
import AdminEventosEdit from '../pages/admin/eventos/EventosEdit';
import AdminEventosShow from '../pages/admin/eventos/EventosShow';

// =============================================================
// PÁGINAS DE FUNDACIÓN (COMPONENTES REALES)
// =============================================================
import FundDashboard from '../pages/fundacion/dashboard/Dashboard';
import FundMascotas from '../pages/fundacion/mascotas/Mascotas';
import FundNuevaMascota from '../pages/fundacion/mascotas/NuevaMascota';

// Veterinaria reales
import DashboardVeterinaria from '../pages/veterinaria/dashboard/DashboardVeterinaria';
import Citas from '../pages/veterinaria/citas/Citas';
import CitaForm from '../pages/veterinaria/citas/CitaForm';
import Pacientes from '../pages/veterinaria/pacientes/Pacientes';
import PacienteForm from '../pages/veterinaria/pacientes/PacienteForm';
import HistorialMedico from '../pages/veterinaria/historial/HistorialMedico';

// =============================================================
// PLACEHOLDERS PARA PÁGINAS QUE NO TIENES AÚN
// =============================================================

// Admin placeholders
const AdminMascotas = () => (
  <div style={{ color: '#333', padding: '2rem', background: 'white', borderRadius: '1rem' }}>
    <h1>Gestión de Mascotas</h1>
    <p>Próximamente - Página en construcción</p>
  </div>
);

const AdminMascotasNueva = () => (
  <div style={{ color: '#333', padding: '2rem', background: 'white', borderRadius: '1rem' }}>
    <h1>Registrar Nueva Mascota</h1>
    <p>Próximamente - Página en construcción</p>
  </div>
);

const UsuariosList = () => (
  <div style={{ color: '#333', padding: '2rem', background: 'white', borderRadius: '1rem' }}>
    <h1>Gestión de Usuarios</h1>
    <p>Próximamente - Página en construcción</p>
  </div>
);

const UsuarioForm = () => (
  <div style={{ color: '#333', padding: '2rem', background: 'white', borderRadius: '1rem' }}>
    <h1>Formulario de Usuario</h1>
    <p>Próximamente - Página en construcción</p>
  </div>
);

const UsuarioDetail = () => (
  <div style={{ color: '#333', padding: '2rem', background: 'white', borderRadius: '1rem' }}>
    <h1>Detalle de Usuario</h1>
    <p>Próximamente - Página en construcción</p>
  </div>
);

const PagePlaceholder = ({ title, description = 'Próximamente - Página en construcción' }) => (
  <div
    style={{
      minHeight: '70vh',
      padding: '4rem 1.5rem',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#f8fafc',
      color: '#1f2937'
    }}
  >
    <div style={{ maxWidth: '860px', textAlign: 'center', width: '100%' }}>
      <h1 style={{ fontSize: '2.75rem', marginBottom: '1rem' }}>{title}</h1>
      <p style={{ fontSize: '1.15rem', lineHeight: '1.75', color: '#475569' }}>{description}</p>
    </div>
  </div>
);

const AdminAdopciones = () => <PagePlaceholder title="Adopciones" />;
const AdminDonaciones = () => <PagePlaceholder title="Donaciones" />;
const AdminEventos = () => <PagePlaceholder title="Eventos" />;
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

// Públicas placeholders
// Estos placeholders se mantienen solo para rutas que no tienen componentes reales aún.
// Las rutas públicas principales tienen componentes reales importados arriba.

// Usuario placeholders
const UserDashboard = () => <PagePlaceholder title="Dashboard Usuario" />;
const UserProfile = () => <PagePlaceholder title="Mi Perfil" />;
const UserCarrito = () => <PagePlaceholder title="Mi Carrito" />;
const UserPedidos = () => <PagePlaceholder title="Mis Pedidos" />;
const UserDonaciones = () => <PagePlaceholder title="Mis Donaciones" />;

// Veterinaria placeholders
const VetDashboard = () => <PagePlaceholder title="Dashboard Veterinaria" />;
const VetAtenciones = () => <PagePlaceholder title="Atenciones Médicas" />;
const VetHistoriales = () => <PagePlaceholder title="Historiales" />;
const VetCitas = () => <PagePlaceholder title="Citas" />;
const VetMascotas = () => <PagePlaceholder title="Mascotas" />;
const VetVacunas = () => <PagePlaceholder title="Vacunas" />;
const VetProductos = () => <PagePlaceholder title="Productos" />;
const VetPedidos = () => <PagePlaceholder title="Pedidos" />;
const VetReportes = () => <PagePlaceholder title="Reportes" />;

// Fundación placeholders (SOLO para páginas que NO tienen componente real)
const FundRescates = () => <PagePlaceholder title="Rescates" />;
const FundAdopciones = () => <PagePlaceholder title="Adopciones" />;
const FundDonaciones = () => <PagePlaceholder title="Donaciones" />;
const FundEventos = () => <PagePlaceholder title="Eventos" />;
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
    if (isAuthenticated && (user?.tipo === 'admin' || user?.tipo === 'veterinaria' || user?.tipo === 'fundacion')) {
      navigate(getDashboardPath());
    } else {
      navigate('/');
    }
  };

  const getButtonText = () => {
    if (!isAuthenticated) return 'Volver al inicio';
    if (user?.tipo === 'admin') return 'Ir al Panel Admin';
    if (user?.tipo === 'veterinaria') return 'Ir a mi Clínica';
    if (user?.tipo === 'fundacion') return 'Ir a mi Fundación';
    return 'Volver al inicio';
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      textAlign: 'center',
      background: 'linear-gradient(135deg, #1a1f2e 0%, #0f1119 100%)',
      color: 'white'
    }}>
      <h1 style={{ fontSize: '6rem', margin: 0 }}>404</h1>
      <h2>Página no encontrada</h2>
      <p style={{ color: 'rgba(255,255,255,0.7)' }}>Lo sentimos, la página que buscas no existe.</p>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <button onClick={goBack} style={{ padding: '12px 30px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50px', cursor: 'pointer' }}>
          ← Volver atrás
        </button>
        <button onClick={goHome} style={{ padding: '12px 30px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer' }}>
          {getButtonText()} →
        </button>
      </div>
    </div>
  );
};

// =============================================================
// CONFIGURACIÓN DE RUTAS
// =============================================================

const router = createBrowserRouter([
  // RUTAS PÚBLICAS
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'mascotas', element: <Mascotas /> },
      { path: 'adopciones', element: <Adopciones /> },
      { path: 'fundaciones', element: <Fundaciones /> },
      { path: 'fundaciones/:id', element: <FundacionDetalle /> },
      { path: 'veterinarias', element: <Veterinarias /> },
      { path: 'veterinarias/:id', element: <VeterinariaDetalle /> },
      { path: 'mascota/:id', element: <MascotaDetalle /> },
      { path: 'solicitar-adopcion/:id', element: <SolicitarAdopcion /> },
      { path: 'adopcion-exitosa/:id', element: <SolicitudExitosa /> },
      // ✅ RUTAS PÚBLICAS DE EVENTOS (CORREGIDO - solo una vez)
      { path: 'eventos', element: <PublicEventosIndex /> },
      { path: 'eventos/:id', element: <PublicEventosShow /> },
      { path: 'tienda', element: <Tienda /> },
      { path: 'rescates/reportar', element: <ReportarRescate /> },
      { path: 'donaciones', element: <Donaciones /> },
    ]
  },

  // RUTAS DE USUARIO
  {
    path: '/user',
    element: <PrivateRoute />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          { index: true, element: <Navigate to="/user/dashboard" replace /> },
          { path: 'dashboard', element: <UserDashboard /> },
          { path: 'perfil', element: <UserProfile /> },
          { path: 'mis-solicitudes', element: <Solicitudes /> },
          { path: 'carrito', element: <UserCarrito /> },
          { path: 'pedidos', element: <UserPedidos /> },
          { path: 'donaciones', element: <UserDonaciones /> },
        ]
      }
    ]
  },

  // RUTAS DE VETERINARIA
  {
    path: '/veterinaria',
    element: <VeterinariaRoute />,
    children: [
      {
        element: <VeterinariaLayout />,
        children: [
          { index: true, element: <Navigate to="/veterinaria/dashboard" replace /> },
          { path: 'dashboard', element: <DashboardVeterinaria /> },
          { path: 'atenciones', element: <VetAtenciones /> },
          { path: 'historiales', element: <VetHistoriales /> },
          { path: 'citas', element: <Citas /> },
          { path: 'citas/nueva', element: <CitaForm /> },
          { path: 'citas/editar/:id', element: <CitaForm /> },
          { path: 'mascotas', element: <Pacientes /> },
          { path: 'pacientes/nuevo', element: <PacienteForm /> },
          { path: 'pacientes/editar/:id', element: <PacienteForm /> },
          { path: 'pacientes/:id/historial', element: <HistorialMedico /> },
          { path: 'vacunas', element: <VetVacunas /> },
          { path: 'productos', element: <VetProductos /> },
          { path: 'pedidos', element: <VetPedidos /> },
          { path: 'reportes', element: <VetReportes /> },
          { path: 'perfil', element: <div>Mi Perfil</div> },
        ]
      }
    ]
  },

  // ✅ RUTAS DE FUNDACIÓN (CORREGIDO - sin duplicados)
  {
    path: '/fundacion',
    element: <FundacionRoute />,
    children: [
      {
        element: <FundacionLayout />,
        children: [
          { index: true, element: <Navigate to="/fundacion/dashboard" replace /> },
          { path: 'dashboard', element: <FundDashboard /> },
          { path: 'mascotas', element: <FundMascotas /> },
          { path: 'mascotas/nueva', element: <FundNuevaMascota /> },
          { path: 'rescates', element: <FundRescates /> },
          { path: 'adopciones', element: <FundAdopciones /> },
          { path: 'donaciones', element: <FundDonaciones /> },
          // ✅ RUTAS DE EVENTOS PARA FUNDACIÓN (solo estas)
          { path: 'eventos', element: <EventosIndex /> },
          { path: 'eventos/crear', element: <EventosCreate /> },
          { path: 'eventos/:id', element: <EventosShow /> },
          { path: 'eventos/:id/editar', element: <EventosEdit /> },
          { path: 'voluntarios', element: <FundVoluntarios /> },
          { path: 'reportes', element: <FundReportes /> },
          { path: 'perfil', element: <div>Mi Perfil</div> },
        ]
      }
    ]
  },

  // ✅ RUTAS DE ADMIN (CORREGIDO - sin duplicados)
  {
    path: '/admin',
    element: <AdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="/admin/dashboard" replace /> },
          { path: 'dashboard', element: <Dashboard /> },
          {
            path: 'usuarios',
            children: [
              { index: true, element: <UsuariosList /> },
              { path: 'pendientes', element: <UsuariosPendientes /> },
              { path: 'create', element: <UsuarioForm /> },
              { path: ':id', element: <UsuarioDetail /> },
              { path: ':id/edit', element: <UsuarioForm /> },
            ]
          },
          { path: 'mascotas', element: <AdminMascotas /> },
          { path: 'mascotas/nueva', element: <AdminMascotasNueva /> },
          { path: 'adopciones', element: <AdminAdopciones /> },
          { path: 'donaciones', element: <AdminDonaciones /> },
          // ✅ RUTAS DE EVENTOS PARA ADMIN (solo estas)
          { path: 'eventos', element: <AdminEventosIndex /> },
          { path: 'eventos/crear', element: <AdminEventosCreate /> },
          { path: 'eventos/:id', element: <AdminEventosShow /> },
          { path: 'eventos/:id/editar', element: <AdminEventosEdit /> },
          { path: 'fundaciones', element: <AdminFundaciones /> },
          { path: 'veterinarias', element: <AdminVeterinarias /> },
          { path: 'productos', element: <AdminProductos /> },
          { path: 'comentarios', element: <AdminComentarios /> },
          { path: 'notificaciones', element: <AdminNotificaciones /> },
          { path: 'reportes', element: <AdminReportes /> },
          { path: 'configuracion', element: <AdminConfiguracion /> },
          { path: 'razas', element: <AdminRazas /> },
          { path: 'vacunas', element: <AdminVacunas /> },
          { path: 'categorias', element: <AdminCategorias /> },
          { path: 'perfil', element: <div>Mi Perfil Admin</div> },
        ]
      }
    ]
  },

  { path: '*', element: <NotFound /> }
]);

export default router;