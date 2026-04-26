// src/routes/index.js
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

// ================= PUBLIC =================
import Home from '../pages/public/Home/Home';
import Login from '../pages/public/Login/Login';
import Register from '../pages/public/Register/Register';
import Mascotas from '../pages/public/Mascotas/Mascotas';
import MascotaDetalle from '../pages/public/MascotaDetalle/MascotaDetalle';
import Donaciones from '../pages/public/Donaciones/Donaciones';
import Tienda from '../pages/public/Tienda/Tienda';
import SolicitarAdopcion from '../pages/public/SolicitarAdopcion/SolicitarAdopcion';
import SolicitudExitosa from '../pages/public/SolicitarAdopcion/SolicitudExitosa';
import Veterinarias from '../pages/public/Veterinarias/Veterinarias';
import VeterinariaDetalle from '../pages/public/Veterinarias/VeterinariaDetalle';
import ReportarRescate from '../pages/public/ReportarRescate/ReportarRescate';
import FundacionesIndex from '../pages/public/Fundaciones/FundacionesIndex';
import FundacionDetalle from '../pages/public/Fundaciones/FundacionDetalle';

// Eventos público
import PublicEventosIndex from '../pages/public/eventos/EventosIndex';
import PublicEventosShow from '../pages/public/eventos/EventosShow';

// SUSCRIPCIONES PÚBLICAS (NUEVO)
import SuscripcionesPublicIndex from '../pages/public/suscripciones/SuscripcionesPublicIndex';

// ================= USER =================
import Solicitudes from '../pages/user/Solicitudes/Solicitudes';
import UserSuscripciones from '../pages/user/MisSuscripciones'; // NUEVO

// ================= ADMIN =================
import Dashboard from '../pages/admin/Dashboard/Dashboard';
import UsuariosPendientes from '../pages/admin/Usuarios/UsuariosPendientes';

// Eventos admin
import AdminEventosIndex from '../pages/admin/eventos/EventosIndex';
import AdminEventosCreate from '../pages/admin/eventos/EventosCreate';
import AdminEventosEdit from '../pages/admin/eventos/EventosEdit';
import AdminEventosShow from '../pages/admin/eventos/EventosShow';

// SUSCRIPCIONES ADMIN
import AdminSuscripcionesIndex from '../pages/admin/suscripciones/SuscripcionesIndex';
import AdminSuscripcionesCreate from '../pages/admin/suscripciones/SuscripcionesCreate';
import AdminSuscripcionesEdit from '../pages/admin/suscripciones/SuscripcionesEdit';
import AdminSuscripcionesShow from '../pages/admin/suscripciones/SuscripcionesShow';

// ================= FUNDACIÓN =================
import FundDashboard from '../pages/fundacion/dashboard/Dashboard';
import FundMascotas from '../pages/fundacion/mascotas/Mascotas';
import FundNuevaMascota from '../pages/fundacion/mascotas/NuevaMascota';
import MascotaDetalleFundacion from "../pages/fundacion/mascotas/MascotaDetalle";

import EventosIndex from '../pages/fundacion/eventos/EventosIndex';
import EventosCreate from '../pages/fundacion/eventos/EventosCreate';
import EventosShow from '../pages/fundacion/eventos/EventosShow';
import EventosEdit from '../pages/fundacion/eventos/EventosEdit';

// SUSCRIPCIONES FUNDACIÓN
import SuscripcionesIndex from '../pages/fundacion/suscripciones/SuscripcionesIndex';
import SuscripcionesCreate from '../pages/fundacion/suscripciones/SuscripcionesCreate';
import SuscripcionesEdit from '../pages/fundacion/suscripciones/SuscripcionesEdit';
import SuscripcionesShow from '../pages/fundacion/suscripciones/SuscripcionesShow';

// ================= VETERINARIA =================
import DashboardVeterinaria from '../pages/veterinaria/dashboard/DashboardVeterinaria';

// SUSCRIPCIONES VETERINARIA (NUEVO)
import VeterinariaSuscripcionesIndex from '../pages/veterinaria/suscripciones/SuscripcionesIndex';
import VeterinariaSuscripcionesShow from '../pages/veterinaria/suscripciones/SuscripcionesShow';

// =============================================================
// PLACEHOLDERS
// =============================================================
const PagePlaceholder = ({ title }) => (
  <div style={{ padding: '2rem' }}>
    <h1>{title}</h1>
  </div>
);

// =============================================================
// 404
// =============================================================
const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', padding: '5rem' }}>
      <h1>404 - Página no encontrada</h1>
      <button onClick={() => navigate('/')}>Volver al inicio</button>
    </div>
  );
};

