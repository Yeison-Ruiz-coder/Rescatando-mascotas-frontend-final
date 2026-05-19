import React from 'react';
import { useTranslation } from 'react-i18next';

const FormStepper = ({ steps, stepsKeys, currentStep }) => {
  const { t } = useTranslation('nuevaMascota');
  
  const getStepText = (step, index) => {
    if (stepsKeys && stepsKeys[index]) {
      return t(stepsKeys[index], step);
    }
    return step;
  };
  
  return (
    <div className="form-stepper">
      {steps.map((step, index) => (
        <div key={index} className={`step ${index === currentStep ? 'active' : ''}`}>
          {getStepText(step, index)}
        </div>
      ))}
    </div>
  );
};

export default FormStepper;