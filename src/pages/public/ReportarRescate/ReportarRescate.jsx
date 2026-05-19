// src/pages/public/ReportarRescate/ReportarRescate.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Input from "../../../components/common/Input/Input";
import Textarea from "../../../components/common/Textarea/Textarea";
import Button from "../../../components/common/Button/Button";
import LocationPicker from "../../../components/common/LocationPicker/LocationPicker";
import ImageUploader from "../../../components/common/ImageUploader/ImageUploader";
import useRescate from "../../../hooks/useRescate";
import "./ReportarRescate.css";

const ReportarRescate = () => {
  const navigate = useNavigate();
  
  const [fechaRescateDate, setFechaRescateDate] = useState(null);

  const {
    formData,
    errors,
    loading,
    submitSuccess,
    waitingForAdmin,
    timeUntilAdminAvailable,
    rescateDisponibleParaAdmin,
    prioridad,
    fotosPreviews,
    fotosFiles,
    gettingLocation,
    handleChange,
    handleLocationChange,
    getCurrentLocation,
    setPrioridadManual,
    handleSubmit,
    handleFotosChange,
    prioridadConfig,
    prioridadTexto,
    botonesPrioridad,
    formatTimeRemaining,
    t,
  } = useRescate();

  useEffect(() => {
    if (formData.fecha_rescate) {
      setFechaRescateDate(new Date(formData.fecha_rescate));
    }
  }, [formData.fecha_rescate]);

  const handleDateChange = (date) => {
    setFechaRescateDate(date);
    handleChange({
      target: {
        name: "fecha_rescate",
        value: date ? date.toISOString().split("T")[0] : ""
      }
    });
  };

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
            <i className="fas fa-flag" style={{ color: "white" }}></i> {t("prioridad_label")}:{" "}
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
    if (waitingForAdmin) {
      return (
        <div className="rescate-success">
          <div className="success-card waiting">
            <i className="fas fa-clock" />
            <h2>{t("rescate_enviado_title")}</h2>
            <p>{t("rescate_enviado_message")}</p>
            <div className="timer-info">
              <i className="fas fa-hourglass-half" />
              <span>{t("admin_waiting_time")} {formatTimeRemaining(timeUntilAdminAvailable)}</span>
            </div>
            <p className="info-text">
              <i className="fas fa-info-circle" />
              {t("admin_info")}
            </p>
            <Button onClick={() => navigate("/")} variant="secondary">
              <i className="fas fa-home" /> {t("back_home")}
            </Button>
          </div>
        </div>
      );
    }

    if (rescateDisponibleParaAdmin) {
      return (
        <div className="rescate-success">
          <div className="success-card available">
            <i className="fas fa-users" />
            <h2>{t("available_title")}</h2>
            <p>{t("available_message")}</p>
            <div className="available-actions">
              <Button onClick={() => navigate("/")} variant="primary">
                <i className="fas fa-home" /> {t("back_home")}
              </Button>
            </div>
          </div>
        </div>
      );
    }

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

          {/* SECCIÓN 1: INFORMACIÓN DEL RESCATE */}
          <div className="form-section">
            <div className="section-header">
              <i className="fas fa-info-circle" />
              <h3>{t("rescue_info_section")}</h3>
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

            {/* DATEPICKER CON ESTILOS GLOBALES */}
            <div className="datepicker-wrapper">
              <label className="form-label">
                <i className="fas fa-calendar-alt" /> {t("fecha_label")}
                <span className="required">*</span>
              </label>
              <DatePicker
                selected={fechaRescateDate}
                onChange={handleDateChange}
                dateFormat="dd/MM/yyyy"
                placeholderText="Selecciona la fecha del rescate"
                className="datepicker-input"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                locale="es"
                required
              />
              {errors.fecha_rescate && (
                <div className="error-text">{errors.fecha_rescate}</div>
              )}
            </div>
          </div>

          {/* SECCIÓN 2: PRIORIDAD */}
          <div className="form-section">
            <div className="section-header">
              <i className="fas fa-exclamation-triangle" />
              <h3>{t("priority_section")}</h3>
            </div>
            {renderPrioridadButtons()}
            {renderPrioridadCard()}
          </div>

          {/* SECCIÓN 3: UBICACIÓN */}
          <div className="form-section">
            <div className="section-header">
              <i className="fas fa-map-marker-alt" />
              <h3>{t("location_section")}</h3>
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
            {errors.ubicacion_rescate && (
              <div className="error-text">{errors.ubicacion_rescate}</div>
            )}

            <small className="form-hint">
              <i className="fas fa-info-circle" /> {t("map_hint")}
            </small>
          </div>

          {/* SECCIÓN 4: FOTOS */}
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

          {/* SECCIÓN 5: DATOS DEL REPORTANTE */}
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

          {/* BOTONES DE ACCIÓN */}
          <div className="form-actions">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-paw" />}
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