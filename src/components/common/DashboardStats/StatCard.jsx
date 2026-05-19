import React from 'react';
import { useTranslation } from 'react-i18next';

const StatCard = ({ titleKey, title, value, icon }) => {
  const { t } = useTranslation('fundacion');
  
  const displayTitle = titleKey ? t(titleKey, title) : title;
  
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <h3>{displayTitle}</h3>
        <p>{value}</p>
      </div>
    </div>
  );
};

export default StatCard;