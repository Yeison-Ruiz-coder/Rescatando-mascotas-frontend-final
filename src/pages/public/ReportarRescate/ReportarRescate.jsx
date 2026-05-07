// src/pages/public/ReportarRescate/ReportarRescate.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../../components/common/Input/Input";
import Textarea from "../../../components/common/Textarea/Textarea";
import Button from "../../../components/common/Button/Button";
import LocationPicker from "../../../components/common/LocationPicker/LocationPicker";
import ImageUploader from "../../../components/common/ImageUploader/ImageUploader";
import useRescate from "../../../hooks/useRescate";
import "./ReportarRescate.css";

const ReportarRescate = () => {
  const navigate = useNavigate();

  const {
    formData,
    errors,
    loading,
    submitSuccess,
    gettingLocation,
    prioridad,
    fotosPreviews,
    handleChange,
    handleLocationChange,
    getCurrentLocation,
    setPrioridadManual,
    handleSubmit,
    handleFotosChange,
    prioridadConfig,
    prioridadTexto,
    botonesPrioridad,
    t,
  } = useRescate();

  // Tarjeta de prioridad
  const renderPrioridadCard = () => {
    if (!prioridad) return null;

    const info = prioridadConfig[prioridad.tipo] || prioridadConfig.otro;

    return (
      <div
        className="prioridad-card"
        style={{ backgroundColor: info.bgColor, borderLeftColor: info.color }}
      >
        <div className="prioridad-header">
          <i
            className={`fas ${info.icon}`}
            style={{ color: info.color, fontSize: "1.5rem" }}
          />
          <span className="prioridad-title" style={{ color: info.color }}>
            {info.title}
          </span>
          <span className={`prioridad-badge prioridad-${prioridad.prioridad}`}>
            <i className="fas fa-flag" /> {t("prioridad_label")}:{" "}
            {prioridadTexto[prioridad.prioridad]}
          </span>
        </div>
        <p className="prioridad-descripcion">{info.description}</p>
        <div className="prioridad-recomendacion">
          <strong>
            <i className="fas fa-lightbulb" /> {t("recomendacion_label")}:
          </strong>{" "}
          {info.recomendacion}
        </div>
      </div>
    );
  };

  // Botones de prioridad
  const renderPrioridadButtons = () => (
    <div className="prioridad-buttons-container">
      <label className="form-label">
        <i className="fas fa-exclamation-triangle" /> {t("manual_classify")}
      </label>
      <div className="prioridad-buttons">
        {botonesPrioridad.map((btn) => (
          <button
            key={btn.tipo}
            type="button"
            className={`prioridad-btn ${btn.tipo} ${
              prioridad?.tipo === btn.tipo ? "active" : ""
            }`}
            onClick={() => setPrioridadManual(btn.tipo)}
          >
            <i className={`fas ${btn.icono}`} />
            <span>{btn.label}</span>
            <small>{btn.desc}</small>
          </button>
        ))}
      </div>
      <small className="form-hint">
        <i className="fas fa-microphone-alt" /> {t("auto_classify_hint")}
      </small>
    </div>
  );

  if (submitSuccess) {
    return (
      <div className="rescate-success">
        <div className="success-card">
          <i className="fas fa-check-circle" />
          <h2>{t("success_title")}</h2>
          <p>{t("success_message")}</p>
          <Button onClick={() => navigate("/")} variant="primary">
            <i className="fas fa-home" /> {t("back_home")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rescate-page">
      <div className="container">
        <div className="rescate-header">
          <h1>
            <i className="fas fa-paw" /> {t("title")}
          </h1>
          <p className="subtitle">{t("subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="rescate-form">
          {errors.general && (
            <div className="alert alert-error">
              <i className="fas fa-exclamation-circle" /> {errors.general}
            </div>
          )}

          {/* ===== SECCIÓN 1: INFORMACIÓN DEL RESCATE ===== */}
          <div className="form-section">
            <div className="section-header">
              <i className="fas fa-info-circle" />
              <h3>{t("rescue_info_section") || "Información del rescate"}</h3>
            </div>

            <Input
              label={t("lugar_label")}
              name="lugar_rescate"
              value={formData.lugar_rescate}
              onChange={handleChange}
              error={errors.lugar_rescate}
              required
              placeholder={t("lugar_placeholder")}
            />

            <Textarea
              label={t("descripcion_label")}
              name="descripcion_rescate"
              value={formData.descripcion_rescate}
              onChange={handleChange}
              error={errors.descripcion_rescate}
              required
              placeholder={t("descripcion_placeholder")}
              rows={5}
            />

            <Input
              label={t("fecha_label")}
              name="fecha_rescate"
              type="date"
              value={formData.fecha_rescate}
              onChange={handleChange}
              error={errors.fecha_rescate}
              required
            />
          </div>

          {/* ===== SECCIÓN 2: PRIORIDAD ===== */}
          <div className="form-section">
            <div className="section-header">
              <i className="fas fa-exclamation-triangle" />
              <h3>{t("priority_section") || "Clasificación de prioridad"}</h3>
            </div>
            {renderPrioridadButtons()}
            {renderPrioridadCard()}
          </div>

          {/* ===== SECCIÓN 3: UBICACIÓN ===== */}
          <div className="form-section">
            <div className="section-header">
              <i className="fas fa-map-marker-alt" />
              <h3>{t("location_section") || "Ubicación del rescate"}</h3>
            </div>

            <div className="location-controls">
              <Button
                type="button"
                variant="secondary"
                onClick={getCurrentLocation}
                disabled={gettingLocation}
                className="btn-ubicacion"
              >
                <i className="fas fa-location-dot" />
                {gettingLocation ? t("getting_location") : t("use_my_location")}
              </Button>
            </div>

            <LocationPicker
              onLocationChange={handleLocationChange}
              initialLat={formData.lat}
              initialLng={formData.lng}
              height="300px"
            />


            <small className="form-hint">
              <i className="fas fa-info-circle" /> {t("map_hint")}
            </small>
          </div>

          {/* ===== SECCIÓN 4: FOTOS ===== */}
          <div className="form-section">
            <div className="section-header">
              <i className="fas fa-camera" />
              <h3>{t("fotos_section")}</h3>
            </div>

            <ImageUploader
              label={t("fotos_label")}
              name="fotos"
              onImageChange={handleFotosChange}
              multiple={true}
              maxFiles={5}
              currentImages={fotosPreviews}
              maxSize={5}
              required={false}
            />
            {errors.fotos && <div className="error-text">{errors.fotos}</div>}

            <small className="form-hint">
              <i className="fas fa-info-circle" /> {t("fotos_hint")}
              <br />
              <i className="fas fa-star" style={{ color: "#f59e0b" }} />{" "}
              {t("first_photo_main_hint")}
            </small>
          </div>

          {/* ===== SECCIÓN 5: DATOS DEL REPORTANTE ===== */}
          <div className="form-section">
            <div className="section-header">
              <i className="fas fa-user-edit" />
              <h3>{t("optional_data")}</h3>
            </div>

            <Input
              label={t("nombre_label")}
              name="nombre_reportante"
              value={formData.nombre_reportante}
              onChange={handleChange}
              placeholder={t("nombre_placeholder")}
            />

            <Input
              label={t("email_label")}
              name="email_reportante"
              type="email"
              value={formData.email_reportante}
              onChange={handleChange}
              error={errors.email_reportante}
              placeholder={t("email_placeholder")}
            />

            <Input
              label={t("telefono_label")}
              name="telefono_reportante"
              value={formData.telefono_reportante}
              onChange={handleChange}
              placeholder={t("telefono_placeholder")}
            />
          </div>

          {/* ===== BOTONES DE ACCIÓN ===== */}
          <div className="form-actions">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? (
                <i className="fas fa-spinner fa-spin" />
              ) : (
                <i className="fas fa-paw" />
              )}
              {loading ? ` ${t("sending")}` : ` ${t("submit_btn")}`}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
              className="btn-cancelar-rescate"
            >
              <i className="fas fa-times" /> {t("cancel_btn")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportarRescate;