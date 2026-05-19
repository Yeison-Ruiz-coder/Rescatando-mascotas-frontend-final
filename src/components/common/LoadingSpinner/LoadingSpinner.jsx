import React from 'react';
import { useTranslation } from 'react-i18next';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'md', text, textKey }) => {
  const { t } = useTranslation('common');
  const sizeClass = {
    sm: 'spinner-sm',
    md: '',
    lg: 'spinner-lg'
  };

  const displayText = textKey ? t(textKey, text) : (text || t('loading', 'Cargando...'));

  return (
    <div className="loading-container">
      <div className={`spinner ${sizeClass[size]}`} />
      {displayText && <p className="loading-text">{displayText}</p>}
    </div>
  );
};

export default LoadingSpinner;