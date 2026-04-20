// src/pages/veterinaria/citas/CitaForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import api from '../../../services/api';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import './CitaForm.css';

const CitaForm = () => {
  const { t } = useTranslation('veterinaria');
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [pacientes, setPacientes] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [veterinarios, setVeterinarios] = useState([]);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    paciente_id: '',
    veterinario_id: '',
    servicio_id: '',
    fecha: '',
    hora: '',
    motivo: '',
    notas: '',
    estado: 'pendiente'
  });

  const estados = ['pendiente', 'confirmada', 'completada', 'cancelada'];

  useEffect(() => {
    loadInitialData();
    if (isEditing) loadCitaData();
  }, [id]);

  const loadInitialData = async () => {
    try {
      const [pacientesRes, serviciosRes, veterinariosRes] = await Promise.all([
        api.get('/veterinaria/pacientes'),
        api.get('/veterinaria/servicios'),
        api.get('/veterinaria/veterinarios')
      ]);
      
      if (pacientesRes.data?.data) setPacientes(pacientesRes.data.data);
      if (serviciosRes.data?.data) setServicios(serviciosRes.data.data);
      if (veterinariosRes.data?.data) setVeterinarios(veterinariosRes.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const loadCitaData = async () => {
    try {
      const response = await api.get(`/veterinaria/citas/${id}`);
      if (response.data.success) {
        const cita = response.data.data;
        setForm({
          paciente_id: cita.paciente_id || '',
          veterinario_id: cita.veterinario_id || '',
          servicio_id: cita.servicio_id || '',
          fecha: cita.fecha || '',
          hora: cita.hora || '',
          motivo: cita.motivo || '',
          notas: cita.notas || '',
          estado: cita.estado || 'pendiente'
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
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.paciente_id) newErrors.paciente_id = t('errores.paciente_requerido');
    if (!form.fecha) newErrors.fecha = t('errores.fecha_requerida');
    if (!form.hora) newErrors.hora = t('errores.hora_requerida');
    if (!form.motivo) newErrors.motivo = t('errores.motivo_requerido');
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      let response;
      if (isEditing) {
        response = await api.put(`/veterinaria/citas/${id}`, form);
      } else {
        response = await api.post('/veterinaria/citas', form);
      }

      if (response.data.success) {
        toast.success(isEditing ? t('mensajes.actualizacion_exitosa') : t('mensajes.registro_exitoso'));
        navigate('/veterinaria/citas');
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
    <div className="cita-form-page">
      <div className="cita-form-header">
        <h1>
          <i className="fas fa-calendar-plus"></i>
          {isEditing ? t('editar_cita') : t('agendar_cita')}
        </h1>
        <p>{t('formulario_descripcion')}</p>
      </div>

      <form onSubmit={handleSubmit} className="cita-form-container">
        <div className="cita-form-row">
          <div className="cita-form-group">
            <label>{t('paciente')} <span className="required">*</span></label>
            <select name="paciente_id" value={form.paciente_id} onChange={handleChange}>
              <option value="">{t('seleccionar_paciente')}</option>
              {pacientes.map(paciente => (
                <option key={paciente.id} value={paciente.id}>
                  {paciente.nombre_mascota} - {paciente.especie} ({paciente.dueno_nombre})
                </option>
              ))}
            </select>
            {errors.paciente_id && <span className="cita-error-msg">{errors.paciente_id}</span>}
          </div>

          <div className="cita-form-group">
            <label>{t('veterinario')}</label>
            <select name="veterinario_id" value={form.veterinario_id} onChange={handleChange}>
              <option value="">{t('seleccionar_veterinario')}</option>
              {veterinarios.map(vet => (
                <option key={vet.id} value={vet.id}>
                  {vet.nombre} {vet.apellido} - {vet.especialidad}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="cita-form-row">
          <div className="cita-form-group">
            <label>{t('servicio')}</label>
            <select name="servicio_id" value={form.servicio_id} onChange={handleChange}>
              <option value="">{t('seleccionar_servicio')}</option>
              {servicios.map(servicio => (
                <option key={servicio.id} value={servicio.id}>
                  {servicio.nombre} - ${servicio.precio}
                </option>
              ))}
            </select>
          </div>

          <div className="cita-form-group">
            <label>{t('estado')}</label>
            <select name="estado" value={form.estado} onChange={handleChange}>
              {estados.map(est => (
                <option key={est} value={est}>
                  {est === 'pendiente' ? '⏳ Pendiente' : 
                   est === 'confirmada' ? '✅ Confirmada' : 
                   est === 'completada' ? '✔️ Completada' : '❌ Cancelada'}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="cita-form-row">
          <div className="cita-form-group">
            <label>{t('fecha')} <span className="required">*</span></label>
            <input type="date" name="fecha" value={form.fecha} onChange={handleChange} />
            {errors.fecha && <span className="cita-error-msg">{errors.fecha}</span>}
          </div>

          <div className="cita-form-group">
            <label>{t('hora')} <span className="required">*</span></label>
            <input type="time" name="hora" value={form.hora} onChange={handleChange} />
            {errors.hora && <span className="cita-error-msg">{errors.hora}</span>}
          </div>
        </div>

        <div className="cita-form-group">
          <label>{t('motivo')} <span className="required">*</span></label>
          <textarea name="motivo" value={form.motivo} onChange={handleChange} rows="3" />
          {errors.motivo && <span className="cita-error-msg">{errors.motivo}</span>}
        </div>

        <div className="cita-form-group">
          <label>{t('notas')}</label>
          <textarea name="notas" value={form.notas} onChange={handleChange} rows="2" />
        </div>

        <div className="cita-form-actions">
          <button type="button" className="cita-btn-cancel" onClick={() => navigate('/veterinaria/citas')}>
            <i className="fas fa-times"></i> {t('botones.cancelar')}
          </button>
          <button type="submit" className="cita-btn-submit" disabled={loading}>
            {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
            {isEditing ? t('botones.actualizar') : t('botones.guardar')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CitaForm;