// src/components/layout/Navbar/PublicNavbar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import { useSidebar } from '../../../contexts/SidebarContext';
import './PublicNavbar.css';

const PublicNavbar = () => {
  const { t, i18n } = useTranslation('layout');
  const { isAuthenticated, user, logout } = useAuth();
  const { togglePublicSidebar, isPublicSidebarOpen } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  
  // 🔥 TODOS LOS HOOKS PRIMERO 🔥
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const languageMenuRef = useRef(null);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target)) {
        setIsLanguageMenuOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 🔥 LUEGO LA CONDICIÓN PARA OCULTAR (después de todos los hooks) 🔥
  const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  const isAuthPage = authRoutes.includes(location.pathname);
  
  // Si es página de autenticación, NO renderizar el navbar
  if (isAuthPage) {
    return null;
  }

  // 🔥 RESTO DEL CÓDIGO (funciones y return) 🔥
  const toggleLanguage = (lang) => {
    i18n.changeLanguage(lang);
    setIsLanguageMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsProfileMenuOpen(false);
    navigate('/');
  };

  const languages = [
    { code: 'es', name: 'Español', flag: 'co', label: 'ES' },
    { code: 'en', name: 'English', flag: 'us', label: 'EN' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const getDashboardPath = () => {
    if (!user) return '/';
    switch(user.tipo) {
      case 'admin': return '/admin/dashboard';
      case 'veterinaria': return '/veterinaria/dashboard';
      case 'fundacion': return '/fundacion/dashboard';
      default: return '/';
    }
  };

  const getConfigPath = () => {
    if (!user) return '/';
    switch(user.tipo) {
      case 'admin': return '/admin/configuracion';
      case 'veterinaria': return '/veterinaria/configuracion';
      case 'fundacion': return '/fundacion/configuracion';
      default: return '/user/configuracion';
    }
  };

  const getProfilePath = () => {
    if (!user) return '/';
    switch(user.tipo) {
      case 'admin': return '/admin/perfil';
      case 'veterinaria': return '/veterinaria/perfil';
      case 'fundacion': return '/fundacion/perfil';
      default: return '/user/perfil';
    }
  };

  const getHomePath = () => {
    if (!isAuthenticated) return '/';
    return getDashboardPath();
  };

  const getRoleBadge = () => {
    if (!user) return null;
    switch(user.tipo) {
      case 'admin': return { text: t('navbar.admin'), path: '/admin/dashboard', color: '#ff4757' };
      default: return null;
    }
  };

  const roleBadge = getRoleBadge();

  const handleLogoClick = (e) => {
    e.preventDefault();
    navigate(getHomePath());
  };

  const showReportButton = () => {
    if (!isAuthenticated) return true;
    if (user?.tipo === 'user') return true;
    return false;
  };

  const getProfileMenuItems = () => {
    const items = [
      { icon: 'fas fa-user', label: t('navbar.profile'), path: getProfilePath() },
      { icon: 'fas fa-tachometer-alt', label: t('navbar.dashboard'), path: getDashboardPath() },
      { icon: 'fas fa-cog', label: t('navbar.settings'), path: getConfigPath() }
    ];
    
    if (user?.tipo === 'admin') {
      items.push({ icon: 'fas fa-shield-alt', label: t('navbar.admin_panel'), path: '/admin/dashboard' });
    }
    
    return items;
  };

  return (
    <nav className={`public-navbar ${isPublicSidebarOpen ? 'sidebar-open' : ''}`}>
      <div className="public-navbar-container">
        <button 
          className={`public-hamburger-btn ${isPublicSidebarOpen ? 'open' : ''}`}
          onClick={togglePublicSidebar}
          aria-label="Menú"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Logo */}
        <div 
          className="public-navbar-brand"
          onClick={handleLogoClick}
          style={{ cursor: 'pointer' }}
        >
          <img src="/img/logo-oscuro.png" alt="Logo" className="public-navbar-logo" />

          <div className="public-navbar-logo-texto">
            <span className="logo-title">{t('navbar.logo_title')}</span>
            <span className="logo-subtitle">{t('navbar.logo_subtitle')}</span>
          </div>
        </div>

        {/* Botón de reportar rescate */}
        {showReportButton() && (
          <Link to="/rescates/reportar" className="public-urgent-btn">
            <i className="fas fa-paw"></i>
            <span>{t('navbar.reportar_rescate')}</span>
          </Link>
        )}

        {/* Role Badge */}
        {roleBadge && (
          <Link to={roleBadge.path} className="role-badge" style={{ background: roleBadge.color }}>
            <i className="fas fa-shield-alt"></i>
            <span>{roleBadge.text}</span>
          </Link>
        )}

        {/* Perfil */}
        {isAuthenticated ? (
          <div className="profile-menu" ref={profileMenuRef}>
            <button 
              className="public-profile-btn"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            >
              <div className="public-profile-avatar">
                {user?.avatar ? <img src={user.avatar} alt="Avatar" /> : <i className="fas fa-user"></i>}
              </div>
              <div className="public-profile-info">
                <span className="public-profile-name">{user?.nombre}</span>
                <span className="public-profile-role">
                  {user?.tipo === 'admin' ? t('navbar.role_admin') : 
                   user?.tipo === 'veterinaria' ? t('navbar.role_vet') :
                   user?.tipo === 'fundacion' ? t('navbar.role_foundation') : t('navbar.role_user')}
                </span>
              </div>
              <i className={`fas fa-chevron-down profile-arrow ${isProfileMenuOpen ? 'open' : ''}`}></i>
            </button>
            
            {isProfileMenuOpen && (
              <div className="profile-dropdown">
                {getProfileMenuItems().map((item, index) => (
                  <Link
                    key={index}
                    to={item.path}
                    className="profile-dropdown-item"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <i className={item.icon}></i>
                    <span>{item.label}</span>
                  </Link>
                ))}
                <div className="dropdown-divider"></div>
                <button onClick={handleLogout} className="profile-dropdown-item logout-item">
                  <i className="fas fa-sign-out-alt"></i>
                  <span>{t('navbar.logout')}</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="public-profile-btn">
            <div className="public-profile-avatar"><i className="fas fa-user"></i></div>
            <div className="public-profile-info">
              <span className="public-profile-name">{t('navbar.iniciar_sesion')}</span>
              <span className="public-profile-role">{t('navbar.registrarse')}</span>
            </div>
          </Link>
        )}

      </div>
    </nav>
  );
};

export default PublicNavbar;