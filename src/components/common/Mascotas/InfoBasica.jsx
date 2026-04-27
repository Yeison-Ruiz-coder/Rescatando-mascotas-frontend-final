// src/pages/public/MascotaDetalle/components/InfoBasica.jsx
import React from "react";
import "./InfoBasica.css";

const InfoBasica = ({ mascota, t }) => {
  return (
    <div className="info-basica">
      <h1 className="mascota-nombre-title">{mascota.nombre_mascota}</h1>

      <div className="mascota-info-resumen-grid">
        <div className="mascota-info-item-card">
          <i className="fas fa-paw"></i>
          <span>{mascota.especie || t("especie_no_especificada")}</span>
        </div>
        <div className="mascota-info-item-card">
          <i className={`fas ${mascota.genero === "Macho" ? "fa-mars" : "fa-venus"}`}></i>
          <span>
            {mascota.genero === "Macho"
              ? t("macho")
              : mascota.genero === "Hembra"
                ? t("hembra")
                : t("desconocido")}
          </span>
        </div>
        <div className="mascota-info-item-card">
          <i className="fas fa-calendar-alt"></i>
          <span>
            {mascota.edad_aprox
              ? `${mascota.edad_aprox} ${mascota.edad_aprox === 1 ? t("año") : t("años")}`
              : t("edad_desconocida")}
          </span>
        </div>
      </div>

      {mascota.descripcion && (
        <div className="mascota-descripcion-section">
          <h3><i className="fas fa-align-left"></i> {t("descripcion")}</h3>
          <p>{mascota.descripcion}</p>
        </div>
      )}

      {mascota.lugar_rescate && (
        <div className="mascota-lugar-rescate-section">
          <h3><i className="fas fa-map-marker-alt"></i> {t("lugar_rescate")}</h3>
          <p>{mascota.lugar_rescate}</p>
        </div>
      )}

      {mascota.fecha_ingreso && (
        <div className="mascota-fecha-ingreso-section">
          <h3><i className="fas fa-calendar-alt"></i> {t("fecha_ingreso")}</h3>
          <p>{new Date(mascota.fecha_ingreso).toLocaleDateString("es-ES")}</p>
        </div>
      )}

      {mascota.fecha_salida && (
        <div className="mascota-fecha-ingreso-section">
          <h3><i className="fas fa-calendar-check"></i> {t("fecha_salida")}</h3>
          <p>{new Date(mascota.fecha_salida).toLocaleDateString("es-ES")}</p>
        </div>
      )}
    </div>
  );
};

export default InfoBasica;