// src/pages/public/SolicitarAdopcion/components/StepperProgreso.jsx
import React from 'react';

const StepperProgreso = ({ paso, t, erroresPorPaso }) => {
  const pasos = [
    { 
      numero: 1, 
      label: t('datos_personales'), 
      campos: ['nombre', 'apellido', 'documento_identidad', 'email', 'telefono'] 
    },
    { 
      numero: 2, 
      label: t('informacion_adicional'), 
      campos: ['direccion', 'ciudad', 'tipo_vivienda'] 
    },
    { 
      numero: 3, 
      label: t('compromisos'), 
      campos: ['experiencia_mascotas', 'motivo_adopcion', 'compromiso_cuidado', 'compromiso_esterilizacion', 'compromiso_seguimiento'] 
    },
    { 
      numero: 4, 
      label: t('revision'), 
      campos: [] 
    }
  ];

  // Verificar si un paso tiene errores
  const tieneErroresEnPaso = (pasoIndex) => {
    if (!erroresPorPaso) return false;
    const camposPaso = pasos[pasoIndex - 1]?.campos || [];
    return camposPaso.some(campo => erroresPorPaso[campo]);
  };

  return (
    <div className="stepper-progreso">
      {pasos.map((p) => {
        const pasoNumero = p.numero;
        const tieneError = tieneErroresEnPaso(pasoNumero);
        const esCompletado = paso > pasoNumero;
        const esActual = paso === pasoNumero;
        
        return (
          <div 
            key={pasoNumero} 
            className={`paso ${esCompletado ? 'completado' : ''} ${esActual ? 'actual' : ''} ${tieneError ? 'error-paso' : ''}`}
          >
            <div className="paso-numero">
              {esCompletado ? (
                <i className="fas fa-check"></i>
              ) : (
                <span>{pasoNumero}</span>
              )}
            </div>
            <div className="paso-label">{p.label}</div>
            {tieneError && (
              <div className="paso-error-indicator">
                <i className="fas fa-exclamation-circle"></i>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StepperProgreso;