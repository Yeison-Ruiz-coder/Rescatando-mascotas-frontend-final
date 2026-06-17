// src/components/profile/ProfileHeader.jsx
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';

const ProfileHeader = ({ profile, onAvatarUpload, onAvatarDelete }) => {
  const { t } = useTranslation('profile');
  const fileInputRef = useRef(null);

  const getRoleLabel = (tipo) => {
    const roles = { 
      user: 'Usuario', 
      admin: 'Administrador', 
      fundacion: 'Fundación', 
      veterinaria: 'Veterinaria' 
    };
    return roles[tipo] || tipo;
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      onAvatarUpload(e.target.files[0]);
    }
  };

  return (
    <div className="profile-header">
      <div className="profile-avatar-wrapper">
        <img 
          src={profile?.avatar || '/default-avatar.png'} 
          alt={t('profile.avatar')} 
          className="profile-avatar" 
        />
        <button 
          className="profile-avatar-btn" 
          onClick={() => fileInputRef.current?.click()}
          aria-label={t('profile.changeAvatar')}
        >
          <i className="fas fa-camera"></i>
        </button>
        <input 
          ref={fileInputRef} 
          type="file" 
          accept="image/*" 
          style={{ display: 'none' }} 
          onChange={handleFileChange} 
        />
      </div>

      <div className="profile-header-info">
        <h1>{profile?.nombre} {profile?.apellidos}</h1>
        <p>
          <i className="fas fa-envelope"></i> {profile?.email}
        </p>
        <span className="profile-role-badge">
          {getRoleLabel(profile?.tipo)}
        </span>
      </div>

      {profile?.avatar && (
        <button 
          className="profile-avatar-delete" 
          onClick={onAvatarDelete}
        >
          <i className="fas fa-trash"></i> {t('profile.deleteAvatar')}
        </button>
      )}
    </div>
  );
};

export default ProfileHeader;