// src/hooks/useEditarMascota.js
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import { getImageUrl } from "../utils/imageUtils";

const useEditarMascota = (id) => {
  const { t } = useTranslation("nuevaMascota");
  const navigate = useNavigate();
  const { user } = useAuth();

  // Estados
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [razasList, setRazasList] = useState([]);
  const [vacunasList, setVacunasList] = useState([]);
  const [galeriaExistente, setGaleriaExistente] = useState([]);
  const [fotosEliminar, setFotosEliminar] = useState([]);

  const esFundacion = user?.tipo === "fundacion";
  const fundacionId = esFundacion ? user?.fundacion?.id : null;

  // Datos estáticos
  const especies = ["Perro", "Gato", "Conejo", "Ave", "Otro"];
  const generos = ["Macho", "Hembra", "Desconocido"];
  const estados = ["En adopcion", "Adoptado", "Rescatada", "En acogida"];
  const totalSteps = 6;

  const steps = [
    { number: 1, title: t("steps.informacion_basica"), icon: "fas fa-info-circle" },
    { number: 2, title: t("steps.caracteristicas_fisicas"), icon: "fas fa-ruler" },
    { number: 3, title: t("steps.ubicacion_descripcion"), icon: "fas fa-map-marker-alt" },
    { number: 4, title: t("steps.salud_vacunas"), icon: "fas fa-heartbeat" },
    { number: 5, title: t("steps.requisitos_adopcion"), icon: "fas fa-clipboard-list" },
    { number: 6, title: t("steps.galeria_fotos"), icon: "fas fa-images" },
  ];

  // ============================================
  // FUNCIONES AUXILIARES
  // ============================================

  const getImageUrlForPath = useCallback((path) => {
    if (!path) return null;
    if (Array.isArray(path)) {
      path = path.find((p) => p && typeof p === "string") || null;
      if (!path) return null;
    }
    if (typeof path !== "string") return null;
    return getImageUrl(path);
  }, []);

  const normalizeEstado = (estado) => {
    if (!estado) return "En adopcion";
    const estadoMap = {
      "En adopción": "En adopcion",
      "En adopcion": "En adopcion",
      Adoptado: "Adoptado",
      Rescatada: "Rescatada",
      "En acogida": "En acogida",
    };
    return estadoMap[estado] || "En adopcion";
  };

  const normalizeArray = (value) => {
    if (Array.isArray(value)) return value;
    if (value === null || value === undefined) return [];
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return value ? [value] : [];
      }
    }
    return [];
  };

  const cleanEdad = (edad) => {
    if (!edad && edad !== 0) return "";
    const edadNum = parseFloat(edad);
    if (isNaN(edadNum)) return "";
    const edadRedondeada = Math.round(edadNum);
    if (edadRedondeada === 0) return "";
    return edadRedondeada.toString();
  };

  const extractCloudinaryPublicId = (url) => {
    if (!url || typeof url !== "string") return null;
    if (!url.includes("cloudinary.com")) return null;
    const matches = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z]+)?$/);
    if (matches && matches[1]) {
      return matches[1].replace(/\.[^.]+$/, "");
    }
    return null;
  };

  // Formulario
  const [form, setForm] = useState({
    nombre_mascota: "",
    especie: "",
    razas: [],
    edad_aprox: "",
    genero: "",
    estado: "En adopcion",
    peso_aprox: "",
    tamano: "",
    color: "",
    lugar_rescate: "",
    descripcion: "",
    condiciones_especiales: "",
    salud_general: "",
    esterilizado: false,
    desparasitado: false,
    vacunado: false,
    vacunas: [],
    enfermedades_cronicas: [],
    medicamentos: [],
    necesita_hogar_temporal: false,
    apto_con_ninos: true,
    apto_con_otros_animales: true,
    requisitos_adopcion: [],
    hogar_recomendado: "",
    foto_principal: null,
    foto_principal_preview: null,
    galeria_fotos: [],
    galeria_fotos_previews: [],
    video_url: "",
    fecha_ingreso: new Date().toISOString().split("T")[0],
    fecha_salida: "",
    destacada: false,
    rescate_id: null,
  });

  // ============================================
  // VALIDACIÓN DE PASOS
  // ============================================
  const validateStep = useCallback(() => {
    const newErrors = {};
    switch (currentStep) {
      case 1:
        if (!form.nombre_mascota?.trim()) newErrors.nombre_mascota = t("errores.nombre_requerido");
        if (!form.especie) newErrors.especie = t("errores.especie_requerida");
        if (!form.razas?.length) newErrors.razas = t("errores.razas_requeridas");
        if (!form.edad_aprox && form.edad_aprox !== 0) newErrors.edad_aprox = t("errores.edad_requerida");
        if (!form.genero) newErrors.genero = t("errores.genero_requerido");
        break;
      case 2:
        break;
      case 3:
        if (!form.lugar_rescate?.trim()) newErrors.lugar_rescate = t("errores.lugar_rescate_requerido");
        if (!form.descripcion?.trim()) newErrors.descripcion = t("errores.descripcion_requerida");
        break;
      case 4:
      case 5:
        break;
      case 6:
        const hasExistingPhoto = form.foto_principal_preview && typeof form.foto_principal_preview === "string";
        const hasNewPhoto = form.foto_principal instanceof File;
        if (!hasExistingPhoto && !hasNewPhoto) {
          newErrors.foto_principal = t("errores.foto_principal_requerida");
        }
        break;
      default:
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [currentStep, form, t]);

  // ============================================
  // NAVEGACIÓN
  // ============================================
  const nextStep = useCallback(() => {
    if (validateStep() && currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [validateStep, currentStep, totalSteps]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentStep]);

  // ============================================
  // MANEJAR ELIMINACIÓN DE FOTOS EXISTENTES
  // ============================================
  const handleRemoveExistingFoto = useCallback((index, fotoPath) => {
    let pathToDelete = fotoPath;
    if (fotoPath && typeof fotoPath === "string") {
      const cloudinaryId = extractCloudinaryPublicId(fotoPath);
      if (cloudinaryId) {
        pathToDelete = cloudinaryId;
        console.log("☁️ Public ID Cloudinary extraído:", pathToDelete);
      } else if (fotoPath.startsWith("http")) {
        const parts = fotoPath.split("/storage/");
        pathToDelete = parts.length > 1 ? parts[1] : fotoPath;
      } else if (fotoPath.startsWith("storage/")) {
        pathToDelete = fotoPath.substring(8);
      }
    }
    console.log("🗑️ Marcando foto para eliminar:", { original: fotoPath, cleaned: pathToDelete });
    setFotosEliminar((prev) => [...prev, pathToDelete]);
    setGaleriaExistente((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // ============================================
  // CARGA DE DATOS INICIALES
  // ============================================
  const loadInitialData = useCallback(async () => {
    try {
      const [razasRes, vacunasRes] = await Promise.all([
        api.get("/entity/razas").catch(() => ({ data: { data: [] } })),
        api.get("/entity/tipos-vacunas").catch(() => ({ data: { data: [] } })),
      ]);
      if (razasRes.data?.data?.length > 0) {
        setRazasList(razasRes.data.data);
      } else {
        setRazasList([
          { id: 1, nombre_raza: "Labrador", especie: "Perro" },
          { id: 2, nombre_raza: "Golden Retriever", especie: "Perro" },
          { id: 3, nombre_raza: "Pastor Alemán", especie: "Perro" },
          { id: 4, nombre_raza: "Bulldog", especie: "Perro" },
          { id: 5, nombre_raza: "Poodle", especie: "Perro" },
          { id: 6, nombre_raza: "Chihuahua", especie: "Perro" },
          { id: 7, nombre_raza: "Siames", especie: "Gato" },
          { id: 8, nombre_raza: "Persa", especie: "Gato" },
          { id: 9, nombre_raza: "Maine Coon", especie: "Gato" },
          { id: 10, nombre_raza: "Conejo Belier", especie: "Conejo" },
        ]);
      }
      if (vacunasRes.data?.data?.length > 0) {
        setVacunasList(vacunasRes.data.data);
      } else {
        setVacunasList([
          { id: 1, nombre_vacuna: "Rabia", frecuencia_dias: 365 },
          { id: 2, nombre_vacuna: "Parvovirus", frecuencia_dias: 365 },
          { id: 3, nombre_vacuna: "Moquillo", frecuencia_dias: 365 },
          { id: 4, nombre_vacuna: "Hepatitis", frecuencia_dias: 365 },
          { id: 5, nombre_vacuna: "Leptospirosis", frecuencia_dias: 365 },
          { id: 6, nombre_vacuna: "Triple Felina", frecuencia_dias: 365 },
        ]);
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  }, []);

  // ============================================
  // CARGA DE LA MASCOTA A EDITAR
  // ============================================
  useEffect(() => {
    if (id) {
      setInitialLoading(true);
      Promise.all([loadInitialData(), api.get(`/entity/mascotas/${id}`)])
        .then(([, response]) => {
          if (response.data.success) {
            const mascota = response.data.data;
            console.log("📦 Mascota cargada:", mascota);

            // Procesar galería
            let galeriaArray = [];
            const galeriaRaw = mascota.galeria_fotos;
            if (Array.isArray(galeriaRaw)) {
              galeriaArray = galeriaRaw;
            } else if (typeof galeriaRaw === "string") {
              try {
                const parsed = JSON.parse(galeriaRaw);
                galeriaArray = Array.isArray(parsed) ? parsed : [];
              } catch { galeriaArray = []; }
            }
            galeriaArray = galeriaArray.filter((item) => item && typeof item === "string");

            const fotosExistentes = galeriaArray.map((foto) => ({
              url: getImageUrlForPath(foto),
              path: foto,
              existente: true,
            }));
            console.log("📸 Fotos existentes:", fotosExistentes);
            setGaleriaExistente(fotosExistentes);

            // Procesar foto principal
            let fotoPrincipal = mascota.foto_principal;
            if (Array.isArray(fotoPrincipal)) {
              fotoPrincipal = fotoPrincipal.length > 0 ? fotoPrincipal[0] : null;
            }

            // Cargar formulario
            setForm({
              nombre_mascota: mascota.nombre_mascota || "",
              especie: mascota.especie || "",
              razas: mascota.razas?.map((r) => r.id) || [],
              edad_aprox: cleanEdad(mascota.edad_aprox),
              genero: mascota.genero || "",
              estado: normalizeEstado(mascota.estado || "En adopcion"),
              peso_aprox: mascota.peso_aprox || "",
              tamano: mascota.tamano || "",
              color: mascota.color || "",
              lugar_rescate: mascota.lugar_rescate || "",
              descripcion: mascota.descripcion || "",
              condiciones_especiales: mascota.condiciones_especiales || "",
              salud_general: mascota.salud_general || "",
              esterilizado: Boolean(mascota.esterilizado),
              desparasitado: Boolean(mascota.desparasitado),
              vacunado: Boolean(mascota.vacunado),
              vacunas: mascota.vacunas?.map((v) => v.id) || [],
              enfermedades_cronicas: normalizeArray(mascota.enfermedades_cronicas),
              medicamentos: normalizeArray(mascota.medicamentos),
              necesita_hogar_temporal: Boolean(mascota.necesita_hogar_temporal),
              apto_con_ninos: mascota.apto_con_ninos ?? true,
              apto_con_otros_animales: mascota.apto_con_otros_animales ?? true,
              requisitos_adopcion: normalizeArray(mascota.requisitos_adopcion),
              hogar_recomendado: mascota.hogar_recomendado || "",
              foto_principal: null,
              foto_principal_preview: getImageUrlForPath(fotoPrincipal),
              galeria_fotos: [],
              galeria_fotos_previews: [],
              video_url: mascota.video_url || "",
              fecha_ingreso: mascota.fecha_ingreso || new Date().toISOString().split("T")[0],
              fecha_salida: mascota.fecha_salida || "",
              destacada: Boolean(mascota.destacada),
              rescate_id: mascota.rescate_id || null,
            });
          }
        })
        .catch((err) => {
          console.error("Error cargando mascota:", err);
          toast.error(t("errores.cargar_mascota", "Error al cargar la mascota"));
        })
        .finally(() => setInitialLoading(false));
    }
  }, [id, loadInitialData, t, getImageUrl]);

  // ============================================
  // ENVÍO DEL FORMULARIO (ACTUALIZACIÓN)
  // ============================================
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!validateStep()) {
        toast.error(t("mensajes.campos_incompletos") || "Por favor completa los campos requeridos");
        return;
      }

      if (!esFundacion) {
        toast.error(t("mensajes.solo_fundacion"));
        return;
      }

      setLoading(true);

      const formDataToSend = new FormData();
      formDataToSend.append("_method", "PUT");
      formDataToSend.append("fundacion_id", fundacionId);

      // Datos básicos
      formDataToSend.append("nombre_mascota", form.nombre_mascota || "");
      formDataToSend.append("especie", form.especie || "");
      formDataToSend.append("edad_aprox", form.edad_aprox ? parseInt(form.edad_aprox, 10) : 0);
      formDataToSend.append("genero", form.genero || "");
      formDataToSend.append("estado", form.estado || "En adopcion");

      // Razas
      if (form.razas?.length > 0) {
        form.razas.forEach((id) => formDataToSend.append("razas[]", id));
      }

      // Características físicas
      if (form.peso_aprox) formDataToSend.append("peso_aprox", form.peso_aprox);
      if (form.tamano) formDataToSend.append("tamano", form.tamano);
      if (form.color) formDataToSend.append("color", form.color);

      // Ubicación y descripción
      formDataToSend.append("lugar_rescate", form.lugar_rescate || "");
      formDataToSend.append("descripcion", form.descripcion || "");
      if (form.condiciones_especiales) formDataToSend.append("condiciones_especiales", form.condiciones_especiales);

      // Salud
      if (form.salud_general) formDataToSend.append("salud_general", form.salud_general);
      formDataToSend.append("esterilizado", form.esterilizado ? 1 : 0);
      formDataToSend.append("desparasitado", form.desparasitado ? 1 : 0);
      formDataToSend.append("vacunado", form.vacunado ? 1 : 0);

      if (form.vacunas && form.vacunas.length > 0) {
        form.vacunas.forEach((id) => formDataToSend.append("vacunas[]", id));
      }

      // Enfermedades y medicamentos
      const enfermedadesArray = Array.isArray(form.enfermedades_cronicas)
        ? form.enfermedades_cronicas.filter((item) => item && item.trim())
        : [];
      if (enfermedadesArray.length > 0) {
        enfermedadesArray.forEach((item) => formDataToSend.append("enfermedades_cronicas[]", item));
      }

      const medicamentosArray = Array.isArray(form.medicamentos)
        ? form.medicamentos.filter((item) => item && item.trim())
        : [];
      if (medicamentosArray.length > 0) {
        medicamentosArray.forEach((item) => formDataToSend.append("medicamentos[]", item));
      }

      // Requisitos
      formDataToSend.append("necesita_hogar_temporal", form.necesita_hogar_temporal ? 1 : 0);
      formDataToSend.append("apto_con_ninos", form.apto_con_ninos ? 1 : 0);
      formDataToSend.append("apto_con_otros_animales", form.apto_con_otros_animales ? 1 : 0);

      const requisitosArray = Array.isArray(form.requisitos_adopcion)
        ? form.requisitos_adopcion.filter((item) => item && item.trim())
        : [];
      if (requisitosArray.length > 0) {
        requisitosArray.forEach((item) => formDataToSend.append("requisitos_adopcion[]", item));
      }

      if (form.hogar_recomendado) formDataToSend.append("hogar_recomendado", form.hogar_recomendado);

      // ============================================
      // FOTOS - CÓDIGO CORREGIDO
      // ============================================
      
      // Foto principal (solo si es un archivo nuevo)
      if (form.foto_principal && form.foto_principal instanceof File) {
        formDataToSend.append("foto_principal", form.foto_principal);
        console.log("📸 Foto principal nueva:", form.foto_principal.name);
      }

      // Galería de fotos nuevas
      if (form.galeria_fotos && form.galeria_fotos.length > 0) {
        console.log("📸 Procesando nuevas fotos de galería:", form.galeria_fotos.length);
        form.galeria_fotos.forEach((file, index) => {
          if (file instanceof File) {
            console.log(`✅ Agregando foto galería ${index}:`, file.name);
            formDataToSend.append("galeria_fotos[]", file);
          } else {
            console.warn(`⚠️ Item ${index} no es un File:`, file);
          }
        });
      }

      // Fotos a eliminar
      if (fotosEliminar.length > 0) {
        fotosEliminar.forEach((path) => {
          if (path && path.trim()) {
            formDataToSend.append("fotos_eliminar[]", path);
          }
        });
        console.log("📤 Enviando fotos a eliminar:", fotosEliminar);
      }

      if (form.video_url) formDataToSend.append("video_url", form.video_url);
      formDataToSend.append("fecha_ingreso", form.fecha_ingreso);

      // Debug
      console.log("=== ENVIANDO ACTUALIZACIÓN DE MASCOTA ===");
      for (let [key, value] of formDataToSend.entries()) {
        if (value instanceof File) {
          console.log(`${key}: ${value.name} (${value.type})`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      try {
        const response = await api.post(`/entity/mascotas/${id}`, formDataToSend);

        if (response.data.success) {
          toast.success(t("mensajes.actualizada_exito"));
          navigate("/fundacion/mascotas");
        } else {
          toast.error(response.data.message || t("mensajes.error_procesar"));
        }
      } catch (error) {
        console.error("Error:", error);
        const errorMsg = error.response?.data?.message || error.response?.data?.error || t("mensajes.error_procesar");
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [form, esFundacion, fundacionId, id, navigate, t, validateStep, fotosEliminar]
  );

  return {
    form,
    setForm,
    errors,
    loading,
    initialLoading,
    currentStep,
    esFundacion,
    especies,
    generos,
    estados,
    steps,
    totalSteps,
    razasList,
    vacunasList,
    galeriaExistente,
    setGaleriaExistente,
    setCurrentStep,
    nextStep,
    prevStep,
    handleSubmit,
    getImageUrl,
    handleRemoveExistingFoto,
    fundacionNombre: user?.fundacion?.Nombre_1 || user?.nombre,
  };
};

export default useEditarMascota;