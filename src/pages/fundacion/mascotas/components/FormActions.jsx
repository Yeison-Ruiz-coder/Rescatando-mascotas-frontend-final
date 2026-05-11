// src/pages/fundacion/mascotas/components/FormActions.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './FormActions.css';

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

  const handleCancel = () => {
    if (window.confirm(t('confirmaciones.cancelar', { defaultValue: '¿Estás seguro de que quieres cancelar? Los datos no guardados se perderán.' }))) {
      navigate(cancelUrl);
    }
  };

  const isLastStep = currentStep === totalSteps;

  return (
    <div className="form-actions">
      <div className="form-actions-left">
        {currentStep > 1 && (
          <button type="button" className="btn-prev" onClick={onPrev}>
            <i className="fas fa-arrow-left"></i> {t('botones.anterior')}
          </button>
        )}
      </div>

      <div className="form-actions-right">
        <button type="button" className="btn-cancel" onClick={handleCancel}>
          <i className="fas fa-times"></i> {t('botones.cancelar', { defaultValue: 'Cancelar' })}
        </button>
        
        {!isLastStep ? (
          <button type="button" className="btn-next" onClick={onNext}>
            {t('botones.siguiente')} <i className="fas fa-arrow-right"></i>
          </button>
        ) : (
          <button 
            type="button"  // ✅ Cambiado de "submit" a "button"
            className="btn-submit" 
            onClick={onSubmit}  // ✅ Ejecuta onSubmit directamente
            disabled={loading}
          >
            {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
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