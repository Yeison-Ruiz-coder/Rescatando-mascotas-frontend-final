// src/components/layout/Sidebar/AdminSidebar.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import { useSidebar } from '../../../contexts/SidebarContext';
import useSidebarCloser from '../../../hooks/useSidebarCloser';
import { getImageUrl } from '../../../utils/imageUtils';
import './Sidebar.css';

const AdminSidebar = () => {
  const { t } = useTranslation('layout');
  const { user, logout } = useAuth();
  const { isAdminSidebarOpen, closeAdminSidebar } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  const sidebarRef = useRef(null);
  useSidebarCloser(sidebarRef, isAdminSidebarOpen, closeAdminSidebar);

  // ✅ Resize handler optimizado
  useEffect(() => {
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsMobile(window.innerWidth < 992);
      }, 100);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  const [openSections, setOpenSections] = useState({
    rescates: true,
    mascotas: false,
    usuarios: false,
    adopciones: false,
    eventos: false,
    suscripciones: false
  });

  const [pendingCount, setPendingCount] = useState(0);

  // ✅ Fetch pendientes optimizado
  useEffect(() => {
    if (!user || user.tipo !== 'admin') return;

    let cancelled = false;
    const controller = new AbortController();

    const fetchPendingCount = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      try {
        const response = await fetch('/api/admin/usuarios/pendientes/count', {
          signal: controller.signal,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (!cancelled && data.success) {
          setPendingCount(data.count || 0);
        }
      } catch (error) {
        if (!cancelled && error.name !== 'AbortError') {
          console.error('Error fetching pending count:', error);
        }
      }
    };

    fetchPendingCount();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [user]);

  const toggleSection = useCallback((section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  const isActive = useCallback((path) => location.pathname === path || location.pathname.startsWith(path + '/'), [location.pathname]);

  const handleLogout = useCallback(() => {
    logout();
    closeAdminSidebar();
    navigate('/');
  }, [logout, closeAdminSidebar, navigate]);

  const handleLinkClick = useCallback(() => {
    if (isMobile) {
      closeAdminSidebar();
    }
  }, [isMobile, closeAdminSidebar]);

  // ✅ Memoizar avatar
  const getAvatarUrl = useCallback(() => {
    if (!user?.avatar) {
      const defaultName = user?.nombre || 'Admin';
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(defaultName)}&background=667eea&color=fff&bold=true&size=50`;
    }
    return getImageUrl(user.avatar);
  }, [user]);

  const avatarUrl = useMemo(() => getAvatarUrl(), [getAvatarUrl]);

  return (
    <aside 
      ref={sidebarRef} 
      className={`sidebar admin-sidebar ${isAdminSidebarOpen ? 'open' : ''}`}
      style={{
        willChange: 'transform',
        backfaceVisibility: 'hidden',
        contain: 'layout style'
      }}
    >
      <div className="sidebar-header admin-header">
        <div className="sidebar-user">
          <div className="sidebar-avatar admin-avatar">
            <img src={avatarUrl} alt={user?.nombre} loading="lazy" />
          </div>
          <div className="sidebar-user-info">
            <h5>{user?.nombre || t('admin')}</h5>
            <span className="sidebar-user-role">{t('administrador')}</span>
          </div>
        </div>
        <button className="sidebar-close" onClick={closeAdminSidebar}>
          <i className="fas fa-times"></i>
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section">
          <Link to="/admin/dashboard" className={`sidebar-item ${isActive('/admin/dashboard') ? 'active' : ''}`} onClick={handleLinkClick}>
            <i className="fas fa-tachometer-alt"></i>
            <span>{t("dashboard")}</span>
          </Link>
        </div>

        <div className="sidebar-section">
          <div
            className={`sidebar-item has-submenu ${isActive('/admin/rescates') ? 'active' : ''}`}
            onClick={() => toggleSection('rescates')}
          >
            <i className="fas fa-ambulance"></i>
            <span>{t("rescates")}</span>
            <i className={`fas fa-chevron-right arrow ${openSections.rescates ? 'open' : ''}`}></i>
          </div>
          <div className={`submenu ${openSections.rescates ? 'open' : ''}`}>
            <Link to="/admin/rescates" className={`submenu-item ${isActive('/admin/rescates') && !isActive('/admin/rescates/pendientes') ? 'active' : ''}`} onClick={handleLinkClick}>
              <i className="fas fa-list"></i> {t("todos_rescates")}
            </Link>
            <Link to="/admin/rescates/pendientes" className={`submenu-item ${isActive('/admin/rescates/pendientes') ? 'active' : ''}`} onClick={handleLinkClick}>
              <i className="fas fa-clock"></i> {t("pendientes")}
              <span className="sidebar-badge urgent">!</span>
            </Link>
            <Link to="/admin/rescates/mapa" className={`submenu-item ${isActive('/admin/rescates/mapa') ? 'active' : ''}`} onClick={handleLinkClick}>
              <i className="fas fa-map-marker-alt"></i> {t("mapa_rescates")}
            </Link>
          </div>
        </div>

        <div className="sidebar-section">
          <div
            className={`sidebar-item has-submenu ${isActive('/admin/mascotas') ? 'active' : ''}`}
            onClick={() => toggleSection('mascotas')}
          >
            <i className="fas fa-paw"></i>
            <span>{t("mascotas")}</span>
            <i className={`fas fa-chevron-right arrow ${openSections.mascotas ? 'open' : ''}`}></i>
          </div>
          <div className={`submenu ${openSections.mascotas ? 'open' : ''}`}>
            <Link to="/admin/mascotas" className={`submenu-item ${isActive('/admin/mascotas') && !isActive('/admin/mascotas/nueva') ? 'active' : ''}`} onClick={handleLinkClick}>
              <i className="fas fa-list"></i> {t("todas_mascotas")}
            </Link>
            <Link to="/admin/mascotas/nueva" className={`submenu-item ${isActive('/admin/mascotas/nueva') ? 'active' : ''}`} onClick={handleLinkClick}>
              <i className="fas fa-plus-circle"></i> {t("registrar_mascota")}
            </Link>
            <Link to="/admin/razas" className={`submenu-item ${isActive('/admin/razas') ? 'active' : ''}`} onClick={handleLinkClick}>
              <i className="fas fa-dna"></i> {t("catalogo_razas")}
            </Link>
          </div>
        </div>

        <div className="sidebar-section">
          <div
            className={`sidebar-item has-submenu ${isActive('/admin/usuarios') ? 'active' : ''}`}
            onClick={() => toggleSection('usuarios')}
          >
            <i className="fas fa-users"></i>
            <span>{t("usuarios")}</span>
            <i className={`fas fa-chevron-right arrow ${openSections.usuarios ? 'open' : ''}`}></i>
          </div>
          <div className={`submenu ${openSections.usuarios ? 'open' : ''}`}>
            <Link to="/admin/usuarios" className={`submenu-item ${isActive('/admin/usuarios') && !isActive('/admin/usuarios/pendientes') ? 'active' : ''}`} onClick={handleLinkClick}>
              <i className="fas fa-users"></i> {t("todos_usuarios")}
            </Link>
            <Link to="/admin/usuarios/pendientes" className={`submenu-item ${isActive('/admin/usuarios/pendientes') ? 'active' : ''}`} onClick={handleLinkClick}>
              <i className="fas fa-clock"></i> {t("pendientes_aprobacion")}
              {pendingCount > 0 && (
                <span className="sidebar-badge urgent">{pendingCount}</span>
              )}
            </Link>
            <Link to="/admin/usuarios/fundaciones" className={`submenu-item ${isActive('/admin/usuarios/fundaciones') ? 'active' : ''}`} onClick={handleLinkClick}>
              <i className="fas fa-building"></i> {t("fundaciones")}
            </Link>
            <Link to="/admin/usuarios/veterinarias" className={`submenu-item ${isActive('/admin/usuarios/veterinarias') ? 'active' : ''}`} onClick={handleLinkClick}>
              <i className="fas fa-clinic-medical"></i> {t("veterinarias")}
            </Link>
          </div>
        </div>

        <div className="sidebar-section">
          <div
            className={`sidebar-item has-submenu ${isActive('/admin/adopciones') ? 'active' : ''}`}
            onClick={() => toggleSection('adopciones')}
          >
            <i className="fas fa-heart"></i>
            <span>{t("adopciones")}</span>
            <i className={`fas fa-chevron-right arrow ${openSections.adopciones ? 'open' : ''}`}></i>
          </div>
          <div className={`submenu ${openSections.adopciones ? 'open' : ''}`}>
            <Link to="/admin/adopciones" className={`submenu-item ${isActive('/admin/adopciones') && !isActive('/admin/adopciones/solicitudes') ? 'active' : ''}`} onClick={handleLinkClick}>
              <i className="fas fa-list"></i> {t("todas_adopciones")}
            </Link>
            <Link to="/admin/adopciones/solicitudes" className={`submenu-item ${isActive('/admin/adopciones/solicitudes') ? 'active' : ''}`} onClick={handleLinkClick}>
              <i className="fas fa-clipboard-list"></i> {t("solicitudes_pendientes")}
              <span className="sidebar-badge">5</span>
            </Link>
            <Link to="/admin/adopciones/seguimientos" className={`submenu-item ${isActive('/admin/adopciones/seguimientos') ? 'active' : ''}`} onClick={handleLinkClick}>
              <i className="fas fa-chart-line"></i> {t("seguimientos")}
            </Link>
          </div>
        </div>

        <div className="sidebar-section">
          <div
            className={`sidebar-item has-submenu ${isActive('/admin/eventos') ? 'active' : ''}`}
            onClick={() => toggleSection('eventos')}
          >
            <i className="fas fa-calendar-alt"></i>
            <span>{t("eventos")}</span>
            <i className={`fas fa-chevron-right arrow ${openSections.eventos ? 'open' : ''}`}></i>
          </div>
          <div className={`submenu ${openSections.eventos ? 'open' : ''}`}>
            <Link to="/admin/eventos" className={`submenu-item ${isActive('/admin/eventos') && !isActive('/admin/eventos/crear') ? 'active' : ''}`} onClick={handleLinkClick}>
              <i className="fas fa-list"></i> {t("todos_eventos")}
            </Link>
            <Link to="/admin/eventos/crear" className={`submenu-item ${isActive('/admin/eventos/crear') ? 'active' : ''}`} onClick={handleLinkClick}>
              <i className="fas fa-plus-circle"></i> {t("crear_evento")}
            </Link>
            <Link to="/admin/eventos/calendario" className={`submenu-item ${isActive('/admin/eventos/calendario') ? 'active' : ''}`} onClick={handleLinkClick}>
              <i className="fas fa-calendar-week"></i> {t("calendario")}
            </Link>
          </div>
        </div>

        <div className="sidebar-section">
          <div
            className={`sidebar-item has-submenu ${isActive('/admin/suscripciones') ? 'active' : ''}`}
            onClick={() => toggleSection('suscripciones')}
          >
            <i className="fas fa-hand-holding-heart"></i>
            <span>{t("suscripciones")}</span>
            <i className={`fas fa-chevron-right arrow ${openSections.suscripciones ? 'open' : ''}`}></i>
          </div>
          <div className={`submenu ${openSections.suscripciones ? 'open' : ''}`}>
            <Link
              to="/admin/suscripciones"
              className={`submenu-item ${
                isActive('/admin/suscripciones') &&
                !isActive('/admin/suscripciones/crear') &&
                !isActive('/admin/suscripciones/reportes')
                ? 'active' : ''
              }`}
              onClick={handleLinkClick}
            >
              <i className="fas fa-list"></i> {t("todas_suscripciones")}
            </Link>
            <Link to="/admin/suscripciones/crear" className={`submenu-item ${isActive('/admin/suscripciones/crear') ? 'active' : ''}`} onClick={handleLinkClick}>
              <i className="fas fa-plus-circle"></i> {t("crear_suscripcion")}
            </Link>
            <Link to="/admin/suscripciones/estado" className={`submenu-item ${isActive('/admin/suscripciones/estado') ? 'active' : ''}`} onClick={handleLinkClick}>
              <i className="fas fa-toggle-on"></i> {t("gestion_estados")}
            </Link>
            <Link to="/admin/suscripciones/reportes" className={`submenu-item ${isActive('/admin/suscripciones/reportes') ? 'active' : ''}`} onClick={handleLinkClick}>
              <i className="fas fa-chart-line"></i> {t("reportes_suscripciones")}
            </Link>
          </div>
        </div>

        <div className="sidebar-section">
          <Link to="/admin/donaciones" className={`sidebar-item ${isActive('/admin/donaciones') ? 'active' : ''}`} onClick={handleLinkClick}>
            <i className="fas fa-hand-holding-heart"></i>
            <span>{t("donaciones")}</span>
          </Link>
        </div>
      </nav>
    </aside>
  );
};

export default memo(AdminSidebar);