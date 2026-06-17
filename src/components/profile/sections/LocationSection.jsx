// src/components/profile/sections/LocationSection.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LocationSection = ({ profile, onSave, saving }) => {
  const { t } = useTranslation('profile');
  const [form, setForm] = useState({ direccion: '', ciudad: '', pais: '', codigo_postal: '' });

  useEffect(() => {
    if (profile) {
      setForm({
        direccion: profile.direccion || '',
        ciudad: profile.ciudad || '',
        pais: profile.pais || '',
        codigo_postal: profile.codigo_postal || '',
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
          <i className="fas fa-map-marker-alt"></i>
        </div>
        <div>
          <h3>{t('profile.location')}</h3>
          <p>{t('profile.locationDescription')}</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label className="form-label">{t('profile.address')}</label>
          <input 
            type="text" 
            className="form-input"
            value={form.direccion} 
            onChange={(e) => setForm({ ...form, direccion: e.target.value })} 
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">{t('profile.city')}</label>
            <input 
              type="text" 
              className="form-input"
              value={form.ciudad} 
              onChange={(e) => setForm({ ...form, ciudad: e.target.value })} 
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('profile.country')}</label>
            <input 
              type="text" 
              className="form-input"
              value={form.pais} 
              onChange={(e) => setForm({ ...form, pais: e.target.value })} 
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">{t('profile.postalCode')}</label>
          <input 
            type="text" 
            className="form-input"
            value={form.codigo_postal} 
            onChange={(e) => setForm({ ...form, codigo_postal: e.target.value })} 
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

export default LocationSection;