// src/components/profile/sections/ScheduleSection.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const ScheduleSection = ({ horario, extra, onUpdate, saving, type }) => {
  const { t } = useTranslation('profile');
  const [form, setForm] = useState({ horario: '', extra: false });

  useEffect(() => {
    setForm({ horario: horario || '', extra: extra || false });
  }, [horario, extra]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(form.horario, form.extra);
  };

  const label = type === 'fundacion' ? 'recibeVoluntarios' : 'emergency24h';
  const icon = type === 'fundacion' ? 'fa-hands-helping' : 'fa-ambulance';

  return (
    <section className="profile-section">
      <div className="profile-section-header">
        <div className="profile-section-icon">
          <i className="fas fa-clock"></i>
        </div>
        <div>
          <h3>{t('profile.schedule')}</h3>
          <p>{t('profile.scheduleDescription')}</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label className="form-label">{t('profile.scheduleHours')}</label>
          <textarea 
            className="form-textarea"
            rows="4" 
            value={form.horario} 
            onChange={(e) => setForm({ ...form, horario: e.target.value })} 
            placeholder={t('profile.schedulePlaceholder')} 
          />
          <span className="form-hint">{t('profile.scheduleExample')}</span>
        </div>
        <div className="form-group">
          <label className="form-checkbox">
            <input 
              type="checkbox" 
              checked={form.extra} 
              onChange={(e) => setForm({ ...form, extra: e.target.checked })} 
              disabled={saving} 
            />
            <span>
              <i className={`fas ${icon}`}></i> {t(`profile.${label}`)}
            </span>
          </label>
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

export default ScheduleSection;