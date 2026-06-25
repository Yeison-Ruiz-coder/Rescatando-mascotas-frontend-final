import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import "./Adopciones.css";

const sampleSolicitudes = [
  {
    id: 1,
    nombre: "Ana Rodríguez",
    mascota: "Luna",
    email: "ana.rodriguez@example.com",
    fecha: "2026-06-18",
    estado: "Pendiente",
    motivo: "Busco una compañera tranquila para mi familia.",
  },
  {
    id: 2,
    nombre: "Juan Pérez",
    mascota: "Milo",
    email: "juan.perez@example.com",
    fecha: "2026-06-16",
    estado: "Aprobada",
    motivo: "Tengo experiencia con gatos y un hogar seguro.",
  },
  {
    id: 3,
    nombre: "María Gómez",
    mascota: "Nala",
    email: "maria.gomez@example.com",
    fecha: "2026-06-14",
    estado: "Rechazada",
    motivo: "No cumple con los requisitos de espacio.",
  },
];

const AdopcionesSolicitudes = () => {
  const { t } = useTranslation("admin");
  const [solicitudes, setSolicitudes] = useState(sampleSolicitudes);

  const handleUpdateEstado = (id, nuevoEstado) => {
    setSolicitudes((prev) =>
      prev.map((item) => (item.id === id ? { ...item, estado: nuevoEstado } : item))
    );
  };

  return (
    <div className="admin-adopciones-page">
      <div className="admin-adopciones-hero admin-small-hero">
        <div>
          <span>{t("solicitudes_hero_badge", "Solicitudes")}</span>
          <h1>{t("solicitudes_hero_title", "Solicitudes de adopción")}</h1>
          <p>{t("solicitudes_hero_desc", "Gestiona y actualiza el estado de las solicitudes de adopción.")}</p>
        </div>
      </div>

      <section className="admin-adopciones-table-section">
        <table className="admin-adopciones-table">
          <thead>
            <tr>
              <th>{t("id", "ID")}</th>
              <th>{t("solicitante", "Solicitante")}</th>
              <th>{t("mascota", "Mascota")}</th>
              <th>{t("email", "Correo")}</th>
              <th>{t("fecha", "Fecha")}</th>
              <th>{t("estado", "Estado")}</th>
              <th>{t("motivo", "Motivo")}</th>
              <th>{t("acciones", "Acciones")}</th>
            </tr>
          </thead>
          <tbody>
            {solicitudes.map((solicitud) => (
              <tr key={solicitud.id}>
                <td>{solicitud.id}</td>
                <td>{solicitud.nombre}</td>
                <td>{solicitud.mascota}</td>
                <td>{solicitud.email}</td>
                <td>{solicitud.fecha}</td>
                <td>
                  <span className={`badge estado ${solicitud.estado.toLowerCase()}`}>
                    {solicitud.estado}
                  </span>
                </td>
                <td>{solicitud.motivo}</td>
                <td className="admin-adopciones-actions-cell">
                  <button
                    className="action-button primary"
                    onClick={() => handleUpdateEstado(solicitud.id, "Aprobada")}
                  >
                    {t("aprobar", "Aprobar")}
                  </button>
                  <button
                    className="action-button danger"
                    onClick={() => handleUpdateEstado(solicitud.id, "Rechazada")}
                  >
                    {t("rechazar", "Rechazar")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default AdopcionesSolicitudes;
