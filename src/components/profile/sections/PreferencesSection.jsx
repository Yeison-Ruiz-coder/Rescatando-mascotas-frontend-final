// src/components/profile/sections/PreferencesSection.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const PreferencesSection = ({ profile, onSave, saving }) => {
  const { t } = useTranslation('profile');
  const [form, setForm] = useState({ 
    idioma: 'es', 
    tema: 'light', 
    notificaciones: { email: true, push: true, sms: false } 
  });

  useEffect(() => {
    if (profile) {
      setForm({
        idioma: profile.idioma || 'es',
        tema: profile.tema || 'light',
        notificaciones: profile.preferencias_notificaciones || { email: true, push: true, sms: false },
      });
    }
  }, [profile]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  const handleThemeChange = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    setForm({ ...form, tema: theme });
  };

  return (
    <section className="profile-section">
      <div className="profile-section-header">
        <div className="profile-section-icon">
          <i className="fas fa-sliders-h"></i>
        </div>
        <div>
          <h3>{t('profile.preferences')}</h3>
          <p>{t('profile.preferencesDescription')}</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label className="form-label">{t('profile.language')}</label>
          <div className="btn-group">
            <button 
              type="button" 
              className={`btn btn-outline ${form.idioma === 'es' ? 'active' : ''}`} 
              onClick={() => setForm({ ...form, idioma: 'es' })}
            >
              <i className="fas fa-flag"></i> Español
            </button>
            <button 
              type="button" 
              className={`btn btn-outline ${form.idioma === 'en' ? 'active' : ''}`} 
              onClick={() => setForm({ ...form, idioma: 'en' })}
            >
              <i className="fas fa-flag-us"></i> English
            </button>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">{t('profile.theme')}</label>
          <div className="btn-group">
            <button 
              type="button" 
              className={`btn btn-outline ${form.tema === 'light' ? 'active' : ''}`} 
              onClick={() => handleThemeChange('light')}
            >
              <i className="fas fa-sun"></i> {t('profile.light')}
            </button>
            <button 
              type="button" 
              className={`btn btn-outline ${form.tema === 'dark' ? 'active' : ''}`} 
              onClick={() => handleThemeChange('dark')}
            >
              <i className="fas fa-moon"></i> {t('profile.dark')}
            </button>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">{t('profile.notifications')}</label>
          <div className="form-checkboxes">
            <label className="form-checkbox">
              <input 
                type="checkbox" 
                checked={form.notificaciones.email} 
                onChange={(e) => setForm({ 
                  ...form, 
                  notificaciones: { ...form.notificaciones, email: e.target.checked } 
                })} 
              />
              <span>{t('profile.emailNotifications')}</span>
            </label>
            <label className="form-checkbox">
              <input 
                type="checkbox" 
                checked={form.notificaciones.push} 
                onChange={(e) => setForm({ 
                  ...form, 
                  notificaciones: { ...form.notificaciones, push: e.target.checked } 
                })} 
              />
              <span>{t('profile.pushNotifications')}</span>
            </label>
            <label className="form-checkbox">
              <input 
                type="checkbox" 
                checked={form.notificaciones.sms} 
                onChange={(e) => setForm({ 
                  ...form, 
                  notificaciones: { ...form.notificaciones, sms: e.target.checked } 
                })} 
              />
              <span>{t('profile.smsNotifications')}</span>
            </label>
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? (
              <><i className="fas fa-spinner fa-spin"></i> {t('common.saving')}</>
            ) : (
              t('common.save')
            )}
          </button>
        </div>
      </form>
    </section>
  );
};

export default PreferencesSection;