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

  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    email: "",
    password: "",
    password_confirmation: "",
    telefono: "",
    tipo: "user",
    // Campos adicionales
    nombre_entidad: "",
    direccion: "",
    registro_sanitario: "",
    servicios: [],
    capacidad: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState("user");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    // Limpiar errores al cambiar de tipo
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
    setLoading(true);
    setErrors({});

    // Validación básica
    if (!formData.nombre.trim()) {
      setErrors({ nombre: "El nombre es requerido" });
      setLoading(false);
      return;
    }

    if (!formData.email.trim()) {
      setErrors({ email: "El email es requerido" });
      setLoading(false);
      return;
    }

    if (!formData.password) {
      setErrors({ password: "La contraseña es requerida" });
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setErrors({ password: "La contraseña debe tener al menos 8 caracteres" });
      setLoading(false);
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      setErrors({ password_confirmation: t("passwords_not_match") });
      setLoading(false);
      return;
    }

    // Validaciones específicas según el tipo
    if (selectedType === "fundacion") {
      if (!formData.nombre_entidad && !formData.nombre) {
        setErrors({ nombre_entidad: "El nombre de la fundación es requerido" });
        setLoading(false);
        return;
      }
      if (!formData.direccion) {
        setErrors({ direccion: "La dirección es requerida" });
        setLoading(false);
        return;
      }
      if (!formData.registro_sanitario) {
        setErrors({ registro_sanitario: "El NIT/registro es requerido" });
        setLoading(false);
        return;
      }
    }

    if (selectedType === "veterinaria") {
      if (!formData.nombre_entidad && !formData.nombre) {
        setErrors({
          nombre_entidad: "El nombre de la veterinaria es requerido",
        });
        setLoading(false);
        return;
      }
      if (!formData.direccion) {
        setErrors({ direccion: "La dirección es requerida" });
        setLoading(false);
        return;
      }
      if (!formData.registro_sanitario) {
        setErrors({ registro_sanitario: "El registro sanitario es requerido" });
        setLoading(false);
        return;
      }
    }

    // Construir datos a enviar
    const dataToSend = {
      nombre: formData.nombre,
      apellidos: formData.apellidos || null,
      email: formData.email,
      password: formData.password,
      password_confirmation: formData.password_confirmation,
      telefono: formData.telefono || null,
      tipo: selectedType,
    };

    // Agregar campos según el tipo
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

    console.log("📤 Enviando:", dataToSend);

    try {
      const result = await register(dataToSend);

      console.log("✅ Resultado:", result);

      if (result.success) {
        if (result.data?.requiere_aprobacion) {
          // 🔥 MOSTRAR MENSAJE DE APROBACIÓN PENDIENTE
          toast.success(
            "¡Registro exitoso! Tu solicitud ha sido enviada. " +
              "Un administrador revisará tus datos y te notificará cuando sea aprobada.",
            {
              position: "top-center",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            },
          );
          navigate("/login");
        } else {
          const dashboardPath = getDashboardPathByRole(result.user);
          toast.success("¡Bienvenido! Registro completado exitosamente.");
          navigate(dashboardPath);
        }
      } else {
        setErrors({ general: result.message });
        toast.error(result.message || "Error al registrar");
      }
    } catch (error) {
      console.error("❌ Error en registro:", error);
      // ... manejo de errores existente ...
    } finally {
      setLoading(false);
    }
  };

  const getDashboardPathByRole = (user) => {
    if (!user) return "/login";
    switch (user.tipo) {
      case "admin":
        return "/admin/dashboard";
      case "veterinaria":
        return "/veterinaria/dashboard";
      case "fundacion":
        return "/fundacion/dashboard";
      default:
        return "/user/dashboard";
    }
  };

  return (
    <div className="register-container">
      <div className="register-overlay"></div>

      <div className="register-card">
        <div className="register-header">
          <div className="register-logo-wrapper">
            <img
              src="/img/logo-claro.png"
              alt="Logo"
              className="register-logo"
            />
          </div>
          <h1 className="register-title">{t("register.title")}</h1>
          <p className="register-subtitle">Únete a nuestra comunidad</p>
        </div>

        {/* Selector de tipo de cuenta */}
        <div className="account-type-selector">
          <button
            type="button"
            className={`type-btn ${selectedType === "user" ? "active" : ""}`}
            onClick={() => handleTypeChange("user")}
          >
            <i className="fas fa-user"></i>
            <span>Usuario</span>
          </button>
          <button
            type="button"
            className={`type-btn ${selectedType === "fundacion" ? "active" : ""}`}
            onClick={() => handleTypeChange("fundacion")}
          >
            <i className="fas fa-building"></i>
            <span>Fundación</span>
          </button>
          <button
            type="button"
            className={`type-btn ${selectedType === "veterinaria" ? "active" : ""}`}
            onClick={() => handleTypeChange("veterinaria")}
          >
            <i className="fas fa-clinic-medical"></i>
            <span>Veterinaria</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {/* Campos comunes */}
          <div className="input-group">
            <i className="fas fa-user input-icon"></i>
            <Input
              label={t("name")}
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              error={errors.nombre}
              required
              placeholder="Tu nombre"
            />
          </div>

          <div className="input-group">
            <i className="fas fa-user-tag input-icon"></i>
            <Input
              label={t("lastname")}
              type="text"
              name="apellidos"
              value={formData.apellidos}
              onChange={handleChange}
              error={errors.apellidos}
              placeholder="Tus apellidos"
            />
          </div>

          {/* Nombre de entidad (solo para fundación/veterinaria) */}
          {(selectedType === "fundacion" || selectedType === "veterinaria") && (
            <div className="input-group">
              <i className="fas fa-store input-icon"></i>
              <Input
                label={
                  selectedType === "fundacion"
                    ? "Nombre de la Fundación"
                    : "Nombre de la Veterinaria"
                }
                type="text"
                name="nombre_entidad"
                value={formData.nombre_entidad}
                onChange={handleChange}
                error={errors.nombre_entidad}
                required
                placeholder={
                  selectedType === "fundacion"
                    ? "Ej: Fundación Patitas Felices"
                    : "Ej: Clínica Veterinaria San Martín"
                }
              />
            </div>
          )}

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
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div className="input-group">
            <i className="fas fa-phone input-icon"></i>
            <Input
              label={t("phone")}
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              error={errors.telefono}
              placeholder="+57 300 123 4567"
            />
          </div>

          {/* Dirección (para fundación/veterinaria) */}
          {(selectedType === "fundacion" || selectedType === "veterinaria") && (
            <div className="input-group">
              <i className="fas fa-map-marker-alt input-icon"></i>
              <Input
                label="Dirección"
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                error={errors.direccion}
                required
                placeholder="Calle, número, ciudad"
              />
            </div>
          )}

          {/* Registro sanitario (para fundación/veterinaria) */}
          {(selectedType === "fundacion" || selectedType === "veterinaria") && (
            <div className="input-group">
              <i className="fas fa-id-card input-icon"></i>
              <Input
                label={
                  selectedType === "fundacion"
                    ? "NIT / Registro"
                    : "Registro Sanitario"
                }
                type="text"
                name="registro_sanitario"
                value={formData.registro_sanitario}
                onChange={handleChange}
                error={errors.registro_sanitario}
                required
                placeholder={
                  selectedType === "fundacion"
                    ? "NIT de la fundación"
                    : "Número de registro sanitario"
                }
              />
            </div>
          )}

          {/* Capacidad (solo para fundación) */}
          {selectedType === "fundacion" && (
            <div className="input-group">
              <i className="fas fa-home input-icon"></i>
              <Input
                label="Capacidad máxima"
                type="number"
                name="capacidad"
                value={formData.capacidad}
                onChange={handleChange}
                error={errors.capacidad}
                placeholder="Número de mascotas que puede albergar"
              />
            </div>
          )}

          {/* Servicios (solo para veterinaria) */}
          {selectedType === "veterinaria" && (
            <div className="input-group">
              <i className="fas fa-stethoscope input-icon"></i>
              <label className="form-label">Servicios que ofrece</label>
              <div className="services-checkboxes">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.servicios.includes("urgencias")}
                    onChange={(e) =>
                      handleServiceChange("urgencias", e.target.checked)
                    }
                  />
                  <span>Urgencias 24h</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.servicios.includes("cirugia")}
                    onChange={(e) =>
                      handleServiceChange("cirugia", e.target.checked)
                    }
                  />
                  <span>Cirugía</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.servicios.includes("vacunacion")}
                    onChange={(e) =>
                      handleServiceChange("vacunacion", e.target.checked)
                    }
                  />
                  <span>Vacunación</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.servicios.includes("hospitalizacion")}
                    onChange={(e) =>
                      handleServiceChange("hospitalizacion", e.target.checked)
                    }
                  />
                  <span>Hospitalización</span>
                </label>
              </div>
            </div>
          )}

          <div className="input-group">
            <i className="fas fa-lock input-icon"></i>
            <div className="password-wrapper">
              <Input
                label={t("password")}
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                required
                placeholder="••••••••"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i
                  className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                ></i>
              </button>
            </div>
          </div>

          <div className="input-group">
            <i className="fas fa-lock input-icon"></i>
            <div className="password-wrapper">
              <Input
                label={t("confirm_password")}
                type={showConfirmPassword ? "text" : "password"}
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                error={errors.password_confirmation}
                required
                placeholder="••••••••"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <i
                  className={`fas ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}
                ></i>
              </button>
            </div>
          </div>

          {errors.general && (
            <div className="error-general">
              <i className="fas fa-exclamation-circle"></i>
              {errors.general}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="register-button"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Cargando...
              </>
            ) : (
              <>
                <i className="fas fa-user-plus"></i>
                Registrarse
              </>
            )}
          </Button>
        </form>

        <div className="login-link">
          {t("yes_account")} <Link to="/login">{t("login_now")}</Link>
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