// =============================================================
// ROUTER
// =============================================================
const router = createBrowserRouter([
  // ================= PUBLIC =================
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'mascotas', element: <Mascotas /> },
      { path: 'mascota/:id', element: <MascotaDetalle /> },
      { path: 'fundaciones', element: <FundacionesIndex /> },
      { path: 'fundaciones/:id', element: <FundacionDetalle /> },
      { path: 'veterinarias', element: <Veterinarias /> },
      { path: 'veterinarias/:id', element: <VeterinariaDetalle /> },
      { path: 'eventos', element: <PublicEventosIndex /> },
      { path: 'eventos/:id', element: <PublicEventosShow /> },
      { path: 'tienda', element: <Tienda /> },
      { path: 'donaciones', element: <Donaciones /> },
      { path: 'rescates/reportar', element: <ReportarRescate /> },
      
      // ✅ NUEVAS RUTAS PÚBLICAS DE SUSCRIPCIONES
      { path: 'suscripciones', element: <SuscripcionesPublicIndex /> },
      { path: 'apadrinar', element: <SuscripcionesPublicIndex /> },
    ]
  },

  // ================= USER (Apadrinadores/Donantes) =================
  {
    path: '/user',
    element: <PrivateRoute />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          { index: true, element: <Navigate to="/user/dashboard" /> },
          { path: 'dashboard', element: <PagePlaceholder title="Mi Dashboard" /> },
          { path: 'mis-solicitudes', element: <Solicitudes /> },
          
          // ✅ NUEVO: Mis suscripciones
          { path: 'mis-suscripciones', element: <UserSuscripciones /> },
        ]
      }
    ]
  },

  // ================= FUNDACIÓN =================
  {
    path: '/fundacion',
    element: <FundacionRoute />,
    children: [
      {
        element: <FundacionLayout />,
        children: [
          { index: true, element: <Navigate to="/fundacion/dashboard" /> },
          { path: 'dashboard', element: <FundDashboard /> },
          { path: 'mascotas', element: <FundMascotas /> },
          { path: 'mascotas/nueva', element: <FundNuevaMascota /> },
          { path: 'mascotas/:id', element: <MascotaDetalleFundacion /> },
          
          // SUSCRIPCIONES FUNDACIÓN
          { path: 'suscripciones', element: <SuscripcionesIndex /> },
          { path: 'suscripciones/crear', element: <SuscripcionesCreate /> },
          { path: 'suscripciones/:id', element: <SuscripcionesShow /> },
          { path: 'suscripciones/:id/editar', element: <SuscripcionesEdit /> },
          
          // EVENTOS FUNDACIÓN
          { path: 'eventos', element: <EventosIndex /> },
          { path: 'eventos/crear', element: <EventosCreate /> },
          { path: 'eventos/:id', element: <EventosShow /> },
          { path: 'eventos/:id/editar', element: <EventosEdit /> },
        ]
      }
    ]
  },

  // ================= ADMIN =================
  {
    path: '/admin',
    element: <AdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="/admin/dashboard" /> },
          { path: 'dashboard', element: <Dashboard /> },
          
          // SUSCRIPCIONES ADMIN
          { path: 'suscripciones', element: <AdminSuscripcionesIndex /> },
          { path: 'suscripciones/crear', element: <AdminSuscripcionesCreate /> },
          { path: 'suscripciones/:id', element: <AdminSuscripcionesShow /> },
          { path: 'suscripciones/:id/editar', element: <AdminSuscripcionesEdit /> },
          
          // EVENTOS ADMIN
          { path: 'eventos', element: <AdminEventosIndex /> },
          { path: 'eventos/crear', element: <AdminEventosCreate /> },
          { path: 'eventos/:id', element: <AdminEventosShow /> },
          { path: 'eventos/:id/editar', element: <AdminEventosEdit /> },
          
          { path: 'usuarios/pendientes', element: <UsuariosPendientes /> },
        ]
      }
    ]
  },

  // ================= VETERINARIA =================
  {
    path: '/veterinaria',
    element: <VeterinariaRoute />,
    children: [
      {
        element: <VeterinariaLayout />,
        children: [
          { index: true, element: <Navigate to="/veterinaria/dashboard" /> },
          { path: 'dashboard', element: <DashboardVeterinaria /> },
          
          // ✅ NUEVO: SUSCRIPCIONES VETERINARIA
          { path: 'suscripciones', element: <VeterinariaSuscripcionesIndex /> },
          { path: 'suscripciones/:id', element: <VeterinariaSuscripcionesShow /> },
        ]
      }
    ]
  },

  // ================= 404 =================
  { path: '*', element: <NotFound /> }
]);

export default router;