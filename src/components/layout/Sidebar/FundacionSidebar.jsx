// src/components/layout/Sidebar/FundacionSidebar.jsx
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

const FundacionSidebar = () => {
  const { t } = useTranslation('layout');
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isPublicSidebarOpen, closePublicSidebar } = useSidebar();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  const sidebarRef = useRef(null);
  // ✅ Usa el hook SIN delay para apertura inmediata
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
    mascotas: false,
    adopciones: false,
    eventos: false
  });

  const [showBadges, setShowBadges] = useState(false);

  // ✅ Activa badges después de la apertura
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
    <aside ref={sidebarRef} className={`sidebar fundacion-sidebar ${isPublicSidebarOpen ? 'open' : ''}`}>
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
          <Link 
            to="/fundacion/dashboard" 
            className={`sidebar-item ${isActive('/fundacion/dashboard') ? 'active' : ''}`} 
            onClick={handleLinkClick}
          >
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
            {showBadges && <span className="sidebar-badge urgent">{t("nuevos")}</span>}
            <i className={`fas fa-chevron-right arrow ${openSections.rescates ? 'open' : ''}`}></i>
          </div>
          <div className={`submenu ${openSections.rescates ? 'open' : ''}`}>
            <SubmenuItem
              to="/fundacion/rescates/disponibles"
              icon="fas fa-map-marker-alt"
              label={t("rescates_cerca")}
              isActive={isActive('/fundacion/rescates/disponibles')}
              onClick={handleLinkClick}
            />
            <SubmenuItem
              to="/fundacion/rescates/mis-rescates"
              icon="fas fa-clipboard-list"
              label={t("mis_rescates")}
              isActive={isActive('/fundacion/rescates/mis-rescates')}
              onClick={handleLinkClick}
            />
          </div>
        </div>

        <div className="sidebar-section">
          <div
            className={`sidebar-item has-submenu ${isActive('/fundacion/mascotas') ? 'active' : ''}`}
            onClick={() => toggleSection('mascotas')}
          >
            <i className="fas fa-paw"></i>
            <span>{t("mascotas")}</span>
            {showBadges && <span className="sidebar-badge">12</span>}
            <i className={`fas fa-chevron-right arrow ${openSections.mascotas ? 'open' : ''}`}></i>
          </div>
          <div className={`submenu ${openSections.mascotas ? 'open' : ''}`}>
            <SubmenuItem
              to="/fundacion/mascotas"
              icon="fas fa-list"
              label={t("mis_mascotas")}
              isActive={isActive('/fundacion/mascotas') && !isActive('/fundacion/mascotas/nueva')}
              onClick={handleLinkClick}
              badge="12"
            />
            <SubmenuItem
              to="/fundacion/mascotas/nueva"
              icon="fas fa-plus-circle"
              label={t("registrar_mascota")}
              isActive={isActive('/fundacion/mascotas/nueva')}
              onClick={handleLinkClick}
            />
          </div>
        </div>

        <div className="sidebar-section">
          <div
            className={`sidebar-item has-submenu ${isActive('/fundacion/adopciones') ? 'active' : ''}`}
            onClick={() => toggleSection('adopciones')}
          >
            <i className="fas fa-heart"></i>
            <span>{t("adopciones")}</span>
            {showBadges && <span className="sidebar-badge urgent">5</span>}
            <i className={`fas fa-chevron-right arrow ${openSections.adopciones ? 'open' : ''}`}></i>
          </div>
          <div className={`submenu ${openSections.adopciones ? 'open' : ''}`}>
            <SubmenuItem
              to="/fundacion/solicitudes"
              icon="fas fa-clipboard-list"
              label={t("solicitudes_recibidas")}
              isActive={isActive('/fundacion/solicitudes')}
              onClick={handleLinkClick}
              badge="5"
              badgeType="urgent"
            />
            <SubmenuItem
              to="/fundacion/adopciones/aprobadas"
              icon="fas fa-check-circle"
              label={t("adopciones_aprobadas")}
              isActive={isActive('/fundacion/adopciones/aprobadas')}
              onClick={handleLinkClick}
            />
            <SubmenuItem
              to="/fundacion/seguimientos"
              icon="fas fa-chart-line"
              label={t("seguimiento_post")}
              isActive={isActive('/fundacion/seguimientos')}
              onClick={handleLinkClick}
            />
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
            <SubmenuItem
              to="/fundacion/eventos"
              icon="fas fa-list"
              label={t("mis_eventos")}
              isActive={isActive('/fundacion/eventos') && !isActive('/fundacion/eventos/crear')}
              onClick={handleLinkClick}
            />
            <SubmenuItem
              to="/fundacion/eventos/crear"
              icon="fas fa-plus-circle"
              label={t("crear_evento")}
              isActive={isActive('/fundacion/eventos/crear')}
              onClick={handleLinkClick}
            />
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default memo(FundacionSidebar);