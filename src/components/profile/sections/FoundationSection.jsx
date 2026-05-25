// src/components/profile/sections/FoundationSection.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import './FoundationSection.css';

const FoundationSection = ({ fundacionData, onUpdate, isLoading }) => {
  const { t } = useTranslation();

  const handleChange = (field, value) => {
    onUpdate({ [field]: value });
  };

  return (
    <div className="profile-section">
      <div className="section-header">
        <div className="section-icon"><i className="fas fa-building"></i></div>
        <div className="section-info">
          <h3>{t('profile.foundationData')}</h3>
          <p>{t('profile.foundationDataDescription')}</p>
        </div>
      </div>

      <div className="foundation-form">
        <div className="form-group">
          <label className="form-label">{t('profile.foundationName')}</label>
          <input type="text" defaultValue={fundacionData?.Nombre_1 || ''} className="form-input" onBlur={(e) => handleChange('Nombre_1', e.target.value)} disabled={isLoading} />
        </div>

        <div className="form-group">
          <label className="form-label">{t('profile.contactEmail')}</label>
          <input type="email" defaultValue={fundacionData?.Email || ''} className="form-input" onBlur={(e) => handleChange('Email', e.target.value)} disabled={isLoading} />
        </div>

        <div className="form-group">
          <label className="form-label">{t('profile.foundationAddress')}</label>
          <input type="text" defaultValue={fundacionData?.Direccion || ''} className="form-input" onBlur={(e) => handleChange('Direccion', e.target.value)} disabled={isLoading} />
        </div>

        <div className="form-group">
          <label className="form-label">{t('profile.healthRegistry')}</label>
          <input type="text" defaultValue={fundacionData?.registro_sanitario || ''} className="form-input" onBlur={(e) => handleChange('registro_sanitario', e.target.value)} disabled={isLoading} />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">{t('profile.maxCapacity')}</label>
            <input type="number" defaultValue={fundacionData?.capacidad_maxima || 0} className="form-input" onBlur={(e) => handleChange('capacidad_maxima', parseInt(e.target.value))} disabled={isLoading} />
          </div>
          <div className="form-group">
            <label className="form-label">{t('profile.foundationDate')}</label>
            <input type="date" defaultValue={fundacionData?.fecha_fundacion || ''} className="form-input" onBlur={(e) => handleChange('fecha_fundacion', e.target.value)} disabled={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoundationSection;