// src/components/layout/Sidebar/AdminSidebar.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import { useSidebar } from '../../../contexts/SidebarContext';
import useSidebarCloser from '../../../hooks/useSidebarCloser';
import { getImageUrl } from '../../../utils/imageUtils';
import api from '../../../services/api';
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
    catalogos: false,
    usuarios: false,
    adopciones: false,
    eventos: false,
    suscripciones: false
  });

  const [badgeCounts, setBadgeCounts] = useState({
    usuariosPendientes: 0,
    adopcionesPendientes: 0,
    rescatesPendientes: 0
  });

  // ✅ Fetch real badge counts desde el backend
  useEffect(() => {
    if (!user || user.tipo !== 'admin') return;

    let cancelled = false;
    const controller = new AbortController();

    const fetchBadgeCounts = async () => {
      try {
        const [usuariosRes, adopcionesRes, rescatesRes] = await Promise.all([
          api.get('/admin/usuarios', { params: { estado: 'pendiente', per_page: 1 }, signal: controller.signal }),
          api.get('/admin/adopciones', { params: { estado: 'pendiente', per_page: 1 }, signal: controller.signal }),
          api.get('/admin/rescates', { params: { estado: 'pendiente', per_page: 1 }, signal: controller.signal })
        ]);

        if (cancelled) return;

        const usuariosPendientes = usuariosRes.data?.data?.total ?? usuariosRes.data?.total ?? 0;
        const adopcionesPendientes = adopcionesRes.data?.data?.total ?? adopcionesRes.data?.total ?? 0;
        const rescatesPendientes = rescatesRes.data?.data?.total ?? rescatesRes.data?.total ?? 0;

        setBadgeCounts({
          usuariosPendientes,
          adopcionesPendientes,
          rescatesPendientes
        });
      } catch (error) {
        if (!cancelled && error.name !== 'AbortError') {
          console.error('Error fetching admin badge counts:', error);
        }
      }
    };

    fetchBadgeCounts();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [user]);

  const toggleSection = useCallback((section) => {
    setOpenSections(prev => {
      const isOpening = !prev[section];
      return Object.keys(prev).reduce((acc, key) => {
        acc[key] = key === section ? isOpening : false;
        return acc;
      }, {});
    });
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
              {badgeCounts.rescatesPendientes > 0 && (
                <span className="sidebar-badge urgent">{badgeCounts.rescatesPendientes}</span>
              )}
            </Link>
            <Link to="/admin/rescates/mapa" className={`submenu-item ${isActive('/admin/rescates/mapa') ? 'active' : ''}`} onClick={handleLinkClick}>
              <i className="fas fa-map-marker-alt"></i> {t("mapa_rescates")}
            </Link>
          </div>
        </div>

        {/* ✅ SECCIÓN MASCOTAS - CORREGIDA */}
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
            <Link to="/admin/mascotas" className={`submenu-item ${isActive('/admin/mascotas') ? 'active' : ''}`} onClick={handleLinkClick}>
              <i className="fas fa-list"></i> {t("todas_mascotas")}
            </Link>
            {/* ❌ ELIMINADO: "Registrar mascota" - Admin NO crea mascotas */}
          </div>
        </div>

        {/* ✅ NUEVA SECCIÓN: CATÁLOGOS (Razas y Vacunas) */}
        <div className="sidebar-section">
          <div
            className={`sidebar-item has-submenu ${isActive('/admin/catalogos') ? 'active' : ''}`}
            onClick={() => toggleSection('catalogos')}
          >
            <i className="fas fa-book"></i>
            <span>{t("catalogos")}</span>
            <i className={`fas fa-chevron-right arrow ${openSections.catalogos ? 'open' : ''}`}></i>
          </div>
          <div className={`submenu ${openSections.catalogos ? 'open' : ''}`}>
            <Link to="/admin/catalogos/razas" className={`submenu-item ${isActive('/admin/catalogos/razas') ? 'active' : ''}`} onClick={handleLinkClick}>
              <i className="fas fa-dna"></i> {t("catalogo_razas")}
            </Link>
            <Link to="/admin/catalogos/vacunas" className={`submenu-item ${isActive('/admin/catalogos/vacunas') ? 'active' : ''}`} onClick={handleLinkClick}>
              <i className="fas fa-syringe"></i> {t("catalogo_vacunas")}
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
              {badgeCounts.usuariosPendientes > 0 && (
                <span className="sidebar-badge urgent">{badgeCounts.usuariosPendientes}</span>
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
              {badgeCounts.adopcionesPendientes > 0 && (
                <span className="sidebar-badge urgent">{badgeCounts.adopcionesPendientes}</span>
              )}
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
              className={`submenu-item ${isActive('/admin/suscripciones') && !isActive('/admin/suscripciones/estado') ? 'active' : ''}`}
              onClick={handleLinkClick}
            >
              <i className="fas fa-list"></i> {t("todas_suscripciones")}
            </Link>
            <Link 
              to="/admin/suscripciones/estado" 
              className={`submenu-item ${isActive('/admin/suscripciones/estado') ? 'active' : ''}`} 
              onClick={handleLinkClick}
            >
              <i className="fas fa-chart-pie"></i> {t("estadisticas_suscripciones")}
            </Link>
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default memo(AdminSidebar);