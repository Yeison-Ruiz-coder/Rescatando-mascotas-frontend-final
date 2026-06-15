// src/pages/public/Mascotas/components/MascotaResumen.jsx
import React from "react";

const MascotaResumen = ({ mascota, t }) => {
  return (
    <section className="mr-resumen reveal-up">
      <div className="mr-container">
        <h1 className="mr-titulo">{mascota.nombre_mascota}</h1>
        
        <div className="mr-grid stagger-children">
          <div className="mr-stat">
            <i className="fas fa-paw"></i>
            <div className="mr-stat-content">
              <label>{t("especie")}</label>
              <p>{mascota.especie || t("especie_no_especificada")}</p>
            </div>
          </div>

          <div className="mr-stat">
            <i className={`fas ${mascota.genero === "Macho" ? "fa-mars" : "fa-venus"}`}></i>
            <div className="mr-stat-content">
              <label>{t("genero")}</label>
              <p>
                {mascota.genero === "Macho"
                  ? t("macho")
                  : mascota.genero === "Hembra"
                  ? t("hembra")
                  : t("desconocido")}
              </p>
            </div>
          </div>

          <div className="mr-stat">
            <i className="fas fa-calendar-alt"></i>
            <div className="mr-stat-content">
              <label>{t("edad")}</label>
              <p>
                {mascota.edad_aprox
                  ? `${mascota.edad_aprox} ${t("años")}`
                  : t("edad_desconocida")}
              </p>
            </div>
          </div>

          {mascota.tamaño && (
            <div className="mr-stat">
              <i className="fas fa-ruler"></i>
              <div className="mr-stat-content">
                <label>{t("tamaño")}</label>
                <p>{mascota.tamaño}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default MascotaResumen;