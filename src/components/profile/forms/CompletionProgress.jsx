// src/components/profile/forms/CompletionProgress.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import './CompletionProgress.css';

const CompletionProgress = ({ status }) => {
  const { t } = useTranslation();
  const { percentage, missing_fields, verification_status } = status;

  const getFieldLabel = (field) => {
    const labels = { 
      nombre: t('profile.name'), 
      telefono: t('profile.phone'), 
      direccion: t('profile.address'), 
      ciudad: t('profile.city'), 
      phone_verification: t('profile.phoneVerification') 
    };
    return labels[field] || field;
  };

  return (
    <div className="completion-progress">
      <div className="completion-progress-header">
        <span>{t('profile.completion')}</span>
        <span className="completion-percentage">{percentage}%</span>
      </div>
      <div className="completion-progress-bar">
        <div className="completion-progress-fill" style={{ width: `${percentage}%` }}></div>
      </div>

      {missing_fields.length > 0 && (
        <div className="completion-missing">
          <p>{t('profile.missingFields')}:</p>
          <div className="completion-missing-badges">
            {missing_fields.map(field => (
              <span key={field} className="missing-badge">{getFieldLabel(field)}</span>
            ))}
          </div>
        </div>
      )}

      <div className="completion-verification">
        <p>{t('profile.verifications')}:</p>
        <div className="completion-verification-badges">
          <span className={`verification-badge ${verification_status.email ? 'verified' : 'pending'}`}>
            <i className={`fas fa-${verification_status.email ? 'check-circle' : 'clock'}`}></i> {t('profile.email')}
          </span>
          <span className={`verification-badge ${verification_status.phone ? 'verified' : 'pending'}`}>
            <i className={`fas fa-${verification_status.phone ? 'check-circle' : 'clock'}`}></i> {t('profile.phone')}
          </span>
          <span className={`verification-badge ${verification_status.document ? 'verified' : 'pending'}`}>
            <i className={`fas fa-${verification_status.document ? 'check-circle' : 'clock'}`}></i> {t('profile.document')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CompletionProgress;