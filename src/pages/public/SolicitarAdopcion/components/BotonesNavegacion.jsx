// src/pages/public/SolicitarAdopcion/components/BotonesNavegacion.jsx
import React from 'react';

const BotonesNavegacion = ({ paso, enviando, onAnterior, onSiguiente, onEnviar, t }) => {
  return (
    <div className="botones-navegacion">
      {paso > 1 && (
        <button onClick={onAnterior} className="btn-anterior" disabled={enviando}>
          ← {t('anterior')}
        </button>
      )}

      {paso < 4 && (
        <button onClick={onSiguiente} className="btn-siguiente" disabled={enviando}>
          {t('siguiente')} →
        </button>
      )}

      {paso === 4 && (
        <button onClick={onEnviar} className="btn-enviar" disabled={enviando}>
          {enviando ? (
            <>{t('enviando')}</>
          ) : (
            <>{t('enviar_solicitud')}</>
          )}
        </button>
      )}
    </div>
  );
};

export default BotonesNavegacion;