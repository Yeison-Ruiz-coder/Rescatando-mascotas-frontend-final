// src/components/fundacion/mascotas/FormStep1.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import MultiSelect from './MultiSelect';

const FormStep1 = ({ form, setForm, errors, especies, generos, estados, razasList }) => {
  const { t } = useTranslation('nuevaMascota');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Asegurar que razasList existe y es un array
  const razasArray = Array.isArray(razasList) ? razasList : [];
  
  // Filtrar razas por especie seleccionada
  const razasFiltradas = razasArray.filter(r => r.especie === form.especie);
  
  const razasOptions = razasFiltradas.map(r => ({ 
    value: r.id, 
    label: r.nombre_raza 
  }));

  return (
    <div className="form-step">
      <h2><i className="fas fa-info-circle"></i> {t('steps.informacion_basica')}</h2>
      
      <div className="form-grid">
        <div className="form-group">
          <label>{t('nombre_mascota')} <span className="required">*</span></label>
          <input
            type="text"
            name="nombre_mascota"
            value={form.nombre_mascota}
            onChange={handleChange}
            className={errors.nombre_mascota ? 'error' : ''}
            placeholder={t('nombre_mascota_placeholder')}
          />
          {errors.nombre_mascota && <span className="error-msg">{errors.nombre_mascota}</span>}
        </div>

        <div className="form-group">
          <label>{t('especie')} <span className="required">*</span></label>
          <select name="especie" value={form.especie} onChange={handleChange}>
            <option value="">{t('seleccionar_especie')}</option>
            {especies.map(esp => <option key={esp} value={esp}>{esp}</option>)}
          </select>
          {errors.especie && <span className="error-msg">{errors.especie}</span>}
        </div>

        <div className="form-group full-width">
          <label>{t('razas')} <span className="required">*</span></label>
          {!form.especie ? (
            <div className="form-help warning">{t('seleccionar_especie_primero')}</div>
          ) : razasFiltradas.length === 0 ? (
            <div className="form-help warning">No hay razas disponibles para {form.especie}</div>
          ) : (
            <MultiSelect
              options={razasOptions}
              selected={form.razas || []}
              onChange={(values) => {
                setForm(prev => ({ ...prev, razas: values }));
              }}
              placeholder={t('seleccionar_razas')}
              disabled={!form.especie}
            />
          )}
          {errors.razas && <span className="error-msg">{errors.razas}</span>}
        </div>

        <div className="form-group">
          <label>{t('edad_aprox')} <span className="required">*</span></label>
          <input
            type="number"
            name="edad_aprox"
            value={form.edad_aprox}
            onChange={handleChange}
            step="0.5"
            min="0"
            max="30"
            placeholder={t('edad_placeholder')}
          />
          {errors.edad_aprox && <span className="error-msg">{errors.edad_aprox}</span>}
        </div>

        <div className="form-group">
          <label>{t('genero')} <span className="required">*</span></label>
          <div className="radio-group">
            <label className="radio-option">
              <input type="radio" name="genero" value="Macho" checked={form.genero === 'Macho'} onChange={handleChange} />
              <i className="fas fa-mars" style={{ color: '#3b82f6' }}></i>
              <span>{t('macho')}</span>
            </label>
            <label className="radio-option">
              <input type="radio" name="genero" value="Hembra" checked={form.genero === 'Hembra'} onChange={handleChange} />
              <i className="fas fa-venus" style={{ color: '#ec4899' }}></i>
              <span>{t('hembra')}</span>
            </label>
            <label className="radio-option">
              <input type="radio" name="genero" value="Desconocido" checked={form.genero === 'Desconocido'} onChange={handleChange} />
              <i className="fas fa-question-circle" style={{ color: '#94a3b8' }}></i>
              <span>{t('desconocido')}</span>
            </label>
          </div>
          {errors.genero && <span className="error-msg">{errors.genero}</span>}
        </div>

        <div className="form-group">
          <label>{t('estado_actual')} <span className="required">*</span></label>
          <select name="estado" value={form.estado} onChange={handleChange}>
            {estados.map(est => (
              <option key={est} value={est}>
                {est === 'En adopcion' ? t('estado_en_adopcion') : 
                 est === 'Adoptado' ? t('estado_adoptado') : 
                 est === 'Rescatada' ? t('estado_rescatada') : 
                 t('estado_en_acogida')}
              </option>
            ))}
          </select>
          {errors.estado && <span className="error-msg">{errors.estado}</span>}
        </div>
      </div>
    </div>
  );
};

export default FormStep1;