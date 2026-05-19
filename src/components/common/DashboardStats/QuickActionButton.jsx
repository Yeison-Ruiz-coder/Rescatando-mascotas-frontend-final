import React from 'react';
import { useTranslation } from 'react-i18next';

const QuickActionButton = ({ labelKey, label, onClick }) => {
  const { t } = useTranslation('fundacion');
  
  const displayText = labelKey ? t(labelKey, label) : label;
  
  return (
    <button className="quick-action-btn" onClick={onClick}>
      {displayText}
    </button>
  );
};

export default QuickActionButton;