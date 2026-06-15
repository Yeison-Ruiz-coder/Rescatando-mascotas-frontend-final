// src/pages/public/Mascotas/components/MascotaAcciones.jsx
import React from "react";

const MascotaAcciones = ({
  disponible,
  adoptado,
  mascota,
  handleAdoptar,
  handleSolicitarAcogida,
  t,
}) => {
  return (
    <section className="ma-acciones reveal-up delay-200">
      <div className="ma-container">
        <h2 className="ma-titulo">{t("acciones")}</h2>

        <div className="ma-botones">
          {disponible && (
            <>
              <button onClick={handleAdoptar} className="ma-btn ma-btn-adoptar reveal-scale delay-300">
                <i className="fas fa-heart" aria-hidden="true"></i>
                <span>{t("solicitar_adopcion")}</span>
              </button>
              {mascota.necesita_hogar_temporal && (
                <button
                  onClick={handleSolicitarAcogida}
                  className="ma-btn ma-btn-acogida reveal-scale delay-400"
                >
                  <i className="fas fa-home" aria-hidden="true"></i>
                  <span>{t("solicitar_acogida")}</span>
                </button>
              )}
            </>
          )}

          {adoptado && (
            <div className="ma-mensaje ma-mensaje-adoptado reveal-up delay-300">
              <i className="fas fa-check-circle" aria-hidden="true"></i>
              <p>{t("ya_fue_adoptado")}</p>
            </div>
          )}

          {!disponible && !adoptado && (
            <div className="ma-mensaje ma-mensaje-no-disponible reveal-up delay-300">
              <i className="fas fa-info-circle" aria-hidden="true"></i>
              <p>{t("no_disponible")}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default MascotaAcciones;