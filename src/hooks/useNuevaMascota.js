// src/hooks/useNuevaMascota.js
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { rescateService } from '../services/rescateService';

// Función para limpiar decimales de la edad
const cleanEdad = (edad) => {
  if (!edad && edad !== 0) return '';
  const edadNum = parseFloat(edad);
  if (isNaN(edadNum)) return '';
  const edadRedondeada = Math.round(edadNum);
  if (edadRedondeada === 0) return '';
  return edadRedondeada.toString();
};

// Función auxiliar para normalizar arrays desde BD
const normalizeArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined) return [];
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return value ? [value] : [];
    }
  }
  return [];
};

const useNuevaMascota = () => {
  const { t } = useTranslation('nuevaMascota');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const rescateId = searchParams.get('rescate_id');
  
  const isEditMode = !!id;
  const isFromRescate = !!rescateId;

  // Estados
  const [rescateInfo, setRescateInfo] = useState(null);
  const [loadingRescate, setLoadingRescate] = useState(false);
  const [loadingMascota, setLoadingMascota] = useState(false);
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
  const estados = ['En adopcion', 'Rescatada', 'En acogida', 'Adoptado'];
  const totalSteps = 6;

  const steps = [
    { number: 1, title: t('steps.informacion_basica'), icon: 'fas fa-info-circle' },
    { number: 2, title: t('steps.caracteristicas_fisicas'), icon: 'fas fa-ruler' },
    { number: 3, title: t('steps.ubicacion_descripcion'), icon: 'fas fa-map-marker-alt' },
    { number: 4, title: t('steps.salud_vacunas'), icon: 'fas fa-heartbeat' },
    { number: 5, title: t('steps.requisitos_adopcion'), icon: 'fas fa-clipboard-list' },
    { number: 6, title: t('steps.galeria_fotos'), icon: 'fas fa-images' },
  ];

  // Formulario
  const [form, setForm] = useState({
    nombre_mascota: '',
    especie: '',
    razas: [],
    edad_aprox: '',
    genero: '',
    estado: 'En adopcion',
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

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    return `${baseUrl}/storage/${path}`;
  };

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
        if (!form.edad_aprox) newErrors.edad_aprox = t('errores.edad_requerida');
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
  // CARGA DE DATOS INICIALES (RAZAS Y VACUNAS)
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
  // ENVÍO DEL FORMULARIO
  // ============================================
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    
    if (!esFundacion) {
      toast.error(t('mensajes.solo_fundacion'));
      return;
    }
    
    setLoading(true);
    
    const formDataToSend = new FormData();
    
    if (isEditMode) {
      formDataToSend.append('_method', 'PUT');
    }
    
    // Paso 1
    formDataToSend.append('fundacion_id', fundacionId);
    formDataToSend.append('nombre_mascota', form.nombre_mascota || '');
    formDataToSend.append('especie', form.especie || '');
    const edadLimpia = form.edad_aprox ? parseInt(form.edad_aprox, 10) : 0;
    formDataToSend.append('edad_aprox', edadLimpia);
    formDataToSend.append('genero', form.genero || '');
    formDataToSend.append('estado', form.estado || 'En adopcion');
    
    if (form.razas?.length > 0) {
      form.razas.forEach(id => formDataToSend.append('razas[]', id));
    }
    
    // Paso 2
    if (form.peso_aprox) formDataToSend.append('peso_aprox', form.peso_aprox);
    if (form.tamano) formDataToSend.append('tamano', form.tamano);
    if (form.color) formDataToSend.append('color', form.color);
    
    // Paso 3
    formDataToSend.append('lugar_rescate', form.lugar_rescate || '');
    formDataToSend.append('descripcion', form.descripcion || '');
    if (form.condiciones_especiales) formDataToSend.append('condiciones_especiales', form.condiciones_especiales);

    // ============================================
// PASO 4: SALUD Y VACUNAS
// ============================================
if (form.salud_general) formDataToSend.append('salud_general', form.salud_general);
formDataToSend.append('esterilizado', form.esterilizado ? 1 : 0);
formDataToSend.append('desparasitado', form.desparasitado ? 1 : 0);
formDataToSend.append('vacunado', form.vacunado ? 1 : 0);

// Vacunas (array de IDs para relación many-to-many)
if (form.vacunas && form.vacunas.length > 0) {
    form.vacunas.forEach(id => formDataToSend.append('vacunas[]', id));
}

// enfermedades_cronicas
const enfermedadesArray = Array.isArray(form.enfermedades_cronicas)
  ? form.enfermedades_cronicas.filter(item => item && item.trim())
  : [];
if (enfermedadesArray.length > 0) {
  enfermedadesArray.forEach(item => formDataToSend.append('enfermedades_cronicas[]', item));
}

// medicamentos
const medicamentosArray = Array.isArray(form.medicamentos)
  ? form.medicamentos.filter(item => item && item.trim())
  : [];
if (medicamentosArray.length > 0) {
  medicamentosArray.forEach(item => formDataToSend.append('medicamentos[]', item));
}

// ============================================
// PASO 5: REQUISITOS ADOPCIÓN
// ============================================
formDataToSend.append('necesita_hogar_temporal', form.necesita_hogar_temporal ? 1 : 0);
formDataToSend.append('apto_con_ninos', form.apto_con_ninos ? 1 : 0);
formDataToSend.append('apto_con_otros_animales', form.apto_con_otros_animales ? 1 : 0);

// requisitos_adopcion
const requisitosArray = Array.isArray(form.requisitos_adopcion)
  ? form.requisitos_adopcion.filter(item => item && item.trim())
  : [];
if (requisitosArray.length > 0) {
  requisitosArray.forEach(item => formDataToSend.append('requisitos_adopcion[]', item));
}

if (form.hogar_recomendado) formDataToSend.append('hogar_recomendado', form.hogar_recomendado);

// ============================================
// PASO 6: FOTOS Y GALERÍA
// ============================================
if (form.foto_principal && form.foto_principal instanceof File) {
  formDataToSend.append('foto_principal', form.foto_principal);
}

if (form.galeria_fotos?.length > 0) {
  form.galeria_fotos.forEach(item => {
    const file = item?.file || item;
    if (file instanceof File) {
      formDataToSend.append('galeria_fotos[]', file);
    }
  });
}

if (form.video_url) formDataToSend.append('video_url', form.video_url);
formDataToSend.append('fecha_ingreso', form.fecha_ingreso);

// DEBUG: Mostrar qué se está enviando
console.log('=== FORM DATA A ENVIAR ===');
for (let [key, value] of formDataToSend.entries()) {
  if (value instanceof File) {
    console.log(`${key}: ${value.name} (${value.type}, ${value.size} bytes)`);
  } else {
    console.log(`${key}: ${value}`);
  }
}

try {
      let response;
      
      if (isEditMode) {
        response = await api.post(`/entity/mascotas/${id}`, formDataToSend, {
          headers: { 'Content-Type': undefined },
        });
      } else if (rescateId) {
        response = await rescateService.registrarMascota(rescateId, formDataToSend);
      } else {
        response = await api.post('/entity/mascotas', formDataToSend, {
          headers: { 'Content-Type': undefined },
        });
      }
      
      if (response.data.success) {
        toast.success(isEditMode ? t('mensajes.actualizada_exito') : t('mensajes.registrada_exito'));
        
        if (isEditMode) {
          navigate('/fundacion/mascotas');
        } else if (rescateId) {
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
  }, [form, esFundacion, fundacionId, isEditMode, rescateId, id, navigate, t, validateStep]);

  // ============================================
  // EFECTOS
  // ============================================
  
  // ✅ EFECTO 1: Cargar datos de la mascota (edición)
  useEffect(() => {
    if (isEditMode && !isFromRescate) {
      setLoadingMascota(true);
      api.get(`/entity/mascotas/${id}`)
        .then(response => {
          if (response.data.success) {
            const mascota = response.data.data;
            setForm({
              nombre_mascota: mascota.nombre_mascota || '',
              especie: mascota.especie || '',
              razas: mascota.razas?.map(r => r.id) || [],
              edad_aprox: cleanEdad(mascota.edad_aprox),
              genero: mascota.genero || '',
              estado: mascota.estado || 'En adopcion',
              peso_aprox: mascota.peso_aprox || '',
              tamano: mascota.tamano || '',
              color: mascota.color || '',
              lugar_rescate: mascota.lugar_rescate || '',
              descripcion: mascota.descripcion || '',
              condiciones_especiales: mascota.condiciones_especiales || '',
              salud_general: mascota.salud_general || '',
              esterilizado: Boolean(mascota.esterilizado),
              desparasitado: Boolean(mascota.desparasitado),
              vacunado: Boolean(mascota.vacunado),
              vacunas: mascota.vacunas?.map(v => v.id) || [],
              enfermedades_cronicas: normalizeArray(mascota.enfermedades_cronicas),
              medicamentos: normalizeArray(mascota.medicamentos),
              necesita_hogar_temporal: Boolean(mascota.necesita_hogar_temporal),
              apto_con_ninos: mascota.apto_con_ninos ?? true,
              apto_con_otros_animales: mascota.apto_con_otros_animales ?? true,
              requisitos_adopcion: normalizeArray(mascota.requisitos_adopcion),
              hogar_recomendado: mascota.hogar_recomendado || '',
              foto_principal: null,
              foto_principal_preview: getImageUrl(mascota.foto_principal),
              galeria_fotos: [],
              galeria_fotos_previews: normalizeArray(mascota.galeria_fotos).map(foto => getImageUrl(foto)),
              video_url: mascota.video_url || '',
              fecha_ingreso: mascota.fecha_ingreso || new Date().toISOString().split('T')[0],
              fecha_salida: mascota.fecha_salida || '',
              destacada: Boolean(mascota.destacada),
              rescate_id: mascota.rescate_id || null,
            });
          }
        })
        .catch(err => console.error('Error cargando mascota:', err))
        .finally(() => setLoadingMascota(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditMode, isFromRescate]); // ✅ Solo dependencias necesarias

  // ✅ EFECTO 2: Cargar información del rescate
  useEffect(() => {
    if (rescateId && !isEditMode) {
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
  }, [rescateId, isEditMode]);

  // ✅ EFECTO 3: Cargar datos iniciales (razas y vacunas)
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // ============================================
  // RETURN
  // ============================================
  return {
    form,
    setForm,
    errors,
    loading,
    initialLoading,
    loadingRescate,
    loadingMascota,
    currentStep,
    rescateInfo,
    rescateId,
    esFundacion,
    isEditMode,
    isFromRescate,
    especies,
    generos,
    estados,
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

export default useNuevaMascota;