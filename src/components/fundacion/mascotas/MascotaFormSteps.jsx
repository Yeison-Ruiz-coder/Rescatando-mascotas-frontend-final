// src/components/fundacion/mascotas/MascotaFormSteps.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const MascotaFormSteps = ({ steps, currentStep, setCurrentStep }) => {
  const { t } = useTranslation('nuevaMascota');

  return (
    <div className="steps-container">
      {steps.map((step) => (
        <div
          key={step.number}
          className={`step ${currentStep >= step.number ? 'active' : ''} ${
            currentStep > step.number ? 'completed' : ''
          }`}
          onClick={() => currentStep > step.number && setCurrentStep(step.number)}
        >
          <div className="step-circle">
            {currentStep > step.number ? <i className="fas fa-check"></i> : step.number}
          </div>
          <div className="step-label">
            <i className={step.icon}></i>
            <span>{t(step.titleKey || step.title)}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MascotaFormSteps;