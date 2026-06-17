// src/components/profile/sections/CoverImageSection.jsx
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';

const CoverImageSection = ({ coverImage, onUploadCover, onDeleteCover, saving }) => {
  const { t } = useTranslation('profile');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      onUploadCover(e.target.files[0]);
    }
  };

  return (
    <section className="profile-section">
      <div className="profile-section-header">
        <div className="profile-section-icon">
          <i className="fas fa-image"></i>
        </div>
        <div>
          <h3>{t('profile.coverImage')}</h3>
          <p>{t('profile.coverImageDescription')}</p>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">{t('profile.coverImage')}</label>
        {coverImage && (
          <div className="profile-cover-preview">
            <img src={coverImage} alt={t('profile.coverImage')} />
            <button 
              className="profile-cover-delete" 
              onClick={onDeleteCover} 
              disabled={saving}
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
        )}
        <div 
          className="profile-upload-area" 
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
          <span>{coverImage ? t('profile.changeCover') : t('profile.uploadCover')}</span>
          <small>{t('profile.coverHint')}</small>
        </div>
      </div>
    </section>
  );
};

export default CoverImageSection;