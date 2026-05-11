// src/hooks/useRescate.js
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
    fecha_rescate: new Date().toISOString().split("T")[0],
    nombre_reportante: "",
    email_reportante: "",
    telefono_reportante: "",
    lat: null,
    lng: null,
  });

  // Estado unificado para fotos (archivos y previews)
  const [fotosFiles, setFotosFiles] = useState([]);
  const [fotosPreviews, setFotosPreviews] = useState([]);
  
  const [prioridad, setPrioridad] = useState(null);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Estados para el timer de ADMINISTRADORES (solo ellos esperan)
  const [waitingForAdmin, setWaitingForAdmin] = useState(false);
  const [timeUntilAdminAvailable, setTimeUntilAdminAvailable] = useState(null);
  const [rescateDisponibleParaAdmin, setRescateDisponibleParaAdmin] = useState(false);
  const [rescateId, setRescateId] = useState(null);
  
  const [gettingLocation, setGettingLocation] = useState(false);
  
  // Timer para hacer rescate disponible para ADMINISTRADORES
  const TIMEOUT_MINUTES = 30; // 30 minutos para que el admin pueda intervenir
  const [timeoutId, setTimeoutId] = useState(null);

  // Limpiar timer al desmontar
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  // Función para iniciar el timer solo para ADMINISTRADORES
  // (Fundaciones y veterinarias ven el rescate de inmediato)
  const startAdminTimer = useCallback((rescateIdCreado) => {
    setRescateId(rescateIdCreado);
    setWaitingForAdmin(true);
    setTimeUntilAdminAvailable(TIMEOUT_MINUTES * 60); // convertir a segundos

    const interval = setInterval(() => {
      setTimeUntilAdminAvailable((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setWaitingForAdmin(false);
          setRescateDisponibleParaAdmin(true);
          // Notificar al backend que el rescate ya está disponible para administradores
          rescateService.marcarDisponibleParaAdmin(rescateIdCreado).catch(console.error);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Timer principal para marcar como disponible para admin
    const mainTimeout = setTimeout(() => {
      setWaitingForAdmin(false);
      setRescateDisponibleParaAdmin(true);
      clearInterval(interval);
      rescateService.marcarDisponibleParaAdmin(rescateIdCreado).catch(console.error);
    }, TIMEOUT_MINUTES * 60 * 1000);

    setTimeoutId(mainTimeout);
  }, []);

  // Analizar la descripción para determinar prioridad y tipo de emergencia
  const analizarDescripcion = useCallback((descripcion) => {
    const texto = descripcion.toLowerCase();

    const palabrasUrgente = [
      "urgente", "emergencia", "grave", "critico", "inmediato", "ahora mismo",
      "muriendo", "agonizando", "desangrando", "convulsion", "atropellado",
      "golpeado", "accidente", "veneno", "envenenado", "respira mal",
    ];

    const palabrasHerido = [
      "herido", "sangra", "sangrando", "golpe", "lastimado", "fractura",
      "hueso roto", "cojea", "malherido", "quemadura", "corte", "herida",
      "pata rota", "dolor", "llorando", "gimiendo",
    ];

    const palabrasAbandonado = [
      "abandonado", "cachorros", "solo", "sin dueño", "vagando", "callejero",
      "botaron", "dejaron", "perdido", "extraviado", "bebé", "recién nacido",
    ];

    for (const palabra of palabrasUrgente) {
      if (texto.includes(palabra)) {
        return { tipo: "urgente", prioridad: "alta" };
      }
    }

    for (const palabra of palabrasHerido) {
      if (texto.includes(palabra)) {
        return { tipo: "herido", prioridad: "alta" };
      }
    }

    for (const palabra of palabrasAbandonado) {
      if (texto.includes(palabra)) {
        return { tipo: "abandonado", prioridad: "media" };
      }
    }

    return { tipo: "otro", prioridad: "baja" };
  }, []);

  // Actualizar prioridad cuando cambia la descripción
  useEffect(() => {
    if (
      formData.descripcion_rescate &&
      formData.descripcion_rescate.trim().length > 10
    ) {
      const analisis = analizarDescripcion(formData.descripcion_rescate);
      setPrioridad(analisis);
    } else if (!formData.descripcion_rescate) {
      setPrioridad(null);
    }
  }, [formData.descripcion_rescate, analizarDescripcion]);

  // Manejar cambios en los inputs
  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    },
    [errors],
  );

  // Manejar cambio de ubicación
  const handleLocationChange = useCallback((lat, lng) => {
    setFormData((prev) => ({ ...prev, lat, lng }));
  }, []);

  // Obtener ubicación actual
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setErrors((prev) => ({
        ...prev,
        general: t("errors.geolocation_not_supported"),
      }));
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }));
        setGettingLocation(false);
      },
      (error) => {
        console.error("Error de geolocalización:", error);
        let mensaje = t("errors.location_failed");
        if (error.code === 1) mensaje = t("errors.location_permission_denied");
        else if (error.code === 2) mensaje = t("errors.location_unavailable");
        else mensaje = t("errors.location_timeout");
        setErrors((prev) => ({ ...prev, general: mensaje }));
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }, [t]);

  // Manejar cambio de fotos
  const handleFotosChange = useCallback(
    (files, previews) => {
      console.log("📸 handleFotosChange - files:", files);
      console.log("📸 files[0] es File?", files?.[0] instanceof File);
      
      setFotosFiles(files || []);
      setFotosPreviews(previews || []);

      if (errors.fotos) {
        setErrors((prev) => ({ ...prev, fotos: "" }));
      }
    },
    [errors],
  );

  // Selección manual de prioridad
  const setPrioridadManual = useCallback((tipo) => {
    let prioridadValue = "baja";
    if (tipo === "urgente" || tipo === "herido") prioridadValue = "alta";
    if (tipo === "abandonado") prioridadValue = "media";
    setPrioridad({ tipo, prioridad: prioridadValue });
  }, []);

  // Validar formulario
  const validate = useCallback(() => {
    const newErrors = {};

    if (!formData.lugar_rescate?.trim())
      newErrors.lugar_rescate = t("errors.lugar_required");
    if (!formData.descripcion_rescate?.trim())
      newErrors.descripcion_rescate = t("errors.descripcion_required");
    if (!formData.fecha_rescate)
      newErrors.fecha_rescate = t("errors.fecha_required");
    if (formData.lat == null || formData.lng == null)
      newErrors.ubicacion_rescate = t("errors.location_required", { defaultValue: "Selecciona la ubicación del rescate" });

    if (
      formData.email_reportante &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email_reportante)
    ) {
      newErrors.email_reportante = t("errors.email_invalid");
    }

    if (fotosFiles.length > 0) {
      const maxSize = 5 * 1024 * 1024;
      const oversizedFiles = fotosFiles.filter((f) => f && f.size > maxSize);
      if (oversizedFiles.length > 0) {
        newErrors.fotos = t("errors.photo_max_size", { size: 5 });
      }
      if (fotosFiles.length > 5) {
        newErrors.fotos = t("errors.max_photos", { max: 5 });
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, fotosFiles, t]);

  // Enviar formulario
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validate()) return;

      const formDataToSend = new FormData();

      // Agregar campos normales
      formDataToSend.append("lugar_rescate", formData.lugar_rescate);
      formDataToSend.append("descripcion_rescate", formData.descripcion_rescate);
      formDataToSend.append("fecha_rescate", formData.fecha_rescate);
      formDataToSend.append("tipo_emergencia", prioridad?.tipo || "otro");
      formDataToSend.append("prioridad", prioridad?.prioridad || "baja");
      // El rescate es visible INMEDIATAMENTE para fundaciones y veterinarias
      formDataToSend.append("disponible_para_fundaciones", "true");
      formDataToSend.append("disponible_para_veterinarias", "true");
      formDataToSend.append("disponible_para_admin", "false"); // Solo después de 30 min

      // Campos opcionales
      if (formData.nombre_reportante)
        formDataToSend.append("nombre_reportante", formData.nombre_reportante);
      if (formData.email_reportante)
        formDataToSend.append("email_reportante", formData.email_reportante);
      if (formData.telefono_reportante)
        formDataToSend.append("telefono_reportante", formData.telefono_reportante);
      if (formData.lat != null) formDataToSend.append("lat", formData.lat);
      if (formData.lng != null) formDataToSend.append("lng", formData.lng);

      // Agregar fotos
      if (fotosFiles.length > 0) {
        const validFiles = fotosFiles.filter(f => f instanceof File && f.size > 0);
        
        if (validFiles.length > 0) {
          validFiles.forEach((foto, index) => {
            if (index === 0) {
              formDataToSend.append("foto_principal", foto);
            } else {
              formDataToSend.append("galeria_fotos[]", foto);
            }
          });
        }
      }

      setLoading(true);
      try {
        const response = await rescateService.createRescate(formDataToSend);

        if (response.data.success) {
          const nuevoRescateId = response.data.data.id;
          setRescateId(nuevoRescateId);
          setSubmitSuccess(true);
          // Iniciar timer solo para ADMINISTRADORES
          startAdminTimer(nuevoRescateId);
        } else {
          setErrors({ general: response.data.message || t("errors.general") });
        }
      } catch (err) {
        console.error("Error al enviar rescate:", err);
        const apiErrors = err.response?.data?.errors;
        if (apiErrors) {
          setErrors(apiErrors);
        } else {
          setErrors({
            general: err.response?.data?.message || t("errors.general"),
          });
        }
      } finally {
        setLoading(false);
      }
    },
    [formData, prioridad, fotosFiles, validate, t, startAdminTimer],
  );

  // Formatear tiempo restante
  const formatTimeRemaining = useCallback((seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // Resetear formulario
  const resetForm = useCallback(() => {
    setFormData({
      lugar_rescate: "",
      descripcion_rescate: "",
      fecha_rescate: new Date().toISOString().split("T")[0],
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
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  }, [timeoutId]);

  // Configuración para la tarjeta de prioridad
  const prioridadConfig = {
    urgente: {
      icon: "fa-circle-exclamation",
      color: "#dc2626",
      bgColor: "#fee2e2",
      title: t("prioridad_urgente_title"),
      description: t("prioridad_urgente_desc"),
      recomendacion: t("prioridad_urgente_recomendacion"),
    },
    herido: {
      icon: "fa-triangle-exclamation",
      color: "#ea580c",
      bgColor: "#ffedd5",
      title: t("prioridad_herido_title"),
      description: t("prioridad_herido_desc"),
      recomendacion: t("prioridad_herido_recomendacion"),
    },
    abandonado: {
      icon: "fa-paw",
      color: "#ca8a04",
      bgColor: "#fef9c3",
      title: t("prioridad_abandonado_title"),
      description: t("prioridad_abandonado_desc"),
      recomendacion: t("prioridad_abandonado_recomendacion"),
    },
    otro: {
      icon: "fa-info-circle",
      color: "#16a34a",
      bgColor: "#dcfce7",
      title: t("prioridad_otro_title"),
      description: t("prioridad_otro_desc"),
      recomendacion: t("prioridad_otro_recomendacion"),
    },
  };

  const prioridadTexto = {
    alta: t("prioridad_alta"),
    media: t("prioridad_media"),
    baja: t("prioridad_baja"),
  };

  const botonesPrioridad = [
    { tipo: "urgente", icono: "fa-skull-crosswalk", label: t("btn_urgente"), desc: t("btn_urgente_desc") },
    { tipo: "herido", icono: "fa-band-aid", label: t("btn_herido"), desc: t("btn_herido_desc") },
    { tipo: "abandonado", icono: "fa-home", label: t("btn_abandonado"), desc: t("btn_abandonado_desc") },
    { tipo: "otro", icono: "fa-info-circle", label: t("btn_otro"), desc: t("btn_otro_desc") },
  ];

  return {
    formData,
    errors,
    loading,
    submitSuccess,
    waitingForAdmin,        // Cambiado: antes waitingForResponse
    timeUntilAdminAvailable, // Cambiado: antes timeUntilAvailable
    rescateDisponibleParaAdmin, // Cambiado: antes rescateDisponible
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