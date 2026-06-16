// src/components/profile/sections/VeterinarySection.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const VeterinarySection = ({ veterinariaData, onUpdate, saving }) => {
  const { t } = useTranslation();
  const [form, setForm] = useState({});

  useEffect(() => {
    if (veterinariaData) {
      setForm(veterinariaData);
    }
  }, [veterinariaData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(form);
  };

  return (
    <section className="profile-section">
      <div className="profile-section-header">
        <div className="profile-section-icon">
          <i className="fas fa-clinic-medical"></i>
        </div>
        <div>
          <h3>{t('profile.veterinaryData')}</h3>
          <p>{t('profile.veterinaryDataDescription')}</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="profile-form-group">
          <label>{t('profile.veterinaryName')}</label>
          <input 
            type="text" 
            value={form.Nombre_vet || ''} 
            onChange={(e) => setForm({ ...form, Nombre_vet: e.target.value })} 
          />
        </div>
        <div className="profile-form-group">
          <label>{t('profile.description')}</label>
          <textarea 
            value={form.descripcion || ''} 
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })} 
            rows="4" 
          />
        </div>
        <div className="profile-form-row">
          <div className="profile-form-group">
            <label>{t('profile.yearsExperience')}</label>
            <input 
              type="number" 
              value={form.anios_experiencia || 0} 
              onChange={(e) => setForm({ ...form, anios_experiencia: parseInt(e.target.value) || 0 })} 
            />
          </div>
          <div className="profile-form-group">
            <label>{t('profile.consultationPrice')}</label>
            <input 
              type="number" 
              step="0.01" 
              value={form.precio_consulta || 0} 
              onChange={(e) => setForm({ ...form, precio_consulta: parseFloat(e.target.value) || 0 })} 
            />
          </div>
        </div>
        <div className="profile-form-group">
          <label>{t('profile.address')}</label>
          <input 
            type="text" 
            value={form.Direccion || ''} 
            onChange={(e) => setForm({ ...form, Direccion: e.target.value })} 
          />
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

export default VeterinarySection;