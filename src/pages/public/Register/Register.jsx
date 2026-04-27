// src/pages/public/Register/Register.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../contexts/AuthContext";
import Button from "../../../components/common/Button/Button";
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
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedType, setSelectedType] = useState("user");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  
  const [currentBackground, setCurrentBackground] = useState(1);
  const [currentQuote, setCurrentQuote] = useState(0);

  const backgroundImages = [
    '/img/login/login1.jpg',
    '/img/login/login2.jpg',
    '/img/login/login3.jpg',
    '/img/login/login4.jpg',
    '/img/login/login5.jpg'
  ];

  const motivationalQuotes = [
    t('quotes.quote1', { defaultValue: 'Adoptar no es comprar, es salvar una vida' }),
    t('quotes.quote2', { defaultValue: 'Ellos no necesitan palabras, solo amor y un hogar' }),
    t('quotes.quote3', { defaultValue: 'Un amigo fiel te espera para cambiar tu vida' }),
    t('quotes.quote4', { defaultValue: 'La mejor inversión es dar amor a quien no lo tiene' }),
    t('quotes.quote5', { defaultValue: 'Cada mascota rescatada es una historia de esperanza' })
  ];

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    const interval = setInterval(() => {
      setCurrentBackground((prev) => {
        const nextIndex = (prev) % backgroundImages.length + 1;
        return nextIndex;
      });
    }, 5000);
    
    const quoteInterval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % motivationalQuotes.length);
    }, 5000);

    return () => {
      document.body.style.overflow = 'auto';
      clearInterval(interval);
      clearInterval(quoteInterval);
    };
  }, []);

  useEffect(() => {
    const container = document.querySelector('.register-container');
    if (container) {
      container.style.backgroundImage = `url('${backgroundImages[currentBackground - 1]}')`;
    }
  }, [currentBackground]);

  // Validación de email en tiempo real con API
  const checkEmailExists = async (email) => {
    if (!email || !validateEmail(email)) return false;
    
    try {
      const response = await fetch(`http://localhost:8000/api/auth/check-email?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error("Error checking email:", error);
      return false;
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    if (!phone) return true;
    const phoneRegex = /^[0-9]{7,15}$/;
    return phoneRegex.test(phone);
  };

  useEffect(() => {
    if (touched.email && formData.email) {
      const timeoutId = setTimeout(async () => {
        if (!validateEmail(formData.email)) {
          setErrors(prev => ({ ...prev, email: t('email_invalido') }));
        } else {
          setIsCheckingEmail(true);
          const exists = await checkEmailExists(formData.email);
          setIsCheckingEmail(false);
          if (exists) {
            setErrors(prev => ({ ...prev, email: t('email_registrado') }));
          } else {
            setErrors(prev => ({ ...prev, email: "" }));
          }
        }
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [formData.email]);

  useEffect(() => {
    if (touched.password && formData.password) {
      validateField("password", formData.password);
    }
    if (touched.password_confirmation && formData.password_confirmation) {
      validateField("password_confirmation", formData.password_confirmation);
    }
  }, [formData.password, formData.password_confirmation]);

  const validateField = (field, value) => {
    let error = "";
    
    switch (field) {
      case "nombre":
        if (!value.trim()) {
          error = t('nombre_requerido');
        } else if (value.length < 2) {
          error = t('nombre_minimo');
        }
        break;
      case "email":
        if (!value.trim()) {
          error = t('email_requerido');
        } else if (!validateEmail(value)) {
          error = t('email_invalido');
        }
        break;
      case "telefono":
        if (value && !validatePhone(value)) {
          error = t('telefono_invalido');
        }
        break;
      case "password":
        if (!value) {
          error = t('contraseña_requerida');
        } else if (value.length < 8) {
          error = t('contraseña_corta');
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          error = t('contraseña_invalida');
        }
        break;
      case "password_confirmation":
        if (value !== formData.password) {
          error = t('contraseñas_no_coinciden');
        }
        break;
      case "nombre_entidad":
        if (!value.trim()) {
          error = selectedType === "fundacion" ? t('nombre_fundacion_requerido') : t('nombre_veterinaria_requerido');
        }
        break;
      case "direccion":
        if (!value.trim()) {
          error = t('direccion_requerida');
        }
        break;
      case "registro_sanitario":
        if (!value.trim()) {
          error = selectedType === "fundacion" ? t('nit_requerido_error') : t('registro_sanitario_requerido_error');
        } else if (value.length < 3) {
          error = selectedType === "fundacion" ? t('nit_minimo') : t('registro_sanitario_minimo');
        }
        break;
      default:
        break;
    }
    
    setErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const validateStep = () => {
    let isValid = true;
    const fieldsToValidate = [];
    
    switch (currentStep) {
      case 1:
        if (!selectedType) {
          toast.error(t('error_tipo_cuenta'));
          isValid = false;
        }
        break;
      case 2:
        fieldsToValidate.push("nombre", "email");
        if (formData.telefono) fieldsToValidate.push("telefono");
        break;
      case 3:
        fieldsToValidate.push("password", "password_confirmation");
        break;
      case 4:
        if (selectedType === "fundacion" || selectedType === "veterinaria") {
          fieldsToValidate.push("nombre_entidad", "direccion", "registro_sanitario");
        }
        break;
    }
    
    fieldsToValidate.forEach(field => {
      setTouched(prev => ({ ...prev, [field]: true }));
      if (!validateField(field, formData[field])) {
        isValid = false;
      }
    });
    
    if (!isValid) {
      toast.error(t('error_general'));
    }
    
    return isValid;
  };

  const nextStep = () => {
    if (validateStep()) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleChange = (e) => {
    let value = e.target.value;
    const field = e.target.name;
    
    if (field === "telefono") {
      value = value.replace(/[^0-9]/g, "");
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleTypeChange = (tipo) => {
    setSelectedType(tipo);
    setFormData(prev => ({ ...prev, tipo }));
    setErrors({});
    setTouched({});
  };

  const handleServiceChange = (service, checked) => {
    setFormData(prev => ({
      ...prev,
      servicios: checked
        ? [...prev.servicios, service]
        : prev.servicios.filter(s => s !== service),
    }));
  };

  // 🔥 CORREGIDO: Volver al home
  const handleGoBack = () => {
    navigate(-1);
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
        let message = "";
        if (selectedType === "fundacion") {
          message = t('exito_mensaje_fundacion');
        } else if (selectedType === "veterinaria") {
          message = t('exito_mensaje_veterinaria');
        } else {
          message = t('exito_mensaje_user');
        }
        
        setSuccessMessage(message);
        setRegistrationSuccess(true);
      } else {
        let errorMsg = "";
        
        if (result.message?.includes("email") && result.message?.includes("already taken")) {
          errorMsg = t('error_email_duplicado');
          setErrors(prev => ({ ...prev, email: t('email_registrado') }));
          setTouched(prev => ({ ...prev, email: true }));
          setCurrentStep(2);
        } else if (result.message?.includes("registro_sanitario")) {
          errorMsg = t('error_registro_sanitario_duplicado');
          setErrors(prev => ({ ...prev, registro_sanitario: t('registro_sanitario_registrado') }));
          setTouched(prev => ({ ...prev, registro_sanitario: true }));
        } else {
          errorMsg = result.message || t('error_registro_general');
        }
        
        if (errorMsg) {
          toast.error(errorMsg, { autoClose: 5000 });
        }
      }
    } catch (error) {
      console.error("Error en registro:", error);
      let errorMsg = t('error_conexion');
      
      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        if (backendErrors.email) {
          errorMsg = backendErrors.email[0];
          setErrors(prev => ({ ...prev, email: backendErrors.email[0] }));
          setTouched(prev => ({ ...prev, email: true }));
          setCurrentStep(2);
        } else if (backendErrors.registro_sanitario) {
          errorMsg = backendErrors.registro_sanitario[0];
          setErrors(prev => ({ ...prev, registro_sanitario: backendErrors.registro_sanitario[0] }));
          setTouched(prev => ({ ...prev, registro_sanitario: true }));
        } else {
          errorMsg = Object.values(backendErrors).flat()[0];
        }
      }
      
      toast.error(errorMsg, { autoClose: 5000 });
    } finally {
      setLoading(false);
    }
  };

  if (registrationSuccess) {
    return (
      <div className="register-page">
        <div className="register-success-fullscreen">
          <div className="register-success-card">
            <div className="success-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <h2>{t('exito_titulo')}</h2>
            <div className="success-message">
              {successMessage.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
            {(selectedType === "fundacion" || selectedType === "veterinaria") && (
              <div className="success-info">
                <i className="fas fa-info-circle"></i>
                <p>{selectedType === "fundacion" ? t('exito_info_fundacion') : t('exito_info_veterinaria')}</p>
              </div>
            )}
            <div className="register-success-buttons">
              <Link to="/" className="register-btn-success-primary">
                <i className="fas fa-home"></i>
                {t('exito_boton_inicio')}
              </Link>
              {selectedType === "user" && (
                <Link to="/" className="register-btn-success-secondary">
                  <i className="fas fa-paw"></i>
                  {t('exito_boton_explorar')}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <div className="step-icon">
              <i className="fas fa-user-plus"></i>
            </div>
            <h3 className="step-title">{t('tipo_cuenta')}</h3>
            <div className="account-type-selector">
              <button
                type="button"
                className={`type-btn ${selectedType === "user" ? "active" : ""}`}
                onClick={() => handleTypeChange("user")}
              >
                <i className="fas fa-user"></i>
                <span>{t('usuario_particular')}</span>
                <small>{t('usuario_desc')}</small>
              </button>
              <button
                type="button"
                className={`type-btn ${selectedType === "fundacion" ? "active" : ""}`}
                onClick={() => handleTypeChange("fundacion")}
              >
                <i className="fas fa-building"></i>
                <span>{t('fundacion')}</span>
                <small>{t('fundacion_desc')}</small>
              </button>
              <button
                type="button"
                className={`type-btn ${selectedType === "veterinaria" ? "active" : ""}`}
                onClick={() => handleTypeChange("veterinaria")}
              >
                <i className="fas fa-clinic-medical"></i>
                <span>{t('veterinaria')}</span>
                <small>{t('veterinaria_desc')}</small>
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
            <h3 className="step-title">{t('datos_personales')}</h3>
            
            <div className="register-form-group">
              <label className="register-form-label">
                {t('nombre_completo')} <span className="register-required">*</span>
              </label>
              <div className={`register-input-wrapper ${errors.nombre && touched.nombre ? "error" : ""}`}>
                <i className="fas fa-user register-input-icon"></i>
                <input
                  type="text"
                  name="nombre"
                  className="register-form-input"
                  value={formData.nombre}
                  onChange={handleChange}
                  onBlur={() => handleBlur("nombre")}
                  placeholder="Ej: Juan Pérez"
                />
              </div>
              {errors.nombre && touched.nombre && (
                <div className="register-field-error">{errors.nombre}</div>
              )}
            </div>

            <div className="register-form-group">
              <label className="register-form-label">{t('apellidos')}</label>
              <div className="register-input-wrapper">
                <i className="fas fa-user-tag register-input-icon"></i>
                <input
                  type="text"
                  name="apellidos"
                  className="register-form-input"
                  value={formData.apellidos}
                  onChange={handleChange}
                  placeholder={t('apellidos_placeholder')}
                />
              </div>
            </div>

            <div className="register-form-group">
              <label className="register-form-label">
                {t('email')} <span className="register-required">*</span>
              </label>
              <div className={`register-input-wrapper ${errors.email && touched.email ? "error" : ""}`}>
                <i className="fas fa-envelope register-input-icon"></i>
                <input
                  type="email"
                  name="email"
                  className="register-form-input"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur("email")}
                  placeholder={t('email_placeholder')}
                />
                {isCheckingEmail && (
                  <div className="input-loading">
                    <i className="fas fa-spinner fa-spin"></i>
                  </div>
                )}
              </div>
              {errors.email && touched.email && (
                <div className="register-field-error">{errors.email}</div>
              )}
              <small className="register-field-hint">{t('email_hint')}</small>
            </div>

            <div className="register-form-group">
              <label className="register-form-label">{t('telefono')}</label>
              <div className={`register-input-wrapper ${errors.telefono && touched.telefono ? "error" : ""}`}>
                <i className="fas fa-phone register-input-icon"></i>
                <input
                  type="tel"
                  name="telefono"
                  className="register-form-input"
                  value={formData.telefono}
                  onChange={handleChange}
                  onBlur={() => handleBlur("telefono")}
                  placeholder={t('telefono_placeholder')}
                />
              </div>
              {errors.telefono && touched.telefono && (
                <div className="register-field-error">{errors.telefono}</div>
              )}
              <small className="register-field-hint">{t('telefono_hint')}</small>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <div className="step-icon">
              <i className="fas fa-lock"></i>
            </div>
            <h3 className="step-title">{t('crear_contraseña')}</h3>
            
            <div className="register-form-group">
              <label className="register-form-label">
                {t('contraseña')} <span className="register-required">*</span>
              </label>
              <div className={`register-input-wrapper ${errors.password && touched.password ? "error" : ""}`}>
                <i className="fas fa-lock register-input-icon"></i>
                <div className="register-password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="register-form-input"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={() => handleBlur("password")}
                    placeholder={t('contraseña_placeholder')}
                  />
                  <button
                    type="button"
                    className="register-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </button>
                </div>
              </div>
              {errors.password && touched.password && (
                <div className="register-field-error">{errors.password}</div>
              )}
              <div className="register-password-requirements">
                <span className={formData.password.length >= 8 ? "valid" : "invalid"}>
                  <i className={`fas ${formData.password.length >= 8 ? "fa-check-circle" : "fa-circle"}`}></i>
                  {t('requisitos_longitud')}
                </span>
                <span className={/(?=.*[A-Z])/.test(formData.password) ? "valid" : "invalid"}>
                  <i className={`fas ${/(?=.*[A-Z])/.test(formData.password) ? "fa-check-circle" : "fa-circle"}`}></i>
                  {t('requisitos_mayuscula')}
                </span>
                <span className={/(?=.*[a-z])/.test(formData.password) ? "valid" : "invalid"}>
                  <i className={`fas ${/(?=.*[a-z])/.test(formData.password) ? "fa-check-circle" : "fa-circle"}`}></i>
                  {t('requisitos_minuscula')}
                </span>
                <span className={/(?=.*\d)/.test(formData.password) ? "valid" : "invalid"}>
                  <i className={`fas ${/(?=.*\d)/.test(formData.password) ? "fa-check-circle" : "fa-circle"}`}></i>
                  {t('requisitos_numero')}
                </span>
              </div>
            </div>

            <div className="register-form-group">
              <label className="register-form-label">
                {t('confirmar_contraseña')} <span className="register-required">*</span>
              </label>
              <div className={`register-input-wrapper ${errors.password_confirmation && touched.password_confirmation ? "error" : ""}`}>
                <i className="fas fa-lock register-input-icon"></i>
                <div className="register-password-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="password_confirmation"
                    className="register-form-input"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    onBlur={() => handleBlur("password_confirmation")}
                    placeholder={t('confirmar_placeholder')}
                  />
                  <button
                    type="button"
                    className="register-password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <i className={`fas ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </button>
                </div>
              </div>
              {errors.password_confirmation && touched.password_confirmation && (
                <div className="register-field-error">{errors.password_confirmation}</div>
              )}
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
                ? t('finalizar_titulo_user')
                : selectedType === "fundacion" 
                ? t('finalizar_titulo_fundacion')
                : t('finalizar_titulo_veterinaria')}
            </h3>

            {(selectedType === "fundacion" || selectedType === "veterinaria") && (
              <>
                <div className="register-form-group">
                  <label className="register-form-label">
                    {selectedType === "fundacion" ? t('nombre_fundacion') : t('nombre_veterinaria')} <span className="register-required">*</span>
                  </label>
                  <div className={`register-input-wrapper ${errors.nombre_entidad && touched.nombre_entidad ? "error" : ""}`}>
                    <i className="fas fa-store register-input-icon"></i>
                    <input
                      type="text"
                      name="nombre_entidad"
                      className="register-form-input"
                      value={formData.nombre_entidad}
                      onChange={handleChange}
                      onBlur={() => handleBlur("nombre_entidad")}
                      placeholder={selectedType === "fundacion" ? t('nombre_fundacion_placeholder') : t('nombre_veterinaria_placeholder')}
                    />
                  </div>
                  {errors.nombre_entidad && touched.nombre_entidad && (
                    <div className="register-field-error">{errors.nombre_entidad}</div>
                  )}
                </div>

                <div className="register-form-group">
                  <label className="register-form-label">
                    {t('direccion')} <span className="register-required">*</span>
                  </label>
                  <div className={`register-input-wrapper ${errors.direccion && touched.direccion ? "error" : ""}`}>
                    <i className="fas fa-map-marker-alt register-input-icon"></i>
                    <input
                      type="text"
                      name="direccion"
                      className="register-form-input"
                      value={formData.direccion}
                      onChange={handleChange}
                      onBlur={() => handleBlur("direccion")}
                      placeholder={t('direccion_placeholder')}
                    />
                  </div>
                  {errors.direccion && touched.direccion && (
                    <div className="register-field-error">{errors.direccion}</div>
                  )}
                </div>

                <div className="register-form-group">
                  <label className="register-form-label">
                    {selectedType === "fundacion" ? t('nit') : t('registro_sanitario')} <span className="register-required">*</span>
                  </label>
                  <div className={`register-input-wrapper ${errors.registro_sanitario && touched.registro_sanitario ? "error" : ""}`}>
                    <i className="fas fa-id-card register-input-icon"></i>
                    <input
                      type="text"
                      name="registro_sanitario"
                      className="register-form-input"
                      value={formData.registro_sanitario}
                      onChange={handleChange}
                      onBlur={() => handleBlur("registro_sanitario")}
                      placeholder={selectedType === "fundacion" ? t('nit_placeholder') : t('registro_sanitario_placeholder')}
                    />
                  </div>
                  {errors.registro_sanitario && touched.registro_sanitario && (
                    <div className="register-field-error">{errors.registro_sanitario}</div>
                  )}
                </div>
              </>
            )}

            {selectedType === "fundacion" && (
              <div className="register-form-group">
                <label className="register-form-label">{t('capacidad_maxima')}</label>
                <div className="register-input-wrapper">
                  <i className="fas fa-home register-input-icon"></i>
                  <input
                    type="number"
                    name="capacidad"
                    className="register-form-input"
                    value={formData.capacidad}
                    onChange={handleChange}
                    placeholder={t('capacidad_placeholder')}
                    min="1"
                  />
                </div>
                <small className="register-field-hint">{t('capacidad_hint')}</small>
              </div>
            )}

            {selectedType === "veterinaria" && (
              <div className="register-form-group">
                <label className="register-form-label">{t('servicios')}</label>
                <div className="register-services-checkboxes">
                  <label className="register-checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.servicios.includes("urgencias")}
                      onChange={(e) => handleServiceChange("urgencias", e.target.checked)}
                    />
                    <span>{t('servicios_urgencias')}</span>
                  </label>
                  <label className="register-checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.servicios.includes("cirugia")}
                      onChange={(e) => handleServiceChange("cirugia", e.target.checked)}
                    />
                    <span>{t('servicios_cirugia')}</span>
                  </label>
                  <label className="register-checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.servicios.includes("vacunacion")}
                      onChange={(e) => handleServiceChange("vacunacion", e.target.checked)}
                    />
                    <span>{t('servicios_vacunacion')}</span>
                  </label>
                  <label className="register-checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.servicios.includes("hospitalizacion")}
                      onChange={(e) => handleServiceChange("hospitalizacion", e.target.checked)}
                    />
                    <span>{t('servicios_hospitalizacion')}</span>
                  </label>
                </div>
              </div>
            )}

            {selectedType === "user" && (
              <div className="register-step-success">
                <i className="fas fa-heart"></i>
                <p>{t('mensaje_user')}</p>
                <p>{t('mensaje_user_lista')}</p>
                <ul>
                  <li>{t('mensaje_user_item1')}</li>
                  <li>{t('mensaje_user_item2')}</li>
                  <li>{t('mensaje_user_item3')}</li>
                  <li>{t('mensaje_user_item4')}</li>
                </ul>
              </div>
            )}

            <div className="register-info-box">
              <i className="fas fa-shield-alt"></i>
              <p>{t('info_seguridad')}</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-overlay"></div>

        {/* 🔥 Botón de volver atrás con clase encapsulada */}
        <button 
          className="register-back-button"
          onClick={handleGoBack}
          aria-label={t('buttons.back')}
        >
          <i className="fas fa-arrow-left"></i>
          <span>{t('buttons.back')}</span>
        </button>

        <div className="register-card">
          <div className="register-header">
            <div className="register-logo-wrapper">
              <img src="/img/logo-claro.png" alt="Logo" className="register-logo" />
            </div>
            <h1 className="register-title">{t('titulo')}</h1>
            <p className="register-subtitle">
              {t('paso')} {currentStep} {t('de')} {totalSteps}
            </p>
          </div>

          <div className="progress-steps">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`progress-step ${currentStep >= step ? "active" : ""} ${currentStep > step ? "completed" : ""} ${currentStep === step ? "current" : ""}`}
                onClick={() => step < currentStep && setCurrentStep(step)}
              >
                <div className="step-dot">
                  {currentStep > step ? <i className="fas fa-check"></i> : step}
                </div>
                <span className="step-label">
                  {step === 1 && t('step_tipo')}
                  {step === 2 && t('step_datos')}
                  {step === 3 && t('step_contraseña')}
                  {step === 4 && t('step_finalizar')}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {renderStep()}

            <div className="register-step-buttons">
              {currentStep > 1 && (
                <Button type="button" variant="outline" onClick={prevStep} className="register-btn-prev">
                  <i className="fas fa-arrow-left"></i>
                  {t('anterior')}
                </Button>
              )}
              
              {currentStep < totalSteps ? (
                <Button type="button" variant="primary" onClick={nextStep} className="register-btn-next">
                  {t('siguiente')}
                  <i className="fas fa-arrow-right"></i>
                </Button>
              ) : (
                <Button type="submit" variant="primary" disabled={loading} className="register-btn-submit">
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      {t('registrando')}
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check"></i>
                      {t('finalizar')}
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>

          <div className="register-login-link">
            {t('ya_tienes_cuenta')} <Link to="/login">{t('iniciar_sesion')}</Link>
          </div>
        </div>

        {/* 🔥 Texto motivacional */}
        <div className="register-motivational-text">
          <p className="register-motivational-quote">
            <i className="fas fa-paw"></i>
            <span>{motivationalQuotes[currentQuote]}</span>
            <i className="fas fa-heart"></i>
          </p>
        </div>

        {/* 🔥 Decoración encapsulada */}
        <div className="register-decoration">
          <div className="register-decoration-circle circle-1"></div>
          <div className="register-decoration-circle circle-2"></div>
          <div className="register-decoration-circle circle-3"></div>
        </div>

        {/* 🔥 Indicadores de imagen encapsulados */}
        <div className="register-image-indicators">
          {backgroundImages.map((_, index) => (
            <span 
              key={index}
              className={`register-indicator ${currentBackground === index + 1 ? 'active' : ''}`}
              onClick={() => setCurrentBackground(index + 1)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Register;