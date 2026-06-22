// src/components/layout/Sidebar/VeterinariaSidebar.jsx
import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import { useSidebar } from '../../../contexts/SidebarContext';
import useSidebarCloser from '../../../hooks/useSidebarCloser';
import './Sidebar.css';

// ✅ Submenu component optimizado
const SubmenuItem = memo(({ to, icon, label, badge, isActive, onClick, badgeType }) => (
  <Link 
    to={to} 
    className={`submenu-item ${isActive ? 'active' : ''}`} 
    onClick={onClick}
  >
    <i className={icon}></i> 
    {label}
    {badge && (
      <span className={`sidebar-badge ${badgeType || ''}`}>{badge}</span>
    )}
  </Link>
));

SubmenuItem.displayName = 'SubmenuItem';

const VeterinariaSidebar = () => {
  const { t } = useTranslation('layout');
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isPublicSidebarOpen, closePublicSidebar } = useSidebar();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  const sidebarRef = useRef(null);
  // ✅ Sin delay para apertura inmediata
  useSidebarCloser(sidebarRef, isPublicSidebarOpen, closePublicSidebar, 0);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [openSections, setOpenSections] = useState({
    rescates: true,
    atenciones: false,
    mascotas: false
  });

  const [showBadges, setShowBadges] = useState(false);

  useEffect(() => {
    if (isPublicSidebarOpen) {
      const timer = setTimeout(() => setShowBadges(true), 200);
      return () => clearTimeout(timer);
    } else {
      setShowBadges(false);
    }
  }, [isPublicSidebarOpen]);

  const toggleSection = useCallback((section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  const isActive = useCallback((path) => location.pathname.startsWith(path), [location.pathname]);

  const handleLogout = useCallback(() => {
    logout();
    closePublicSidebar();
  }, [logout, closePublicSidebar]);

  const handleLinkClick = useCallback(() => {
    if (isMobile) {
      closePublicSidebar();
    }
  }, [isMobile, closePublicSidebar]);

  return (
    <aside ref={sidebarRef} className={`sidebar vet-sidebar ${isPublicSidebarOpen ? 'open' : ''}`}>
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
          <Link 
            to="/veterinaria/dashboard" 
            className={`sidebar-item ${isActive('/veterinaria/dashboard') ? 'active' : ''}`} 
            onClick={handleLinkClick}
          >
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
            {showBadges && <span className="sidebar-badge urgent">{t("urgentes")}</span>}
            <i className={`fas fa-chevron-right arrow ${openSections.rescates ? 'open' : ''}`}></i>
          </div>
          <div className={`submenu ${openSections.rescates ? 'open' : ''}`}>
            <SubmenuItem
              to="/veterinaria/rescates/disponibles"
              icon="fas fa-map-marker-alt"
              label={t("rescates_cerca")}
              isActive={isActive('/veterinaria/rescates/disponibles')}
              onClick={handleLinkClick}
            />
            <SubmenuItem
              to="/veterinaria/rescates/mis-rescates"
              icon="fas fa-clipboard-list"
              label={t("mis_rescates")}
              isActive={isActive('/veterinaria/rescates/mis-rescates')}
              onClick={handleLinkClick}
            />
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
            <SubmenuItem
              to="/veterinaria/atenciones"
              icon="fas fa-list"
              label={t("historial_atenciones")}
              isActive={isActive('/veterinaria/atenciones') && !isActive('/veterinaria/atenciones/nueva')}
              onClick={handleLinkClick}
            />
            <SubmenuItem
              to="/veterinaria/atenciones/nueva"
              icon="fas fa-plus-circle"
              label={t("nueva_atencion")}
              isActive={isActive('/veterinaria/atenciones/nueva')}
              onClick={handleLinkClick}
            />
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
            <SubmenuItem
              to="/veterinaria/mascotas"
              icon="fas fa-list"
              label={t("mascotas_atendidas")}
              isActive={isActive('/veterinaria/mascotas')}
              onClick={handleLinkClick}
            />
            <SubmenuItem
              to="/veterinaria/vacunas"
              icon="fas fa-syringe"
              label={t("control_vacunas")}
              isActive={isActive('/veterinaria/vacunas')}
              onClick={handleLinkClick}
            />
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default memo(VeterinariaSidebar);