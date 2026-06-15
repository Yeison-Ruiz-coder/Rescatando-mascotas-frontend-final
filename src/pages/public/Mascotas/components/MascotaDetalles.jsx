// src/pages/public/Mascotas/components/MascotaDetalles.jsx
import React from "react";

const MascotaDetalles = ({ mascota, razas, vacunas, t }) => {
  const hasDetalles =
    (razas && razas.length > 0) ||
    (vacunas && vacunas.length > 0) ||
    mascota.lugar_rescate ||
    mascota.caracteristicas;

  if (!hasDetalles) return null;

  return (
    <section className="md-detalles reveal-up delay-150">
      <div className="md-container">
        <h2 className="md-titulo">{t("detalles")}</h2>

        <div className="md-contenido stagger-children">
          {razas && razas.length > 0 && (
            <div className="md-bloque">
              <h3 className="md-bloque-titulo">
                <i className="fas fa-dna"></i>
                {t("razas")}
              </h3>
              <div className="md-tags">
                {razas.map((raza, idx) => (
                  <span key={idx} className="md-tag">
                    {raza.nombre_raza || raza.nombre || "Raza"}
                  </span>
                ))}
              </div>
            </div>
          )}

          {vacunas && vacunas.length > 0 && (
            <div className="md-bloque">
              <h3 className="md-bloque-titulo">
                <i className="fas fa-syringe"></i>
                {t("vacunas")}
              </h3>
              <div className="md-tags">
                {vacunas.map((v, idx) => (
                  <span key={idx} className="md-tag">
                    {v.nombre_vacuna || v}
                  </span>
                ))}
              </div>
            </div>
          )}

          {mascota.lugar_rescate && (
            <div className="md-bloque">
              <h3 className="md-bloque-titulo">
                <i className="fas fa-map-marker-alt"></i>
                {t("lugar_rescate")}
              </h3>
              <p className="md-bloque-texto">{mascota.lugar_rescate}</p>
            </div>
          )}

          {mascota.caracteristicas && (
            <div className="md-bloque">
              <h3 className="md-bloque-titulo">
                <i className="fas fa-star"></i>
                {t("caracteristicas")}
              </h3>
              <p className="md-bloque-texto">{mascota.caracteristicas}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default MascotaDetalles;