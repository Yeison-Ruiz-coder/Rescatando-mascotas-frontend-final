// src/pages/public/Mascotas/components/MascotaSalud.jsx
import React from "react";

const MascotaSalud = ({ mascota, t }) => {
  return (
    <section className="ms-salud reveal-up delay-150">
      <div className="ms-container">
        <h2 className="ms-titulo">{t("salud_cuidados")}</h2>

        <div className="ms-grid stagger-children">
          <div className="ms-item">
            <label>{t("esterilizado")}</label>
            <p className={mascota.esterilizado ? "ms-si" : "ms-no"}>
              {mascota.esterilizado ? (
                <>
                  <i className="fas fa-check-circle"></i>
                  {t("si")}
                </>
              ) : (
                <>
                  <i className="fas fa-times-circle"></i>
                  {t("no")}
                </>
              )}
            </p>
          </div>

          <div className="ms-item">
            <label>{t("desparasitado")}</label>
            <p className={mascota.desparasitado ? "ms-si" : "ms-no"}>
              {mascota.desparasitado ? (
                <>
                  <i className="fas fa-check-circle"></i>
                  {t("si")}
                </>
              ) : (
                <>
                  <i className="fas fa-times-circle"></i>
                  {t("no")}
                </>
              )}
            </p>
          </div>

          <div className="ms-item">
            <label>{t("vacunado")}</label>
            <p className={mascota.vacunado ? "ms-si" : "ms-no"}>
              {mascota.vacunado ? (
                <>
                  <i className="fas fa-check-circle"></i>
                  {t("si")}
                </>
              ) : (
                <>
                  <i className="fas fa-times-circle"></i>
                  {t("no")}
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MascotaSalud;