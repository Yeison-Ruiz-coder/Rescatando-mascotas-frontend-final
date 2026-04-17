import React from 'react';

const FormStepper = ({ steps, currentStep }) => {
  return (
    <div className="form-stepper">
      {steps.map((step, index) => (
        <div key={index} className={`step ${index === currentStep ? 'active' : ''}`}>
          {step}
        </div>
      ))}
    </div>
  );
};

export default FormStepper;