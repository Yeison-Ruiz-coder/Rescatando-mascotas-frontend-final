// src/components/fundacion/mascotas/FormStep2.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const FormStep2 = ({ form, setForm, errors }) => {
  const { t } = useTranslation('nuevaMascota');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="form-step">
      <h2><i className="fas fa-map-marker-alt"></i> {t('steps.ubicacion_descripcion')}</h2>
      
      <div className="form-grid">
        <div className="form-group full-width">
          <label>{t('lugar_rescate')} <span className="required">*</span></label>
          <input
            type="text"
            name="lugar_rescate"
            value={form.lugar_rescate}
            onChange={handleChange}
            placeholder={t('lugar_rescate_placeholder')}
          />
          {errors.lugar_rescate && <span className="error-msg">{errors.lugar_rescate}</span>}
        </div>

        <div className="form-group full-width">
          <label>{t('descripcion')} <span className="required">*</span></label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            rows="5"
            placeholder={t('descripcion_placeholder')}
          />
          {errors.descripcion && <span className="error-msg">{errors.descripcion}</span>}
        </div>

        <div className="form-group full-width">
          <label>{t('condiciones_especiales')}</label>
          <textarea
            name="condiciones_especiales"
            value={form.condiciones_especiales}
            onChange={handleChange}
            rows="3"
            placeholder={t('condiciones_placeholder')}
          />
        </div>
      </div>
    </div>
  );
};

export default FormStep2;