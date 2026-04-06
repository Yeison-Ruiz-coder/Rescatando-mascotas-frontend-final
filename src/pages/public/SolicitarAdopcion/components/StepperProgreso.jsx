// src/pages/public/SolicitarAdopcion/components/StepperProgreso.jsx
import React from 'react';

const StepperProgreso = ({ paso, t }) => {
  const pasos = [
    { numero: 1, label: t('datos_personales') },
    { numero: 2, label: t('informacion_adicional') },
    { numero: 3, label: t('compromisos') },
    { numero: 4, label: t('revision') }
  ];

  return (
    <div className="stepper-progreso">
      {pasos.map((p) => (
        <div key={p.numero} className={`paso ${paso >= p.numero ? 'activo' : ''} ${paso === p.numero ? 'actual' : ''}`}>
          <div className="paso-numero">
            {paso > p.numero ? (
              <i className="fas fa-check"></i>
            ) : (
              <span>{p.numero}</span>
            )}
          </div>
          <div className="paso-label">{p.label}</div>
        </div>
      ))}
    </div>
  );
};

export default StepperProgreso;