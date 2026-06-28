// src/pages/fundacion/mascotas/components/FormStep5.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomSelect from '../../../../components/common/CustomSelect/CustomSelect';
import './FormStep4.css';

const FormStep5 = ({ form, setForm, errors }) => {
  const { t } = useTranslation('nuevaMascota');
  const [newRequisito, setNewRequisito] = useState('');

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: checked }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCustomChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const addRequisito = () => {
    if (newRequisito.trim()) {
      setForm(prev => ({
        ...prev,
        requisitos_adopcion: [...(prev.requisitos_adopcion || []), newRequisito.trim()]
      }));
      setNewRequisito('');
    }
  };

  const removeRequisito = (index) => {
    setForm(prev => ({
      ...prev,
      requisitos_adopcion: (prev.requisitos_adopcion || []).filter((_, i) => i !== index)
    }));
  };

  const hogarOptions = [
    { value: 'casa_jardin', label: t('casa_con_jardin') },
    { value: 'departamento', label: t('departamento') },
    { value: 'casa_sin_jardin', label: t('casa_sin_jardin') },
    { value: 'espacio_amplio', label: t('espacio_amplio') },
  ];

  return (
    <div className="form-step">
      <h2><i className="fas fa-clipboard-list"></i> {t('steps.requisitos_adopcion')}</h2>
      
      <div className="form-grid">
        <div className="form-group half-width">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="necesita_hogar_temporal"
              checked={form.necesita_hogar_temporal || false}
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
              checked={form.apto_con_ninos !== undefined ? form.apto_con_ninos : true}
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
              checked={form.apto_con_otros_animales !== undefined ? form.apto_con_otros_animales : true}
              onChange={handleCheckboxChange}
            />
            <span>{t('apto_con_otros_animales')}</span>
          </label>
        </div>

        <div className="form-group full-width">
          <label>{t('hogar_recomendado')}</label>
          <CustomSelect
            options={hogarOptions}
            value={form.hogar_recomendado || ''}
            onChange={(e) => handleCustomChange('hogar_recomendado', e.target.value)}
            placeholder={t('seleccionar_hogar')}
          />
        </div>

        <div className="form-group full-width">
          <label>{t('requisitos_adopcion')}</label>
          <div className="list-input-group">
            <div className="list-input">
              <input
                type="text"
                value={newRequisito}
                onChange={(e) => setNewRequisito(e.target.value)}
                placeholder={t('requisito_placeholder')}
                onKeyPress={(e) => e.key === 'Enter' && addRequisito()}
              />
              <button type="button" onClick={addRequisito}>
                <i className="fas fa-plus"></i>
              </button>
            </div>
            {(form.requisitos_adopcion || []).length > 0 && (
              <div className="list-tags">
                {(form.requisitos_adopcion || []).map((req, idx) => (
                  <span key={idx} className="list-tag">
                    {req}
                    <button type="button" onClick={() => removeRequisito(idx)}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <small className="form-help">{t('requisitos_help')}</small>
        </div>
      </div>
    </div>
  );
};

export default FormStep5;