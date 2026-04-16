// src/pages/veterinaria/historial/HistorialMedico.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import api from '../../../services/api';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import HistorialEntry from '../../../components/veterinaria/HistorialEntry/HistorialEntry';
import './HistorialMedico.css';

const HistorialMedico = () => {
  const { t } = useTranslation('veterinaria');
  const { id } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    tipo: 'consulta',
    fecha: new Date().toISOString().split('T')[0],
    diagnostico: '',
    tratamiento: '',
    observaciones: '',
    veterinario: ''
  });

  const tipos = ['consulta', 'vacunacion', 'cirugia', 'examen', 'hospitalizacion', 'seguimiento'];

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [pacienteRes, historialRes] = await Promise.all([
        api.get(`/veterinaria/pacientes/${id}`),
        api.get(`/veterinaria/pacientes/${id}/historial`)
      ]);
      
      if (pacienteRes.data.success) setPaciente(pacienteRes.data.data);
      if (historialRes.data.success) setHistorial(historialRes.data.data);
    } catch (error) {
      console.error('Error:', error);
      toast.error(t('error_carga_historial'));
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(`/veterinaria/pacientes/${id}/historial`, formData);
      if (response.data.success) {
        toast.success(t('registro_agregado'));
        setShowForm(false);
        loadData();
        setFormData({
          tipo: 'consulta',
          fecha: new Date().toISOString().split('T')[0],
          diagnostico: '',
          tratamiento: '',
          observaciones: '',
          veterinario: ''
        });
      } else {
        toast.error(response.data.message || t('error_registro'));
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(t('error_registro'));
    }
  };

  if (loading) {
    return <LoadingSpinner text={t('cargando_historial')} />;
  }

  return (
    <div className="historial-page">
      <div className="historial-header">
        <div className="paciente-info">
          <button className="btn-back" onClick={() => navigate('/veterinaria/pacientes')}>
            <i className="fas fa-arrow-left"></i>
          </button>
          <div className="paciente-avatar">
            {paciente?.foto_url ? (
              <img src={paciente.foto_url} alt={paciente.nombre_mascota} />
            ) : (
              <div className="avatar-placeholder">
                {paciente?.especie === 'Perro' ? '🐕' : '🐱'}
              </div>
            )}
          </div>
          <div className="paciente-details">
            <h1>{paciente?.nombre_mascota}</h1>
            <p>{paciente?.especie} {paciente?.raza && `- ${paciente.raza}`} • {paciente?.genero} • {paciente?.edad} años</p>
            <p className="dueno">Propietario: {paciente?.dueno_nombre}</p>
          </div>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          <i className="fas fa-plus"></i> {t('nuevo_registro')}
        </button>
      </div>

      {showForm && (
        <div className="historial-form">
          <h3><i className="fas fa-notes-medical"></i> {t('nuevo_registro_medico')}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>{t('tipo')}</label>
                <select name="tipo" value={formData.tipo} onChange={handleFormChange}>
                  {tipos.map(tipo => (
                    <option key={tipo} value={tipo}>
                      {tipo === 'consulta' ? '🩺 Consulta' :
                       tipo === 'vacunacion' ? '💉 Vacunación' :
                       tipo === 'cirugia' ? '🔪 Cirugía' :
                       tipo === 'examen' ? '🔬 Examen' :
                       tipo === 'hospitalizacion' ? '🏥 Hospitalización' : '📋 Seguimiento'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>{t('fecha')}</label>
                <input type="date" name="fecha" value={formData.fecha} onChange={handleFormChange} required />
              </div>
            </div>

            <div className="form-group">
              <label>{t('diagnostico')}</label>
              <textarea name="diagnostico" value={formData.diagnostico} onChange={handleFormChange} rows="3" required />
            </div>

            <div className="form-group">
              <label>{t('tratamiento')}</label>
              <textarea name="tratamiento" value={formData.tratamiento} onChange={handleFormChange} rows="3" />
            </div>

            <div className="form-group">
              <label>{t('observaciones')}</label>
              <textarea name="observaciones" value={formData.observaciones} onChange={handleFormChange} rows="2" />
            </div>

            <div className="form-group">
              <label>{t('veterinario')}</label>
              <input type="text" name="veterinario" value={formData.veterinario} onChange={handleFormChange} />
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>
                {t('botones.cancelar')}
              </button>
              <button type="submit" className="btn-submit">
                <i className="fas fa-save"></i> {t('botones.guardar')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="historial-timeline">
        <h3><i className="fas fa-history"></i> {t('historial_medico')}</h3>
        {historial.length === 0 ? (
          <div className="empty-historial">
            <i className="fas fa-notes-medical"></i>
            <p>{t('sin_historial')}</p>
          </div>
        ) : (
          <div className="timeline">
            {historial.map((entry, index) => (
              <HistorialEntry key={entry.id} entry={entry} isLast={index === historial.length - 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistorialMedico;