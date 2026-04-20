// src/components/fundacion/mascotas/FormStep3.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import MultiSelect from './MultiSelect';

const FormStep3 = ({ form, setForm, vacunasList }) => {
  const { t } = useTranslation('nuevaMascota');

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: checked }));
  };

  const vacunasOptions = vacunasList.map(v => ({ 
    value: v.id, 
    label: `${v.nombre_vacuna}${v.frecuencia_dias ? ` (${t('cada')} ${v.frecuencia_dias} ${t('dias')})` : ''}`
  }));

  return (
    <div className="form-step">
      <h2><i className="fas fa-syringe"></i> {t('steps.salud_vacunas')}</h2>
      
      <div className="form-grid">
        <div className="form-group full-width">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="necesita_hogar_temporal"
              checked={form.necesita_hogar_temporal}
              onChange={handleCheckboxChange}
            />
            <span>{t('necesita_hogar_temporal')}</span>
          </label>
        </div>

        <div className="form-group half-width">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="apto_con_ninos"
              checked={form.apto_con_ninos}
              onChange={handleCheckboxChange}
            />
            <span>{t('apto_con_ninos')}</span>
          </label>
        </div>

        <div className="form-group half-width">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="apto_con_otros_animales"
              checked={form.apto_con_otros_animales}
              onChange={handleCheckboxChange}
            />
            <span>{t('apto_con_otros_animales')}</span>
          </label>
        </div>

        <div className="form-group full-width">
          <label>{t('vacunas_aplicadas')}</label>
          <MultiSelect
            options={vacunasOptions}
            selected={form.vacunas}
            onChange={(values) => setForm(prev => ({ ...prev, vacunas: values }))}
            placeholder={t('seleccionar_vacunas')}
          />
        </div>
      </div>
    </div>
  );
};

export default FormStep3;