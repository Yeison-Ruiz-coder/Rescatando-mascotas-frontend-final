// src/components/common/Mascotas/SaludCuidados.jsx
import React from 'react';
import VacunasSection from './VacunasSection';
import './SaludCuidados.css';

const SaludCuidados = ({ mascota, vacunas, t }) => {
  return (
    <div className="salud-cuidados">
      <h3>
        <i className="fas fa-heartbeat"></i> 
        {t('salud_cuidados') || 'Salud y Cuidados'}
      </h3>
      
      <div className="salud-grid">
        {/* Vacunas */}
        <VacunasSection vacunas={vacunas} t={t} />
        
        {/* Lugar de rescate */}
        {mascota.lugar_rescate && (
          <div className="cuidado-card rescate-card">
            <div className="cuidado-header">
              <i className="fas fa-map-marker-alt"></i>
              <div>
                <small>{t('lugar_rescate') || 'Rescatado en'}</small>
                <strong>{mascota.lugar_rescate}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Condiciones especiales */}
        {mascota.condiciones_especiales && (
          <div className="cuidado-card especiales-card">
            <div className="cuidado-header">
              <i className="fas fa-exclamation-triangle"></i>
              <div>
                <small>{t('condiciones_especiales') || 'Condiciones especiales'}</small>
                <strong>{mascota.condiciones_especiales}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Apto con niños y otros animales */}
        <div className="apto-badges">
          {mascota.apto_con_ninos && (
            <span className="apto-badge ninos">
              <i className="fas fa-child"></i> {t('apto_con_ninos') || 'Apto con niños'}
            </span>
          )}
          {mascota.apto_con_otros_animales && (
            <span className="apto-badge otros">
              <i className="fas fa-dog"></i> {t('apto_con_otros') || 'Apto con otros animales'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SaludCuidados;