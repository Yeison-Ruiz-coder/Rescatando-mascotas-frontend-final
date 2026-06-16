// src/components/profile/sections/LogoSection.jsx
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';

const LogoSection = ({ logo, onUploadLogo, onDeleteLogo, saving }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      onUploadLogo(e.target.files[0]);
    }
  };

  return (
    <section className="profile-section">
      <div className="profile-section-header">
        <div className="profile-section-icon">
          <i className="fas fa-image"></i>
        </div>
        <div>
          <h3>{t('profile.logo')}</h3>
          <p>{t('profile.logoDescription')}</p>
        </div>
      </div>

      <div className="profile-form-group">
        <label>{t('profile.logo')}</label>
        <div className="profile-logo-section">
          {logo && (
            <div className="profile-logo-preview">
              <img src={logo} alt={t('profile.logo')} />
              <button 
                className="profile-logo-delete" 
                onClick={onDeleteLogo} 
                disabled={saving}
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
          )}
          <div 
            className="profile-upload-area small" 
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={handleFileChange} 
              disabled={saving} 
            />
            <i className="fas fa-cloud-upload-alt"></i>
            <span>{logo ? t('profile.changeLogo') : t('profile.uploadLogo')}</span>
          </div>
        </div>
        <small className="profile-form-hint">{t('profile.logoHint')}</small>
      </div>
    </section>
  );
};

export default LogoSection;