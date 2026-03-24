import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicNavbar from '../components/layout/Navbar/PublicNavbar';
import FundacionSidebar from '../components/layout/Sidebar/FundacionSidebar';
import Footer from '../components/layout/Footer/Footer';
import { useSidebar } from '../contexts/SidebarContext';
import './Layouts.css';

const FundacionLayout = () => {
  const { isPublicSidebarOpen } = useSidebar();

  return (
    <div className="app-layout">
      <PublicNavbar />
      <FundacionSidebar />
      {isPublicSidebarOpen && <div className="sidebar-overlay" />}
      <main className={`main-content ${isPublicSidebarOpen ? 'shifted' : ''}`}>
        <div className="container">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FundacionLayout;