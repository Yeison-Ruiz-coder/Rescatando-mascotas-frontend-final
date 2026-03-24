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
    <aside
      className={`sidebar public-sidebar ${isPublicSidebarOpen ? "open" : ""}`}
    >
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            <i className="fas fa-user"></i>
          </div>
          <div className="sidebar-user-info">
            <h5>{isAuthenticated ? user?.nombre : "Invitado"}</h5>
            <span className="sidebar-user-role">Bienvenido</span>
          </div>
        </div>
        <button className="sidebar-close" onClick={closePublicSidebar}>
          <i className="fas fa-times"></i>
        </button>
      </div>

      {isAuthenticated && (
        <div className="sidebar-section">
          <div className="section-title">
            <i className="fas fa-home me-1"></i> Navegación
          </div>
          <Link to="/" className="sidebar-item" onClick={closePublicSidebar}>
            <i className="fas fa-home"></i>
            <span>Inicio</span>
          </Link>
        </div>
      )}
      <nav className="sidebar-nav">
        {/* ADOPCIÓN */}
        <div className="sidebar-section">
          <div className="section-title">
            <i className="fas fa-dog me-1"></i> Adopción
          </div>
          <Link
            to="/mascotas"
            className={`sidebar-item ${isActive("/mascotas") ? "active" : ""}`}
            onClick={closePublicSidebar}
          >
            <i className="fas fa-paw"></i>
            <span>Mascotas en adopción</span>
          </Link>
        </div>

        {/* RESCATE - URGENTE */}
        <div className="sidebar-section">
          <div className="section-title">
            <i className="fas fa-ambulance me-1"></i> Urgente
          </div>
          <Link
            to="/rescates/reportar"
            className={`sidebar-item rescue-item ${isActive("/rescates/reportar") ? "active" : ""}`}
            onClick={closePublicSidebar}
          >
            <i className="fas fa-exclamation-triangle"></i>
            <span>Reportar rescate</span>
            <span className="sidebar-badge urgent">URGENTE</span>
          </Link>
        </div>

        {/* COMUNIDAD */}
        <div className="sidebar-section">
          <div className="section-title">
            <i className="fas fa-users me-1"></i> Comunidad
          </div>
          <Link
            to="/fundaciones"
            className={`sidebar-item ${isActive("/fundaciones") ? "active" : ""}`}
            onClick={closePublicSidebar}
          >
            <i className="fas fa-building"></i>
            <span>Fundaciones</span>
          </Link>
          <Link
            to="/veterinarias"
            className={`sidebar-item ${isActive("/veterinarias") ? "active" : ""}`}
            onClick={closePublicSidebar}
          >
            <i className="fas fa-clinic-medical"></i>
            <span>Veterinarias</span>
          </Link>
        </div>

        {/* EVENTOS */}
        <div className="sidebar-section">
          <div className="section-title">
            <i className="fas fa-calendar-alt me-1"></i> Eventos
          </div>
          <Link
            to="/eventos"
            className={`sidebar-item ${isActive("/eventos") ? "active" : ""}`}
            onClick={closePublicSidebar}
          >
            <i className="fas fa-calendar-alt"></i>
            <span>Próximos eventos</span>
          </Link>
        </div>

        {/* DONACIONES */}
        <div className="sidebar-section">
          <div className="section-title">
            <i className="fas fa-hand-holding-heart me-1"></i> Colaborar
          </div>
          <Link
            to="/donaciones"
            className={`sidebar-item ${isActive("/donaciones") ? "active" : ""}`}
            onClick={closePublicSidebar}
          >
            <i className="fas fa-donate"></i>
            <span>Donaciones</span>
          </Link>
        </div>

        {/* MIS COSAS (solo autenticado) */}
        {isAuthenticated && (
          <div className="sidebar-section">
            <div className="section-title">
              <i className="fas fa-user me-1"></i> Mi cuenta
            </div>
            <Link
              to="/mis-solicitudes"
              className={`sidebar-item ${isActive("/mis-solicitudes") ? "active" : ""}`}
              onClick={closePublicSidebar}
            >
              <i className="fas fa-clipboard-list"></i>
              <span>Mis solicitudes</span>
            </Link>
          </div>
        )}
      </nav>

      {/* Footer */}
    </aside>
  );
};

export default PublicSidebar;
