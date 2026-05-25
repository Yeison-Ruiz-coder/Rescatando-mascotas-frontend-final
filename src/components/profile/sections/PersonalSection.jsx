// src/components/profile/sections/PersonalSection.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import PersonalInfoForm from '../forms/PersonalInfoForm';
import './PersonalSection.css';

const PersonalSection = ({ profile, onSubmit, isLoading }) => {
  const { t } = useTranslation();

  return (
    <div className="profile-section">
      <div className="section-header">
        <div className="section-icon"><i className="fas fa-user"></i></div>
        <div className="section-info">
          <h3>{t('profile.personalInfo')}</h3>
          <p>{t('profile.personalInfoDescription')}</p>
        </div>
      </div>
      <PersonalInfoForm initialData={profile} onSubmit={onSubmit} isLoading={isLoading} />
    </div>
  );
};

export default PersonalSection;