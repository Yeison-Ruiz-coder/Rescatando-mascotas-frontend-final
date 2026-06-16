// src/components/profile/ProfileContainer.jsx
import React from 'react';
import { ProfileHeader, ProfileSidebar } from './index';
import './Profile.css';

const ProfileContainer = ({ 
  children, 
  profile, 
  onAvatarUpload, 
  onAvatarDelete,
  activeSection,
  onSectionChange,
  role,
  loading 
}) => {
  if (loading && !profile) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-loading">
            <div className="profile-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <ProfileHeader 
          profile={profile} 
          onAvatarUpload={onAvatarUpload} 
          onAvatarDelete={onAvatarDelete}
        />

        <div className="profile-grid">
          <ProfileSidebar 
            activeSection={activeSection} 
            onSectionChange={onSectionChange} 
            role={role} 
          />

          <div className="profile-content">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileContainer;