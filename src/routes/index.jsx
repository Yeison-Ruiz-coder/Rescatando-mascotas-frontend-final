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
// PÁGINAS PÚBLICAS (EXISTENTES - FUNCIONAN)
// =============================================================
import Home from '../pages/public/Home/Home';
import Login from '../pages/public/Login/Login';
import MascotaDetalle from '../pages/public/MascotaDetalle/MascotaDetalle';
import Register from '../pages/public/Register/Register';
import Mascotas from '../pages/public/Mascotas/Mascotas';
import SolicitarAdopcion from '../pages/public/SolicitarAdopcion/SolicitarAdopcion';
import SolicitudExitosa from '../pages/public/SolicitarAdopcion/SolicitudExitosa';

// =============================================================
// PÁGINAS DE USUARIO
// =============================================================
import Solicitudes from '../pages/user/Solicitudes/Solicitudes';

// =============================================================
// PÁGINAS ADMIN (LAS QUE YA TIENES CREADAS)
// =============================================================
import Dashboard from '../pages/admin/Dashboard/Dashboard';
import UsuariosPendientes from '../pages/admin/Usuarios/UsuariosPendientes';

// PLACEHOLDERS PARA PÁGINAS QUE NO TIENES AÚN (pero funcionan)
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

// Otros placeholders para admin
const AdminAdopciones = () => <div style={{ color: '#333', padding: '2rem' }}>Adopciones - Próximamente</div>;
const AdminDonaciones = () => <div style={{ color: '#333', padding: '2rem' }}>Donaciones - Próximamente</div>;
const AdminEventos = () => <div style={{ color: '#333', padding: '2rem' }}>Eventos - Próximamente</div>;
const AdminFundaciones = () => <div style={{ color: '#333', padding: '2rem' }}>Fundaciones - Próximamente</div>;
const AdminVeterinarias = () => <div style={{ color: '#333', padding: '2rem' }}>Veterinarias - Próximamente</div>;
const AdminProductos = () => <div style={{ color: '#333', padding: '2rem' }}>Productos - Próximamente</div>;
const AdminComentarios = () => <div style={{ color: '#333', padding: '2rem' }}>Comentarios - Próximamente</div>;
const AdminNotificaciones = () => <div style={{ color: '#333', padding: '2rem' }}>Notificaciones - Próximamente</div>;
const AdminReportes = () => <div style={{ color: '#333', padding: '2rem' }}>Reportes - Próximamente</div>;
const AdminConfiguracion = () => <div style={{ color: '#333', padding: '2rem' }}>Configuración - Próximamente</div>;
const AdminRazas = () => <div style={{ color: '#333', padding: '2rem' }}>Catálogo de Razas - Próximamente</div>;
const AdminVacunas = () => <div style={{ color: '#333', padding: '2rem' }}>Tipos de Vacunas - Próximamente</div>;
const AdminCategorias = () => <div style={{ color: '#333', padding: '2rem' }}>Categorías - Próximamente</div>;

// Placeholders para páginas públicas que no tienes
const Adopciones = () => <div style={{ color: 'white', padding: '2rem' }}>Listado de Adopciones - Próximamente</div>;
const Fundaciones = () => <div style={{ color: 'white', padding: '2rem' }}>Fundaciones - Próximamente</div>;
const Veterinarias = () => <div style={{ color: 'white', padding: '2rem' }}>Veterinarias - Próximamente</div>;
const Eventos = () => <div style={{ color: 'white', padding: '2rem' }}>Eventos - Próximamente</div>;
const Donaciones = () => <div style={{ color: 'white', padding: '2rem' }}>Donaciones - Próximamente</div>;
const Tienda = () => <div style={{ color: 'white', padding: '2rem' }}>Tienda - Próximamente</div>;
const ReportarRescate = () => <div style={{ color: 'white', padding: '2rem' }}>Reportar Rescate - Próximamente</div>;

// Placeholders para usuario
const UserDashboard = () => <div style={{ color: 'white', padding: '2rem' }}>Dashboard Usuario - Próximamente</div>;
const UserProfile = () => <div style={{ color: 'white', padding: '2rem' }}>Mi Perfil - Próximamente</div>;
const UserCarrito = () => <div style={{ color: 'white', padding: '2rem' }}>Mi Carrito - Próximamente</div>;
const UserPedidos = () => <div style={{ color: 'white', padding: '2rem' }}>Mis Pedidos - Próximamente</div>;
const UserDonaciones = () => <div style={{ color: 'white', padding: '2rem' }}>Mis Donaciones - Próximamente</div>;

// Placeholders para veterinaria
const VetDashboard = () => <div style={{ color: 'white', padding: '2rem' }}>Dashboard Veterinaria - Próximamente</div>;
const VetAtenciones = () => <div style={{ color: 'white', padding: '2rem' }}>Atenciones Médicas - Próximamente</div>;
const VetHistoriales = () => <div style={{ color: 'white', padding: '2rem' }}>Historiales - Próximamente</div>;
const VetCitas = () => <div style={{ color: 'white', padding: '2rem' }}>Citas - Próximamente</div>;
const VetMascotas = () => <div style={{ color: 'white', padding: '2rem' }}>Mascotas - Próximamente</div>;
const VetVacunas = () => <div style={{ color: 'white', padding: '2rem' }}>Vacunas - Próximamente</div>;
const VetProductos = () => <div style={{ color: 'white', padding: '2rem' }}>Productos - Próximamente</div>;
const VetPedidos = () => <div style={{ color: 'white', padding: '2rem' }}>Pedidos - Próximamente</div>;
const VetReportes = () => <div style={{ color: 'white', padding: '2rem' }}>Reportes - Próximamente</div>;

