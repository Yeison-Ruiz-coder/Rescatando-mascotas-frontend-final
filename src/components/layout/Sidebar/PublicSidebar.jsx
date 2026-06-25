// src/components/layout/Sidebar/PublicSidebar.jsx
import React, { useRef, useState, useEffect, useCallback, memo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../contexts/AuthContext";
import { useSidebar } from "../../../contexts/SidebarContext";
import useSidebarCloser from "../../../hooks/useSidebarCloser";
import "./Sidebar.css";

const PublicSidebar = () => {
  const { t } = useTranslation("layout");
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { isPublicSidebarOpen, closePublicSidebar } = useSidebar();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  const sidebarRef = useRef(null);

  // Sin delay para apertura inmediata
  useSidebarCloser(sidebarRef, isPublicSidebarOpen, closePublicSidebar, 0);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

  // 🔹 Función para obtener la foto de perfil del usuario
  const getUserAvatar = useCallback(() => {
    if (!user) return null;
    
    // Si el usuario tiene foto de perfil (URL o base64)
    if (user.foto_perfil) {
      return user.foto_perfil;
    }
    
    // Si tiene foto de Google
    if (user.foto) {
      return user.foto;
    }
    
    // Si tiene avatar generado
    if (user.avatar) {
      return user.avatar;
    }
    
    return null;
  }, [user]);

  const userAvatar = getUserAvatar();

  return (
    <aside
      ref={sidebarRef}
      className={`sidebar public-sidebar ${isPublicSidebarOpen ? "open" : ""}`}
    >
      <div className="sidebar-header">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {/* 🔹 Mostrar foto de perfil si existe, sino el ícono genérico */}
            {isAuthenticated && userAvatar ? (
              <img 
                src={userAvatar} 
                alt={user?.nombre || "Usuario"} 
                className="sidebar-avatar-img"
                onError={(e) => {
                  // Si la imagen falla, mostrar el ícono
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<i class="fas fa-user"></i>';
                }}
              />
            ) : (
              <i className="fas fa-user"></i>
            )}
          </div>
          <div className="sidebar-user-info">
            <h5>{isAuthenticated ? user?.nombre : t("invitado")}</h5>
            <span className="sidebar-user-role">{t("bienvenido")}</span>
          </div>
        </div>
        <button className="sidebar-close" onClick={closePublicSidebar}>
          <i className="fas fa-times"></i>
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section">
          <div className="section-title">
            <i className="fas fa-home me-1"></i> {t("navegacion")}
          </div>
          <Link to="/" className="sidebar-item" onClick={handleLinkClick}>
            <i className="fas fa-home"></i>
            <span>{t("inicio")}</span>
          </Link>
        </div>

        <div className="sidebar-section">
          <div className="section-title">
            <i className="fas fa-ambulance me-1"></i> {t("urgente")}
          </div>
          <Link
            to="/rescates/reportar"
            className={`sidebar-item rescue-item ${isActive("/rescates/reportar") ? "active" : ""}`}
            onClick={handleLinkClick}
          >
            <i className="fas fa-exclamation-triangle"></i>
            <span>{t("reportar_rescate")}</span>
            <span className="sidebar-badge urgent">
              {t("urgente").toUpperCase()}
            </span>
          </Link>
        </div>

        <div className="sidebar-section">
          <div className="section-title">
            <i className="fas fa-dog me-1"></i> {t("adopcion")}
          </div>
          <Link
            to="/mascotas"
            className={`sidebar-item ${isActive("/mascotas") ? "active" : ""}`}
            onClick={handleLinkClick}
          >
            <i className="fas fa-paw"></i>
            <span>{t("mascotas_adopcion")}</span>
          </Link>
        </div>

        <div className="sidebar-section">
          <div className="section-title">
            <i className="fas fa-calendar-alt me-1"></i> {t("eventos")}
          </div>
          <Link
            to="/eventos"
            className={`sidebar-item ${isActive("/eventos") ? "active" : ""}`}
            onClick={handleLinkClick}
          >
            <i className="fas fa-calendar-alt"></i>
            <span>{t("eventos_proximos")}</span>
          </Link>
        </div>

        <div className="sidebar-section">
          <div className="section-title">
            <i className="fas fa-heart me-1"></i> {t("apadrinar")}
          </div>
          <Link
            to="/suscripciones"
            className={`sidebar-item ${isActive("/suscripciones") ? "active" : ""}`}
            onClick={handleLinkClick}
          >
            <i className="fas fa-hand-holding-heart"></i>
            <span>{t("apadrinar_mascota")}</span>
          </Link>
        </div>

        <div className="sidebar-section">
          <div className="section-title">
            <i className="fas fa-users me-1"></i> {t("comunidad")}
          </div>
          <Link
            to="/fundaciones"
            className={`sidebar-item ${isActive("/fundaciones") ? "active" : ""}`}
            onClick={handleLinkClick}
          >
            <i className="fas fa-building"></i>
            <span>{t("fundaciones")}</span>
          </Link>
          <Link
            to="/veterinarias"
            className={`sidebar-item ${isActive("/veterinarias") ? "active" : ""}`}
            onClick={handleLinkClick}
          >
            <i className="fas fa-clinic-medical"></i>
            <span>{t("veterinarias")}</span>
          </Link>
        </div>

        {isAuthenticated && (
          <>
            <div className="sidebar-section">
              <Link
                to="/user/PanelUsuario"
                className={`sidebar-item ${isActive("/user/PanelUsuario") ? "active" : ""}`}
                onClick={handleLinkClick}
              >
                <i className="fas fa-chart-line"></i>
                <span>{t("mi_dashboard") || "Mi Dashboard"}</span>
              </Link>
              <div className="section-title">
                <i className="fas fa-user me-1"></i> {t("mi_cuenta")}
              </div>
              <Link
                to="/user/mis-solicitudes"
                className={`sidebar-item ${isActive("/user/mis-solicitudes") ? "active" : ""}`}
                onClick={handleLinkClick}
              >
                <i className="fas fa-clipboard-list"></i>
                <span>{t("mis_solicitudes")}</span>
              </Link>
              <Link
                to="/user/mis-suscripciones"
                className={`sidebar-item ${isActive("/user/mis-suscripciones") ? "active" : ""}`}
                onClick={handleLinkClick}
              >
                <i className="fas fa-credit-card"></i>
                <span>{t("mis_suscripciones") || "Mis Suscripciones"}</span>
              </Link>
            </div>
          </>
        )}
      </nav>
    </aside>
  );
};

export default memo(PublicSidebar);