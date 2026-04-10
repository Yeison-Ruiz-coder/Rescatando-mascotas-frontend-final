// src/pages/public/ReportarRescate/ReportarRescate.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../contexts/AuthContext";
import { toast } from "react-toastify";

const ReportarRescate = () => {
  const { t } = useTranslation("rescate");
  const navigate = useNavigate();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    tipo_animal: "",
    raza: "",
    color: "",
    tamanio: "",
    sexo: "",
    edad_aproximada: "",
    señas_particulares: "",
    ubicacion: "",
    latitud: "",
    longitud: "",
    urgencia: "media",
    imagenes: [],
    contacto_info: {
      telefono: "",
      email: "",
    },
    requiere_veterinario: false,
    notas_adicionales: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);

  // Validaciones
  const validateField = (field, value) => {
    let error = "";

    switch (field) {
      case "titulo":
        if (!value.trim()) {
          error = t("titulo_requerido");
        } else if (value.length < 5) {
          error = t("titulo_minimo");
        }
        break;
      case "descripcion":
        if (!value.trim()) {
          error = t("descripcion_requerida");
        } else if (value.length < 20) {
          error = t("descripcion_minimo");
        }
        break;
      case "tipo_animal":
        if (!value) {
          error = t("tipo_animal_requerido");
        }
        break;
      case "tamanio":
        if (!value) {
          error = t("tamanio_requerido");
        }
        break;
      case "ubicacion":
        if (!value.trim()) {
          error = t("ubicacion_requerida");
        }
        break;
      case "telefono":
        if (value && !/^[0-9]{7,15}$/.test(value)) {
          error = t("telefono_invalido");
        }
        break;
      case "email":
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = t("email_invalido");
        }
        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
    return !error;
  };

  const handleBlur = (field, value) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, value);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }

    if (touched[name]) {
      validateField(name, type === "checkbox" ? checked : value);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const maxFiles = 5;

    if (formData.imagenes.length + files.length > maxFiles) {
      toast.error(t("max_imagenes", { max: maxFiles }));
      return;
    }

    const newPreviews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImagePreviews((prev) => [...prev, ...newPreviews]);
    setFormData((prev) => ({
      ...prev,
      imagenes: [...prev.imagenes, ...files],
    }));
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index].preview);
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, i) => i !== index),
    }));
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      toast.error(t("geolocalizacion_no_soportada"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitud: position.coords.latitude,
          longitud: position.coords.longitude,
        }));
        toast.success(t("ubicacion_obtenida"));
      },
      (error) => {
        toast.error(t("error_ubicacion"));
        console.error(error);
      }
    );
  };

  const validateStep = () => {
    let isValid = true;
    const fieldsToValidate = [];

    switch (currentStep) {
      case 1:
        fieldsToValidate.push("titulo", "descripcion");
        break;
      case 2:
        fieldsToValidate.push("tipo_animal", "tamanio");
        break;
      case 3:
        fieldsToValidate.push("ubicacion");
        if (formData.contacto_info.telefono) fieldsToValidate.push("telefono");
        if (formData.contacto_info.email) fieldsToValidate.push("email");
        break;
      case 4:
        // Resumen - no hay validaciones adicionales
        break;
    }

    fieldsToValidate.forEach((field) => {
      let value = formData[field];
      if (field === "telefono") value = formData.contacto_info.telefono;
      if (field === "email") value = formData.contacto_info.email;
      
      setTouched((prev) => ({ ...prev, [field]: true }));
      if (!validateField(field, value)) {
        isValid = false;
      }
    });

    if (!isValid) {
      toast.error(t("error_validacion"));
    }

    return isValid;
  };

  const nextStep = () => {
    if (validateStep()) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    setLoading(true);

    const submitData = new FormData();
    submitData.append("titulo", formData.titulo);
    submitData.append("descripcion", formData.descripcion);
    submitData.append("tipo_animal", formData.tipo_animal);
    submitData.append("raza", formData.raza || "");
    submitData.append("color", formData.color || "");
    submitData.append("tamanio", formData.tamanio);
    submitData.append("sexo", formData.sexo || "");
    submitData.append("edad_aproximada", formData.edad_aproximada || "");
    submitData.append("señas_particulares", formData.señas_particulares || "");
    submitData.append("ubicacion", formData.ubicacion);
    submitData.append("latitud", formData.latitud || "");
    submitData.append("longitud", formData.longitud || "");
    submitData.append("urgencia", formData.urgencia);
    submitData.append("requiere_veterinario", formData.requiere_veterinario);
    submitData.append("notas_adicionales", formData.notas_adicionales || "");
    submitData.append("contacto_info[telefono]", formData.contacto_info.telefono || "");
    submitData.append("contacto_info[email]", formData.contacto_info.email || "");

    formData.imagenes.forEach((imagen) => {
      submitData.append("imagenes[]", imagen);
    });

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/api/rescates", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: submitData,
      });

      const data = await response.json();

      if (data.success) {
        setSuccessData(data.data);
        setReportSuccess(true);
        toast.success(t("exito_mensaje"));
      } else {
        if (data.errors) {
          setErrors(data.errors);
          Object.keys(data.errors).forEach((key) => {
            toast.error(data.errors[key][0]);
          });
        } else {
          toast.error(data.message || t("error_general"));
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(t("error_conexion"));
    } finally {
      setLoading(false);
    }
  };

  // Limpiar URLs de imágenes al desmontar
  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => {
        URL.revokeObjectURL(preview.preview);
      });
    };
  }, [imagePreviews]);

  if (reportSuccess) {
    return (
      <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center" style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      }}>
        <div className="card shadow-lg border-0" style={{ maxWidth: "500px", borderRadius: "20px" }}>
          <div className="card-body text-center p-5">
            <div className="mb-4">
              <div className="bg-success rounded-circle d-flex align-items-center justify-content-center mx-auto" style={{ width: "80px", height: "80px" }}>
                <i className="fas fa-paw text-white fa-3x"></i>
              </div>
            </div>
            <h2 className="mb-3">{t("exito_titulo")}</h2>
            <div className="mb-4">
              <p className="mb-2">{t("exito_mensaje_completo")}</p>
              <p className="text-muted">{t("exito_seguimiento", { id: successData?.id })}</p>
            </div>
            <div className="d-flex gap-3">
              <button onClick={() => navigate("/")} className="btn btn-primary flex-grow-1">
                <i className="fas fa-home me-2"></i>
                {t("ir_inicio")}
              </button>
              {user?.tipo === 'fundacion' && (
                <button onClick={() => navigate("/fundacion/rescates")} className="btn btn-outline-primary flex-grow-1">
                  <i className="fas fa-list me-2"></i>
                  {t("ver_reportes")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8 col-md-10">
          {/* Header */}
          <div className="text-center mb-5">
            <div className="bg-primary bg-gradient rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 shadow" style={{ width: "70px", height: "70px" }}>
              <i className="fas fa-paw text-white fa-2x"></i>
            </div>
            <h1 className="display-5 fw-bold text-primary">{t("titulo_pagina")}</h1>
            <p className="text-muted">
              {t("paso")} {currentStep} {t("de")} {totalSteps}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-5">
            <div className="d-flex justify-content-between position-relative">
              <div className="position-absolute top-50 start-0 end-0 border-top" style={{ zIndex: 0, transform: "translateY(-50%)" }}></div>
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`text-center position-relative ${step <= currentStep ? "cursor-pointer" : ""}`}
                  style={{ zIndex: 1, flex: 1, cursor: step < currentStep ? "pointer" : "default" }}
                  onClick={() => step < currentStep && setCurrentStep(step)}
                >
                  <div
                    className={`rounded-circle bg-white border d-flex align-items-center justify-content-center mx-auto mb-2 ${
                      step <= currentStep ? "border-primary" : "border-secondary"
                    }`}
                    style={{ width: "40px", height: "40px", background: step <= currentStep ? "#0d6efd" : "white" }}
                  >
                    <span className={step <= currentStep ? "text-white fw-bold" : "text-secondary"}>{step}</span>
                  </div>
                  <small className={step <= currentStep ? "text-primary fw-bold" : "text-muted"}>
                    {step === 1 && t("step_basica")}
                    {step === 2 && t("step_animal")}
                    {step === 3 && t("step_ubicacion")}
                    {step === 4 && t("step_resumen")}
                  </small>
                </div>
              ))}
            </div>
          </div>

          {/* Form Card */}
          <div className="card shadow-lg border-0">
            <div className="card-body p-4 p-lg-5">
              <form onSubmit={handleSubmit}>
                {/* Step 1: Información Básica */}
                {currentStep === 1 && (
                  <div className="step-content">
                    <div className="text-center mb-4">
                      <i className="fas fa-pen-alt fa-3x text-primary mb-3"></i>
                      <h3 className="h4">{t("info_basica")}</h3>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">
                        {t("titulo")} <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <i className="fas fa-heading text-primary"></i>
                        </span>
                        <input
                          type="text"
                          name="titulo"
                          className={`form-control ${errors.titulo && touched.titulo ? "is-invalid" : ""}`}
                          value={formData.titulo}
                          onChange={handleChange}
                          onBlur={() => handleBlur("titulo", formData.titulo)}
                          placeholder={t("titulo_placeholder")}
                        />
                      </div>
                      {errors.titulo && touched.titulo && (
                        <div className="invalid-feedback d-block">{errors.titulo}</div>
                      )}
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">
                        {t("descripcion")} <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <i className="fas fa-align-left text-primary"></i>
                        </span>
                        <textarea
                          name="descripcion"
                          className={`form-control ${errors.descripcion && touched.descripcion ? "is-invalid" : ""}`}
                          rows="4"
                          value={formData.descripcion}
                          onChange={handleChange}
                          onBlur={() => handleBlur("descripcion", formData.descripcion)}
                          placeholder={t("descripcion_placeholder")}
                        />
                      </div>
                      {errors.descripcion && touched.descripcion && (
                        <div className="invalid-feedback d-block">{errors.descripcion}</div>
                      )}
                      <small className="text-muted">{t("descripcion_hint")}</small>
                    </div>
                  </div>
                )}

                {/* Step 2: Información del Animal */}
                {currentStep === 2 && (
                  <div className="step-content">
                    <div className="text-center mb-4">
                      <i className="fas fa-dog fa-3x text-primary mb-3"></i>
                      <h3 className="h4">{t("info_animal")}</h3>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">
                          {t("tipo_animal")} <span className="text-danger">*</span>
                        </label>
                        <select
                          name="tipo_animal"
                          className={`form-select ${errors.tipo_animal && touched.tipo_animal ? "is-invalid" : ""}`}
                          value={formData.tipo_animal}
                          onChange={handleChange}
                          onBlur={() => handleBlur("tipo_animal", formData.tipo_animal)}
                        >
                          <option value="">{t("seleccionar_tipo")}</option>
                          <option value="perro">{t("perro")}</option>
                          <option value="gato">{t("gato")}</option>
                          <option value="otro">{t("otro")}</option>
                        </select>
                        {errors.tipo_animal && touched.tipo_animal && (
                          <div className="invalid-feedback d-block">{errors.tipo_animal}</div>
                        )}
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">{t("raza")}</label>
                        <input
                          type="text"
                          name="raza"
                          className="form-control"
                          value={formData.raza}
                          onChange={handleChange}
                          placeholder={t("raza_placeholder")}
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">{t("color")}</label>
                        <input
                          type="text"
                          name="color"
                          className="form-control"
                          value={formData.color}
                          onChange={handleChange}
                          placeholder={t("color_placeholder")}
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">
                          {t("tamanio")} <span className="text-danger">*</span>
                        </label>
                        <select
                          name="tamanio"
                          className={`form-select ${errors.tamanio && touched.tamanio ? "is-invalid" : ""}`}
                          value={formData.tamanio}
                          onChange={handleChange}
                          onBlur={() => handleBlur("tamanio", formData.tamanio)}
                        >
                          <option value="">{t("seleccionar_tamanio")}</option>
                          <option value="pequeño">{t("pequeño")}</option>
                          <option value="mediano">{t("mediano")}</option>
                          <option value="grande">{t("grande")}</option>
                        </select>
                        {errors.tamanio && touched.tamanio && (
                          <div className="invalid-feedback d-block">{errors.tamanio}</div>
                        )}
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">{t("sexo")}</label>
                        <select
                          name="sexo"
                          className="form-select"
                          value={formData.sexo}
                          onChange={handleChange}
                        >
                          <option value="">{t("seleccionar_sexo")}</option>
                          <option value="macho">{t("macho")}</option>
                          <option value="hembra">{t("hembra")}</option>
                        </select>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">{t("edad_aproximada")}</label>
                        <input
                          type="text"
                          name="edad_aproximada"
                          className="form-control"
                          value={formData.edad_aproximada}
                          onChange={handleChange}
                          placeholder={t("edad_placeholder")}
                        />
                      </div>

                      <div className="col-12 mb-3">
                        <label className="form-label fw-bold">{t("señas_particulares")}</label>
                        <textarea
                          name="señas_particulares"
                          className="form-control"
                          rows="3"
                          value={formData.señas_particulares}
                          onChange={handleChange}
                          placeholder={t("señas_placeholder")}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Ubicación y Urgencia */}
                {currentStep === 3 && (
                  <div className="step-content">
                    <div className="text-center mb-4">
                      <i className="fas fa-map-marker-alt fa-3x text-primary mb-3"></i>
                      <h3 className="h4">{t("ubicacion_urgencia")}</h3>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">
                        {t("ubicacion")} <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <i className="fas fa-location-dot text-primary"></i>
                        </span>
                        <input
                          type="text"
                          name="ubicacion"
                          className={`form-control ${errors.ubicacion && touched.ubicacion ? "is-invalid" : ""}`}
                          value={formData.ubicacion}
                          onChange={handleChange}
                          onBlur={() => handleBlur("ubicacion", formData.ubicacion)}
                          placeholder={t("ubicacion_placeholder")}
                        />
                      </div>
                      {errors.ubicacion && touched.ubicacion && (
                        <div className="invalid-feedback d-block">{errors.ubicacion}</div>
                      )}
                      <button
                        type="button"
                        onClick={getLocation}
                        className="btn btn-outline-primary btn-sm mt-2"
                      >
                        <i className="fas fa-location-arrow me-1"></i> {t("usar_mi_ubicacion")}
                      </button>
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-bold">
                        {t("urgencia")} <span className="text-danger">*</span>
                      </label>
                      <div className="d-flex gap-3 flex-wrap">
                        {[
                          { value: "baja", icon: "fa-thermometer-quarter", color: "success" },
                          { value: "media", icon: "fa-thermometer-half", color: "warning" },
                          { value: "alta", icon: "fa-thermometer-three-quarters", color: "orange" },
                          { value: "critica", icon: "fa-thermometer-full", color: "danger" }
                        ].map((nivel) => (
                          <button
                            key={nivel.value}
                            type="button"
                            className={`btn flex-grow-1 ${
                              formData.urgencia === nivel.value
                                ? `btn-${nivel.color}`
                                : `btn-outline-${nivel.color}`
                            }`}
                            onClick={() =>
                              setFormData((prev) => ({ ...prev, urgencia: nivel.value }))
                            }
                          >
                            <i className={`fas ${nivel.icon} me-2`}></i>
                            {t(`urgencia_${nivel.value}`)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">{t("imagenes")}</label>
                      <div className="border rounded p-4 text-center" style={{ cursor: "pointer" }} onClick={() => document.getElementById("imageInput").click()}>
                        <i className="fas fa-cloud-upload-alt fa-3x text-primary mb-2"></i>
                        <p className="mb-0">{t("click_subir_imagenes")}</p>
                        <small className="text-muted">{t("max_imagenes_hint")}</small>
                        <input
                          id="imageInput"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageChange}
                          style={{ display: "none" }}
                        />
                      </div>
                      {imagePreviews.length > 0 && (
                        <div className="row mt-3 g-2">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="col-4 col-md-3">
                              <div className="position-relative">
                                <img src={preview.preview} alt={`Preview ${index}`} className="img-fluid rounded" style={{ height: "100px", width: "100%", objectFit: "cover" }} />
                                <button
                                  type="button"
                                  className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1"
                                  onClick={() => removeImage(index)}
                                >
                                  <i className="fas fa-times"></i>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">{t("contacto_adicional")}</label>
                      <div className="input-group mb-2">
                        <span className="input-group-text bg-light">
                          <i className="fas fa-phone text-primary"></i>
                        </span>
                        <input
                          type="tel"
                          name="contacto_info.telefono"
                          className={`form-control ${errors.telefono && touched.telefono ? "is-invalid" : ""}`}
                          value={formData.contacto_info.telefono}
                          onChange={handleChange}
                          onBlur={() => handleBlur("telefono", formData.contacto_info.telefono)}
                          placeholder={t("telefono_placeholder")}
                        />
                      </div>
                      {errors.telefono && touched.telefono && (
                        <div className="invalid-feedback d-block">{errors.telefono}</div>
                      )}
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <i className="fas fa-envelope text-primary"></i>
                        </span>
                        <input
                          type="email"
                          name="contacto_info.email"
                          className={`form-control ${errors.email && touched.email ? "is-invalid" : ""}`}
                          value={formData.contacto_info.email}
                          onChange={handleChange}
                          onBlur={() => handleBlur("email", formData.contacto_info.email)}
                          placeholder={t("email_placeholder")}
                        />
                      </div>
                      {errors.email && touched.email && (
                        <div className="invalid-feedback d-block">{errors.email}</div>
                      )}
                    </div>

                    <div className="form-check mb-3">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="requiere_veterinario"
                        name="requiere_veterinario"
                        checked={formData.requiere_veterinario}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="requiere_veterinario">
                        {t("requiere_veterinario")}
                      </label>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">{t("notas_adicionales")}</label>
                      <textarea
                        name="notas_adicionales"
                        className="form-control"
                        rows="3"
                        value={formData.notas_adicionales}
                        onChange={handleChange}
                        placeholder={t("notas_placeholder")}
                      />
                    </div>
                  </div>
                )}

                {/* Step 4: Resumen y Confirmación */}
                {currentStep === 4 && (
                  <div className="step-content">
                    <div className="text-center mb-4">
                      <i className="fas fa-clipboard-list fa-3x text-primary mb-3"></i>
                      <h3 className="h4">{t("resumen_confirmacion")}</h3>
                    </div>

                    <div className="card bg-light mb-4">
                      <div className="card-body">
                        <div className="row mb-2">
                          <div className="col-5 fw-bold">{t("titulo")}:</div>
                          <div className="col-7">{formData.titulo}</div>
                        </div>
                        <div className="row mb-2">
                          <div className="col-5 fw-bold">{t("tipo_animal")}:</div>
                          <div className="col-7">{formData.tipo_animal && t(formData.tipo_animal)}</div>
                        </div>
                        <div className="row mb-2">
                          <div className="col-5 fw-bold">{t("urgencia")}:</div>
                          <div className="col-7">{t(`urgencia_${formData.urgencia}`)}</div>
                        </div>
                        <div className="row mb-2">
                          <div className="col-5 fw-bold">{t("ubicacion")}:</div>
                          <div className="col-7">{formData.ubicacion}</div>
                        </div>
                        {formData.requiere_veterinario && (
                          <div className="row mb-2">
                            <div className="col-5 fw-bold">{t("requiere_veterinario")}:</div>
                            <div className="col-7">
                              <i className="fas fa-check-circle text-success"></i> Sí
                            </div>
                          </div>
                        )}
                        {formData.contacto_info.telefono && (
                          <div className="row mb-2">
                            <div className="col-5 fw-bold">{t("telefono")}:</div>
                            <div className="col-7">{formData.contacto_info.telefono}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="alert alert-info">
                      <i className="fas fa-info-circle me-2"></i>
                      {t("confirmacion_info")}
                    </div>
                  </div>
                )}

                {/* Botones de navegación */}
                <div className="d-flex gap-3 mt-4 pt-3 border-top">
                  {currentStep > 1 && (
                    <button type="button" onClick={prevStep} className="btn btn-secondary">
                      <i className="fas fa-arrow-left me-2"></i>
                      {t("anterior")}
                    </button>
                  )}
                  
                  <div className="flex-grow-1"></div>
                  
                  {currentStep < totalSteps ? (
                    <button type="button" onClick={nextStep} className="btn btn-primary px-4">
                      {t("siguiente")}
                      <i className="fas fa-arrow-right ms-2"></i>
                    </button>
                  ) : (
                    <button type="submit" disabled={loading} className="btn btn-success px-4">
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          {t("enviando")}
                        </>
                      ) : (
                        <>
                          <i className="fas fa-paper-plane me-2"></i>
                          {t("reportar_rescate")}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportarRescate;