// src/pages/fundacion/mascotas/components/FormStep2.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import CustomSelect from '../../../../components/common/CustomSelect/CustomSelect';
import './FormStep1.css';

const FormStep2 = ({ form, setForm, errors }) => {
  const { t } = useTranslation('nuevaMascota');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCustomChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const tamanoOptions = [
    { value: 'pequeño', label: t('tamano_pequeño') },
    { value: 'mediano', label: t('tamano_mediano') },
    { value: 'grande', label: t('tamano_grande') },
    { value: 'muy_grande', label: t('tamano_muy_grande') },
  ];

  return (
    <div className="form-step">
      <h2><i className="fas fa-ruler"></i> {t('steps.caracteristicas_fisicas')}</h2>
      
      <div className="form-grid">
        <div className="form-group">
          <label>{t('peso_aprox')} (kg)</label>
          <input
            type="number"
            name="peso_aprox"
            value={form.peso_aprox || ''}
            onChange={handleChange}
            step="0.1"
            min="0"
            max="100"
            placeholder="Ej: 5.5"
          />
          {errors.peso_aprox && <span className="error-msg">{errors.peso_aprox}</span>}
        </div>

        <div className="form-group">
          <label>{t('tamano')}</label>
          <CustomSelect
            options={tamanoOptions}
            value={form.tamano || ''}
            onChange={(e) => handleCustomChange('tamano', e.target.value)}
            placeholder={t('seleccionar_tamano')}
            error={errors.tamano}
          />
          {errors.tamano && <span className="error-msg">{errors.tamano}</span>}
        </div>

        <div className="form-group">
          <label>{t('color')}</label>
          <input
            type="text"
            name="color"
            value={form.color || ''}
            onChange={handleChange}
            placeholder="Ej: Blanco con manchas negras"
          />
          {errors.color && <span className="error-msg">{errors.color}</span>}
        </div>
      </div>
    </div>
  );
};

export default FormStep2;