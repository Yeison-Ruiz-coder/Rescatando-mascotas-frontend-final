// src/components/profile/sections/ServicesSection.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const ServicesSection = ({ veterinariaData, onUpdate, saving }) => {
  const { t } = useTranslation();
  const [form, setForm] = useState({ 
    servicios: [], 
    servicios_detallados: '', 
    equipo_medico: '' 
  });

  useEffect(() => {
    if (veterinariaData) {
      setForm({
        servicios: veterinariaData.servicios || [],
        servicios_detallados: Array.isArray(veterinariaData.servicios_detallados) 
          ? veterinariaData.servicios_detallados.join(', ') 
          : '',
        equipo_medico: Array.isArray(veterinariaData.equipo_medico) 
          ? veterinariaData.equipo_medico.join(', ') 
          : '',
      });
    }
  }, [veterinariaData]);

  const servicesList = [
    { id: 'consultas', icon: 'fa-stethoscope', label: t('profile.service_consultas') },
    { id: 'vacunacion', icon: 'fa-syringe', label: t('profile.service_vacunacion') },
    { id: 'cirugias', icon: 'fa-scalpel', label: t('profile.service_cirugias') },
    { id: 'hospitalizacion', icon: 'fa-hospital-user', label: t('profile.service_hospitalizacion') },
    { id: 'urgencias', icon: 'fa-ambulance', label: t('profile.service_urgencias') },
  ];

  const handleServiceToggle = (serviceId) => {
    const serviceName = t(`profile.service_${serviceId}`);
    const current = form.servicios || [];
    const newServices = current.includes(serviceName) 
      ? current.filter(s => s !== serviceName) 
      : [...current, serviceName];
    setForm({ ...form, servicios: newServices });
    onUpdate({ servicios: newServices });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({
      servicios_detallados: form.servicios_detallados.split(',').map(s => s.trim()).filter(s => s),
      equipo_medico: form.equipo_medico.split(',').map(s => s.trim()).filter(s => s),
    });
  };

  return (
    <section className="profile-section">
      <div className="profile-section-header">
        <div className="profile-section-icon">
          <i className="fas fa-stethoscope"></i>
        </div>
        <div>
          <h3>{t('profile.services')}</h3>
          <p>{t('profile.servicesDescription')}</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="profile-form-group">
          <label>{t('profile.mainServices')}</label>
          <div className="profile-services-grid">
            {servicesList.map((service) => (
              <label key={service.id} className="profile-service-card">
                <input 
                  type="checkbox" 
                  checked={form.servicios?.includes(t(`profile.service_${service.id}`)) || false} 
                  onChange={() => handleServiceToggle(service.id)} 
                  disabled={saving} 
                />
                <i className={`fas ${service.icon}`}></i>
                <span>{service.label}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="profile-form-group">
          <label>{t('profile.detailedServices')}</label>
          <textarea 
            value={form.servicios_detallados} 
            onChange={(e) => setForm({ ...form, servicios_detallados: e.target.value })} 
            rows="3" 
            placeholder={t('profile.detailedServicesPlaceholder')} 
          />
          <small className="profile-form-hint">{t('profile.commaSeparated')}</small>
        </div>
        <div className="profile-form-group">
          <label>{t('profile.medicalTeam')}</label>
          <textarea 
            value={form.equipo_medico} 
            onChange={(e) => setForm({ ...form, equipo_medico: e.target.value })} 
            rows="3" 
            placeholder={t('profile.medicalTeamPlaceholder')} 
          />
          <small className="profile-form-hint">{t('profile.commaSeparated')}</small>
        </div>
        <div className="profile-form-actions">
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

export default ServicesSection;