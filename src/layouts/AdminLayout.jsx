// src/layouts/AdminLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminNavbar from '../components/layout/Navbar/AdminNavbar';
import AdminSidebar from '../components/layout/Sidebar/AdminSidebar';
import { useSidebar } from '../contexts/SidebarContext';
import './Layouts.css';
import './AdminLayout.css'; // 🔥 IMPORTANTE: Agregar esta línea

const AdminLayout = () => {
  const { isAdminSidebarOpen } = useSidebar();

  return (
    <div className="app-layout admin-layout">
      <AdminNavbar />
      <AdminSidebar />
      {isAdminSidebarOpen && <div className="sidebar-overlay" />}
      <main className={`admin-main-content ${isAdminSidebarOpen ? 'shifted' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;