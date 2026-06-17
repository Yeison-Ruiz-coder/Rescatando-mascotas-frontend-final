// src/components/profile/ProfileSidebar.jsx
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const ProfileSidebar = ({ activeSection, onSectionChange, role }) => {
  const { t } = useTranslation('profile');

  const sectionsConfig = useMemo(() => ({
    user: [
      { id: 'personal', icon: 'fa-user', label: t('profile.personalInfo') },
      { id: 'location', icon: 'fa-map-marker-alt', label: t('profile.location') },
      { id: 'social', icon: 'fa-share-alt', label: t('profile.socialNetworks') },
      { id: 'verification', icon: 'fa-check-circle', label: t('profile.verification') },
      { id: 'preferences', icon: 'fa-sliders-h', label: t('profile.preferences') },
      { id: 'security', icon: 'fa-lock', label: t('profile.security') },
    ],
    admin: [
      { id: 'personal', icon: 'fa-user', label: t('profile.personalInfo') },
      { id: 'location', icon: 'fa-map-marker-alt', label: t('profile.location') },
      { id: 'social', icon: 'fa-share-alt', label: t('profile.socialNetworks') },
      { id: 'security', icon: 'fa-lock', label: t('profile.security') },
    ],
    fundacion: [
      { id: 'personal', icon: 'fa-user', label: t('profile.personalInfo') },
      { id: 'location', icon: 'fa-map-marker-alt', label: t('profile.location') },
      { id: 'social', icon: 'fa-share-alt', label: t('profile.socialNetworks') },
      { id: 'foundation', icon: 'fa-building', label: t('profile.foundationData') },
      { id: 'needs', icon: 'fa-heart', label: t('profile.needs') },
      { id: 'schedule', icon: 'fa-clock', label: t('profile.schedule') },
      { id: 'cover', icon: 'fa-image', label: t('profile.coverImage') },
      { id: 'security', icon: 'fa-lock', label: t('profile.security') },
    ],
    veterinaria: [
      { id: 'personal', icon: 'fa-user', label: t('profile.personalInfo') },
      { id: 'location', icon: 'fa-map-marker-alt', label: t('profile.location') },
      { id: 'social', icon: 'fa-share-alt', label: t('profile.socialNetworks') },
      { id: 'veterinary', icon: 'fa-clinic-medical', label: t('profile.veterinaryData') },
      { id: 'services', icon: 'fa-stethoscope', label: t('profile.services') },
      { id: 'schedule', icon: 'fa-clock', label: t('profile.schedule') },
      { id: 'logo', icon: 'fa-image', label: t('profile.logo') },
      { id: 'security', icon: 'fa-lock', label: t('profile.security') },
    ],
  }), [t]);

  const sections = sectionsConfig[role] || sectionsConfig.user;

  return (
    <aside className="profile-sidebar">
      <div className="profile-sidebar-header">
        <i className="fas fa-user-circle"></i>
        <span>{t('profile.myProfile')}</span>
      </div>
      <nav className="profile-sidebar-nav">
        {sections.map((section) => (
          <button
            key={section.id}
            className={`profile-sidebar-item ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => onSectionChange(section.id)}
          >
            <i className={`fas ${section.icon}`}></i>
            <span>{section.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default ProfileSidebar;