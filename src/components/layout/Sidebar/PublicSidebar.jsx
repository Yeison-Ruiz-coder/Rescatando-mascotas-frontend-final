// src/components/layout/Sidebar/PublicSidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../contexts/AuthContext";
import { useSidebar } from "../../../contexts/SidebarContext";
import "./Sidebar.css";

const PublicSidebar = () => {
  const { t } = useTranslation("layout");
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { isPublicSidebarOpen, closePublicSidebar } = useSidebar();

  const isActive = (path) => location.pathname.startsWith(path);

  const handleLogout = () => {
    logout();
    closePublicSidebar();
  };

  return (
    <aside className={`sidebar public-sidebar ${isPublicSidebarOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            <i className="fas fa-user"></i>
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
          <Link to="/" className="sidebar-item" onClick={closePublicSidebar}>
            <i className="fas fa-home"></i>
            <span>{t("inicio")}</span>
          </Link>
        </div>

        <div className="sidebar-section">
          <div className="section-title">
            <i className="fas fa-dog me-1"></i> {t("adopcion")}
          </div>
          <Link
            to="/mascotas"
            className={`sidebar-item ${isActive("/mascotas") ? "active" : ""}`}
            onClick={closePublicSidebar}
          >
            <i className="fas fa-paw"></i>
            <span>{t("mascotas_adopcion")}</span>
          </Link>
        </div>

        <div className="sidebar-section">
          <div className="section-title">
            <i className="fas fa-ambulance me-1"></i> {t("urgente")}
          </div>
          <Link
            to="/rescates/reportar"
            className={`sidebar-item rescue-item ${isActive("/rescates/reportar") ? "active" : ""}`}
            onClick={closePublicSidebar}
          >
            <i className="fas fa-exclamation-triangle"></i>
            <span>{t("reportar_rescate")}</span>
            <span className="sidebar-badge urgent">{t("urgente").toUpperCase()}</span>
          </Link>
        </div>

        <div className="sidebar-section">
          <div className="section-title">
            <i className="fas fa-users me-1"></i> {t("comunidad")}
          </div>
          <Link
            to="/fundaciones"
            className={`sidebar-item ${isActive("/fundaciones") ? "active" : ""}`}
            onClick={closePublicSidebar}
          >
            <i className="fas fa-building"></i>
            <span>{t("fundaciones")}</span>
          </Link>
          <Link
            to="/veterinarias"
            className={`sidebar-item ${isActive("/veterinarias") ? "active" : ""}`}
            onClick={closePublicSidebar}
          >
            <i className="fas fa-clinic-medical"></i>
            <span>{t("veterinarias")}</span>
          </Link>
        </div>

        <div className="sidebar-section">
          <div className="section-title">
            <i className="fas fa-calendar-alt me-1"></i> {t("eventos")}
          </div>
          <Link
            to="/eventos"
            className={`sidebar-item ${isActive("/eventos") ? "active" : ""}`}
            onClick={closePublicSidebar}
          >
            <i className="fas fa-calendar-alt"></i>
            <span>{t("eventos_proximos")}</span>
          </Link>
        </div>

        <div className="sidebar-section">
          <div className="section-title">
            <i className="fas fa-hand-holding-heart me-1"></i> {t("colaborar")}
          </div>
          <Link
            to="/donaciones"
            className={`sidebar-item ${isActive("/donaciones") ? "active" : ""}`}
            onClick={closePublicSidebar}
          >
            <i className="fas fa-donate"></i>
            <span>{t("donaciones")}</span>
          </Link>
        </div>

        {isAuthenticated && (
          <div className="sidebar-section">
            <div className="section-title">
              <i className="fas fa-user me-1"></i> {t("mi_cuenta")}
            </div>
            <Link
              to="/mis-solicitudes"
              className={`sidebar-item ${isActive("/mis-solicitudes") ? "active" : ""}`}
              onClick={closePublicSidebar}
            >
              <i className="fas fa-clipboard-list"></i>
              <span>{t("mis_solicitudes")}</span>
            </Link>
            <button onClick={handleLogout} className="sidebar-item logout-item">
              <i className="fas fa-sign-out-alt"></i>
              <span>{t("cerrar_sesion")}</span>
            </button>
          </div>
        )}
      </nav>
    </aside>
  );
};

export default PublicSidebar;