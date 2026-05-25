// src/components/profile/forms/PreferencesForm.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './PreferencesForm.css';

const PreferencesForm = ({ initialData, onSubmit, isLoading }) => {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({
    idioma: 'es',
    tema: 'light',
    preferencias_notificaciones: { email: true, push: true, sms: false }
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        idioma: initialData.idioma || 'es',
        tema: initialData.tema || 'light',
        preferencias_notificaciones: initialData.preferencias_notificaciones || { email: true, push: true, sms: false }
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        preferencias_notificaciones: { ...formData.preferencias_notificaciones, [name]: checked }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    setFormData({ ...formData, idioma: lang });
  };

  const handleThemeChange = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    setFormData({ ...formData, tema: theme });
  };

  return (
    <form onSubmit={handleSubmit} className="preferences-form">
      <div className="form-group">
        <label className="form-label">{t('profile.language')}</label>
        <div className="preferences-buttons">
          <button type="button" className={`btn-${formData.idioma === 'es' ? 'primary' : 'outline'}-global btn-sm`} onClick={() => handleLanguageChange('es')}>
            <i className="fas fa-flag me-2"></i>Español
          </button>
          <button type="button" className={`btn-${formData.idioma === 'en' ? 'primary' : 'outline'}-global btn-sm`} onClick={() => handleLanguageChange('en')}>
            <i className="fas fa-flag-us me-2"></i>English
          </button>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">{t('profile.theme')}</label>
        <div className="preferences-buttons">
          <button type="button" className={`btn-${formData.tema === 'light' ? 'primary' : 'outline'}-global btn-sm`} onClick={() => handleThemeChange('light')}>
            <i className="fas fa-sun me-2"></i>{t('profile.light')}
          </button>
          <button type="button" className={`btn-${formData.tema === 'dark' ? 'primary' : 'outline'}-global btn-sm`} onClick={() => handleThemeChange('dark')}>
            <i className="fas fa-moon me-2"></i>{t('profile.dark')}
          </button>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">{t('profile.notifications')}</label>
        <div className="preferences-checkboxes">
          <label className="form-checkbox">
            <input type="checkbox" name="email" checked={formData.preferencias_notificaciones.email} onChange={handleChange} />
            <span>{t('profile.emailNotifications')}</span>
          </label>
          <label className="form-checkbox">
            <input type="checkbox" name="push" checked={formData.preferencias_notificaciones.push} onChange={handleChange} />
            <span>{t('profile.pushNotifications')}</span>
          </label>
          <label className="form-checkbox">
            <input type="checkbox" name="sms" checked={formData.preferencias_notificaciones.sms} onChange={handleChange} />
            <span>{t('profile.smsNotifications')}</span>
          </label>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary-global" disabled={isLoading}>
          {isLoading ? t('common.saving') : t('common.save')}
        </button>
      </div>
    </form>
  );
};

export default PreferencesForm;