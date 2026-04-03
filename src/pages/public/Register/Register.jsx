// src/pages/public/Register/Register.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../contexts/AuthContext";
import Button from "../../../components/common/Button/Button";
import Input from "../../../components/common/Input/Input";
import { toast } from "react-toastify";
import "./Register.css";

const Register = () => {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const { register } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [formData, setFormData] = useState({
    tipo: "user",
    nombre: "",
    apellidos: "",
    email: "",
    telefono: "",
    password: "",
    password_confirmation: "",
    nombre_entidad: "",
    direccion: "",
    registro_sanitario: "",
    servicios: [],
    capacidad: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedType, setSelectedType] = useState("user");

  const validateStep = () => {
    const newErrors = {};

    switch (currentStep) {
      case 1:
        break;
      case 2:
        if (!formData.nombre.trim()) {
          newErrors.nombre = t("nombre_requerido");
        }
        if (!formData.email.trim()) {
          newErrors.email = t("email_requerido");
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = t("email_invalido");
        }
        break;
      case 3:
        if (!formData.password) {
          newErrors.password = t("contraseña_requerida");
        } else if (formData.password.length < 8) {
          newErrors.password = t("contraseña_corta");
        }
        if (formData.password !== formData.password_confirmation) {
          newErrors.password_confirmation = t("contraseñas_no_coinciden");
        }
        break;
      case 4:
        if (selectedType === "fundacion" || selectedType === "veterinaria") {
          if (!formData.nombre_entidad && !formData.nombre) {
            newErrors.nombre_entidad = t("nombre_entidad_requerido");
          }
          if (!formData.direccion) {
            newErrors.direccion = t("direccion_requerida");
          }
          if (!formData.registro_sanitario) {
            newErrors.registro_sanitario = selectedType === "fundacion" 
              ? t("nit_requerido") 
              : t("registro_sanitario_requerido");
          }
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
        setErrors({});
        document.querySelector('.register-card')?.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
      document.querySelector('.register-card')?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: null,
      });
    }
  };

  const handleTypeChange = (tipo) => {
    setSelectedType(tipo);
    setFormData((prev) => ({ ...prev, tipo }));
    setErrors({});
  };

  const handleServiceChange = (service, checked) => {
    setFormData((prev) => ({
      ...prev,
      servicios: checked
        ? [...prev.servicios, service]
        : prev.servicios.filter((s) => s !== service),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    setLoading(true);

    const dataToSend = {
      nombre: formData.nombre,
      apellidos: formData.apellidos || null,
      email: formData.email,
      password: formData.password,
      password_confirmation: formData.password_confirmation,
      telefono: formData.telefono || null,
      tipo: selectedType,
    };

    if (selectedType === "fundacion") {
      dataToSend.nombre_entidad = formData.nombre_entidad || formData.nombre;
      dataToSend.direccion = formData.direccion;
      dataToSend.registro_sanitario = formData.registro_sanitario;
      dataToSend.capacidad = formData.capacidad ? parseInt(formData.capacidad) : null;
    }

    if (selectedType === "veterinaria") {
      dataToSend.nombre_entidad = formData.nombre_entidad || formData.nombre;
      dataToSend.direccion = formData.direccion;
      dataToSend.registro_sanitario = formData.registro_sanitario;
      dataToSend.servicios = formData.servicios;
    }

    try {
      const result = await register(dataToSend);

      if (result.success) {
        if (result.data?.requiere_aprobacion) {
          toast.success(t("exito_mensaje"), { position: "top-center", autoClose: 5000 });
          navigate("/login");
        } else {
          const dashboardPath = getDashboardPathByRole(result.user);
          toast.success(t("exito_registro"));
          navigate(dashboardPath);
        }
      } else {
        setErrors({ general: result.message });
        toast.error(result.message || t("error_registro"));
      }
    } catch (error) {
      console.error("Error en registro:", error);
      setErrors({ general: t("error_conexion") });
    } finally {
      setLoading(false);
    }
  };

  const getDashboardPathByRole = (user) => {
    if (!user) return "/login";
    switch (user.tipo) {
      case "admin": return "/admin/dashboard";
      case "veterinaria": return "/veterinaria/dashboard";
      case "fundacion": return "/fundacion/dashboard";
      default: return "/user/dashboard";
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <div className="step-icon">
              <i className="fas fa-user-plus"></i>
            </div>
            <h3 className="step-title">{t("tipo_cuenta")}</h3>
            <div className="account-type-selector">
              <button
                type="button"
                className={`type-btn ${selectedType === "user" ? "active" : ""}`}
                onClick={() => handleTypeChange("user")}
              >
                <i className="fas fa-user"></i>
                <span>{t("usuario_particular")}</span>
                <small>{t("usuario_desc")}</small>
              </button>
              <button
                type="button"
                className={`type-btn ${selectedType === "fundacion" ? "active" : ""}`}
                onClick={() => handleTypeChange("fundacion")}
              >
                <i className="fas fa-building"></i>
                <span>{t("fundacion")}</span>
                <small>{t("fundacion_desc")}</small>
              </button>
              <button
                type="button"
                className={`type-btn ${selectedType === "veterinaria" ? "active" : ""}`}
                onClick={() => handleTypeChange("veterinaria")}
              >
                <i className="fas fa-clinic-medical"></i>
                <span>{t("veterinaria")}</span>
                <small>{t("veterinaria_desc")}</small>
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <div className="step-icon">
              <i className="fas fa-id-card"></i>
            </div>
            <h3 className="step-title">{t("datos_personales")}</h3>
            <div className="form-group">
              <div className="input-group">
                <i className="fas fa-user input-icon"></i>
                <Input
                  label={t("nombre_completo")}
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  error={errors.nombre}
                  required
                  placeholder={t("nombre_placeholder")}
                />
              </div>
            </div>
            <div className="form-group">
              <div className="input-group">
                <i className="fas fa-user-tag input-icon"></i>
                <Input
                  label={t("apellidos")}
                  type="text"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  error={errors.apellidos}
                  placeholder={t("apellidos_placeholder")}
                />
              </div>
            </div>
            <div className="form-group">
              <div className="input-group">
                <i className="fas fa-envelope input-icon"></i>
                <Input
                  label={t("email")}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  required
                  placeholder={t("email_placeholder")}
                />
              </div>
            </div>
            <div className="form-group">
              <div className="input-group">
                <i className="fas fa-phone input-icon"></i>
                <Input
                  label={t("telefono")}
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  error={errors.telefono}
                  placeholder={t("telefono_placeholder")}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <div className="step-icon">
              <i className="fas fa-lock"></i>
            </div>
            <h3 className="step-title">{t("crear_contraseña")}</h3>
            <div className="form-group">
              <div className="input-group">
                <i className="fas fa-lock input-icon"></i>
                <div className="password-wrapper">
                  <Input
                    label={t("contraseña")}
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                    required
                    placeholder={t("contraseña_placeholder")}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </button>
                </div>
              </div>
            </div>
            <div className="form-group">
              <div className="input-group">
                <i className="fas fa-lock input-icon"></i>
                <div className="password-wrapper">
                  <Input
                    label={t("confirmar_contraseña")}
                    type={showConfirmPassword ? "text" : "password"}
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    error={errors.password_confirmation}
                    required
                    placeholder={t("confirmar_placeholder")}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <i className={`fas ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <div className="step-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <h3 className="step-title">
              {selectedType === "user" 
                ? t("finalizar_titulo_user")
                : selectedType === "fundacion" 
                ? t("finalizar_titulo_fundacion")
                : t("finalizar_titulo_veterinaria")}
            </h3>

            {(selectedType === "fundacion" || selectedType === "veterinaria") && (
              <>
                <div className="form-group">
                  <div className="input-group">
                    <i className="fas fa-store input-icon"></i>
                    <Input
                      label={selectedType === "fundacion" ? t("nombre_fundacion") : t("nombre_veterinaria")}
                      type="text"
                      name="nombre_entidad"
                      value={formData.nombre_entidad}
                      onChange={handleChange}
                      error={errors.nombre_entidad}
                      required
                      placeholder={selectedType === "fundacion" ? t("fundacion_placeholder") : t("veterinaria_placeholder")}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <div className="input-group">
                    <i className="fas fa-map-marker-alt input-icon"></i>
                    <Input
                      label={t("direccion")}
                      type="text"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleChange}
                      error={errors.direccion}
                      required
                      placeholder={t("direccion_placeholder")}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <div className="input-group">
                    <i className="fas fa-id-card input-icon"></i>
                    <Input
                      label={selectedType === "fundacion" ? t("nit") : t("registro_sanitario")}
                      type="text"
                      name="registro_sanitario"
                      value={formData.registro_sanitario}
                      onChange={handleChange}
                      error={errors.registro_sanitario}
                      required
                      placeholder={selectedType === "fundacion" ? t("nit_placeholder") : t("registro_placeholder")}
                    />
                  </div>
                </div>
              </>
            )}

            {selectedType === "fundacion" && (
              <div className="form-group">
                <div className="input-group">
                  <i className="fas fa-home input-icon"></i>
                  <Input
                    label={t("capacidad_maxima")}
                    type="number"
                    name="capacidad"
                    value={formData.capacidad}
                    onChange={handleChange}
                    error={errors.capacidad}
                    placeholder={t("capacidad_placeholder")}
                  />
                </div>
              </div>
            )}

            {selectedType === "veterinaria" && (
              <div className="form-group">
                <i className="fas fa-stethoscope input-icon" style={{ top: '25px' }}></i>
                <label className="form-label">{t("servicios")}</label>
                <div className="services-checkboxes">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.servicios.includes("urgencias")}
                      onChange={(e) => handleServiceChange("urgencias", e.target.checked)}
                    />
                    <span>{t("urgencias")}</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.servicios.includes("cirugia")}
                      onChange={(e) => handleServiceChange("cirugia", e.target.checked)}
                    />
                    <span>{t("cirugia")}</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.servicios.includes("vacunacion")}
                      onChange={(e) => handleServiceChange("vacunacion", e.target.checked)}
                    />
                    <span>{t("vacunacion")}</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.servicios.includes("hospitalizacion")}
                      onChange={(e) => handleServiceChange("hospitalizacion", e.target.checked)}
                    />
                    <span>{t("hospitalizacion")}</span>
                  </label>
                </div>
              </div>
            )}

            {selectedType === "user" && (
              <div className="step-success">
                <i className="fas fa-heart"></i>
                <p>{t("mensaje_user")}</p>
                <p className="step-note">{t("mensaje_revision")}</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="register-container">
      <div className="register-overlay"></div>

      <div className="register-card">
        <div className="register-header">
          <div className="register-logo-wrapper">
            <img src="/img/logo-claro.png" alt={t("logo_alt")} className="register-logo" />
          </div>
          <h1 className="register-title">{t("titulo")}</h1>
          <p className="register-subtitle">
            {t("paso")} {currentStep} {t("de")} {totalSteps}
          </p>
        </div>

        <div className="progress-steps">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`progress-step ${currentStep >= step ? "active" : ""} ${currentStep === step ? "current" : ""}`}
              onClick={() => step < currentStep && setCurrentStep(step)}
            >
              <div className="step-dot">{step}</div>
              <span className="step-label">
                {step === 1 && t("step_tipo")}
                {step === 2 && t("step_datos")}
                {step === 3 && t("step_contraseña")}
                {step === 4 && t("step_finalizar")}
              </span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {renderStep()}

          {errors.general && (
            <div className="error-general">
              <i className="fas fa-exclamation-circle"></i>
              {errors.general}
            </div>
          )}

          <div className="step-buttons">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="btn-prev"
              >
                <i className="fas fa-arrow-left"></i>
                {t("anterior")}
              </Button>
            )}
            
            {currentStep < totalSteps ? (
              <Button
                type="button"
                variant="primary"
                onClick={nextStep}
                className="btn-next"
              >
                {t("siguiente")}
                <i className="fas fa-arrow-right"></i>
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="btn-submit"
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    {t("registrando")}
                  </>
                ) : (
                  <>
                    <i className="fas fa-check"></i>
                    {t("finalizar")}
                  </>
                )}
              </Button>
            )}
          </div>
        </form>

        <div className="login-link">
          {t("ya_tienes_cuenta")} <Link to="/login">{t("iniciar_sesion")}</Link>
        </div>
      </div>

      <div className="register-decoration">
        <div className="decoration-circle circle-1"></div>
        <div className="decoration-circle circle-2"></div>
        <div className="decoration-circle circle-3"></div>
      </div>
    </div>
  );
};

export default Register;