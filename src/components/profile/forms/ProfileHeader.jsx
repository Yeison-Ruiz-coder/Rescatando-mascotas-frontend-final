// src/components/profile/forms/ProfileHeader.jsx
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './ProfileHeader.css';

const ProfileHeader = ({ profile, onAvatarUpload, onAvatarDelete }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);

  const getRoleLabel = (tipo) => {
    const roles = { 
      user: t('roles.user'), 
      admin: t('roles.admin'), 
      fundacion: t('roles.foundation'), 
      veterinaria: t('roles.veterinary') 
    };
    return roles[tipo] || tipo;
  };

  return (
    <div className="profile-header">
      <div className="profile-header-avatar">
        <img src={profile?.avatar || '/default-avatar.png'} alt={t('profile.avatar')} />
        <button className="avatar-upload-btn" onClick={() => fileInputRef.current?.click()}>
          <i className="fas fa-camera"></i>
        </button>
        <input 
          ref={fileInputRef} 
          type="file" 
          accept="image/*" 
          onChange={(e) => e.target.files[0] && onAvatarUpload(e.target.files[0])} 
          style={{ display: 'none' }} 
        />
      </div>
      <div className="profile-header-info">
        <h2>{profile?.nombre} {profile?.apellidos}</h2>
        <p><i className="fas fa-envelope me-2"></i>{profile?.email}</p>
        <span className="role-badge">{getRoleLabel(profile?.tipo)}</span>
      </div>
      {profile?.avatar && (
        <button className="delete-avatar-btn" onClick={onAvatarDelete}>
          <i className="fas fa-trash me-2"></i>{t('profile.deleteAvatar')}
        </button>
      )}
    </div>
  );
};

export default ProfileHeader;