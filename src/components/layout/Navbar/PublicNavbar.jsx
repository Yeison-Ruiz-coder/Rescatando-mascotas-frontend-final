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

  // Determinar qué dashboard mostrar según el rol
  const getDashboardPath = () => {
    if (!user) return '/';
    switch(user.tipo) {
      case 'admin': return '/admin/dashboard';
      case 'veterinaria': return '/veterinaria/dashboard';
      case 'fundacion': return '/fundacion/dashboard';
      default: return '/user/dashboard';
    }
  };

  // Determinar la ruta de configuración según el rol
  const getConfigPath = () => {
    if (!user) return '/';
    switch(user.tipo) {
      case 'admin': return '/admin/configuracion';
      case 'veterinaria': return '/veterinaria/configuracion';
      case 'fundacion': return '/fundacion/configuracion';
      default: return '/user/configuracion';
    }
  };

  // Determinar la ruta de perfil según el rol
  const getProfilePath = () => {
    if (!user) return '/';
    switch(user.tipo) {
      case 'admin': return '/admin/perfil';
      case 'veterinaria': return '/veterinaria/perfil';
      case 'fundacion': return '/fundacion/perfil';
      default: return '/user/perfil';
    }
  };

  // Determinar la ruta de inicio según el rol (para el logo)
  const getHomePath = () => {
    if (!isAuthenticated) return '/';
    return getDashboardPath();
  };

  // Determinar qué badge mostrar
  const getRoleBadge = () => {
    if (!user) return null;
    switch(user.tipo) {
      case 'admin': return { text: 'Admin', path: '/admin/dashboard', color: '#ff4757' };
      default: return null;
    }
  };

  const roleBadge = getRoleBadge();

  // Manejar clic en el logo
  const handleLogoClick = (e) => {
    e.preventDefault();
    const homePath = getHomePath();
    navigate(homePath);
  };

  // Determinar si debe mostrar el botón de reportar rescate
  const showReportButton = () => {
    if (!isAuthenticated) return true;
    if (user?.tipo === 'user') return true;
    return false;
  };

  // Obtener las opciones del menú de perfil según el rol
  const getProfileMenuItems = () => {
    const items = [
      { icon: 'fas fa-user', label: 'Mi Perfil', path: getProfilePath() },
      { icon: 'fas fa-tachometer-alt', label: 'Mi Panel', path: getDashboardPath() },
      { icon: 'fas fa-cog', label: 'Configuración', path: getConfigPath() }  // 🔥 NUEVO: Configuración
    ];
    
    if (user?.tipo === 'admin') {
      items.push({ icon: 'fas fa-shield-alt', label: 'Administración', path: '/admin/dashboard' });
    }
    
    return items;
  };

  return (
    <nav className="public-navbar">
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
          <img src="/img/texto-logo-oscuro.png" alt="Rescatando Mascotas" className="public-navbar-logo-texto" />
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

        {/* Perfil de usuario con menú desplegable */}
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
                  {user?.tipo === 'admin' ? 'Administrador' : 
                   user?.tipo === 'veterinaria' ? 'Veterinaria' :
                   user?.tipo === 'fundacion' ? 'Fundación' : 'Usuario'}
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
                  <span>Cerrar Sesión</span>
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

        {/* Selector de idioma */}
        <div className="language-selector" ref={languageMenuRef}>
          <button className="language-selector-btn" onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}>
            <span className={`fi fi-${currentLanguage.flag}`}></span>
            <span className="language-text">{currentLanguage.label}</span>
            <i className={`fas fa-chevron-down language-arrow ${isLanguageMenuOpen ? 'open' : ''}`}></i>
          </button>
          
          {isLanguageMenuOpen && (
            <div className="language-dropdown">
              {languages.map((lang) => (
                <button key={lang.code} onClick={() => toggleLanguage(lang.code)} className={`language-dropdown-item ${i18n.language === lang.code ? 'active' : ''}`}>
                  <span className={`fi fi-${lang.flag}`}></span>
                  <span className="language-name">{lang.name}</span>
                  {i18n.language === lang.code && <i className="fas fa-check language-check"></i>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;