// src/pages/public/Mascotas/components/MascotaCompatibilidad.jsx
import React from "react";

const MascotaCompatibilidad = ({ mascota, t }) => {
  const hasCompatibilidad =
    mascota.apto_con_ninos || mascota.apto_con_otros_animales;

  if (!hasCompatibilidad) return null;

  return (
    <section className="mc-compatibilidad reveal-up delay-100">
      <div className="mc-container">
        <h2 className="mc-titulo">{t("compatibilidad")}</h2>

        <div className="mc-grid stagger-children">
          {mascota.apto_con_ninos && (
            <div className="mc-card">
              <div className="mc-icono">
                <i className="fas fa-child"></i>
              </div>
              <h3>{t("apto_con_ninos")}</h3>
              <p>{t("si")}</p>
            </div>
          )}

          {mascota.apto_con_otros_animales && (
            <div className="mc-card">
              <div className="mc-icono">
                <i className="fas fa-paw"></i>
              </div>
              <h3>{t("apto_con_otros_animales")}</h3>
              <p>{t("si")}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default MascotaCompatibilidad;