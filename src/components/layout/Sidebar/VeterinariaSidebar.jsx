// src/components/layout/Sidebar/VeterinariaSidebar.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import { useSidebar } from '../../../contexts/SidebarContext';
import './Sidebar.css';

const VeterinariaSidebar = () => {
  const { t } = useTranslation('layout');
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isPublicSidebarOpen, closePublicSidebar } = useSidebar();
  
  const [openSections, setOpenSections] = useState({
    rescates: true,
    atenciones: false,
    mascotas: false
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isActive = (path) => location.pathname.startsWith(path);

  const handleLogout = () => {
    logout();
    closePublicSidebar();
  };

  return (
    <aside className={`sidebar vet-sidebar ${isPublicSidebarOpen ? 'open' : ''}`}>
      {/* Header */}
      <div className="sidebar-header vet-header">
        <div className="sidebar-user">
          <div className="sidebar-avatar vet-avatar">
            <i className="fas fa-clinic-medical"></i>
          </div>
          <div className="sidebar-user-info">
            <h5>{user?.nombre || 'Veterinaria'}</h5>
            <span className="sidebar-user-role">Clínica Veterinaria</span>
          </div>
        </div>
        <button className="sidebar-close" onClick={closePublicSidebar}>
          <i className="fas fa-times"></i>
        </button>
      </div>

      <nav className="sidebar-nav">
        {/* Dashboard */}
        <div className="sidebar-section">
          <Link to="/veterinaria/dashboard" className={`sidebar-item ${isActive('/veterinaria/dashboard') ? 'active' : ''}`} onClick={closePublicSidebar}>
            <i className="fas fa-tachometer-alt"></i>
            <span>Dashboard</span>
          </Link>
        </div>

        {/* RESCATES - Prioridad alta para veterinarias */}
        <div className="sidebar-section">
          <div 
            className={`sidebar-item has-submenu rescue-highlight ${isActive('/veterinaria/rescates') ? 'active' : ''}`}
            onClick={() => toggleSection('rescates')}
          >
            <i className="fas fa-ambulance"></i>
            <span>Rescates</span>
            <span className="sidebar-badge urgent">Urgentes</span>
            <i className={`fas fa-chevron-right arrow ${openSections.rescates ? 'open' : ''}`}></i>
          </div>
          <div className={`submenu ${openSections.rescates ? 'open' : ''}`}>
            <Link to="/veterinaria/rescates/disponibles" className={`submenu-item ${isActive('/veterinaria/rescates/disponibles') ? 'active' : ''}`} onClick={closePublicSidebar}>
              <i className="fas fa-map-marker-alt"></i> Rescates cerca de mí
            </Link>
            <Link to="/veterinaria/rescates/mis-rescates" className={`submenu-item ${isActive('/veterinaria/rescates/mis-rescates') ? 'active' : ''}`} onClick={closePublicSidebar}>
              <i className="fas fa-clipboard-list"></i> Mis rescates asignados
            </Link>
          </div>
        </div>

        {/* ATENCIONES MÉDICAS */}
        <div className="sidebar-section">
          <div 
            className={`sidebar-item has-submenu ${isActive('/veterinaria/atenciones') ? 'active' : ''}`}
            onClick={() => toggleSection('atenciones')}
          >
            <i className="fas fa-stethoscope"></i>
            <span>Atenciones médicas</span>
            <i className={`fas fa-chevron-right arrow ${openSections.atenciones ? 'open' : ''}`}></i>
          </div>
          <div className={`submenu ${openSections.atenciones ? 'open' : ''}`}>
            <Link to="/veterinaria/atenciones" className={`submenu-item ${isActive('/veterinaria/atenciones') && !isActive('/veterinaria/atenciones/nueva') ? 'active' : ''}`} onClick={closePublicSidebar}>
              <i className="fas fa-list"></i> Historial de atenciones
            </Link>
            <Link to="/veterinaria/atenciones/nueva" className={`submenu-item ${isActive('/veterinaria/atenciones/nueva') ? 'active' : ''}`} onClick={closePublicSidebar}>
              <i className="fas fa-plus-circle"></i> Nueva atención
            </Link>
          </div>
        </div>

        {/* MASCOTAS */}
        <div className="sidebar-section">
          <div 
            className={`sidebar-item has-submenu ${isActive('/veterinaria/mascotas') ? 'active' : ''}`}
            onClick={() => toggleSection('mascotas')}
          >
            <i className="fas fa-paw"></i>
            <span>Mascotas</span>
            <i className={`fas fa-chevron-right arrow ${openSections.mascotas ? 'open' : ''}`}></i>
          </div>
          <div className={`submenu ${openSections.mascotas ? 'open' : ''}`}>
            <Link to="/veterinaria/mascotas" className={`submenu-item ${isActive('/veterinaria/mascotas') ? 'active' : ''}`} onClick={closePublicSidebar}>
              <i className="fas fa-list"></i> Mascotas atendidas
            </Link>
            <Link to="/veterinaria/vacunas" className={`submenu-item ${isActive('/veterinaria/vacunas') ? 'active' : ''}`} onClick={closePublicSidebar}>
              <i className="fas fa-syringe"></i> Control de vacunas
            </Link>
          </div>
        </div>
      </nav>

    </aside>
  );
};

export default VeterinariaSidebar;