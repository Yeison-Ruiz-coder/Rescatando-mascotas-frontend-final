// src/components/common/Mascotas/VacunasSection.jsx
import React from 'react';
import './VacunasSection.css';

const VacunasSection = ({ vacunas, t }) => {
  console.log('🐾 VacunasSection recibió:', vacunas);
  
  const getVacunaIcon = (nombre) => {
    const nombreLower = nombre?.toLowerCase() || '';
    if (nombreLower.includes('rabia')) return 'fa-syringe';
    if (nombreLower.includes('parvovirus')) return 'fa-virus';
    if (nombreLower.includes('moquillo')) return 'fa-temperature-high';
    if (nombreLower.includes('hepatitis')) return 'fa-liver';
    if (nombreLower.includes('leptospira')) return 'fa-bacteria';
    if (nombreLower.includes('coronavirus')) return 'fa-virus';
    if (nombreLower.includes('bordetella')) return 'fa-lungs';
    if (nombreLower.includes('calicivirus')) return 'fa-virus';
    return 'fa-shield-alt';
  };

  const getVacunaColor = (nombre) => {
    const nombreLower = nombre?.toLowerCase() || '';
    if (nombreLower.includes('rabia')) return 'rabia';
    if (nombreLower.includes('parvovirus')) return 'parvovirus';
    if (nombreLower.includes('moquillo')) return 'moquillo';
    return 'default';
  };

  const tieneVacunas = vacunas && vacunas.length > 0;

  return (
    <div className="vacunas-section-compact">
      {/* Estado de vacunas - SIEMPRE visible */}
      <div className="estado-vacunas">
        <div className="vacunas-header">
          <i className="fas fa-syringe"></i>
          <div>
            <small className="text-muted">{t('vacunas') || 'Vacunas'}</small>
            <strong>
              {tieneVacunas 
                ? `${vacunas.length} ${t('vacunas_registradas') || 'vacunas registradas'}`
                : t('en_proceso') || 'En proceso'}
            </strong>
          </div>
        </div>
      </div>

      {/* Lista de vacunas - SOLO si hay */}
      {tieneVacunas && (
        <div className="vacunas-lista">
          {vacunas.map((vacuna, idx) => {
            const nombreVacuna = vacuna.nombre_vacuna || vacuna.nombre || 'Vacuna';
            return (
              <div key={idx} className={`vacuna-card ${getVacunaColor(nombreVacuna)}`}>
                <div className="vacuna-icon">
                  <i className={`fas ${getVacunaIcon(nombreVacuna)}`}></i>
                </div>
                <div className="vacuna-info">
                  <strong>{nombreVacuna}</strong>
                  {vacuna.fecha_aplicacion && (
                    <span className="vacuna-fecha">
                      <i className="fas fa-calendar-alt"></i> 
                      {new Date(vacuna.fecha_aplicacion).toLocaleDateString('es-ES')}
                    </span>
                  )}
                  {vacuna.fecha_proxima && (
                    <span className="vacuna-proxima">
                      <i className="fas fa-clock"></i> 
                      {t('proxima_dosis')}: {new Date(vacuna.fecha_proxima).toLocaleDateString('es-ES')}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VacunasSection;