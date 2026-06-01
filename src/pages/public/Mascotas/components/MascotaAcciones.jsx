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
    <section className="ma-acciones">
      <div className="ma-container">
        <h2 className="ma-titulo">{t("acciones")}</h2>

        <div className="ma-botones">
          {disponible && (
            <>
              <button onClick={handleAdoptar} className="ma-btn ma-btn-adoptar">
                <i className="fas fa-heart"></i>
                {t("solicitar_adopcion")}
              </button>
              {mascota.necesita_hogar_temporal && (
                <button
                  onClick={handleSolicitarAcogida}
                  className="ma-btn ma-btn-acogida"
                >
                  <i className="fas fa-home"></i>
                  {t("solicitar_acogida")}
                </button>
              )}
            </>
          )}

          {adoptado && (
            <div className="ma-mensaje ma-mensaje-adoptado">
              <i className="fas fa-check-circle"></i>
              <p>{t("ya_fue_adoptado")}</p>
            </div>
          )}

          {!disponible && !adoptado && (
            <div className="ma-mensaje ma-mensaje-no-disponible">
              <i className="fas fa-info-circle"></i>
              <p>{t("no_disponible")}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default MascotaAcciones;
