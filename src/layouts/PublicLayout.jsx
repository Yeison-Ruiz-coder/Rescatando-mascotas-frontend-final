import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicNavbar from '../components/layout/Navbar/PublicNavbar';
import PublicSidebar from '../components/layout/Sidebar/PublicSidebar';
import Footer from '../components/layout/Footer/Footer';
import { useSidebar } from '../contexts/SidebarContext';
import './Layouts.css';

const PublicLayout = () => {
  const { isPublicSidebarOpen } = useSidebar();

  return (
    <div className="app-layout">
      <PublicNavbar />
      <PublicSidebar />
      {isPublicSidebarOpen && <div className="sidebar-overlay" onClick={() => {}} />}
      <main className={`main-content ${isPublicSidebarOpen ? 'shifted' : ''}`}>
        <div className="container">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;