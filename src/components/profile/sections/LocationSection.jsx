// src/components/profile/sections/LocationSection.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import LocationForm from '../forms/LocationForm';
import './LocationSection.css';

const LocationSection = ({ profile, onSubmit, isLoading }) => {
  const { t } = useTranslation();

  return (
    <div className="profile-section">
      <div className="section-header">
        <div className="section-icon"><i className="fas fa-map-marker-alt"></i></div>
        <div className="section-info">
          <h3>{t('profile.location')}</h3>
          <p>{t('profile.locationDescription')}</p>
        </div>
      </div>
      <LocationForm initialData={profile} onSubmit={onSubmit} isLoading={isLoading} />
    </div>
  );
};

export default LocationSection;