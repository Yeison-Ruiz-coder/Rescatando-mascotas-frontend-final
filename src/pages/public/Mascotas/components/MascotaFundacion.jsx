// src/pages/public/Mascotas/components/MascotaFundacion.jsx
import React from "react";

const MascotaFundacion = ({ fundacion, t }) => {
  if (!fundacion) return null;

  return (
    <section className="mf-fundacion reveal-up delay-200">
      <div className="mf-container">
        <h2 className="mf-titulo">{t("fundacion")}</h2>

        <div className="mf-card">
          <div className="mf-info">
            <div className="mf-item">
              <label>{t("nombre")}</label>
              <p>{fundacion.Nombre_1}</p>
            </div>

            {fundacion.Telefono && (
              <div className="mf-item">
                <label>{t("telefono")}</label>
                <p>
                  <a href={`tel:${fundacion.Telefono}`}>
                    {fundacion.Telefono}
                  </a>
                </p>
              </div>
            )}

            {fundacion.Direccion && (
              <div className="mf-item">
                <label>{t("direccion")}</label>
                <p>{fundacion.Direccion}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MascotaFundacion;