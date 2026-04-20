// src/hooks/useNuevaMascota.js
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { rescateService } from '../services/rescateService';

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
  const totalSteps = 4;

  const steps = [
    { number: 1, title: t('steps.informacion_basica'), icon: 'fas fa-info-circle' },
    { number: 2, title: t('steps.ubicacion_descripcion'), icon: 'fas fa-map-marker-alt' },
    { number: 3, title: t('steps.salud_vacunas'), icon: 'fas fa-heartbeat' },
    { number: 4, title: t('steps.galeria_fotos'), icon: 'fas fa-images' },
  ];

  // Formulario
  const [form, setForm] = useState({
    nombre_mascota: '',
    especie: '',
    razas: [],
    edad_aprox: '',
    genero: '',
    estado: 'En adopcion',
    lugar_rescate: '',
    descripcion: '',
    condiciones_especiales: '',
    necesita_hogar_temporal: false,
    apto_con_ninos: true,
    apto_con_otros_animales: true,
    vacunas: [],
    foto_principal: null,
    foto_principal_preview: null,
    galeria_fotos: [],
    galeria_fotos_previews: [],
    fecha_ingreso: new Date().toISOString().split('T')[0],
    fecha_salida: '',
    rescate_id: rescateId || null,
  });

  // Función para obtener URL de imagen
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    return `${baseUrl}/storage/${path}`;
  };

  // Cargar datos de la mascota si es modo edición
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
              edad_aprox: mascota.edad_aprox || '',
              genero: mascota.genero || '',
              estado: mascota.estado || 'En adopcion',
              lugar_rescate: mascota.lugar_rescate || '',
              descripcion: mascota.descripcion || '',
              condiciones_especiales: mascota.condiciones_especiales || '',
              necesita_hogar_temporal: mascota.necesita_hogar_temporal || false,
              apto_con_ninos: mascota.apto_con_ninos ?? true,
              apto_con_otros_animales: mascota.apto_con_otros_animales ?? true,
              vacunas: mascota.vacunas?.map(v => v.id) || [],
              foto_principal: null,
              foto_principal_preview: getImageUrl(mascota.foto_principal),
              galeria_fotos: [],
              galeria_fotos_previews: mascota.galeria_fotos?.map(foto => getImageUrl(foto)) || [],
              fecha_ingreso: mascota.fecha_ingreso || new Date().toISOString().split('T')[0],
              fecha_salida: mascota.fecha_salida || '',
              rescate_id: mascota.rescate_id || null,
            });
          }
        })
        .catch(err => console.error('Error cargando mascota:', err))
        .finally(() => setLoadingMascota(false));
    }
  }, [id, isEditMode, isFromRescate]);

  // Cargar información del rescate
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

  // Cargar razas y vacunas
  const loadInitialData = useCallback(async () => {
    try {
      setInitialLoading(true);
      
      const [razasRes, vacunasRes] = await Promise.all([
        api.get('/entity/razas').catch(() => ({ data: { data: [] } })),
        api.get('/entity/tipos-vacunas').catch(() => ({ data: { data: [] } }))
      ]);
      
      if (razasRes.data.data && razasRes.data.data.length > 0) {
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
      
      if (vacunasRes.data.data && vacunasRes.data.data.length > 0) {
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

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Validar paso actual
  const validateStep = useCallback(() => {
    const newErrors = {};
    
    switch (currentStep) {
      case 1:
        if (!form.nombre_mascota.trim()) newErrors.nombre_mascota = t('errores.nombre_requerido');
        if (!form.especie) newErrors.especie = t('errores.especie_requerida');
        if (form.razas.length === 0) newErrors.razas = t('errores.razas_requeridas');
        if (!form.edad_aprox) newErrors.edad_aprox = t('errores.edad_requerida');
        if (!form.genero) newErrors.genero = t('errores.genero_requerido');
        if (!form.estado) newErrors.estado = t('errores.estado_requerido');
        break;
      case 2:
        if (!form.lugar_rescate.trim()) newErrors.lugar_rescate = t('errores.lugar_rescate_requerido');
        if (!form.descripcion.trim()) newErrors.descripcion = t('errores.descripcion_requerida');
        break;
      case 4:
        if (!form.foto_principal && !form.foto_principal_preview) newErrors.foto_principal = t('errores.foto_principal_requerida');
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [currentStep, form, t]);

  // Navegación de pasos
  const nextStep = useCallback(() => {
    if (validateStep() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [validateStep, currentStep, totalSteps]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  // Enviar formulario
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    
    if (!esFundacion) {
      toast.error(t('mensajes.solo_fundacion'));
      return;
    }
    
    setLoading(true);
    
    // Crear FormData
    const formDataToSend = new FormData();
    
    // Agregar método para edición
    if (isEditMode) {
      formDataToSend.append('_method', 'PUT');
    }
    
    // Datos básicos
    formDataToSend.append('fundacion_id', fundacionId);
    formDataToSend.append('nombre_mascota', form.nombre_mascota || '');
    formDataToSend.append('especie', form.especie || '');
    formDataToSend.append('edad_aprox', form.edad_aprox || '');
    formDataToSend.append('genero', form.genero || '');
    formDataToSend.append('estado', form.estado || 'En adopcion');
    formDataToSend.append('lugar_rescate', form.lugar_rescate || '');
    formDataToSend.append('descripcion', form.descripcion || '');
    formDataToSend.append('fecha_ingreso', form.fecha_ingreso);
    
    // Campos opcionales
    if (form.condiciones_especiales) formDataToSend.append('condiciones_especiales', form.condiciones_especiales);
    formDataToSend.append('necesita_hogar_temporal', form.necesita_hogar_temporal ? 1 : 0);
    formDataToSend.append('apto_con_ninos', form.apto_con_ninos ? 1 : 0);
    formDataToSend.append('apto_con_otros_animales', form.apto_con_otros_animales ? 1 : 0);
    
    // Razas
    if (form.razas && form.razas.length > 0) {
      form.razas.forEach(id => formDataToSend.append('razas[]', id));
    }
    
    // Vacunas
    if (form.vacunas && form.vacunas.length > 0) {
      form.vacunas.forEach(id => formDataToSend.append('vacunas[]', id));
    }
    
    // Foto principal (solo si es un archivo nuevo)
    if (form.foto_principal && form.foto_principal instanceof File) {
      formDataToSend.append('foto_principal', form.foto_principal);
    }
    
    // Galería de fotos (solo archivos nuevos)
    if (form.galeria_fotos && form.galeria_fotos.length > 0) {
      form.galeria_fotos.forEach(file => {
        if (file instanceof File) {
          formDataToSend.append('galeria_fotos[]', file);
        }
      });
    }
    
    try {
      let response;
      
      if (isEditMode) {
        response = await api.post(`/entity/mascotas/${id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else if (rescateId) {
        response = await rescateService.registrarMascota(rescateId, formDataToSend);
      } else {
        response = await api.post('/entity/mascotas', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      if (response.data.success) {
        toast.success(isEditMode ? 'Mascota actualizada exitosamente' : 'Mascota registrada exitosamente');
        
        if (isEditMode) {
          navigate('/fundacion/mascotas');
        } else if (rescateId) {
          navigate('/fundacion/rescates/mis-rescates');
        } else {
          navigate('/fundacion/mascotas');
        }
      } else {
        toast.error(response.data.message || 'Error al procesar la solicitud');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  }, [form, esFundacion, fundacionId, isEditMode, rescateId, id, navigate, t, validateStep]);

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