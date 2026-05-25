// src/components/profile/sections/PreferencesSection.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import PreferencesForm from '../forms/PreferencesForm';
import './PreferencesSection.css';

const PreferencesSection = ({ profile, onSubmit, isLoading }) => {
  const { t } = useTranslation();

  return (
    <div className="profile-section">
      <div className="section-header">
        <div className="section-icon"><i className="fas fa-sliders-h"></i></div>
        <div className="section-info">
          <h3>{t('profile.preferences')}</h3>
          <p>{t('profile.preferencesDescription')}</p>
        </div>
      </div>
      <PreferencesForm initialData={profile} onSubmit={onSubmit} isLoading={isLoading} />
    </div>
  );
};

export default PreferencesSection;