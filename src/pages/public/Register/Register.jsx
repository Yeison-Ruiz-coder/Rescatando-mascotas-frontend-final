// src/pages/public/Register/Register.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../contexts/AuthContext";
import { toast } from "react-toastify";
import "./Register.css";

const Register = () => {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const { register } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [submitted, setSubmitted] = useState(false);

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
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // 🔥 VERIFICACIÓN DE EMAIL
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);

  const [currentBackground, setCurrentBackground] = useState(0);
  const [currentQuote, setCurrentQuote] = useState(0);

  // 🔥 URL DE LA API EN RAILWAY
  const API_URL =
    "https://rescatando-mascotas-backend-final-production.up.railway.app";

  const backgroundImages = [
    "/img/login/login1.jpg",
    "/img/login/login2.jpg",
    "/img/login/login3.jpg",
    "/img/login/login4.jpg",
    "/img/login/login5.jpg",
  ];

  const motivationalQuotes = [
    t("quotes.quote1", {
      defaultValue: "Adoptar no es comprar, es salvar una vida",
    }),
    t("quotes.quote2", {
      defaultValue: "Ellos no necesitan palabras, solo amor y un hogar",
    }),
    t("quotes.quote3", {
      defaultValue: "Un amigo fiel te espera para cambiar tu vida",
    }),
    t("quotes.quote4", {
      defaultValue: "La mejor inversión es dar amor a quien no lo tiene",
    }),
    t("quotes.quote5", {
      defaultValue: "Cada mascota rescatada es una historia de esperanza",
    }),
  ];

  // Imágenes rotativas
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBackground((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);

    const quoteInterval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % motivationalQuotes.length);
    }, 5000);

    return () => {
      clearInterval(interval);
      clearInterval(quoteInterval);
    };
  }, []);

  // ============================================
  // 🔥 VERIFICACIÓN DE EMAIL EN TIEMPO REAL
  // ============================================

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const checkEmailExists = async (email) => {
    if (!email || !validateEmail(email)) {
      setEmailExists(false);
      setEmailChecked(false);
      return false;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/auth/check-email?email=${encodeURIComponent(email)}`,
      );

      if (!response.ok) {
        console.warn(
          "⚠️ El endpoint no respondió correctamente:",
          response.status,
        );
        setEmailChecked(false);
        return false;
      }

      const data = await response.json();
      console.log("📡 Respuesta del backend:", data);

      if (data.data?.exists) {
        setEmailExists(true);
        setEmailChecked(true);
        setErrors((prev) => ({
          ...prev,
          email: data.data.mensaje || t("email_registrado") || "Este correo ya está registrado",
        }));
      } else {
        setEmailExists(false);
        setEmailChecked(true);
        setErrors((prev) => ({ ...prev, email: "" }));
      }

      return data.data?.exists === true;
    } catch (error) {
      console.error("Error checking email:", error);
      setEmailChecked(false);
      return false;
    }
  };

  // Verificar email con debounce
  useEffect(() => {
    const email = formData.email;
    
    if (!email || !validateEmail(email)) {
      setEmailExists(false);
      setEmailChecked(false);
      setErrors((prev) => ({ ...prev, email: "" }));
      return;
    }

    setEmailChecked(false);

    const timeoutId = setTimeout(async () => {
      setIsCheckingEmail(true);
      await checkEmailExists(email);
      setIsCheckingEmail(false);
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      setIsCheckingEmail(false);
    };
  }, [formData.email]);

  const validatePhone = (phone) => {
    if (!phone) return true;
    const phoneRegex = /^[0-9]{7,15}$/;
    return phoneRegex.test(phone);
  };

  // ============================================
  // VALIDACIONES
  // ============================================

  const validateField = (field, value) => {
    let error = "";

    switch (field) {
      case "nombre":
        if (!value.trim()) {
          error = t("nombre_requerido") || "El nombre es requerido";
        } else if (value.length < 2) {
          error =
            t("nombre_minimo") || "El nombre debe tener al menos 2 caracteres";
        }
        break;
      case "email":
        if (!value.trim()) {
          error = t("email_requerido") || "El correo electrónico es requerido";
        } else if (!validateEmail(value)) {
          error = t("email_invalido") || "Ingresa un correo electrónico válido";
        } else if (emailExists && emailChecked) {
          error = t("email_registrado") || "Este correo ya está registrado";
        }
        break;
      case "telefono":
        if (value && !validatePhone(value)) {
          error =
            t("telefono_invalido") ||
            "Ingresa un teléfono válido (mínimo 7 dígitos)";
        }
        break;
      case "password":
        if (!value) {
          error = t("contraseña_requerida") || "La contraseña es requerida";
        } else if (value.length < 8) {
          error =
            t("contraseña_corta") ||
            "La contraseña debe tener al menos 8 caracteres";
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          error =
            t("contraseña_invalida") ||
            "La contraseña debe tener mayúscula, minúscula y número";
        }
        break;
      case "password_confirmation":
        if (value !== formData.password) {
          error =
            t("contraseñas_no_coinciden") || "Las contraseñas no coinciden";
        }
        break;
      default:
        break;
    }

    return error;
  };

  const validateEntityField = (field, value) => {
    let error = "";

    switch (field) {
      case "nombre_entidad":
        if (!value.trim()) {
          error =
            selectedType === "fundacion"
              ? t("nombre_fundacion_requerido")
              : t("nombre_veterinaria_requerido");
        }
        break;
      case "direccion":
        if (!value.trim()) {
          error = t("direccion_requerida") || "La dirección es requerida";
        }
        break;
      case "registro_sanitario":
        if (!value.trim()) {
          error =
            selectedType === "fundacion"
              ? t("nit_requerido_error")
              : t("registro_sanitario_requerido_error");
        } else if (value.length < 3) {
          error =
            selectedType === "fundacion"
              ? t("nit_minimo")
              : t("registro_sanitario_minimo");
        }
        break;
      default:
        break;
    }

    return error;
  };

  const validateStep = () => {
    const newErrors = {};
    let isValid = true;

    switch (currentStep) {
      case 1:
        if (!selectedType) {
          // ✅ CORREGIDO: usar traducción
          newErrors.tipo = t("seleccionar_tipo") || "Selecciona un tipo de cuenta";
          isValid = false;
        }
        break;
      case 2:
        const nombreError = validateField("nombre", formData.nombre);
        const emailError = validateField("email", formData.email);
        const telefonoError = formData.telefono
          ? validateField("telefono", formData.telefono)
          : "";

        if (nombreError) {
          newErrors.nombre = nombreError;
          isValid = false;
        }
        if (emailError) {
          newErrors.email = emailError;
          isValid = false;
        }
        if (telefonoError) {
          newErrors.telefono = telefonoError;
          isValid = false;
        }
        break;
      case 3:
        const passwordError = validateField("password", formData.password);
        const confirmError = validateField(
          "password_confirmation",
          formData.password_confirmation,
        );

        if (passwordError) {
          newErrors.password = passwordError;
          isValid = false;
        }
        if (confirmError) {
          newErrors.password_confirmation = confirmError;
          isValid = false;
        }
        break;
      case 4:
        break;
    }

    setErrors(newErrors);
    return isValid;
  };

  const validateFullForm = () => {
    const newErrors = {};
    let isValid = true;

    const nombreError = validateField("nombre", formData.nombre);
    const emailError = validateField("email", formData.email);
    const telefonoError = formData.telefono
      ? validateField("telefono", formData.telefono)
      : "";

    if (nombreError) {
      newErrors.nombre = nombreError;
      isValid = false;
    }
    if (emailError) {
      newErrors.email = emailError;
      isValid = false;
    }
    if (telefonoError) {
      newErrors.telefono = telefonoError;
      isValid = false;
    }

    const passwordError = validateField("password", formData.password);
    const confirmError = validateField(
      "password_confirmation",
      formData.password_confirmation,
    );

    if (passwordError) {
      newErrors.password = passwordError;
      isValid = false;
    }
    if (confirmError) {
      newErrors.password_confirmation = confirmError;
      isValid = false;
    }

    if (selectedType === "fundacion" || selectedType === "veterinaria") {
      const nombreEntidadError = validateEntityField(
        "nombre_entidad",
        formData.nombre_entidad,
      );
      const direccionError = validateEntityField(
        "direccion",
        formData.direccion,
      );
      const registroError = validateEntityField(
        "registro_sanitario",
        formData.registro_sanitario,
      );

      if (nombreEntidadError) {
        newErrors.nombre_entidad = nombreEntidadError;
        isValid = false;
      }
      if (direccionError) {
        newErrors.direccion = direccionError;
        isValid = false;
      }
      if (registroError) {
        newErrors.registro_sanitario = registroError;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  // ============================================
  // NAVEGACIÓN
  // ============================================

  const nextStep = () => {
    if (currentStep === 2) {
      if (emailExists && emailChecked) {
        setSubmitted(true);
        setErrors((prev) => ({
          ...prev,
          email: t("email_registrado") || "Este correo ya está registrado",
        }));
        toast.error(t("email_registrado") || "Este correo ya está registrado");
        return;
      }
      
      if (!emailChecked && formData.email && validateEmail(formData.email)) {
        // ✅ CORREGIDO: usar traducción
        toast.info(t("verificando_email") || "Verificando correo electrónico...");
        return;
      }
    }

    setSubmitted(true);
    if (validateStep()) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
        setSubmitted(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setSubmitted(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleChange = (e) => {
    let value = e.target.value;
    const field = e.target.name;

    if (field === "telefono") {
      value = value.replace(/[^0-9]/g, "");
    }

    setFormData((prev) => ({ ...prev, [field]: value }));

    if (submitted && errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    if (field === "email") {
      setEmailExists(false);
      setEmailChecked(false);
    }
  };

  const handleTypeChange = (tipo) => {
    setSelectedType(tipo);
    setFormData((prev) => ({ ...prev, tipo }));
    if (submitted) {
      setErrors({});
    }
  };

  const handleServiceChange = (service, checked) => {
    setFormData((prev) => ({
      ...prev,
      servicios: checked
        ? [...prev.servicios, service]
        : prev.servicios.filter((s) => s !== service),
    }));
  };

  const handleGoHome = () => {
    navigate("/");
  };

  // ============================================
  // ENVÍO DEL FORMULARIO
  // ============================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (emailExists && emailChecked) {
      setSubmitted(true);
      setErrors((prev) => ({
        ...prev,
        email: t("email_registrado") || "Este correo ya está registrado",
      }));
      toast.error(t("email_registrado") || "Este correo ya está registrado");
      return;
    }

    if (!emailChecked && formData.email && validateEmail(formData.email)) {
      setIsCheckingEmail(true);
      const exists = await checkEmailExists(formData.email);
      setIsCheckingEmail(false);
      
      if (exists) {
        toast.error(t("email_registrado") || "Este correo ya está registrado");
        return;
      }
    }

    setSubmitted(true);

    if (!validateFullForm()) {
      return;
    }

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
      dataToSend.capacidad = formData.capacidad
        ? parseInt(formData.capacidad)
        : null;
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
        const requiereAprobacion =
          selectedType === "fundacion" || selectedType === "veterinaria";

        if (selectedType === "fundacion") {
          message =
            t("exito_mensaje_fundacion") ||
            "Tu solicitud de registro ha sido enviada. Un administrador la revisará pronto.";
        } else if (selectedType === "veterinaria") {
          message =
            t("exito_mensaje_veterinaria") ||
            "Tu solicitud de registro ha sido enviada. Un administrador la revisará pronto.";
        } else {
          message = t("exito_mensaje_user") || "¡Registro exitoso! Bienvenido.";
        }

        setSuccessMessage(message);
        setRegistrationSuccess(true);

        if (requiereAprobacion) {
          // ✅ CORREGIDO: usar traducción
          toast.info(
            t("registro_pendiente_aprobacion") ||
            "Tu registro está pendiente de aprobación por un administrador"
          );
        }
      } else {
        let errorMsg = "";

        if (
          result.message?.includes("email") &&
          result.message?.includes("already taken")
        ) {
          errorMsg = t("error_email_duplicado");
          setErrors((prev) => ({ ...prev, email: t("email_registrado") }));
          setCurrentStep(2);
        } else if (result.message?.includes("registro_sanitario")) {
          errorMsg = t("error_registro_sanitario_duplicado");
          setErrors((prev) => ({
            ...prev,
            registro_sanitario: t("registro_sanitario_registrado"),
          }));
        } else {
          errorMsg = result.message || t("error_registro_general");
        }

        if (errorMsg) {
          toast.error(errorMsg, { autoClose: 5000 });
        }
      }
    } catch (error) {
      console.error("Error en registro:", error);
      let errorMsg = t("error_conexion");

      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        if (backendErrors.email) {
          errorMsg = backendErrors.email[0];
          setErrors((prev) => ({ ...prev, email: backendErrors.email[0] }));
          setCurrentStep(2);
        } else if (backendErrors.registro_sanitario) {
          errorMsg = backendErrors.registro_sanitario[0];
          setErrors((prev) => ({
            ...prev,
            registro_sanitario: backendErrors.registro_sanitario[0],
          }));
        } else {
          errorMsg = Object.values(backendErrors).flat()[0];
        }
      }

      toast.error(errorMsg, { autoClose: 5000 });
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // RENDER
  // ============================================

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="register-form">
            <div className="register-type-selector">
              <button
                type="button"
                className={`register-type-btn ${selectedType === "user" ? "active" : ""}`}
                onClick={() => handleTypeChange("user")}
              >
                <i className="fas fa-user"></i>
                <div className="type-info">
                  <div className="type-name">{t("usuario_particular")}</div>
                  <div className="type-desc">{t("usuario_desc")}</div>
                </div>
              </button>
              <button
                type="button"
                className={`register-type-btn ${selectedType === "fundacion" ? "active" : ""}`}
                onClick={() => handleTypeChange("fundacion")}
              >
                <i className="fas fa-building"></i>
                <div className="type-info">
                  <div className="type-name">{t("fundacion")}</div>
                  <div className="type-desc">{t("fundacion_desc")}</div>
                </div>
              </button>
              <button
                type="button"
                className={`register-type-btn ${selectedType === "veterinaria" ? "active" : ""}`}
                onClick={() => handleTypeChange("veterinaria")}
              >
                <i className="fas fa-clinic-medical"></i>
                <div className="type-info">
                  <div className="type-name">{t("veterinaria")}</div>
                  <div className="type-desc">{t("veterinaria_desc")}</div>
                </div>
              </button>
            </div>
            {submitted && errors.tipo && (
              <span className="register-field-error">{errors.tipo}</span>
            )}
          </div>
        );

      case 2:
        return (
          <div className="register-form">
            <div className="register-form-group">
              <label>{t("nombre_completo")} *</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder={t("nombre_placeholder")}
                className={submitted && errors.nombre ? "error" : ""}
              />
              {submitted && errors.nombre && (
                <span className="register-field-error">{errors.nombre}</span>
              )}
            </div>

            <div className="register-form-group">
              <label>{t("apellidos")}</label>
              <input
                type="text"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                placeholder={t("apellidos_placeholder")}
              />
            </div>

            <div className="register-form-group">
              <label>{t("email")} *</label>
              <div className="register-input-wrapper">
                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t("email_placeholder")}
                  className={submitted && errors.email ? "error" : ""}
                />
                {isCheckingEmail && (
                  <span className="register-input-loading">
                    <i className="fas fa-spinner fa-spin"></i>
                  </span>
                )}
                {!isCheckingEmail &&
                  formData.email &&
                  validateEmail(formData.email) &&
                  !emailExists && (
                    <span className="register-input-check">
                      <i
                        className="fas fa-check-circle"
                        style={{ color: "var(--color-success)" }}
                      ></i>
                    </span>
                  )}
                {!isCheckingEmail && formData.email && emailExists && (
                  <span className="register-input-check">
                    <i
                      className="fas fa-times-circle"
                      style={{ color: "var(--color-danger)" }}
                    ></i>
                  </span>
                )}
              </div>
              {submitted && errors.email && (
                <span className="register-field-error">{errors.email}</span>
              )}
            </div>

            <div className="register-form-group">
              <label>{t("telefono")}</label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder={t("telefono_placeholder")}
                className={submitted && errors.telefono ? "error" : ""}
              />
              {submitted && errors.telefono && (
                <span className="register-field-error">{errors.telefono}</span>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="register-form">
            <div className="register-form-group">
              <label>{t("contraseña")} *</label>
              <div className="register-password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={t("contraseña_placeholder")}
                  className={submitted && errors.password ? "error" : ""}
                />
                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i
                    className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                  ></i>
                </button>
              </div>
              {submitted && errors.password && (
                <span className="register-field-error">{errors.password}</span>
              )}
              <div className="register-password-requirements">
                <span
                  className={
                    formData.password.length >= 8 ? "valid" : "invalid"
                  }
                >
                  <i
                    className={`fas ${formData.password.length >= 8 ? "fa-check-circle" : "fa-circle"}`}
                  ></i>
                  {t("requisitos_longitud")}
                </span>
                <span
                  className={
                    /(?=.*[A-Z])/.test(formData.password) ? "valid" : "invalid"
                  }
                >
                  <i
                    className={`fas ${/(?=.*[A-Z])/.test(formData.password) ? "fa-check-circle" : "fa-circle"}`}
                  ></i>
                  {t("requisitos_mayuscula")}
                </span>
                <span
                  className={
                    /(?=.*[a-z])/.test(formData.password) ? "valid" : "invalid"
                  }
                >
                  <i
                    className={`fas ${/(?=.*[a-z])/.test(formData.password) ? "fa-check-circle" : "fa-circle"}`}
                  ></i>
                  {t("requisitos_minuscula")}
                </span>
                <span
                  className={
                    /(?=.*\d)/.test(formData.password) ? "valid" : "invalid"
                  }
                >
                  <i
                    className={`fas ${/(?=.*\d)/.test(formData.password) ? "fa-check-circle" : "fa-circle"}`}
                  ></i>
                  {t("requisitos_numero")}
                </span>
              </div>
            </div>

            <div className="register-form-group">
              <label>{t("confirmar_contraseña")} *</label>
              <div className="register-password-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  placeholder={t("confirmar_placeholder")}
                  className={
                    submitted && errors.password_confirmation ? "error" : ""
                  }
                />
                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <i
                    className={`fas ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}
                  ></i>
                </button>
              </div>
              {submitted && errors.password_confirmation && (
                <span className="register-field-error">
                  {errors.password_confirmation}
                </span>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="register-form">
            {(selectedType === "fundacion" ||
              selectedType === "veterinaria") && (
              <>
                <div className="register-form-group">
                  <label>
                    {selectedType === "fundacion"
                      ? t("nombre_fundacion")
                      : t("nombre_veterinaria")}{" "}
                    *
                  </label>
                  <input
                    type="text"
                    name="nombre_entidad"
                    value={formData.nombre_entidad}
                    onChange={handleChange}
                    placeholder={
                      selectedType === "fundacion"
                        ? t("nombre_fundacion_placeholder")
                        : t("nombre_veterinaria_placeholder")
                    }
                    className={
                      submitted && errors.nombre_entidad ? "error" : ""
                    }
                  />
                  {submitted && errors.nombre_entidad && (
                    <span className="register-field-error">
                      {errors.nombre_entidad}
                    </span>
                  )}
                </div>

                <div className="register-form-group">
                  <label>{t("direccion")} *</label>
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    placeholder={t("direccion_placeholder")}
                    className={submitted && errors.direccion ? "error" : ""}
                  />
                  {submitted && errors.direccion && (
                    <span className="register-field-error">
                      {errors.direccion}
                    </span>
                  )}
                </div>

                <div className="register-form-group">
                  <label>
                    {selectedType === "fundacion"
                      ? t("nit")
                      : t("registro_sanitario")}{" "}
                    *
                  </label>
                  <input
                    type="text"
                    name="registro_sanitario"
                    value={formData.registro_sanitario}
                    onChange={handleChange}
                    placeholder={
                      selectedType === "fundacion"
                        ? t("nit_placeholder")
                        : t("registro_sanitario_placeholder")
                    }
                    className={
                      submitted && errors.registro_sanitario ? "error" : ""
                    }
                  />
                  {submitted && errors.registro_sanitario && (
                    <span className="register-field-error">
                      {errors.registro_sanitario}
                    </span>
                  )}
                </div>
              </>
            )}

            {selectedType === "fundacion" && (
              <div className="register-form-group">
                <label>{t("capacidad_maxima")}</label>
                <input
                  type="number"
                  name="capacidad"
                  value={formData.capacidad}
                  onChange={handleChange}
                  placeholder={t("capacidad_placeholder")}
                  min="1"
                />
                <small className="register-field-hint">
                  {t("capacidad_hint")}
                </small>
              </div>
            )}

            {selectedType === "veterinaria" && (
              <div className="register-form-group">
                <label>{t("servicios")}</label>
                <div className="register-services-checkboxes">
                  <label className="register-checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.servicios.includes("urgencias")}
                      onChange={(e) =>
                        handleServiceChange("urgencias", e.target.checked)
                      }
                    />
                    <span>{t("servicios_urgencias")}</span>
                  </label>
                  <label className="register-checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.servicios.includes("cirugia")}
                      onChange={(e) =>
                        handleServiceChange("cirugia", e.target.checked)
                      }
                    />
                    <span>{t("servicios_cirugia")}</span>
                  </label>
                  <label className="register-checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.servicios.includes("vacunacion")}
                      onChange={(e) =>
                        handleServiceChange("vacunacion", e.target.checked)
                      }
                    />
                    <span>{t("servicios_vacunacion")}</span>
                  </label>
                  <label className="register-checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.servicios.includes("hospitalizacion")}
                      onChange={(e) =>
                        handleServiceChange("hospitalizacion", e.target.checked)
                      }
                    />
                    <span>{t("servicios_hospitalizacion")}</span>
                  </label>
                </div>
              </div>
            )}

            {selectedType === "user" && (
              <div className="register-step-success">
                <i className="fas fa-heart"></i>
                <p>{t("mensaje_user")}</p>
                <p>{t("mensaje_user_lista")}</p>
                <ul>
                  <li>{t("mensaje_user_item1")}</li>
                  <li>{t("mensaje_user_item2")}</li>
                  <li>{t("mensaje_user_item3")}</li>
                  <li>{t("mensaje_user_item4")}</li>
                </ul>
              </div>
            )}

            <div className="register-info-box">
              <i className="fas fa-shield-alt"></i>
              <p>{t("info_seguridad")}</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ============================================
  // PANTALLA DE ÉXITO
  // ============================================

  if (registrationSuccess) {
    return (
      <div className="register-page">
        <div className="register-success-fullscreen">
          <div className="register-success-card">
            <div className="success-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <h2>{t("exito_titulo") || "¡Registro completado!"}</h2>
            <div className="success-message">
              {successMessage.split("\n").map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>

            {(selectedType === "fundacion" ||
              selectedType === "veterinaria") && (
              <div
                className="success-info"
                style={{ background: "#fff3cd", border: "1px solid #f59e0b" }}
              >
                <i className="fas fa-clock" style={{ color: "#f59e0b" }}></i>
                <p style={{ color: "#92400e" }}>
                  {t("exito_info_pendiente") ||
                    "Tu registro está pendiente de aprobación. Recibirás un correo cuando sea activado."}
                </p>
              </div>
            )}

            {(selectedType === "fundacion" ||
              selectedType === "veterinaria") && (
              <div
                className="success-info"
                style={{ background: "#e8f5e9", border: "1px solid #4caf50" }}
              >
                <i
                  className="fas fa-info-circle"
                  style={{ color: "#4caf50" }}
                ></i>
                <p style={{ color: "#2e7d32" }}>
                  {selectedType === "fundacion"
                    ? t("exito_info_fundacion")
                    : t("exito_info_veterinaria")}
                </p>
              </div>
            )}

            <div className="register-success-buttons">
              <Link to="/" className="register-btn-success-primary">
                <i className="fas fa-home"></i>
                {t("exito_boton_inicio") || "Ir al inicio"}
              </Link>
              {selectedType === "user" && (
                <Link to="/" className="register-btn-success-secondary">
                  <i className="fas fa-paw"></i>
                  {t("exito_boton_explorar") || "Explorar mascotas"}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      <div className="register-grid">
        <div
          className="register-left"
          style={{
            backgroundImage: `url('${backgroundImages[currentBackground]}')`,
          }}
        >
          <div className="register-left-content">
            <div className="register-logo-container">
              <img
                src="/img/logo-claro.png"
                alt="Rescatando Mascotas Forever"
                className="register-logo"
              />
              <h1>
                Rescatando
                <br />
                Mascotas Forever
              </h1>
              <p>Sanando su historia</p>
            </div>

            <div className="register-quote-container">
              <i className="fas fa-quote-left"></i>
              <p>{motivationalQuotes[currentQuote]}</p>
            </div>

            <div className="register-image-indicators">
              {backgroundImages.map((_, index) => (
                <span
                  key={index}
                  className={`register-indicator ${currentBackground === index ? "active" : ""}`}
                  onClick={() => setCurrentBackground(index)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="register-right">
          <button
            className="register-home-btn"
            onClick={handleGoHome}
            aria-label={t("home_button")}
          >
            <i className="fas fa-home"></i>
            <span>{t("home_button")}</span>
          </button>

          <div className="register-card">
            <h2>{t("titulo")}</h2>
            <p className="register-subtitle">
              {t("paso")} {currentStep} {t("de")} {totalSteps}
            </p>

            <div className="register-stepper">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`register-step ${currentStep >= step ? "active" : ""} ${currentStep > step ? "completed" : ""}`}
                  onClick={() => step < currentStep && setCurrentStep(step)}
                >
                  <div className="step-dot">
                    {currentStep > step ? (
                      <i className="fas fa-check"></i>
                    ) : (
                      step
                    )}
                  </div>
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

              <div className="register-buttons">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="register-btn-prev"
                  >
                    <i className="fas fa-arrow-left"></i>
                    {t("anterior")}
                  </button>
                )}

                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="register-btn-next"
                  >
                    {t("siguiente")}
                    <i className="fas fa-arrow-right"></i>
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="register-btn-submit"
                    disabled={loading}
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
                  </button>
                )}
              </div>
            </form>

            <div className="register-login-link">
              {t("ya_tienes_cuenta")}{" "}
              <Link to="/login">{t("iniciar_sesion")}</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;