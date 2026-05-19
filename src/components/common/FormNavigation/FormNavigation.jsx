import React from 'react';
import { useTranslation } from 'react-i18next';

const FormNavigation = ({ onNext, onPrev, canNext, canPrev, nextText, prevText }) => {
  const { t } = useTranslation('common');
  
  return (
    <div className="form-navigation">
      {canPrev && (
        <button onClick={onPrev} className="btn-prev">
          {prevText || t('previous', 'Anterior')}
        </button>
      )}
      {canNext && (
        <button onClick={onNext} className="btn-next">
          {nextText || t('next', 'Siguiente')}
        </button>
      )}
    </div>
  );
};

export default FormNavigation;