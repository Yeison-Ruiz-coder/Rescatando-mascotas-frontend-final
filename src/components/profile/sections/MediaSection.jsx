// src/components/profile/sections/MediaSection.jsx
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './MediaSection.css';

const MediaSection = ({ 
  type, coverImage, logo, gallery = [], onUploadCover, onDeleteCover, onUploadLogo, onDeleteLogo, onAddGalleryPhotos, onRemoveGalleryPhoto, isLoading 
}) => {
  const { t } = useTranslation();
  const coverInputRef = useRef(null);
  const logoInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const isFoundation = type === 'fundacion';
  const isVeterinary = type === 'veterinaria';

  return (
    <div className="profile-section">
      <div className="section-header">
        <div className="section-icon"><i className="fas fa-images"></i></div>
        <div className="section-info">
          <h3>{isFoundation ? t('profile.coverImage') : t('profile.logoAndGallery')}</h3>
          <p>{isFoundation ? t('profile.coverImageDescription') : t('profile.mediaDescription')}</p>
        </div>
      </div>

      {isFoundation && (
        <div className="form-group">
          <label className="form-label">{t('profile.coverImage')}</label>
          {coverImage && (
            <div className="cover-preview">
              <img src={coverImage} alt="Cover" />
              <button className="cover-delete" onClick={onDeleteCover} disabled={isLoading}><i className="fas fa-trash"></i></button>
            </div>
          )}
          <div className="upload-area" onClick={() => coverInputRef.current?.click()}>
            <input ref={coverInputRef} type="file" accept="image/*" className="d-none" onChange={(e) => e.target.files[0] && onUploadCover(e.target.files[0])} disabled={isLoading} />
            <i className="fas fa-cloud-upload-alt"></i>
            <span>{coverImage ? t('profile.changeCover') : t('profile.uploadCover')}</span>
            <small>{t('profile.coverHint')}</small>
          </div>
        </div>
      )}

      {isVeterinary && (
        <>
          <div className="form-group">
            <label className="form-label">{t('profile.logo')}</label>
            <div className="logo-section">
              {logo && (
                <div className="logo-preview">
                  <img src={logo} alt="Logo" />
                  <button className="logo-delete" onClick={onDeleteLogo} disabled={isLoading}><i className="fas fa-trash"></i></button>
                </div>
              )}
              <div className="upload-area small" onClick={() => logoInputRef.current?.click()}>
                <input ref={logoInputRef} type="file" accept="image/*" className="d-none" onChange={(e) => e.target.files[0] && onUploadLogo(e.target.files[0])} disabled={isLoading} />
                <i className="fas fa-cloud-upload-alt"></i>
                <span>{logo ? t('profile.changeLogo') : t('profile.uploadLogo')}</span>
              </div>
            </div>
            <small className="form-hint">{t('profile.logoHint')}</small>
          </div>

          <div className="form-group">
            <label className="form-label">{t('profile.gallery')}</label>
            {gallery.length > 0 && (
              <div className="gallery-grid">
                {gallery.map((photo, index) => (
                  <div key={index} className="gallery-item">
                    <img src={photo} alt={`Gallery ${index}`} />
                    <button className="gallery-delete" onClick={() => onRemoveGalleryPhoto(photo)} disabled={isLoading}><i className="fas fa-times"></i></button>
                  </div>
                ))}
              </div>
            )}
            <div className="upload-area" onClick={() => galleryInputRef.current?.click()}>
              <input ref={galleryInputRef} type="file" accept="image/*" multiple className="d-none" onChange={(e) => e.target.files.length && onAddGalleryPhotos(Array.from(e.target.files))} disabled={isLoading} />
              <i className="fas fa-images"></i>
              <span>{t('profile.addGalleryPhotos')}</span>
              <small>{t('profile.galleryHint')}</small>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MediaSection;