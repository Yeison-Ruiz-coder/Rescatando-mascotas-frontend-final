// src/components/profile/sections/VerificationSection.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import PhoneVerification from '../forms/PhoneVerification';
import './VerificationSection.css';

const VerificationSection = ({ profile, onSendCode, onVerify }) => {
  const { t } = useTranslation();

  return (
    <div className="profile-section">
      <div className="section-header">
        <div className="section-icon"><i className="fas fa-check-circle"></i></div>
        <div className="section-info">
          <h3>{t('profile.verification')}</h3>
          <p>{t('profile.verificationDescription')}</p>
        </div>
      </div>

      <div className="verification-card verified">
        <div className="verification-icon"><i className="fas fa-envelope"></i></div>
        <div className="verification-info">
          <h4>{t('profile.emailVerification')}</h4>
          <p>{profile?.email}</p>
        </div>
        <span className="badge bg-success"><i className="fas fa-check-circle me-1"></i>{t('profile.verified')}</span>
      </div>

      <div className="verification-card">
        <div className="verification-icon"><i className="fas fa-phone"></i></div>
        <div className="verification-info">
          <h4>{t('profile.phoneVerification')}</h4>
          <p>{profile?.telefono || t('profile.noPhoneRegistered')}</p>
        </div>
        {profile?.telefono_verificado ? (
          <span className="badge bg-success"><i className="fas fa-check-circle me-1"></i>{t('profile.verified')}</span>
        ) : (
          <PhoneVerification phone={profile?.telefono} onSendCode={onSendCode} onVerify={onVerify} />
        )}
      </div>

      <div className="verification-card">
        <div className="verification-icon"><i className="fas fa-id-card"></i></div>
        <div className="verification-info">
          <h4>{t('profile.documentVerification')}</h4>
          <p>{t('profile.documentDescription')}</p>
        </div>
        <button className="btn-outline-global btn-sm"><i className="fas fa-upload me-2"></i>{t('profile.uploadDocument')}</button>
      </div>
    </div>
  );
};

export default VerificationSection;