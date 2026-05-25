// src/components/profile/sections/ScheduleSection.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import './ScheduleSection.css';

const ScheduleSection = ({ horario, recibeVoluntarios, urgencias24h, onUpdate, isLoading, type = 'fundacion' }) => {
  const { t } = useTranslation();

  const handleScheduleChange = (value) => {
    if (type === 'fundacion') {
      onUpdate(value, recibeVoluntarios);
    } else {
      onUpdate(value, urgencias24h);
    }
  };

  const handleCheckboxChange = (checked) => {
    if (type === 'fundacion') {
      onUpdate(horario, checked);
    } else {
      onUpdate(horario, checked);
    }
  };

  return (
    <div className="profile-section">
      <div className="section-header">
        <div className="section-icon"><i className="fas fa-clock"></i></div>
        <div className="section-info">
          <h3>{t('profile.schedule')}</h3>
          <p>{t('profile.scheduleDescription')}</p>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">{t('profile.scheduleHours')}</label>
        <textarea defaultValue={horario || ''} rows="4" className="form-textarea" onBlur={(e) => handleScheduleChange(e.target.value)} placeholder={t('profile.schedulePlaceholder')} disabled={isLoading} />
        <small className="form-hint">{t('profile.scheduleExample')}</small>
      </div>

      <div className="form-group">
        <label className="form-checkbox">
          <input type="checkbox" checked={type === 'fundacion' ? (recibeVoluntarios || false) : (urgencias24h || false)} onChange={(e) => handleCheckboxChange(e.target.checked)} disabled={isLoading} />
          <span><i className={`fas ${type === 'fundacion' ? 'fa-hands-helping' : 'fa-ambulance'} me-2`}></i>{type === 'fundacion' ? t('profile.receiveVolunteers') : t('profile.emergency24h')}</span>
        </label>
      </div>
    </div>
  );
};

export default ScheduleSection;