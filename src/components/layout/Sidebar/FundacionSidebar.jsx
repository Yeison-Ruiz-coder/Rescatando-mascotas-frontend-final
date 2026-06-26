// src/components/layout/Sidebar/FundacionSidebar.jsx
import React, { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
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
  useSidebarCloser(sidebarRef, isPublicSidebarOpen, closePublicSidebar, 0);

  const [openSections, setOpenSections] = useState({
    rescates: true,
    mascotas: false,
    adopciones: false,
    eventos: false
  });

  const [showBadges, setShowBadges] = useState(false);
  
  // ✅ Estado para datos reales
  const [badgeCounts, setBadgeCounts] = useState({
    solicitudesPendientes: 0,
    mascotasActivas: 0,
    rescatesNuevos: 0,
    seguimientosPendientes: 0
  });
  const [loading, setLoading] = useState(true);

  // ✅ Resize handler optimizado con throttle
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

  // ✅ Badges con requestAnimationFrame
  useEffect(() => {
    if (isPublicSidebarOpen) {
      const rafId = requestAnimationFrame(() => {
        const timer = setTimeout(() => setShowBadges(true), 200);
        return () => clearTimeout(timer);
      });
      return () => cancelAnimationFrame(rafId);
    } else {
      setShowBadges(false);
    }
  }, [isPublicSidebarOpen]);

  // ✅ Cargar datos reales para badges
  useEffect(() => {
    const fetchBadgeCounts = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) return;

        // Obtener contador de solicitudes pendientes
        const solicitudesRes = await fetch('/api/fundacion/adopciones/solicitudes/pendientes/count', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (solicitudesRes.ok) {
          const data = await solicitudesRes.json();
          setBadgeCounts(prev => ({
            ...prev,
            solicitudesPendientes: data.count || 0
          }));
        }

        // Obtener contador de mascotas activas
        const mascotasRes = await fetch('/api/fundacion/mascotas/count', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (mascotasRes.ok) {
          const data = await mascotasRes.json();
          setBadgeCounts(prev => ({
            ...prev,
            mascotasActivas: data.count || 0
          }));
        }

        // Obtener contador de rescates nuevos disponibles
        const rescatesRes = await fetch('/api/fundacion/rescates/disponibles/count', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (rescatesRes.ok) {
          const data = await rescatesRes.json();
          setBadgeCounts(prev => ({
            ...prev,
            rescatesNuevos: data.count || 0
          }));
        }

        // Obtener contador de seguimientos pendientes
        const seguimientosRes = await fetch('/api/fundacion/adopciones/seguimientos/pendientes/count', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (seguimientosRes.ok) {
          const data = await seguimientosRes.json();
          setBadgeCounts(prev => ({
            ...prev,
            seguimientosPendientes: data.count || 0
          }));
        }

      } catch (error) {
        console.error('Error fetching badge counts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBadgeCounts();
  }, []);

  const toggleSection = useCallback((section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  const isActive = useCallback((path) => {
    if (path === '/fundacion/adopciones') {
      return location.pathname.startsWith('/fundacion/adopciones') || 
             location.pathname.startsWith('/fundacion/solicitudes') ||
             location.pathname.startsWith('/fundacion/seguimientos');
    }
    return location.pathname.startsWith(path);
  }, [location.pathname]);

  const handleLogout = useCallback(() => {
    logout();
    closePublicSidebar();
  }, [logout, closePublicSidebar]);

  const handleLinkClick = useCallback(() => {
    if (isMobile) {
      closePublicSidebar();
    }
  }, [isMobile, closePublicSidebar]);

  // ✅ Función optimizada para obtener la foto de perfil
  const userAvatar = useMemo(() => {
    if (!user) return null;
    if (user.foto_perfil) return user.foto_perfil;
    if (user.logo) return user.logo;
    if (user.foto) return user.foto;
    if (user.avatar) return user.avatar;
    return null;
  }, [user]);

  // ✅ Memoizar contenido del avatar
  const avatarContent = useMemo(() => {
    if (userAvatar) {
      return (
        <img 
          src={userAvatar} 
          alt={user?.nombre || t("fundacion")} 
          className="sidebar-avatar-img"
          loading="lazy"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = '<i class="fas fa-building"></i>';
          }}
        />
      );
    }
    return <i className="fas fa-building"></i>;
  }, [userAvatar, user, t]);

  return (
    <aside 
      ref={sidebarRef} 
      className={`sidebar fundacion-sidebar ${isPublicSidebarOpen ? 'open' : ''}`}
      style={{
        willChange: 'transform',
        backfaceVisibility: 'hidden',
        contain: 'layout style'
      }}
    >
      <div className="sidebar-header fundacion-header">
        <div className="sidebar-user">
          <div className="sidebar-avatar fundacion-avatar">
            {avatarContent}
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
            {showBadges && badgeCounts.rescatesNuevos > 0 && (
              <span className="sidebar-badge urgent">{badgeCounts.rescatesNuevos}</span>
            )}
            <i className={`fas fa-chevron-right arrow ${openSections.rescates ? 'open' : ''}`}></i>
          </div>
          <div className={`submenu ${openSections.rescates ? 'open' : ''}`}>
            <SubmenuItem
              to="/fundacion/rescates/disponibles"
              icon="fas fa-map-marker-alt"
              label={t("rescates_cerca")}
              isActive={isActive('/fundacion/rescates/disponibles')}
              onClick={handleLinkClick}
              badge={badgeCounts.rescatesNuevos > 0 ? badgeCounts.rescatesNuevos : null}
              badgeType="urgent"
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
            {showBadges && badgeCounts.mascotasActivas > 0 && (
              <span className="sidebar-badge">{badgeCounts.mascotasActivas}</span>
            )}
            <i className={`fas fa-chevron-right arrow ${openSections.mascotas ? 'open' : ''}`}></i>
          </div>
          <div className={`submenu ${openSections.mascotas ? 'open' : ''}`}>
            <SubmenuItem
              to="/fundacion/mascotas"
              icon="fas fa-list"
              label={t("mis_mascotas")}
              isActive={isActive('/fundacion/mascotas') && !isActive('/fundacion/mascotas/nueva')}
              onClick={handleLinkClick}
              badge={badgeCounts.mascotasActivas > 0 ? badgeCounts.mascotasActivas : null}
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
            {showBadges && (badgeCounts.solicitudesPendientes > 0 || badgeCounts.seguimientosPendientes > 0) && (
              <span className="sidebar-badge urgent">
                {badgeCounts.solicitudesPendientes + badgeCounts.seguimientosPendientes}
              </span>
            )}
            <i className={`fas fa-chevron-right arrow ${openSections.adopciones ? 'open' : ''}`}></i>
          </div>
          <div className={`submenu ${openSections.adopciones ? 'open' : ''}`}>
            <SubmenuItem
              to="/fundacion/adopciones/solicitudes"
              icon="fas fa-clipboard-list"
              label={t("solicitudes_recibidas")}
              isActive={isActive('/fundacion/adopciones/solicitudes')}
              onClick={handleLinkClick}
              badge={badgeCounts.solicitudesPendientes > 0 ? badgeCounts.solicitudesPendientes : null}
              badgeType="urgent"
            />
            <SubmenuItem
              to="/fundacion/adopciones"
              icon="fas fa-check-circle"
              label={t("adopciones_aprobadas")}
              isActive={isActive('/fundacion/adopciones') && !isActive('/fundacion/adopciones/solicitudes') && !isActive('/fundacion/adopciones/seguimientos')}
              onClick={handleLinkClick}
            />
            <SubmenuItem
              to="/fundacion/adopciones/seguimientos"
              icon="fas fa-chart-line"
              label={t("seguimiento_post")}
              isActive={isActive('/fundacion/adopciones/seguimientos')}
              onClick={handleLinkClick}
              badge={badgeCounts.seguimientosPendientes > 0 ? badgeCounts.seguimientosPendientes : null}
              badgeType="urgent"
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