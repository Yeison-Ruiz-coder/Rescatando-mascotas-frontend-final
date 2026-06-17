// src/components/profile/sections/FoundationSection.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const FoundationSection = ({ fundacionData, onUpdate, saving }) => {
  const { t } = useTranslation('profile');
  const [form, setForm] = useState({});
  const [fechaDate, setFechaDate] = useState(null);

  useEffect(() => {
    if (fundacionData) {
      setForm(fundacionData);
      if (fundacionData.fecha_fundacion) {
        setFechaDate(new Date(fundacionData.fecha_fundacion));
      }
    }
  }, [fundacionData]);

  const handleDateChange = (date) => {
    setFechaDate(date);
    setForm({ 
      ...form, 
      fecha_fundacion: date ? date.toISOString().split('T')[0] : '' 
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(form);
  };

  return (
    <section className="profile-section">
      <div className="profile-section-header">
        <div className="profile-section-icon">
          <i className="fas fa-building"></i>
        </div>
        <div>
          <h3>{t('profile.foundationData')}</h3>
          <p>{t('profile.foundationDataDescription')}</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label className="form-label">{t('profile.foundationName')}</label>
          <input 
            type="text" 
            className="form-input"
            value={form.Nombre_1 || ''} 
            onChange={(e) => setForm({ ...form, Nombre_1: e.target.value })} 
          />
        </div>
        <div className="form-group">
          <label className="form-label">{t('profile.contactEmail')}</label>
          <input 
            type="email" 
            className="form-input"
            value={form.Email || ''} 
            onChange={(e) => setForm({ ...form, Email: e.target.value })} 
          />
        </div>
        <div className="form-group">
          <label className="form-label">{t('profile.foundationAddress')}</label>
          <input 
            type="text" 
            className="form-input"
            value={form.Direccion || ''} 
            onChange={(e) => setForm({ ...form, Direccion: e.target.value })} 
          />
        </div>
        <div className="form-group">
          <label className="form-label">{t('profile.healthRegistry')}</label>
          <input 
            type="text" 
            className="form-input"
            value={form.registro_sanitario || ''} 
            onChange={(e) => setForm({ ...form, registro_sanitario: e.target.value })} 
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">{t('profile.maxCapacity')}</label>
            <input 
              type="number" 
              className="form-input"
              value={form.capacidad_maxima || 0} 
              onChange={(e) => setForm({ ...form, capacidad_maxima: parseInt(e.target.value) || 0 })} 
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('profile.foundationDate')}</label>
            <DatePicker
              selected={fechaDate}
              onChange={handleDateChange}
              dateFormat="dd/MM/yyyy"
              placeholderText="DD/MM/YYYY"
              className="datepicker-input"
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              locale="es"
              disabled={saving}
            />
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? (
              <><i className="fas fa-spinner fa-spin"></i> {t('common.saving')}</>
            ) : (
              t('common.save')
            )}
          </button>
        </div>
      </form>
    </section>
  );
};

export default FoundationSection;