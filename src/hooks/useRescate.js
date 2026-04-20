// src/hooks/useRescate.js
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { reportarRescate } from '../services/api';

const useRescate = () => {
  const { t } = useTranslation('rescate');
  const navigate = useNavigate();

  // Estado del formulario
  const [formData, setFormData] = useState({
    lugar_rescate: '',
    descripcion_rescate: '',
    fecha_rescate: '',
    nombre_reportante: '',
    email_reportante: '',
    telefono_reportante: '',
    lat: null,
    lng: null,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [prioridad, setPrioridad] = useState(null);

  // Analizar la descripción para determinar prioridad y tipo de emergencia
  const analizarDescripcion = useCallback((descripcion) => {
    const texto = descripcion.toLowerCase();

    const palabrasUrgente = [
      'urgente', 'emergencia', 'grave', 'critico', 'inmediato', 'ahora mismo',
      'muriendo', 'agonizando', 'desangrando', 'convulsion', 'atropellado',
      'golpeado', 'accidente', 'veneno', 'envenenado', 'respira mal',
    ];

    const palabrasHerido = [
      'herido', 'sangra', 'sangrando', 'golpe', 'lastimado', 'fractura',
      'hueso roto', 'cojea', 'malherido', 'quemadura', 'corte', 'herida',
      'pata rota', 'dolor', 'llorando', 'gimiendo',
    ];

    const palabrasAbandonado = [
      'abandonado', 'cachorros', 'solo', 'sin dueño', 'vagando', 'callejero',
      'botaron', 'dejaron', 'perdido', 'extraviado', 'bebé', 'recién nacido',
    ];

    for (const palabra of palabrasUrgente) {
      if (texto.includes(palabra)) {
        return { tipo: 'urgente', prioridad: 'alta' };
      }
    }

    for (const palabra of palabrasHerido) {
      if (texto.includes(palabra)) {
        return { tipo: 'herido', prioridad: 'alta' };
      }
    }

    for (const palabra of palabrasAbandonado) {
      if (texto.includes(palabra)) {
        return { tipo: 'abandonado', prioridad: 'media' };
      }
    }

    return { tipo: 'otro', prioridad: 'baja' };
  }, []);

  // Actualizar prioridad cuando cambia la descripción
  useEffect(() => {
    if (formData.descripcion_rescate && formData.descripcion_rescate.trim().length > 10) {
      const analisis = analizarDescripcion(formData.descripcion_rescate);
      setPrioridad(analisis);
    } else if (!formData.descripcion_rescate) {
      setPrioridad(null);
    }
  }, [formData.descripcion_rescate, analizarDescripcion]);

  // Manejar cambios en los inputs
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  // Manejar cambio de ubicación
  const handleLocationChange = useCallback((lat, lng) => {
    setFormData((prev) => ({ ...prev, lat, lng }));
  }, []);

  // Obtener ubicación actual
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setErrors((prev) => ({
        ...prev,
        general: t('errors.geolocation_not_supported'),
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
        console.error('Error de geolocalización:', error);
        let mensaje = t('errors.location_failed');
        if (error.code === 1) mensaje = t('errors.location_permission_denied');
        else if (error.code === 2) mensaje = t('errors.location_unavailable');
        else mensaje = t('errors.location_timeout');
        setErrors((prev) => ({ ...prev, general: mensaje }));
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [t]);

  // Selección manual de prioridad
  const setPrioridadManual = useCallback((tipo) => {
    let prioridadValue = 'baja';
    if (tipo === 'urgente' || tipo === 'herido') prioridadValue = 'alta';
    if (tipo === 'abandonado') prioridadValue = 'media';
    setPrioridad({ tipo, prioridad: prioridadValue });
  }, []);

  // Validar formulario
  const validate = useCallback(() => {
    const newErrors = {};
    if (!formData.lugar_rescate.trim()) newErrors.lugar_rescate = t('errors.lugar_required');
    if (!formData.descripcion_rescate.trim()) newErrors.descripcion_rescate = t('errors.descripcion_required');
    if (!formData.fecha_rescate) newErrors.fecha_rescate = t('errors.fecha_required');
    if (formData.email_reportante && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email_reportante)) {
      newErrors.email_reportante = t('errors.email_invalid');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, t]);

  // Enviar formulario
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const dataToSend = {
      ...formData,
      tipo_emergencia: prioridad?.tipo || 'otro',
      prioridad: prioridad?.prioridad || 'baja',
    };

    setLoading(true);
    try {
      const response = await reportarRescate(dataToSend);
      if (response.data.success) {
        setSubmitSuccess(true);
        setTimeout(() => navigate('/'), 3000);
      } else {
        setErrors({ general: response.data.message || t('errors.general') });
      }
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors) {
        setErrors(apiErrors);
      } else {
        setErrors({ general: err.response?.data?.message || t('errors.general') });
      }
    } finally {
      setLoading(false);
    }
  }, [formData, prioridad, validate, t, navigate]);

  // Resetear formulario
  const resetForm = useCallback(() => {
    setFormData({
      lugar_rescate: '',
      descripcion_rescate: '',
      fecha_rescate: '',
      nombre_reportante: '',
      email_reportante: '',
      telefono_reportante: '',
      lat: null,
      lng: null,
    });
    setErrors({});
    setPrioridad(null);
    setSubmitSuccess(false);
  }, []);

  // Configuración para la tarjeta de prioridad
  const prioridadConfig = {
    urgente: {
      icon: 'fa-circle-exclamation',
      color: '#dc2626',
      bgColor: '#fee2e2',
      title: t('prioridad_urgente_title'),
      description: t('prioridad_urgente_desc'),
      recomendacion: t('prioridad_urgente_recomendacion'),
    },
    herido: {
      icon: 'fa-triangle-exclamation',
      color: '#ea580c',
      bgColor: '#ffedd5',
      title: t('prioridad_herido_title'),
      description: t('prioridad_herido_desc'),
      recomendacion: t('prioridad_herido_recomendacion'),
    },
    abandonado: {
      icon: 'fa-paw',
      color: '#ca8a04',
      bgColor: '#fef9c3',
      title: t('prioridad_abandonado_title'),
      description: t('prioridad_abandonado_desc'),
      recomendacion: t('prioridad_abandonado_recomendacion'),
    },
    otro: {
      icon: 'fa-info-circle',
      color: '#16a34a',
      bgColor: '#dcfce7',
      title: t('prioridad_otro_title'),
      description: t('prioridad_otro_desc'),
      recomendacion: t('prioridad_otro_recomendacion'),
    },
  };

  const prioridadTexto = {
    alta: t('prioridad_alta'),
    media: t('prioridad_media'),
    baja: t('prioridad_baja'),
  };

  const botonesPrioridad = [
    { tipo: 'urgente', icono: 'fa-skull-crosswalk', label: t('btn_urgente'), desc: t('btn_urgente_desc') },
    { tipo: 'herido', icono: 'fa-band-aid', label: t('btn_herido'), desc: t('btn_herido_desc') },
    { tipo: 'abandonado', icono: 'fa-home', label: t('btn_abandonado'), desc: t('btn_abandonado_desc') },
    { tipo: 'otro', icono: 'fa-info-circle', label: t('btn_otro'), desc: t('btn_otro_desc') },
  ];

  return {
    // Estados
    formData,
    errors,
    loading,
    submitSuccess,
    gettingLocation,
    prioridad,
    // Funciones
    handleChange,
    handleLocationChange,
    getCurrentLocation,
    setPrioridadManual,
    handleSubmit,
    resetForm,
    // Configuraciones
    prioridadConfig,
    prioridadTexto,
    botonesPrioridad,
    // Utils
    t,
  };
};

export default useRescate;