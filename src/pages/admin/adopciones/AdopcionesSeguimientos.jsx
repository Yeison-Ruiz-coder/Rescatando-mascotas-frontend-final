import React from "react";
import { useTranslation } from "react-i18next";
import "./Adopciones.css";

const sampleSeguimientos = [
  {
    id: 101,
    adoptante: "Carlos Méndez",
    mascota: "Luna",
    fecha: "2026-06-10",
    estado: "Pendiente",
    notas: "Visita de seguimiento programada para revisar adaptación.",
  },
  {
    id: 102,
    adoptante: "Sofía Ramírez",
    mascota: "Milo",
    fecha: "2026-05-28",
    estado: "Completado",
    notas: "El gato se adaptó bien a la familia y a otros felinos.",
  },
  {
    id: 103,
    adoptante: "Andrés López",
    mascota: "Nala",
    fecha: "2026-06-08",
    estado: "En seguimiento",
    notas: "Se revisará la alimentación y la socialización en dos semanas.",
  },
];

const AdopcionesSeguimientos = () => {
  const { t } = useTranslation("admin");

  const activos = sampleSeguimientos.filter((item) => item.estado !== "Completado").length;
  const completados = sampleSeguimientos.filter((item) => item.estado === "Completado").length;

  return (
    <div className="admin-adopciones-page">
      <div className="admin-adopciones-hero admin-small-hero">
        <div>
          <span>{t("seguimientos_hero_badge", "Seguimientos")}</span>
          <h1>{t("seguimientos_hero_title", "Seguimiento de adopciones")}</h1>
          <p>{t("seguimientos_hero_desc", "Monitorea casos activos y confirma adopciones exitosas.")}</p>
        </div>
      </div>

      <section className="admin-adopciones-summary">
        <div className="admin-adopciones-card">
          <h2>{t("casos_activos", "Casos activos")}</h2>
          <strong>{activos}</strong>
          <p>{t("casos_activos_desc", "Adopciones aún en seguimiento.")}</p>
        </div>
        <div className="admin-adopciones-card">
          <h2>{t("casos_completados", "Seguimientos completados")}</h2>
          <strong>{completados}</strong>
          <p>{t("casos_completados_desc", "Adopciones que fueron revisadas con éxito.")}</p>
        </div>
        <div className="admin-adopciones-card">
          <h2>{t("casos_totales", "Total de casos")}</h2>
          <strong>{sampleSeguimientos.length}</strong>
          <p>{t("casos_totales_desc", "Número total de seguimientos registrados.")}</p>
        </div>
      </section>

      <section className="admin-adopciones-table-section">
        <table className="admin-adopciones-table">
          <thead>
            <tr>
              <th>{t("id", "ID")}</th>
              <th>{t("adoptante", "Adoptante")}</th>
              <th>{t("mascota", "Mascota")}</th>
              <th>{t("fecha", "Fecha")}</th>
              <th>{t("estado", "Estado")}</th>
              <th>{t("notas", "Notas")}</th>
            </tr>
          </thead>
          <tbody>
            {sampleSeguimientos.map((seguimiento) => (
              <tr key={seguimiento.id}>
                <td>{seguimiento.id}</td>
                <td>{seguimiento.adoptante}</td>
                <td>{seguimiento.mascota}</td>
                <td>{seguimiento.fecha}</td>
                <td>
                  <span className={`badge estado ${seguimiento.estado.toLowerCase().replace(/\s+/g, "-")}`}>
                    {seguimiento.estado}
                  </span>
                </td>
                <td>{seguimiento.notas}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default AdopcionesSeguimientos;
