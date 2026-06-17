// src/components/profile/sections/PersonalSection.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const PersonalSection = ({ profile, onSave, saving }) => {
  const { t } = useTranslation('profile');
  const [form, setForm] = useState({ nombre: '', apellidos: '', email: '', telefono: '' });

  useEffect(() => {
    if (profile) {
      setForm({
        nombre: profile.nombre || '',
        apellidos: profile.apellidos || '',
        email: profile.email || '',
        telefono: profile.telefono || '',
      });
    }
  }, [profile]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <section className="profile-section">
      <div className="profile-section-header">
        <div className="profile-section-icon">
          <i className="fas fa-user"></i>
        </div>
        <div>
          <h3>{t('profile.personalInfo')}</h3>
          <p>{t('profile.personalInfoDescription')}</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">{t('profile.name')}</label>
            <input 
              type="text" 
              className="form-input"
              value={form.nombre} 
              onChange={(e) => setForm({ ...form, nombre: e.target.value })} 
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('profile.lastName')}</label>
            <input 
              type="text" 
              className="form-input"
              value={form.apellidos} 
              onChange={(e) => setForm({ ...form, apellidos: e.target.value })} 
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">{t('profile.email')}</label>
          <input 
            type="email" 
            className="form-input"
            value={form.email} 
            onChange={(e) => setForm({ ...form, email: e.target.value })} 
            required 
          />
        </div>
        <div className="form-group">
          <label className="form-label">{t('profile.phone')}</label>
          <input 
            type="tel" 
            className="form-input"
            value={form.telefono} 
            onChange={(e) => setForm({ ...form, telefono: e.target.value })} 
          />
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

export default PersonalSection;