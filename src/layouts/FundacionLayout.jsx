// src/layouts/FundacionLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicNavbar from '../components/layout/Navbar/PublicNavbar';
import FundacionSidebar from '../components/layout/Sidebar/FundacionSidebar';
import Footer from '../components/layout/Footer/Footer';
import PawBackground from '../components/common/PawBackground/PawBackground';
import { useSidebar } from '../contexts/SidebarContext';
import './Layouts.css';

const FundacionLayout = () => {
  const { isPublicSidebarOpen } = useSidebar();

  return (
    <div className="app-layout">
      <PawBackground />
      <PublicNavbar />
      <FundacionSidebar />
      {isPublicSidebarOpen && <div className="sidebar-overlay" />}
      <main className={`main-content ${isPublicSidebarOpen ? 'shifted' : ''}`}>
        {/* 🔥 ELIMINADO: El container que limitaba el contenido */}
        {/* <div className="container"> */}
        <Outlet />
        {/* </div> */}
      </main>
      <Footer />
    </div>
  );
};

export default FundacionLayout;