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
      <div className="sidebar-header vet-header">
        <div className="sidebar-user">
          <div className="sidebar-avatar vet-avatar">
            <i className="fas fa-clinic-medical"></i>
          </div>
          <div className="sidebar-user-info">
            <h5>{user?.nombre || t("veterinaria")}</h5>
            <span className="sidebar-user-role">{t("veterinaria")}</span>
          </div>
        </div>
        <button className="sidebar-close" onClick={closePublicSidebar}>
          <i className="fas fa-times"></i>
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section">
          <Link to="/veterinaria/dashboard" className={`sidebar-item ${isActive('/veterinaria/dashboard') ? 'active' : ''}`} onClick={closePublicSidebar}>
            <i className="fas fa-tachometer-alt"></i>
            <span>{t("dashboard")}</span>
          </Link>
        </div>

        <div className="sidebar-section">
          <div 
            className={`sidebar-item has-submenu rescue-highlight ${isActive('/veterinaria/rescates') ? 'active' : ''}`}
            onClick={() => toggleSection('rescates')}
          >
            <i className="fas fa-ambulance"></i>
            <span>{t("rescates")}</span>
            <span className="sidebar-badge urgent">{t("urgentes")}</span>
            <i className={`fas fa-chevron-right arrow ${openSections.rescates ? 'open' : ''}`}></i>
          </div>
          <div className={`submenu ${openSections.rescates ? 'open' : ''}`}>
            <Link to="/veterinaria/rescates/disponibles" className={`submenu-item ${isActive('/veterinaria/rescates/disponibles') ? 'active' : ''}`} onClick={closePublicSidebar}>
              <i className="fas fa-map-marker-alt"></i> {t("rescates_cerca")}
            </Link>
            <Link to="/veterinaria/rescates/mis-rescates" className={`submenu-item ${isActive('/veterinaria/rescates/mis-rescates') ? 'active' : ''}`} onClick={closePublicSidebar}>
              <i className="fas fa-clipboard-list"></i> {t("mis_rescates")}
            </Link>
          </div>
        </div>

        <div className="sidebar-section">
          <div 
            className={`sidebar-item has-submenu ${isActive('/veterinaria/atenciones') ? 'active' : ''}`}
            onClick={() => toggleSection('atenciones')}
          >
            <i className="fas fa-stethoscope"></i>
            <span>{t("atenciones_medicas")}</span>
            <i className={`fas fa-chevron-right arrow ${openSections.atenciones ? 'open' : ''}`}></i>
          </div>
          <div className={`submenu ${openSections.atenciones ? 'open' : ''}`}>
            <Link to="/veterinaria/atenciones" className={`submenu-item ${isActive('/veterinaria/atenciones') && !isActive('/veterinaria/atenciones/nueva') ? 'active' : ''}`} onClick={closePublicSidebar}>
              <i className="fas fa-list"></i> {t("historial_atenciones")}
            </Link>
            <Link to="/veterinaria/atenciones/nueva" className={`submenu-item ${isActive('/veterinaria/atenciones/nueva') ? 'active' : ''}`} onClick={closePublicSidebar}>
              <i className="fas fa-plus-circle"></i> {t("nueva_atencion")}
            </Link>
          </div>
        </div>

        <div className="sidebar-section">
          <div 
            className={`sidebar-item has-submenu ${isActive('/veterinaria/mascotas') ? 'active' : ''}`}
            onClick={() => toggleSection('mascotas')}
          >
            <i className="fas fa-paw"></i>
            <span>{t("mascotas")}</span>
            <i className={`fas fa-chevron-right arrow ${openSections.mascotas ? 'open' : ''}`}></i>
          </div>
          <div className={`submenu ${openSections.mascotas ? 'open' : ''}`}>
            <Link to="/veterinaria/mascotas" className={`submenu-item ${isActive('/veterinaria/mascotas') ? 'active' : ''}`} onClick={closePublicSidebar}>
              <i className="fas fa-list"></i> {t("mascotas_atendidas")}
            </Link>
            <Link to="/veterinaria/vacunas" className={`submenu-item ${isActive('/veterinaria/vacunas') ? 'active' : ''}`} onClick={closePublicSidebar}>
              <i className="fas fa-syringe"></i> {t("control_vacunas")}
            </Link>
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default VeterinariaSidebar;