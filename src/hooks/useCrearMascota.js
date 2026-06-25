// src/hooks/useCrearMascota.js
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { rescateService } from '../services/rescateService';
import { getImageUrl } from '../utils/imageUtils';

// ============================================
// 🎯 FUNCIÓN HELPER CON LA MISMA LÓGICA DEL BACKEND
// ============================================
const determinarEstadoMascota = ({
  estadoSeleccionado = null,
  desdeRescate = false,
  necesitaHogarTemporal = false,
  estadoPorDefecto = 'En adopcion'
}) => {
  // 🥇 MÁXIMA PRIORIDAD: Si necesita hogar temporal, forzar "En acogida"
  if (necesitaHogarTemporal) {
    return 'En acogida';
  }

  // 🥈 SEGUNDA PRIORIDAD: Si el usuario seleccionó un estado, usarlo
  if (estadoSeleccionado && estadoSeleccionado.trim() !== '') {
    return estadoSeleccionado;
  }

  // 🥉 TERCERA PRIORIDAD: Estado por defecto según contexto
  if (desdeRescate) {
    return 'Rescatada';
  }

  return estadoPorDefecto;
};

const getEstadoPorDefecto = (desdeRescate = false) => {
  return desdeRescate ? 'Rescatada' : 'En adopcion';
};

