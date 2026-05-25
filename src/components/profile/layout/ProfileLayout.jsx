// src/components/profile/layout/ProfileLayout.jsx
import React from 'react';
import ProfileSidebar from './ProfileSidebar';
import ProfileHeader from '../forms/ProfileHeader';
import './ProfileLayout.css';

const ProfileLayout = ({ 
  children, 
  activeSection, 
  onSectionChange, 
  role, 
  profile, 
  onAvatarUpload, 
  onAvatarDelete,
  title,
  description
}) => {
  return (
    <div className="profile-layout-page">
      <div className="profile-layout-container">
        <div className="profile-layout-header">
          <h1>{title}</h1>
          <p>{description}</p>
        </div>

        <div className="profile-layout-grid">
          <ProfileSidebar
            activeSection={activeSection}
            onSectionChange={onSectionChange}
            role={role}
          />

          <main className="profile-layout-content">
            <div className="profile-header-wrapper">
              <ProfileHeader
                profile={profile}
                onAvatarUpload={onAvatarUpload}
                onAvatarDelete={onAvatarDelete}
              />
            </div>
            <div className="profile-section-wrapper">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProfileLayout;