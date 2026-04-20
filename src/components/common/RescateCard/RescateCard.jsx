// src/components/common/RescateCard/RescateCard.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import "./RescateCard.css";

const RescateCard = ({
  rescate,
  onAceptar,
  onRechazar,
  onVerDetalle,
  onRegistrar,  // ← Cambiado de onRegistrarMascota a onRegistrar
  showActions = true,
  loading = false,
}) => {
  const { t } = useTranslation("rescate");

  const getPrioridadClass = () => {
    switch (rescate?.prioridad) {
      case "alta":
        return "prioridad-alta";
      case "media":
        return "prioridad-media";
      default:
        return "prioridad-baja";
    }
  };

  const getPrioridadTexto = () => {
    switch (rescate?.prioridad) {
      case "alta":
        return t("prioridad_alta");
      case "media":
        return t("prioridad_media");
      default:
        return t("prioridad_baja");
    }
  };

  const getTipoIcono = () => {
    switch (rescate?.tipo_emergencia) {
      case "urgente":
        return "fa-skull-crosswalk";
      case "herido":
        return "fa-band-aid";
      case "abandonado":
        return "fa-home";
      default:
        return "fa-info-circle";
    }
  };

  const getTipoColor = () => {
    switch (rescate?.tipo_emergencia) {
      case "urgente":
        return "#dc2626";
      case "herido":
        return "#ea580c";
      case "abandonado":
        return "#ca8a04";
      default:
        return "#16a34a";
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="rescate-card">
      <div
        className="rescate-card-header"
        style={{ borderLeftColor: getTipoColor() }}
      >
        <div className="rescate-tipo">
          <i
            className={`fas ${getTipoIcono()}`}
            style={{ color: getTipoColor() }}
          ></i>
          <span className="rescate-tipo-text" style={{ color: getTipoColor() }}>
            {t(`btn_${rescate?.tipo_emergencia || "otro"}`)}
          </span>
          <span className={`rescate-prioridad-badge ${getPrioridadClass()}`}>
            <i className="fas fa-flag"></i> {getPrioridadTexto()}
          </span>
        </div>
        <span className="rescate-fecha">
          <i className="fas fa-calendar-alt"></i>{" "}
          {formatDate(rescate?.fecha_rescate)}
        </span>
      </div>

      <div className="rescate-card-body">
        <h4 className="rescate-lugar">
          <i className="fas fa-map-marker-alt"></i> {rescate?.lugar_rescate}
        </h4>
        <p className="rescate-descripcion">{rescate?.descripcion_rescate}</p>

        {rescate?.usuario_reporto && (
          <div className="rescate-reportante">
            <i className="fas fa-user"></i>
            <span>
              {t("reportado_por")}:{" "}
              {rescate.usuario_reporto?.nombre ||
                rescate.nombre_reportante ||
                t("anonimo")}
              {rescate.email_reportante && (
                <small> ({rescate.email_reportante})</small>
              )}
            </span>
          </div>
        )}

        {rescate?.lat && rescate?.lng && (
          <div className="rescate-coordenadas">
            <i className="fas fa-location-dot"></i>
            <span>
              {parseFloat(rescate.lat).toFixed(6)},{" "}
              {parseFloat(rescate.lng).toFixed(6)}
            </span>
            <a
              href={`https://www.openstreetmap.org/?mlat=${rescate.lat}&mlon=${rescate.lng}#map=15/${rescate.lat}/${rescate.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ver-mapa-link"
            >
              <i className="fas fa-external-link-alt"></i> {t("ver_mapa")}
            </a>
          </div>
        )}
      </div>

      {/* Estado PENDIENTE - mostrar botones Aceptar/Rechazar */}
      {showActions && rescate?.estado === "pendiente" && (
        <div className="rescate-card-actions">
          <button
            className="btn-aceptar"
            onClick={() => onAceptar?.(rescate.id)}
            disabled={loading}
          >
            <i className="fas fa-check-circle"></i> {t("aceptar_rescate")}
          </button>
          <button
            className="btn-rechazar"
            onClick={() => onRechazar?.(rescate.id)}
            disabled={loading}
          >
            <i className="fas fa-times-circle"></i> {t("rechazar_rescate")}
          </button>
          <button
            className="btn-detalle"
            onClick={() => onVerDetalle?.(rescate.id)}
          >
            <i className="fas fa-eye"></i> {t("ver_detalle")}
          </button>
        </div>
      )}

      {/* Estado EN PROCESO - mostrar botón Registrar Mascota */}
      {rescate?.estado === "en_proceso" && (
        <div className="rescate-card-actions">
          <button
            className="btn-registrar"
            onClick={() => onRegistrar?.(rescate.id)}
            disabled={loading}
          >
            <i className="fas fa-paw"></i> {t("registrar_mascota")}
          </button>
          <button
            className="btn-detalle"
            onClick={() => onVerDetalle?.(rescate.id)}
          >
            <i className="fas fa-eye"></i> {t("ver_detalle")}
          </button>
        </div>
      )}

      {/* Estado COMPLETADO - solo mostrar badge */}
      {rescate?.estado === "completado" && (
        <div className="rescate-card-status completado">
          <i className="fas fa-check-circle"></i> {t("rescate_completado")}
        </div>
      )}
    </div>
  );
};

export default RescateCard;