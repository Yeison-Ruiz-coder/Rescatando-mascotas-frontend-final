// src/pages/fundacion/mascotas/components/FormStep4.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import MultiSelect from './MultiSelect';
import './FormStep4.css';

const FormStep4 = ({ form, setForm, vacunasList }) => {
  const { t } = useTranslation('nuevaMascota');
  const [newEnfermedad, setNewEnfermedad] = useState('');
  const [newMedicamento, setNewMedicamento] = useState('');

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: checked }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const addEnfermedad = () => {
    if (newEnfermedad.trim()) {
      setForm(prev => ({
        ...prev,
        enfermedades_cronicas: [...(prev.enfermedades_cronicas || []), newEnfermedad.trim()]
      }));
      setNewEnfermedad('');
    }
  };

  const removeEnfermedad = (index) => {
    setForm(prev => ({
      ...prev,
      enfermedades_cronicas: (prev.enfermedades_cronicas || []).filter((_, i) => i !== index)
    }));
  };

  const addMedicamento = () => {
    if (newMedicamento.trim()) {
      setForm(prev => ({
        ...prev,
        medicamentos: [...(prev.medicamentos || []), newMedicamento.trim()]
      }));
      setNewMedicamento('');
    }
  };

  const removeMedicamento = (index) => {
    setForm(prev => ({
      ...prev,
      medicamentos: (prev.medicamentos || []).filter((_, i) => i !== index)
    }));
  };

  const vacunasOptions = Array.isArray(vacunasList) ? vacunasList.map(v => ({ 
    value: v.id, 
    label: `${v.nombre_vacuna}${v.frecuencia_dias ? ` (${t('cada')} ${v.frecuencia_dias} ${t('dias')})` : ''}`
  })) : [];

  return (
    <div className="form-step">
      <h2><i className="fas fa-syringe"></i> {t('steps.salud_vacunas')}</h2>
      
      <div className="form-grid">
        <div className="form-group full-width">
          <label>{t('salud_general')}</label>
          <textarea
            name="salud_general"
            value={form.salud_general || ''}
            onChange={handleChange}
            rows="3"
            placeholder={t('salud_general_placeholder')}
          />
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="esterilizado"
              checked={form.esterilizado || false}
              onChange={handleCheckboxChange}
            />
            <span>{t('esterilizado')}</span>
          </label>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="desparasitado"
              checked={form.desparasitado || false}
              onChange={handleCheckboxChange}
            />
            <span>{t('desparasitado')}</span>
          </label>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="vacunado"
              checked={form.vacunado || false}
              onChange={handleCheckboxChange}
            />
            <span>{t('vacunado')}</span>
          </label>
        </div>

        <div className="form-group full-width">
          <label>{t('vacunas_aplicadas')}</label>
          <MultiSelect
            options={vacunasOptions}
            selected={form.vacunas || []}
            onChange={(values) => setForm(prev => ({ ...prev, vacunas: values }))}
            placeholder={t('seleccionar_vacunas')}
          />
        </div>

        <div className="form-group full-width">
          <label>{t('enfermedades_cronicas')}</label>
          <div className="list-input-group">
            <div className="list-input">
              <input
                type="text"
                value={newEnfermedad}
                onChange={(e) => setNewEnfermedad(e.target.value)}
                placeholder={t('enfermedad_placeholder')}
                onKeyPress={(e) => e.key === 'Enter' && addEnfermedad()}
              />
              <button type="button" onClick={addEnfermedad}>
                <i className="fas fa-plus"></i>
              </button>
            </div>
            {(form.enfermedades_cronicas || []).length > 0 && (
              <div className="list-tags">
                {(form.enfermedades_cronicas || []).map((enf, idx) => (
                  <span key={idx} className="list-tag">
                    {enf}
                    <button type="button" onClick={() => removeEnfermedad(idx)}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="form-group full-width">
          <label>{t('medicamentos')}</label>
          <div className="list-input-group">
            <div className="list-input">
              <input
                type="text"
                value={newMedicamento}
                onChange={(e) => setNewMedicamento(e.target.value)}
                placeholder={t('medicamento_placeholder')}
                onKeyPress={(e) => e.key === 'Enter' && addMedicamento()}
              />
              <button type="button" onClick={addMedicamento}>
                <i className="fas fa-plus"></i>
              </button>
            </div>
            {(form.medicamentos || []).length > 0 && (
              <div className="list-tags">
                {(form.medicamentos || []).map((med, idx) => (
                  <span key={idx} className="list-tag">
                    {med}
                    <button type="button" onClick={() => removeMedicamento(idx)}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormStep4;