// src/components/profile/layout/ProfileSidebar.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import './ProfileSidebar.css';

const ProfileSidebar = ({ activeSection, onSectionChange, role }) => {
  const { t } = useTranslation();

  const sectionsConfig = {
    admin: [
      { id: 'personal', icon: 'fas fa-user', label: 'profile.personalInfo' },
      { id: 'location', icon: 'fas fa-map-marker-alt', label: 'profile.location' },
      { id: 'social', icon: 'fas fa-share-alt', label: 'profile.socialNetworks' },
      { id: 'security', icon: 'fas fa-lock', label: 'profile.security' },
    ],
    user: [
      { id: 'personal', icon: 'fas fa-user', label: 'profile.personalInfo' },
      { id: 'location', icon: 'fas fa-map-marker-alt', label: 'profile.location' },
      { id: 'social', icon: 'fas fa-share-alt', label: 'profile.socialNetworks' },
      { id: 'verification', icon: 'fas fa-check-circle', label: 'profile.verification' },
      { id: 'preferences', icon: 'fas fa-sliders-h', label: 'profile.preferences' },
      { id: 'security', icon: 'fas fa-lock', label: 'profile.security' },
    ],
    fundacion: [
      { id: 'personal', icon: 'fas fa-user', label: 'profile.personalInfo' },
      { id: 'location', icon: 'fas fa-map-marker-alt', label: 'profile.location' },
      { id: 'social', icon: 'fas fa-share-alt', label: 'profile.socialNetworks' },
      { id: 'foundation', icon: 'fas fa-building', label: 'profile.foundationData' },
      { id: 'needs', icon: 'fas fa-heart', label: 'profile.needs' },
      { id: 'schedule', icon: 'fas fa-clock', label: 'profile.schedule' },
      { id: 'media', icon: 'fas fa-image', label: 'profile.coverImage' },
      { id: 'security', icon: 'fas fa-lock', label: 'profile.security' },
    ],
    veterinaria: [
      { id: 'personal', icon: 'fas fa-user', label: 'profile.personalInfo' },
      { id: 'location', icon: 'fas fa-map-marker-alt', label: 'profile.location' },
      { id: 'social', icon: 'fas fa-share-alt', label: 'profile.socialNetworks' },
      { id: 'veterinary', icon: 'fas fa-clinic-medical', label: 'profile.veterinaryData' },
      { id: 'services', icon: 'fas fa-stethoscope', label: 'profile.services' },
      { id: 'schedule', icon: 'fas fa-clock', label: 'profile.schedule' },
      { id: 'media', icon: 'fas fa-images', label: 'profile.logoAndGallery' },
      { id: 'security', icon: 'fas fa-lock', label: 'profile.security' },
    ],
  };

  const sections = sectionsConfig[role] || sectionsConfig.user;

  return (
    <aside className="profile-sidebar">
      <div className="sidebar-header">
        <i className="fas fa-user-circle"></i>
        <span>{t('profile.myProfile')}</span>
      </div>
      <nav className="sidebar-nav">
        {sections.map((section) => (
          <button
            key={section.id}
            className={`sidebar-item ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => onSectionChange(section.id)}
          >
            <i className={section.icon}></i>
            <span>{t(section.label)}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="account-settings">
          <i className="fas fa-cog"></i>
          <span>{t('profile.accountSettings')}</span>
        </div>
      </div>
    </aside>
  );
};

export default ProfileSidebar;