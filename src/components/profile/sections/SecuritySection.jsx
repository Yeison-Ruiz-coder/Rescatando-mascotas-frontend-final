// src/components/profile/sections/SecuritySection.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ChangePasswordModal from '../forms/ChangePasswordModal';
import './SecuritySection.css';

const SecuritySection = ({ onChangePassword, isLoading }) => {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="profile-section">
      <div className="section-header">
        <div className="section-icon"><i className="fas fa-shield-alt"></i></div>
        <div className="section-info">
          <h3>{t('profile.security')}</h3>
          <p>{t('profile.securityDescription')}</p>
        </div>
      </div>

      <div className="security-card">
        <div className="security-icon"><i className="fas fa-key"></i></div>
        <div className="security-info">
          <h4>{t('profile.changePassword')}</h4>
          <p>{t('profile.securityInfo')}</p>
        </div>
        <button className="btn-outline-global btn-sm" onClick={() => setShowModal(true)}>
          <i className="fas fa-edit me-2"></i>{t('profile.changePassword')}
        </button>
      </div>

      <div className="security-card">
        <div className="security-icon"><i className="fas fa-mobile-alt"></i></div>
        <div className="security-info">
          <h4>{t('profile.twoFactorAuth')}</h4>
          <p>{t('profile.twoFactorDescription')}</p>
        </div>
        <button className="btn-outline-global btn-sm" disabled>{t('profile.comingSoon')}</button>
      </div>

      {showModal && <ChangePasswordModal onSubmit={onChangePassword} onClose={() => setShowModal(false)} isLoading={isLoading} />}
    </div>
  );
};

export default SecuritySection;