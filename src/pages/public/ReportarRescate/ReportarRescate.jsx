// src/pages/public/ReportarRescate/ReportarRescate.jsx
import React, { useState, useEffect, useCallback } from "react";
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
  const [localErrors, setLocalErrors] = useState({});

  const {
    formData,
    errors: hookErrors,
    loading,
    submitSuccess,
    waitingForAdmin,
    timeUntilAdminAvailable,
    rescateDisponibleParaAdmin,
    prioridad,
    fotoPrincipalPreview,
    galeriaPreviews,
    gettingLocation,
    handleChange,
    handleLocationChange,
    getCurrentLocation,
    setPrioridadManual,
    handleSubmit,
    handleFotoPrincipalChange,
    handleGaleriaChange,
    prioridadConfig,
    prioridadTexto,
    botonesPrioridad,
    formatTimeRemaining,
    t,
  } = useRescate();

  const allErrors = { ...hookErrors, ...localErrors };

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
    if (allErrors.fecha_rescate) {
      setLocalErrors(prev => ({ ...prev, fecha_rescate: "" }));
    }
  };

  const scrollToFirstError = useCallback(() => {
    setTimeout(() => {
      const primerError = document.querySelector('.rescate-r9x7 .error-text, .rescate-r9x7 input.error, .rescate-r9x7 textarea.error');
      if (primerError) {
        const inputPadre = primerError.closest('.form-grupo, .form-section, .prioridad-buttons-container, .location-controls');
        if (inputPadre) {
          inputPadre.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const input = inputPadre.querySelector('input, textarea, button');
          if (input) input.focus();
        }
      }
    }, 100);
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.lugar_rescate?.trim()) {
      newErrors.lugar_rescate = "El lugar del rescate es requerido";
    }
    
    if (!formData.descripcion_rescate?.trim()) {
      newErrors.descripcion_rescate = "La descripcion del rescate es requerida";
    } else if (formData.descripcion_rescate.trim().length < 10) {
      newErrors.descripcion_rescate = "La descripcion debe tener al menos 10 caracteres";
    }
    
    if (!formData.fecha_rescate) {
      newErrors.fecha_rescate = "La fecha del rescate es requerida";
    }
    
    if (!prioridad?.tipo) {
      newErrors.prioridad = "Debes seleccionar un tipo de rescate";
    }
    
    if (!formData.lat || !formData.lng) {
      newErrors.ubicacion_rescate = "Debes seleccionar la ubicacion en el mapa";
    }
    
    if (formData.email_reportante && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email_reportante)) {
      newErrors.email_reportante = "Ingresa un correo electronico valido";
    }
    
    if (formData.telefono_reportante && formData.telefono_reportante.replace(/\D/g, '').length < 7) {
      newErrors.telefono_reportante = "Ingresa un telefono valido (minimo 7 digitos)";
    }
    
    setLocalErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLocalSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      scrollToFirstError();
      return;
    }
    
    await handleSubmit(e);
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    handleChange(e);
    if (allErrors[name]) {
      setLocalErrors(prev => ({ ...prev, [name]: "" }));
    }
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
        <i className="fas fa-exclamation-triangle" /> {t("manual_classify")} *
      </label>
      <div className="prioridad-buttons">
        {botonesPrioridad.map((btn) => (
          <button
            key={btn.tipo}
            type="button"
            className={`prioridad-btn ${btn.tipo} ${
              prioridad?.tipo === btn.tipo ? "active" : ""
            }`}
            onClick={() => {
              setPrioridadManual(btn.tipo);
              if (allErrors.prioridad) {
                setLocalErrors(prev => ({ ...prev, prioridad: "" }));
              }
            }}
          >
            <i className={`fas ${btn.icono}`} />
            <span>{btn.label}</span>
            <small>{btn.desc}</small>
          </button>
        ))}
      </div>
      {allErrors.prioridad && <small className="error-text">{allErrors.prioridad}</small>}
      <small className="form-hint">
        <i className="fas fa-microphone-alt" /> {t("auto_classify_hint")}
      </small>
    </div>
  );

  if (submitSuccess) {
    if (waitingForAdmin) {
      return (
        <div className="rescate-r9x7-success">
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
        <div className="rescate-r9x7-success">
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
      <div className="rescate-r9x7-success">
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
    <div className="rescate-r9x7">
      <div className="rescate-container">
        <div className="rescate-header">
          <h1>
            <i className="fas fa-paw"></i>
            {t("title")}
            <i className="fas fa-paw"></i>
          </h1>
          <p className="subtitle">
            <i className="fas fa-heartbeat"></i>
            {t("subtitle")}
            <i className="fas fa-hands-helping"></i>
          </p>
        </div>

        <div className="rescate-two-columns">
          
          <div className="rescate-left-col">
            <div className="tips-card">
              <div className="tips-icon">
                <i className="fas fa-hands-helping"></i>
              </div>
              <h3 className="tips-title">{t("motivational_title")}</h3>
              <p className="tips-message">{t("motivational_message")}</p>
              <div className="tips-divider"></div>
              <h4 className="tips-subtitle">
                <i className="fas fa-lightbulb"></i> {t("tips_title")}
              </h4>
              <ul className="tips-list">
                <li>✓ {t("tip1")}</li>
                <li>✓ {t("tip2")}</li>
                <li>✓ {t("tip3")}</li>
                <li>✓ {t("tip4")}</li>
                <li>✓ {t("tip5")}</li>
              </ul>
              <div className="tips-divider"></div>
              <div className="emergency-box">
                <i className="fas fa-phone-alt"></i>
                <div>
                  <strong>{t("emergency_contacts")}</strong>
                  <p>{t("rescue_phone")}</p>
                </div>
              </div>
              <p className="tips-footer">
                <i className="fas fa-heart"></i> {t("footer_message")}
              </p>
            </div>
          </div>

          <div className="rescate-right-col">
            <form onSubmit={handleLocalSubmit} className="rescate-form">
              {allErrors.general && (
                <div className="alert alert-error">
                  <i className="fas fa-exclamation-circle" /> {allErrors.general}
                </div>
              )}

              <div className="form-section">
                <div className="section-header">
                  <i className="fas fa-info-circle" />
                  <h3>{t("rescue_info_section")} *</h3>
                </div>

                <div className="form-grupo">
                  <label>{t("lugar_label")} *</label>
                  <input
                    type="text"
                    name="lugar_rescate"
                    value={formData.lugar_rescate}
                    onChange={handleFieldChange}
                    placeholder={t("lugar_placeholder")}
                    className={allErrors.lugar_rescate ? "error" : ""}
                  />
                  {allErrors.lugar_rescate && <small className="error-text">{allErrors.lugar_rescate}</small>}
                </div>

                <div className="form-grupo">
                  <label>{t("descripcion_label")} *</label>
                  <textarea
                    name="descripcion_rescate"
                    value={formData.descripcion_rescate}
                    onChange={handleFieldChange}
                    placeholder={t("descripcion_placeholder")}
                    rows={5}
                    className={allErrors.descripcion_rescate ? "error" : ""}
                  />
                  {allErrors.descripcion_rescate && <small className="error-text">{allErrors.descripcion_rescate}</small>}
                </div>

                <div className="form-grupo">
                  <label>{t("fecha_label")} *</label>
                  <DatePicker
                    selected={fechaRescateDate}
                    onChange={handleDateChange}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="DD/MM/YYYY"
                    className={`datepicker-input ${allErrors.fecha_rescate ? "error" : ""}`}
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    locale="es"
                  />
                  {allErrors.fecha_rescate && <small className="error-text">{allErrors.fecha_rescate}</small>}
                </div>
              </div>

              <div className="form-section">
                <div className="section-header">
                  <i className="fas fa-exclamation-triangle" />
                  <h3>{t("priority_section")} *</h3>
                </div>
                {renderPrioridadButtons()}
                {renderPrioridadCard()}
              </div>

              <div className="form-section">
                <div className="section-header">
                  <i className="fas fa-map-marker-alt" />
                  <h3>{t("location_section")} *</h3>
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
                {allErrors.ubicacion_rescate && <small className="error-text">{allErrors.ubicacion_rescate}</small>}

                <small className="form-hint">
                  <i className="fas fa-info-circle" /> {t("map_hint")}
                </small>
              </div>

              <div className="form-section">
                <div className="section-header">
                  <i className="fas fa-camera" />
                  <h3>{t("fotos_section")}</h3>
                </div>

                <div className="form-grupo">
                  <label>{t("foto_principal_label")}</label>
                  <ImageUploader
                    name="foto_principal"
                    onImageChange={handleFotoPrincipalChange}
                    multiple={false}
                    currentImage={fotoPrincipalPreview}
                    maxSize={5}
                    required={false}
                  />
                  {allErrors.foto_principal && <small className="error-text">{allErrors.foto_principal}</small>}
                </div>

                <div className="form-grupo">
                  <label>{t("galeria_label")}</label>
                  <ImageUploader
                    name="galeria_fotos"
                    onImageChange={handleGaleriaChange}
                    multiple={true}
                    maxFiles={5}
                    currentImages={galeriaPreviews}
                    maxSize={5}
                    required={false}
                  />
                  {allErrors.fotos && <small className="error-text">{allErrors.fotos}</small>}
                </div>

                <small className="form-hint">
                  <i className="fas fa-info-circle" /> {t("fotos_hint")}
                </small>
              </div>

              <div className="form-section">
                <div className="section-header">
                  <i className="fas fa-user-edit" />
                  <h3>{t("optional_data")}</h3>
                </div>

                <div className="form-grupo">
                  <label>{t("nombre_label")}</label>
                  <input
                    type="text"
                    name="nombre_reportante"
                    value={formData.nombre_reportante}
                    onChange={handleChange}
                    placeholder={t("nombre_placeholder")}
                  />
                </div>

                <div className="form-grupo">
                  <label>{t("email_label")}</label>
                  <input
                    type="email"
                    name="email_reportante"
                    value={formData.email_reportante}
                    onChange={handleFieldChange}
                    placeholder={t("email_placeholder")}
                    className={allErrors.email_reportante ? "error" : ""}
                  />
                  {allErrors.email_reportante && <small className="error-text">{allErrors.email_reportante}</small>}
                </div>

                <div className="form-grupo">
                  <label>{t("telefono_label")}</label>
                  <input
                    type="tel"
                    name="telefono_reportante"
                    value={formData.telefono_reportante}
                    onChange={handleFieldChange}
                    placeholder={t("telefono_placeholder")}
                    className={allErrors.telefono_reportante ? "error" : ""}
                  />
                  {allErrors.telefono_reportante && <small className="error-text">{allErrors.telefono_reportante}</small>}
                </div>
              </div>

              <div className="form-actions-center">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate(-1)}
                  className="btn-cancelar-rescate"
                >
                  <i className="fas fa-times" /> {t("cancel_btn")}
                </Button>
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-paw" />}
                  {loading ? ` ${t("sending")}` : ` ${t("submit_btn")}`}
                </Button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ReportarRescate;