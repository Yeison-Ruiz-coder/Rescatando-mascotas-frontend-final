// src/components/profile/sections/VeterinarySection.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import './VeterinarySection.css';

const VeterinarySection = ({ veterinariaData, onUpdate, isLoading }) => {
  const { t } = useTranslation();

  const handleChange = (field, value) => {
    onUpdate({ [field]: value });
  };

  return (
    <div className="profile-section">
      <div className="section-header">
        <div className="section-icon"><i className="fas fa-clinic-medical"></i></div>
        <div className="section-info">
          <h3>{t('profile.veterinaryData')}</h3>
          <p>{t('profile.veterinaryDataDescription')}</p>
        </div>
      </div>

      <div className="veterinary-form">
        <div className="form-group">
          <label className="form-label">{t('profile.veterinaryName')}</label>
          <input type="text" defaultValue={veterinariaData?.Nombre_vet || ''} className="form-input" onBlur={(e) => handleChange('Nombre_vet', e.target.value)} disabled={isLoading} />
        </div>

        <div className="form-group">
          <label className="form-label">{t('profile.description')}</label>
          <textarea defaultValue={veterinariaData?.descripcion || ''} rows="4" className="form-textarea" onBlur={(e) => handleChange('descripcion', e.target.value)} placeholder={t('profile.descriptionPlaceholder')} disabled={isLoading} />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">{t('profile.yearsExperience')}</label>
            <input type="number" defaultValue={veterinariaData?.anios_experiencia || 0} className="form-input" onBlur={(e) => handleChange('anios_experiencia', parseInt(e.target.value))} disabled={isLoading} />
          </div>
          <div className="form-group">
            <label className="form-label">{t('profile.consultationPrice')}</label>
            <input type="number" step="0.01" defaultValue={veterinariaData?.precio_consulta || 0} className="form-input" onBlur={(e) => handleChange('precio_consulta', parseFloat(e.target.value))} disabled={isLoading} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">{t('profile.address')}</label>
          <input type="text" defaultValue={veterinariaData?.Direccion || ''} className="form-input" onBlur={(e) => handleChange('Direccion', e.target.value)} disabled={isLoading} />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">{t('profile.city')}</label>
            <input type="text" defaultValue={veterinariaData?.ciudad || ''} className="form-input" onBlur={(e) => handleChange('ciudad', e.target.value)} disabled={isLoading} />
          </div>
          <div className="form-group">
            <label className="form-label">{t('profile.department')}</label>
            <input type="text" defaultValue={veterinariaData?.departamento || ''} className="form-input" onBlur={(e) => handleChange('departamento', e.target.value)} disabled={isLoading} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">{t('profile.contactEmail')}</label>
          <input type="email" defaultValue={veterinariaData?.Email || ''} className="form-input" onBlur={(e) => handleChange('Email', e.target.value)} disabled={isLoading} />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">WhatsApp</label>
            <input type="text" defaultValue={veterinariaData?.whatsapp || ''} className="form-input" onBlur={(e) => handleChange('whatsapp', e.target.value)} disabled={isLoading} />
          </div>
          <div className="form-group">
            <label className="form-label">{t('profile.website')}</label>
            <input type="url" defaultValue={veterinariaData?.sitio_web || ''} className="form-input" onBlur={(e) => handleChange('sitio_web', e.target.value)} placeholder="https://..." disabled={isLoading} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-checkbox">
            <input type="checkbox" checked={veterinariaData?.acepta_seguros || false} onChange={(e) => handleChange('acepta_seguros', e.target.checked)} disabled={isLoading} />
            <span>{t('profile.acceptsInsurance')}</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default VeterinarySection;