// src/layouts/VeterinariaLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicNavbar from '../components/layout/Navbar/PublicNavbar';
import VeterinariaSidebar from '../components/layout/Sidebar/VeterinariaSidebar';
import Footer from '../components/layout/Footer/Footer';
import { useSidebar } from '../contexts/SidebarContext';
import ScrollToTop from '../components/common/ScrollToTop/ScrollToTop'; // 👈 Importar
import './Layouts.css';

const VeterinariaLayout = () => {
  const { isPublicSidebarOpen } = useSidebar();

  return (
    <div className="app-layout">
      <ScrollToTop /> {/* 👈 Agregar AQUÍ */}
      <PublicNavbar />
      <VeterinariaSidebar />
      {isPublicSidebarOpen && <div className="sidebar-overlay" />}
      <main className={`main-content ${isPublicSidebarOpen ? 'shifted' : ''}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default VeterinariaLayout;