// src/layouts/PublicLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicNavbar from '../components/layout/Navbar/PublicNavbar';
import PublicSidebar from '../components/layout/Sidebar/PublicSidebar';
import Footer from '../components/layout/Footer/Footer';
import { useSidebar } from '../contexts/SidebarContext';
import PawBackground from '../components/common/PawBackground/PawBackground';
import ScrollToTop from '../components/common/ScrollToTop/ScrollToTop'; // 👈 Importar
import './Layouts.css';

const PublicLayout = () => {
  const { isPublicSidebarOpen } = useSidebar();

  return (
    <div className="app-layout">
      <ScrollToTop /> {/* 👈 Agregar AQUÍ */}
      <PawBackground />
      <PublicNavbar />
      <PublicSidebar />
      {isPublicSidebarOpen && <div className="sidebar-overlay" onClick={() => {}} />}
      <main className={`main-content ${isPublicSidebarOpen ? 'shifted' : ''}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;