// src/components/layout/Sidebar/FundacionSidebar.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import { useSidebar } from '../../../contexts/SidebarContext';
import './Sidebar.css';

const FundacionSidebar = () => {
  const { t } = useTranslation('layout');
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isPublicSidebarOpen, closePublicSidebar } = useSidebar();
  
  const [openSections, setOpenSections] = useState({
    rescates: true,
    mascotas: false,
    adopciones: false,
    eventos: false
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
    <aside className={`sidebar fundacion-sidebar ${isPublicSidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-header fundacion-header">
        <div className="sidebar-user">
          <div className="sidebar-avatar fundacion-avatar">
            <i className="fas fa-building"></i>
          </div>
          <div className="sidebar-user-info">
            <h5>{user?.nombre || t("fundacion")}</h5>
            <span className="sidebar-user-role">{t("fundacion")}</span>
          </div>
        </div>
        <button className="sidebar-close" onClick={closePublicSidebar}>
          <i className="fas fa-times"></i>
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section">
          <Link to="/fundacion/dashboard" className={`sidebar-item ${isActive('/fundacion/dashboard') ? 'active' : ''}`} onClick={closePublicSidebar}>
            <i className="fas fa-tachometer-alt"></i>
            <span>{t("dashboard")}</span>
          </Link>
        </div>

        <div className="sidebar-section">
          <div 
            className={`sidebar-item has-submenu rescue-highlight ${isActive('/fundacion/rescates') ? 'active' : ''}`}
            onClick={() => toggleSection('rescates')}
          >
            <i className="fas fa-ambulance"></i>
            <span>{t("rescates")}</span>
            <span className="sidebar-badge urgent">{t("nuevos")}</span>
            <i className={`fas fa-chevron-right arrow ${openSections.rescates ? 'open' : ''}`}></i>
          </div>
          <div className={`submenu ${openSections.rescates ? 'open' : ''}`}>
            <Link to="/fundacion/rescates/disponibles" className={`submenu-item ${isActive('/fundacion/rescates/disponibles') ? 'active' : ''}`} onClick={closePublicSidebar}>
              <i className="fas fa-map-marker-alt"></i> {t("rescates_cerca")}
            </Link>
            <Link to="/fundacion/rescates/mis-rescates" className={`submenu-item ${isActive('/fundacion/rescates/mis-rescates') ? 'active' : ''}`} onClick={closePublicSidebar}>
              <i className="fas fa-clipboard-list"></i> {t("mis_rescates")}
            </Link>
          </div>
        </div>

        <div className="sidebar-section">
          <div 
            className={`sidebar-item has-submenu ${isActive('/fundacion/mascotas') ? 'active' : ''}`}
            onClick={() => toggleSection('mascotas')}
          >
            <i className="fas fa-paw"></i>
            <span>{t("mascotas")}</span>
            <i className={`fas fa-chevron-right arrow ${openSections.mascotas ? 'open' : ''}`}></i>
          </div>
          <div className={`submenu ${openSections.mascotas ? 'open' : ''}`}>
            <Link to="/fundacion/mascotas" className={`submenu-item ${isActive('/fundacion/mascotas') && !isActive('/fundacion/mascotas/nueva') ? 'active' : ''}`} onClick={closePublicSidebar}>
              <i className="fas fa-list"></i> {t("mis_mascotas")}
              <span className="sidebar-badge">12</span>
            </Link>
            <Link to="/fundacion/mascotas/nueva" className={`submenu-item ${isActive('/fundacion/mascotas/nueva') ? 'active' : ''}`} onClick={closePublicSidebar}>
              <i className="fas fa-plus-circle"></i> {t("registrar_mascota")}
            </Link>
          </div>
        </div>

        <div className="sidebar-section">
          <div 
            className={`sidebar-item has-submenu ${isActive('/fundacion/adopciones') ? 'active' : ''}`}
            onClick={() => toggleSection('adopciones')}
          >
            <i className="fas fa-heart"></i>
            <span>{t("adopciones")}</span>
            <i className={`fas fa-chevron-right arrow ${openSections.adopciones ? 'open' : ''}`}></i>
          </div>
          <div className={`submenu ${openSections.adopciones ? 'open' : ''}`}>
            <Link to="/fundacion/solicitudes" className={`submenu-item ${isActive('/fundacion/solicitudes') ? 'active' : ''}`} onClick={closePublicSidebar}>
              <i className="fas fa-clipboard-list"></i> {t("solicitudes_recibidas")}
              <span className="sidebar-badge urgent">5</span>
            </Link>
            <Link to="/fundacion/adopciones/aprobadas" className={`submenu-item ${isActive('/fundacion/adopciones/aprobadas') ? 'active' : ''}`} onClick={closePublicSidebar}>
              <i className="fas fa-check-circle"></i> {t("adopciones_aprobadas")}
            </Link>
            <Link to="/fundacion/seguimientos" className={`submenu-item ${isActive('/fundacion/seguimientos') ? 'active' : ''}`} onClick={closePublicSidebar}>
              <i className="fas fa-chart-line"></i> {t("seguimiento_post")}
            </Link>
          </div>
        </div>

        <div className="sidebar-section">
          <div 
            className={`sidebar-item has-submenu ${isActive('/fundacion/eventos') ? 'active' : ''}`}
            onClick={() => toggleSection('eventos')}
          >
            <i className="fas fa-calendar-alt"></i>
            <span>{t("eventos")}</span>
            <i className={`fas fa-chevron-right arrow ${openSections.eventos ? 'open' : ''}`}></i>
          </div>
          <div className={`submenu ${openSections.eventos ? 'open' : ''}`}>
            <Link to="/fundacion/eventos" className={`submenu-item ${isActive('/fundacion/eventos') && !isActive('/fundacion/eventos/crear') ? 'active' : ''}`} onClick={closePublicSidebar}>
              <i className="fas fa-list"></i> {t("mis_eventos")}
            </Link>
            <Link to="/fundacion/eventos/crear" className={`submenu-item ${isActive('/fundacion/eventos/crear') ? 'active' : ''}`} onClick={closePublicSidebar}>
              <i className="fas fa-plus-circle"></i> {t("crear_evento")}
            </Link>
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default FundacionSidebar;