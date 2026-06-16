// src/components/profile/sections/FoundationSection.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const FoundationSection = ({ fundacionData, onUpdate, saving }) => {
  const { t } = useTranslation();
  const [form, setForm] = useState({});

  useEffect(() => {
    if (fundacionData) {
      setForm(fundacionData);
    }
  }, [fundacionData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(form);
  };

  return (
    <section className="profile-section">
      <div className="profile-section-header">
        <div className="profile-section-icon">
          <i className="fas fa-building"></i>
        </div>
        <div>
          <h3>{t('profile.foundationData')}</h3>
          <p>{t('profile.foundationDataDescription')}</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="profile-form-group">
          <label>{t('profile.foundationName')}</label>
          <input 
            type="text" 
            value={form.Nombre_1 || ''} 
            onChange={(e) => setForm({ ...form, Nombre_1: e.target.value })} 
          />
        </div>
        <div className="profile-form-group">
          <label>{t('profile.contactEmail')}</label>
          <input 
            type="email" 
            value={form.Email || ''} 
            onChange={(e) => setForm({ ...form, Email: e.target.value })} 
          />
        </div>
        <div className="profile-form-group">
          <label>{t('profile.foundationAddress')}</label>
          <input 
            type="text" 
            value={form.Direccion || ''} 
            onChange={(e) => setForm({ ...form, Direccion: e.target.value })} 
          />
        </div>
        <div className="profile-form-group">
          <label>{t('profile.healthRegistry')}</label>
          <input 
            type="text" 
            value={form.registro_sanitario || ''} 
            onChange={(e) => setForm({ ...form, registro_sanitario: e.target.value })} 
          />
        </div>
        <div className="profile-form-row">
          <div className="profile-form-group">
            <label>{t('profile.maxCapacity')}</label>
            <input 
              type="number" 
              value={form.capacidad_maxima || 0} 
              onChange={(e) => setForm({ ...form, capacidad_maxima: parseInt(e.target.value) || 0 })} 
            />
          </div>
          <div className="profile-form-group">
            <label>{t('profile.foundationDate')}</label>
            <input 
              type="date" 
              value={form.fecha_fundacion || ''} 
              onChange={(e) => setForm({ ...form, fecha_fundacion: e.target.value })} 
            />
          </div>
        </div>
        <div className="profile-form-actions">
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

export default FoundationSection;