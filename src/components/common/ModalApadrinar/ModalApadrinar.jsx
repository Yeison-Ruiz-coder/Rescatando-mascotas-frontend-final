import React from "react";
import "./ModalApadrinar.css";

const ModalApadrinar = ({
  isOpen,
  mascota,
  planes,
  selectedPlan,
  mensaje,
  apadrinando,
  onClose,
  onSelectPlan,
  onConfirmar,
  getImageUrl,
}) => {
  if (!isOpen || !mascota) return null;

  return (
    <div className="ma-overlay" onClick={onClose}>
      <div
        className="ma-container"
        onClick={(e) => e.stopPropagation()}
        style={{ zIndex: 10001 }}
      >
        <div className="ma-header">
          <div className="ma-header-content">
            <span className="ma-paw-icon">🐾</span>
            <h2>Elige tu nivel de compromiso</h2>
            <p>
              Convierte a{" "}
              <strong>{mascota.nombre_mascota}</strong> en tu
              compañero especial
            </p>
          </div>
          <button className="ma-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="ma-body">
          {/* Preview de la mascota */}
          <div className="ma-mascota-preview">
            <div className="ma-mascota-avatar">
              {mascota.foto_principal ? (
                <img
                  src={getImageUrl(mascota.foto_principal)}
                  alt={mascota.nombre_mascota}
                />
              ) : (
                <span className="ma-avatar-placeholder">🐕</span>
              )}
            </div>
            <div className="ma-mascota-info">
              <h3>{mascota.nombre_mascota}</h3>
              <span className="ma-mascota-especie">
                {mascota.especie || "Mascota"} •{" "}
                {mascota.edad_aprox || "?"} años
              </span>
            </div>
          </div>

          {/* Mensaje del modal */}
          {mensaje.texto && (
            <div className={`ma-mensaje ma-${mensaje.tipo}`}>
              {mensaje.texto}
            </div>
          )}

          {/* Planes */}
          <div className="ma-planes-grid">
            {planes.map((plan) => (
              <div
                key={plan.id}
                className={`ma-plan-card ${
                  selectedPlan?.id === plan.id ? "ma-selected" : ""
                } ${plan.destacado ? "ma-featured" : ""}`}
                onClick={() => onSelectPlan(plan)}
                style={{ "--plan-color": plan.color }}
              >
                {plan.destacado && (
                  <div className="ma-plan-badge">⭐ Más Popular</div>
                )}
                <div className="ma-plan-icon">{plan.icon}</div>
                <h4>{plan.nombre}</h4>
                <div className="ma-plan-price">
                  <span className="ma-amount">
                    ${plan.monto.toLocaleString()}
                  </span>
                  <span className="ma-period">/{plan.frecuencia}</span>
                </div>
                <ul className="ma-plan-beneficios">
                  {plan.beneficios.map((beneficio, index) => (
                    <li key={index}>
                      <span className="ma-check-icon">✓</span>
                      <span>{beneficio}</span>
                    </li>
                  ))}
                </ul>
                <div className="ma-plan-select-indicator">
                  {selectedPlan?.id === plan.id ? (
                    <span className="ma-selected-badge">✓ Seleccionado</span>
                  ) : (
                    <span className="ma-select-hint">Seleccionar</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="ma-footer">
          <button className="ma-btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="ma-btn-confirm"
            onClick={onConfirmar}
            disabled={apadrinando}
          >
            {apadrinando ? (
              <>
                <span className="ma-spinner"></span>
                Procesando...
              </>
            ) : (
              `✨ Apadrinar a ${mascota.nombre_mascota}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalApadrinar;