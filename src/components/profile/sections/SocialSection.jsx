// src/components/profile/sections/SocialSection.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import SocialNetworksForm from '../forms/SocialNetworksForm';
import './SocialSection.css';

const SocialSection = ({ profile, onSubmit, isLoading }) => {
  const { t } = useTranslation();

  return (
    <div className="profile-section">
      <div className="section-header">
        <div className="section-icon"><i className="fas fa-share-alt"></i></div>
        <div className="section-info">
          <h3>{t('profile.socialNetworks')}</h3>
          <p>{t('profile.socialNetworksDescription')}</p>
        </div>
      </div>
      <SocialNetworksForm initialData={profile?.redes_sociales || {}} onSubmit={onSubmit} isLoading={isLoading} />
    </div>
  );
};

export default SocialSection;