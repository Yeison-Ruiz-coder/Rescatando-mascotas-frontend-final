import React from "react";

const MascotasRelacionadas = ({ mascotaId, t }) => {
  // Placeholder para mascotas relacionadas
  // Se puede implementar lógica para traer mascotas similares

  return (
    <section className="mrr-relacionadas">
      <div className="mrr-container">
        <h2 className="mrr-titulo">{t("mascotas_relacionadas")}</h2>
        <p className="mrr-placeholder">{t("no_hay_mascotas_relacionadas")}</p>
      </div>
    </section>
  );
};

export default MascotasRelacionadas;
