// src/components/fundacion/mascotas/FormActions.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const FormActions = ({ currentStep, totalSteps, onPrev, onNext, onSubmit, loading, isEditMode }) => {
  const { t } = useTranslation('nuevaMascota');

  return (
    <div className="form-actions">
      {currentStep > 1 && (
        <button type="button" className="btn-prev" onClick={onPrev}>
          <i className="fas fa-arrow-left"></i> {t('botones.anterior')}
        </button>
      )}
      
      {currentStep < totalSteps ? (
        <button type="button" className="btn-next" onClick={onNext}>
          {t('botones.siguiente')} <i className="fas fa-arrow-right"></i>
        </button>
      ) : (
        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
          {loading 
            ? ` ${t('botones.guardando')}` 
            : ` ${isEditMode ? t('botones.actualizar') : t('botones.registrar')}`}
        </button>
      )}
    </div>
  );
};

export default FormActions;