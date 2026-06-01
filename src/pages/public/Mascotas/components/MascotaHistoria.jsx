import React from "react";

const MascotaHistoria = ({ descripcion, t }) => {
  if (!descripcion) return null;

  return (
    <section className="mh-historia">
      <div className="mh-container">
        <h2 className="mh-titulo">{t("historia")}</h2>
        <div className="mh-contenido">
          <p>{descripcion}</p>
        </div>
      </div>
    </section>
  );
};

export default MascotaHistoria;
