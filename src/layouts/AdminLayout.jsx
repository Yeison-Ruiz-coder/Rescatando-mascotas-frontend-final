// src/layouts/AdminLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminNavbar from '../components/layout/Navbar/AdminNavbar';
import AdminSidebar from '../components/layout/Sidebar/AdminSidebar';
import { useSidebar } from '../contexts/SidebarContext';
import ScrollToTop from '../components/common/ScrollToTop/ScrollToTop'; // 👈 Importar
import Footer from '../components/layout/Footer/Footer';
import './Layouts.css';
import './AdminLayout.css';

const AdminLayout = () => {
  const { isAdminSidebarOpen } = useSidebar();

  return (
    <div className="app-layout admin-layout">
      <ScrollToTop /> {/* 👈 Agregar AQUÍ */}
      <AdminNavbar />
      <AdminSidebar />
      {isAdminSidebarOpen && <div className="sidebar-overlay" />}
      <main className={`admin-main-content ${isAdminSidebarOpen ? 'shifted' : ''}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default AdminLayout;