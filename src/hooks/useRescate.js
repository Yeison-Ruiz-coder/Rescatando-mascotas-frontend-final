// src/hooks/useRescate.js (VERSIÓN MEJORADA)
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { rescateService } from "../services/rescateService";

const useRescate = () => {
  const { t } = useTranslation("rescate");
  const navigate = useNavigate();

  // Estado del formulario
  const [formData, setFormData] = useState({
    lugar_rescate: "",
    descripcion_rescate: "",
    fecha_rescate: "", // ← CAMBIADO: inicializar vacío para forzar selección
    nombre_reportante: "",
    email_reportante: "",
    telefono_reportante: "",
    lat: null,
    lng: null,
  });

  const [fotosFiles, setFotosFiles] = useState([]);
  const [fotosPreviews, setFotosPreviews] = useState([]);
  const [prioridad, setPrioridad] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [waitingForAdmin, setWaitingForAdmin] = useState(false);
  const [timeUntilAdminAvailable, setTimeUntilAdminAvailable] = useState(null);
  const [rescateDisponibleParaAdmin, setRescateDisponibleParaAdmin] = useState(false);
  const [rescateId, setRescateId] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  
  const TIMEOUT_MINUTES = 30;
  const [timeoutId, setTimeoutId] = useState(null);

  useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [timeoutId]);

  const startAdminTimer = useCallback((rescateIdCreado) => {
    setRescateId(rescateIdCreado);
    setWaitingForAdmin(true);
    setTimeUntilAdminAvailable(TIMEOUT_MINUTES * 60);

    const interval = setInterval(() => {
      setTimeUntilAdminAvailable((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setWaitingForAdmin(false);
          setRescateDisponibleParaAdmin(true);
          rescateService.marcarDisponibleParaAdmin(rescateIdCreado).catch(console.error);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const mainTimeout = setTimeout(() => {
      setWaitingForAdmin(false);
      setRescateDisponibleParaAdmin(true);
      clearInterval(interval);
      rescateService.marcarDisponibleParaAdmin(rescateIdCreado).catch(console.error);
    }, TIMEOUT_MINUTES * 60 * 1000);

    setTimeoutId(mainTimeout);
  }, []);

  const analizarDescripcion = useCallback((descripcion) => {
    const texto = descripcion.toLowerCase();
    const palabrasUrgente = ["urgente", "emergencia", "grave", "critico", "inmediato", "ahora mismo", "muriendo", "agonizando", "desangrando", "convulsion", "atropellado", "golpeado", "accidente", "veneno", "envenenado"];
    const palabrasHerido = ["herido", "sangra", "sangrando", "golpe", "lastimado", "fractura", "hueso roto", "cojea", "malherido", "quemadura", "corte", "herida", "pata rota", "dolor"];
    const palabrasAbandonado = ["abandonado", "cachorros", "solo", "sin dueño", "vagando", "callejero", "botaron", "dejaron", "perdido", "extraviado", "bebé", "recién nacido"];

    for (const palabra of palabrasUrgente) if (texto.includes(palabra)) return { tipo: "urgente", prioridad: "alta" };
    for (const palabra of palabrasHerido) if (texto.includes(palabra)) return { tipo: "herido", prioridad: "alta" };
    for (const palabra of palabrasAbandonado) if (texto.includes(palabra)) return { tipo: "abandonado", prioridad: "media" };
    return { tipo: "otro", prioridad: "baja" };
  }, []);

  useEffect(() => {
    if (formData.descripcion_rescate?.trim().length > 10) {
      const analisis = analizarDescripcion(formData.descripcion_rescate);
      setPrioridad(analisis);
    }
  }, [formData.descripcion_rescate, analizarDescripcion]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  }, [errors]);

  const handleLocationChange = useCallback((lat, lng) => {
    setFormData(prev => ({ ...prev, lat, lng }));
    if (errors.ubicacion_rescate) setErrors(prev => ({ ...prev, ubicacion_rescate: "" }));
  }, [errors]);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setErrors(prev => ({ ...prev, general: t("errors.geolocation_not_supported") }));
      return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({ ...prev, lat: position.coords.latitude, lng: position.coords.longitude }));
        setGettingLocation(false);
      },
      (error) => {
        console.error("Error:", error);
        let mensaje = t("errors.location_failed");
        if (error.code === 1) mensaje = t("errors.location_permission_denied");
        else if (error.code === 2) mensaje = t("errors.location_unavailable");
        setErrors(prev => ({ ...prev, general: mensaje }));
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [t]);

  const handleFotosChange = useCallback((files, previews) => {
    setFotosFiles(files || []);
    setFotosPreviews(previews || []);
    if (errors.fotos) setErrors(prev => ({ ...prev, fotos: "" }));
  }, [errors]);

  const setPrioridadManual = useCallback((tipo) => {
    let prioridadValue = "baja";
    if (tipo === "urgente" || tipo === "herido") prioridadValue = "alta";
    if (tipo === "abandonado") prioridadValue = "media";
    setPrioridad({ tipo, prioridad: prioridadValue });
    if (errors.prioridad) setErrors(prev => ({ ...prev, prioridad: "" }));
  }, [errors]);

  // ========== VALIDACIÓN COMPLETA ==========
  const validate = useCallback(() => {
    const newErrors = {};

    // Campos OBLIGATORIOS
    if (!formData.lugar_rescate?.trim()) {
      newErrors.lugar_rescate = "El lugar del rescate es requerido";
    }
    
    if (!formData.descripcion_rescate?.trim()) {
      newErrors.descripcion_rescate = "La descripción del rescate es requerida";
    } else if (formData.descripcion_rescate.trim().length < 10) {
      newErrors.descripcion_rescate = "La descripción debe tener al menos 10 caracteres";
    }
    
    if (!formData.fecha_rescate) {
      newErrors.fecha_rescate = "La fecha del rescate es requerida";
    }
    
    // Prioridad obligatoria
    if (!prioridad?.tipo) {
      newErrors.prioridad = "Debes seleccionar el tipo de rescate";
    }
    
    // Ubicación obligatoria
    if (formData.lat == null || formData.lng == null) {
      newErrors.ubicacion_rescate = "Debes seleccionar la ubicación en el mapa";
    }

    // Validaciones para campos opcionales (si se ingresan)
    if (formData.email_reportante && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email_reportante)) {
      newErrors.email_reportante = "Ingresa un correo electrónico válido";
    }
    
    if (formData.telefono_reportante && formData.telefono_reportante.replace(/\D/g, '').length < 7) {
      newErrors.telefono_reportante = "Ingresa un teléfono válido (mínimo 7 dígitos)";
    }

    // Validación de fotos (opcional pero tamaño máximo)
    if (fotosFiles.length > 0) {
      const maxSize = 5 * 1024 * 1024;
      const oversizedFiles = fotosFiles.filter(f => f && f.size > maxSize);
      if (oversizedFiles.length > 0) {
        newErrors.fotos = `Las fotos no pueden superar los 5MB`;
      }
      if (fotosFiles.length > 5) {
        newErrors.fotos = `Máximo 5 fotos por rescate`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, prioridad, fotosFiles]);

  // Enviar formulario
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const formDataToSend = new FormData();

    formDataToSend.append("lugar_rescate", formData.lugar_rescate);
    formDataToSend.append("descripcion_rescate", formData.descripcion_rescate);
    formDataToSend.append("fecha_rescate", formData.fecha_rescate);
    formDataToSend.append("tipo_emergencia", prioridad?.tipo || "otro");
    formDataToSend.append("prioridad", prioridad?.prioridad || "baja");
    formDataToSend.append("disponible_para_fundaciones", "true");
    formDataToSend.append("disponible_para_veterinarias", "true");
    formDataToSend.append("disponible_para_admin", "false");

    if (formData.nombre_reportante) formDataToSend.append("nombre_reportante", formData.nombre_reportante);
    if (formData.email_reportante) formDataToSend.append("email_reportante", formData.email_reportante);
    if (formData.telefono_reportante) formDataToSend.append("telefono_reportante", formData.telefono_reportante);
    if (formData.lat != null) formDataToSend.append("lat", formData.lat);
    if (formData.lng != null) formDataToSend.append("lng", formData.lng);

    if (fotosFiles.length > 0) {
      const validFiles = fotosFiles.filter(f => f instanceof File && f.size > 0);
      validFiles.forEach((foto, index) => {
        if (index === 0) formDataToSend.append("foto_principal", foto);
        else formDataToSend.append("galeria_fotos[]", foto);
      });
    }

    setLoading(true);
    try {
      const response = await rescateService.createRescate(formDataToSend);
      if (response.data.success) {
        const nuevoRescateId = response.data.data.id;
        setRescateId(nuevoRescateId);
        setSubmitSuccess(true);
        startAdminTimer(nuevoRescateId);
      } else {
        setErrors({ general: response.data.message || "Error al enviar el reporte" });
      }
    } catch (err) {
      console.error("Error:", err);
      const apiErrors = err.response?.data?.errors;
      if (apiErrors) setErrors(apiErrors);
      else setErrors({ general: err.response?.data?.message || "Error al enviar el reporte" });
    } finally {
      setLoading(false);
    }
  }, [formData, prioridad, fotosFiles, validate, startAdminTimer]);

  const formatTimeRemaining = useCallback((seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      lugar_rescate: "",
      descripcion_rescate: "",
      fecha_rescate: "",
      nombre_reportante: "",
      email_reportante: "",
      telefono_reportante: "",
      lat: null,
      lng: null,
    });
    setFotosFiles([]);
    setFotosPreviews([]);
    setErrors({});
    setPrioridad(null);
    setSubmitSuccess(false);
    setWaitingForAdmin(false);
    setTimeUntilAdminAvailable(null);
    setRescateDisponibleParaAdmin(false);
    setRescateId(null);
    if (timeoutId) clearTimeout(timeoutId);
  }, [timeoutId]);

  const prioridadConfig = {
    urgente: {
      icon: "fa-circle-exclamation",
      color: "#dc2626",
      bgColor: "#fee2e2",
      title: "🚨 URGENTE - Acción inmediata",
      description: "El animal está en peligro inminente de muerte o requiere atención veterinaria urgente.",
      recomendacion: "Llama inmediatamente a la línea de emergencia y comparte la ubicación exacta.",
    },
    herido: {
      icon: "fa-triangle-exclamation",
      color: "#ea580c",
      bgColor: "#ffedd5",
      title: "HERIDO - Necesita atención veterinaria",
      description: "El animal tiene heridas visibles, sangra o presenta signos de dolor.",
      recomendacion: "No lo muevas si tiene fracturas. Contacta a la veterinaria más cercana.",
    },
    abandonado: {
      icon: "fa-paw",
      color: "#ca8a04",
      bgColor: "#fef9c3",
      title: "ABANDONADO - Busca hogar temporal",
      description: "Animal abandonado que necesita refugio temporal mientras encuentra un hogar.",
      recomendacion: "Puedes ofrecerle agua y comida mientras esperas ayuda.",
    },
    otro: {
      icon: "fa-info-circle",
      color: "#16a34a",
      bgColor: "#dcfce7",
      title: "OTRO - Información general",
      description: "Situación no clasificada en las anteriores categorías.",
      recomendacion: "Comparte la mayor cantidad de detalles posibles para evaluar la situación.",
    },
  };

  const prioridadTexto = {
    alta: "Alta",
    media: "Media",
    baja: "Baja",
  };

  const botonesPrioridad = [
    { tipo: "urgente", icono: "fa-skull-crosswalk", label: "🚨 Urgente", desc: "Vida en peligro" },
    { tipo: "herido", icono: "fa-band-aid", label: " Herido", desc: "Necesita atención" },
    { tipo: "abandonado", icono: "fa-home", label: "Abandonado", desc: "Busca refugio" },
    { tipo: "otro", icono: "fa-info-circle", label: "Otro", desc: "Otra situación" },
  ];

  return {
    formData,
    errors,
    loading,
    submitSuccess,
    waitingForAdmin,
    timeUntilAdminAvailable,
    rescateDisponibleParaAdmin,
    rescateId,
    prioridad,
    fotosPreviews,
    fotosFiles,
    gettingLocation,
    handleChange,
    handleLocationChange,
    getCurrentLocation,
    setPrioridadManual,
    handleSubmit,
    resetForm,
    handleFotosChange,
    prioridadConfig,
    prioridadTexto,
    botonesPrioridad,
    formatTimeRemaining,
    t,
  };
};

export default useRescate;