
// src/pages/veterinaria/pacientes/PacienteForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useAuth } from '../../../contexts/AuthContext';
import { useMultiStepForm } from '../../../hooks/useMultiStepForm';
import { useFormValidation } from '../../../hooks/useFormValidation';
import FormStepper from '../../../components/common/FormStepper/FormStepper';
import FormNavigation from '../../../components/common/FormNavigation/FormNavigation';
import api from '../../../services/api';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import './PacienteForm.css';

const PacienteForm = () => {
  const { t } = useTranslation('veterinaria');
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const isEditing = !!id;
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [razasList, setRazasList] = useState([]);
  const [duenos, setDuenos] = useState([]);

  const { errors, setFieldError, clearFieldError } = useFormValidation();
  const { currentStep, totalSteps, nextStep, prevStep, isFirstStep, isLastStep } = useMultiStepForm(
    ['Información Básica', 'Salud', 'Propietario'],
    () => {}
  );

  const [form, setForm] = useState({
    nombre_mascota: '',
    especie: '',
    raza_id: '',
    edad: '',
    peso: '',
    genero: '',
    color: '',
    senas_particulares: '',
    dueno_id: '',
    alergias: '',
    condiciones_cronicas: '',
    medicamentos_actuales: '',
    fecha_ultima_visita: '',
    fecha_proxima_vacuna: '',
    esta_activo: true
  });

  const especies = ['Perro', 'Gato', 'Conejo', 'Ave', 'Roedor', 'Otro'];
  const generos = ['Macho', 'Hembra'];

  const steps = [
    { number: 1, title: t('steps.informacion_basica'), icon: 'fas fa-info-circle' },
    { number: 2, title: t('steps.salud'), icon: 'fas fa-heartbeat' },
    { number: 3, title: t('steps.propietario'), icon: 'fas fa-user' }
  ];

  useEffect(() => {
    loadInitialData();
    if (isEditing) loadPacienteData();
  }, [id]);

  const loadInitialData = async () => {
    try {
      const [razasRes, duenosRes] = await Promise.all([
        api.get('/veterinaria/razas'),
        api.get('/veterinaria/duenos')
      ]);
      if (razasRes.data?.data) setRazasList(razasRes.data.data);
      if (duenosRes.data?.data) setDuenos(duenosRes.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const loadPacienteData = async () => {
    try {
      const response = await api.get(`/veterinaria/pacientes/${id}`);
      if (response.data.success) {
        const paciente = response.data.data;
        setForm({
          nombre_mascota: paciente.nombre_mascota || '',
          especie: paciente.especie || '',
          raza_id: paciente.raza_id || '',
          edad: paciente.edad || '',
          peso: paciente.peso || '',
          genero: paciente.genero || '',
          color: paciente.color || '',
          senas_particulares: paciente.senas_particulares || '',
          dueno_id: paciente.dueno_id || '',
          alergias: paciente.alergias || '',
          condiciones_cronicas: paciente.condiciones_cronicas || '',
          medicamentos_actuales: paciente.medicamentos_actuales || '',
          fecha_ultima_visita: paciente.fecha_ultima_visita?.split('T')[0] || '',
          fecha_proxima_vacuna: paciente.fecha_proxima_vacuna?.split('T')[0] || '',
          esta_activo: paciente.esta_activo ?? true
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(t('mensajes.error_carga'));
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    clearFieldError(name);
  };

  const validateStep = () => {
    let isValid = true;

    switch (currentStep) {
      case 1:
        if (!form.nombre_mascota.trim()) {
          setFieldError('nombre_mascota', t('errores.nombre_requerido'));
          isValid = false;
        }
        if (!form.especie) {
          setFieldError('especie', t('errores.especie_requerida'));
          isValid = false;
        }
        if (!form.genero) {
          setFieldError('genero', t('errores.genero_requerido'));
          isValid = false;
        }
        break;
      case 3:
        if (!form.dueno_id) {
          setFieldError('dueno_id', t('errores.dueno_requerido'));
          isValid = false;
        }
        break;
    }

    return isValid;
  };

  const handleNext = () => {
    if (validateStep()) nextStep();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    setLoading(true);
    try {
      let response;
      if (isEditing) {
        response = await api.put(`/veterinaria/pacientes/${id}`, form);
      } else {
        response = await api.post('/veterinaria/pacientes', form);
      }

      if (response.data.success) {
        toast.success(isEditing ? t('mensajes.actualizacion_exitosa') : t('mensajes.registro_exitoso'));
        navigate('/veterinaria/pacientes');
      } else {
        toast.error(response.data.message || t('mensajes.error_registro'));
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || t('mensajes.error_registro'));
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <LoadingSpinner text={t('cargando')} />;
  }

  return (
    <div className="paciente-form-page">
      <div className="form-header">
        <h1>
          <i className="fas fa-dog"></i>
          {isEditing ? t('editar_paciente') : t('registrar_paciente')}
        </h1>
        <p>{t('formulario_descripcion')}</p>
      </div>

      <FormStepper steps={steps} currentStep={currentStep} />

      <form onSubmit={handleSubmit} className="paciente-form">
        {currentStep === 1 && (
          <div className="form-step">
            <h2><i className="fas fa-info-circle"></i> {t('informacion_basica')}</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label>{t('nombre_mascota')} <span className="required">*</span></label>
                <input
                  type="text"
                  name="nombre_mascota"
                  value={form.nombre_mascota}
                  onChange={handleChange}
                  className={errors.nombre_mascota ? 'error' : ''}
                />
                {errors.nombre_mascota && <span className="error-msg">{errors.nombre_mascota}</span>}
              </div>

              <div className="form-group">
                <label>{t('especie')} <span className="required">*</span></label>
                <select name="especie" value={form.especie} onChange={handleChange}>
                  <option value="">{t('seleccionar_especie')}</option>
                  {especies.map(esp => (
                    <option key={esp} value={esp}>
                      {esp === 'Perro' ? '🐕 Perro' : esp === 'Gato' ? '🐱 Gato' : esp}
                    </option>
                  ))}
                </select>
                {errors.especie && <span className="error-msg">{errors.especie}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>{t('raza')}</label>
                <select name="raza_id" value={form.raza_id} onChange={handleChange}>
                  <option value="">{t('seleccionar_raza')}</option>
                  {razasList
                    .filter(r => !form.especie || r.especie === form.especie)
                    .map(raza => (
                      <option key={raza.id} value={raza.id}>{raza.nombre_raza}</option>
                    ))}
                </select>
              </div>

              <div className="form-group">
                <label>{t('genero')} <span className="required">*</span></label>
                <div className="radio-group">
                  {generos.map(gen => (
                    <label key={gen}>
                      <input type="radio" name="genero" value={gen} checked={form.genero === gen} onChange={handleChange} />
                      <span>{gen === 'Macho' ? '♂️ ' + t('macho') : '♀️ ' + t('hembra')}</span>
                    </label>
                  ))}
                </div>
                {errors.genero && <span className="error-msg">{errors.genero}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>{t('edad')}</label>
                <input type="number" name="edad" value={form.edad} onChange={handleChange} step="0.5" placeholder={t('edad_placeholder')} />
              </div>

              <div className="form-group">
                <label>{t('peso')}</label>
                <input type="number" name="peso" value={form.peso} onChange={handleChange} step="0.1" placeholder={t('peso_placeholder')} />
              </div>
            </div>

            <div className="form-group">
              <label>{t('color')}</label>
              <input type="text" name="color" value={form.color} onChange={handleChange} placeholder={t('color_placeholder')} />
            </div>

            <div className="form-group">
              <label>{t('senas_particulares')}</label>
              <textarea name="senas_particulares" value={form.senas_particulares} onChange={handleChange} rows="2" />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="form-step">
            <h2><i className="fas fa-heartbeat"></i> {t('salud_historial')}</h2>

            <div className="form-group">
              <label>{t('alergias')}</label>
              <textarea name="alergias" value={form.alergias} onChange={handleChange} rows="2" placeholder={t('alergias_placeholder')} />
            </div>

            <div className="form-group">
              <label>{t('condiciones_cronicas')}</label>
              <textarea name="condiciones_cronicas" value={form.condiciones_cronicas} onChange={handleChange} rows="2" placeholder={t('condiciones_placeholder')} />
            </div>

            <div className="form-group">
              <label>{t('medicamentos_actuales')}</label>
              <textarea name="medicamentos_actuales" value={form.medicamentos_actuales} onChange={handleChange} rows="2" placeholder={t('medicamentos_placeholder')} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>{t('fecha_ultima_visita')}</label>
                <input type="date" name="fecha_ultima_visita" value={form.fecha_ultima_visita} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>{t('fecha_proxima_vacuna')}</label>
                <input type="date" name="fecha_proxima_vacuna" value={form.fecha_proxima_vacuna} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input type="checkbox" name="esta_activo" checked={form.esta_activo} onChange={handleChange} />
                <span>{t('paciente_activo')}</span>
              </label>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="form-step">
            <h2><i className="fas fa-user"></i> {t('informacion_propietario')}</h2>

            <div className="form-group">
              <label>{t('propietario')} <span className="required">*</span></label>
              <select name="dueno_id" value={form.dueno_id} onChange={handleChange}>
                <option value="">{t('seleccionar_propietario')}</option>
                {duenos.map(dueno => (
                  <option key={dueno.id} value={dueno.id}>
                    {dueno.nombre} {dueno.apellido} - {dueno.telefono}
                  </option>
                ))}
              </select>
              {errors.dueno_id && <span className="error-msg">{errors.dueno_id}</span>}
            </div>

            <button type="button" className="btn-link" onClick={() => navigate('/veterinaria/duenos/nuevo')}>
              <i className="fas fa-plus"></i> {t('registrar_nuevo_propietario')}
            </button>
          </div>
        )}

        <FormNavigation
          onPrevious={prevStep}
          onNext={handleNext}
          onSubmit={handleSubmit}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          loading={loading}
          previousText={t('botones.anterior')}
          nextText={t('botones.siguiente')}
          submitText={isEditing ? t('botones.actualizar') : t('botones.registrar')}
          loadingText={t('botones.guardando')}
        />
      </form>
    </div>
  );
};

export default PacienteForm;