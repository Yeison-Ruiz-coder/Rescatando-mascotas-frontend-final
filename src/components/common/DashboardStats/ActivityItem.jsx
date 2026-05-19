import React from 'react';
import { useTranslation } from 'react-i18next';

const ActivityItem = ({ activity }) => {
  const { t } = useTranslation('fundacion');
  
  // Si activity es un objeto con clave de traducción
  if (typeof activity === 'object' && activity.key) {
    return (
      <div className="activity-item">
        <p>{t(activity.key, activity.defaultValue || '')}</p>
      </div>
    );
  }
  
  // Si es string directamente
  return (
    <div className="activity-item">
      <p>{activity}</p>
    </div>
  );
};

export default ActivityItem;