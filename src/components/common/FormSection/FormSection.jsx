import React from 'react';
import { useTranslation } from 'react-i18next';
import './FormSection.css';

const FormSection = ({ titleKey, title, icon, children }) => {
  const { t } = useTranslation(['nuevaMascota', 'mascotas']);
  
  const displayTitle = titleKey ? t(titleKey, title) : title;
  
  return (
    <div className="form-section">
      <div className="form-section-header">
        <i className={`fas fa-${icon}`}></i>
        <h3>{displayTitle}</h3>
      </div>
      <div className="form-section-body">
        {children}
      </div>
    </div>
  );
};

export default FormSection;