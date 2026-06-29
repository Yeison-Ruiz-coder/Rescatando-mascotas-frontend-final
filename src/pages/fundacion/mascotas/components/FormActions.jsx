// src/pages/fundacion/mascotas/components/FormActions.jsx
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './FormActions.css';

// ===== CONSTANTES =====
const ICONS = {
  prev: 'fa-arrow-left',
  next: 'fa-arrow-right',
  cancel: 'fa-times',
  save: 'fa-save',
  spinner: 'fa-spinner fa-spin',
};

// ===== COMPONENTE PRINCIPAL =====
const FormActions = ({ 
  currentStep, 
  totalSteps, 
  onPrev, 
  onNext, 
  onSubmit, 
  loading, 
  isEditMode,
  cancelUrl = '/fundacion/mascotas'
}) => {
  const { t } = useTranslation('nuevaMascota');
  const navigate = useNavigate();

  const handleCancel = useCallback(() => {
    if (window.confirm(t('confirmaciones.cancelar', { 
      defaultValue: '¿Estás seguro de que quieres cancelar? Los datos no guardados se perderán.' 
    }))) {
      navigate(cancelUrl);
    }
  }, [navigate, cancelUrl, t]);

  const isLastStep = currentStep === totalSteps;

  return (
    <div className="form-actions">
      <div className="form-actions-left">
        {currentStep > 1 && (
          <button type="button" className="btn-prev" onClick={onPrev}>
            <i className={`fas ${ICONS.prev}`}></i>
            {t('botones.anterior')}
          </button>
        )}
      </div>

      <div className="form-actions-right">
        <button type="button" className="btn-cancel" onClick={handleCancel}>
          <i className={`fas ${ICONS.cancel}`}></i>
          {t('botones.cancelar', { defaultValue: 'Cancelar' })}
        </button>
        
        {!isLastStep ? (
          <button type="button" className="btn-next" onClick={onNext}>
            {t('botones.siguiente')}
            <i className={`fas ${ICONS.next}`}></i>
          </button>
        ) : (
          <button 
            type="button"
            className="btn-submit" 
            onClick={onSubmit}
            disabled={loading}
          >
            {loading ? (
              <i className={`fas ${ICONS.spinner}`}></i>
            ) : (
              <i className={`fas ${ICONS.save}`}></i>
            )}
            {loading 
              ? ` ${t('botones.guardando')}` 
              : ` ${isEditMode ? t('botones.actualizar') : t('botones.registrar')}`}
          </button>
        )}
      </div>
    </div>
  );
};

export default FormActions;