// ============================================
// HOOK PRINCIPAL
// ============================================
const useCrearMascota = () => {
  const { t } = useTranslation('nuevaMascota');
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const rescateId = searchParams.get('rescate_id');
  
  const isFromRescate = !!rescateId;

  // Estados
  const [rescateInfo, setRescateInfo] = useState(null);
  const [loadingRescate, setLoadingRescate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [razasList, setRazasList] = useState([]);
  const [vacunasList, setVacunasList] = useState([]);

  const esFundacion = user?.tipo === 'fundacion';
  const fundacionId = esFundacion ? user?.fundacion?.id : null;

  // Datos estáticos
  const especies = ['Perro', 'Gato', 'Conejo', 'Ave', 'Otro'];
  const generos = ['Macho', 'Hembra', 'Desconocido'];
  const totalSteps = 6;

  const steps = [
    { number: 1, title: t('steps.informacion_basica'), icon: 'fas fa-info-circle' },
    { number: 2, title: t('steps.caracteristicas_fisicas'), icon: 'fas fa-ruler' },
    { number: 3, title: t('steps.ubicacion_descripcion'), icon: 'fas fa-map-marker-alt' },
    { number: 4, title: t('steps.salud_vacunas'), icon: 'fas fa-heartbeat' },
    { number: 5, title: t('steps.requisitos_adopcion'), icon: 'fas fa-clipboard-list' },
    { number: 6, title: t('steps.galeria_fotos'), icon: 'fas fa-images' },
  ];

  // Estado por defecto según contexto (misma lógica que backend)
  const estadoPorDefecto = getEstadoPorDefecto(isFromRescate);

  // Formulario
  const [form, setForm] = useState({
    nombre_mascota: '',
    especie: '',
    razas: [],
    edad_aprox: '',
    genero: '',
    estado: estadoPorDefecto,
    peso_aprox: '',
    tamano: '',
    color: '',
    lugar_rescate: '',
    descripcion: '',
    condiciones_especiales: '',
    salud_general: '',
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
    hogar_recomendado: '',
    foto_principal: null,
    foto_principal_preview: null,
    galeria_fotos: [],
    galeria_fotos_previews: [],
    video_url: '',
    fecha_ingreso: new Date().toISOString().split('T')[0],
    fecha_salida: '',
    destacada: false,
    rescate_id: rescateId || null,
  });

  // ============================================
  // VALIDACIÓN DE PASOS
  // ============================================
  const validateStep = useCallback(() => {
    const newErrors = {};
    
    switch (currentStep) {
      case 1:
        if (!form.nombre_mascota?.trim()) newErrors.nombre_mascota = t('errores.nombre_requerido');
        if (!form.especie) newErrors.especie = t('errores.especie_requerida');
        if (!form.razas?.length) newErrors.razas = t('errores.razas_requeridas');
        if (!form.edad_aprox && form.edad_aprox !== 0) newErrors.edad_aprox = t('errores.edad_requerida');
        if (!form.genero) newErrors.genero = t('errores.genero_requerido');
        break;
      case 2:
        break;
      case 3:
        if (!form.lugar_rescate?.trim()) newErrors.lugar_rescate = t('errores.lugar_rescate_requerido');
        if (!form.descripcion?.trim()) newErrors.descripcion = t('errores.descripcion_requerida');
        break;
      case 4:
      case 5:
        break;
      case 6:
        if (!form.foto_principal && !form.foto_principal_preview) {
          newErrors.foto_principal = t('errores.foto_principal_requerida');
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
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [validateStep, currentStep, totalSteps]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  // ============================================
  // CARGA DE DATOS INICIALES
  // ============================================
  const loadInitialData = useCallback(async () => {
    try {
      setInitialLoading(true);
      
      const [razasRes, vacunasRes] = await Promise.all([
        api.get('/entity/razas').catch(() => ({ data: { data: [] } })),
        api.get('/entity/tipos-vacunas').catch(() => ({ data: { data: [] } }))
      ]);
      
      if (razasRes.data?.data?.length > 0) {
        setRazasList(razasRes.data.data);
      } else {
        setRazasList([
          { id: 1, nombre_raza: 'Labrador', especie: 'Perro' },
          { id: 2, nombre_raza: 'Golden Retriever', especie: 'Perro' },
          { id: 3, nombre_raza: 'Pastor Alemán', especie: 'Perro' },
          { id: 4, nombre_raza: 'Bulldog', especie: 'Perro' },
          { id: 5, nombre_raza: 'Poodle', especie: 'Perro' },
          { id: 6, nombre_raza: 'Chihuahua', especie: 'Perro' },
          { id: 7, nombre_raza: 'Siames', especie: 'Gato' },
          { id: 8, nombre_raza: 'Persa', especie: 'Gato' },
          { id: 9, nombre_raza: 'Maine Coon', especie: 'Gato' },
          { id: 10, nombre_raza: 'Conejo Belier', especie: 'Conejo' },
        ]);
      }
      
      if (vacunasRes.data?.data?.length > 0) {
        setVacunasList(vacunasRes.data.data);
      } else {
        setVacunasList([
          { id: 1, nombre_vacuna: 'Rabia', frecuencia_dias: 365 },
          { id: 2, nombre_vacuna: 'Parvovirus', frecuencia_dias: 365 },
          { id: 3, nombre_vacuna: 'Moquillo', frecuencia_dias: 365 },
          { id: 4, nombre_vacuna: 'Hepatitis', frecuencia_dias: 365 },
          { id: 5, nombre_vacuna: 'Leptospirosis', frecuencia_dias: 365 },
          { id: 6, nombre_vacuna: 'Triple Felina', frecuencia_dias: 365 },
        ]);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setInitialLoading(false);
    }
  }, []);

  // ============================================
  // CARGA DE INFORMACIÓN DEL RESCATE
  // ============================================
  useEffect(() => {
    if (rescateId && !isFromRescate) {
      setLoadingRescate(true);
      rescateService.getRescateById(rescateId)
        .then(response => {
          if (response.data.success) {
            setRescateInfo(response.data.data);
            setForm(prev => ({
              ...prev,
              lugar_rescate: response.data.data.lugar_rescate || '',
              descripcion: response.data.data.descripcion_rescate || '',
            }));
          }
        })
        .catch(err => console.error('Error al cargar rescate:', err))
        .finally(() => setLoadingRescate(false));
    }
  }, [rescateId, isFromRescate]);

  // ============================================
  // 🎯 EFECTO: Sincronizar estado cuando cambia necesita_hogar_temporal
  // (Misma lógica que el backend)
  // ============================================
  useEffect(() => {
    const nuevoEstado = determinarEstadoMascota({
      estadoSeleccionado: form.estado,
      desdeRescate: isFromRescate,
      necesitaHogarTemporal: form.necesita_hogar_temporal,
      estadoPorDefecto: 'En adopcion'
    });

    if (nuevoEstado !== form.estado) {
      setForm(prev => ({
        ...prev,
        estado: nuevoEstado
      }));
    }
  }, [form.necesita_hogar_temporal, isFromRescate]);

  // ============================================
  // ENVÍO DEL FORMULARIO (CREACIÓN)
  // ============================================
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    const isValid = validateStep();
    if (!isValid) {
      toast.error(t('mensajes.campos_incompletos') || 'Por favor completa los campos requeridos');
      return;
    }
    
    if (!esFundacion) {
      toast.error(t('mensajes.solo_fundacion'));
      return;
    }
    
    setLoading(true);
    
    const formDataToSend = new FormData();
    
    // ============================================
    // 🎯 DETERMINAR ESTADO FINAL (misma lógica que backend)
    // ============================================
    const estadoFinal = determinarEstadoMascota({
      estadoSeleccionado: form.estado,
      desdeRescate: isFromRescate,
      necesitaHogarTemporal: form.necesita_hogar_temporal,
      estadoPorDefecto: 'En adopcion'
    });
    
    // ============================================
    // DATOS BÁSICOS
    // ============================================
    formDataToSend.append('fundacion_id', fundacionId);
    formDataToSend.append('nombre_mascota', form.nombre_mascota || '');
    formDataToSend.append('especie', form.especie || '');
    formDataToSend.append('edad_aprox', form.edad_aprox ? parseInt(form.edad_aprox, 10) : 0);
    formDataToSend.append('genero', form.genero || '');
    formDataToSend.append('estado', estadoFinal); // ← Usar estado FINAL
    
    // ============================================
    // RAZAS
    // ============================================
    if (form.razas && form.razas.length > 0) {
      form.razas.forEach(id => formDataToSend.append('razas[]', id));
    }
    
    // ============================================
    // CARACTERÍSTICAS FÍSICAS
    // ============================================
    if (form.peso_aprox) formDataToSend.append('peso_aprox', form.peso_aprox);
    if (form.tamano) formDataToSend.append('tamano', form.tamano);
    if (form.color) formDataToSend.append('color', form.color);
    
    // ============================================
    // UBICACIÓN Y DESCRIPCIÓN
    // ============================================
    formDataToSend.append('lugar_rescate', form.lugar_rescate || '');
    formDataToSend.append('descripcion', form.descripcion || '');
    if (form.condiciones_especiales) formDataToSend.append('condiciones_especiales', form.condiciones_especiales);

    // ============================================
    // SALUD
    // ============================================
    if (form.salud_general) formDataToSend.append('salud_general', form.salud_general);
    formDataToSend.append('esterilizado', form.esterilizado ? 1 : 0);
    formDataToSend.append('desparasitado', form.desparasitado ? 1 : 0);
    formDataToSend.append('vacunado', form.vacunado ? 1 : 0);

    // ============================================
    // VACUNAS
    // ============================================
    if (form.vacunas && form.vacunas.length > 0) {
      form.vacunas.forEach(id => formDataToSend.append('vacunas[]', id));
    }

    // ============================================
    // ENFERMEDADES CRÓNICAS
    // ============================================
    const enfermedadesArray = Array.isArray(form.enfermedades_cronicas)
      ? form.enfermedades_cronicas.filter(item => item && item.trim())
      : [];
    if (enfermedadesArray.length > 0) {
      enfermedadesArray.forEach(item => formDataToSend.append('enfermedades_cronicas[]', item));
    }

    // ============================================
    // MEDICAMENTOS
    // ============================================
    const medicamentosArray = Array.isArray(form.medicamentos)
      ? form.medicamentos.filter(item => item && item.trim())
      : [];
    if (medicamentosArray.length > 0) {
      medicamentosArray.forEach(item => formDataToSend.append('medicamentos[]', item));
    }

    // ============================================
    // REQUISITOS
    // ============================================
    formDataToSend.append('necesita_hogar_temporal', form.necesita_hogar_temporal ? 1 : 0);
    formDataToSend.append('apto_con_ninos', form.apto_con_ninos ? 1 : 0);
    formDataToSend.append('apto_con_otros_animales', form.apto_con_otros_animales ? 1 : 0);

    const requisitosArray = Array.isArray(form.requisitos_adopcion)
      ? form.requisitos_adopcion.filter(item => item && item.trim())
      : [];
    if (requisitosArray.length > 0) {
      requisitosArray.forEach(item => formDataToSend.append('requisitos_adopcion[]', item));
    }

    // ============================================
    // HOGAR RECOMENDADO
    // ============================================
    if (form.hogar_recomendado) formDataToSend.append('hogar_recomendado', form.hogar_recomendado);

    // ============================================
    // FOTOS
    // ============================================
    if (form.foto_principal && form.foto_principal instanceof File) {
      formDataToSend.append('foto_principal', form.foto_principal);
    }

    if (form.galeria_fotos && form.galeria_fotos.length > 0) {
      form.galeria_fotos.forEach(item => {
        const file = item?.file || item;
        if (file instanceof File) {
          formDataToSend.append('galeria_fotos[]', file);
        }
      });
    }

    // ============================================
    // VIDEO Y FECHA
    // ============================================
    if (form.video_url) formDataToSend.append('video_url', form.video_url);
    formDataToSend.append('fecha_ingreso', form.fecha_ingreso);

    // ============================================
    // DEBUG
    // ============================================
    console.log('=== ENVIANDO CREACIÓN DE MASCOTA ===');
    console.log('Estado final:', estadoFinal);
    console.log('Desde rescate:', isFromRescate);
    console.log('Necesita hogar temporal:', form.necesita_hogar_temporal);
    for (let [key, value] of formDataToSend.entries()) {
      if (value instanceof File) {
        console.log(`${key}: ${value.name} (${value.type})`);
      } else {
        console.log(`${key}: ${value}`);
      }
    }

    try {
      let response;
      
      if (rescateId) {
        response = await rescateService.registrarMascota(rescateId, formDataToSend);
      } else {
        response = await api.post('/entity/mascotas', formDataToSend);
      }
      
      if (response.data.success) {
        toast.success(t('mensajes.registrada_exito'));
        
        if (rescateId) {
          navigate('/fundacion/rescates/mis-rescates');
        } else {
          navigate('/fundacion/mascotas');
        }
      } else {
        toast.error(response.data.message || t('mensajes.error_procesar'));
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || t('mensajes.error_procesar');
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [form, esFundacion, fundacionId, rescateId, navigate, t, validateStep, isFromRescate]);

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  return {
    form,
    setForm,
    errors,
    loading,
    initialLoading,
    loadingRescate,
    currentStep,
    rescateInfo,
    rescateId,
    esFundacion,
    isFromRescate: !!rescateId,
    especies,
    generos,
    estados: isFromRescate ? ['Rescatada', 'En acogida'] : ['En adopcion', 'Adoptado', 'Rescatada', 'En acogida'],
    steps,
    totalSteps,
    razasList,
    vacunasList,
    setCurrentStep,
    nextStep,
    prevStep,
    handleSubmit,
    getImageUrl,
    fundacionNombre: user?.fundacion?.Nombre_1 || user?.nombre,
  };
};

export default useCrearMascota;