// src/components/profile/sections/ServicesSection.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import './ServicesSection.css';

const ServicesSection = ({ veterinariaData, onUpdate, isLoading }) => {
  const { t } = useTranslation();

  const servicesList = [
    { id: 'consultas', icon: 'fas fa-stethoscope' },
    { id: 'vacunacion', icon: 'fas fa-syringe' },
    { id: 'cirugias', icon: 'fas fa-scalpel' },
    { id: 'hospitalizacion', icon: 'fas fa-hospital-user' },
    { id: 'laboratorio', icon: 'fas fa-microscope' },
    { id: 'radiografias', icon: 'fas fa-x-ray' },
    { id: 'ultrasonidos', icon: 'fas fa-waveform' },
    { id: 'peluqueria', icon: 'fas fa-cut' },
    { id: 'urgencias', icon: 'fas fa-ambulance' },
  ];

  const handleServiceToggle = (serviceId) => {
    const current = veterinariaData?.servicios || [];
    const serviceName = t(`profile.service_${serviceId}`);
    const newServices = current.includes(serviceName) ? current.filter(s => s !== serviceName) : [...current, serviceName];
    onUpdate({ servicios: newServices });
  };

  const handleDetailedServices = (value) => {
    const services = value.split(',').map(s => s.trim()).filter(s => s);
    onUpdate({ servicios_detallados: services });
  };

  const handleMedicalTeam = (value) => {
    const equipo = value.split(',').map(s => s.trim()).filter(s => s);
    onUpdate({ equipo_medico: equipo });
  };

  return (
    <div className="profile-section">
      <div className="section-header">
        <div className="section-icon"><i className="fas fa-stethoscope"></i></div>
        <div className="section-info">
          <h3>{t('profile.services')}</h3>
          <p>{t('profile.servicesDescription')}</p>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">{t('profile.mainServices')}</label>
        <div className="services-grid">
          {servicesList.map(service => (
            <label key={service.id} className="service-card">
              <input type="checkbox" checked={veterinariaData?.servicios?.includes(t(`profile.service_${service.id}`)) || false} onChange={() => handleServiceToggle(service.id)} disabled={isLoading} />
              <i className={service.icon}></i>
              <span>{t(`profile.service_${service.id}`)}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">{t('profile.detailedServices')}</label>
        <textarea defaultValue={Array.isArray(veterinariaData?.servicios_detallados) ? veterinariaData.servicios_detallados.join(', ') : ''} rows="3" className="form-textarea" onBlur={(e) => handleDetailedServices(e.target.value)} placeholder={t('profile.detailedServicesPlaceholder')} disabled={isLoading} />
        <small className="form-hint">{t('profile.commaSeparated')}</small>
      </div>

      <div className="form-group">
        <label className="form-label">{t('profile.medicalTeam')}</label>
        <textarea defaultValue={Array.isArray(veterinariaData?.equipo_medico) ? veterinariaData.equipo_medico.join(', ') : ''} rows="3" className="form-textarea" onBlur={(e) => handleMedicalTeam(e.target.value)} placeholder={t('profile.medicalTeamPlaceholder')} disabled={isLoading} />
        <small className="form-hint">{t('profile.commaSeparated')}</small>
      </div>
    </div>
  );
};

export default ServicesSection;