// Placeholders para fundación
const FundDashboard = () => <div style={{ color: 'white', padding: '2rem' }}>Dashboard Fundación - Próximamente</div>;
const FundMascotas = () => <div style={{ color: 'white', padding: '2rem' }}>Mis Mascotas - Próximamente</div>;
const FundMascotaNueva = () => <div style={{ color: 'white', padding: '2rem' }}>Registrar Mascota - Próximamente</div>;
const FundRescates = () => <div style={{ color: 'white', padding: '2rem' }}>Rescates - Próximamente</div>;
const FundAdopciones = () => <div style={{ color: 'white', padding: '2rem' }}>Adopciones - Próximamente</div>;
const FundDonaciones = () => <div style={{ color: 'white', padding: '2rem' }}>Donaciones - Próximamente</div>;
const FundEventos = () => <div style={{ color: 'white', padding: '2rem' }}>Eventos - Próximamente</div>;
const FundVoluntarios = () => <div style={{ color: 'white', padding: '2rem' }}>Voluntarios - Próximamente</div>;
const FundReportes = () => <div style={{ color: 'white', padding: '2rem' }}>Reportes - Próximamente</div>;

// =============================================================
// COMPONENTE 404 MEJORADO
// =============================================================
const NotFound = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, getDashboardPath } = useAuth();

  const goBack = () => {
    navigate(-1);
  };

  const goHome = () => {
    if (isAuthenticated) {
      // Si es admin, veterinaria o fundacion, va a su dashboard
      if (user?.tipo === 'admin' || user?.tipo === 'veterinaria' || user?.tipo === 'fundacion') {
        navigate(getDashboardPath());
      } else {
        // Si es usuario normal, va al home público
        navigate('/');
      }
    } else {
      // Si no está autenticado, va al home público
      navigate('/');
    }
  };

  // Determinar el texto del botón según el rol
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
      <h1 style={{ fontSize: '6rem', margin: 0, fontWeight: 'bold' }}>404</h1>
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Página no encontrada</h2>
      <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.7)', maxWidth: '500px', margin: '0 auto' }}>
        Lo sentimos, la página que buscas no existe o ha sido movida.
      </p>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button 
          onClick={goBack}
          style={{ 
            padding: '12px 30px',
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '50px',
            cursor: 'pointer',
            transition: 'all 0.3s',
            fontSize: '0.95rem',
            fontWeight: '500'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
        >
          ← Volver atrás
        </button>
        <button 
          onClick={goHome}
          style={{ 
            padding: '12px 30px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            cursor: 'pointer',
            transition: 'all 0.3s',
            fontSize: '0.95rem',
            fontWeight: '500',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
          }}
        >
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
  // RUTAS PÚBLICAS (cualquiera puede ver)
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
      { path: 'veterinarias', element: <Veterinarias /> },
      { path: 'mascota/:id', element: <MascotaDetalle /> },
      { path: 'solicitar-adopcion/:id', element: <SolicitarAdopcion /> },
      { path: 'adopcion-exitosa/:id', element: <SolicitudExitosa /> },
      { path: 'eventos', element: <Eventos /> },
      { path: 'tienda', element: <Tienda /> },
      { path: 'rescates/reportar', element: <ReportarRescate /> },
      { path: 'donaciones', element: <Donaciones /> },
    ]
  },

  // RUTAS DE USUARIO (requieren login)
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

  // RUTAS DE VETERINARIA (requieren login + rol veterinaria)
  {
    path: '/veterinaria',
    element: <VeterinariaRoute />,
    children: [
      {
        element: <VeterinariaLayout />,
        children: [
          { index: true, element: <Navigate to="/veterinaria/dashboard" replace /> },
          { path: 'dashboard', element: <VetDashboard /> },
          { path: 'atenciones', element: <VetAtenciones /> },
          { path: 'historiales', element: <VetHistoriales /> },
          { path: 'citas', element: <VetCitas /> },
          { path: 'mascotas', element: <VetMascotas /> },
          { path: 'vacunas', element: <VetVacunas /> },
          { path: 'productos', element: <VetProductos /> },
          { path: 'pedidos', element: <VetPedidos /> },
          { path: 'reportes', element: <VetReportes /> },
          { path: 'perfil', element: <div>Mi Perfil</div> },
        ]
      }
    ]
  },

  // RUTAS DE FUNDACIÓN (requieren login + rol fundacion)
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
          { path: 'mascotas/nueva', element: <FundMascotaNueva /> },
          { path: 'rescates', element: <FundRescates /> },
          { path: 'adopciones', element: <FundAdopciones /> },
          { path: 'donaciones', element: <FundDonaciones /> },
          { path: 'eventos', element: <FundEventos /> },
          { path: 'voluntarios', element: <FundVoluntarios /> },
          { path: 'reportes', element: <FundReportes /> },
          { path: 'perfil', element: <div>Mi Perfil</div> },
        ]
      }
    ]
  },

  // RUTAS DE ADMIN (requieren login + rol admin)
  {
    path: '/admin',
    element: <AdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="/admin/dashboard" replace /> },
          { path: 'dashboard', element: <Dashboard /> },
          
          // ===== USUARIOS =====
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
          
          // Las demás rutas admin
          { path: 'mascotas', element: <AdminMascotas /> },
          { path: 'mascotas/nueva', element: <AdminMascotasNueva /> },
          { path: 'adopciones', element: <AdminAdopciones /> },
          { path: 'donaciones', element: <AdminDonaciones /> },
          { path: 'eventos', element: <AdminEventos /> },
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

  // RUTA 404
  { path: '*', element: <NotFound /> }
]);

export default router;