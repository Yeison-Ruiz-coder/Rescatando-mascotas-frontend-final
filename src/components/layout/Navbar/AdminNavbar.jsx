import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import { useSidebar } from '../../../contexts/SidebarContext';
import './AdminNavbar.css';

const AdminNavbar = () => {
  const { t, i18n } = useTranslation('layout');
  const { user, logout } = useAuth();
  const { toggleAdminSidebar, isAdminSidebarOpen } = useSidebar();
  const navigate = useNavigate();
  
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const languageMenuRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target)) {
        setIsLanguageMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
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
    navigate('/login');
  };

  // Definir los idiomas con los nombres traducidos correctamente
  const languages = [
    { code: 'es', name: 'Español', flag: 'co', label: 'ES' },
    { code: 'en', name: 'English', flag: 'us', label: 'EN' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const getAvatarUrl = () => {
    const defaultName = user?.nombre || 'Admin';
    if (!user?.avatar) return `https://ui-avatars.com/api/?name=${encodeURIComponent(defaultName)}&background=667eea&color=fff&bold=true&size=40`;
    if (user.avatar.startsWith('http')) return user.avatar;
    return `/storage/${user.avatar}`;
  };

  const getUserRole = () => {
    const role = user?.rol || user?.role;
    if (role === 'admin') return t('admin_navbar.user_menu.admin_role');
    if (role === 'fundacion') return t('admin_navbar.user_menu.foundation_role');
    if (role === 'veterinaria') return t('admin_navbar.user_menu.veterinary_role');
    return t('admin_navbar.user_menu.user_role');
  };

  return (
    <nav className="admin-navbar">
      <div className="admin-navbar-container">
        <button 
          className={`admin-hamburger-btn ${isAdminSidebarOpen ? 'open' : ''}`}
          onClick={toggleAdminSidebar}
          aria-label={t('admin_navbar.aria.toggle_menu')}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <Link to="/admin/dashboard" className="admin-navbar-brand">
          <div className="admin-logo-icon">
            <i className="fas fa-paw"></i>
          </div>
          <div className="admin-brand-text">
            <span className="admin-brand-title">{t('admin_navbar.brand_title')}</span>
            <span className="admin-brand-subtitle">{t('admin_navbar.brand_subtitle')}</span>
          </div>
        </Link>

        <div className="admin-navbar-actions">


          {/* User Menu */}
          <div className="user-menu" ref={userMenuRef}>
            <button 
              className="user-menu-btn" 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              aria-label={t('admin_navbar.aria.user_menu')}
            >
              <img src={getAvatarUrl()} alt={user?.nombre || 'Admin'} className="user-avatar" />
              <div className="user-info">
                <span className="user-name">{user?.nombre || 'Admin'}</span>
                <span className="user-role">{getUserRole()}</span>
              </div>
              <i className={`fas fa-chevron-down ${isUserMenuOpen ? 'open' : ''}`}></i>
            </button>
            
            {isUserMenuOpen && (
              <div className="user-dropdown">
                <Link to="/admin/perfil" onClick={() => setIsUserMenuOpen(false)}>
                  <i className="fas fa-user"></i>
                  <span>{t('admin_navbar.user_menu.my_profile')}</span>
                </Link>
                <Link to="/admin/configuracion" onClick={() => setIsUserMenuOpen(false)}>
                  <i className="fas fa-cog"></i>
                  <span>{t('admin_navbar.user_menu.settings')}</span>
                </Link>
                <div className="dropdown-divider"></div>
                <button onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i>
                  <span>{t('admin_navbar.user_menu.logout')}</span>
                </button>
              </div>
            )}
          </div>

                    {/* Selector de idioma */}
          <div className="language-selector" ref={languageMenuRef}>
            <button 
              className="language-selector-btn" 
              onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
              aria-label={t('admin_navbar.aria.select_language')}
            >
              <span className={`fi fi-${currentLanguage.flag}`}></span>
              <span className="language-text">{currentLanguage.label}</span>
              <i className={`fas fa-chevron-down language-arrow ${isLanguageMenuOpen ? 'open' : ''}`}></i>
            </button>
            
            {isLanguageMenuOpen && (
              <div className="language-dropdown">
                {languages.map((lang) => (
                  <button 
                    key={lang.code} 
                    onClick={() => toggleLanguage(lang.code)} 
                    className={`language-dropdown-item ${i18n.language === lang.code ? 'active' : ''}`}
                  >
                    <span className={`fi fi-${lang.flag}`}></span>
                    <span className="language-name">{lang.name}</span>
                    {i18n.language === lang.code && <i className="fas fa-check language-check"></i>}
                  </button>
                ))}
              </div>
            )}
          </div>


        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;